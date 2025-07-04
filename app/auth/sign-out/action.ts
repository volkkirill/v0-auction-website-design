"use server"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/") // Redirect to home page after logout
}
