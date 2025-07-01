import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default function AdminDashboardPage() {
  const users = [
    { id: "u1", name: "Иван Петров", email: "ivan@example.com", role: "Покупатель", status: "Активен" },
    { id: "u2", name: "Мария Сидорова", email: "maria@example.com", role: "Продавец", status: "Активен" },
    { id: "u3", name: "ООО 'АртГалерея'", email: "art@example.com", role: "Аукционный дом", status: "Активен" },
    { id: "u4", name: "Петр Иванов", email: "petr@example.com", role: "Покупатель", status: "Заблокирован" },
  ]

  const auctions = [
    { id: "a1", title: "Аукцион редких монет", status: "Активен", lots: 50, participants: 120 },
    { id: "a2", title: "Современное искусство", status: "Предстоящий", lots: 30, participants: 0 },
    { id: "a3", title: "Винтажные автомобили", status: "Завершен", lots: 10, participants: 80 },
  ]

  const pendingLots = [
    { id: "l1", name: "Старинная ваза", seller: "Мария Сидорова", status: "На рассмотрении" },
    { id: "l2", name: "Коллекция марок", seller: "Иван Петров", status: "Ожидает утверждения" },
  ]

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
            <p className="text-5xl font-bold text-primary">{auctions.filter((a) => a.status === "Активен").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Лоты на рассмотрении</CardTitle>
            <CardDescription>Лоты, ожидающие модерации</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{pendingLots.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="auctions">Аукционы</TabsTrigger>
          <TabsTrigger value="pending-lots">Лоты на рассмотрении</TabsTrigger>
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
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.status}</TableCell>
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
                    <TableHead>Лотов</TableHead>
                    <TableHead>Участников</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">{auction.title}</TableCell>
                      <TableCell>{auction.status}</TableCell>
                      <TableCell>{auction.lots}</TableCell>
                      <TableCell>{auction.participants}</TableCell>
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
        <TabsContent value="pending-lots">
          <Card>
            <CardHeader>
              <CardTitle>Модерация лотов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название лота</TableHead>
                    <TableHead>Продавец</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.name}</TableCell>
                      <TableCell>{lot.seller}</TableCell>
                      <TableCell>{lot.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 bg-transparent">
                          Одобрить
                        </Button>
                        <Button variant="destructive" size="sm">
                          Отклонить
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
