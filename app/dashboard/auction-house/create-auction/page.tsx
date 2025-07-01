"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2, Save } from "lucide-react" // Import Loader2 and Save for spinner
import { upsertAuction, upsertLot } from "@/app/actions/auction-house-management"
import { uploadImage } from "@/app/actions/image-upload"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchAuctionHouseByIdForClient } from "@/app/actions/data-fetching" // Import to check AH status

export default function CreateAuctionPage() {
  const [lots, setLots] = useState<any[]>([])
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [auctionHouseStatus, setAuctionHouseStatus] = useState<string | null>(null) // New state for AH status
  const [loading, setLoading] = useState(true)
  const [auctionImageFile, setAuctionImageFile] = useState<File | null>(null)
  const [auctionImageUrl, setAuctionImageUrl] = useState<string | null>(null)
  const [isDraft, setIsDraft] = useState(false)
  const [auction, setAuction] = useState<any | null>(null) // Declare the auction variable

  const [auctionState, auctionAction, isAuctionPending] = useActionState(upsertAuction, { error: null, success: false })
  const [lotState, lotAction, isLotPending] = useActionState(upsertLot, {
    error: null,
    success: false,
    lotIndex: -1,
  }) // Added lotIndex to track which lot is being saved
  const [uploadState, uploadAction, isUploadPending] = useActionState(uploadImage, {
    error: null,
    url: null,
    success: false,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAuctionHouseData = async () => {
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
          const ah = await fetchAuctionHouseByIdForClient(profile.auction_house_id)
          if (ah) {
            setAuctionHouseStatus(ah.status)
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
    fetchAuctionHouseData()
  }, [supabase, router])

  // Effect to handle lot save success/error feedback
  useEffect(() => {
    if (lotState.lotIndex !== -1) {
      if (lotState.success) {
        // Optionally, update the lot in state to mark it as saved or clear pending status
        // For now, we rely on the user clicking "Save" for each lot.
        // If we were to auto-save, we'd need more complex state management here.
      } else if (lotState.error) {
        alert(`Ошибка сохранения лота #${lotState.lotIndex + 1}: ${lotState.error}`)
      }
    }
  }, [lotState])

  const handleAuctionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAuctionImageFile(file)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "auction_images")
      const result = await uploadAction(formData)
      console.log("Auction image upload result:", result)
      if (result.success && result.url && result.url.length > 0) {
        setAuctionImageUrl(result.url)
      } else {
        alert(result.error || "Ошибка загрузки изображения аукциона: URL не получен или пуст.")
      }
    }
  }

  const addLot = () => {
    setLots([...lots, { name: "", description: "", initial_price: "", image_urls: [], is_new: true, is_saving: false }])
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
      console.log("Lot image upload result:", result)
      if (result.success && result.url && result.url.length > 0) {
        const newLots = [...lots]
        newLots[lotIndex].image_urls = [result.url]
        setLots(newLots)
      } else {
        alert(result.error || "Ошибка загрузки изображения лота: URL не получен или пуст.")
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

    if (auctionHouseStatus !== "approved") {
      alert("Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете создавать аукционы.")
      return
    }

    if (lots.length === 0 && !isDraft) {
      alert("Пожалуйста, добавьте хотя бы один лот к аукциону или сохраните как черновик.")
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

    setAuction(auctionResult.auction) // Set the auction variable

    // For each lot, call upsertLot
    // Note: For new auctions, lots are saved *after* the auction is created.
    // For existing auctions, lots can be saved individually.
    // This loop is for initial creation of lots with the auction.
    for (const lot of lots) {
      const lotFormData = new FormData()
      lotFormData.append("auctionId", auctionResult.auctionId || "DUMMY_AUCTION_ID") // Use the actual auctionId returned
      lotFormData.append("name", lot.name)
      lotFormData.append("description", lot.description)
      lotFormData.append("initial_price", String(lot.initial_price))
      lotFormData.append("image_urls", JSON.stringify(lot.image_urls))

      console.log(`create-auction (Client): Submitting lot ${lot.name} with image_urls:`, lot.image_urls)
      console.log(`create-auction (Client): Stringified image_urls:`, JSON.stringify(lot.image_urls))

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

  const handleLotSave = async (lot: any, index: number) => {
    if (!auctionHouseId) {
      alert("Ошибка: Не удалось определить аукционный дом.")
      return
    }
    if (!lot.name || !lot.initial_price) {
      alert("Пожалуйста, заполните название и начальную цену лота.")
      return
    }
    if (lot.image_urls.length === 0) {
      alert("Пожалуйста, загрузите изображение для лота.")
      return
    }

    // Temporarily set saving state for this specific lot
    const newLots = [...lots]
    newLots[index].is_saving = true
    setLots(newLots)

    const lotFormData = new FormData()
    if (lot.id) {
      lotFormData.append("lotId", lot.id) // For updating existing lot
    }
    // For new auction creation, auctionId is not yet available when lots are added to state.
    // This `handleLotSave` is primarily for *editing* lots after auction is created.
    // For initial creation, lots are saved in the main `handleSubmit`.
    // This function might be less relevant for `create-auction` page unless we allow saving individual lots before auction creation.
    // For now, I'll assume this is for a future "save individual lot" feature or for `edit-auction` page.
    // For `create-auction`, the lots are saved in the main `handleSubmit`.
    // I'll keep this function structure for consistency with `edit-auction` but note its limited use here.
    lotFormData.append("auctionId", auction?.id || "DUMMY_AUCTION_ID") // Placeholder for create page
    lotFormData.append("name", lot.name)
    lotFormData.append("description", lot.description)
    lotFormData.append("initial_price", String(lot.initial_price))
    lotFormData.append("image_urls", JSON.stringify(lot.image_urls))

    const result = await lotAction(lotFormData)

    // Reset saving state
    newLots[index].is_saving = false
    setLots(newLots)

    if (result.error) {
      alert(`Ошибка сохранения лота #${index + 1}: ${result.error}`)
    } else if (result.success) {
      alert(`Лот #${index + 1} успешно сохранен!`)
      // If it was a new lot, it might now have an ID from the DB, but we don't re-fetch here.
      // For `create-auction`, the full form submission handles the DB save.
    }
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка формы...</div>
  }

  if (auctionHouseStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Доступ ограничен</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете создавать новые аукционы до
          одобрения.
        </p>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, ожидайте одобрения. Вы получите уведомление по электронной почте.
        </p>
        <Link href="/dashboard/auction-house" passHref>
          <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            Вернуться в панель управления
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Left Column: Auction Information */}
        <Card className="md:w-1/2 lg:w-1/3 flex-shrink-0">
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
                  <Checkbox
                    id="is-draft"
                    checked={isDraft}
                    onCheckedChange={(checked: boolean) => setIsDraft(checked)}
                  />
                  <Label htmlFor="is-draft">Сохранить как черновик (не публиковать сразу)</Label>
                </div>
              </div>

              {auctionState?.error && <p className="text-red-500 text-sm mt-4">{auctionState.error}</p>}
              {auctionState?.success && <p className="text-green-500 text-sm mt-4">Аукцион успешно создан!</p>}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-8"
                disabled={isAuctionPending || isUploadPending || (lots.length === 0 && !isDraft)}
              >
                {isAuctionPending ? "Создание аукциона..." : isDraft ? "Сохранить черновик" : "Опубликовать аукцион"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Lots */}
        <div className="md:flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Лоты аукциона ({lots.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1">
            {lots.map((lot, index) => (
              <Card key={index} className="p-2 border border-border flex flex-col aspect-square">
                <div className="relative w-full h-24 mb-2">
                  <Image
                    src={lot.image_urls?.[0] || "/placeholder.svg"}
                    alt="Lot Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-sm truncate">{lot.name || "Новый лот"}</h3>
                  <p className="text-xs text-muted-foreground">Нач. цена: {lot.initial_price || 0} ₽</p>
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleLotSave(lot, index)}
                      disabled={isLotPending || isUploadPending || lot.is_saving}
                      className="h-7 w-7"
                      title="Сохранить лот"
                    >
                      {lot.is_saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLot(index)}
                      disabled={isLotPending || isUploadPending || lot.is_saving}
                      className="h-7 w-7"
                      title="Удалить лот"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Hidden inputs for lot details */}
                <Input type="hidden" name={`lots[${index}].name`} value={lot.name} />
                <Input type="hidden" name={`lots[${index}].description`} value={lot.description} />
                <Input type="hidden" name={`lots[${index}].initial_price`} value={lot.initial_price} />
                <Input type="hidden" name={`lots[${index}].image_urls`} value={JSON.stringify(lot.image_urls)} />
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addLot}
              className="flex flex-col items-center justify-center aspect-square p-2 border-2 border-dashed border-border text-muted-foreground hover:bg-muted/50 transition-colors bg-transparent"
            >
              <Plus className="h-8 w-8 mb-1" />
              <span>Добавить лот</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
