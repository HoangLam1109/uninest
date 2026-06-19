import { zodResolver } from '@hookform/resolvers/zod'
import {
  Globe,
  Home,
  ImageOff,
  ImagePlus,
  MapPin,
  Receipt,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import { resolveRoomImageUrl } from '@/utils/room-display'
import {
  useDeleteRoomImage,
  useGetAmenities,
  useGetRoomImages,
  useSetPrimaryRoomImage,
  useUploadRoomImage,
} from '../hooks/use-rooms'
import {
  roomSchema,
  type RoomFormInput,
  type RoomFormValues,
} from '../schemas/room.schema'
import type {
  Amenity,
  Room,
  RoomPayload,
  RoomStatus,
  RoomType,
} from '../types/room.type'

const roomTypeOptions: Array<{ value: RoomType; label: string }> = [
  { value: 'STUDIO', label: 'Studio' },
  { value: 'SINGLE', label: 'Phòng đơn' },
  { value: 'SHARED', label: 'Phòng ghép' },
  { value: 'APARTMENT', label: 'Căn hộ' },
]

const statusOptions: Array<{ value: RoomStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Còn trống' },
  { value: 'DEPOSITED', label: 'Đã đặt cọc' },
  { value: 'RENTED', label: 'Đã thuê' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
]

const inputClassName =
  'h-11 rounded-xl border border-primary/10 px-3 text-sm shadow-none focus-visible:ring-2'
const imageInputClassName =
  'flex h-11 w-full items-center gap-3 rounded-xl border border-primary/10 bg-white px-3 text-sm transition focus-within:ring-2 focus-within:ring-ring'

function getAmenityId(amenity: string | Amenity) {
  return typeof amenity === 'string' ? amenity : amenity._id
}

function toDefaultValues(room?: Room | null): RoomFormInput {
  return {
    propertyId: room?.propertyId ?? '',
    amenityIds: room?.amenityIds?.map(getAmenityId) ?? [],
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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
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
    setValue,
    control,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: toDefaultValues(room),
  })
  const amenitiesQuery = useGetAmenities()
  const selectedAmenityIds = useWatch({ control, name: 'amenityIds' }) ?? []

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [order, setOrder] = useState(0)
  const [isPrimary, setIsPrimary] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const roomId = room?._id ?? null
  const imagesQuery = useGetRoomImages(roomId, open && Boolean(roomId))
  const uploadImage = useUploadRoomImage()
  const deleteImage = useDeleteRoomImage()
  const setPrimaryImage = useSetPrimaryRoomImage()
  const isImagePending =
    uploadImage.isPending || deleteImage.isPending || setPrimaryImage.isPending

  function toggleAmenity(amenityId: string) {
    const nextAmenityIds = selectedAmenityIds.includes(amenityId)
      ? selectedAmenityIds.filter((id) => id !== amenityId)
      : [...selectedAmenityIds, amenityId]

    setValue('amenityIds', nextAmenityIds, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function resetImageForm() {
    setImageFile(null)
    setCaption('')
    setOrder(0)
    setIsPrimary(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  function handleImageSubmit(event: FormEvent<HTMLFormElement>) {
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
        onSuccess: resetImageForm,
      },
    )
  }

  useEffect(() => {
    reset(toDefaultValues(room))
    resetImageForm()
  }, [reset, room, open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[94svh] max-w-6xl overflow-y-auto rounded-[28px] border border-primary/10 bg-slate-50 p-0 shadow-2xl"
    >
      <div className="overflow-hidden rounded-[28px]">
        <div className="border-b border-primary/10 bg-white px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">
                {room ? 'Chỉnh sửa phòng' : 'Tạo phòng mới'}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {room ? room.title || 'Cập nhật thông tin phòng' : 'Thiết lập phòng cho thuê'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Cập nhật thông tin hiển thị, giá thuê, địa chỉ và bộ ảnh phòng trong cùng một nơi.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {room ? 'Đang chỉnh sửa' : 'Bản nháp mới'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {roomId ? `${imagesQuery.data?.length ?? 0} ảnh` : 'Chưa có ảnh'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
          <form
            className="space-y-4 bg-slate-50 p-5 md:p-6"
            onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}
            noValidate
          >
            <SectionCard
              icon={<Home className="size-5" />}
              title="Thông tin cơ bản"
              description="Nhóm nội dung này quyết định cách phòng hiển thị ở danh sách và trang chi tiết."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Tên phòng"
                    htmlFor="room-title"
                    error={errors.title?.message}
                  >
                    <Input
                      id="room-title"
                      className={inputClassName}
                      placeholder="Phòng 101 - Ban công"
                      {...register('title')}
                    />
                  </Field>
                </div>

                <Field
                  label="Loại phòng"
                  htmlFor="room-type"
                  error={errors.roomType?.message}
                >
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

                <Field label="Trạng thái" htmlFor="room-status">
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

                <Field
                  label="Số người thuê"
                  htmlFor="room-max-occupants"
                  error={errors.maxOccupants?.message}
                >
                  <Input
                    id="room-max-occupants"
                    type="number"
                    className={inputClassName}
                    min={1}
                    {...register('maxOccupants')}
                  />
                </Field>

                <Field label="Diện tích" htmlFor="room-area-sqm">
                  <Input
                    id="room-area-sqm"
                    type="number"
                    className={inputClassName}
                    min={0}
                    placeholder="m2"
                    {...register('areaSqm')}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Mô tả" htmlFor="room-description">
                    <textarea
                      id="room-description"
                      className="min-h-28 w-full rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Mô tả nội thất, ánh sáng, ban công, giờ giấc..."
                      {...register('description')}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Receipt className="size-5" />}
              title="Chi phí và vận hành"
              description="Thiết lập mức thuê và các chi phí cơ bản để người xem nắm được tổng quan."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Giá thuê/tháng"
                  htmlFor="room-price-per-month"
                  error={errors.pricePerMonth?.message}
                >
                  <Input
                    id="room-price-per-month"
                    type="number"
                    className={inputClassName}
                    min={0}
                    {...register('pricePerMonth')}
                  />
                </Field>

                <Field label="Tiền cọc" htmlFor="room-deposit-amount">
                  <Input
                    id="room-deposit-amount"
                    type="number"
                    min={0}
                    className={inputClassName}
                    {...register('depositAmount')}
                  />
                </Field>

                <Field label="Mức điện" htmlFor="room-electricity-rate">
                  <Input
                    id="room-electricity-rate"
                    type="number"
                    className={inputClassName}
                    min={0}
                    {...register('electricityRate')}
                  />
                </Field>

                <Field label="Giá nước" htmlFor="room-water-rate">
                  <Input
                    id="room-water-rate"
                    type="number"
                    className={inputClassName}
                    min={0}
                    {...register('waterRate')}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Sparkles className="size-5" />}
              title="Tiện ích phòng"
              description="Chọn các tiện ích nổi bật để tăng độ rõ ràng khi hiển thị ngoài danh sách."
            >
              {amenitiesQuery.isLoading ? (
                <div className="rounded-xl border border-primary/10 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  Đang tải tiện ích...
                </div>
              ) : null}

              {!amenitiesQuery.isLoading && amenitiesQuery.data?.length === 0 ? (
                <div className="rounded-xl border border-primary/10 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  Chưa có tiện ích preset.
                </div>
              ) : null}

              {amenitiesQuery.data && amenitiesQuery.data.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {amenitiesQuery.data.map((amenity) => {
                    const checked = selectedAmenityIds.includes(amenity._id)
                    return (
                      <label
                        key={amenity._id}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                          checked
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-primary/10 bg-white text-slate-600 hover:border-primary/40',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={checked}
                          onChange={() => toggleAmenity(amenity._id)}
                        />
                        {amenity.name}
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              icon={<MapPin className="size-5" />}
              title="Địa chỉ và vị trí"
              description="Thông tin vị trí giúp khách tìm kiếm dễ hơn và hỗ trợ hiển thị bản đồ chính xác."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Thành phố" htmlFor="room-city">
                  <Input id="room-city" className={inputClassName} {...register('city')} />
                </Field>

                <Field label="Quận/huyện" htmlFor="room-district">
                  <Input
                    id="room-district"
                    className={inputClassName}
                    {...register('district')}
                  />
                </Field>

                <Field label="Phường/xã" htmlFor="room-ward">
                  <Input id="room-ward" className={inputClassName} {...register('ward')} />
                </Field>

                <Field label="Vĩ độ" htmlFor="room-latitude">
                  <Input
                    id="room-latitude"
                    type="number"
                    className={inputClassName}
                    step="any"
                    {...register('latitude')}
                  />
                </Field>

                <Field label="Kinh độ" htmlFor="room-longitude">
                  <Input
                    id="room-longitude"
                    type="number"
                    className={inputClassName}
                    step="any"
                    {...register('longitude')}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Địa chỉ"
                    htmlFor="room-address"
                    error={errors.address?.message}
                  >
                    <Input
                      id="room-address"
                      className={inputClassName}
                      placeholder="Số nhà, tên đường..."
                      {...register('address')}
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Globe className="size-5" />}
              title="Hiển thị"
              description="Kiểm soát việc công khai phòng trên hệ thống ngay sau khi lưu."
            >
              <label className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...register('isPublished')}
                />
                Hiển thị phòng trên hệ thống
              </label>
            </SectionCard>

            <div className="sticky bottom-0 z-10 -mx-5 border-t border-primary/10 bg-white/95 px-5 py-4 backdrop-blur md:-mx-6 md:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Đang lưu...' : 'Lưu phòng'}
                </Button>
              </div>
            </div>
          </form>

          <aside className="border-t border-primary/10 bg-white p-5 xl:border-l xl:border-t-0 xl:p-6">
            <div className="xl:sticky xl:top-6">
              <SectionCard
                icon={<ImagePlus className="size-5" />}
                title="Ảnh phòng"
                description="Quản lý ảnh ngay trong modal, chọn ảnh đại diện và sắp lại thứ tự hiển thị."
              >
                {!roomId ? (
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-slate-500">
                    Lưu phòng trước để bắt đầu tải ảnh lên.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {imagesQuery.isLoading ? (
                      <div className="rounded-2xl border border-dashed border-primary/20 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        Đang tải ảnh phòng...
                      </div>
                    ) : null}

                    {imagesQuery.isError ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                        Không thể tải danh sách ảnh.
                      </div>
                    ) : null}

                    {!imagesQuery.isLoading &&
                    !imagesQuery.isError &&
                    (imagesQuery.data?.length ?? 0) === 0 ? (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        <ImageOff className="mb-2 size-8 text-slate-400" />
                        Chưa có ảnh cho phòng này.
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {imagesQuery.data?.map((image) => (
                        <article
                          key={image._id}
                          className="overflow-hidden rounded-2xl border border-primary/10 bg-slate-50"
                        >
                          <div className="aspect-[4/3] bg-slate-100">
                            <img
                              src={resolveRoomImageUrl(image.url)}
                              alt={image.caption || 'Ảnh phòng'}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="space-y-3 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                                  {image.caption || 'Không có chú thích'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Thứ tự hiển thị: {image.order}
                                </p>
                              </div>
                              {image.isPrimary ? (
                                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
                                  Đại diện
                                </span>
                              ) : null}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={image.isPrimary || isImagePending}
                                onClick={() =>
                                  setPrimaryImage.mutate({
                                    roomId,
                                    imageId: image._id,
                                  })
                                }
                              >
                                <Star className="size-4" />
                                Chọn đại diện
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Xóa ảnh"
                                disabled={isImagePending}
                                onClick={() =>
                                  deleteImage.mutate({
                                    roomId,
                                    imageId: image._id,
                                  })
                                }
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <form className="space-y-4 rounded-2xl border border-primary/10 bg-slate-50 p-4" onSubmit={handleImageSubmit}>
                      <label htmlFor="room-image-file">
                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                          Ảnh phòng
                        </span>
                        <div className={imageInputClassName}>
                          <ImagePlus className="size-4 shrink-0 text-slate-400" />
                          <button
                            type="button"
                            className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/15"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            Chọn ảnh
                          </button>
                          <span className="min-w-0 flex-1 truncate text-slate-500">
                            {imageFile?.name ?? 'Chưa chọn ảnh'}
                          </span>
                          <input
                            id="room-image-file"
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) =>
                              setImageFile(event.target.files?.[0] ?? null)
                            }
                          />
                        </div>
                        {imageFile ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {imageFile.name} - {formatFileSize(imageFile.size)}
                          </p>
                        ) : null}
                      </label>

                      <Field label="Chú thích" htmlFor="room-image-caption">
                        <Input
                          id="room-image-caption"
                          className={inputClassName}
                          value={caption}
                          onChange={(event) => setCaption(event.target.value)}
                        />
                      </Field>

                      <Field label="Thứ tự hiển thị" htmlFor="room-image-order">
                        <Input
                          id="room-image-order"
                          type="number"
                          className={inputClassName}
                          min={0}
                          value={order}
                          onChange={(event) => setOrder(Number(event.target.value))}
                        />
                      </Field>

                      <label className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={isPrimary}
                          onChange={(event) => setIsPrimary(event.target.checked)}
                        />
                        Đặt làm ảnh đại diện
                      </label>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={resetImageForm}>
                          Xóa lựa chọn
                        </Button>
                        <Button type="submit" disabled={isImagePending || !imageFile}>
                          <Upload className="size-4" />
                          {uploadImage.isPending ? 'Đang tải lên...' : 'Thêm ảnh'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </SectionCard>
            </div>
          </aside>
        </div>
      </div>
    </Modal>
  )
}
