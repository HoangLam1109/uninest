import { Link } from 'react-router-dom'
import type { UseFormRegister } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { formatRoomCurrency } from '@/utils/room-display'
import type { RoomFormInput, SelectedRoomImage } from '../../schemas/room.schema'

export function RoomCreatePreviewCard({
  primaryImage,
  title,
  location,
  pricePerMonth,
  areaSqm,
  maxOccupants,
  roomTypeLabel,
  register,
  isSubmitting,
}: {
  primaryImage?: SelectedRoomImage
  title?: string
  location: string
  pricePerMonth?: number
  areaSqm?: number
  maxOccupants?: number
  roomTypeLabel?: string
  register: UseFormRegister<RoomFormInput>
  isSubmitting: boolean
}) {
  const previewArea = Number(areaSqm) || 0
  const previewMaxOccupants = Number(maxOccupants) || 1

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="aspect-[4/3] bg-surface">
        {primaryImage ? (
          <img
            src={primaryImage.previewUrl}
            alt={primaryImage.caption || 'Ảnh đại diện phòng'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-muted-foreground">
            Xem trước ảnh đại diện
          </div>
        )}
      </div>
      <div className="space-y-4 p-5 xl:p-6 2xl:p-7">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Xem trước tin đăng</p>
          <h2 className="mt-2 line-clamp-2 text-xl font-black text-foreground">
            {title || 'Tên phòng sẽ hiển thị tại đây'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {location || 'Địa chỉ phòng'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            {formatRoomCurrency(Number(pricePerMonth) || 0)}/tháng
          </span>
          <span className="rounded-full bg-surface px-3 py-1.5">
            {previewArea} m2
          </span>
          <span className="rounded-full bg-surface px-3 py-1.5">
            {previewMaxOccupants} người
          </span>
          <span className="rounded-full bg-surface px-3 py-1.5">
            {roomTypeLabel ?? 'Loại phòng'}
          </span>
        </div>
        <label className="flex items-center gap-2 rounded-lg bg-surface p-3 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register('isPublished')}
          />
          Hiển thị phòng trên hệ thống
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link to="/chu-nha/phong">Hủy</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu tin đăng'}
          </Button>
        </div>
      </div>
    </section>
  )
}
