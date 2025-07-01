import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { getAuctionHouseById, getAllAuctions } from "@/lib/auction-data" // Import new data functions

export default async function AuctionHouseDetailsPage({ params }: { params: { id: string } }) {
  const auctionHouseId = params.id

  // Find the auction house from the centralized data
  const auctionHouse = await getAuctionHouseById(auctionHouseId)

  if (!auctionHouse) {
    return <div className="container py-8 text-center">Аукционный дом не найден.</div>
  }

  // Filter auctions belonging to this auction house
  const allAuctions = await getAllAuctions()
  const upcomingAuctions = allAuctions.filter(
    (auction) => auction.auction_house_id === auctionHouse.id && auction.status === "upcoming",
  )
  const completedAuctions = allAuctions.filter(
    (auction) => auction.auction_house_id === auctionHouse.id && auction.status === "closed",
  )

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Image
          src={auctionHouse.logo_url || "/placeholder.svg"}
          alt={`${auctionHouse.name} Logo`}
          width={150}
          height={150}
          className="rounded-md object-cover border border-muted mb-4"
        />
        <h1 className="text-4xl font-bold mb-2">{auctionHouse.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{auctionHouse.description}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">Email: {auctionHouse.contact_email}</p>
          <p className="text-muted-foreground">Телефон: {auctionHouse.phone}</p>
          <p className="text-muted-foreground">Адрес: {auctionHouse.address}</p>
          {auctionHouse.website && (
            <p className="text-muted-foreground">
              Веб-сайт:{" "}
              <Link
                href={auctionHouse.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {auctionHouse.website}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold mb-6 text-center">Предстоящие аукционы</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {upcomingAuctions.length > 0 ? (
          upcomingAuctions.map((auction) => (
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
                <p className="text-sm text-muted-foreground">Категория: {auction.category}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/auctions/${auction.id}`} passHref>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Посмотреть аукцион
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">Нет предстоящих аукционов.</p>
        )}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center">Завершенные аукционы</h2>
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
                <p className="text-sm text-muted-foreground">Категория: {auction.category}</p>
                {/* Dummy data for lotsSold and revenue for completed auctions */}
                <p className="text-sm text-muted-foreground">Продано лотов: {Math.floor(Math.random() * 50) + 10}</p>
                <p className="text-sm text-muted-foreground">
                  Доход: {(Math.random() * 10000000 + 1000000).toLocaleString("ru-RU")} ₽
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/auctions/${auction.id}`} passHref>
                  <Button variant="outline" className="w-full bg-transparent">
                    Посмотреть детали
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">Нет завершенных аукционов.</p>
        )}
      </div>
    </div>
  )
}
