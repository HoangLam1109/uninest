import { Link } from 'react-router-dom'
import { paths } from '@/config/constants'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
        404
      </p>
      <h1 className="font-sans text-3xl font-bold text-foreground">
        Không tìm thấy trang
      </h1>
      <p className="max-w-md text-muted-foreground">
        Trang bạn truy cập không tồn tại hoặc đã được di chuyển.
      </p>
      <Button asChild>
        <Link to={paths.home}>Về trang chủ</Link>
      </Button>
    </div>
  )
}
