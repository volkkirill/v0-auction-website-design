"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
  const faqItems = [
    {
      question: "Как зарегистрироваться на Молоток.Ру?",
      answer:
        "Для регистрации нажмите кнопку 'Регистрация' в правом верхнем углу страницы и следуйте инструкциям. Вы можете зарегистрироваться как покупатель или как аукционный дом.",
    },
    {
      question: "Как сделать ставку на лот?",
      answer:
        "Чтобы сделать ставку, перейдите на страницу интересующего лота. Введите желаемую сумму ставки в поле 'Ваша ставка' и нажмите кнопку 'Сделать ставку'. Убедитесь, что ваша ставка превышает текущую минимальную ставку.",
    },
    {
      question: "Что такое 'Комиссия аукционного дома'?",
      answer:
        "Комиссия аукционного дома - это процент от финальной цены лота, который взимается аукционным домом за проведение аукциона. Эта комиссия указывается при создании аукциона и отображается на странице лота.",
    },
    {
      question: "Как я могу отслеживать свои ставки?",
      answer:
        "Все ваши активные ставки и выигранные лоты можно отслеживать в разделе 'Мой аккаунт' (для покупателей) или 'Панель АД' (для аукционных домов).",
    },
    {
      question: "Что делать, если я забыл пароль?",
      answer:
        "На странице входа нажмите 'Забыли пароль?' и следуйте инструкциям для восстановления доступа к вашему аккаунту.",
    },
  ]

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

      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">Часто задаваемые вопросы (FAQ)</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Найдите ответы на самые распространенные вопросы.
        </p>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base md:text-lg">
                {item.question}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
