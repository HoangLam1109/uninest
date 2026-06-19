import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar } from './avatar'

type AvatarUploadProps = {
  name: string
  src?: string
  onUpload: (file: File) => Promise<{ avatarUrl: string } | void>
  className?: string
}

export function AvatarUpload({ name, src, onUpload, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const displaySrc = previewUrl ?? src

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 8MB')
      return
    }

    // Revoke old preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    const url = URL.createObjectURL(file)
    setPreviewFile(file)
    setPreviewUrl(url)
  }

  async function handleUpload() {
    if (!previewFile) return

    setUploading(true)
    try {
      const result = await onUpload(previewFile)
      if (result?.avatarUrl) {
        setPreviewFile(null)
        setPreviewUrl(null)
        toast.success('Ảnh đại diện đã được cập nhật')
      }
    } catch {
      toast.error('Không thể tải ảnh lên, vui lòng thử lại')
    } finally {
      setUploading(false)
    }
  }

  function handleCancel() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Thay đổi ảnh đại diện"
      >
        <Avatar
          name={name}
          src={displaySrc}
          className="size-20 text-xl md:size-24 md:text-2xl"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Camera className="size-6 text-white" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewFile ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Lưu ảnh'
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Hủy
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-400">Nhấn vào ảnh để thay đổi</p>
      )}
    </div>
  )
}
