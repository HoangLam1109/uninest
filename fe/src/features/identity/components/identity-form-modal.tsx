import { useState, useRef, type ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2, Search, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  identityFormSchema,
  type IdentityFormValues,
} from '../schemas/identity.schema'
import { useCreateIdentity, useUpdateIdentity } from '../hooks/use-identities'
import type { Identity } from '../types/identity.type'
import { userApi } from '@/features/user/api/user.api'
import type { UserSearchResult } from '@/features/user/types/user.type'
import { useAuth } from '@/hooks/use-auth'

type IdentityFormModalProps = {
  open: boolean
  onClose: () => void
  existingIdentity?: Identity | null
  onCreated?: (identity: Identity) => void
  /** Pre-selected user (name, phone, email auto-filled) */
  preSelectedUser?: UserSearchResult | null
  /** When true, skip user search and auto-fill from logged-in user */
  hideUserSearch?: boolean
}

function FilePreview({
  file,
  url,
  label,
  onRemove,
}: {
  file?: File | null
  url?: string | null
  label: string
  onRemove?: () => void
}) {
  const imageSrc = file ? URL.createObjectURL(file) : url

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={label}
            className="aspect-16/10 w-full object-cover"
          />
          {onRemove ? (
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
              onClick={onRemove}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </>
      ) : (
        <div className="flex aspect-16/10 items-center justify-center text-slate-400">
          <Camera className="size-10" />
        </div>
      )}
      <p className="truncate px-2 py-1.5 text-center text-xs font-semibold text-slate-600">
        {label}
      </p>
    </div>
  )
}

function FileInput({
  accept,
  label,
  onChange,
}: {
  accept: string
  label: string
  onChange: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <button
      type="button"
      className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-surface p-4 text-sm text-slate-500 transition hover:border-primary/60 hover:text-primary"
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="size-6" />
      <span>{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onChange(file)
          // reset so same file re-pick works
          event.target.value = ''
        }}
      />
    </button>
  )
}

