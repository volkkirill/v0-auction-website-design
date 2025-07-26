"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function joinAuction(auctionId: string) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован", success: false }
  }

  // Insert or update participant record
  const { error } = await supabase.from("auction_participants").upsert(
    {
      auction_id: auctionId,
      user_id: user.id,
      last_seen: new Date().toISOString(),
    },
    {
      onConflict: "auction_id,user_id",
    },
  )

  if (error) {
    console.error("Error joining auction:", error)
    return { error: "Не удалось присоединиться к аукциону", success: false }
  }

  return { error: null, success: true }
}

export async function updateParticipantActivity(auctionId: string) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return

  await supabase
    .from("auction_participants")
    .update({ last_seen: new Date().toISOString() })
    .eq("auction_id", auctionId)
    .eq("user_id", user.id)
}

export async function getActiveParticipantsCount(auctionId: string) {
  const supabase = createClient()

  // Consider participants active if they were seen in the last 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from("auction_participants")
    .select("*", { count: "exact", head: true })
    .eq("auction_id", auctionId)
    .gte("last_seen", twoMinutesAgo)

  if (error) {
    console.error("Error getting participants count:", error)
    return 0
  }

  return count || 0
}

export async function startNextLot(auctionId: string) {
  const supabase = createClient()

  // Get current auction
  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .select("*, current_lot_id, lot_duration_minutes")
    .eq("id", auctionId)
    .single()

  if (auctionError || !auction) {
    return { error: "Аукцион не найден", success: false }
  }

  // Get all lots for this auction ordered by lot_order
  const { data: lots, error: lotsError } = await supabase
    .from("lots")
    .select("*")
    .eq("auction_id", auctionId)
    .eq("status", "active")
    .order("lot_order", { ascending: true })

  if (lotsError || !lots || lots.length === 0) {
    return { error: "Нет доступных лотов", success: false }
  }

  // Find current lot index
  let currentLotIndex = -1
  if (auction.current_lot_id) {
    currentLotIndex = lots.findIndex((lot) => lot.id === auction.current_lot_id)
  }

  // Get next lot
  const nextLotIndex = currentLotIndex + 1
  if (nextLotIndex >= lots.length) {
    // No more lots, end auction
    const { error: endError } = await supabase
      .from("auctions")
      .update({
        current_lot_id: null,
        is_live: false,
      })
      .eq("id", auctionId)

    if (endError) {
      return { error: "Ошибка завершения аукциона", success: false }
    }

    revalidatePath(`/live-auction/${auctionId}`)
    return { error: null, success: true, auctionEnded: true }
  }

  const nextLot = lots[nextLotIndex]
  const now = new Date()
  const endTime = new Date(now.getTime() + (auction.lot_duration_minutes || 5) * 60 * 1000)

  // Update lot timing
  const { error: lotUpdateError } = await supabase
    .from("lots")
    .update({
      lot_start_time: now.toISOString(),
      lot_end_time: endTime.toISOString(),
    })
    .eq("id", nextLot.id)

  if (lotUpdateError) {
    return { error: "Ошибка обновления лота", success: false }
  }

  // Update auction current lot
  const { error: auctionUpdateError } = await supabase
    .from("auctions")
    .update({ current_lot_id: nextLot.id })
    .eq("id", auctionId)

  if (auctionUpdateError) {
    return { error: "Ошибка обновления аукциона", success: false }
  }

  revalidatePath(`/live-auction/${auctionId}`)
  return { error: null, success: true, auctionEnded: false }
}

export async function placeLiveBid(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован", success: false }
  }

  // Check user role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "buyer") {
    return { error: "Только покупатели могут делать ставки", success: false }
  }

  const lotId = formData.get("lotId") as string
  const bidAmount = Number.parseFloat(formData.get("bidAmount") as string)

  if (isNaN(bidAmount) || bidAmount <= 0) {
    return { error: "Введите корректную сумму ставки", success: false }
  }

  // Get lot details and check if it's currently active
  const { data: lot, error: lotError } = await supabase
    .from("lots")
    .select("*, auctions!inner(current_lot_id, is_live)")
    .eq("id", lotId)
    .single()

  if (lotError || !lot) {
    return { error: "Лот не найден", success: false }
  }

  // Check if this lot is currently active in live auction
  if (!lot.auctions.is_live || lot.auctions.current_lot_id !== lotId) {
    return { error: "Этот лот сейчас не активен для торгов", success: false }
  }

  // Check if lot time hasn't expired
  if (lot.lot_end_time && new Date() > new Date(lot.lot_end_time)) {
    return { error: "Время торгов по этому лоту истекло", success: false }
  }

  // Validate bid amount
  if (bidAmount <= lot.current_bid) {
    return { error: `Ставка должна быть выше текущей (${lot.current_bid.toLocaleString("ru-RU")} ₽)`, success: false }
  }

  // Calculate minimum increment
  const getBidIncrement = (currentPrice: number): number => {
    if (currentPrice < 100000) return 1000
    if (currentPrice < 500000) return 5000
    if (currentPrice < 1000000) return 10000
    return 50000
  }

  const minIncrement = getBidIncrement(lot.current_bid)
  if (bidAmount < lot.current_bid + minIncrement) {
    return { error: `Минимальный шаг ставки: ${minIncrement.toLocaleString("ru-RU")} ₽`, success: false }
  }

  // Update lot
  const { error: updateLotError } = await supabase
    .from("lots")
    .update({
      current_bid: bidAmount,
      bid_count: lot.bid_count + 1,
    })
    .eq("id", lotId)

  if (updateLotError) {
    return { error: "Ошибка обновления лота", success: false }
  }

  // Insert bid
  const { error: insertBidError } = await supabase.from("bids").insert({
    lot_id: lotId,
    user_id: user.id,
    amount: bidAmount,
  })

  if (insertBidError) {
    console.error("Failed to insert bid:", insertBidError)
    return { error: "Ошибка записи ставки", success: false }
  }

  revalidatePath(`/live-auction/${lot.auction_id}`)
  return { error: null, success: true }
}
