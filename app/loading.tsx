import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 flex flex-col items-center justify-center text-center space-y-4">
            <Skeleton className="h-12 w-3/4 max-w-md" />
            <Skeleton className="h-6 w-2/3 max-w-sm" />
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-10 w-full max-w-md mt-8" />
          </div>
          <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-3">
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <Skeleton className="h-10 w-1/2 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <Skeleton className="h-48 w-full rounded-t-md" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <div className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
