"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hammer, Moon, Sun, Menu, Search, User } from "lucide-react" // Added User icon
import { useTheme } from "next-themes"
import { useState, useEffect, useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { signUp } from "@/app/auth/sign-up/action"
import { signIn } from "@/app/auth/sign-in/action" // Import signIn action
import { signOut } from "@/app/auth/sign-out/action" // Import signOut action
import { createClient } from "@/supabase/client" // Import client-side Supabase client
import type { User as SupabaseUser } from "@supabase/supabase-js" // Import User type

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [registrationState, registrationAction, isRegistrationPending] = useActionState(signUp, { error: null })
  const [loginState, loginAction, isLoginPending] = useActionState(signIn, { error: null }) // State for login
  const [user, setUser] = useState<SupabaseUser | null>(null) // State to hold authenticated user

  const supabase = createClient() // Initialize client-side Supabase client

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Hammer className="h-6 w-6 text-primary" />
          <span className="sr-only">Молоток.Ру</span>
          <span>Молоток.Ру</span>
        </Link>
        <nav className="hidden flex-col gap-6 text-lg font-medium lg:flex lg:flex-row lg:items-center lg:gap-5 lg:text-sm xl:gap-6">
          <Link href="/" className="text-foreground transition-colors hover:text-primary">
            Главная
          </Link>
          <Link href="/auctions" className="text-muted-foreground transition-colors hover:text-primary">
            Аукционы
          </Link>
          <Link href="/auction-houses" className="text-muted-foreground transition-colors hover:text-primary">
            Аукционные дома
          </Link>
          <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
            О нас
          </Link>
          <Link href="/support" className="text-muted-foreground transition-colors hover:text-primary">
            Поддержка
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {/* Search Input in Header */}
          <div className="hidden lg:flex relative w-full max-w-xs">
            <Input
              type="search"
              placeholder="Поиск..."
              className="pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:ring-primary focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Desktop Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="hidden lg:inline-flex"
          >
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Переключить тему</span>
          </Button>

          {user ? (
            // User is logged in
            <>
              <Link href="/dashboard/buyer" passHref>
                <Button variant="ghost" size="sm" className="hidden lg:inline-flex bg-transparent">
                  <User className="h-4 w-4 mr-2" />
                  {user.email || "Мой аккаунт"}
                </Button>
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            // User is not logged in
            <>
              {/* Registration Modal Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-transparent">
                    Регистрация
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-card-foreground border-border p-6 shadow-lg rounded-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Регистрация</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Создайте новый аккаунт.</DialogDescription>
                  </DialogHeader>
                  <form action={registrationAction}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="ваша@почта.ru" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" name="password" type="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Повторите пароль</Label>
                        <Input id="confirm-password" name="confirm-password" type="password" required />
                      </div>
                      {registrationState?.error && <p className="text-red-500 text-sm">{registrationState.error}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isRegistrationPending}
                    >
                      {isRegistrationPending ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Login Modal Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="hidden lg:inline-flex">
                    Войти
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-card-foreground border-border p-6 shadow-lg rounded-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Вход</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Войдите в свой аккаунт.</DialogDescription>
                  </DialogHeader>
                  <form action={loginAction}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" name="email" type="email" placeholder="ваша@почта.ru" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Пароль</Label>
                        <Input id="login-password" name="password" type="password" required />
                      </div>
                      {loginState?.error && <p className="text-red-500 text-sm">{loginState.error}</p>}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isLoginPending}
                    >
                      {isLoginPending ? "Вход..." : "Войти"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card text-card-foreground border-border">
              <nav className="grid gap-6 text-lg font-medium p-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={toggleMobileMenu}>
                  <Hammer className="h-6 w-6" />
                  <span className="sr-only">Молоток.Ру</span>
                  <span>Молоток.Ру</span>
                </Link>
                <Link href="/" className="hover:text-primary" onClick={toggleMobileMenu}>
                  Главная
                </Link>
                <Link href="/auctions" className="text-muted-foreground hover:text-primary" onClick={toggleMobileMenu}>
                  Аукционы
                </Link>
                <Link
                  href="/auction-houses"
                  className="text-muted-foreground hover:text-primary"
                  onClick={toggleMobileMenu}
                >
                  Аукционные дома
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-primary" onClick={toggleMobileMenu}>
                  О нас
                </Link>
                <Link href="/support" className="text-muted-foreground hover:text-primary" onClick={toggleMobileMenu}>
                  Поддержка
                </Link>
                {/* Mobile Search */}
                <div className="relative w-full mt-4">
                  <Input
                    type="search"
                    placeholder="Поиск..."
                    className="pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:ring-primary focus:border-primary"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {/* Theme Toggle in Mobile Menu */}
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-4"
                  onClick={toggleTheme}
                  aria-label="Переключить тему"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.2rem] w-[1.2rem] mr-2" />
                  ) : (
                    <Moon className="h-[1.2rem] w-[1.2rem] mr-2" />
                  )}
                  <span>Переключить тему</span>
                </Button>
                {user ? (
                  // User is logged in (Mobile)
                  <>
                    <Link href="/dashboard/buyer" passHref>
                      <Button variant="ghost" className="w-full justify-start mt-4">
                        <User className="h-4 w-4 mr-2" />
                        {user.email || "Мой аккаунт"}
                      </Button>
                    </Link>
                    <form action={signOut}>
                      <Button type="submit" variant="outline" className="w-full mt-4 bg-transparent">
                        Выйти
                      </Button>
                    </form>
                  </>
                ) : (
                  // User is not logged in (Mobile)
                  <>
                    {/* Mobile Registration Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4 bg-transparent">
                          Регистрация
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card text-card-foreground border-border p-6 shadow-lg rounded-lg">
                        <DialogHeader>
                          <DialogTitle>Регистрация</DialogTitle>
                          <DialogDescription>Создайте новый аккаунт.</DialogDescription>
                        </DialogHeader>
                        <form action={registrationAction}>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="mobile-email">Email</Label>
                              <Input id="mobile-email" name="email" type="email" placeholder="ваша@почта.ru" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-password">Пароль</Label>
                              <Input id="mobile-password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-confirm-password">Повторите пароль</Label>
                              <Input id="mobile-confirm-password" name="confirm-password" type="password" required />
                            </div>
                            {registrationState?.error && (
                              <p className="text-red-500 text-sm">{registrationState.error}</p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={isRegistrationPending}
                          >
                            {isRegistrationPending ? "Регистрация..." : "Зарегистрироваться"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {/* Mobile Login Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" className="w-full">
                          Войти
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card text-card-foreground border-border p-6 shadow-lg rounded-lg">
                        <DialogHeader>
                          <DialogTitle>Вход</DialogTitle>
                          <DialogDescription>Войдите в свой аккаунт.</DialogDescription>
                        </DialogHeader>
                        <form action={loginAction}>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="mobile-login-email">Email</Label>
                              <Input
                                id="mobile-login-email"
                                name="email"
                                type="email"
                                placeholder="ваша@почта.ru"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="mobile-login-password">Пароль</Label>
                              <Input id="mobile-login-password" name="password" type="password" required />
                            </div>
                            {loginState?.error && <p className="text-red-500 text-sm">{loginState.error}</p>}
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={isLoginPending}
                          >
                            {isLoginPending ? "Вход..." : "Войти"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
