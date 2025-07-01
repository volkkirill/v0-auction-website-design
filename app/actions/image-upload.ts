"use server"

import { createClient } from "@/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function uploadImage(prevState: { error: string | null; url: string | null }, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Пользователь не авторизован.", url: null }
  }

  const file = formData.get("file") as File
  const folder = formData.get("folder") as string // e.g., 'auction_images', 'lot_images', 'auction_house_logos'

  if (!file || file.size === 0) {
    return { error: "Файл не выбран или пуст.", url: null }
  }

  if (!folder) {
    return { error: "Не указана папка для загрузки.", url: null }
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage.from("auction-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading image:", error)
    return { error: `Ошибка загрузки изображения: ${error.message}`, url: null }
  }

  const { data: publicUrlData } = supabase.storage.from("auction-images").getPublicUrl(filePath)

  if (!publicUrlData || !publicUrlData.publicUrl) {
    return { error: "Не удалось получить публичный URL изображения.", url: null }
  }

  return { error: null, url: publicUrlData.publicUrl }
}
