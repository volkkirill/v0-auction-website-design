"use client"

import { useActionState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUp } from "@/app/auth/sign-up/action"

export function RegistrationDialogContent() {
  const [registrationState, registrationAction, isRegistrationPending] = useActionState(signUp, { error: null })

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Регистрация</DialogTitle>
        <DialogDescription className="text-muted-foreground">Создайте новый аккаунт.</DialogDescription>
      </DialogHeader>
      <form action={registrationAction}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="ваша@почта.ru" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Повторите пароль</Label>
            <Input id="confirm-password" name="confirm-password" type="password" required />
          </div>
          {registrationState?.error && <p className="text-red-500 text-sm">{registrationState.error}</p>}
        </div>
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isRegistrationPending}
        >
          {isRegistrationPending ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </>
  )
}
