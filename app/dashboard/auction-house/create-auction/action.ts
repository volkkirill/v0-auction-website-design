"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAuctionAndLots(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const auctionHouseId = formData.get("auctionHouseId") as string

  // Verify user is authorized to create an auction for this auction house
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, auction_house_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "auction_house" || profile.auction_house_id !== auctionHouseId) {
    return { error: "У вас нет прав для создания аукциона для этого аукционного дома.", success: false }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const start_time = formData.get("start_time") as string
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const lotsDataString = formData.get("lotsData") as string

  let lotsData: any[] = []
  try {
    lotsData = JSON.parse(lotsDataString)
  } catch (e) {
    return { error: "Неверный формат данных лотов.", success: false }
  }

  if (lotsData.length === 0) {
    return { error: "Аукцион должен содержать хотя бы один лот.", success: false }
  }

  // 1. Create the Auction
  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .insert({
      title,
      description,
      start_time,
      category,
      image_url,
      auction_house_id: auctionHouseId,
      status: "upcoming", // Default status
    })
    .select()
    .single()

  if (auctionError) {
    return { error: auctionError.message, success: false }
  }

  // 2. Create the Lots associated with the new Auction
  const lotsToInsert = lotsData.map((lot) => ({
    name: lot.name,
    description: lot.description,
    initial_price: lot.initial_price,
    current_bid: lot.initial_price, // Initial current bid is the initial price
    image_urls: lot.image_urls,
    auction_id: auction.id,
    bid_count: 0,
    commission_rate: 0.05, // Default commission rate
    is_featured: false, // Default to not featured
  }))

  const { error: lotsError } = await supabase.from("lots").insert(lotsToInsert)

  if (lotsError) {
    // If lots creation fails, consider deleting the created auction to prevent orphaned auctions
    await supabase.from("auctions").delete().eq("id", auction.id)
    return { error: lotsError.message, success: false }
  }

  revalidatePath("/dashboard/auction-house")
  revalidatePath("/auctions")
  revalidatePath("/")
  return { error: null, success: true }
}
