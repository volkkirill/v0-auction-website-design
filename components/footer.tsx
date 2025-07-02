import Link from "next/link"
import { Hammer } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full shrink-0 border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Hammer className="h-6 w-6 text-primary" />
          <span className="sr-only">Молоток.Ру</span>
          <span>Молоток.Ру</span>
        </Link>
        <p className="text-sm text-muted-foreground">&copy; 2024 Молоток.Ру. Все права защищены.</p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy-policy" className="text-sm hover:underline underline-offset-4" prefetch={false}>
            Политика конфиденциальности
          </Link>
          <Link href="/terms-of-use" className="text-sm hover:underline underline-offset-4" prefetch={false}>
            Условия использования
          </Link>
        </nav>
      </div>
    </footer>
  )
}
