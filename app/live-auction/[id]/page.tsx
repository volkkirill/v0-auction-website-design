import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { getAuctionById, getLotsByAuctionId } from "@/lib/auction-data" // Import new data functions

export default async function LiveAuctionPage({ params }: { params: { id: string } }) {
  const auctionId = params.id

  const auction = await getAuctionById(auctionId)
  if (!auction) {
    return <div className="container py-8 text-center">Аукцион не найден.</div>
  }

  // For a live auction, we'd typically have a real-time mechanism to get the current lot.
  // For now, let's just get the first lot associated with this auction.
  const lotsInAuction = await getLotsByAuctionId(auction.id)
  const currentLot = lotsInAuction[0] // Assuming the first lot is the "current" one for demonstration

  if (!currentLot) {
    return <div className="container py-8 text-center">В этом аукционе нет активных лотов.</div>
  }

  // Dummy data for next lot (can be expanded or fetched from a data source)
  const nextLot = lotsInAuction[1] || null // Get the second lot as next, if it exists

  // Dummy bid history for the current lot
  const bidHistory = [
    { bidder: "Покупатель А", bid: currentLot.initial_price },
    { bidder: "Покупатель Б", bid: currentLot.initial_price + 100000 },
    { bidder: "Покупатель В", bid: currentLot.initial_price + 250000 },
    { bidder: "Покупатель А", bid: currentLot.initial_price + 300000 },
    { bidder: "Покупатель Г", bid: currentLot.initial_price + 450000 },
    { bidder: "Покупатель В", bid: currentLot.current_bid },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{auction.title}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Lot Display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{currentLot.name}</CardTitle>
            <CardDescription>{currentLot.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
              <Image
                src={currentLot.image_urls?.[0] || "/placeholder.svg"}
                alt={currentLot.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-bold">
                Текущая ставка: <span className="text-primary">{currentLot.current_bid.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg text-muted-foreground">Осталось: {"00:01:30"}</p> {/* Dummy time */}
            </div>
            <div className="flex gap-2 mb-4">
              <Input type="number" placeholder="Ваша ставка" className="flex-1" />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Сделать ставку</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Минимальный шаг ставки: {currentLot.commission_rate * 100000} ₽ {/* Simplified increment */}
            </p>
          </CardContent>
        </Card>

        {/* Sidebar: Bid History & Next Lot */}
        <div className="md:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>История ставок</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {bidHistory.map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{bid.bidder}</span>
                    <span className="font-semibold">{bid.bid.toLocaleString("ru-RU")} ₽</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {nextLot && (
            <Card>
              <CardHeader>
                <CardTitle>Следующий лот</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Image
                  src={nextLot.image_urls?.[0] || "/placeholder.svg"}
                  alt={nextLot.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{nextLot.name}</h3>
                  <Link href={`/lots/${nextLot.id}`} passHref>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Подробнее
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Информация об аукционере</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Дмитрий Аукционист</p> {/* Dummy auctioneer */}
              <p className="text-sm text-muted-foreground">Ведущий этого аукциона.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
