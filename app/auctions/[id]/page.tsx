import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { getAuctionById, getAuctionHouseById, getLotsByAuctionId } from "@/lib/auction-data"
import { FavoriteButton } from "@/components/favorite-button"
import { createClient } from "@/supabase/server"
import { fetchUserFavoriteLotIds } from "@/app/actions/favorites"
import { Clock, Users, Gavel } from "lucide-react"

// Helper function to format display time
const formatDisplayTime = (utcDateString: string) => {
  if (!utcDateString) return ""
  const date = new Date(utcDateString)
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper function to check if auction is accessible (1 hour before start)
const isAuctionAccessible = (startTime: string) => {
  const now = new Date()
  const auctionStart = new Date(startTime)
  const oneHourBefore = new Date(auctionStart.getTime() - 60 * 60 * 1000)
  return now >= oneHourBefore
}

export default async function AuctionDetailsPage({ params }: { params: { id: string } }) {
  const auctionId = params.id

  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  let userRole: string | null = null
  let userFavoriteLotIds: string[] = []

  if (user && !userError) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile && !profileError) {
      userRole = profile.role
      if (userRole === "buyer") {
        userFavoriteLotIds = await fetchUserFavoriteLotIds()
      }
    }
  }

  const auction = await getAuctionById(auctionId)

  if (!auction) {
    return <div className="container py-8 text-center">Аукцион не найден.</div>
  }

  const lots = await getLotsByAuctionId(auction.id)
  const currentAuctionHouse = await getAuctionHouseById(auction.auction_house_id)

  // Check if live auction should be available (1 hour before start)
  const now = new Date()
  const auctionStart = new Date(auction.start_time)
  const oneHourBefore = new Date(auctionStart.getTime() - 60 * 60 * 1000)
  const showLiveLink = now >= oneHourBefore
  const isLive = auction.is_live
  const hasStarted = now >= auctionStart

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    live: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    draft: "bg-yellow-100 text-yellow-800",
  }

  const statusLabels = {
    upcoming: "Предстоящий",
    active: "Активный",
    live: "Идет торг",
    completed: "Завершен",
    draft: "Черновик",
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Auction Details */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">{auction.title}</h1>
            {isLive && (
              <Badge className="bg-green-500 text-white">
                <Gavel className="w-4 h-4 mr-1" />
                LIVE
              </Badge>
            )}
            <Badge className={statusColors[auction.status as keyof typeof statusColors]}>
              {statusLabels[auction.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-6">{auction.description}</p>

          <div className="space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-2" />
              Начало аукциона: <span className="font-bold text-primary">{formatDisplayTime(auction.start_time)}</span>
            </p>

            {showLiveLink && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                {isLive ? (
                  <div className="text-center">
                    <p className="text-green-800 font-semibold mb-3">🔴 Аукцион идет прямо сейчас!</p>
                    <Link href={`/live-auction/${auction.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Gavel className="w-4 h-4 mr-2" />
                        Присоединиться к торгам
                      </Button>
                    </Link>
                  </div>
                ) : hasStarted ? (
                  <div className="text-center">
                    <p className="text-gray-600">Аукцион завершен</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-green-800 font-semibold mb-3">
                      Аукцион скоро начнется! Вы можете войти в зал ожидания.
                    </p>
                    <Link href={`/live-auction/${auction.id}`}>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Войти в зал ожидания
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-4">Лоты в этом аукционе</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lots.length > 0 ? (
              lots.map((lot) => (
                <Card key={lot.id} className="flex flex-col">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={lot.image_urls?.[0] || "/placeholder.svg"}
                      alt={lot.name}
                      width={300}
                      height={200}
                      className="rounded-t-md object-cover w-full h-48"
                    />
                    {userRole === "buyer" && (
                      <div className="absolute top-2 right-2">
                        <FavoriteButton lotId={lot.id} initialIsFavorited={userFavoriteLotIds.includes(lot.id)} />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg font-semibold">{lot.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{lot.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      Текущая ставка:{" "}
                      <span className="font-bold text-secondary">{lot.current_bid.toLocaleString("ru-RU")} ₽</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/lots/${lot.id}`} passHref>
                      <Button variant="outline" className="w-full bg-transparent">
                        Подробнее о лоте
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center">В этом аукционе пока нет лотов.</p>
            )}
          </div>
        </div>

        {/* Auction House Info */}
        <div>
          {currentAuctionHouse && (
            <Card className="bg-card text-card-foreground border-border shadow-md">
              <CardHeader className="flex flex-col items-center text-center">
                <Image
                  src={currentAuctionHouse.logo_url || "/placeholder.svg"}
                  alt={`${currentAuctionHouse.name} Logo`}
                  width={80}
                  height={80}
                  className="rounded-md object-cover border border-muted mb-4"
                />
                <CardTitle className="text-2xl">{currentAuctionHouse.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Email: {currentAuctionHouse.contact_email}</p>
                <p className="text-sm text-muted-foreground">Телефон: {currentAuctionHouse.phone}</p>
                <p className="text-sm text-muted-foreground">Адрес: {currentAuctionHouse.address}</p>
                <Separator />
                <Link href={`/auction-houses/${currentAuctionHouse.id}`} passHref>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Посмотреть страницу дома
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
