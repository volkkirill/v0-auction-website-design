"use server"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: { error: string | null }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Fetch user profile to determine role
  const {
    data: { user },
    error: userFetchError,
  } = await supabase.auth.getUser()

  if (userFetchError || !user) {
    return { error: "Не удалось получить данные пользователя после входа." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    // If profile not found, create a default 'buyer' profile
    await supabase.from("profiles").insert({ id: user.id, email: user.email, role: "buyer" })
    redirect("/dashboard/buyer")
  }

  // Redirect based on role
  if (profile.role === "admin") {
    redirect("/admin")
  } else if (profile.role === "auction_house") {
    redirect("/dashboard/auction-house")
  } else {
    redirect("/dashboard/buyer") // Default for 'buyer' or other roles
  }
}
