import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { auctionHouses } from "@/lib/auction-data" // Import centralized data

export default function AuctionHousesPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Наши Аукционные Дома</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionHouses.map((house) => (
          <Card
            key={house.id}
            className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <CardHeader className="flex flex-col items-center p-6 pb-4">
              <Image
                src={house.logo || "/placeholder.svg"}
                alt={`${house.name} Logo`}
                width={100}
                height={100}
                className="rounded-md object-cover border border-muted mb-4"
              />
              <CardTitle className="text-xl font-semibold text-foreground text-center">{house.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-center flex-grow flex flex-col justify-between">
              <CardDescription className="text-sm text-muted-foreground mb-4">{house.description}</CardDescription>
              <Link href={`/auction-houses/${house.id}`} passHref>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Посмотреть страницу дома
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
