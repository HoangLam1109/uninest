import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { USER_ROLES } from '@/constants/roles'
import { MainLayout } from '@/layouts/main-layout'
import { BookingRequestModal } from '@/features/booking'
import { useCreateRoomConversation } from '@/features/chat'
import { useAuth } from '@/hooks/use-auth'
import {
  useCreateRoomReview,
  useGetRoomById,
  useGetRoomImages,
  useGetRoomReviews,
  useReplyRoomReview,
} from '../hooks/use-rooms'
import {
  formatRoomCurrency,
  formatRoomFullLocation,
  formatRoomType,
  getRoomAmenityNames,
} from '../../../utils/room-display'
import type { RoomImage } from '../types/room.type'
import { RoomLocationMap } from '../components/room-location-map'
import { RoomFavoriteButton } from '../components/room-favorite-button'
import { RoomReviewsSection } from '../components/room-reviews-section'

function sortImages(images: RoomImage[]) {
  return [...images].sort((first, second) => {
    if (first.isPrimary && !second.isPrimary) return -1
    if (!first.isPrimary && second.isPrimary) return 1
    return first.order - second.order
  })
}

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const roomQuery = useGetRoomById(id ?? null)
  const imagesQuery = useGetRoomImages(id ?? null)
  const reviewsQuery = useGetRoomReviews(id ?? null, { page: 1, limit: 10 })
  const createRoomReview = useCreateRoomReview()
  const replyRoomReview = useReplyRoomReview()
  const createRoomConversation = useCreateRoomConversation()
  const room = roomQuery.data
  const images = sortImages(imagesQuery.data ?? [])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const selectedImage =
    images.find((image) => image._id === selectedImageId) ?? images[0]
  const amenityNames = room ? getRoomAmenityNames(room) : []

  async function handleOpenChat() {
    if (!room?._id) return
    const conversation = await createRoomConversation.mutateAsync(room._id)
    navigate(`/cu-dan/tin-nhan?conversationId=${conversation._id}`)
  }

  return (
    <MainLayout>
      <section className="bg-surface px-6 py-10 lg:px-20 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/phong">
              <ArrowLeft className="size-4" />
              Quay lai danh sách
            </Link>
          </Button>

          {roomQuery.isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="h-[460px] animate-pulse rounded-xl bg-border/60" />
              <div className="h-80 animate-pulse rounded-xl bg-border/60" />
            </div>
          ) : null}

          {roomQuery.isError ? (
            <div className="rounded-xl border border-red-500/20 bg-white p-8 text-center text-sm text-red-600">
              Không thể tải thông tin phòng.
            </div>
          ) : null}

          {!roomQuery.isLoading && !roomQuery.isError && !room ? (
            <div className="rounded-xl border border-primary/10 bg-white p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy phòng.
            </div>
          ) : null}

          {room ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-4">
                <div className="flex aspect-[16/10] max-h-[520px] min-h-[280px] items-center justify-center overflow-hidden rounded-xl bg-border/60">
                  {selectedImage ? (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.caption || room.title}
                      className="size-full object-cover object-center"
                      decoding="async"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-muted-foreground">
                      Phòng chưa có ảnh đại diện
                    </div>
                  )}
                </div>

                {images.length > 1 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {images.slice(0, 5).map((image) => {
                      const isSelected = image._id === selectedImage?._id

                      return (
                        <button
                          key={image._id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedImageId(image._id)}
                          className={`aspect-[4/3] overflow-hidden rounded-lg bg-border/60 ring-offset-2 transition hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.caption || room.title}
                            className="size-full object-cover object-center"
                            decoding="async"
                          />
                        </button>
                      )
                    })}
                  </div>
                ) : null}

                <article className="rounded-xl border border-primary/10 bg-white p-5">
                  <h2 className="text-xl font-bold text-foreground">Mô tả phòng</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {room.description || 'Phòng này chưa có mô tả chi tiết.'}
                  </p>
                </article>

                {amenityNames.length > 0 ? (
                  <article className="rounded-xl border border-primary/10 bg-white p-5">
                    <h2 className="text-xl font-bold text-foreground">Tiện ích</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {amenityNames.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
                        >
                          <CheckCircle2 className="size-4" />
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </article>
                ) : null}

                <RoomLocationMap
                  address={formatRoomFullLocation(room)}
                  title={room.title}
                />

                <RoomReviewsSection
                  reviews={reviewsQuery.data?.data ?? []}
                  statistics={reviewsQuery.data?.statistics}
                  isLoading={reviewsQuery.isLoading}
                  isError={reviewsQuery.isError}
                  isSubmitting={createRoomReview.isPending}
                  canReply={user?.role === USER_ROLES.LANDLORD}
                  replyingReviewId={
                    replyRoomReview.variables?.reviewId && replyRoomReview.isPending
                      ? replyRoomReview.variables.reviewId
                      : null
                  }
                  onSubmitReview={async ({ rating, comment }) => {
                    await createRoomReview.mutateAsync({
                      roomId: room._id,
                      rating,
                      comment,
                    })
                  }}
                  onSubmitReply={async ({ reviewId, reply }) => {
                    await replyRoomReview.mutateAsync({
                      reviewId,
                      payload: { reply },
                    })
                  }}
                />
              </div>

              <aside className="relative h-fit rounded-xl border border-primary/10 bg-white p-5">
                <RoomFavoriteButton roomId={room._id} />
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
                  Chi tiết phòng
                </p>
                <h1 className="mt-2 text-3xl font-bold text-foreground">
                  {room.title}
                </h1>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {formatRoomFullLocation(room)}
                </p>

                <div className="mt-6 rounded-xl bg-primary/10 p-4">
                  <p className="text-sm font-semibold text-primary">Giá thuê</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {formatRoomCurrency(room.pricePerMonth)}
                    <span className="text-sm font-normal">/tháng</span>
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Diện tích</p>
                    <p className="mt-1 font-bold text-foreground">
                      {room.areaSqm ?? 0} m2
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Số người</p>
                    <p className="mt-1 flex items-center gap-1 font-bold text-foreground">
                      <Users className="size-4" />
                      {room.maxOccupants}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Tiền cọc</p>
                    <p className="mt-1 font-bold text-foreground">
                      {formatRoomCurrency(room.depositAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <p className="text-muted-foreground">Loại phòng</p>
                    <p className="mt-1 font-bold text-foreground">
                      {formatRoomType(room.roomType)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {room.electricityRate ? (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      Dien: {formatRoomCurrency(room.electricityRate)}
                    </p>
                  ) : null}
                  {room.waterRate ? (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      Nuoc: {formatRoomCurrency(room.waterRate)}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  className="mt-6 w-full"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Đặt phòng
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleOpenChat}
                  disabled={createRoomConversation.isPending}
                >
                  <MessageCircle className="size-4" />
                  Nhắn tin chủ phòng
                </Button>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
      {room ? (
        <BookingRequestModal
          open={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          roomId={room._id}
          roomTitle={room.title}
        />
      ) : null}
    </MainLayout>
  )
}
