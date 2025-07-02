import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientRootLayout } from "./ClientRootLayout"
import { createClient } from "@/supabase/server" // Import server Supabase client

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Молоток.Ру - Онлайн Аукционы",
  description: "Ваш мир онлайн-аукционов и торгов. Найдите уникальные лоты и участвуйте в захватывающих торгах.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser() // Fetch user on server

  let userRole: string | null = null
  if (user) {
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile && !error) {
      userRole = profile.role
    } else {
      userRole = "buyer" // Default role if profile not found
    }
  }

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ClientRootLayout initialUser={user} initialUserRole={userRole}>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  )
}
