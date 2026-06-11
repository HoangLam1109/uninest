import { useState, useRef, type ComponentProps } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  identityFormSchema,
  type IdentityFormValues,
} from '../schemas/identity.schema'
import { useCreateIdentity, useUpdateIdentity } from '../hooks/use-identities'
import type { Identity } from '../types/identity.type'

type IdentityFormModalProps = {
  open: boolean
  onClose: () => void
  existingIdentity?: Identity | null
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
}: IdentityFormModalProps) {
  const createIdentity = useCreateIdentity()
  const updateIdentity = useUpdateIdentity()
  const isEditing = Boolean(existingIdentity)

  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    control,
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
          coTenants: existingIdentity.coTenants ?? [],
        }
      : {
          fullName: '',
          phone: '',
          cccdNumber: '',
          dateOfBirth: '',
          coTenants: [],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'coTenants',
  })

  const handleClose = () => {
    reset()
    setFrontFile(null)
    setBackFile(null)
    onClose()
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
              coTenants: values.coTenants,
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
            coTenants: values.coTenants,
          },
          { onSuccess: handleClose },
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
            <Input {...register('fullName')} placeholder="Nguyễn Văn A" />
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
              <Input {...register('phone')} placeholder="0901234567" />
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

        {/* Co-tenants */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Người thuê cùng</p>
            <Button
              type="button"
              variant="ghost"
              className="h-auto gap-1 px-2 py-1 text-xs text-primary"
              onClick={() =>
                append({ fullName: '', phone: '', dateOfBirth: '', cccdNumber: '' })
              }
            >
              <Plus className="size-3" />
              Thêm
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-slate-400">
              Chưa có người thuê cùng. Nhấn &quot;Thêm&quot; nếu có người ở cùng.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      Người thuê #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-1 text-red-500 hover:text-red-700"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Input
                      {...register(`coTenants.${index}.fullName`)}
                      placeholder="Họ tên *"
                      className="h-9 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        {...register(`coTenants.${index}.dateOfBirth`)}
                        className="h-9 text-sm"
                      />
                      <Input
                        {...register(`coTenants.${index}.phone`)}
                        placeholder="Số điện thoại"
                        className="h-9 text-sm"
                      />
                    </div>
                    <Input
                      {...register(`coTenants.${index}.cccdNumber`)}
                      placeholder="CCCD/CMND"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
