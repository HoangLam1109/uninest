import { useRef, useState, type FormEvent } from 'react'
import { ImageOff, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  useDeleteRoomImage,
  useGetRoomImages,
  useSetPrimaryRoomImage,
  useUploadRoomImage,
} from '../hooks/use-rooms'

const inputClassName =
  'h-11 rounded-lg border border-primary/10 px-3 text-sm shadow-none focus-visible:ring-2'

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

type RoomImageModalProps = {
  open: boolean
  roomId: string | null
  roomTitle?: string
  onClose: () => void
}

export function RoomImageModal({
  open,
  roomId,
  roomTitle,
  onClose,
}: RoomImageModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [order, setOrder] = useState(0)
  const [isPrimary, setIsPrimary] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const imagesQuery = useGetRoomImages(roomId, open)
  const uploadImage = useUploadRoomImage()
  const deleteImage = useDeleteRoomImage()
  const setPrimaryImage = useSetPrimaryRoomImage()

  const isPending =
    uploadImage.isPending || deleteImage.isPending || setPrimaryImage.isPending

  const resetForm = () => {
    setImageFile(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    setCaption('')
    setOrder(0)
    setIsPrimary(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roomId || !imageFile) return

    uploadImage.mutate(
      {
        roomId,
        payload: {
          image: imageFile,
          caption: caption.trim() || undefined,
          order,
          isPrimary,
        },
      },
      {
        onSuccess: resetForm,
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Ảnh phòng${roomTitle ? ` - ${roomTitle}` : ''}`}
      className="max-h-[92svh] max-w-4xl overflow-y-auto rounded-xl"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          {imagesQuery.isLoading ? (
            <div className="rounded-xl border border-dashed border-primary/20 p-8 text-center text-sm text-slate-500">
              Đang tải ảnh phòng
            </div>
          ) : null}

          {imagesQuery.isError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 p-8 text-center text-sm text-red-600">
              Không thể tải danh sách ảnh
            </div>
          ) : null}

          {!imagesQuery.isLoading &&
          !imagesQuery.isError &&
          (imagesQuery.data?.length ?? 0) === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 p-8 text-center text-sm text-slate-500">
              <ImageOff className="mb-2 size-8 text-slate-400" />
              Chưa có ảnh cho phòng này
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {imagesQuery.data?.map((image) => (
              <article
                key={image._id}
                className="overflow-hidden rounded-xl border border-primary/10 bg-white"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={image.url}
                    alt={image.caption || 'Ảnh phòng'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {image.caption || 'Không có chú thích'}
                      </p>
                      {image.isPrimary ? (
                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                          Đại diện
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Thứ tự: {image.order}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={image.isPrimary || isPending || !roomId}
                      onClick={() =>
                        roomId &&
                        setPrimaryImage.mutate({ roomId, imageId: image._id })
                      }
                    >
                      <Star className="size-4" />
                      Đặt ảnh đại diện
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Xóa ảnh"
                      disabled={isPending || !roomId}
                      onClick={() =>
                        roomId && deleteImage.mutate({ roomId, imageId: image._id })
                      }
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Ảnh phòng
            </span>
            <Input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className={inputClassName}
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              required
            />
            {imageFile ? (
              <p className="mt-1 text-xs text-slate-500">
                {imageFile.name} - {formatFileSize(imageFile.size)}
              </p>
            ) : null}
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Chú thích
            </span>
            <Input
              className={inputClassName}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Thứ tự hiển thị
            </span>
            <Input
              type="number"
              className={inputClassName}
              min={0}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
            />
            Đặt làm ảnh
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Dong
            </Button>
            <Button type="submit" disabled={isPending || !roomId || !imageFile}>
              {uploadImage.isPending ? 'Đang tải lên...' : 'Thêm ảnh'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
