"use server"

import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", success: false }
  }

  const email = formData.get("email") as string
  const phone = formData.get("phone") as string

  // Update email in auth.users (Supabase handles re-confirmation if email changes)
  if (email !== user.email) {
    const { error: emailUpdateError } = await supabase.auth.updateUser({ email })
    if (emailUpdateError) {
      return { error: emailUpdateError.message, success: false }
    }
  }

  // Update phone in profiles table
  const { error: profileUpdateError } = await supabase.from("profiles").update({ email, phone }).eq("id", user.id)

  if (profileUpdateError) {
    return { error: profileUpdateError.message, success: false }
  }

  revalidatePath("/dashboard/buyer")
  return { error: null, success: true }
}
