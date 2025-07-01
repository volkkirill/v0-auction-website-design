"use server"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export async function signUpAuctionHouse(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()

  const name = formData.get("name") as string
  const logo_url = formData.get("logo_url") as string
  const contact_email = formData.get("contact_email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const website = formData.get("website") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm-password") as string

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают.", success: false }
  }

  // 1. Create the Supabase Auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message, success: false }
  }

  if (!user) {
    return { error: "Не удалось создать пользователя.", success: false }
  }

  // 2. Create the Auction House entry
  const { data: auctionHouse, error: ahError } = await supabase
    .from("auction_houses")
    .insert({ name, logo_url, contact_email, phone, address, website })
    .select()
    .single()

  if (ahError) {
    // If auction house creation fails, delete the auth user to prevent orphaned accounts
    await supabase.auth.admin.deleteUser(user.id)
    return { error: ahError.message, success: false }
  }

  // 3. Create the user profile and link it to the auction house
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    role: "auction_house",
    auction_house_id: auctionHouse.id,
    phone: phone, // Use phone from AH registration for profile
  })

  if (profileError) {
    // If profile creation fails, delete the auth user and auction house
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from("auction_houses").delete().eq("id", auctionHouse.id)
    return { error: profileError.message, success: false }
  }

  redirect("/auth/confirm-email") // Redirect to email confirmation page
}
