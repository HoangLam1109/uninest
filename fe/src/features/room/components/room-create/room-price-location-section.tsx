import { MapPin } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { RoomFormInput } from '../../schemas/room.schema'
import { Field, inputClassName, SectionHeading } from './room-create-shared'

export function RoomPriceLocationSection({
  register,
  errors,
}: {
  register: UseFormRegister<RoomFormInput>
  errors: FieldErrors<RoomFormInput>
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm md:p-6 xl:p-7 2xl:p-8">
      <SectionHeading
        icon={<MapPin className="size-5" />}
        title="Giá & địa chỉ"
        description="Thông tin này được dùng để lọc và hiển thị trên danh sách phòng."
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:gap-5 2xl:grid-cols-3">
        <Field label="Giá thuê/tháng" error={errors.pricePerMonth?.message}>
          <Input
            id="room-price-per-month"
            type="number"
            min={0}
            className={inputClassName}
            {...register('pricePerMonth')}
          />
        </Field>

        <Field label="Tiền cọc">
          <Input
            id="room-deposit-amount"
            type="number"
            min={0}
            className={inputClassName}
            {...register('depositAmount')}
          />
        </Field>

        <Field label="Diện tích">
          <Input
            id="room-area-sqm"
            type="number"
            min={0}
            className={inputClassName}
            placeholder="m2"
            {...register('areaSqm')}
          />
        </Field>

        <Field label="Số người thuê" error={errors.maxOccupants?.message}>
          <Input
            id="room-max-occupants"
            type="number"
            min={1}
            className={inputClassName}
            {...register('maxOccupants')}
          />
        </Field>

        <Field label="Mức điện">
          <Input
            id="room-electricity-rate"
            type="number"
            min={0}
            className={inputClassName}
            {...register('electricityRate')}
          />
        </Field>

        <Field label="Hóa đơn nước">
          <Input
            id="room-water-rate"
            type="number"
            min={0}
            className={inputClassName}
            {...register('waterRate')}
          />
        </Field>

        <Field label="Thành phố">
          <Input id="room-city" className={inputClassName} {...register('city')} />
        </Field>

        <Field label="Quận/Huyện">
          <Input
            id="room-district"
            className={inputClassName}
            {...register('district')}
          />
        </Field>

        <Field label="Phường/Xã">
          <Input id="room-ward" className={inputClassName} {...register('ward')} />
        </Field>

        <Field
          label="Địa chỉ"
          error={errors.address?.message}
          className="md:col-span-2 2xl:col-span-3"
        >
          <Input id="room-address" className={inputClassName} {...register('address')} />
        </Field>
      </div>
    </section>
  )
}
