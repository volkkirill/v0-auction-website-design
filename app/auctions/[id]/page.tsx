import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { getAuctionById, getAuctionHouseById, getLotsByAuctionId } from "@/lib/auction-data" // Import new data functions

export default async function AuctionDetailsPage({ params }: { params: { id: string } }) {
  const auctionId = params.id

  // Find the auction from the centralized data
  const auction = await getAuctionById(auctionId)

  if (!auction) {
    return <div className="container py-8 text-center">Аукцион не найден.</div>
  }

  const lots = await getLotsByAuctionId(auction.id)
  const currentAuctionHouse = await getAuctionHouseById(auction.auction_house_id)

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Auction Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{auction.title}</h1>
          <p className="text-muted-foreground mb-6">{auction.description}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Начало аукциона:{" "}
            <span className="font-bold text-primary">{new Date(auction.start_time).toLocaleString()}</span>
          </p>

          <h2 className="text-2xl font-bold mb-4">Лоты в этом аукционе</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lots.length > 0 ? (
              lots.map((lot) => (
                <Card key={lot.id} className="flex flex-col">
                  <CardHeader className="p-0">
                    <Image
                      src={lot.image_urls?.[0] || "/placeholder.svg"}
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
