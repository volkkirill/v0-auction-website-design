"use client"

import type React from "react"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react" // Import Loader2 for spinner
import { upsertAuction, upsertLot } from "@/app/actions/auction-house-management"
import { uploadImage } from "@/app/actions/image-upload"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateAuctionPage() {
  const [lots, setLots] = useState<any[]>([])
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [auctionImageFile, setAuctionImageFile] = useState<File | null>(null)
  const [auctionImageUrl, setAuctionImageUrl] = useState<string | null>(null)
  const [isDraft, setIsDraft] = useState(false)

  const [auctionState, auctionAction, isAuctionPending] = useActionState(upsertAuction, { error: null, success: false })
  const [lotState, lotAction, isLotPending] = useActionState(upsertLot, { error: null, success: false })
  const [uploadState, uploadAction, isUploadPending] = useActionState(uploadImage, {
    error: null,
    url: null,
    success: false,
  }) // Added success to initial state

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
          router.push("/dashboard/auction-house")
        }
      } else {
        console.error("Error fetching user:", userError)
        router.push("/auth/sign-in")
      }
      setLoading(false)
    }
    fetchAuctionHouseId()
  }, [supabase, router])

  const handleAuctionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAuctionImageFile(file)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "auction_images")
      const result = await uploadAction(formData)
      if (result.success && result.url) {
        // Check result.success and result.url
        setAuctionImageUrl(result.url)
      } else {
        alert(result.error || "Ошибка загрузки изображения аукциона.")
      }
    }
  }

  const addLot = () => {
    setLots([...lots, { name: "", description: "", initial_price: "", image_files: [], image_urls: [] }])
  }

  const updateLot = (index: number, field: string, value: any) => {
    const newLots = [...lots]
    newLots[index][field] = value
    setLots(newLots)
  }

  const handleLotImageUpload = async (lotIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "lot_images")
      const result = await uploadAction(formData)
      if (result.success && result.url) {
        // Check result.success and result.url
        const newLots = [...lots]
        newLots[lotIndex].image_urls = [result.url] // Assuming one image per lot for now
        setLots(newLots)
      } else {
        alert(result.error || "Ошибка загрузки изображения лота.")
      }
    }
  }

  const removeLot = (index: number) => {
    setLots(lots.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission

    if (!auctionHouseId) {
      alert("Ошибка: Не удалось определить аукционный дом.")
      return
    }

    if (lots.length === 0) {
      alert("Пожалуйста, добавьте хотя бы один лот к аукциону.")
      return
    }

    if (!auctionImageUrl && !isDraft) {
      alert("Пожалуйста, загрузите изображение для аукциона или сохраните как черновик.")
      return
    }

    // Create FormData for auction
    const auctionFormData = new FormData(event.currentTarget)
    auctionFormData.append("auctionHouseId", auctionHouseId)
    auctionFormData.append("image_url", auctionImageUrl || "") // Use uploaded URL
    auctionFormData.append("status", isDraft ? "draft" : "upcoming") // Set status based on checkbox

    const auctionResult = await auctionAction(auctionFormData)

    if (auctionResult.error) {
      alert(`Ошибка создания аукциона: ${auctionResult.error}`)
      return
    }

    // For each lot, call upsertLot
    for (const lot of lots) {
      const lotFormData = new FormData()
      lotFormData.append("auctionId", auctionResult.auctionId) // Use the actual auctionId returned
      lotFormData.append("name", lot.name)
      lotFormData.append("description", lot.description)
      lotFormData.append("initial_price", String(lot.initial_price))
      lotFormData.append("image_urls", JSON.stringify(lot.image_urls)) // Pass as JSON string

      console.log(`create-auction: Submitting lot ${lot.name} with image_urls:`, lot.image_urls) // LOGGING

      const lotResult = await lotAction(lotFormData)
      if (lotResult.error) {
        alert(`Ошибка создания лота ${lot.name}: ${lotResult.error}`)
        // Consider rolling back auction creation here if lots are critical
        return
      }
    }

    if (auctionResult.success) {
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
          <form onSubmit={handleSubmit}>
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
                      layout="fill"
                      objectFit="cover"
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
                    {uploadState?.error && <p className="text-red-500 text-sm">{uploadState.error}</p>}
                    {lot.image_urls?.[0] && (
                      <div className="mt-2 relative w-32 h-32">
                        <Image
                          src={lot.image_urls[0] || "/placeholder.svg"}
                          alt="Lot Preview"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addLot} className="w-full mt-4 bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Добавить лот
            </Button>

            {auctionState?.error && <p className="text-red-500 text-sm mt-4">{auctionState.error}</p>}
            {auctionState?.success && <p className="text-green-500 text-sm mt-4">Аукцион успешно создан!</p>}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
              disabled={isAuctionPending || isUploadPending || lots.length === 0}
            >
              {isAuctionPending ? "Создание аукциона..." : isDraft ? "Сохранить черновик" : "Опубликовать аукцион"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
