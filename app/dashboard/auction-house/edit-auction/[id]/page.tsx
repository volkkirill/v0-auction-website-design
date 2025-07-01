"use client"

import type React from "react"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2 } from "lucide-react" // Import Loader2 for spinner
import { upsertAuction, upsertLot, updateLotStatus, deleteLot } from "@/app/actions/auction-house-management"
import { uploadImage } from "@/app/actions/image-upload"
import { fetchAuctionByIdForClient, fetchLotsByAuctionIdForClient } from "@/app/actions/data-fetching"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditAuctionPage({ params }: { params: { id: string } }) {
  const auctionId = params.id
  const [auction, setAuction] = useState<any>(null)
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
  const [lotStatusState, lotStatusAction, isLotStatusPending] = useActionState(updateLotStatus, {
    error: null,
    success: false,
  })
  const [deleteLotState, deleteLotAction, isDeleteLotPending] = useActionState(deleteLot, {
    error: null,
    success: false,
  })

  const router = useRouter()
  const supabase = createClient()

  const fetchData = async () => {
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

        const fetchedAuction = await fetchAuctionByIdForClient(auctionId)
        if (fetchedAuction && fetchedAuction.auction_house_id === profile.auction_house_id) {
          setAuction(fetchedAuction)
          setAuctionImageUrl(fetchedAuction.image_url)
          setIsDraft(fetchedAuction.status === "draft")

          const fetchedLots = await fetchLotsByAuctionIdForClient(auctionId, true) // Include removed lots for editing
          setLots(fetchedLots)
        } else {
          console.error("Auction not found or not owned by this auction house.")
          router.push("/dashboard/auction-house")
        }
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

  useEffect(() => {
    fetchData()
  }, [supabase, router, auctionId])

  // Re-fetch data on successful action
  useEffect(() => {
    if (
      auctionState.success ||
      lotState.success ||
      uploadState.success ||
      lotStatusState.success ||
      deleteLotState.success
    ) {
      fetchData()
    }
  }, [auctionState.success, lotState.success, uploadState.success, lotStatusState.success, deleteLotState.success])

  const handleAuctionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAuctionImageFile(file)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "auction_images")
      const result = await uploadAction(formData)
      console.log("Auction image upload result:", result) // NEW LOG
      if (result.success && result.url && result.url.length > 0) {
        // Added result.url.length > 0
        setAuctionImageUrl(result.url)
      } else {
        alert(result.error || "Ошибка загрузки изображения аукциона: URL не получен или пуст.")
      }
    }
  }

  const addLot = () => {
    setLots([...lots, { name: "", description: "", initial_price: "", image_urls: [], is_new: true }]) // Mark as new
  }

  const updateLotField = (index: number, field: string, value: any) => {
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
      console.log("Lot image upload result:", result) // NEW LOG
      if (result.success && result.url && result.url.length > 0) {
        // Added result.url.length > 0
        const newLots = [...lots]
        newLots[lotIndex].image_urls = [result.url]
        setLots(newLots)
      } else {
        alert(result.error || "Ошибка загрузки изображения лота: URL не получен или пуст.")
      }
    }
  }

  const removeLot = async (index: number, lotId: string | undefined) => {
    if (lotId && confirm("Вы уверены, что хотите удалить этот лот из базы данных? Это действие необратимо.")) {
      const formData = new FormData()
      formData.append("lotId", lotId)
      await deleteLotAction(formData)
    } else if (!lotId) {
      // If it's a new lot not yet saved to DB, just remove from state
      setLots(lots.filter((_, i) => i !== index))
    }
  }

  const handleAuctionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!auctionHouseId || !auction) {
      alert("Ошибка: Не удалось определить аукционный дом или аукцион.")
      return
    }

    if (!auctionImageUrl && !isDraft) {
      alert("Пожалуйста, загрузите изображение для аукциона или сохраните как черновик.")
      return
    }

    const auctionFormData = new FormData(event.currentTarget)
    auctionFormData.append("auctionId", auction.id)
    auctionFormData.append("auctionHouseId", auctionHouseId)
    auctionFormData.append("image_url", auctionImageUrl || "")
    auctionFormData.append("status", isDraft ? "draft" : "upcoming")

    const result = await auctionAction(auctionFormData)
    if (result.error) {
      alert(`Ошибка обновления аукциона: ${result.error}`)
    } else if (result.success) {
      alert("Аукцион успешно обновлен!")
      // No redirect, stay on page to allow lot editing
    }
  }

  const handleLotSubmit = async (lot: any, index: number) => {
    if (!auction || !auctionHouseId) {
      alert("Ошибка: Не удалось определить аукцион или аукционный дом.")
      return
    }

    const lotFormData = new FormData()
    if (lot.id) {
      lotFormData.append("lotId", lot.id) // For updating existing lot
    }
    lotFormData.append("auctionId", auction.id)
    lotFormData.append("name", lot.name)
    lotFormData.append("description", lot.description)
    lotFormData.append("initial_price", String(lot.initial_price))
    lotFormData.append("image_urls", JSON.stringify(lot.image_urls))

    console.log(`edit-auction (Client): Submitting lot ${lot.name} with image_urls:`, lot.image_urls) // LOGGING
    console.log(`edit-auction (Client): Stringified image_urls:`, JSON.stringify(lot.image_urls)) // LOGGING

    const result = await lotAction(lotFormData)
    if (result.error) {
      alert(`Ошибка сохранения лота ${lot.name}: ${result.error}`)
    } else if (result.success) {
      alert(`Лот ${lot.name} успешно сохранен!`)
    }
  }

  const handleToggleLotStatus = async (lotId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "removed" : "active"
    const formData = new FormData()
    formData.append("lotId", lotId)
    formData.append("status", newStatus)
    await lotStatusAction(formData)
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка аукциона...</div>
  }

  if (!auction) {
    return (
      <div className="container py-8 text-center">Аукцион не найден или у вас нет прав для его редактирования.</div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Редактировать аукцион: {auction.title}</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Информация об аукционе</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuctionSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название аукциона</Label>
                <Input id="title" name="title" type="text" defaultValue={auction.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" name="description" rows={3} defaultValue={auction.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Дата и время начала</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  defaultValue={auction.start_time.substring(0, 16)} // Format for datetime-local input
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select name="category" defaultValue={auction.category} required>
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

            {auctionState?.error && <p className="text-red-500 text-sm mt-4">{auctionState.error}</p>}
            {auctionState?.success && <p className="text-green-500 text-sm mt-4">Аукцион успешно обновлен!</p>}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
              disabled={isAuctionPending || isUploadPending}
            >
              {isAuctionPending ? "Обновление аукциона..." : "Сохранить изменения аукциона"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-8 mb-4">Лоты аукциона</h2>
      {lots.map((lot, index) => (
        <Card key={lot.id || `new-${index}`} className="mb-4 p-4 border border-border">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg">
              Лот #{index + 1}{" "}
              {lot.status === "removed" && <span className="text-red-500 text-sm">(Снят с продажи)</span>}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLotSubmit(lot, index)}
                disabled={isLotPending || isUploadPending}
              >
                Сохранить лот
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleLotStatus(lot.id, lot.status)}
                disabled={isLotStatusPending}
              >
                {lot.status === "active" ? "Снять с продажи" : "Вернуть в продажу"}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeLot(index, lot.id)}
                disabled={isDeleteLotPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor={`lot-name-${index}`}>Название лота</Label>
              <Input
                id={`lot-name-${index}`}
                type="text"
                value={lot.name}
                onChange={(e) => updateLotField(index, "name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lot-description-${index}`}>Описание лота</Label>
              <Textarea
                id={`lot-description-${index}`}
                rows={2}
                value={lot.description}
                onChange={(e) => updateLotField(index, "description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lot-initial-price-${index}`}>Начальная цена</Label>
              <Input
                id={`lot-initial-price-${index}`}
                type="number"
                value={lot.initial_price}
                onChange={(e) => updateLotField(index, "initial_price", Number.parseFloat(e.target.value) || 0)}
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
    </div>
  )
}
