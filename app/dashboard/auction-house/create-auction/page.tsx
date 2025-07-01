"use client"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { createAuctionAndLots } from "./action" // New action for creating auction and lots
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"

export default function CreateAuctionPage() {
  const [lots, setLots] = useState<any[]>([])
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [state, action, isPending] = useActionState(createAuctionAndLots, { error: null, success: false })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAuctionHouseId = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (user && !userError) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("auction_house_id, role")
          .eq("id", user.id)
          .single()

        if (profile && profile.role === "auction_house" && profile.auction_house_id && !profileError) {
          setAuctionHouseId(profile.auction_house_id)
        } else {
          console.error("User is not an auction house or profile not found.")
          router.push("/dashboard/auction-house") // Redirect if not authorized
        }
      } else {
        console.error("Error fetching user:", userError)
        router.push("/auth/sign-in") // Redirect to login if not authenticated
      }
      setLoading(false)
    }
    fetchAuctionHouseId()
  }, [supabase, router])

  const addLot = () => {
    setLots([...lots, { name: "", description: "", initial_price: "", image_urls: [""] }])
  }

  const updateLot = (index: number, field: string, value: any) => {
    const newLots = [...lots]
    if (field === "image_urls") {
      newLots[index][field] = [value] // Store as array of one URL for now
    } else {
      newLots[index][field] = value
    }
    setLots(newLots)
  }

  const removeLot = (index: number) => {
    setLots(lots.filter((_, i) => i !== index))
  }

  const handleSubmit = async (formData: FormData) => {
    if (!auctionHouseId) {
      alert("Ошибка: Не удалось определить аукционный дом.")
      return
    }

    if (lots.length === 0) {
      alert("Пожалуйста, добавьте хотя бы один лот к аукциону.")
      return
    }

    // Append lots data to formData
    formData.append("lotsData", JSON.stringify(lots))
    formData.append("auctionHouseId", auctionHouseId)

    await action(formData)
    if (state.success) {
      router.push("/dashboard/auction-house") // Redirect on success
    }
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка формы...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Создать новый аукцион</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Информация об аукционе</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название аукциона</Label>
                <Input id="title" name="title" type="text" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Дата и время начала</Label>
                <Input id="start_time" name="start_time" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Искусство">Искусство</SelectItem>
                    <SelectItem value="Коллекционирование">Коллекционирование</SelectItem>
                    <SelectItem value="Автомобили">Автомобили</SelectItem>
                    <SelectItem value="Ювелирные изделия">Ювелирные изделия</SelectItem>
                    <SelectItem value="Антиквариат">Антиквариат</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL изображения аукциона</Label>
                <Input id="image_url" name="image_url" type="url" placeholder="https://example.com/auction.jpg" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Лоты аукциона</h2>
            {lots.map((lot, index) => (
              <Card key={index} className="mb-4 p-4 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Лот #{index + 1}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeLot(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`lot-name-${index}`}>Название лота</Label>
                    <Input
                      id={`lot-name-${index}`}
                      type="text"
                      value={lot.name}
                      onChange={(e) => updateLot(index, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lot-description-${index}`}>Описание лота</Label>
                    <Textarea
                      id={`lot-description-${index}`}
                      rows={2}
                      value={lot.description}
                      onChange={(e) => updateLot(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lot-initial-price-${index}`}>Начальная цена</Label>
                    <Input
                      id={`lot-initial-price-${index}`}
                      type="number"
                      value={lot.initial_price}
                      onChange={(e) => updateLot(index, "initial_price", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`lot-image-url-${index}`}>URL изображения лота</Label>
                    <Input
                      id={`lot-image-url-${index}`}
                      type="url"
                      value={lot.image_urls?.[0] || ""}
                      onChange={(e) => updateLot(index, "image_urls", e.target.value)}
                      placeholder="https://example.com/lot.jpg"
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addLot} className="w-full mt-4 bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Добавить лот
            </Button>

            {state?.error && <p className="text-red-500 text-sm mt-4">{state.error}</p>}
            {state?.success && <p className="text-green-500 text-sm mt-4">Аукцион успешно создан!</p>}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
              disabled={isPending || lots.length === 0}
            >
              {isPending ? "Создание аукциона..." : "Опубликовать аукцион"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
