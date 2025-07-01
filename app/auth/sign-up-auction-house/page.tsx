"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpAuctionHouse } from "./action" // New action for auction house sign up

export default function SignUpAuctionHousePage() {
  const [state, action, isPending] = useActionState(signUpAuctionHouse, { error: null, success: false })

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Регистрация Аукционного Дома</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={action}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название Аукционного Дома</Label>
                <Input id="name" name="name" type="text" placeholder="Название вашей галереи" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL Логотипа (необязательно)</Label>
                <Input id="logo_url" name="logo_url" type="url" placeholder="https://example.com/logo.png" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Контактный Email</Label>
                <Input id="contact_email" name="contact_email" type="email" placeholder="info@yourhouse.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" type="text" placeholder="+7 (XXX) XXX-XX-XX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input id="address" name="address" type="text" placeholder="Город, Улица, Дом" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт (необязательно)</Label>
                <Input id="website" name="website" type="url" placeholder="https://www.yourhouse.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email для входа</Label>
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
              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
              {state?.success && (
                <p className="text-green-500 text-sm">Регистрация успешна! Проверьте почту для подтверждения.</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? "Регистрация..." : "Зарегистрировать Аукционный Дом"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
