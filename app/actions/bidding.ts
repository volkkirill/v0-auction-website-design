"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function placeBid(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован. Пожалуйста, войдите, чтобы сделать ставку.", success: false }
  }

  const lotId = formData.get("lotId") as string
  const bidAmount = Number.parseFloat(formData.get("bidAmount") as string)

  if (isNaN(bidAmount) || bidAmount <= 0) {
    return { error: "Пожалуйста, введите действительную сумму ставки.", success: false }
  }

  // Fetch current lot details to validate bid
  const { data: lot, error: lotError } = await supabase.from("lots").select("*").eq("id", lotId).single()

  if (lotError || !lot) {
    return { error: "Лот не найден или произошла ошибка при его получении.", success: false }
  }

  if (bidAmount <= lot.current_bid) {
    return {
      error: `Ваша ставка должна быть выше текущей ставки (${lot.current_bid.toLocaleString("ru-RU")} ₽).`,
      success: false,
    }
  }

  // Determine minimum bid increment
  const getBidIncrement = (currentPrice: number): number => {
    if (currentPrice < 100000) return 1000
    if (currentPrice < 500000) return 5000
    if (currentPrice < 1000000) return 10000
    return 50000
  }
  const minIncrement = getBidIncrement(lot.current_bid)

  if (bidAmount < lot.current_bid + minIncrement) {
    return {
      error: `Ваша ставка должна быть не менее ${minIncrement.toLocaleString("ru-RU")} ₽ выше текущей ставки.`,
      success: false,
    }
  }

  // Update lot's current bid and bid count
  const { error: updateLotError } = await supabase
    .from("lots")
    .update({
      current_bid: bidAmount,
      bid_count: lot.bid_count + 1,
    })
    .eq("id", lotId)

  if (updateLotError) {
    return { error: `Ошибка при обновлении лота: ${updateLotError.message}`, success: false }
  }

  // Insert new bid into bids table
  const { error: insertBidError } = await supabase.from("bids").insert({
    lot_id: lotId,
    user_id: user.id,
    amount: bidAmount,
  })

  if (insertBidError) {
    // If bid insertion fails, consider rolling back lot update (more complex, but ideal)
    console.error("Failed to insert bid, consider rolling back lot update:", insertBidError)
    return { error: `Ошибка при записи вашей ставки: ${insertBidError.message}`, success: false }
  }

  revalidatePath(`/lots/${lotId}`)
  revalidatePath("/dashboard/buyer")
  revalidatePath("/") // Revalidate homepage for featured lots if applicable
  return { error: null, success: true }
}