export function IdentityFormModal({
  open,
  onClose,
  existingIdentity,
  onCreated,
  preSelectedUser,
  hideUserSearch,
}: IdentityFormModalProps) {
  const { user: currentUser } = useAuth()
  const createIdentity = useCreateIdentity()
  const updateIdentity = useUpdateIdentity()
  const isEditing = Boolean(existingIdentity)

  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)

  // User search state (only for creating new identity, not when hideUserSearch)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    hideUserSearch && currentUser
      ? { _id: currentUser.id, fullName: currentUser.fullName, phone: currentUser.phone ?? '', email: currentUser.email }
      : preSelectedUser ?? null
  )
  const [searchError, setSearchError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: existingIdentity
      ? {
          fullName: existingIdentity.fullName,
          phone: existingIdentity.phone,
          cccdNumber: existingIdentity.cccdNumber,
          dateOfBirth: existingIdentity.dateOfBirth?.split('T')[0] ?? '',
        }
      : {
          fullName: hideUserSearch && currentUser ? currentUser.fullName : preSelectedUser?.fullName ?? '',
          phone: hideUserSearch && currentUser ? (currentUser.phone ?? '') : preSelectedUser?.phone ?? '',
          cccdNumber: '',
          dateOfBirth: '',
        },
  })

  const handleClose = () => {
    reset()
    setFrontFile(null)
    setBackFile(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(
      hideUserSearch && currentUser
        ? { _id: currentUser.id, fullName: currentUser.fullName, phone: currentUser.phone ?? '', email: currentUser.email }
        : preSelectedUser ?? null
    )
    setSearchError('')
    onClose()
  }

  const handleSearchUser = async () => {
    const q = searchQuery.trim()
    if (!q) return

    setSearching(true)
    setSearchError('')
    setSearchResults([])

    try {
      const { data } = await userApi.search(q)
      setSearchResults(data.data)
      if (data.data.length === 0) {
        setSearchError('Không tìm thấy người dùng nào')
      }
    } catch {
      setSearchError('Lỗi khi tìm kiếm')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user)
    setValue('fullName', user.fullName)
    setValue('phone', user.phone)
    setSearchResults([])
    setSearchQuery('')
    setSearchError('')
  }

  const handleClearUser = () => {
    setSelectedUser(null)
    setValue('fullName', '')
    setValue('phone', '')
  }

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    handleSubmit((values) => {
      if (!isEditing && (!frontFile || !backFile)) return

      if (isEditing && existingIdentity) {
        updateIdentity.mutate(
          {
            id: existingIdentity._id,
            payload: {
              fullName: values.fullName,
              dateOfBirth: values.dateOfBirth,
              phone: values.phone,
              ...(frontFile ? { cccdFront: frontFile } : {}),
              ...(backFile ? { cccdBack: backFile } : {}),
            },
          },
          { onSuccess: handleClose },
        )
      } else {
        createIdentity.mutate(
          {
            fullName: values.fullName,
            dateOfBirth: values.dateOfBirth,
            phone: values.phone,
            cccdNumber: values.cccdNumber,
            cccdFront: frontFile!,
            cccdBack: backFile!,
            ...(selectedUser ? { targetUserId: selectedUser._id } : {}),
          },
          {
            onSuccess: (identity) => {
              onCreated?.(identity)
              handleClose()
            },
          },
        )
      }
    })(event)
  }

  const isPending = createIdentity.isPending || updateIdentity.isPending

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Cập nhật hồ sơ định danh' : 'Tạo hồ sơ định danh'}
      className="max-w-xl"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {/* User Search (only when creating new identity, not editing, and not hidden) */}
        {!isEditing && !hideUserSearch ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Tìm người dùng <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
            </p>

            {selectedUser ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{selectedUser.fullName}</p>
                  <p className="text-xs text-slate-500">{selectedUser.phone} • {selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearUser}
                  className="shrink-0 rounded-full p-1 text-red-500 hover:bg-red-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nhập tên hoặc số điện thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearchUser()
                      }
                    }}
                    className="h-9 flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1"
                    onClick={handleSearchUser}
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                    Tìm
                  </Button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-primary/5"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.phone} • {user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                {searchError ? (
                  <p className="text-xs text-red-500">{searchError}</p>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {/* CCCD Images */}
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Ảnh CCCD/CMND *
          </p>
          <div className="grid grid-cols-2 gap-3">
            {frontFile || existingIdentity?.cccdFrontImage ? (
              <FilePreview
                file={frontFile}
                url={existingIdentity?.cccdFrontImage}
                label="Mặt trước"
                onRemove={() => setFrontFile(null)}
              />
            ) : (
              <FileInput
                accept="image/*"
                label="Mặt trước CCCD"
                onChange={setFrontFile}
              />
            )}
            {backFile || existingIdentity?.cccdBackImage ? (
              <FilePreview
                file={backFile}
                url={existingIdentity?.cccdBackImage}
                label="Mặt sau"
                onRemove={() => setBackFile(null)}
              />
            ) : (
              <FileInput
                accept="image/*"
                label="Mặt sau CCCD"
                onChange={setBackFile}
              />
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="grid gap-3">
          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>Họ tên *</span>
            <Input
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              disabled={!!selectedUser}
              className={selectedUser ? 'bg-slate-50' : ''}
            />
            {errors.fullName ? (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            ) : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-sm font-semibold text-foreground">
              <span>Ngày sinh *</span>
              <Input type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth ? (
                <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
              ) : null}
            </label>

            <label className="block space-y-1.5 text-sm font-semibold text-foreground">
              <span>Số điện thoại *</span>
              <Input
                {...register('phone')}
                placeholder="0901234567"
                disabled={!!selectedUser}
                className={selectedUser ? 'bg-slate-50' : ''}
              />
              {errors.phone ? (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              ) : null}
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            <span>CCCD/CMND *</span>
            <Input
              {...register('cccdNumber')}
              placeholder="079202012345"
              disabled={isEditing}
            />
            {errors.cccdNumber ? (
              <p className="text-xs text-red-500">{errors.cccdNumber.message}</p>
            ) : null}
            {isEditing ? (
              <p className="text-xs text-slate-400">Không thể thay đổi số CCCD sau khi đã tạo</p>
            ) : null}
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Đang xử lý...'
              : isEditing
                ? 'Cập nhật'
                : 'Tạo hồ sơ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
