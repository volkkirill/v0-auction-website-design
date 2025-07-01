import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Поддержка</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Мы здесь, чтобы помочь вам! Если у вас есть вопросы, проблемы или предложения, пожалуйста, свяжитесь с нами.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Связаться с нами</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@molotok.ru</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Телефон</h3>
                <p className="text-muted-foreground">+7 (800) 555-35-35</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Адрес</h3>
                <p className="text-muted-foreground">г. Москва, ул. Примерная, д. 1, офис 101</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отправить сообщение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Ваше имя" />
            <Input type="email" placeholder="Ваш Email" />
            <Input placeholder="Тема сообщения" />
            <Textarea placeholder="Ваше сообщение..." rows={5} />
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Отправить</Button>
          </CardContent>
        </Card>
      </div>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Часто задаваемые вопросы</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Найдите ответы на самые распространенные вопросы в нашем разделе FAQ.
        </p>
        <Button variant="outline" className="bg-transparent">
          Перейти в FAQ
        </Button>
      </section>
    </div>
  )
}
