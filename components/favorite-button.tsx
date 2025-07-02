"use client"

import { useActionState, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavoriteLot } from "@/app/actions/favorites"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  lotId: string
  initialIsFavorited: boolean
  className?: string
  size?: "icon" | "default" | "sm" | "lg" | null | undefined
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
}

export function FavoriteButton({
  lotId,
  initialIsFavorited,
  className,
  size = "icon",
  variant = "ghost",
}: FavoriteButtonProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [state, formAction, isPending] = useActionState(toggleFavoriteLot, { error: null, success: false })

  useEffect(() => {
    // Update local state if initialIsFavorited changes (e.g., after router.refresh())
    setIsFavorited(initialIsFavorited)
  }, [initialIsFavorited])

  useEffect(() => {
    if (state.success) {
      // Optimistic update is already handled by `setIsFavorited` above.
      // `router.refresh()` will revalidate data on the server and update `initialIsFavorited` prop.
      router.refresh()
    } else if (state.error) {
      alert(state.error) // Show error if action failed
    }
  }, [state, router])

  const handleClick = async () => {
    const formData = new FormData()
    formData.append("lotId", lotId)
    await formAction(formData)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={className}
      aria-label={isFavorited ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className={isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
      {size !== "icon" && (isFavorited ? " В избранном" : " В избранное")}
    </Button>
  )
}
