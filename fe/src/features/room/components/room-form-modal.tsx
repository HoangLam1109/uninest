import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  roomSchema,
  type RoomFormInput,
  type RoomFormValues,
} from '../schemas/room.schema'
import type { Room, RoomPayload, RoomStatus, RoomType } from '../types/room.type'


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
    propertyId: room?.propertyId ?? '',
    amenityIds: room?.amenityIds?.join(', ') ?? '',
    title: room?.title ?? '',
    description: room?.description ?? '',
    address: room?.address ?? '',
    city: room?.city ?? '',
    district: room?.district ?? '',
    ward: room?.ward ?? '',
    latitude: room?.latitude,
    longitude: room?.longitude,
    pricePerMonth: room?.pricePerMonth ?? 0,
    depositAmount: room?.depositAmount,
    electricityRate: room?.electricityRate,
    waterRate: room?.waterRate,
    areaSqm: room?.areaSqm,
    maxOccupants: room?.maxOccupants ?? 1,
    roomType: room?.roomType,
    status: room?.status ?? 'AVAILABLE',
    isPublished: room?.isPublished ?? false,
  }
}

function toPayload(values: RoomFormValues): RoomPayload {
  return {
    ...values,
    propertyId: values.propertyId || undefined,
    description: values.description || undefined,
    city: values.city || undefined,
    district: values.district || undefined,
    ward: values.ward || undefined,
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
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: toDefaultValues(room),
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
            Giá thuê/tháng
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
            min={0}
            className={inputClassName}
            {...register('depositAmount')}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Mức điện
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={0}
            {...register('electricityRate')}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Hóa đơn nước
          </span>
          <Input
            type="number"
            className={inputClassName}
            min={0}
            {...register('waterRate')}
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
            Số người thuê
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
            Quận/huyện
          </span>
          <Input className={inputClassName} {...register('district')} />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Phường/xã
          </span>
          <Input className={inputClassName} {...register('ward')} />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Bề ngang
          </span>
          <Input
            type="number"
            className={inputClassName}
            step="any"
            {...register('latitude')}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Bề dài
          </span>
          <Input
            type="number"
            className={inputClassName}
            step="any"
            {...register('longitude')}
          />
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
            Huy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu phòng'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
