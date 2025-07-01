import { createClient } from "@/supabase/server"

export async function getAuctionHouses(includePending = false) {
  const supabase = createClient()
  let query = supabase.from("auction_houses").select("*")

  if (!includePending) {
    query = query.eq("status", "approved") // Only fetch approved auction houses by default
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching auction houses:", error)
    return []
  }
  return data
}

export async function getAuctionHouseById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("auction_houses").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching auction house with ID ${id}:`, error)
    return null
  }
  return data
}

export async function getAllAuctions() {
  const supabase = createClient()
  const { data, error } = await supabase.from("auctions").select("*").order("start_time", { ascending: true })
  if (error) {
    console.error("Error fetching all auctions:", error)
    return []
  }
  return data
}

export async function getAuctionById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("auctions").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching auction with ID ${id}:`, error)
    return null
  }
  return data
}

export async function getLotsByAuctionId(auctionId: string, includeRemoved = false) {
  const supabase = createClient()
  let query = supabase.from("lots").select("*").eq("auction_id", auctionId)

  if (!includeRemoved) {
    query = query.neq("status", "removed") // Filter out removed lots by default
  }

  const { data, error } = await query.order("created_at", { ascending: true })
  if (error) {
    console.error(`Error fetching lots for auction ID ${auctionId}:`, error)
    return []
  }
  return data
}

export async function getLotById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("lots").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching lot with ID ${id}:`, error)
    return null
  }
  return data
}

export async function getFeaturedLots() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("is_featured", true)
    .eq("status", "active")
    .limit(6) // Only active featured lots
  if (error) {
    console.error("Error fetching featured lots:", error)
    return []
  }
  return data
}

// Dummy images (can be replaced with actual image uploads later)
export const images = {
  heroBg:
    "https://images.unsplash.com/photo-1517430816045-df4b7de11679?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  artPainting:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rareCoin:
    "https://images.unsplash.com/photo-1621259181811-912222759797?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  vintageCar:
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  diamondJewelry:
    "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  antiqueBook:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  modernSculpture:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  luxuryWatch:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  fineWine:
    "https://images.unsplash.com/photo-1582139329536-e7261d6d9248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  stampCollection:
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  landscapePainting:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rareOldBook:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  silverTeaSet:
    "https://images.unsplash.com/photo-1582139329536-e7261d679248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  springArtAuction:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  modernPhotographyAuction:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  winterAntiquesAuction:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  autumnJewelryAuction:
    "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  bronzeStatuette:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  vinylRecords:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  mingVaseMain:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  harleyDavidsonMotorcycle:
    "https://images.unsplash.com/photo-1558981403-c5e311223378?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  patekPhilippePocket:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  audemarsPiguetModern:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
}
