import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function AuctionHousePendingApprovalPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Заявка отправлена!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Ваша заявка на регистрацию аукционного дома успешно отправлена. Мы отправили письмо с подтверждением на ваш
            адрес электронной почты. Пожалуйста, проверьте свою почту (включая папку со спамом) и перейдите по ссылке
            для активации аккаунта.
          </p>
          <p className="text-muted-foreground">
            После подтверждения email, ваша заявка будет рассмотрена администратором. Вы получите уведомление по
            электронной почте, как только ваш аккаунт будет одобрен.
          </p>
          <p className="text-sm text-muted-foreground">
            До одобрения администратором вы не сможете добавлять аукционы и лоты, а ваш аукционный дом не будет
            отображаться в общем списке.
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
