import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paths } from '@/config/constants'

export type CompletionItem = {
  label: string
  done: boolean
}

export function RoomCreateHeader({
  completionItems,
}: {
  completionItems: CompletionItem[]
}) {
  return (
    <section className="border-b border-border bg-surface px-6 py-8 lg:px-10 xl:px-20 xl:py-10 2xl:px-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between xl:max-w-[88rem] 2xl:max-w-[96rem]">
        <div className="max-w-2xl 2xl:max-w-3xl">
          <Link
            to={paths.home}
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Quay về trang chủ
          </Link>
          <h1 className="text-3xl font-black leading-tight text-foreground md:text-5xl 2xl:text-6xl">
            Đăng tin phòng mới
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground 2xl:max-w-2xl">
            Tạo tin đăng đầy đủ thông tin, giá thuê, vị trí và ảnh phòng trong
            cùng một trang để người thuê có thể xem ngay khi tin được xuất bản.
          </p>
        </div>

        <div className="grid gap-2 rounded-xl border border-border bg-white p-4 shadow-sm sm:grid-cols-2 lg:min-w-80 xl:min-w-96 2xl:min-w-[28rem] 2xl:p-5">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className={`size-4 ${item.done ? 'text-primary' : 'text-border'}`}
              />
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
