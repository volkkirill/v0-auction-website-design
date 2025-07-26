"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { fetchAllAuctionsForClient, fetchAuctionHousesForClient } from "@/app/actions/data-fetching"
import { Clock, Users, Gavel } from "lucide-react"

// Helper function to format time remaining until auction starts
const formatTimeRemaining = (startTime: string) => {
  const now = new Date().getTime()
  const start = new Date(startTime).getTime()
  const difference = start - now

  if (difference <= 0) {
    return "Начался!"
  }

  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
  if (difference > threeDaysInMs) {
    return null // Return null to hide the badge if more than 3 days remain
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  let timeString = ""
  if (days > 0) timeString += `${days}д `
  if (hours > 0) timeString += `${hours}ч `
  timeString += `${minutes}м`

  return timeString.trim()
}

// Helper function to format display time
const formatDisplayTime = (utcDateString: string) => {
  if (!utcDateString) return ""
  const date = new Date(utcDateString)
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AuctionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [auctions, setAuctions] = useState<any[]>([])
  const [auctionHouses, setAuctionHouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const fetchedAuctions = await fetchAllAuctionsForClient()
        const fetchedAuctionHouses = await fetchAuctionHousesForClient()
        setAuctions(fetchedAuctions)
        setAuctionHouses(fetchedAuctionHouses)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAuctions = auctions
    .filter((auction) => {
      const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter
      // Only show 'closed' auctions on the auction house page, not here
      const matchesStatus =
        statusFilter === "all"
          ? auction.status !== "closed" && auction.status !== "draft"
          : auction.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      // Default sort by date (start_time)
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    })

  const categories = Array.from(new Set(auctions.map((auction) => auction.category)))

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    live: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  }

  const statusLabels = {
    upcoming: "Предстоящий",
    active: "Активный",
    live: "Идет торг",
    completed: "Завершен",
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка аукционов...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Все аукционы</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1 bg-card p-6 rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-semibold mb-6">Фильтры</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Категории</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={categoryFilter === category}
                    onCheckedChange={() => setCategoryFilter(categoryFilter === category ? "all" : category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Статус</h3>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="upcoming">Предстоящие</SelectItem>
                <SelectItem value="live">Живые торги</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
              setStatusFilter("all")
            }}
          >
            Сбросить фильтры
          </Button>
        </div>

        {/* Auction Listings */}
        <div className="md:col-span-3">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Поиск по названию аукциона..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground border-border focus:ring-ring focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.length > 0 ? (
              filteredAuctions.map((auction) => {
                const timeRemaining = formatTimeRemaining(auction.start_time)
                const auctionHouse = auctionHouses.find((ah) => ah.id === auction.auction_house_id)
                return (
                  <Card
                    key={auction.id}
                    className="bg-card text-card-foreground border-border hover:shadow-xl transition-shadow duration-300 relative flex flex-col"
                  >
                    <CardHeader className="p-0">
                      <div className="relative">
                        <Image
                          src={auction.image_url || "/placeholder.svg"}
                          alt={auction.title}
                          width={300}
                          height={200}
                          className="rounded-t-md object-cover w-full h-48"
                        />
                        {timeRemaining && (
                          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            Начнется через: {timeRemaining}
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge className={statusColors[auction.status as keyof typeof statusColors]}>
                            {statusLabels[auction.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 flex-grow">
                      <CardTitle className="text-lg font-semibold text-foreground">{auction.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {auction.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDisplayTime(auction.start_time)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Категория: {auction.category}</span>
                        </div>
                      </div>
                      {auction.commission_percentage && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Gavel className="h-4 w-4" />
                          <span>Комиссия: {auction.commission_percentage}%</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Аукционный дом:{" "}
                        <Link
                          href={`/auction-houses/${auction.auction_house_id}`}
                          className="font-bold text-primary hover:underline"
                        >
                          {auctionHouse?.name || "Неизвестно"}
                        </Link>
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href={`/auctions/${auction.id}`}>Подробнее</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <p className="text-muted-foreground col-span-full text-center">Аукционы по вашему запросу не найдены.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
