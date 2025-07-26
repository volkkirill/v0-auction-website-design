"use client"

import { useEffect, useState } from "react"

interface LotTimerProps {
  endTime: string | null
  onTimeUp?: () => void
  className?: string
}

export function LotTimer({ endTime, onTimeUp, className }: LotTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(0)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      return Math.max(0, Math.floor(difference / 1000))
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft === 0) {
        onTimeUp?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onTimeUp])

  if (!endTime) {
    return (
      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 ${className}`}>
        <span className="text-lg font-bold text-gray-500">--</span>
      </div>
    )
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isUrgent = timeLeft <= 30
  const bgColor = isUrgent ? "bg-red-500" : "bg-green-500"
  const textColor = "text-white"

  return (
    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColor} ${className}`}>
      <span className={`text-lg font-bold ${textColor}`}>
        {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : seconds}
      </span>
    </div>
  )
}
