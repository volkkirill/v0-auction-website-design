"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

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
