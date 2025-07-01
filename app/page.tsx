import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { allAuctions, auctionHouses, images } from "@/lib/auction-data" // Import centralized data

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

export default function HomePage() {
  // Use a subset of allAuctions for upcoming auctions on the homepage
  const upcomingAuctions = allAuctions
    .filter((auction) => auction.status === "upcoming" || auction.status === "active")
    .slice(0, 6) // Show first 6 upcoming/active auctions

  const interestingLots = [
    { id: "lot1", name: "Редкая марка 19 века", image: images.stampCollection },
    { id: "lot2", name: "Винтажный Ролекс", image: images.luxuryWatch },
    { id: "lot3", name: "Картина 'Закат'", image: images.artPainting },
    { id: "lot4", name: "Золотая монета", image: images.rareCoin },
    { id: "lot5", name: "Скульптура 'Мыслитель'", image: images.modernSculpture },
    { id: "lot6", name: "Коллекционное вино", image: images.fineWine },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Hero Section with Interesting Lots on the side */}
      <section className="w-full min-h-[calc(100vh-64px)] flex items-center bg-background relative overflow-hidden">
        <Image
          src={images.heroBg || "/placeholder.svg"}
          alt="Background"
          layout="fill"
          objectFit="cover"
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
              <Link href="/register" passHref>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                  Зарегистрироваться
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Announcements of Interesting Lots */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start py-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground text-center lg:text-left">
              Анонсы интересных лотов
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
              {interestingLots.map((lot) => (
                <Card
                  key={lot.id}
                  className="bg-card text-card-foreground border-border hover:shadow-lg transition-shadow duration-300 flex flex-col items-center p-3 text-center"
                >
                  <Link href={`/lots/${lot.id}`} passHref>
                    <Image
                      src={lot.image || "/placeholder.svg"}
                      alt={lot.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover border border-muted mb-2 cursor-pointer"
                    />
                  </Link>
                  <CardTitle className="text-sm font-semibold text-foreground">{lot.name}</CardTitle>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Auctions - Ближайшие аукционы (vertical list) */}
      <section className="w-full py-12 md:py-24 bg-muted lg:py-11">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Предстоящие аукционы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => {
              const timeRemaining = formatTimeRemaining(auction.startTime) // Use startTime
              return (
                <Card
                  key={auction.id}
                  className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300 relative"
                >
                  <CardHeader className="p-0">
                    <Image
                      src={auction.image || "/placeholder.svg"}
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
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <CardTitle className="text-lg font-semibold text-foreground">{auction.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Дата:{" "}
                      <span className="font-bold text-primary">{new Date(auction.startTime).toLocaleString()}</span>
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">{auction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Аукционный дом:{" "}
                      <Link
                        href={`/auction-houses/${auction.auctionHouseId}`}
                        className="font-bold text-primary hover:underline"
                      >
                        {auctionHouses.find((ah) => ah.id === auction.auctionHouseId)?.name || "Неизвестно"}
                      </Link>
                    </p>
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
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
