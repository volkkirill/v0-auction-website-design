"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleLotFeaturedStatus(
  prevState: { error: string | null; success: boolean },
  { lotId, isFeatured }: { lotId: string; isFeatured: boolean },
) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  // Check if the user is an admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    return { error: "У вас нет прав администратора для выполнения этого действия.", success: false }
  }

  const { error } = await supabase.from("lots").update({ is_featured: isFeatured }).eq("id", lotId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath("/admin")
  revalidatePath("/") // Revalidate homepage to update featured lots
  return { error: null, success: true }
}
