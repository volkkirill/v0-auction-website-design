"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch" // Import Switch for toggling featured status
import Link from "next/link"
import { createClient } from "@/supabase/client"
import { getAllAuctions } from "@/lib/auction-data" // Import data functions
import { toggleLotFeaturedStatus } from "./action" // New action for toggling featured status

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([]) // All lots for admin to manage
  const [loading, setLoading] = useState(true)
  const [isProfilePending, setIsProfilePending] = useState(false) // Declare the variable

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch users (simplified for now, ideally from profiles table with roles)
      const { data: fetchedUsers, error: usersError } = await supabase.from("profiles").select("*")
      if (!usersError) setUsers(fetchedUsers)
      else console.error("Error fetching users:", usersError)

      const fetchedAuctions = await getAllAuctions()
      setAuctions(fetchedAuctions)

      const { data: fetchedLots, error: lotsError } = await supabase.from("lots").select("*")
      if (!lotsError) setLots(fetchedLots)
      else console.error("Error fetching lots:", lotsError)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleToggleFeatured = async (lotId: string, currentStatus: boolean) => {
    const { error, success } = await toggleLotFeaturedStatus({ lotId, isFeatured: !currentStatus })
    setIsProfilePending(error !== null) // Update isProfilePending based on error
    if (success) {
      // Re-fetch lots to update the UI after toggle
      const { data: updatedLots, error: lotsError } = await supabase.from("lots").select("*")
      if (!lotsError) setLots(updatedLots)
      else console.error("Error re-fetching lots:", lotsError)
    }
  }

  const activeAuctionsCount = auctions.filter((a) => a.status === "active").length
  const pendingLotsCount = lots.filter(
    (l) => l.status === "На рассмотрении" || l.status === "Ожидает утверждения",
  ).length

  if (loading) {
    return <div className="container py-8 text-center">Загрузка панели администратора...</div>
  }

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
            <p className="text-5xl font-bold text-primary">{users.length}</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="auctions">Аукционы</TabsTrigger>
          <TabsTrigger value="lots">Управление лотами</TabsTrigger> {/* New tab for lot management */}
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
                  {users.map((user) => (
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
                      <TableCell>{auction.auction_house_id}</TableCell> {/* Display ID for now */}
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
              {isProfilePending && <p className="text-red-500 text-sm mb-4">Ошибка при обновлении статуса лота.</p>}
              {isProfilePending === false && (
                <p className="text-green-500 text-sm mb-4">Статус лота успешно обновлен!</p>
              )}
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
                  {lots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.name}</TableCell>
                      <TableCell>{lot.auction_id}</TableCell> {/* Display auction ID for now */}
                      <TableCell>{lot.current_bid.toLocaleString("ru-RU")} ₽</TableCell>
                      <TableCell>
                        <Switch
                          checked={lot.is_featured}
                          onCheckedChange={() => handleToggleFeatured(lot.id, lot.is_featured)}
                          disabled={isProfilePending}
                        />
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
      </Tabs>
    </div>
  )
}
