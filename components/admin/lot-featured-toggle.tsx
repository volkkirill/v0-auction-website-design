"use client"

import { useActionState } from "react"
import { Switch } from "@/components/ui/switch"
import { toggleLotFeaturedStatus } from "@/app/admin/action"
import { useRouter } from "next/navigation" // Import useRouter

interface LotFeaturedToggleProps {
  lotId: string
  initialIsFeatured: boolean
}

export function LotFeaturedToggle({ lotId, initialIsFeatured }: LotFeaturedToggleProps) {
  const router = useRouter() // Initialize useRouter
  // useActionState takes the action function and an initial state
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null; success: boolean }, formData: FormData) => {
      const isFeatured = formData.get("isFeatured") === "true"
      const result = await toggleLotFeaturedStatus(prevState, { lotId, isFeatured })
      if (result.success) {
        router.refresh() // Refresh the current page to show updated data
      }
      return result
    },
    { error: null, success: false },
  )

  // We need a way to trigger the action with the new value of the switch.
  // The Switch component's onCheckedChange gives us the boolean directly.
  // We can use a hidden form field or directly call the action with the value.
  const handleToggle = async (checked: boolean) => {
    const formData = new FormData()
    formData.append("isFeatured", String(checked))
    await formAction(formData)
  }

  return (
    <div className="flex flex-col items-center">
      <Switch
        checked={initialIsFeatured} // Use initial prop for controlled component
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
      {state?.success && <p className="text-green-500 text-xs mt-1">Обновлено!</p>}
    </div>
  )
}
