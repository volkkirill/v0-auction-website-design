"use client" // layout.tsx needs to be a client component to use usePathname and useEffect

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation" // Import usePathname
import { useEffect } from "react" // Import useEffect

export function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname]) // Scroll to top on path change

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Header />
      <main>{children}</main>
      <Footer />
    </ThemeProvider>
  )
}
