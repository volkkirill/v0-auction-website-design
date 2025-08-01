import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { getFeaturedLots, getAllAuctions, getAuctionHouses, images } from "@/lib/auction-data"
import { RegisterButton } from "@/components/auth/register-button"
import { createClient } from "@/supabase/server"
import { Clock, Gavel } from "lucide-react"

// Helper function to format time remaining until auction starts
const formatTimeRemaining = (startTime: string) => {
  const now = new Date().getTime()
  const start = new Date(startTime).getTime()
  const difference = start - now

  if (difference <= 0) {
    return "Начался!"
  }

  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
  if (difference > threeDaysInMs) {
    return null // Return null to hide the badge if more than 3 days remain
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  let timeString = ""
  if (days > 0) timeString += `${days}д `
  if (hours > 0) timeString += `${hours}ч `
  timeString += `${minutes}м`

  return timeString.trim()
}

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

export default async function HomePage() {
  const featuredLots = await getFeaturedLots()
  const allAuctions = await getAllAuctions()
  const auctionHouses = await getAuctionHouses()

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Use a subset of allAuctions for upcoming auctions on the homepage
  const upcomingAuctions = allAuctions
    .filter((auction) => auction.status === "upcoming" || auction.status === "active")
    .slice(0, 6) // Show first 6 upcoming/active auctions

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Hero Section with Interesting Lots on the side */}
      <section className="w-full min-h-[calc(100vh-64px)] flex items-center bg-background relative overflow-hidden">
        <Image
          src={images.heroBg || "/placeholder.svg"}
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          className="absolute inset-0 z-0 opacity-10"
        />
        <div className="container px-4 md:px-6 grid lg:grid-cols-3 gap-8 relative z-10 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                Добро пожаловать на Молоток.Ру
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Откройте для себя уникальные лоты и участвуйте в захватывающих торгах.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
              <Link href="/auctions" passHref>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Посмотреть аукционы</Button>
              </Link>
              <RegisterButton initialUser={user} />
            </div>
          </div>

          {/* Right Column: Announcements of Interesting Lots */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start py-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground text-center lg:text-left">
              Анонсы интересных лотов
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
              {featuredLots.length > 0 ? (
                featuredLots.map((lot) => (
                  <Card
                    key={lot.id}
                    className="bg-card text-card-foreground border-border hover:shadow-lg transition-shadow duration-300 flex flex-col items-center p-3 text-center"
                  >
                    <Link href={`/lots/${lot.id}`} passHref>
                      <Image
                        src={lot.image_urls?.[0] || "/placeholder.svg"}
                        alt={lot.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover border border-muted mb-2 cursor-pointer"
                      />
                    </Link>
                    <CardTitle className="text-sm font-semibold text-foreground">{lot.name}</CardTitle>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center text-sm">Нет интересных лотов.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Auctions - Ближайшие аукционы (vertical list) */}
      <section className="w-full py-12 md:py-24 bg-muted lg:py-11">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Предстоящие аукционы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.length > 0 ? (
              upcomingAuctions.map((auction) => {
                const timeRemaining = formatTimeRemaining(auction.start_time)
                const auctionHouse = auctionHouses.find((ah) => ah.id === auction.auction_house_id)
                return (
                  <Card
                    key={auction.id}
                    className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300 relative flex flex-col"
                  >
                    <CardHeader className="p-0">
                      <div className="relative">
                        <Image
                          src={auction.image_url || "/placeholder.svg"}
                          alt={auction.title}
                          width={300}
                          height={200}
                          className="rounded-t-md object-cover w-full h-48"
                        />
                        {timeRemaining && (
                          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            Начнется через: {timeRemaining}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 flex-grow">
                      <CardTitle className="text-lg font-semibold text-foreground">{auction.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{auction.description}</CardDescription>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-bold text-primary">{formatDisplayTime(auction.start_time)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Аукционный дом:{" "}
                        <Link
                          href={`/auction-houses/${auction.auction_house_id}`}
                          className="font-bold text-primary hover:underline"
                        >
                          {auctionHouse?.name || "Неизвестно"}
                        </Link>
                      </p>
                      {auction.commission_percentage && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Gavel className="h-4 w-4" />
                          <span className="font-bold text-primary">{auction.commission_percentage}%</span>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Link href={`/auctions/${auction.id}`} passHref>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Посмотреть аукцион
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })
            ) : (
              <p className="text-muted-foreground col-span-full text-center">Нет предстоящих аукционов.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
