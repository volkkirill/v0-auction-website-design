"use server"

import {
  getAllAuctions,
  getAuctionHouses,
  getLotById,
  getAuctionById,
  getAuctionHouseById,
  getLotsByAuctionId,
  getFeaturedLots,
  getAuctionsByAuctionHouseId, // Import the new function
} from "@/lib/auction-data"
import { createClient } from "@/supabase/server"

// Server Action to fetch all auctions for client components
export async function fetchAllAuctionsForClient() {
  return await getAllAuctions()
}

// Server Action to fetch auction houses for client components
export async function fetchAuctionHousesForClient() {
  return await getAuctionHouses()
}

// Server Action to fetch a single lot by ID for client components
export async function fetchLotByIdForClient(lotId: string) {
  return await getLotById(lotId)
}

// Server Action to fetch an auction by ID for client components
export async function fetchAuctionByIdForClient(auctionId: string) {
  return await getAuctionById(auctionId)
}

// Server Action to fetch an auction house by ID for client components
export async function fetchAuctionHouseByIdForClient(auctionHouseId: string) {
  return await getAuctionHouseById(auctionHouseId)
}

// Server Action to fetch lots by auction ID for client components
export async function fetchLotsByAuctionIdForClient(auctionId: string, includeRemoved = false) {
  return await getLotsByAuctionId(auctionId, includeRemoved)
}

// Server Action to fetch featured lots for client components
export async function fetchFeaturedLotsForClient() {
  return await getFeaturedLots()
}

// Server Action to fetch auctions by auction house ID for client components
export async function fetchAuctionsByAuctionHouseIdForClient(auctionHouseId: string) {
  return await getAuctionsByAuctionHouseId(auctionHouseId)
}

// Server Action to fetch user's active bids
export async function fetchUserActiveBids() {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data: bids, error: bidsError } = await supabase
    .from("bids")
    .select(
      `
      *,
      lots (
        id,
        name,
        image_urls,
        current_bid,
        auction_id,
        auctions (
          start_time
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) // Order by most recent bid

  if (bidsError) {
    console.error("Error fetching user bids:", bidsError)
    return []
  }

  // Process bids to determine status (simplified for now)
  const activeBids = bids.map((bid) => ({
    id: bid.lots?.id,
    lotName: bid.lots?.name,
    currentBid: bid.lots?.current_bid,
    yourBid: bid.amount,
    status: bid.amount === bid.lots?.current_bid ? "Вы лидируете" : "Ваша ставка перебита", // Simplified logic
    startTime: bid.lots?.auctions?.start_time,
    image: bid.lots?.image_urls?.[0],
  }))

  return activeBids
}
