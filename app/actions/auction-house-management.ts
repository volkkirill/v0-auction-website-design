"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

// Helper to check if user is an auction house owner for a given AH ID
async function checkAuctionHouseOwner(userId: string, auctionHouseId: string) {
  const supabase = createClient()
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, auction_house_id")
    .eq("id", userId)
    .single()

  if (error || !profile || profile.role !== "auction_house" || profile.auction_house_id !== auctionHouseId) {
    return false
  }
  return true
}

// Action to update auction house profile
export async function updateAuctionHouseProfile(
  prevState: { error: string | null; success: boolean },
  formData: FormData,
) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("auction_house_id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "auction_house" || !profile.auction_house_id) {
    return { error: "У вас нет прав для редактирования профиля аукционного дома.", success: false }
  }

  const name = formData.get("name") as string
  const logo_url = formData.get("logo_url") as string
  const contact_email = formData.get("contact_email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const website = formData.get("website") as string

  const { error: updateError } = await supabase
    .from("auction_houses")
    .update({ name, logo_url, contact_email, phone, address, website })
    .eq("id", profile.auction_house_id)

  if (updateError) {
    return { error: updateError.message, success: false }
  }

  revalidatePath("/dashboard/auction-house")
  return { error: null, success: true }
}

// Action to create or update an auction
export async function upsertAuction(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const auctionHouseId = formData.get("auctionHouseId") as string
  const auctionId = formData.get("auctionId") as string | null // Will be null for new auctions

  if (!(await checkAuctionHouseOwner(user.id, auctionHouseId))) {
    return { error: "У вас нет прав для создания/редактирования аукциона для этого аукционного дома.", success: false }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const start_time = formData.get("start_time") as string
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string // This will be the public URL from storage
  const status = formData.get("status") as string // 'upcoming' or 'draft'

  const auctionData = {
    title,
    description,
    start_time,
    category,
    image_url,
    auction_house_id: auctionHouseId,
    status,
  }

  let error: any = null
  let auction: any = null

  if (auctionId) {
    // Update existing auction
    const { data, error: updateError } = await supabase
      .from("auctions")
      .update(auctionData)
      .eq("id", auctionId)
      .select()
      .single()
    auction = data
    error = updateError
  } else {
    // Create new auction
    const { data, error: insertError } = await supabase.from("auctions").insert(auctionData).select().single()
    auction = data
    error = insertError
  }

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath("/dashboard/auction-house")
  revalidatePath("/auctions")
  revalidatePath("/")
  return { error: null, success: true, auctionId: auction.id } // Return auctionId for lot creation
}

// Action to upsert (create or update) a lot
export async function upsertLot(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const lotId = formData.get("lotId") as string | null
  const auctionId = formData.get("auctionId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const initial_price = Number.parseFloat(formData.get("initial_price") as string)
  const image_urls_string = formData.get("image_urls") as string // This will be a JSON string of URLs

  console.log("upsertLot: Received image_urls_string:", image_urls_string) // LOGGING

  let image_urls: string[] = []
  try {
    image_urls = JSON.parse(image_urls_string)
    console.log("upsertLot: Parsed image_urls:", image_urls) // LOGGING
  } catch (e) {
    console.error("upsertLot: Failed to parse image_urls:", e) // LOGGING
    return { error: "Неверный формат URL изображений.", success: false }
  }

  // Verify user owns the auction house associated with this auction
  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .select("auction_house_id")
    .eq("id", auctionId)
    .single()

  if (auctionError || !auction) {
    return { error: "Аукцион не найден.", success: false }
  }

  if (!(await checkAuctionHouseOwner(user.id, auction.auction_house_id))) {
    return { error: "У вас нет прав для создания/редактирования лота для этого аукциона.", success: false }
  }

  const lotData = {
    name,
    description,
    initial_price,
    image_urls, // This is the parsed array
    auction_id: auctionId,
    commission_rate: 0.05, // Default
    is_featured: false, // Default
    status: "active", // Default status for new/updated lots
  }

  console.log("upsertLot: Data to be inserted/updated:", lotData) // LOGGING

  let error: any = null
  if (lotId) {
    // Update existing lot
    const { error: updateError } = await supabase.from("lots").update(lotData).eq("id", lotId)
    error = updateError
  } else {
    // Create new lot
    const { error: insertError } = await supabase.from("lots").insert({ ...lotData, current_bid: initial_price })
    error = insertError
  }

  if (error) {
    console.error("upsertLot: Supabase operation error:", error) // LOGGING
    return { error: error.message, success: false }
  }

  revalidatePath(`/auctions/${auctionId}`)
  revalidatePath("/dashboard/auction-house")
  revalidatePath("/")
  return { error: null, success: true }
}

// Action to update lot status (e.g., 'removed')
export async function updateLotStatus(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const lotId = formData.get("lotId") as string
  const newStatus = formData.get("status") as string

  // Verify user owns the auction house associated with this lot
  const { data: lot, error: lotFetchError } = await supabase
    .from("lots")
    .select("auction_id, auctions(auction_house_id)")
    .eq("id", lotId)
    .single()

  if (lotFetchError || !lot || !lot.auctions?.auction_house_id) {
    return { error: "Лот не найден или не удалось определить его аукционный дом.", success: false }
  }

  if (!(await checkAuctionHouseOwner(user.id, lot.auctions.auction_house_id))) {
    return { error: "У вас нет прав для изменения статуса этого лота.", success: false }
  }

  const { error } = await supabase.from("lots").update({ status: newStatus }).eq("id", lotId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath(`/lots/${lotId}`)
  revalidatePath("/dashboard/auction-house")
  revalidatePath("/")
  return { error: null, success: true }
}

// Action to delete a lot
export async function deleteLot(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const lotId = formData.get("lotId") as string

  // Verify user owns the auction house associated with this lot
  const { data: lot, error: lotFetchError } = await supabase
    .from("lots")
    .select("auction_id, auctions(auction_house_id)")
    .eq("id", lotId)
    .single()

  if (lotFetchError || !lot || !lot.auctions?.auction_house_id) {
    return { error: "Лот не найден или не удалось определить его аукционный дом.", success: false }
  }

  if (!(await checkAuctionHouseOwner(user.id, lot.auctions.auction_house_id))) {
    return { error: "У вас нет прав для удаления этого лота.", success: false }
  }

  const { error } = await supabase.from("lots").delete().eq("id", lotId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath(`/auctions/${lot.auction_id}`)
  revalidatePath("/dashboard/auction-house")
  revalidatePath("/")
  return { error: null, success: true }
}
