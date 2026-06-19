import { Home } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { RoomFormInput } from '../../schemas/room.schema'
import type { Amenity, RoomStatus, RoomType } from '../../types/room.type'
import { Field, inputClassName, SectionHeading } from './room-create-shared'

export function RoomBasicInfoSection({
  register,
  errors,
  amenities,
  amenitiesLoading,
  selectedAmenityIds,
  roomTypeOptions,
  statusOptions,
  onToggleAmenity,
}: {
  register: UseFormRegister<RoomFormInput>
  errors: FieldErrors<RoomFormInput>
  amenities?: Amenity[]
  amenitiesLoading: boolean
  selectedAmenityIds: string[]
  roomTypeOptions: Array<{ value: RoomType; label: string }>
  statusOptions: Array<{ value: RoomStatus; label: string }>
  onToggleAmenity: (amenityId: string) => void
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm md:p-6 xl:p-7 2xl:p-8">
      <SectionHeading
        icon={<Home className="size-5" />}
        title="Thông tin phòng"
        description="Nhập tên phòng, tiện ích và mô tả nổi bật."
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:gap-5 2xl:grid-cols-3">
        <Field
          label="Tên phòng"
          error={errors.title?.message}
          className="md:col-span-2 2xl:col-span-3"
        >
          <Input
            id="room-title"
            className={inputClassName}
            placeholder="Phòng 101 - ban công thoáng"
            {...register('title')}
          />
        </Field>

        <Field label="Loại phòng">
          <select
            id="room-type"
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
        </Field>

        <Field label="Trạng thái">
          <select
            id="room-status"
            className={`${inputClassName} w-full bg-white`}
            {...register('status')}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="md:col-span-2 2xl:col-span-3">
          <legend className="mb-2 block text-sm font-semibold text-foreground">
            Tiện ích phòng
          </legend>
          {amenitiesLoading ? (
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-sm text-muted-foreground">
              Đang tải tiện ích...
            </div>
          ) : null}
          {!amenitiesLoading && amenities?.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface px-3 py-3 text-sm text-muted-foreground">
              Chưa có tiện ích preset.
            </div>
          ) : null}
          {amenities && amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => {
                const checked = selectedAmenityIds.includes(amenity._id)
                return (
                  <label
                    key={amenity._id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      checked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-white text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={checked}
                      onChange={() => onToggleAmenity(amenity._id)}
                    />
                    {amenity.name}
                  </label>
                )
              })}
            </div>
          ) : null}
        </fieldset>

        <label className="md:col-span-2 2xl:col-span-3" htmlFor="room-description">
          <span className="mb-1.5 block text-sm font-semibold text-foreground">
            Mô tả
          </span>
          <textarea
            id="room-description"
            className="min-h-28 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Mô tả nội thất, giờ giấc, khu vực xung quanh..."
            {...register('description')}
          />
        </label>
      </div>
    </section>
  )
}
