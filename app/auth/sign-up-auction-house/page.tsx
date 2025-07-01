"use client"

import type React from "react"

import { useState, useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpAuctionHouse } from "./action"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function SignUpAuctionHousePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(new FormData())
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)

  const [state, action, isPending] = useActionState(signUpAuctionHouse, { error: null, success: false })

  const handleNextStep = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const currentFormData = new FormData(event.currentTarget)
    // Merge current step's data into the main formData state
    for (const [key, value] of currentFormData.entries()) {
      formData.set(key, value)
    }
    setStep(2)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove non-digits
    if (value.startsWith("7") && value.length > 1) {
      value = value.substring(1) // Remove leading 7 if present
    } else if (value.startsWith("8") && value.length > 1) {
      value = value.substring(1) // Remove leading 8 if present
    }

    let formattedValue = ""
    if (value.length > 0) {
      formattedValue = "+7 ("
      if (value.length > 0) formattedValue += value.substring(0, 3)
      if (value.length > 3) formattedValue += ") " + value.substring(3, 6)
      if (value.length > 6) formattedValue += "-" + value.substring(6, 8)
      if (value.length > 8) formattedValue += "-" + value.substring(8, 10)
    }
    e.target.value = formattedValue
    setFormData((prev) => {
      prev.set("phone", formattedValue)
      return prev
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoPreviewUrl(URL.createObjectURL(file))
      setFormData((prev) => {
        prev.set("logo_file", file) // Store the file object
        return prev
      })
    } else {
      setLogoPreviewUrl(null)
      setFormData((prev) => {
        prev.delete("logo_file")
        return prev
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // The formData state already contains data from both steps
    await action(formData)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Регистрация Аукционного Дома</CardTitle>
          <p className="text-sm text-muted-foreground">Шаг {step} из 2</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email администратора</Label>
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
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Далее
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название Аукционного Дома</Label>
                  <Input id="name" name="name" type="text" placeholder="Название вашей галереи" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_file">Логотип (необязательно)</Label>
                  <Input id="logo_file" name="logo_file" type="file" accept="image/*" onChange={handleLogoUpload} />
                  {logoPreviewUrl && (
                    <div className="mt-2 relative w-24 h-24">
                      <Image
                        src={logoPreviewUrl || "/placeholder.svg"}
                        alt="Logo Preview"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Контактный Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="info@yourhouse.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    onChange={handlePhoneChange}
                    maxLength={18} // +7 (XXX) XXX-XX-XX is 18 characters
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес (необязательно)</Label>
                  <Input id="address" name="address" type="text" placeholder="Город, Улица, Дом" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Веб-сайт (необязательно)</Label>
                  <Input id="website" name="website" type="url" placeholder="https://www.yourhouse.com" />
                </div>
                {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                {state?.success && (
                  <p className="text-green-500 text-sm">Заявка отправлена! Ожидайте одобрения администратором.</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Отправка заявки...
                  </>
                ) : (
                  "Отправить заявку"
                )}
              </Button>
            </form>
          )}

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
