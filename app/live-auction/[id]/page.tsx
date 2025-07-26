"use client"

import type React from "react"

import { useEffect, useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Gavel } from "lucide-react"
import { createClient } from "@/supabase/client"
import { LotTimer } from "@/components/lot-timer"
import { BidHistory } from "@/components/bid-history"
import { FavoriteButton } from "@/components/favorite-button"
import { placeLiveBid, joinAuction, updateParticipantActivity, startNextLot } from "@/app/actions/live-auction"

interface Lot {
  id: string
  name: string
  description: string
  initial_price: number
  current_bid: number
  bid_count: number
  image_urls: string[] | null
  lot_order: number
  lot_start_time: string | null
  lot_end_time: string | null
  is_sold: boolean
  status: string
}

interface Auction {
  id: string
  title: string
  description: string
  start_time: string
  is_live: boolean
  current_lot_id: string | null
  lot_duration_minutes: number
  auction_house_id: string
}

interface AuctionHouse {
  id: string
  name: string
  logo_url: string | null
}

export default function LiveAuctionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const auctionId = params.id

  const [auction, setAuction] = useState<Auction | null>(null)
  const [auctionHouse, setAuctionHouse] = useState<AuctionHouse | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [currentLot, setCurrentLot] = useState<Lot | null>(null)
  const [participantsCount, setParticipantsCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userFavoriteLotIds, setUserFavoriteLotIds] = useState<string[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bidState, bidAction, isBidding] = useActionState(placeLiveBid, { error: null, success: false })

  const supabase = createClient()

  // Fetch initial data
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
              // Join auction
              await joinAuction(auctionId)

              // Get user favorites
              const { data: favorites } = await supabase.from("user_favorites").select("lot_id").eq("user_id", user.id)

              if (favorites) {
                setUserFavoriteLotIds(favorites.map((f) => f.lot_id))
              }
            }
          }
        }

        // Get auction details
        const { data: auctionData, error: auctionError } = await supabase
          .from("auctions")
          .select("*")
          .eq("id", auctionId)
          .single()

        if (auctionError) throw auctionError
        setAuction(auctionData)

        // Get auction house
        const { data: ahData } = await supabase
          .from("auction_houses")
          .select("id, name, logo_url")
          .eq("id", auctionData.auction_house_id)
          .single()

        if (ahData) setAuctionHouse(ahData)

        // Get lots
        const { data: lotsData, error: lotsError } = await supabase
          .from("lots")
          .select("*")
          .eq("auction_id", auctionId)
          .eq("status", "active")
          .order("lot_order", { ascending: true })

        if (lotsError) throw lotsError
        setLots(lotsData || [])

        // Set current lot
        if (auctionData.current_lot_id) {
          const current = lotsData?.find((lot) => lot.id === auctionData.current_lot_id)
          setCurrentLot(current || null)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Ошибка загрузки данных аукциона")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [auctionId, supabase])

  // Update participant activity periodically
  useEffect(() => {
    if (!userRole || userRole !== "buyer") return

    const interval = setInterval(() => {
      updateParticipantActivity(auctionId)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [auctionId, userRole])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setAuction(payload.new as Auction)

            // Update current lot if changed
            if (payload.new.current_lot_id) {
              const newCurrentLot = lots.find((lot) => lot.id === payload.new.current_lot_id)
              setCurrentLot(newCurrentLot || null)
            } else {
              setCurrentLot(null)
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lots",
        },
        (payload) => {
          const updatedLot = payload.new as Lot
          setLots((prev) => prev.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot)))

          if (currentLot && updatedLot.id === currentLot.id) {
            setCurrentLot(updatedLot)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auctionId, lots, currentLot, supabase])

  // Handle lot timer expiration
  const handleLotTimeUp = async () => {
    if (userRole === "admin" || userRole === "auction_house") {
      await startNextLot(auctionId)
    }
  }

  // Handle bid submission
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLot || !bidAmount) return

    const formData = new FormData()
    formData.append("lotId", currentLot.id)
    formData.append("bidAmount", bidAmount)

    await bidAction(formData)
    setBidAmount("")
  }

  // Quick bid buttons
  const handleQuickBid = (increment: number) => {
    if (!currentLot) return
    const newBid = currentLot.current_bid + increment
    setBidAmount(newBid.toString())
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка аукциона...</div>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Аукцион не найден"}</div>
      </div>
    )
  }

  if (!auction.is_live) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Аукцион завершен</h1>
          <p className="text-muted-foreground">Этот аукцион больше не активен.</p>
          <Button onClick={() => router.push(`/auctions/${auctionId}`)} className="mt-4">
            Вернуться к деталям аукциона
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {auctionHouse?.logo_url && (
              <Image
                src={auctionHouse.logo_url || "/placeholder.svg"}
                alt={auctionHouse.name}
                width={40}
                height={40}
                className="rounded-md"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{auctionHouse?.name || "Аукционный дом"}</h1>
              <p className="text-sm opacity-90">{auction.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{participantsCount} участников онлайн</span>
            </div>
            <Badge variant="secondary" className="bg-green-600">
              <Gavel className="w-4 h-4 mr-1" />
              LIVE
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Lots List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Лоты аукциона</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      currentLot?.id === lot.id ? "bg-green-100 border-green-300" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <Image
                        src={lot.image_urls?.[0] || "/placeholder.svg"}
                        alt={lot.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          Лот №{lot.lot_order + 1} - {lot.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Старт: {lot.initial_price.toLocaleString("ru-RU")} ₽
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-green-600">
                            {lot.current_bid.toLocaleString("ru-RU")} ₽
                          </span>
                          {currentLot?.id === lot.id ? (
                            <Badge className="bg-green-500 text-xs">Торги</Badge>
                          ) : lot.is_sold ? (
                            <Badge variant="secondary" className="text-xs">
                              Продан
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Ожидает
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Center Panel - Current Lot */}
          <Card className="lg:col-span-2">
            {currentLot ? (
              <>
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Лот №{currentLot.lot_order + 1}</CardTitle>
                      <CardTitle className="text-xl mt-1">{currentLot.name}</CardTitle>
                      <CardDescription className="mt-2">
                        Стартовая цена: {currentLot.initial_price.toLocaleString("ru-RU")} ₽
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <LotTimer endTime={currentLot.lot_end_time} onTimeUp={handleLotTimeUp} />
                      {userRole === "buyer" && (
                        <FavoriteButton
                          lotId={currentLot.id}
                          initialIsFavorited={userFavoriteLotIds.includes(currentLot.id)}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
                    <Image
                      src={currentLot.image_urls?.[0] || "/placeholder.svg"}
                      alt={currentLot.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{currentLot.description}</p>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Аукцион завершен</h3>
                  <p className="text-muted-foreground">Все лоты проданы</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Right Panel - Bidding */}
          <div className="lg:col-span-1 space-y-6">
            {currentLot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Стартовая цена</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {currentLot.current_bid.toLocaleString("ru-RU")} ₽
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Следующая от {(currentLot.current_bid + 1000).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>

                  {userRole === "buyer" && (
                    <>
                      <Separator className="my-4" />
                      <form onSubmit={handleBidSubmit} className="space-y-4">
                        <Input
                          type="number"
                          placeholder="Введите сумму"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={currentLot.current_bid + 1000}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isBidding || !bidAmount}
                        >
                          {isBidding ? "Ставка..." : "Ставка"}
                        </Button>
                      </form>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => handleQuickBid(500)} className="flex-1">
                          +500
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickBid(1000)} className="flex-1">
                          +1К
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickBid(2000)} className="flex-1">
                          +2К
                        </Button>
                      </div>

                      {bidState.error && <div className="text-red-500 text-sm mt-2">{bidState.error}</div>}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {currentLot && <BidHistory lotId={currentLot.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}
