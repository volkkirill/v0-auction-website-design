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

  redirect("/") // Redirect to home page or dashboard after successful login
}
