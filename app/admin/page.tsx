import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { createClient } from "@/supabase/server"
import { getAllAuctions } from "@/lib/auction-data" // Import getAuctionHouses
import { LotFeaturedToggle } from "@/components/admin/lot-featured-toggle"
import { ApproveAuctionHouseButton } from "@/components/admin/approve-auction-house-button" // New client component
import { redirect } from "next/navigation" // Import redirect

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Server-side authorization check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/sign-in") // Redirect to login if not authenticated
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/") // Redirect to home if not an admin
  }

  // Fetch data directly in the Server Component
  const { data: users, error: usersError } = await supabase.from("profiles").select("*")
  if (usersError) console.error("Error fetching users:", usersError)

  const auctions = await getAllAuctions()

  const { data: lots, error: lotsError } = await supabase.from("lots").select("*")
  if (lotsError) console.error("Error fetching lots:", lotsError)

  // Fetch all auction houses, including pending ones for admin view
  const { data: allAuctionHouses, error: ahError } = await supabase.from("auction_houses").select("*")
  if (ahError) console.error("Error fetching all auction houses:", ahError)

  const pendingAuctionHouses = allAuctionHouses?.filter((ah) => ah.status === "pending") || []

  const activeAuctionsCount = auctions.filter((a) => a.status === "active").length
  const pendingLotsCount = lots.filter(
    (l) => l.status === "На рассмотрении" || l.status === "Ожидает утверждения",
  ).length

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Панель администратора</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Пользователи</CardTitle>
            <CardDescription>Всего зарегистрированных пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{users?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Активные аукционы</CardTitle>
            <CardDescription>Количество текущих аукционов</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{activeAuctionsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Лоты на рассмотрении</CardTitle>
            <CardDescription>Лоты, ожидающие модерации</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{pendingLotsCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {" "}
          {/* Increased grid-cols */}
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="auctions">Аукционы</TabsTrigger>
          <TabsTrigger value="lots">Управление лотами</TabsTrigger>
          <TabsTrigger value="ah-applications">Заявки АД</TabsTrigger> {/* New Tab */}
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 bg-transparent">
                          Редактировать
                        </Button>
                        <Button variant="destructive" size="sm">
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="auctions">
          <Card>
            <CardHeader>
              <CardTitle>Управление аукционами</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Аукционный дом</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">{auction.title}</TableCell>
                      <TableCell>{auction.status}</TableCell>
                      <TableCell>{auction.category}</TableCell>
                      <TableCell>{auction.auction_house_id}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 bg-transparent" asChild>
                          <Link href={`/auctions/${auction.id}`}>Просмотреть</Link>
                        </Button>
                        <Button variant="destructive" size="sm">
                          Завершить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lots">
          <Card>
            <CardHeader>
              <CardTitle>Управление лотами</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название лота</TableHead>
                    <TableHead>Аукцион</TableHead>
                    <TableHead>Текущая ставка</TableHead>
                    <TableHead>В анонсах</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots?.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.name}</TableCell>
                      <TableCell>{lot.auction_id}</TableCell>
                      <TableCell>{lot.current_bid.toLocaleString("ru-RU")} ₽</TableCell>
                      <TableCell>
                        <LotFeaturedToggle lotId={lot.id} initialIsFeatured={lot.is_featured} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 bg-transparent" asChild>
                          <Link href={`/lots/${lot.id}`}>Просмотреть</Link>
                        </Button>
                        <Button variant="destructive" size="sm">
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ah-applications">
          <Card>
            <CardHeader>
              <CardTitle>Заявки Аукционных Домов</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingAuctionHouses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAuctionHouses.map((ah) => (
                      <TableRow key={ah.id}>
                        <TableCell className="font-medium">{ah.name}</TableCell>
                        <TableCell>{ah.contact_email}</TableCell>
                        <TableCell>{ah.phone || "N/A"}</TableCell>
                        <TableCell>{ah.address || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <ApproveAuctionHouseButton auctionHouseId={ah.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center">Нет новых заявок на регистрацию аукционных домов.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
