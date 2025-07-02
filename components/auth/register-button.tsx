"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { RegistrationDialogContent } from "@/components/auth/registration-dialog-content"
import type { User as SupabaseUser } from "@supabase/supabase-js" // Import SupabaseUser type

interface RegisterButtonProps {
  initialUser: SupabaseUser | null
}

export function RegisterButton({ initialUser }: RegisterButtonProps) {
  const [user, setUser] = useState<SupabaseUser | null>(initialUser) // Initialize with prop
  const supabase = createClient()

  useEffect(() => {
    // Only listen for auth state changes, initial state is from SSR
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (user) {
    return null // If user is logged in, hide the button
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
          Зарегистрироваться
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border p-6 shadow-lg rounded-lg">
        <RegistrationDialogContent />
      </DialogContent>
    </Dialog>
  )
}
