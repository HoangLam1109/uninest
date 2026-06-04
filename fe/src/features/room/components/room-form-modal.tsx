import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  roomSchema,
  type RoomFormInput,
  type RoomFormValues,
} from '../schemas/room.schema'
import type { Room, RoomPayload, RoomStatus, RoomType } from '../types/room.type'
import { MinusCircle, PlusCircle } from 'lucide-react'

const roomTypeOptions: Array<{ value: RoomType; label: string }> = [
  { value: 'STUDIO', label: 'Studio' },
  { value: 'SINGLE', label: 'Phòng đơn' },
  { value: 'SHARED', label: 'Phòng ghép' },
  { value: 'APARTMENT', label: 'Căn hộ' },
]

const statusOptions: Array<{ value: RoomStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Còn trống' },
  { value: 'RENTED', label: 'Đã thuê' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
]

const inputClassName =
  'h-11 rounded-lg border border-primary/10 px-3 text-sm shadow-none focus-visible:ring-2'

function toDefaultValues(room?: Room | null): RoomFormInput {
  return {
    title: room?.title ?? '',
    description: room?.description ?? '',
    address: room?.address ?? '',
    city: room?.city ?? '',
    district: room?.district ?? '',
    pricePerMonth: room?.pricePerMonth ?? 0,
    depositAmount: room?.depositAmount,
    areaSqm: room?.areaSqm,
    maxOccupants: room?.maxOccupants ?? 1,
    tenants:
      room?.tenants?.map((t) => ({
        tenantId:
          typeof t.tenantId === 'string'
            ? t.tenantId
            : t.tenantId._id,
        isPrimaryTenant: t.isPrimaryTenant,
      })) ?? [],
    roomType: room?.roomType,
    status: room?.status ?? 'AVAILABLE',
    isPublished: room?.isPublished ?? false,
  }
}

function toPayload(values: RoomFormValues): RoomPayload {
  return {
    ...values,
    description: values.description || undefined,
    city: values.city || undefined,
    district: values.district || undefined,
  }
}

type RoomFormModalProps = {
  open: boolean
  room?: Room | null
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: RoomPayload) => void
}

export function RoomFormModal({
  open,
  room,
  isPending,
  onClose,
  onSubmit,
}: RoomFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: toDefaultValues(room),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tenants',
  })

  useEffect(() => {
    reset(toDefaultValues(room))
  }, [reset, room, open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={room ? 'Cập nhật phòng' : 'Thêm phòng mới'}
      className="max-h-[92svh] max-w-3xl overflow-y-auto rounded-xl"
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}
        noValidate
      >
        <label className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tên phòng
          </span>
          <Input
            className={inputClassName}
            placeholder="Phòng 101 - Ban công"
            {...register('title')}
          />
          {errors.title ? (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          ) : null}
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Giá thuê / tháng
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={0}
            {...register('pricePerMonth')}
          />
          {errors.pricePerMonth ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.pricePerMonth.message}
            </p>
          ) : null}
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tiền cọc
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={0}
            {...register('depositAmount')}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Diện tích
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={0}
            placeholder="m2"
            {...register('areaSqm')}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Số người tối đa
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={1}
            {...register('maxOccupants')}
          />
          {errors.maxOccupants ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.maxOccupants.message}
            </p>
          ) : null}
        </label>

        {/* ---------- Tenants ---------- */}
        <fieldset className="md:col-span-2 space-y-3 rounded-lg border border-primary/10 p-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-slate-700">
              Người thuê ({fields.length})
            </legend>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ tenantId: '', isPrimaryTenant: false })}
            >
              <PlusCircle className="size-4" />
              Thêm người thuê
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-slate-500">
              Chưa có người thuê nào. Nhấn "Thêm người thuê" để gán người thuê vào phòng.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 rounded-lg border border-primary/10 bg-slate-50 p-3"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      ID người thuê
                    </label>
                    <Input
                      className="h-10 border border-primary/10 px-3 text-sm shadow-none"
                      placeholder="Nhập ID người dùng"
                      {...register(`tenants.${index}.tenantId`)}
                    />
                    {errors.tenants?.[index]?.tenantId ? (
                      <p className="text-xs text-red-600">
                        {errors.tenants[index]!.tenantId!.message}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex shrink-0 items-center gap-2 pt-6 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      {...register(`tenants.${index}.isPrimaryTenant`)}
                    />
                    Thuê chính
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5 shrink-0 text-red-500 hover:text-red-700"
                    aria-label="Xóa người thuê"
                    onClick={() => remove(index)}
                  >
                    <MinusCircle className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {errors.tenants?.root ? (
            <p className="text-xs text-red-600">{errors.tenants.root.message}</p>
          ) : null}
          {errors.tenants && !Array.isArray(errors.tenants) && 'message' in errors.tenants ? (
            <p className="text-xs text-red-600">
              {(errors.tenants as { message?: string }).message}
            </p>
          ) : null}
        </fieldset>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Loại phòng
          </span>
          <select
            className={`${inputClassName} w-full bg-white`}
            {...register('roomType', {
              setValueAs: (value) => value || undefined,
            })}
          >
            <option value="">Chưa chọn</option>
            {roomTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Trạng thái
          </span>
          <select className={`${inputClassName} w-full bg-white`} {...register('status')}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Thành phố
          </span>
          <Input className={inputClassName} {...register('city')} />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Quận/Huyện
          </span>
          <Input className={inputClassName} {...register('district')} />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Địa chỉ
          </span>
          <Input className={inputClassName} {...register('address')} />
          {errors.address ? (
            <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
          ) : null}
        </label>

        <label className="md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Mô tả
          </span>
          <textarea
            className="min-h-24 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('description')}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register('isPublished')}
          />
          Hiển thị phòng trên hệ thống
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end md:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
