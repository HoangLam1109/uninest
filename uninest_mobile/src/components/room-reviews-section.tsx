import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { reviewApi } from "@/api/review.api";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Review, ReviewStatistics } from "@/types/review";

function getReviewerName(review: Review) {
  const reviewer = review.reviewerId;
  if (typeof reviewer === "object" && reviewer !== null && "fullName" in reviewer) {
    return reviewer.fullName ?? "Người thuê";
  }
  return "Người thuê";
}

function formatReviewDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StarRow({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  const fontSize = size === "lg" ? 18 : size === "md" ? 14 : 12;
  return (
    <Text style={[styles.starRow, { fontSize }]}>
      {"★".repeat(full)}
      <Text style={styles.starEmpty}>{"☆".repeat(5 - full)}</Text>
    </Text>
  );
}

function RatingBars({
  distribution,
  total,
}: {
  distribution?: { _id: number; count: number }[];
  total: number;
}) {
  const counts = [5, 4, 3, 2, 1].map((star) => {
    const item = distribution?.find((d) => Number(d._id) === star);
    return { star, count: item?.count ?? 0 };
  });

  return (
    <View style={styles.barsWrap}>
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <View key={star} style={styles.barLine}>
            <Text style={styles.barLabel}>{star}</Text>
            <Text style={styles.barStarIcon}>★</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.barCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ReviewCard({
  review,
  canReply,
  isReplying,
  onSubmitReply,
}: {
  review: Review;
  canReply?: boolean;
  isReplying?: boolean;
  onSubmitReply?: (reply: string) => Promise<void>;
}) {
  const [reply, setReply] = useState("");

  const handleReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed || !onSubmitReply) return;
    await onSubmitReply(trimmed);
    setReply("");
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {getReviewerName(review).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewMeta}>
          <ThemedText type="smallBold" style={styles.reviewAuthor}>
            {getReviewerName(review)}
          </ThemedText>
          <ThemedText type="small" style={styles.reviewDate}>
            {formatReviewDate(review.createdAt)}
          </ThemedText>
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingPillText}>{review.rating.toFixed(1)}</Text>
          <Text style={styles.ratingPillStar}>★</Text>
        </View>
      </View>
      <StarRow rating={review.rating} size="sm" />
      <ThemedText type="small" style={styles.reviewComment}>
        {review.comment}
      </ThemedText>
      {review.landlordReply ? (
        <View style={styles.replyBox}>
          <ThemedText type="smallBold" style={styles.replyLabel}>
            💬 Phản hồi chủ nhà
          </ThemedText>
          <ThemedText type="small" style={styles.replyText}>
            {review.landlordReply}
          </ThemedText>
        </View>
      ) : canReply ? (
        <View style={styles.replyForm}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Phản hồi đánh giá..."
            placeholderTextColor="#A89888"
            style={styles.replyInput}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[
              styles.replySubmit,
              (!reply.trim() || isReplying) && styles.replySubmitDisabled,
            ]}
            onPress={() => void handleReply()}
            disabled={!reply.trim() || isReplying}
          >
            {isReplying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.replySubmitText}>Trả lời</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

type RoomReviewsSectionProps = {
  roomId?: string;
  reviews: Review[];
  statistics: ReviewStatistics | null;
  isLoading?: boolean;
  canReview?: boolean;
  canReply?: boolean;
  onReviewSubmitted?: () => void;
  onReplySubmitted?: () => void;
};

export function RoomReviewsSection({
  roomId,
  reviews,
  statistics,
  isLoading = false,
  canReview = false,
  canReply = false,
  onReviewSubmitted,
  onReplySubmitted,
}: RoomReviewsSectionProps) {
  const count = statistics?.reviewCount ?? reviews.length;
  const average = statistics?.averageRating ?? 0;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (!roomId) return;
    const trimmed = comment.trim();
    if (trimmed.length < 10) {
      Alert.alert("Lỗi", "Nội dung đánh giá cần ít nhất 10 ký tự.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({ roomId, rating, comment: trimmed });
      setComment("");
      setRating(5);
      Alert.alert("Thành công", "Đánh giá đã được gửi.");
      onReviewSubmitted?.();
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không gửi được đánh giá."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>⭐</Text>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Đánh giá từ người thuê
          </ThemedText>
        </View>
        {count > 0 ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>Đã xác minh</Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#F28C1B" />
          <ThemedText type="small" style={styles.mutedText}>
            Đang tải đánh giá...
          </ThemedText>
        </View>
      ) : null}

      {!isLoading ? (
        <View style={styles.summaryCard}>
          <View style={styles.scoreColumn}>
            <ThemedText type="title" style={styles.scoreNumber}>
              {count > 0 ? average.toFixed(1) : "—"}
            </ThemedText>
            <StarRow rating={count > 0 ? average : 0} size="lg" />
            <ThemedText type="small" style={styles.mutedText}>
              {count} đánh giá
            </ThemedText>
          </View>
          <View style={styles.barsColumn}>
            <RatingBars
              distribution={statistics?.ratingDistribution}
              total={count}
            />
          </View>
        </View>
      ) : null}

      {!isLoading && reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📝</Text>
          <ThemedText type="smallBold" style={styles.emptyTitle}>
            Chưa có đánh giá
          </ThemedText>
          <ThemedText type="small" style={styles.emptyDesc}>
            Phòng này chưa có đánh giá đã duyệt. Sau khi thuê phòng và được chủ
            nhà xác nhận, bạn có thể để lại đánh giá.
          </ThemedText>
        </View>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <View style={styles.listWrap}>
          <ThemedText type="smallBold" style={styles.listTitle}>
            Bình luận gần đây
          </ThemedText>
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              canReply={canReply}
              isReplying={replyingReviewId === review._id}
              onSubmitReply={async (reply) => {
                setReplyingReviewId(review._id);
                try {
                  await reviewApi.reply(review._id, { reply });
                  Alert.alert("Thành công", "Đã gửi phản hồi.");
                  onReplySubmitted?.();
                } catch (err) {
                  Alert.alert("Lỗi", getApiErrorMessage(err, "Không gửi được phản hồi."));
                } finally {
                  setReplyingReviewId(null);
                }
              }}
            />
          ))}
        </View>
      ) : null}

      {!isLoading && canReview && roomId ? (
        <View style={styles.formCard}>
          <ThemedText type="smallBold" style={styles.formTitle}>
            Viết đánh giá
          </ThemedText>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Text style={[styles.starPick, star <= rating && styles.starPickActive]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            placeholderTextColor="#A89888"
            style={styles.commentInput}
            multiline
          />
          <Pressable
            style={styles.submitButton}
            onPress={() => void handleSubmitReview()}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.submitText}>
                Gửi đánh giá
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    color: "#2E241A",
    fontSize: 20,
  },
  verifiedBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedBadgeText: {
    color: "#2E7D32",
    fontSize: 11,
    fontWeight: "700",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
    justifyContent: "center",
  },
  mutedText: {
    color: "#7A6A5C",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    marginBottom: 14,
    gap: 12,
  },
  scoreColumn: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 88,
  },
  scoreNumber: {
    color: "#F28C1B",
    fontSize: 36,
    lineHeight: 42,
  },
  barsColumn: {
    flex: 1,
    justifyContent: "center",
  },
  barsWrap: {
    gap: 6,
  },
  barLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barLabel: {
    width: 10,
    color: "#5A4938",
    fontSize: 12,
    fontWeight: "600",
  },
  barStarIcon: {
    color: "#F28C1B",
    fontSize: 10,
    width: 12,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#EDE3D3",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#F28C1B",
    borderRadius: 3,
  },
  barCount: {
    width: 20,
    textAlign: "right",
    color: "#9A8C7D",
    fontSize: 11,
  },
  starRow: {
    color: "#F28C1B",
    letterSpacing: 1,
  },
  starEmpty: {
    color: "#D4C4B0",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E0D5",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#3F2F22",
    marginBottom: 6,
  },
  emptyDesc: {
    color: "#7A6A5C",
    textAlign: "center",
    lineHeight: 20,
  },
  listWrap: {
    gap: 10,
  },
  listTitle: {
    color: "#5A4938",
    marginBottom: 4,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    gap: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewMeta: {
    flex: 1,
  },
  reviewAuthor: {
    color: "#2E241A",
  },
  reviewDate: {
    color: "#9A8C7D",
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  ratingPillText: {
    color: "#F28C1B",
    fontWeight: "700",
    fontSize: 14,
  },
  ratingPillStar: {
    color: "#F28C1B",
    fontSize: 12,
  },
  reviewComment: {
    color: "#4B5563",
    lineHeight: 20,
  },
  replyBox: {
    backgroundColor: "#F7F2E9",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#F28C1B",
  },
  replyLabel: {
    color: "#3F2F22",
    marginBottom: 4,
  },
  replyText: {
    color: "#5A4938",
    lineHeight: 18,
  },
  replyForm: {
    marginTop: 10,
    gap: 8,
  },
  replyInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 72,
    color: "#2F261A",
    textAlignVertical: "top",
  },
  replySubmit: {
    alignSelf: "flex-end",
    backgroundColor: "#2F261A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  replySubmitDisabled: {
    opacity: 0.6,
  },
  replySubmitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  formCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    gap: 10,
  },
  formTitle: { color: "#3F2F22" },
  starPicker: { flexDirection: "row", gap: 6 },
  starPick: { fontSize: 28, color: "#D4C4B0" },
  starPickActive: { color: "#F28C1B" },
  commentInput: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    padding: 12,
    color: "#2F261A",
    textAlignVertical: "top",
    backgroundColor: "#FAF7F2",
  },
  submitButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: { color: "#FFFFFF" },
});
