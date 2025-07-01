"use client"

import React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { auctionHouses, images } from "@/lib/auction-data" // Import centralized data

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

  // Dummy data for a single lot
  const lot = {
    id: lotId,
    name: "Винтажные часы Rolex Daytona",
    description:
      "Редкая модель Rolex Daytona 6263 'Paul Newman' 1970 года выпуска. Часы находятся в отличном коллекционном состоянии, полностью оригинальны. Поставляются с оригинальной коробкой и документами.",
    initialPrice: 1000000, // Начальная цена в рублях (число)
    currentBid: 1500000, // Текущая ставка в рублях (число)
    bidCount: 15,
    startTime: "2025-07-20T10:00:00Z", // Дата начала торгов
    commissionRate: 0.05, // Комиссия аукционного дома (5%)
    category: "Ювелирные изделия",
    images: [images.luxuryWatch, images.luxuryWatch, images.luxuryWatch], // Using centralized images
    auction: {
      id: "1",
      title: "Аукцион №1: Коллекция редких часов",
      auctionHouse: {
        id: "ah1",
        name: auctionHouses.find((ah) => ah.id === "ah1")?.name || "Неизвестно",
      },
    },
  }

  if (!lot) {
    return <div className="container py-8 text-center">Лот не найден.</div>
  }

  const minBidIncrement = getBidIncrement(lot.currentBid)
  const currentBidWithCommission = lot.currentBid * (1 + lot.commissionRate)

  const suggestedBids = [
    lot.currentBid + minBidIncrement,
    lot.currentBid + minBidIncrement * 2,
    lot.currentBid + minBidIncrement * 5,
  ].map((bid) => bid * (1 + lot.commissionRate)) // Calculate total price for suggested bids

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Lot Images */}
        <div>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
            <Image
              src={lot.images[0] || "/placeholder.svg"}
              alt={lot.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lot.images.map((img, index) => (
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
          <h1 className="text-4xl font-bold mb-4">{lot.name}</h1>
          <p className="text-muted-foreground mb-6">{lot.description}</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Информация о ставке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">
                Начальная цена:{" "}
                <span className="font-bold text-primary">{lot.initialPrice.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg">
                Текущая ставка:{" "}
                <span className="font-bold text-primary">{lot.currentBid.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-lg">
                Комиссия аукционного дома:{" "}
                <span className="font-bold text-primary">{(lot.commissionRate * 100).toFixed(0)}%</span>
              </p>
              <p className="text-lg">
                Итоговая цена с комиссией (при выигрыше):{" "}
                <span className="font-bold text-primary">{currentBidWithCommission.toLocaleString("ru-RU")} ₽</span>
              </p>
              <p className="text-sm text-muted-foreground">Количество ставок: {lot.bidCount}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Ваша ставка"
                className="w-full"
                onFocus={() => setShowBidIncrementHint(true)}
                onBlur={() => setShowBidIncrementHint(false)}
              />
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Сделать ставку</Button>
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
                    Предлагаемые ставки (включая комиссию {lot.commissionRate * 100}%):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedBids.map((bid, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        className="bg-secondary text-secondary-foreground"
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
                <Link href={`/auctions/${lot.auction.id}`} className="font-bold text-primary hover:underline">
                  {lot.auction.title}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Аукционный дом:{" "}
                <Link
                  href={`/auction-houses/${lot.auction.auctionHouse.id}`}
                  className="font-bold text-primary hover:underline"
                >
                  {lot.auction.auctionHouse.name}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">Категория: {lot.category}</p>
              <p className="text-sm text-muted-foreground">Начало торгов: {new Date(lot.startTime).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
