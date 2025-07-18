"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavoriteLot(prevState: { error: string | null; success: boolean }, formData: FormData) {
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
    .select("role")
    .eq("id", user.id)
    .single()
  if (profileError || !profile || profile.role !== "buyer") {
    // Return early if not a buyer or error fetching profile
    return { error: "Только покупатели могут добавлять лоты в избранное.", success: false }
  }

  const lotId = formData.get("lotId") as string

  const { data: existingFavorite, error: fetchError } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("lot_id", lotId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking existing favorite:", fetchError)
    return { error: "Ошибка при проверке избранного.", success: false }
  }

  if (existingFavorite) {
    const { error: deleteError } = await supabase.from("user_favorites").delete().eq("id", existingFavorite.id)

    if (deleteError) {
      console.error("Error removing favorite:", deleteError)
      return { error: `Ошибка при удалении из избранного: ${deleteError.message}`, success: false }
    }
    // Revalidate paths for server components that display favorite status
    revalidatePath(`/lots/${lotId}`) // For individual lot page, if it's a server component
    revalidatePath(`/auctions/[id]`) // For auction detail page, if it lists lots with favorite status
    revalidatePath(`/dashboard/buyer`) // For buyer dashboard (even if client component, revalidate for consistency)
    return { error: null, success: true }
  } else {
    const { error: insertError } = await supabase.from("user_favorites").insert({ user_id: user.id, lot_id: lotId })

    if (insertError) {
      console.error("Error adding favorite:", insertError)
      return { error: `Ошибка при добавлении в избранное: ${insertError.message}`, success: false }
    }
    // Revalidate paths for server components that display favorite status
    revalidatePath(`/lots/${lotId}`)
    revalidatePath(`/auctions/[id]`)
    revalidatePath(`/dashboard/buyer`)
    return { error: null, success: true }
  }
}

export async function fetchUserFavoriteLotIds() {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase.from("user_favorites").select("lot_id").eq("user_id", user.id)

  if (error) {
    console.error("Error fetching user favorite lot IDs:", error)
    return []
  }
  return data.map((fav) => fav.lot_id)
}

export async function fetchUserFavoriteLots() {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .select(
      `
      lot_id,
      lots (
        id,
        name,
        description,
        image_urls,
        current_bid,
        auction_id,
        auctions (
          title,
          start_time
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user favorite lots:", error)
    return []
  }

  return data
    .map((fav) => ({
      id: fav.lots?.id,
      name: fav.lots?.name,
      description: fav.lots?.description,
      image: fav.lots?.image_urls?.[0],
      currentBid: fav.lots?.current_bid,
      auctionId: fav.lots?.auction_id, // Add auctionId for linking
      auctionTitle: fav.lots?.auctions?.title,
      auctionStartTime: fav.lots?.auctions?.start_time,
    }))
    .filter((lot) => lot.id !== null)
}
