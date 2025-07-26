"use client"

import type React from "react"

import { useEffect, useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Gavel, Users } from "lucide-react"
import { createClient } from "@/supabase/client"
import { FavoriteButton } from "@/components/favorite-button"
import { placeBid } from "@/app/actions/bidding"

interface Lot {
  id: string
  name: string
  description: string
  initial_price: number
  current_bid: number
  bid_count: number
  image_urls: string[] | null
  auction_id: string
  status: string
  auctions: {
    id: string
    title: string
    start_time: string
    is_live: boolean
    current_lot_id: string | null
  }
}

interface Bid {
  id: string
  amount: number
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}

export default function LotDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const lotId = params.id

  const [lot, setLot] = useState<Lot | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userFavoriteLotIds, setUserFavoriteLotIds] = useState<string[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bidState, bidAction, isBidding] = useActionState(placeBid, { error: null, success: false })

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

          if (profile) {
            setUserRole(profile.role)

            if (profile.role === "buyer") {
              const { data: favorites } = await supabase.from("user_favorites").select("lot_id").eq("user_id", user.id)

              if (favorites) {
                setUserFavoriteLotIds(favorites.map((f) => f.lot_id))
              }
            }
          }
        }

        // Get lot details
        const { data: lotData, error: lotError } = await supabase
          .from("lots")
          .select(`
            *,
            auctions (
              id,
              title,
              start_time,
              is_live,
              current_lot_id
            )
          `)
          .eq("id", lotId)
          .single()

        if (lotError) throw lotError
        setLot(lotData)

        // Get bid history
        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select(`
            id,
            amount,
            created_at,
            profiles:user_id (
              full_name
            )
          `)
          .eq("lot_id", lotId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (bidsError) throw bidsError
        setBids(bidsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Ошибка загрузки данных лота")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lotId, supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!lot) return

    const channel = supabase
      .channel(`lot-${lotId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lots",
          filter: `id=eq.${lotId}`,
        },
        (payload) => {
          setLot((prev) => (prev ? { ...prev, ...payload.new } : null))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `lot_id=eq.${lotId}`,
        },
        () => {
          // Refetch bids when new bid is inserted
          const fetchBids = async () => {
            const { data: bidsData } = await supabase
              .from("bids")
              .select(`
                id,
                amount,
                created_at,
                profiles:user_id (
                  full_name
                )
              `)
              .eq("lot_id", lotId)
              .order("created_at", { ascending: false })
              .limit(10)

            if (bidsData) setBids(bidsData)
          }
          fetchBids()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lot, lotId, supabase])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bidAmount) return

    const formData = new FormData()
    formData.append("lotId", lotId)
    formData.append("bidAmount", bidAmount)

    await bidAction(formData)

    if (bidState.success) {
      setBidAmount("")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка лота...</div>
      </div>
    )
  }

  if (error || !lot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Лот не найден"}</div>
      </div>
    )
  }

  const isLiveAuction = lot.auctions.is_live
  const isCurrentLot = lot.auctions.current_lot_id === lot.id
  const canBid = userRole === "buyer" && (!isLiveAuction || isCurrentLot)

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Lot Images and Details */}
        <div>
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden mb-6">
            <Image src={lot.image_urls?.[0] || "/placeholder.svg"} alt={lot.name} fill className="object-cover" />
            {userRole === "buyer" && (
              <div className="absolute top-4 right-4">
                <FavoriteButton
                  lotId={lot.id}
                  initialIsFavorited={userFavoriteLotIds.includes(lot.id)}
                  size="default"
                  variant="secondary"
                />
              </div>
            )}
          </div>

          {lot.image_urls && lot.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {lot.image_urls.slice(1, 5).map((url, index) => (
                <div key={index} className="relative h-20 rounded-md overflow-hidden">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`${lot.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lot Info and Bidding */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{lot.name}</CardTitle>
                  <CardDescription className="mt-2">
                    Аукцион:{" "}
                    <Link href={`/auctions/${lot.auctions.id}`} className="text-primary hover:underline">
                      {lot.auctions.title}
                    </Link>
                  </CardDescription>
                </div>
                {isLiveAuction && (
                  <Badge className="bg-green-500">
                    <Gavel className="w-4 h-4 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">{lot.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Стартовая цена</p>
                  <p className="text-lg font-semibold">{lot.initial_price.toLocaleString("ru-RU")} ₽</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Текущая ставка</p>
                  <p className="text-2xl font-bold text-primary">{lot.current_bid.toLocaleString("ru-RU")} ₽</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{lot.bid_count} ставок</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Начало: {new Date(lot.auctions.start_time).toLocaleString("ru-RU")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Section */}
          {canBid ? (
            <Card>
              <CardHeader>
                <CardTitle>Сделать ставку</CardTitle>
                {isLiveAuction && !isCurrentLot && (
                  <CardDescription className="text-orange-600">
                    Этот лот сейчас не активен в живом аукционе
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Введите сумму ставки"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={lot.current_bid + 1000}
                      disabled={isLiveAuction && !isCurrentLot}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Минимальная ставка: {(lot.current_bid + 1000).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isBidding || !bidAmount || (isLiveAuction && !isCurrentLot)}
                  >
                    {isBidding ? "Обработка..." : "Сделать ставку"}
                  </Button>
                </form>

                {bidState.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{bidState.error}</p>
                  </div>
                )}

                {bidState.success && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm">Ставка успешно размещена!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : isLiveAuction ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Живой аукцион</h3>
                  <p className="text-muted-foreground mb-4">
                    Этот лот участвует в живом аукционе. Присоединяйтесь к торгам!
                  </p>
                  <Link href={`/live-auction/${lot.auction_id}`}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Gavel className="w-4 h-4 mr-2" />
                      Перейти к торгам
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : userRole !== "buyer" ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Только зарегистрированные покупатели могут делать ставки</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Bid History */}
          <Card>
            <CardHeader>
              <CardTitle>История ставок</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">Ставок пока нет</div>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div key={bid.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{bid.profiles?.full_name || `Участник ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bid.created_at).toLocaleString("ru-RU")}
                        </p>
                      </div>
                      <p className="font-bold text-lg">{bid.amount.toLocaleString("ru-RU")} ₽</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
