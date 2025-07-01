"use server"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(prevState: { error: string | null }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm-password") as string

  if (password !== confirmPassword) {
    return { error: "Пароли не совпадают." }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to a confirmation page or login page
  redirect("/auth/confirm-email")
}
