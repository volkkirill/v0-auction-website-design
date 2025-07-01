"use client"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/supabase/client"
import { updateProfile } from "./action" // New action for profile update

export default function BuyerDashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeBids, setActiveBids] = useState<any[]>([])
  const [wonAuctions, setWonAuctions] = useState<any[]>([])
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, { error: null, success: false })

  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile && !profileError) {
          setUserProfile(profile)
        } else {
          console.error("Error fetching profile:", profileError)
        }

        // Dummy data for active bids, won auctions, transactions (replace with real data later)
        setActiveBids([
          {
            id: "1",
            lotName: "Винтажные часы Rolex",
            currentBid: 1500000, // Numeric value for rubles
            yourBid: 1510000, // Numeric value for rubles
            status: "Вы лидируете",
            startTime: "2025-07-15T10:00:00Z", // Changed to startTime
            image:
              "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            id: "2",
            lotName: "Картина 'Летний пейзаж'",
            currentBid: 320000, // Numeric value for rubles
            yourBid: 310000, // Numeric value for rubles
            status: "Ваша ставка перебита",
            startTime: "2025-07-18T14:30:00Z", // Changed to startTime
            image:
              "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
        ])
        setWonAuctions([
          {
            id: "3",
            lotName: "Редкая книга XVIII века",
            finalBid: 50000, // Numeric value for rubles
            auctionDate: "2025-06-20",
            image:
              "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            id: "4",
            lotName: "Серебряный сервиз",
            finalBid: 85000, // Numeric value for rubles
            auctionDate: "2025-05-10",
            image:
              "https://images.unsplash.com/photo-1582139329536-e7261d679248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
        ])
        setTransactionHistory([
          { id: "t1", type: "Пополнение", amount: 50000, date: "2025-07-01" }, // Numeric value for rubles
          { id: "t2", type: "Ставка (Лот #1)", amount: -1510000, date: "2025-07-14" }, // Numeric value for rubles
          { id: "t3", type: "Выигрыш (Лот #3)", amount: -50000, date: "2025-06-20" }, // Numeric value for rubles
        ])
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
            <form action={profileAction}>
              <div className="space-y-2 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={userProfile.email} required />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" type="text" defaultValue={userProfile.phone || ""} />
              </div>
              {profileState?.error && <p className="text-red-500 text-sm">{profileState.error}</p>}
              {profileState?.success && <p className="text-green-500 text-sm">Профиль успешно обновлен!</p>}
              <Button
                type="submit"
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isProfilePending}
              >
                {isProfilePending ? "Обновление..." : "Обновить профиль"}
              </Button>
            </form>
            <p>
              Баланс:{" "}
              <span className="font-semibold text-primary">{userProfile.balance?.toLocaleString("ru-RU") || 0} ₽</span>
            </p>
            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Пополнить баланс
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{userProfile.bidCount || 0}</p>
              <p className="text-muted-foreground">Сделано ставок</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{userProfile.wonAuctions || 0}</p>
              <p className="text-muted-foreground">Выиграно аукционов</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {((userProfile.wonAuctions / userProfile.bidCount) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-muted-foreground">Процент выигрышей</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active-bids" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active-bids">Активные ставки</TabsTrigger>
          <TabsTrigger value="won-auctions">Выигранные аукционы</TabsTrigger>
          <TabsTrigger value="transactions">История транзакций</TabsTrigger>
        </TabsList>
        <TabsContent value="active-bids">
          <Card>
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
        </TabsContent>
        <TabsContent value="won-auctions">
          <Card>
            <CardHeader>
              <CardTitle>Выигранные аукционы</CardTitle>
            </CardHeader>
            <CardContent>
              {wonAuctions.length > 0 ? (
                <div className="space-y-4">
                  {wonAuctions.map((auction) => (
                    <div key={auction.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <Image
                        src={auction.image || "/placeholder.svg"}
                        alt={auction.lotName}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{auction.lotName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Финальная ставка: {auction.finalBid.toLocaleString("ru-RU")} ₽
                        </p>
                        <p className="text-sm text-muted-foreground">Дата аукциона: {auction.auctionDate}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/lots/${auction.id}`}>Просмотреть лот</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Вы пока не выиграли ни одного аукциона.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionHistory.length > 0 ? (
                <div className="space-y-4">
                  {transactionHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <h3 className="font-semibold">{transaction.type}</h3>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                      <p className={`font-semibold ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                        {transaction.amount.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">История транзакций пуста.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
