"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Gavel, Heart, TrendingUp } from "lucide-react"
import { createClient } from "@/supabase/client"
import { FavoriteButton } from "@/components/favorite-button"

interface Lot {
  id: string
  name: string
  description: string
  initial_price: number
  current_bid: number
  image_urls: string[] | null
  auction_id: string
  auctions: {
    id: string
    title: string
    start_time: string
    is_live: boolean
  } | null
}

interface Bid {
  id: string
  amount: number
  created_at: string
  is_winning: boolean
  lots: {
    id: string
    name: string
    current_bid: number
    image_urls: string[] | null
    auction_id: string
    auctions: {
      id: string
      title: string
      is_live: boolean
    } | null
  }
}

export default function BuyerDashboardPage() {
  const [favoriteLots, setFavoriteLots] = useState<Lot[]>([])
  const [myBids, setMyBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setError("Пользователь не авторизован")
          return
        }

        // Fetch favorite lots
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("user_favorites")
          .select(`
            lot_id,
            lots (
              id,
              name,
              description,
              initial_price,
              current_bid,
              image_urls,
              auction_id,
              auctions (
                id,
                title,
                start_time,
                is_live
              )
            )
          `)
          .eq("user_id", user.id)

        if (favoritesError) throw favoritesError

        const favorites = favoritesData?.map((f) => f.lots).filter(Boolean) as Lot[]

        setFavoriteLots(favorites || [])

        // Fetch user's bids
        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select(`
            id,
            amount,
            created_at,
            lots (
              id,
              name,
              current_bid,
              image_urls,
              auction_id,
              auctions (
                id,
                title,
                is_live
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (bidsError) throw bidsError

        // Determine if each bid is winning
        const bidsWithWinningStatus = bidsData?.map((bid) => ({
          ...bid,
          is_winning: bid.amount === bid.lots.current_bid,
        })) as Bid[]

        setMyBids(bidsWithWinningStatus || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Ошибка загрузки данных")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleFavoriteToggleSuccess = (lotId: string, newIsFavorited: boolean) => {
    if (!newIsFavorited) {
      // Remove from favorites list immediately
      setFavoriteLots((prev) => prev.filter((lot) => lot.id !== lotId))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Личный кабинет покупателя</h1>
        <p className="text-muted-foreground">Управляйте своими ставками и избранными лотами</p>
      </div>

      <Tabs defaultValue="favorites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Избранные лоты ({favoriteLots.length})
          </TabsTrigger>
          <TabsTrigger value="bids" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Мои ставки ({myBids.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Избранные лоты
              </CardTitle>
              <CardDescription>Лоты, которые вы добавили в избранное</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteLots.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Нет избранных лотов</h3>
                  <p className="text-muted-foreground mb-4">Добавьте лоты в избранное, чтобы легко находить их позже</p>
                  <Link href="/auctions">
                    <Button>Просмотреть аукционы</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteLots.map((lot) => (
                    <Card key={lot.id} className="overflow-hidden">
                      <div className="relative">
                        <Image
                          src={lot.image_urls?.[0] || "/placeholder.svg"}
                          alt={lot.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <FavoriteButton
                            lotId={lot.id}
                            initialIsFavorited={true}
                            onToggleSuccess={handleFavoriteToggleSuccess}
                          />
                        </div>
                        {lot.auctions?.is_live && (
                          <Badge className="absolute top-2 left-2 bg-green-500">
                            <Gavel className="w-3 h-3 mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{lot.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lot.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Стартовая цена:</span>
                            <span>{lot.initial_price.toLocaleString("ru-RU")} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Текущая ставка:</span>
                            <span className="font-bold text-primary">{lot.current_bid.toLocaleString("ru-RU")} ₽</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link href={`/lots/${lot.id}`} className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              Подробнее
                            </Button>
                          </Link>
                          {lot.auctions?.is_live && (
                            <Link href={`/live-auction/${lot.auction_id}`}>
                              <Button className="bg-green-600 hover:bg-green-700">
                                <Gavel className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Мои ставки
              </CardTitle>
              <CardDescription>История ваших ставок и их текущий статус</CardDescription>
            </CardHeader>
            <CardContent>
              {myBids.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Нет ставок</h3>
                  <p className="text-muted-foreground mb-4">Вы еще не делали ставки на аукционах</p>
                  <Link href="/auctions">
                    <Button>Найти лоты</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBids.map((bid) => (
                    <Card key={bid.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Image
                            src={bid.lots.image_urls?.[0] || "/placeholder.svg"}
                            alt={bid.lots.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{bid.lots.name}</h3>
                              <div className="flex items-center gap-2">
                                {bid.is_winning ? (
                                  <Badge className="bg-green-500">Лидирую</Badge>
                                ) : (
                                  <Badge variant="outline">Перебили</Badge>
                                )}
                                {bid.lots.auctions?.is_live && (
                                  <Badge className="bg-blue-500">
                                    <Gavel className="w-3 h-3 mr-1" />
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Моя ставка:</span>
                                <p className="font-semibold">{bid.amount.toLocaleString("ru-RU")} ₽</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Текущая ставка:</span>
                                <p className="font-semibold">{bid.lots.current_bid.toLocaleString("ru-RU")} ₽</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(bid.created_at).toLocaleString("ru-RU")}
                              </div>
                              <span>Аукцион: {bid.lots.auctions?.title}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Link href={`/lots/${bid.lots.id}`}>
                                <Button variant="outline" size="sm">
                                  Подробнее о лоте
                                </Button>
                              </Link>
                              {bid.lots.auctions?.is_live && (
                                <Link href={`/live-auction/${bid.lots.auction_id}`}>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <Gavel className="w-3 h-3 mr-1" />К торгам
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
