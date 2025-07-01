"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/supabase/client"
import { updateAuctionHouseProfile, updateLotStatus, deleteLot } from "@/app/actions/auction-house-management"
import { fetchAuctionHouseByIdForClient, fetchAllAuctionsForClient } from "@/app/actions/data-fetching"
import { Edit } from "lucide-react" // Import icons

export default function AuctionHouseDashboardPage() {
  const [auctionHouseProfile, setAuctionHouseProfile] = useState<any>(null)
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([])
  const [draftAuctions, setDraftAuctions] = useState<any[]>([]) // New state for draft auctions
  const [completedAuctions, setCompletedAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileState, profileAction, isProfilePending] = useActionState(updateAuctionHouseProfile, {
    error: null,
    success: false,
  })
  const [lotStatusState, lotStatusAction, isLotStatusPending] = useActionState(updateLotStatus, {
    error: null,
    success: false,
  })
  const [deleteLotState, deleteLotAction, isDeleteLotPending] = useActionState(deleteLot, {
    error: null,
    success: false,
  })

  const supabase = createClient()

  const fetchData = async () => {
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
        const fetchedAuctionHouse = await fetchAuctionHouseByIdForClient(profile.auction_house_id)
        setAuctionHouseProfile(fetchedAuctionHouse)

        if (fetchedAuctionHouse) {
          const allAuctions = await fetchAllAuctionsForClient()
          const ahAuctions = allAuctions.filter((a) => a.auction_house_id === fetchedAuctionHouse.id)

          setUpcomingAuctions(ahAuctions.filter((a) => a.status === "upcoming" || a.status === "active"))
          setDraftAuctions(ahAuctions.filter((a) => a.status === "draft")) // Filter draft auctions
          setCompletedAuctions(ahAuctions.filter((a) => a.status === "closed"))
        }
      } else {
        console.error("User is not an auction house or profile not found:", profileError)
      }
    } else {
      console.error("Error fetching user:", userError)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  // Re-fetch data on successful lot status update or deletion
  useEffect(() => {
    if (lotStatusState.success || deleteLotState.success) {
      fetchData()
    }
  }, [lotStatusState.success, deleteLotState.success])

  const handleUpdateLotStatus = async (lotId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "removed" : "active" // Toggle between active and removed
    const formData = new FormData()
    formData.append("lotId", lotId)
    formData.append("status", newStatus)
    await lotStatusAction(formData)
  }

  const handleDeleteLot = async (lotId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот лот? Это действие необратимо.")) {
      const formData = new FormData()
      formData.append("lotId", lotId)
      await deleteLotAction(formData)
    }
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка данных аукционного дома...</div>
  }

  if (!auctionHouseProfile) {
    return (
      <div className="container py-8 text-center">
        Пожалуйста, войдите как аукционный дом, чтобы просмотреть эту страницу.
      </div>
    )
  }

  // Check if the auction house is approved
  if (auctionHouseProfile.status === "pending") {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Ваша заявка на рассмотрении</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ваш аккаунт аукционного дома ожидает одобрения администратором. Как только он будет одобрен, вы получите
          полный доступ к панели управления.
        </p>
        <p className="text-sm text-muted-foreground">Обычно это занимает до 24 часов. Спасибо за ваше терпение!</p>
        <Link href="/" passHref>
          <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">Вернуться на главную</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Панель управления аукционного дома</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {" "}
        {/* Changed to 2 columns */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Информация об аукционном доме</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <form action={profileAction}>
              <div className="space-y-2 mb-4">
                <Label htmlFor="name">Название</Label>
                <Input id="name" name="name" type="text" defaultValue={auctionHouseProfile.name} required />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="logo_url">URL логотипа</Label>
                <Input id="logo_url" name="logo_url" type="url" defaultValue={auctionHouseProfile.logo_url || ""} />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={auctionHouseProfile.contact_email || ""}
                />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" type="text" defaultValue={auctionHouseProfile.phone || ""} />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="address">Адрес</Label>
                <Input id="address" name="address" type="text" defaultValue={auctionHouseProfile.address || ""} />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="website">Веб-сайт</Label>
                <Input id="website" name="website" type="url" defaultValue={auctionHouseProfile.website || ""} />
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
          </CardContent>
        </Card>
        {/* Moved Upcoming/Active Auctions here */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ваши предстоящие и активные аукционы</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAuctions.length > 0 ? (
              <div className="space-y-4">
                {upcomingAuctions.map((auction) => (
                  <div key={auction.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <Image
                      src={auction.image_url || "/placeholder.svg"}
                      alt={auction.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{auction.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Дата: {new Date(auction.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Статус: {auction.status === "active" ? "Активный" : "Предстоящий"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/auctions/${auction.id}`}>Подробнее</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/auction-house/edit-auction/${auction.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">У вас нет предстоящих или активных аукционов.</p>
            )}
            <Link href="/dashboard/auction-house/create-auction" passHref>
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Создать новый аукцион
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="draft-auctions" className="w-full">
        {" "}
        {/* Default to drafts */}
        <TabsList className="grid w-full grid-cols-2">
          {" "}
          {/* Only 2 tabs now */}
          <TabsTrigger value="draft-auctions">Черновики</TabsTrigger>
          <TabsTrigger value="all-lots">Управление лотами</TabsTrigger> {/* New tab for all lots */}
        </TabsList>
        <TabsContent value="draft-auctions">
          <Card>
            <CardHeader>
              <CardTitle>Ваши черновики аукционов</CardTitle>
            </CardHeader>
            <CardContent>
              {draftAuctions.length > 0 ? (
                <div className="space-y-4">
                  {draftAuctions.map((auction) => (
                    <div key={auction.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <Image
                        src={auction.image_url || "/placeholder.svg"}
                        alt={auction.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Дата: {new Date(auction.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Статус: Черновик</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/auction-house/edit-auction/${auction.id}`}>
                            <Edit className="h-4 w-4" /> Редактировать
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">У вас нет черновиков аукционов.</p>
              )}
              <Link href="/dashboard/auction-house/create-auction" passHref>
                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  Создать новый черновик
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Removed "Управление лотами" tab content here, it will be a separate tab */}
        <TabsContent value="all-lots">
          <Card>
            <CardHeader>
              <CardTitle>Управление лотами (все аукционы)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This section would list all lots from all auctions of this AH,
                  allowing for status changes (active/removed) or other management.
                  For now, it's a placeholder. You might want to fetch all lots here
                  and display them in a table similar to the admin page. */}
              <p className="text-muted-foreground text-center">
                Здесь будет таблица для управления всеми лотами ваших аукционов.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completed Auctions section moved outside of tabs */}
      <h2 className="text-3xl font-bold mt-8 mb-6 text-center">Ваши завершенные аукционы</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedAuctions.length > 0 ? (
          completedAuctions.map((auction) => (
            <Card
              key={auction.id}
              className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="p-0">
                <Image
                  src={auction.image_url || "/placeholder.svg"}
                  alt={auction.title}
                  width={300}
                  height={200}
                  className="rounded-t-md object-cover w-full h-48"
                />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground">{auction.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Дата:{" "}
                  <span className="font-bold text-primary">{new Date(auction.start_time).toLocaleDateString()}</span>
                </CardDescription>
                <p className="text-sm text-muted-foreground">Продано лотов: {auction.lotsSold || 0}</p>{" "}
                {/* Placeholder */}
                <p className="text-sm text-muted-foreground">
                  Доход: {(auction.revenue || 0).toLocaleString("ru-RU")} ₽
                </p>
              </CardContent>
              <Button variant="outline" size="sm" asChild className="w-full m-4 mt-0 bg-transparent">
                <Link href={`/auctions/${auction.id}`}>Просмотреть детали</Link>
              </Button>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">У вас нет завершенных аукционов.</p>
        )}
      </div>
    </div>
  )
}
