"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Bid {
  id: string
  amount: number
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}

interface BidHistoryProps {
  lotId: string
  className?: string
}

export function BidHistory({ lotId, className }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchBids = async () => {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          id,
          amount,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq("lot_id", lotId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching bids:", error)
      } else {
        setBids(data || [])
      }
      setLoading(false)
    }

    fetchBids()

    // Subscribe to new bids
    const channel = supabase
      .channel(`bids-${lotId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `lot_id=eq.${lotId}`,
        },
        (payload) => {
          // Fetch updated bids when new bid is inserted
          fetchBids()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lotId])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">История ставок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">История ставок</CardTitle>
      </CardHeader>
      <CardContent className="max-h-60 overflow-y-auto">
        {bids.length === 0 ? (
          <div className="text-center text-muted-foreground">Ставок пока нет</div>
        ) : (
          <div className="space-y-2">
            {bids.map((bid, index) => (
              <div key={bid.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{bid.profiles?.full_name || `Участник ${index + 1}`}</span>
                <span className="font-semibold">{bid.amount.toLocaleString("ru-RU")} ₽</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
