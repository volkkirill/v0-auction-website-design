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
  onToggleSuccess?: (lotId: string, newIsFavorited: boolean) => void // Optional callback for parent
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
  // Используем локальное состояние для немедленной визуальной обратной связи (оптимистическое обновление)
  const [optimisticIsFavorited, setOptimisticIsFavorited] = useState(initialIsFavorited)

  // useActionState обрабатывает серверное действие и его состояние ожидания
  const [state, formAction, isPending] = useActionState(toggleFavoriteLot, { error: null, success: false })

  // Когда initialIsFavorited (из серверных пропсов, после router.refresh()) меняется, обновляем оптимистическое состояние
  useEffect(() => {
    setOptimisticIsFavorited(initialIsFavorited)
  }, [initialIsFavorited])

  // Обрабатываем результат серверного действия
  useEffect(() => {
    if (state.success) {
      // Если успех, оптимистическое состояние уже было установлено.
      // Теперь вызываем router.refresh() для перевалидации путей.
      // Это приведет к тому, что initialIsFavorited в конечном итоге отразит новое состояние.
      // Важно: router.refresh() вызовет повторную отрисовку серверных компонентов, но кнопка уже будет выглядеть обновленной.
      router.refresh()
      onToggleSuccess?.(lotId, optimisticIsFavorited) // Уведомляем родителя, если предоставлен callback
    } else if (state.error) {
      // Если ошибка, отменяем оптимистическое состояние и показываем сообщение
      setOptimisticIsFavorited(initialIsFavorited) // Возвращаемся к предыдущему фактическому состоянию
      alert(state.error)
    }
  }, [state, initialIsFavorited, onToggleSuccess, router, lotId, optimisticIsFavorited])

  const handleClick = async () => {
    // Оптимистическое обновление: немедленно меняем UI
    setOptimisticIsFavorited((prev) => !prev)

    const formData = new FormData()
    formData.append("lotId", lotId)
    // Запускаем серверное действие
    await formAction(formData)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending} // Отключаем кнопку во время выполнения, чтобы предотвратить множественные клики
      className={className}
      aria-label={optimisticIsFavorited ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart className={optimisticIsFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
      {size !== "icon" && (optimisticIsFavorited ? " В избранном" : " В избранное")}
    </Button>
  )
}
