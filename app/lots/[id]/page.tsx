"use client"

import React, { useState, useEffect, useActionState } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
  fetchLotByIdForClient,
  fetchAuctionByIdForClient,
  fetchAuctionHouseByIdForClient,
} from "@/app/actions/data-fetching"
import { placeBid } from "@/app/actions/bidding"
import { useRouter } from "next/navigation"
import { FavoriteButton } from "@/components/favorite-button"
import { createClient } from "@/supabase/client"
import { fetchUserFavoriteLotIds } from "@/app/actions/favorites"

// Helper function to determine bid increment based on current price
const getBidIncrement = (currentPrice: number): number => {
  if (currentPrice < 100000) {
    return 1000 // 1,000 RUB
  } else if (currentPrice < 500000) {
    return 5000 // 5,000 RUB
  } else if (currentPrice < 1000000) {
    return 10000 // 10,000 RUB
  } else {
    return 50000 // 50,000 RUB
  }
}

export default function LotDetailsPage({ params }: { params: { id: string } }) {
  const lotId = params.id
  const [showBidIncrementHint, setShowBidIncrementHint] = useState(false)
  const [lot, setLot] = useState<any>(null)
  const [auction, setAuction] = useState<any>(null)
  const [auctionHouse, setAuctionHouse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState<number | string>("")
  const [bidState, bidAction, isBidPending] = useActionState(placeBid, { error: null, success: false })
  const [isLotFavorited, setIsLotFavorited] = useState(false) // State to pass to FavoriteButton
  const [userRole, setUserRole] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const fetchedLot = await fetchLotByIdForClient(lotId)
      setLot(fetchedLot)

      if (fetchedLot) {
        const fetchedAuction = await fetchAuctionByIdForClient(fetchedLot.auction_id)
        setAuction(fetchedAuction)
        if (fetchedAuction) {
          const fetchedAuctionHouse = await fetchAuctionHouseByIdForClient(fetchedAuction.auction_house_id)
          setAuctionHouse(fetchedAuctionHouse)
        }
        setBidAmount(fetchedLot.current_bid + getBidIncrement(fetchedLot.current_bid))
      }

      // Fetch user and favorite status
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (user && !userError) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        if (profile && !profileError) {
          setUserRole(profile.role)
          if (profile.role === "buyer") {
            const favoriteLotIds = await fetchUserFavoriteLotIds()
            setIsLotFavorited(favoriteLotIds.includes(lotId))
          }
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [lotId, supabase])

  // Re-fetch lot data if a bid was successful using router.refresh()
  useEffect(() => {
    if (bidState.success) {
      router.refresh()
    }
  }, [bidState.success, router])

  if (loading) {
    return <div className="container py-8 text-center">Загрузка лота...</div>
  }

  if (!lot || !auction || !auctionHouse) {
    return <div className="container py-8 text-center">Лот не найден.</div>
  }

  const minBidIncrement = getBidIncrement(lot.current_bid)
  const currentBidWithCommission = lot.current_bid * (1 + lot.commission_rate)

  const suggestedBids = [
    lot.current_bid + minBidIncrement,
    lot.current_bid + minBidIncrement * 2,
    lot.current_bid + minBidIncrement * 5,
  ].map((bid) => bid * (1 + lot.commission_rate))

  const handleBidSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission
    const formData = new FormData(event.currentTarget)
    formData.append("lotId", lotId)
    formData.append("bidAmount", String(bidAmount)) // Use the state value
    await bidAction(formData)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Lot Images */}
        <div>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
            <Image
              src={lot.image_urls?.[0] || "/placeholder.svg"}
              alt={lot.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lot.image_urls?.map((img: string, index: number) => (
              <div key={index} className="relative w-full h-24 rounded-md overflow-hidden cursor-pointer">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${lot.name} - ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md hover:opacity-75 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lot Details and Bidding */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">{lot.name}</h1>
            {userRole === "buyer" && (
              <FavoriteButton lotId={lot.id} initialIsFavorited={isLotFavorited} size="default" variant="outline" />
            )}
          </div>
          <p className="text-muted-foreground mb-6">{lot.description}</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Информация о ставке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">
                Начальная цена:{" "}
                <span className="font-bold text-primary">{lot.initial_price.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg">
                Текущая ставка:{" "}
                <span className="font-bold text-primary">{lot.current_bid.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg">
                Комиссия аукционного дома:{" "}
                <span className="font-bold text-primary">{(lot.commission_rate * 100).toFixed(0)}%</span>
              </p>
              <p className="text-lg">
                Итоговая цена с комиссией (при выигрыше):{" "}
                <span className="font-bold text-primary">{currentBidWithCommission.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-sm text-muted-foreground">Количество ставок: {lot.bid_count}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <form onSubmit={handleBidSubmit} className="w-full flex flex-col gap-2">
                <Input
                  type="number"
                  placeholder="Ваша ставка"
                  className="w-full"
                  name="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onFocus={() => setShowBidIncrementHint(true)}
                  onBlur={() => setShowBidIncrementHint(false)}
                  min={lot.current_bid + minBidIncrement}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isBidPending}
                >
                  {isBidPending ? "Делаем ставку..." : "Сделать ставку"}
                </Button>
                {bidState?.error && <p className="text-red-500 text-sm mt-2">{bidState.error}</p>}
                {bidState?.success && <p className="text-green-500 text-sm mt-2">Ставка успешно сделана!</p>}
              </form>
              {showBidIncrementHint && (
                <div className="mt-4 bg-accent text-accent-foreground p-4 rounded-md shadow-md w-full">
                  <p className="text-sm font-semibold mb-2">Правила шага ставки:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Текущая цена</div>
                    <div className="font-medium">Шаг ставки</div>
                    <Separator className="col-span-2" />
                    {[
                      { range: "До 100 000 ₽", increment: "1 000 ₽" },
                      { range: "От 100 000 ₽ до 500 000 ₽", increment: "5 000 ₽" },
                      { range: "От 500 000 ₽ до 1 000 000 ₽", increment: "10 000 ₽" },
                      { range: "Свыше 1 000 000 ₽", increment: "50 000 ₽" },
                    ].map((rule, index) => (
                      <React.Fragment key={index}>
                        <div>{rule.range}</div>
                        <div>{rule.increment}</div>
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-sm font-semibold mt-4 mb-2">
                    Предлагаемые ставки (включая комиссию {lot.commission_rate * 100}%):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedBids.map((bid, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        className="bg-secondary text-secondary-foreground"
                        onClick={() => setBidAmount(Math.round(bid / (1 + lot.commission_rate)))}
                      >
                        {bid.toLocaleString("ru-RU")} ₽
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Информация об аукционе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Аукцион:{" "}
                <Link href={`/auctions/${auction.id}`} className="font-bold text-primary hover:underline">
                  {auction.title}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Аукционный дом:{" "}
                <Link href={`/auction-houses/${auctionHouse.id}`} className="font-bold text-primary hover:underline">
                  {auctionHouse.name}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">Категория: {lot.category}</p>
              <p className="text-sm text-muted-foreground">
                Начало торгов: {new Date(auction.start_time).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
