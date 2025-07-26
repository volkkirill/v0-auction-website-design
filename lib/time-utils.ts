// Функция для конвертации UTC времени в локальное время для input datetime-local
export const formatDateTimeLocal = (utcDateString: string) => {
  if (!utcDateString) return ""
  const date = new Date(utcDateString)
  // Получаем локальное время пользователя
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

// Функция для конвертации локального времени в UTC для сохранения
export const convertToUTC = (localDateTimeString: string) => {
  if (!localDateTimeString) return ""
  const localDate = new Date(localDateTimeString)
  return localDate.toISOString()
}

// Функция для форматирования времени для отображения пользователю
export const formatDisplayTime = (utcDateString: string) => {
  if (!utcDateString) return ""
  const date = new Date(utcDateString)
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })
}

// Функция для проверки, доступен ли аукцион (за час до начала)
export const isAuctionAccessible = (startTime: string) => {
  const now = new Date()
  const auctionStart = new Date(startTime)
  const oneHourBefore = new Date(auctionStart.getTime() - 60 * 60 * 1000)
  return now >= oneHourBefore
}

// Функция для получения времени до начала аукциона
export const getTimeUntilAuction = (startTime: string) => {
  const now = new Date()
  const auctionStart = new Date(startTime)
  const diff = auctionStart.getTime() - now.getTime()

  if (diff <= 0) return "Аукцион начался"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours} ч ${minutes} мин`
  } else {
    return `${minutes} мин`
  }
}

// Функция для форматирования времени до события
export const formatTimeRemaining = (startTime: string) => {
  const now = new Date().getTime()
  const start = new Date(startTime).getTime()
  const difference = start - now

  if (difference <= 0) {
    return "Начался!"
  }

  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
  if (difference > threeDaysInMs) {
    return null // Return null to hide the badge if more than 3 days remain
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  let timeString = ""
  if (days > 0) timeString += `${days}д `
  if (hours > 0) timeString += `${hours}ч `
  timeString += `${minutes}м`

  return timeString.trim()
}
