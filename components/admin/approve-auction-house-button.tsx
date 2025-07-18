"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { approveAuctionHouse } from "@/app/admin/action"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation" // Import useRouter

interface ApproveAuctionHouseButtonProps {
  auctionHouseId: string
}

export function ApproveAuctionHouseButton({ auctionHouseId }: ApproveAuctionHouseButtonProps) {
  const router = useRouter() // Initialize useRouter
  const [state, formAction, isPending] = useActionState(approveAuctionHouse, { error: null, success: false })

  const handleApprove = async () => {
    const formData = new FormData()
    formData.append("auctionHouseId", auctionHouseId)
    const result = await formAction(formData)
    if (result.success) {
      router.refresh() // Refresh the current page to show updated data
    }
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        onClick={handleApprove}
        disabled={isPending || state.success}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        size="sm"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : state.success ? "Одобрено!" : "Одобрить"}
      </Button>
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
    </div>
  )
}
