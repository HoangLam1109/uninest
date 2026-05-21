import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { featuredRooms } from './data'

export function FeaturedRoomsSection() {
  return (
    <section id="rooms" className="bg-surface px-6 py-16 lg:px-20 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
              Gợi ý hàng đầu
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground lg:text-4xl">
              Danh mục phòng nổi bật
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-base font-bold text-primary transition-opacity hover:opacity-80"
          >
            Xem tất cả
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredRooms.map((room) => (
            <Card key={room.title} className="group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {'badge' in room && room.badge && (
                  <span className="absolute left-3 top-3 rounded bg-primary px-2 py-1 text-[10px] font-bold text-white">
                    {room.badge}
                  </span>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {room.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {room.location}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <p>
                    <span className="text-lg font-bold text-primary">
                      Từ {room.price}
                    </span>
                    <span className="text-xs text-muted-foreground">/tháng</span>
                  </p>
                  <Button variant="ghost" size="icon" className="bg-border/60">
                    <ArrowRight className="size-4 text-foreground" />
                    <span className="sr-only">Xem chi tiết</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
