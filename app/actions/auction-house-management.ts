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
export async function upsertAuction(
  prevState: { error: string | null; success: boolean; auctionId?: string },
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

  const auctionId = formData.get("auctionId") as string | null
  const auctionHouseId = formData.get("auctionHouseId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startTime = formData.get("start_time") as string
  const category = formData.get("category") as string
  const imageUrl = formData.get("image_url") as string
  const status = formData.get("status") as string
  const commissionPercentage = Number.parseFloat(formData.get("commission_percentage") as string)

  if (isNaN(commissionPercentage) || commissionPercentage < 0 || commissionPercentage > 100) {
    return { error: "Процент комиссии должен быть числом от 0 до 100.", success: false }
  }

  const auctionData = {
    auction_house_id: auctionHouseId,
    title,
    description,
    start_time: startTime,
    category,
    image_url: imageUrl,
    status,
    commission_percentage: commissionPercentage,
  }

  let error = null
  let auction = null

  if (auctionId) {
    // Update existing auction
    const { data, error: updateError } = await supabase
      .from("auctions")
      .update(auctionData)
      .eq("id", auctionId)
      .select()
      .single()
    error = updateError
    auction = data
  } else {
    // Insert new auction
    const { data, error: insertError } = await supabase.from("auctions").insert(auctionData).select().single()
    error = insertError
    auction = data
  }

  if (error) {
    console.error("Error upserting auction:", error)
    return { error: error.message, success: false }
  }

  revalidatePath("/dashboard/auction-house")
  revalidatePath("/auctions")
  revalidatePath("/")
  return { error: null, success: true, auctionId: auction?.id, auction }
}

// Action to upsert (create or update) a lot
export async function upsertLot(
  prevState: { error: string | null; success: boolean; lotIndex: number },
  formData: FormData,
) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false, lotIndex: prevState.lotIndex }
  }

  const lotId = formData.get("lotId") as string | null
  const auctionId = formData.get("auctionId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const initialPrice = Number.parseFloat(formData.get("initial_price") as string)
  const imageUrlsRaw = formData.get("image_urls") as string
  let imageUrls: string[] = []

  try {
    imageUrls = JSON.parse(imageUrlsRaw)
    if (!Array.isArray(imageUrls)) {
      throw new Error("image_urls is not an array")
    }
  } catch (e) {
    console.error("Failed to parse image_urls:", e)
    return { error: "Неверный формат URL изображений.", success: false, lotIndex: prevState.lotIndex }
  }

  if (isNaN(initialPrice) || initialPrice <= 0) {
    return { error: "Начальная цена должна быть положительным числом.", success: false, lotIndex: prevState.lotIndex }
  }

  const lotData = {
    auction_id: auctionId,
    name,
    description,
    initial_price: initialPrice,
    current_bid: initialPrice, // Set current bid to initial price on creation/update
    image_urls: imageUrls,
  }

  let error = null

  if (lotId && lotId !== "undefined") {
    // Update existing lot
    const { error: updateError } = await supabase.from("lots").update(lotData).eq("id", lotId)
    error = updateError
  } else {
    // Insert new lot
    const { error: insertError } = await supabase.from("lots").insert(lotData)
    error = insertError
  }

  if (error) {
    console.error("Error upserting lot:", error)
    return { error: error.message, success: false, lotIndex: prevState.lotIndex }
  }

  revalidatePath(`/auctions/${auctionId}`)
  revalidatePath("/dashboard/auction-house")
  return { error: null, success: true, lotIndex: prevState.lotIndex }
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
  const status = formData.get("status") as string

  const { error } = await supabase.from("lots").update({ status }).eq("id", lotId)

  if (error) {
    console.error("Error updating lot status:", error)
    return { error: error.message, success: false }
  }

  revalidatePath(`/lots/${lotId}`)
  revalidatePath("/dashboard/auction-house")
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

  const { error } = await supabase.from("lots").delete().eq("id", lotId)

  if (error) {
    console.error("Error deleting lot:", error)
    return { error: error.message, success: false }
  }

  revalidatePath("/dashboard/auction-house")
  return { error: null, success: true }
}
