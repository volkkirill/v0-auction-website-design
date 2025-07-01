import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { images } from "@/lib/auction-data" // Import centralized images

export default function LiveAuctionPage({ params }: { params: { id: string } }) {
  const auctionId = params.id

  // Dummy data for a live auction
  const auction = {
    id: auctionId,
    title: `Живой аукцион: Редкие коллекционные предметы №${auctionId}`,
    currentLot: {
      id: "lot1",
      name: "Антикварная ваза династии Мин",
      description: "Изысканная фарфоровая ваза, датируемая периодом династии Мин.",
      currentBid: 2500000, // Numeric value for rubles
      bidCount: 25,
      minBidIncrement: 50000, // Numeric value for rubles
      image: images.mingVaseMain,
      history: [
        { bidder: "Покупатель А", bid: 2000000 }, // Numeric value for rubles
        { bidder: "Покупатель Б", bid: 2100000 }, // Numeric value for rubles
        { bidder: "Покупатель В", bid: 2250000 }, // Numeric value for rubles
        { bidder: "Покупатель А", bid: 2300000 }, // Numeric value for rubles
        { bidder: "Покупатель Г", bid: 2450000 }, // Numeric value for rubles
        { bidder: "Покупатель В", bid: 2500000 }, // Numeric value for rubles
      ],
    },
    nextLot: {
      id: "lot2",
      name: "Винтажный мотоцикл Harley-Davidson",
      image: images.harleyDavidsonMotorcycle,
    },
    auctioneer: "Дмитрий Аукционист",
    remainingTime: "00:01:30", // Example: 1 minute 30 seconds
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{auction.title}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Lot Display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{auction.currentLot.name}</CardTitle>
            <CardDescription>{auction.currentLot.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
              <Image
                src={auction.currentLot.image || "/placeholder.svg"}
                alt={auction.currentLot.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-bold">
                Текущая ставка:{" "}
                <span className="text-primary">{auction.currentLot.currentBid.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg text-muted-foreground">Осталось: {auction.remainingTime}</p>
            </div>
            <div className="flex gap-2 mb-4">
              <Input type="number" placeholder="Ваша ставка" className="flex-1" />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Сделать ставку</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Минимальный шаг ставки: {auction.currentLot.minBidIncrement.toLocaleString("ru-RU")} ₽
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
                {auction.currentLot.history.map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{bid.bidder}</span>
                    <span className="font-semibold">{bid.bid.toLocaleString("ru-RU")} ₽</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Следующий лот</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Image
                src={auction.nextLot.image || "/placeholder.svg"}
                alt={auction.nextLot.name}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <div>
                <h3 className="font-semibold">{auction.nextLot.name}</h3>
                <Link href={`/lots/${auction.nextLot.id}`} passHref>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Подробнее
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Информация об аукционере</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{auction.auctioneer}</p>
              <p className="text-sm text-muted-foreground">Ведущий этого аукциона.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
