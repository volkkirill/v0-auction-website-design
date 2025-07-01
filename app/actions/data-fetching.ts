"use server"

import {
  getAllAuctions,
  getAuctionHouses,
  getLotById,
  getAuctionById,
  getAuctionHouseById,
  getLotsByAuctionId,
} from "@/lib/auction-data"

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
export async function fetchLotsByAuctionIdForClient(auctionId: string) {
  return await getLotsByAuctionId(auctionId)
}
