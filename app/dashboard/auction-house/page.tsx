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
import { updateAuctionHouseProfile, updateLotStatus, deleteLot } from "@/app/actions/auction-house-management"
import {
  fetchAuctionHouseByIdForClient,
  fetchAllAuctionsForClient,
  fetchLotsByAuctionIdForClient,
} from "@/app/actions/data-fetching"
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

          // Fetch lots for all auctions (including drafts) to manage them
          const allLotsData: any[] = []
          for (const auction of ahAuctions) {
            const lots = await fetchLotsByAuctionIdForClient(auction.id, true) // Include removed lots for management
            allLotsData.push(...lots)
          }
          // No specific "pending lots" tab, all lots are managed under "Управление лотами"
          // For now, we'll just display all lots associated with the AH's auctions
          // A more complex solution would involve a separate table for lot submissions
          // For simplicity, we'll just show all lots here.
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

  // Calculate total auctions, lots sold, and revenue from fetched data
  const totalAuctions = upcomingAuctions.length + completedAuctions.length + draftAuctions.length
  const totalLotsSold = completedAuctions.reduce((sum, auction) => sum + (auction.lotsSold || 0), 0) // Assuming lotsSold is a property on completed auctions
  const totalRevenue = completedAuctions.reduce((sum, auction) => sum + (auction.revenue || 0), 0) // Assuming revenue is a property on completed auctions

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Панель управления аукционного дома</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalAuctions}</p>
              <p className="text-muted-foreground">Всего аукционов</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalLotsSold}</p>
              <p className="text-muted-foreground">Всего лотов продано</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalRevenue.toLocaleString("ru-RU")} ₽</p>
              <p className="text-muted-foreground">Общий доход</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming-auctions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming-auctions">Предстоящие/Активные</TabsTrigger>
          <TabsTrigger value="draft-auctions">Черновики</TabsTrigger>
          <TabsTrigger value="completed-auctions">Завершенные</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming-auctions">
          <Card>
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
        </TabsContent>
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
        <TabsContent value="completed-auctions">
          <Card>
            <CardHeader>
              <CardTitle>Ваши завершенные аукционы</CardTitle>
            </CardHeader>
            <CardContent>
              {completedAuctions.length > 0 ? (
                <div className="space-y-4">
                  {completedAuctions.map((auction) => (
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
                        <p className="text-sm text-muted-foreground">Продано лотов: {auction.lotsSold || 0}</p>{" "}
                        {/* Placeholder */}
                        <p className="text-sm text-muted-foreground">
                          Доход: {(auction.revenue || 0).toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/auctions/${auction.id}`}>Просмотреть детали</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">У вас нет завершенных аукционов.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
