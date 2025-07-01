import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { images } from "@/lib/auction-data" // Import centralized images

export default function AuctionHouseDashboardPage() {
  const auctionHouse = {
    name: "Галерея Искусств",
    email: "contact@artgallery.com",
    phone: "+7 (495) 123-45-67",
    address: "Москва, ул. Тверская, 10",
    totalAuctions: 120,
    totalLotsSold: 850,
    totalRevenue: 1250000000, // Numeric value for rubles
  }

  const upcomingAuctions = [
    {
      id: "auc1",
      title: "Весенний аукцион искусства",
      date: "2025-07-15",
      lotsCount: 50,
      image: images.springArtAuction,
    },
    {
      id: "auc2",
      title: "Аукцион современной фотографии",
      date: "2025-08-01",
      lotsCount: 30,
      image: images.modernPhotographyAuction,
    },
  ]

  const completedAuctions = [
    {
      id: "auc3",
      title: "Зимний аукцион антиквариата",
      date: "2025-02-20",
      lotsSold: 75,
      revenue: 320000000, // Numeric value for rubles
      image: images.winterAntiquesAuction,
    },
    {
      id: "auc4",
      title: "Осенний аукцион ювелирных изделий",
      date: "2024-11-10", // Keeping this one in 2024 for variety
      lotsSold: 40,
      revenue: 180000000, // Numeric value for rubles
      image: images.autumnJewelryAuction,
    },
  ]

  const pendingLots = [
    {
      id: "lot101",
      name: "Бронзовая статуэтка",
      status: "На рассмотрении",
      submissionDate: "2025-07-01",
      image: images.bronzeStatuette,
    },
    {
      id: "lot102",
      name: "Коллекция виниловых пластинок",
      status: "Ожидает утверждения",
      submissionDate: "2025-06-25",
      image: images.vinylRecords,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Панель управления аукционного дома</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Информация об аукционном доме</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Название: <span className="font-semibold">{auctionHouse.name}</span>
            </p>
            <p>
              Email: <span className="font-semibold">{auctionHouse.email}</span>
            </p>
            <p>
              Телефон: <span className="font-semibold">{auctionHouse.phone}</span>
            </p>
            <p>
              Адрес: <span className="font-semibold">{auctionHouse.address}</span>
            </p>
            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Редактировать профиль
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{auctionHouse.totalAuctions}</p>
              <p className="text-muted-foreground">Всего аукционов</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{auctionHouse.totalLotsSold}</p>
              <p className="text-muted-foreground">Всего лотов продано</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{auctionHouse.totalRevenue.toLocaleString("ru-RU")} ₽</p>
              <p className="text-muted-foreground">Общий доход</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming-auctions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming-auctions">Предстоящие аукционы</TabsTrigger>
          <TabsTrigger value="completed-auctions">Завершенные аукционы</TabsTrigger>
          <TabsTrigger value="pending-lots">Ожидающие лоты</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming-auctions">
          <Card>
            <CardHeader>
              <CardTitle>Ваши предстоящие аукционы</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAuctions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAuctions.map((auction) => (
                    <div key={auction.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <Image
                        src={auction.image || "/placeholder.svg"}
                        alt={auction.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">Дата: {auction.date}</p>
                        <p className="text-sm text-muted-foreground">Количество лотов: {auction.lotsCount}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/auctions/${auction.id}`}>Подробнее</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">У вас нет предстоящих аукционов.</p>
              )}
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Создать новый аукцион
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed-auctions">
          <Card>
            <CardHeader>
              <CardTitle>Ваши завершенные аукционы</CardTitle>
            </CardHeader>
            <CardContent>
              {completedAuctions.length > 0 ? (
                <div className="space-y-4">
                  {completedAuctions.map((auction) => (
                    <div key={auction.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <Image
                        src={auction.image || "/placeholder.svg"}
                        alt={auction.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground">Дата: {auction.date}</p>
                        <p className="text-sm text-muted-foreground">Продано лотов: {auction.lotsSold}</p>
                        <p className="text-sm text-muted-foreground">
                          Доход: {auction.revenue.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/auctions/${auction.id}`}>Просмотреть детали</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">У вас нет завершенных аукционов.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending-lots">
          <Card>
            <CardHeader>
              <CardTitle>Ожидающие лоты</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLots.length > 0 ? (
                <div className="space-y-4">
                  {pendingLots.map((lot) => (
                    <div key={lot.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <Image
                        src={lot.image || "/placeholder.svg"}
                        alt={lot.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{lot.name}</h3>
                        <p className="text-sm text-muted-foreground">Статус: {lot.status}</p>
                        <p className="text-sm text-muted-foreground">Дата подачи: {lot.submissionDate}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Просмотреть
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">У вас нет ожидающих лотов.</p>
              )}
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Подать новый лот
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
