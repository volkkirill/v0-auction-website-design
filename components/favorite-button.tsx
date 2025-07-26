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
  onToggleSuccess?: (lotId: string, newIsFavorited: boolean) => void
}

export function FavoriteButton({
  lotId,
  initialIsFavorited,
  className,
  size = "icon",
  variant = "ghost",
  onToggleSuccess,
}: FavoriteButtonProps) {
  const router = useRouter()
  const [optimisticIsFavorited, setOptimisticIsFavorited] = useState(initialIsFavorited)
  const [state, formAction, isPending] = useActionState(toggleFavoriteLot, { error: null, success: false })

  useEffect(() => {
    setOptimisticIsFavorited(initialIsFavorited)
  }, [initialIsFavorited])

  useEffect(() => {
    if (state.success) {
      router.refresh()
      onToggleSuccess?.(lotId, optimisticIsFavorited)
    } else if (state.error) {
      setOptimisticIsFavorited(initialIsFavorited)
      alert(state.error)
    }
  }, [state, initialIsFavorited, onToggleSuccess, router, lotId, optimisticIsFavorited])

  const handleClick = async () => {
    setOptimisticIsFavorited((prev) => !prev)

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
      aria-label={optimisticIsFavorited ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className={optimisticIsFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
      {size !== "icon" && (optimisticIsFavorited ? " В избранном" : " В избранное")}
    </Button>
  )
}
