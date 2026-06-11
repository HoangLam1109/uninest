import { useState, type FormEvent } from 'react'
import { MessageSquare, Send, Star } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { RoomReview, RoomReviewStatistics } from '../types/room.type'

function getReviewerName(review: RoomReview) {
  const reviewer = review.reviewerId
  if (typeof reviewer === 'object' && reviewer?.fullName) {
    return reviewer.fullName
  }
  return 'Nguoi thue'
}

function formatReviewDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function StarRating({
  rating,
  className = '',
}: {
  rating: number
  className?: string
}) {
  const normalized = Math.round(Math.min(5, Math.max(0, rating)))

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating}/5 sao`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < normalized
        return (
          <Star
            key={index}
            className={`size-4 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
          />
        )
      })}
    </div>
  )
}

function RatingBars({ statistics }: { statistics?: RoomReviewStatistics }) {
  const total = statistics?.reviewCount ?? 0

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count =
          statistics?.ratingDistribution?.find((item) => Number(item._id) === star)
            ?.count ?? 0
        const percent = total > 0 ? (count / total) * 100 : 0

        return (
          <div
            key={star}
            className="grid grid-cols-[44px_minmax(0,1fr)_28px] items-center gap-2 text-xs text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{star} sao</span>
            <div className="h-2 overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ReviewForm({
  rating,
  comment,
  isSubmitting,
  isCommentValid,
  minCommentLength,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: {
  rating: number
  comment: string
  isSubmitting: boolean
  isCommentValid: boolean
  minCommentLength: number
  onRatingChange: (rating: number) => void
  onCommentChange: (comment: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const trimmedLength = comment.trim().length
  const missingLength = Math.max(0, minCommentLength - trimmedLength)

  return (
    <form
      className="mt-5 rounded-lg border border-primary/10 bg-white p-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Viết đánh giá của bạn
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Đánh giá của bạn sẽ giúp chủ phòng cải thiện chất lượng dịch vụ. Vui lòng cung cấp phản hồi chân thật và chi tiết.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1
            const isActive = value <= rating

            return (
              <button
                key={value}
                type="button"
                className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${value} sao`}
                aria-pressed={isActive}
                onClick={() => onRatingChange(value)}
              >
                <Star
                  className={`size-6 ${
                    isActive ? 'fill-amber-400 text-amber-400' : 'text-border'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder="Chia sẻ trải nghiệm của bạn về phòng..."
        className="mt-4 min-h-28 w-full resize-y rounded-lg bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={1000}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p
          className={`text-xs ${
            missingLength > 0 ? 'text-red-600' : 'text-muted-foreground'
          }`}
        >
          {missingLength > 0
            ? `Cần thêm ${missingLength} ký tự để gửi đánh giá.`
            : `Hợp lệ. Còn lại ${1000 - comment.length} ký tự.`}
        </p>
        <Button
          type="submit"
          disabled={!isCommentValid || isSubmitting}
          className="min-w-32"
        >
          <Send className="size-4" />
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </div>
    </form>
  )
}

function ReviewCard({
  review,
  canReply,
  isReplying,
  onSubmitReply,
}: {
  review: RoomReview
  canReply: boolean
  isReplying: boolean
  onSubmitReply?: (payload: { reviewId: string; reply: string }) => Promise<void> | void
}) {
  const reviewerName = getReviewerName(review)
  const reviewDate = formatReviewDate(review.createdAt)
  const [reply, setReply] = useState('')
  const isReplyValid = reply.trim().length > 0

  async function handleReplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onSubmitReply || !isReplyValid || isReplying) return

    try {
      await onSubmitReply({
        reviewId: review._id,
        reply: reply.trim(),
      })
      setReply('')
    } catch {
      // Mutation displays the API error toast; keep the reply content for editing.
    }
  }

  return (
    <article className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar name={reviewerName} className="size-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="truncate text-sm font-bold text-foreground">
                {reviewerName}
              </h4>
              {reviewDate ? (
                <p className="text-xs text-muted-foreground">{reviewDate}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-sm font-bold text-amber-600">
              {review.rating.toFixed(1)}
              <Star className="size-3 fill-amber-500 text-amber-500" />
            </div>
          </div>

          <StarRating rating={review.rating} className="mt-2" />
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {review.comment}
          </p>

          {review.landlordReply ? (
            <div className="mt-3 rounded-lg border-l-4 border-primary bg-surface p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <MessageSquare className="size-4 text-primary" />
                Phản hồi chủ phòng
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {review.landlordReply}
              </p>
            </div>
          ) : null}

          {!review.landlordReply && canReply ? (
            <form
              className="mt-3 rounded-lg border border-primary/10 bg-surface p-3"
              onSubmit={handleReplySubmit}
            >
              <label
                htmlFor={`review-reply-${review._id}`}
                className="flex items-center gap-2 text-sm font-bold text-foreground"
              >
                <MessageSquare className="size-4 text-primary" />
                Phan hoi review
              </label>
              <textarea
                id={`review-reply-${review._id}`}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Nhap phan hoi cua chu phong..."
                className="mt-3 min-h-20 w-full resize-y rounded-lg bg-white px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={1000}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Con lai {1000 - reply.length} ky tu.
                </p>
                <Button
                  type="submit"
                  disabled={!isReplyValid || isReplying}
                  className="min-w-28"
                >
                  <Send className="size-4" />
                  {isReplying ? 'Dang gui...' : 'Gui phan hoi'}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  )
}

type RoomReviewsSectionProps = {
  reviews: RoomReview[]
  statistics?: RoomReviewStatistics
  isLoading?: boolean
  isError?: boolean
  isSubmitting?: boolean
  canReply?: boolean
  replyingReviewId?: string | null
  onSubmitReview?: (payload: { rating: number; comment: string }) => Promise<void> | void
  onSubmitReply?: (payload: { reviewId: string; reply: string }) => Promise<void> | void
}

export function RoomReviewsSection({
  reviews,
  statistics,
  isLoading = false,
  isError = false,
  isSubmitting = false,
  canReply = false,
  replyingReviewId = null,
  onSubmitReview,
  onSubmitReply,
}: RoomReviewsSectionProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const minCommentLength = 10
  const reviewCount = statistics?.reviewCount ?? reviews.length
  const averageRating = statistics?.averageRating ?? 0
  const isCommentValid = comment.trim().length >= minCommentLength

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onSubmitReview || !isCommentValid || isSubmitting) return

    try {
      await onSubmitReview({
        rating,
        comment: comment.trim(),
      })
      setComment('')
      setRating(5)
    } catch {
      // Mutation displays the API error toast; keep the form content for editing.
    }
  }

  return (
    <section className="rounded-xl border border-primary/10 bg-white p-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
          Đánh giá phòng
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Đánh giá từ người thuê
        </h2>
      </div>

      {onSubmitReview ? (
        <ReviewForm
          rating={rating}
          comment={comment}
          isSubmitting={isSubmitting}
          isCommentValid={isCommentValid}
          minCommentLength={minCommentLength}
          onRatingChange={setRating}
          onCommentChange={setComment}
          onSubmit={handleSubmit}
        />
      ) : null}

      {isLoading ? (
        <div className="mt-5 h-32 animate-pulse rounded-lg bg-border/60" />
      ) : null}

      {isError ? (
        <div className="mt-5 rounded-lg border border-red-500/20 bg-red-50 p-4 text-sm text-red-600">
          Không thể tải đánh giá phòng.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <div className="mt-5 grid gap-5 rounded-lg bg-surface p-4 md:grid-cols-[160px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-bold text-primary">
                {reviewCount > 0 ? averageRating.toFixed(1) : '-'}
              </p>
              <StarRating rating={reviewCount > 0 ? averageRating : 0} className="mt-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                {reviewCount} đánh giá
              </p>
            </div>
            <RatingBars statistics={statistics} />
          </div>

          {reviews.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm font-bold text-foreground">Chưa có đánh giá</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Phòng này chưa có đánh giá.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  canReply={canReply}
                  isReplying={replyingReviewId === review._id}
                  onSubmitReply={onSubmitReply}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
