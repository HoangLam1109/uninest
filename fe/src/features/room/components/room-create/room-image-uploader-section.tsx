import { ImagePlus, Upload, X } from 'lucide-react'
import type { ChangeEvent, RefObject } from 'react'
import { Input } from '@/components/ui/input'
import type { SelectedRoomImage } from '../../schemas/room.schema'
import { SectionHeading } from './room-create-shared'

export function RoomImageUploaderSection({
  images,
  imageInputRef,
  onImageInputChange,
  onSetPrimaryImage,
  onRemoveImage,
  onUpdateCaption,
  formatFileSize,
}: {
  images: SelectedRoomImage[]
  imageInputRef: RefObject<HTMLInputElement | null>
  onImageInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSetPrimaryImage: (imageId: string) => void
  onRemoveImage: (imageId: string) => void
  onUpdateCaption: (imageId: string, caption: string) => void
  formatFileSize: (size: number) => string
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm xl:p-6 2xl:p-7">
      <SectionHeading
        icon={<ImagePlus className="size-5" />}
        title="Ảnh phòng"
        description="Chọn nhiều ảnh, đặt ảnh đại diện và thêm chú thích trước khi lưu."
      />

      <label className="relative mt-5 flex min-h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 text-center transition hover:bg-primary/10 xl:min-h-44 2xl:min-h-48">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={onImageInputChange}
        />
        <Upload className="mb-3 size-8 text-primary" />
        <span className="text-sm font-bold text-foreground">Chọn ảnh phòng</span>
        <span className="mt-1 text-xs text-muted-foreground">
          Có thể chọn nhiều ảnh cùng lúc
        </span>
      </label>

      <div className="mt-4 rounded-lg border border-border bg-surface p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Ảnh đã tải lên</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Click vào một ảnh để chọn làm ảnh đại diện.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground">
            {images.length} ảnh
          </span>
        </div>

        {images.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-muted-foreground">
            Chưa có ảnh nào trong tin đăng.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <article key={image.id} className="min-w-0 space-y-2">
                <div
                  className={`group relative overflow-hidden rounded-lg border bg-white transition ${
                    image.isPrimary
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={image.isPrimary}
                    aria-label="Đặt ảnh này làm ảnh đại diện"
                    className="block aspect-square w-full overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onSetPrimaryImage(image.id)}
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.caption || image.file.name}
                      className="size-full object-cover transition group-hover:scale-105"
                    />
                  </button>

                  {image.isPrimary ? (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      Đại diện
                    </span>
                  ) : (
                    <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/55 px-2 py-1 text-center text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Chọn primary
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-muted-foreground shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemoveImage(image.id)}
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <Input
                  className="h-8 rounded-md border border-border bg-white px-2 text-xs shadow-none"
                  value={image.caption}
                  onChange={(event) => onUpdateCaption(image.id, event.target.value)}
                  placeholder="Chú thích"
                />
                <p className="truncate text-[11px] text-muted-foreground">
                  {formatFileSize(image.file.size)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
