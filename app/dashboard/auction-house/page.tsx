"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { fetchAuctionsByAuctionHouseIdForClient, fetchAuctionHouseByIdForClient } from "@/app/actions/data-fetching"

export default function AuctionHouseDashboardPage() {
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [auctionHouseStatus, setAuctionHouseStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([])
  const [draftAuctions, setDraftAuctions] = useState<any[]>([])
  const [completedAuctions, setCompletedAuctions] = useState<any[]>([])

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("auction_house_id, role")
          .eq("id", user.id)
          .single()

        if (profile && profile.role === "auction_house" && profile.auction_house_id && !profileError) {
          setAuctionHouseId(profile.auction_house_id)

          const ah = await fetchAuctionHouseByIdForClient(profile.auction_house_id)
          if (ah) {
            setAuctionHouseStatus(ah.status)
          }

          if (ah?.status === "approved") {
            const allAuctions = await fetchAuctionsByAuctionHouseIdForClient(profile.auction_house_id)
            const now = new Date()

            setUpcomingAuctions(
              allAuctions.filter((auction: any) => new Date(auction.start_time) > now && auction.status !== "draft"),
            )
            setDraftAuctions(allAuctions.filter((auction: any) => auction.status === "draft"))
            setCompletedAuctions(
              allAuctions.filter((auction: any) => new Date(auction.start_time) <= now && auction.status !== "draft"),
            )
          }
        } else {
          console.error("User is not an auction house or profile not found.")
          router.push("/auth/sign-in")
        }
      } else {
        console.error("Error fetching user:", userError)
        router.push("/auth/sign-in")
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [supabase, router])

  if (loading) {
    return <div className="container py-8 text-center">Загрузка панели управления...</div>
  }

  if (auctionHouseStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Аккаунт на проверке</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ваш аккаунт аукционного дома ожидает одобрения администратором.
        </p>
        <p className="text-sm text-muted-foreground">
          Вы получите уведомление по электронной почте, как только ваш аккаунт будет одобрен.
        </p>
        <Link href="/" passHref>
          <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">Вернуться на главную</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Панель управления Аукционного Дома</h1>
          <Link href="/dashboard/auction-house/create-auction" passHref>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Создать новый аукцион</Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Предстоящие/Активные ({upcomingAuctions.length})</TabsTrigger>
            <TabsTrigger value="drafts">Черновики ({draftAuctions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Предстоящие и активные аукционы</CardTitle>
                <CardDescription>Список ваших аукционов, которые еще не завершились.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAuctions.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingAuctions.map((auction) => (
                      <Card key={auction.id} className="flex flex-col">
                        <Image
                          src={auction.image_url || "/placeholder.svg"}
                          alt={auction.title}
                          width={400}
                          height={225}
                          className="rounded-t-lg object-cover w-full h-48"
                        />
                        <CardContent className="p-4 flex-grow">
                          <h3 className="text-lg font-semibold">{auction.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{auction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Начало: {format(new Date(auction.start_time), "dd MMMM yyyy, HH:mm", { locale: ru })}
                          </p>
                          <p className="text-sm text-muted-foreground">Комиссия: {auction.commission_percentage}%</p>
                        </CardContent>
                        <div className="p-4 border-t">
                          <Link href={`/dashboard/auction-house/edit-auction/${auction.id}`} passHref>
                            <Button variant="outline" className="w-full bg-transparent">
                              Редактировать
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">У вас пока нет предстоящих или активных аукционов.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <CardTitle>Черновики аукционов</CardTitle>
                <CardDescription>Аукционы, которые вы сохранили как черновики.</CardDescription>
              </CardHeader>
              <CardContent>
                {draftAuctions.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {draftAuctions.map((auction) => (
                      <Card key={auction.id} className="flex flex-col">
                        <Image
                          src={auction.image_url || "/placeholder.svg"}
                          alt={auction.title}
                          width={400}
                          height={225}
                          className="rounded-t-lg object-cover w-full h-48"
                        />
                        <CardContent className="p-4 flex-grow">
                          <h3 className="text-lg font-semibold">{auction.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{auction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Начало: {format(new Date(auction.start_time), "dd MMMM yyyy, HH:mm", { locale: ru })}
                          </p>
                          <p className="text-sm text-muted-foreground">Комиссия: {auction.commission_percentage}%</p>
                        </CardContent>
                        <div className="p-4 border-t">
                          <Link href={`/dashboard/auction-house/edit-auction/${auction.id}`} passHref>
                            <Button variant="outline" className="w-full bg-transparent">
                              Редактировать
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">У вас пока нет черновиков аукционов.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Завершенные аукционы</CardTitle>
              <CardDescription>Список ваших аукционов, которые уже завершились.</CardDescription>
            </CardHeader>
            <CardContent>
              {completedAuctions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedAuctions.map((auction) => (
                    <Card key={auction.id} className="flex flex-col opacity-70">
                      <Image
                        src={auction.image_url || "/placeholder.svg"}
                        alt={auction.title}
                        width={400}
                        height={225}
                        className="rounded-t-lg object-cover w-full h-48"
                      />
                      <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{auction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Завершено: {format(new Date(auction.start_time), "dd MMMM yyyy, HH:mm", { locale: ru })}
                        </p>
                        <p className="text-sm text-muted-foreground">Комиссия: {auction.commission_percentage}%</p>
                      </CardContent>
                      <div className="p-4 border-t">
                        <Link href={`/auctions/${auction.id}`} passHref>
                          <Button variant="outline" className="w-full bg-transparent" disabled>
                            Посмотреть результаты
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">У вас пока нет завершенных аукционов.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
