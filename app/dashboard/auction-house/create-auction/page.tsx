"use client"

import type React from "react"

import { useState, useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { createAuctionAndLots } from "./action"
import { uploadImage } from "@/app/actions/image-upload"
import { fetchAuctionHouseByIdForClient } from "@/app/actions/data-fetching"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

// Функция для конвертации локального времени в UTC для сохранения
const convertToUTC = (localDateTimeString: string) => {
  if (!localDateTimeString) return ""
  const localDate = new Date(localDateTimeString)
  return localDate.toISOString()
}

export default function CreateAuctionPage() {
  const [lots, setLots] = useState([{ name: "", description: "", initial_price: "", image_urls: [] }])
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [auctionHouseStatus, setAuctionHouseStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [auctionImageFile, setAuctionImageFile] = useState<File | null>(null)
  const [auctionImageUrl, setAuctionImageUrl] = useState<string | null>(null)
  const [isDraft, setIsDraft] = useState(false)

  const [state, action, isPending] = useActionState(createAuctionAndLots, { error: null, success: false })
  const [uploadState, uploadAction, isUploadPending] = useActionState(uploadImage, {
    error: null,
    url: null,
    success: false,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
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
          const ah = await fetchAuctionHouseByIdForClient(profile.auction_house_id)
          if (ah) {
            setAuctionHouseStatus(ah.status)
          }
        } else {
          console.error("User is not an auction house or profile not found.")
          router.push("/auth/sign-in")
        }
      } else {
        console.error("Error fetching user:", userError)
        router.push("/auth/sign-in")
      }
      setLoading(false)
    }

    fetchUserData()
  }, [supabase, router])

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard/auction-house")
    }
  }, [state.success, router])

  const handleAuctionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAuctionImageFile(file)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "auction_images")

      try {
        const result = await uploadAction(formData)
        console.log("Auction image upload result:", result)
        if (result && result.success && result.url && result.url.length > 0) {
          setAuctionImageUrl(result.url)
          console.log("Image URL set to:", result.url)
        } else {
          console.error("Upload failed:", result)
          alert(result?.error || "Ошибка загрузки изображения аукциона: URL не получен или пуст.")
          setAuctionImageUrl(null)
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert("Ошибка при загрузке изображения")
        setAuctionImageUrl(null)
      }
    }
  }

  const addLot = () => {
    setLots([...lots, { name: "", description: "", initial_price: "", image_urls: [] }])
  }

  const updateLot = (index: number, field: string, value: any) => {
    const newLots = [...lots]
    newLots[index][field] = value
    setLots(newLots)
  }

  const removeLot = (index: number) => {
    if (lots.length > 1) {
      setLots(lots.filter((_, i) => i !== index))
    }
  }

  const handleLotImageUpload = async (lotIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "lot_images")

      try {
        const result = await uploadAction(formData)
        console.log("Lot image upload result:", result)
        if (result && result.success && result.url && result.url.length > 0) {
          const newLots = [...lots]
          newLots[lotIndex].image_urls = [result.url]
          setLots(newLots)
        } else {
          console.error("Lot upload failed:", result)
          alert(result?.error || "Ошибка загрузки изображения лота: URL не получен или пуст.")
        }
      } catch (error) {
        console.error("Lot upload error:", error)
        alert("Ошибка при загрузке изображения лота")
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!auctionHouseId) {
      alert("Ошибка: Не удалось определить аукционный дом.")
      return
    }

    if (auctionHouseStatus !== "approved") {
      alert("Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете создавать аукционы.")
      return
    }

    if (!auctionImageUrl && !isDraft) {
      alert("Пожалуйста, загрузите изображение для аукциона или сохраните как черновик.")
      return
    }

    // Validate lots
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i]
      if (!lot.name || !lot.initial_price) {
        alert(`Пожалуйста, заполните название и начальную цену для лота ${i + 1}.`)
        return
      }
      if (lot.image_urls.length === 0) {
        alert(`Пожалуйста, загрузите изображение для лота ${i + 1}.`)
        return
      }
    }

    const formData = new FormData(event.currentTarget)
    formData.append("auctionHouseId", auctionHouseId)
    formData.append("image_url", auctionImageUrl || "")
    formData.append("lotsData", JSON.stringify(lots))
    formData.append("status", isDraft ? "draft" : "upcoming")

    // Конвертируем локальное время в UTC перед отправкой
    const startTimeLocal = formData.get("start_time") as string
    const startTimeUTC = convertToUTC(startTimeLocal)
    formData.set("start_time", startTimeUTC)

    console.log("create-auction (Client): Submitting lots data:", lots)
    console.log("create-auction (Client): Stringified lots data:", JSON.stringify(lots))

    await action(formData)
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка...</div>
  }

  if (auctionHouseStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Доступ ограничен</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете создавать аукционы до одобрения.
        </p>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, ожидайте одобрения. Вы получите уведомление по электронной почте.
        </p>
        <Button onClick={() => router.push("/dashboard/auction-house")} className="mt-8">
          Вернуться в панель управления
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8">Создать новый аукцион</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация об аукционе</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="commission_percentage">Комиссия аукционного дома (%)</Label>
                <Input
                  id="commission_percentage"
                  name="commission_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue="5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auction-image">Изображение аукциона</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="auction-image"
                    type="file"
                    accept="image/*"
                    onChange={handleAuctionImageUpload}
                    disabled={isUploadPending}
                    className="flex-grow"
                  />
                  {isUploadPending && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
                {uploadState?.error && <p className="text-red-500 text-sm">{uploadState.error}</p>}
                {auctionImageUrl && (
                  <div className="mt-2 relative w-32 h-32">
                    <Image
                      src={auctionImageUrl || "/placeholder.svg"}
                      alt="Auction Preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="is-draft" checked={isDraft} onCheckedChange={(checked: boolean) => setIsDraft(checked)} />
                <Label htmlFor="is-draft">Сохранить как черновик (не публиковать сразу)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Лоты аукциона</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lots.map((lot, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Лот {index + 1}</h3>
                    {lots.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeLot(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
                      <Label htmlFor={`lot-description-${index}`}>Описание</Label>
                      <Textarea
                        id={`lot-description-${index}`}
                        rows={3}
                        value={lot.description}
                        onChange={(e) => updateLot(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lot-price-${index}`}>Начальная цена (₽)</Label>
                      <Input
                        id={`lot-price-${index}`}
                        type="number"
                        min="1"
                        value={lot.initial_price}
                        onChange={(e) => updateLot(index, "initial_price", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lot-image-${index}`}>Изображение лота</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`lot-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLotImageUpload(index, e)}
                          disabled={isUploadPending}
                          className="flex-grow"
                        />
                        {isUploadPending && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                      </div>
                      {lot.image_urls.length > 0 && (
                        <div className="mt-2 relative w-32 h-32">
                          <Image
                            src={lot.image_urls[0] || "/placeholder.svg"}
                            alt={`Lot ${index + 1} Preview`}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLot} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Добавить лот
              </Button>
            </div>
          </CardContent>
        </Card>

        {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending || isUploadPending}
        >
          {isPending ? "Создание аукциона..." : "Создать аукцион"}
        </Button>
      </form>
    </div>
  )
}
