import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { allAuctions, auctionHouses, images } from "@/lib/auction-data" // Import centralized data

export default function AuctionDetailsPage({ params }: { params: { id: string } }) {
  const auctionId = params.id

  // Find the auction from the centralized data
  const auction = allAuctions.find((a) => a.id === auctionId)

  if (!auction) {
    return <div className="container py-8 text-center">Аукцион не найден.</div>
  }

  // Dummy lots for this specific auction (can be expanded or fetched from a data source)
  const lots = [
    {
      id: "lot1",
      name: "Винтажные часы Rolex Daytona",
      description: "Редкая модель 1970 года, в отличном состоянии.",
      currentBid: 1500000, // Numeric value for rubles
      image: images.luxuryWatch,
    },
    {
      id: "lot2",
      name: "Карманные часы Patek Philippe",
      description: "Антикварные часы XIX века, ручная работа.",
      currentBid: 800000, // Numeric value for rubles
      image: images.patekPhilippePocket,
    },
    {
      id: "lot3",
      name: "Современные часы Audemars Piguet",
      description: "Лимитированная серия, выпущенная в 2020 году.",
      currentBid: 1200000, // Numeric value for rubles
      image: images.audemarsPiguetModern,
    },
  ]

  const currentAuctionHouse = auctionHouses.find((ah) => ah.id === auction.auctionHouseId)

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Auction Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{auction.title}</h1>
          <p className="text-muted-foreground mb-6">{auction.description}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Начало аукциона:{" "}
            <span className="font-bold text-primary">{new Date(auction.startTime).toLocaleString()}</span>
          </p>

          <h2 className="text-2xl font-bold mb-4">Лоты в этом аукционе</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lots.map((lot) => (
              <Card key={lot.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <Image
                    src={lot.image || "/placeholder.svg"}
                    alt={lot.name}
                    width={300}
                    height={200}
                    className="rounded-t-md object-cover w-full h-48"
                  />
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-lg font-semibold">{lot.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{lot.description}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    Текущая ставка:{" "}
                    <span className="font-bold text-secondary">{lot.currentBid.toLocaleString("ru-RU")} ₽</span>
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
            ))}
          </div>
        </div>

        {/* Auction House Info */}
        <div>
          {currentAuctionHouse && (
            <Card className="bg-card text-card-foreground border-border shadow-md">
              <CardHeader className="flex flex-col items-center text-center">
                <Image
                  src={currentAuctionHouse.logo || "/placeholder.svg"}
                  alt={`${currentAuctionHouse.name} Logo`}
                  width={80}
                  height={80}
                  className="rounded-md object-cover border border-muted mb-4"
                />
                <CardTitle className="text-2xl">{currentAuctionHouse.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Email: {currentAuctionHouse.contactEmail}</p>
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
