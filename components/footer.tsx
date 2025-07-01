import Link from "next/link"
import { Hammer } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-8 w-full border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Hammer className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Молоток.Ру</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 text-sm md:gap-6">
          <Link href="/about" className="text-muted-foreground hover:text-primary" prefetch={false}>
            О нас
          </Link>
          <Link href="/support" className="text-muted-foreground hover:text-primary" prefetch={false}>
            Поддержка
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-primary" prefetch={false}>
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-primary" prefetch={false}>
            Условия использования
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© 2025 Молоток.Ру. Все права защищены.</p>
      </div>
    </footer>
  )
}
