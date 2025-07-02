import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function EmailConfirmedPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email подтвержден!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <p className="text-muted-foreground">
            Ваш адрес электронной почты успешно подтвержден. Теперь вы можете войти в свой аккаунт.
          </p>
          <Link href="/auth/sign-in" passHref>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Войти</Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="outline" className="w-full bg-transparent mt-2">
              Вернуться на главную
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
