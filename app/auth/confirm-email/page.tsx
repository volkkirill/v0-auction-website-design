import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Подтвердите ваш Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Мы отправили письмо с подтверждением на ваш адрес электронной почты. Пожалуйста, проверьте свою почту
            (включая папку со спамом) и перейдите по ссылке для активации аккаунта.
          </p>
          <p className="text-sm text-muted-foreground">
            Если вы не получили письмо, попробуйте зарегистрироваться снова или свяжитесь с поддержкой.
          </p>
          <Link href="/" passHref>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Вернуться на главную
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
