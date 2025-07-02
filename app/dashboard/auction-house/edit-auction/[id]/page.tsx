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
import { Plus, Trash2, Loader2, Save } from "lucide-react" // Import Loader2 and Save for spinner
import { upsertAuction, upsertLot, updateLotStatus, deleteLot } from "@/app/actions/auction-house-management"
import { uploadImage } from "@/app/actions/image-upload"
import {
  fetchAuctionByIdForClient,
  fetchLotsByAuctionIdForClient,
  fetchAuctionHouseByIdForClient,
} from "@/app/actions/data-fetching"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation" // Import useRouter
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditAuctionPage({ params }: { params: { id: string } }) {
  const auctionId = params.id
  const [auction, setAuction] = useState<any>(null)
  const [lots, setLots] = useState<any[]>([])
  const [auctionHouseId, setAuctionHouseId] = useState<string | null>(null)
  const [auctionHouseStatus, setAuctionHouseStatus] = useState<string | null>(null) // New state for AH status
  const [loading, setLoading] = useState(true)
  const [auctionImageFile, setAuctionImageFile] = useState<File | null>(null)
  const [auctionImageUrl, setAuctionImageUrl] = useState<string | null>(null)
  const [isDraft, setIsDraft] = useState(false)

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
  const [lotStatusState, lotStatusAction, isLotStatusPending] = useActionState(updateLotStatus, {
    error: null,
    success: false,
  })
  const [deleteLotState, deleteLotAction, isDeleteLotPending] = useActionState(deleteLot, {
    error: null,
    success: false,
  })

  const router = useRouter() // Initialize useRouter
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
        const ah = await fetchAuctionHouseByIdForClient(profile.auction_house_id)
        if (ah) {
          setAuctionHouseStatus(ah.status)
        }

        const fetchedAuction = await fetchAuctionByIdForClient(auctionId)
        if (fetchedAuction && fetchedAuction.auction_house_id === profile.auction_house_id) {
          setAuction(fetchedAuction)
          setAuctionImageUrl(fetchedAuction.image_url)
          setIsDraft(fetchedAuction.status === "draft")
          // If auction is not a draft, disable the checkbox
          if (fetchedAuction.status !== "draft") {
            setIsDraft(false) // Ensure it's false if not a draft
          }

          const fetchedLots = await fetchLotsByAuctionIdForClient(auctionId, true) // Include removed lots for editing
          setLots(fetchedLots.map((lot: any) => ({ ...lot, is_saving: false }))) // Add is_saving state
        } else {
          console.error("Auction not found or not owned by this auction house.")
          router.push("/dashboard/auction-house")
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
      router.refresh() // Refresh the current page to show updated data
    }
  }, [
    auctionState.success,
    lotState.success,
    uploadState.success,
    lotStatusState.success,
    deleteLotState.success,
    router,
  ])

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
    setLots([...lots, { name: "", description: "", initial_price: "", image_urls: [], is_new: true, is_saving: false }]) // Mark as new
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

  const removeLot = async (index: number, lotId: string | undefined) => {
    if (
      lotId &&
      auction?.status === "draft" &&
      confirm("Вы уверены, что хотите удалить этот лот из базы данных? Это действие необратимо.")
    ) {
      const formData = new FormData()
      formData.append("lotId", lotId)
      await deleteLotAction(formData)
    } else if (!lotId) {
      // If it's a new lot not yet saved to DB, just remove from state
      setLots(lots.filter((_, i) => i !== index))
    } else if (auction?.status !== "draft") {
      alert("Невозможно удалить лот, так как аукцион уже опубликован. Вы можете только снять его с продажи.")
    }
  }

  const handleAuctionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!auctionHouseId || !auction) {
      alert("Ошибка: Не удалось определить аукционный дом или аукцион.")
      return
    }

    if (auctionHouseStatus !== "approved") {
      alert("Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете редактировать аукционы.")
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
      // router.refresh() is handled by the useEffect above
    }
  }

  const handleLotSave = async (lot: any, index: number) => {
    if (!auction || !auctionHouseId) {
      alert("Ошибка: Не удалось определить аукцион или аукционный дом.")
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
    lotFormData.append("auctionId", auction.id)
    lotFormData.append("name", lot.name)
    lotFormData.append("description", lot.description)
    lotFormData.append("initial_price", String(lot.initial_price))
    lotFormData.append("image_urls", JSON.stringify(lot.image_urls))

    console.log(`edit-auction (Client): Submitting lot ${lot.name} with image_urls:`, lot.image_urls)
    console.log(`edit-auction (Client): Stringified image_urls:`, JSON.stringify(lot.image_urls))

    const result = await lotAction(lotFormData)

    // Reset saving state
    newLots[index].is_saving = false
    setLots(newLots)

    if (result.error) {
      alert(`Ошибка сохранения лота ${lot.name}: ${result.error}`)
    } else if (result.success) {
      alert(`Лот ${lot.name} успешно сохранен!`)
      // router.refresh() is handled by the useEffect above
    }
  }

  const handleToggleLotStatus = async (lotId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "removed" : "active"
    const formData = new FormData()
    formData.append("lotId", lotId)
    formData.append("status", newStatus)
    await lotStatusAction(formData)
    // router.refresh() is handled by the useEffect above
  }

  if (loading) {
    return <div className="container py-8 text-center">Загрузка аукциона...</div>
  }

  if (!auction) {
    return (
      <div className="container py-8 text-center">Аукцион не найден или у вас нет прав для его редактирования.</div>
    )
  }

  if (auctionHouseStatus !== "approved") {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Доступ ограничен</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ваш аккаунт аукционного дома еще не одобрен администратором. Вы не можете редактировать аукционы до одобрения.
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
                  <Label htmlFor="commission_percentage">Комиссия аукционного дома (%)</Label>
                  <Input
                    id="commission_percentage"
                    name="commission_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={auction.commission_percentage}
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
                    disabled={auction.status !== "draft"} // Disable if not a draft
                  />
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

        {/* Right Column: Lots */}
        <div className="md:flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Лоты аукциона ({lots.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1">
            {lots.map((lot, index) => (
              <Card key={lot.id || `new-${index}`} className="p-2 border border-border flex flex-col aspect-square">
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
                    {auction?.status === "draft" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeLot(index, lot.id)}
                        disabled={isDeleteLotPending || lot.is_saving}
                        className="h-7 w-7"
                        title="Удалить лот"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {auction?.status !== "draft" && lot.status === "active" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleLotStatus(lot.id, lot.status)}
                        disabled={isLotStatusPending || lot.is_saving}
                        className="h-7 w-7"
                        title="Снять с продажи"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {auction?.status !== "draft" && lot.status === "removed" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleLotStatus(lot.id, lot.status)}
                        disabled={isLotStatusPending || lot.is_saving}
                        className="h-7 w-7"
                        title="Вернуть в продажу"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {/* Hidden inputs for lot details (for full form submission if needed, though individual saves are preferred) */}
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
