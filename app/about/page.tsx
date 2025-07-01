import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">О Молоток.Ру</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Молоток.Ру - это ведущая онлайн-платформа для проведения аукционов, где коллекционеры, ценители искусства и
          просто любители уникальных вещей могут найти и приобрести желаемые лоты. Мы стремимся предоставить безопасную,
          прозрачную и удобную среду для всех участников торгов.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Наша миссия</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Наша миссия - соединять продавцов и покупателей со всего мира, предлагая широкий спектр уникальных
              предметов, от антиквариата и произведений искусства до коллекционных автомобилей и ювелирных изделий. Мы
              гарантируем подлинность и качество каждого лота, а также обеспечиваем высокий уровень обслуживания.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Технологии и инновации</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Мы постоянно внедряем передовые технологии для улучшения вашей работы с платформой. Наша система
              обеспечивает высокую скорость торгов, надежную защиту данных и интуитивно понятный интерфейс. Мы верим,
              что инновации делают мир аукционов доступнее и увлекательнее для каждого.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-6">Наше сообщество</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Молоток.Ру - это не просто платформа, это сообщество единомышленников, объединенных страстью к уникальным
          предметам. Мы ценим каждого участника и стремимся создать атмосферу доверия и взаимного уважения.
          Присоединяйтесь к нам, чтобы делиться опытом, находить новые сокровища и быть частью динамичного мира
          аукционов.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Присоединяйтесь к нам!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Если у вас есть вопросы или предложения, свяжитесь с нашей службой поддержки.
        </p>
        <Link href="/support" passHref>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Связаться с нами</Button>
        </Link>
      </section>
    </div>
  )
}
