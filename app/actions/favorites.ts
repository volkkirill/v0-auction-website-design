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
    return { error: "Пользователь не авторизован", success: false }
  }

  const lotId = formData.get("lotId") as string

  if (!lotId) {
    return { error: "ID лота не указан", success: false }
  }

  // Check if lot is already in favorites
  const { data: existingFavorite, error: checkError } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("lot_id", lotId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking favorite:", checkError)
    return { error: "Ошибка проверки избранного", success: false }
  }

  if (existingFavorite) {
    // Remove from favorites
    const { error: deleteError } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("lot_id", lotId)

    if (deleteError) {
      console.error("Error removing favorite:", deleteError)
      return { error: "Ошибка удаления из избранного", success: false }
    }
  } else {
    // Add to favorites
    const { error: insertError } = await supabase.from("user_favorites").insert({
      user_id: user.id,
      lot_id: lotId,
    })

    if (insertError) {
      console.error("Error adding favorite:", insertError)
      return { error: "Ошибка добавления в избранное", success: false }
    }
  }

  // Revalidate relevant paths
  revalidatePath("/dashboard/buyer")
  revalidatePath(`/lots/${lotId}`)
  revalidatePath("/auctions")

  return { error: null, success: true }
}

export async function fetchUserFavoriteLotIds(): Promise<string[]> {
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

  return data.map((favorite) => favorite.lot_id)
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
    .select(`
      lot_id,
      lots (
        id,
        name,
        description,
        initial_price,
        current_bid,
        image_urls,
        auction_id,
        auctions (
          id,
          title,
          start_time
        )
      )
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching user favorite lots:", error)
    return []
  }

  return data.map((favorite) => favorite.lots).filter(Boolean)
}
