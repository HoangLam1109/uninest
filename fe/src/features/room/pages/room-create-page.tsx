import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MainLayout } from '@/layouts/main-layout'
import { RoomBasicInfoSection } from '../components/room-create/room-basic-info-section'
import { RoomCreateHeader } from '../components/room-create/room-create-header'
import { RoomCreatePreviewCard } from '../components/room-create/room-create-preview-card'
import { RoomImageUploaderSection } from '../components/room-create/room-image-uploader-section'
import { RoomPriceLocationSection } from '../components/room-create/room-price-location-section'
import {
  roomImageFileSchema,
  roomSchema,
  selectedRoomImagesDraftSchema,
  selectedRoomImagesSubmitSchema,
  type RoomFormInput,
  type RoomFormValues,
  type SelectedRoomImage,
} from '../schemas/room.schema'
import { useCreateRoomWithImages, useGetAmenities } from '../hooks/use-rooms'
import type { RoomPayload, RoomStatus, RoomType } from '../types/room.type'

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

const defaultValues: RoomFormInput = {
  propertyId: '',
  amenityIds: [],
  title: '',
  description: '',
  address: '',
  city: '',
  district: '',
  ward: '',
  pricePerMonth: 0,
  maxOccupants: 1,
  status: 'AVAILABLE',
  isPublished: true,
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

function createImageId(file: File) {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `${file.name}-${file.lastModified}-${randomId}`
}

function getSchemaErrorMessage(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? 'Dữ liệu không hợp lệ'
}

function buildSelectedImages(files: File[]): SelectedRoomImage[] {
  return files.map((file) => ({
    id: createImageId(file),
    file,
    previewUrl: URL.createObjectURL(file),
    caption: '',
    isPrimary: false,
  }))
}

export function RoomCreatePage() {
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<SelectedRoomImage[]>([])
  const [images, setImages] = useState<SelectedRoomImage[]>([])
  const createRoom = useCreateRoomWithImages()
  const amenitiesQuery = useGetAmenities()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues,
  })

  const selectedAmenityIds = useWatch({ control, name: 'amenityIds' }) ?? []
  const title = useWatch({ control, name: 'title' })
  const address = useWatch({ control, name: 'address' })
  const district = useWatch({ control, name: 'district' })
  const ward = useWatch({ control, name: 'ward' })
  const city = useWatch({ control, name: 'city' })
  const pricePerMonth = useWatch({ control, name: 'pricePerMonth' })
  const areaSqm = useWatch({ control, name: 'areaSqm' })
  const maxOccupants = useWatch({ control, name: 'maxOccupants' })
  const roomType = useWatch({ control, name: 'roomType' })
  const isPublished = useWatch({ control, name: 'isPublished' })

  const primaryImage = images.find((image) => image.isPrimary)
  const selectedRoomType = roomTypeOptions.find((option) => option.value === roomType)
  const location = [address, ward, district, city].filter(Boolean).join(', ')

  const completionItems = useMemo(
    () => [
      { label: 'Thông tin cơ bản', done: Boolean(title && pricePerMonth) },
      { label: 'Địa chỉ hiển thị', done: Boolean(address) },
      { label: 'Ảnh phòng', done: images.length > 0 },
      { label: 'Sẵn sàng đăng', done: Boolean(isPublished) },
    ],
    [address, images.length, isPublished, pricePerMonth, title],
  )

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [])

  function toggleAmenity(amenityId: string) {
    const nextAmenityIds = selectedAmenityIds.includes(amenityId)
      ? selectedAmenityIds.filter((id) => id !== amenityId)
      : [...selectedAmenityIds, amenityId]

    setValue('amenityIds', nextAmenityIds, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function handleImageSelect(files: FileList | null) {
    if (!files?.length) return

    const imageFiles = Array.from(files)
    const invalidFile = imageFiles
      .map((file) => roomImageFileSchema.safeParse(file))
      .find((result) => !result.success)

    if (invalidFile && !invalidFile.success) {
      toast.error(getSchemaErrorMessage(invalidFile.error))
      return
    }

    setImages((currentImages) => {
      const nextImages = buildSelectedImages(imageFiles)
      const nextState = [...currentImages, ...nextImages]
      const validationResult = selectedRoomImagesDraftSchema.safeParse(nextState)

      if (!validationResult.success) {
        nextImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
        toast.error(getSchemaErrorMessage(validationResult.error))
        return currentImages
      }

      return validationResult.data
    })

    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleImageSelect(event.currentTarget.files)
    event.currentTarget.value = ''
  }

  function updateImageCaption(imageId: string, caption: string) {
    setImages((currentImages) =>
      currentImages.map((image) =>
        image.id === imageId ? { ...image, caption } : image,
      ),
    )
  }

  function setPrimaryImage(imageId: string) {
    setImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      })),
    )
  }

  function removeImage(imageId: string) {
    setImages((currentImages) => {
      const removedImage = currentImages.find((image) => image.id === imageId)
      if (removedImage) URL.revokeObjectURL(removedImage.previewUrl)

      return currentImages.filter((image) => image.id !== imageId)
    })
  }

  async function submitRoom(values: RoomFormValues) {
    const imageValidationResult = selectedRoomImagesSubmitSchema.safeParse(images)
    if (!imageValidationResult.success) {
      toast.error(getSchemaErrorMessage(imageValidationResult.error), {
        description: 'Nhấn vào một ảnh đã tải lên để đặt làm ảnh đại diện.',
      })
      return
    }

    await createRoom.mutateAsync({
      room: toPayload(values),
      images: imageValidationResult.data.map((image) => ({
        image: image.file,
        caption: image.caption.trim() || undefined,
        isPrimary: image.isPrimary,
      })),
    })

    toast.success('Tin đăng đã sẵn sàng', {
      description: images.length
        ? 'Phòng và ảnh đã được lưu vào hệ thống.'
        : 'Phòng đã được lưu, bạn có thể bổ sung ảnh sau.',
    })
    navigate('/chu-nha/phong')
  }

  return (
    <MainLayout>
      <div className="bg-white">
        <RoomCreateHeader completionItems={completionItems} />

        <form
          className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10 xl:max-w-[88rem] xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-8 xl:px-20 xl:py-10 2xl:max-w-[96rem] 2xl:grid-cols-[minmax(0,1fr)_460px] 2xl:gap-10 2xl:px-24 2xl:py-12"
          onSubmit={handleSubmit(submitRoom)}
          noValidate
        >
          <div className="space-y-6 xl:space-y-8">
            <RoomBasicInfoSection
              register={register}
              errors={errors}
              amenities={amenitiesQuery.data}
              amenitiesLoading={amenitiesQuery.isLoading}
              selectedAmenityIds={selectedAmenityIds}
              roomTypeOptions={roomTypeOptions}
              statusOptions={statusOptions}
              onToggleAmenity={toggleAmenity}
            />

            <RoomPriceLocationSection register={register} errors={errors} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start xl:top-28 xl:space-y-8">
            <RoomImageUploaderSection
              images={images}
              imageInputRef={imageInputRef}
              onImageInputChange={handleImageInputChange}
              onSetPrimaryImage={setPrimaryImage}
              onRemoveImage={removeImage}
              onUpdateCaption={updateImageCaption}
              formatFileSize={formatFileSize}
            />

            <RoomCreatePreviewCard
              primaryImage={primaryImage}
              title={title}
              location={location}
              pricePerMonth={Number(pricePerMonth) || 0}
              areaSqm={Number(areaSqm) || 0}
              maxOccupants={Number(maxOccupants) || 1}
              roomTypeLabel={selectedRoomType?.label}
              register={register}
              isSubmitting={createRoom.isPending}
            />
          </aside>
        </form>
      </div>
    </MainLayout>
  )
}
