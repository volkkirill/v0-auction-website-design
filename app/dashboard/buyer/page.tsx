"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/supabase/client"
import { fetchUserActiveBids } from "@/app/actions/data-fetching" // Import new action for bids

export default function BuyerDashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeBids, setActiveBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        // Fetch profile (only email and phone, no balance/stats)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, phone") // Select only necessary fields
          .eq("id", user.id)
          .single()

        if (profile && !profileError) {
          setUserProfile(profile)
        } else {
          console.error("Error fetching profile:", profileError)
        }

        // Fetch active bids using the new Server Action
        const fetchedActiveBids = await fetchUserActiveBids()
        setActiveBids(fetchedActiveBids)
      } else {
        console.error("Error fetching user:", userError)
      }
      setLoading(false)
    }
    fetchUserData()
  }, [supabase])

  if (loading) {
    return <div className="container py-8 text-center">Загрузка данных пользователя...</div>
  }

  if (!userProfile) {
    return <div className="container py-8 text-center">Пожалуйста, войдите, чтобы просмотреть свой личный кабинет.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Личный кабинет покупателя</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Removed profile update form as per request to simplify, keeping only display */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={userProfile.email} disabled />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" type="text" value={userProfile.phone || "Не указан"} disabled />
            </div>
            {/* Removed balance, top-up button, statistics, and transaction history */}
          </CardContent>
        </Card>

        {/* Removed statistics card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ваши активные ставки</CardTitle>
          </CardHeader>
          <CardContent>
            {activeBids.length > 0 ? (
              <div className="space-y-4">
                {activeBids.map((bid) => (
                  <div key={bid.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <Image
                      src={bid.image || "/placeholder.svg"}
                      alt={bid.lotName}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{bid.lotName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Текущая ставка: {bid.currentBid.toLocaleString("ru-RU")} ₽
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ваша ставка: {bid.yourBid.toLocaleString("ru-RU")} ₽
                      </p>
                      <p
                        className={`text-sm font-medium ${bid.status === "Вы лидируете" ? "text-green-500" : "text-red-500"}`}
                      >
                        Статус: {bid.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Начало: {new Date(bid.startTime).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lots/${bid.id}`}>Подробнее</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">У вас нет активных ставок.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Removed Tabs for Won Auctions and Transactions */}
    </div>
  )
}
