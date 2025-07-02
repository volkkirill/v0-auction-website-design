"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { RegistrationDialogContent } from "@/components/auth/registration-dialog-content"

export function RegisterButton() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

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
