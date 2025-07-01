"use server"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"
import { uploadImage } from "@/app/actions/image-upload" // Import uploadImage action

export async function signUpAuctionHouse(prevState: { error: string | null; success: boolean }, formData: FormData) {
  const supabase = createClient()

  // Step 1 data
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm-password") as string

  // Step 2 data
  const name = formData.get("name") as string
  const logo_file = formData.get("logo_file") as File | null // This is the File object
  const contact_email = formData.get("contact_email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const website = formData.get("website") as string

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

  let logo_url: string | null = null
  if (logo_file && logo_file.size > 0) {
    const uploadFormData = new FormData()
    uploadFormData.append("file", logo_file)
    uploadFormData.append("folder", "auction_house_logos")
    const uploadResult = await uploadImage({}, uploadFormData) // Pass empty prevState
    if (uploadResult.success && uploadResult.url) {
      logo_url = uploadResult.url
    } else {
      // If logo upload fails, still proceed with registration but log error
      console.error("Failed to upload logo:", uploadResult.error)
      // Optionally, delete user if logo is critical
    }
  }

  // 2. Create the Auction House entry with 'pending' status
  const { data: auctionHouse, error: ahError } = await supabase
    .from("auction_houses")
    .insert({ name, logo_url, contact_email, phone, address, website, status: "pending" }) // Set status to pending
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

  // Redirect to a pending approval page instead of confirm-email
  redirect("/auth/auction-house-pending-approval")
}
