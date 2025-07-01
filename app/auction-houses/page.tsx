import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { getAuctionHouses } from "@/lib/auction-data" // Import new data functions

export default async function AuctionHousesPage() {
  // Fetch only approved auction houses by default
  const auctionHouses = await getAuctionHouses()

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Наши Аукционные Дома</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionHouses.length > 0 ? (
          auctionHouses.map((house) => (
            <Link href={`/auction-houses/${house.id}`} key={house.id} passHref className="block">
              <Card className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300 flex flex-col h-full cursor-pointer">
                <CardHeader className="flex flex-col items-center p-6 pb-4">
                  <Image
                    src={house.logo_url || "/placeholder.svg"}
                    alt={`${house.name} Logo`}
                    width={200} // Increased width
                    height={120} // Adjusted height for wider aspect
                    className="rounded-md object-contain border border-muted mb-4" // Use object-contain for logos
                  />
                  <CardTitle className="text-xl font-semibold text-foreground text-center">{house.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center flex-grow flex flex-col justify-between">
                  {/* Display address or city instead of full description */}
                  <CardDescription className="text-sm text-muted-foreground mb-4">
                    {house.address || house.city || "Адрес не указан."}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">Нет зарегистрированных аукционных домов.</p>
        )}
      </div>
    </div>
  )
}
