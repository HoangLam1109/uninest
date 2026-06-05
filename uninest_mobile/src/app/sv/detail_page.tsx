import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { bookingApi } from "@/api/booking.api";
import { reviewApi } from "@/api/review.api";
import { roomApi } from "@/api/room.api";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { RoomReviewsSection } from "@/components/room-reviews-section";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking } from "@/types/booking";
import type { Review, ReviewStatistics } from "@/types/review";
import type { Room, RoomImage } from "@/types/room";
import { getBookingRoomId } from "@/utils/booking-display";
import {
  buildRoomHighlights,
  formatPrice,
  formatRoomLocation,
  getLandlordName,
  sortRoomImages,
} from "@/utils/room-display";

const PLACEHOLDER_IMAGE = require("@/assets/images/tutorial-web.png");

export default function DetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null);
  const [approvedBooking, setApprovedBooking] = useState<Booking | null>(null);

  const loadRoom = useCallback(async () => {
    if (!roomId) {
      setError("Không tìm thấy mã phòng.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [roomRes, imagesRes, reviewsRes, bookingsRes] = await Promise.all([
        roomApi.getById(roomId),
        roomApi.listImages(roomId),
        reviewApi.listByRoom(roomId, { limit: 20 }).catch(() => ({
          success: true,
          data: [],
          statistics: {
            averageRating: 0,
            reviewCount: 0,
            ratingDistribution: [],
          },
        })),
        bookingApi.listMine({ page: 1, limit: 100 }).catch(() => ({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 100, totalPages: 0 },
        })),
      ]);
      setRoom(roomRes.data ? { ...roomRes.data, _id: String(roomRes.data._id) } : null);
      const sorted = sortRoomImages(imagesRes.data ?? []);
      setImages(sorted);
      setImageIndex(0);
      setReviews(reviewsRes.data ?? []);
      setReviewStats(reviewsRes.statistics ?? null);
      const approved = (bookingsRes.data ?? []).find(
        (booking) =>
          getBookingRoomId(booking) === roomId && booking.status === "APPROVED",
      );
      setApprovedBooking(approved ?? null);
    } catch (err) {
      setRoom(null);
      setImages([]);
      setReviews([]);
      setReviewStats(null);
      setApprovedBooking(null);
      setError(getApiErrorMessage(err, "Không tải được thông tin phòng."));
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/" as any);
      return;
    }
    void loadRoom();
  }, [isAuthenticated, loadRoom, router]);

  const highlights = useMemo(
    () => (room ? buildRoomHighlights(room) : []),
    [room],
  );

  const activeImage = images[imageIndex];
  const deposit = room?.depositAmount ?? room?.pricePerMonth ?? 0;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { top: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>

          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chi tiết phòng
          </ThemedText>

          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>↗</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 64,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F28C1B" />
              <ThemedText type="small" style={styles.hintText}>
                Đang tải chi tiết phòng...
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable style={styles.retryButton} onPress={() => void loadRoom()}>
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && room ? (
            <>
          <View style={styles.galleryCard}>
            <Image
              source={
                activeImage?.url
                  ? { uri: activeImage.url }
                  : PLACEHOLDER_IMAGE
              }
              style={styles.heroImage}
              contentFit="cover"
            />
            {roomId ? (
              <FavoriteHeartButton
                roomId={roomId}
                style={styles.galleryFavorite}
              />
            ) : null}
            <View style={styles.galleryCounter}>
              <Text style={styles.galleryCounterText}>
                🖼 {images.length > 0 ? imageIndex + 1 : 0}/
                {Math.max(images.length, 1)}
              </Text>
            </View>
            {images.length > 1 ? (
              <View style={styles.dotsRow}>
                {images.slice(0, 6).map((img, index) => (
                  <Pressable
                    key={img._id}
                    onPress={() => setImageIndex(index)}
                  >
                    <View
                      style={[
                        styles.dot,
                        index === imageIndex && styles.dotActive,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.verifiedTag}>
              <Text style={styles.tagIcon}>✪</Text>
              <Text style={styles.verifiedText}>
                {room.isPublished ? "ĐÃ CÔNG KHAI" : "VERIFIED LISTING"}
              </Text>
            </View>
            {room.status === "AVAILABLE" ? (
              <View style={styles.quickTag}>
                <Text style={styles.quickIcon}>⚡</Text>
                <Text style={styles.quickText}>CÒN TRỐNG</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.title}>
              {room.title}
            </ThemedText>
            <ThemedText type="small" style={styles.location}>
              📍 {formatRoomLocation(room)}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Về không gian này
            </ThemedText>
            <ThemedText type="small" style={styles.bodyText}>
              {room.description?.trim() ||
                "Phòng này chưa có mô tả chi tiết."}
            </ThemedText>
          </View>

          {highlights.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Thông tin phòng
            </ThemedText>
            <View style={styles.amenitiesGrid}>
              {highlights.map((item) => (
                <View key={item} style={styles.amenityCard}>
                  <Text style={styles.amenityIcon}>✳</Text>
                  <ThemedText type="smallBold" style={styles.amenityText}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
          ) : null}

          <RoomReviewsSection
            reviews={reviews}
            statistics={reviewStats}
            isLoading={isLoading}
          />

          <View style={styles.ownerCard}>
            <View style={styles.ownerTopRow}>
              <View style={styles.ownerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👨🏻</Text>
                </View>
                <View style={styles.ownerMeta}>
                  <ThemedText type="smallBold" style={styles.ownerName}>
                    Chủ nhà: {getLandlordName(room)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.ownerSubtext}>
                    {typeof room.landlordId === "object" &&
                    room.landlordId?.phone
                      ? `📞 ${room.landlordId.phone}`
                      : "Thông tin chủ nhà từ hệ thống"}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Pressable
              style={styles.contactButton}
              onPress={() => router.push("/sv/messages_page" as any)}
            >
              <ThemedText type="smallBold" style={styles.contactText}>
                Liên hệ chủ nhà
              </ThemedText>
            </Pressable>
          </View>
            </>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Vị trí
            </ThemedText>
            <View style={styles.mapCard}>
              <View style={styles.mapBlob} />
              <View style={styles.mapMarker}>
                <Text style={styles.mapMarkerText}>⌂</Text>
              </View>
            </View>

            <View style={styles.accessRow}>
              <View style={styles.accessItem}>
                <Text style={styles.accessIcon}>🚶</Text>
                <ThemedText type="small" style={styles.accessText}>
                  5 phút đến Cơ sở chính
                </ThemedText>
              </View>
              <View style={styles.accessItem}>
                <Text style={styles.accessIcon}>🚌</Text>
                <ThemedText type="small" style={styles.accessText}>
                  2 phút đến Trạm xe buýt
                </ThemedText>
              </View>
            </View>
          </View>

          {!isLoading && !error && room ? (
          <View style={styles.bookingCard}>
            <ThemedText type="title" style={styles.priceTitle}>
              {formatPrice(room.pricePerMonth)}
              <ThemedText type="small" style={styles.priceUnit}>
                / tháng
              </ThemedText>
            </ThemedText>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiền đặt cọc</Text>
              <Text style={styles.summaryValue}>{formatPrice(deposit)}</Text>
            </View>
            {room.electricityRate ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giá điện</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(room.electricityRate)}
                </Text>
              </View>
            ) : null}
            {room.waterRate ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giá nước</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(room.waterRate)}
                </Text>
              </View>
            ) : null}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Giá thuê / tháng</Text>
              <Text style={styles.totalValue}>
                {formatPrice(room.pricePerMonth)}
              </Text>
            </View>

            {approvedBooking ? (
              <View style={styles.approvedBanner}>
                <Text style={styles.approvedIcon}>✓</Text>
                <ThemedText type="smallBold" style={styles.approvedText}>
                  Bạn đã được chủ nhà chấp nhận thuê phòng này
                </ThemedText>
              </View>
            ) : (
              <>
                <Pressable
                  style={styles.bookButton}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/booking_page",
                      params: { roomId: room._id, title: room.title },
                    } as any)
                  }
                >
                  <Text style={styles.bookButtonText}>Đặt ngay →</Text>
                </Pressable>

                <Text style={styles.note}>
                  Chưa thu tiền thanh toán. Bạn sẽ được xem xét hợp đồng thuê
                  trước khi ký.
                </Text>
              </>
            )}
          </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 52,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F2E9",
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#3F2F22",
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#3F2F22",
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 12,
  },
  hintText: {
    color: "#7A6A5C",
    textAlign: "center",
  },
  errorText: {
    color: "#D14343",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#F28C1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
  },
  galleryCard: {
    marginHorizontal: 0,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 320,
  },
  galleryFavorite: {
    top: 14,
    right: 14,
  },
  galleryCounter: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  galleryCounterText: {
    color: "#243041",
    fontWeight: "700",
  },
  dotsRow: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF0DD",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagIcon: {
    color: "#F28C1B",
  },
  verifiedText: {
    color: "#F28C1B",
    fontSize: 12,
    fontWeight: "700",
  },
  quickTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECF8E9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickIcon: {
    color: "#4AA157",
  },
  quickText: {
    color: "#4AA157",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    color: "#2E241A",
    fontSize: 30,
    lineHeight: 36,
  },
  location: {
    marginTop: 10,
    color: "#7380A1",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8DECF",
    marginHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    color: "#2E241A",
    fontSize: 20,
    marginBottom: 10,
  },
  bodyText: {
    color: "#5D6677",
    lineHeight: 24,
    fontSize: 16,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0E6D7",
    padding: 12,
    minHeight: 72,
    justifyContent: "center",
    gap: 8,
  },
  amenityIcon: {
    color: "#F28C1B",
    fontSize: 18,
  },
  amenityText: {
    color: "#2F261A",
    fontSize: 15,
    lineHeight: 20,
  },
  ownerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EBDCC6",
    backgroundColor: "#FBF6ED",
    padding: 16,
  },
  ownerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  ownerLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#20313D",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
  },
  ownerMeta: {
    flex: 1,
  },
  ownerName: {
    color: "#2E241A",
    fontSize: 18,
    lineHeight: 24,
  },
  ownerSubtext: {
    color: "#7180A1",
    marginTop: 4,
  },
  ratingBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  ratingStar: {
    color: "#F28C1B",
    fontWeight: "700",
    fontSize: 18,
  },
  ratingText: {
    color: "#7180A1",
    fontSize: 12,
    marginTop: 2,
  },
  quote: {
    color: "#59606E",
    marginTop: 14,
    lineHeight: 22,
  },
  contactButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    color: "#F28C1B",
  },
  mapCard: {
    height: 220,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E1D6",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBlob: {
    width: 240,
    height: 150,
    borderRadius: 70,
    backgroundColor: "#93C35B",
    transform: [{ rotate: "-12deg" }],
    opacity: 0.95,
  },
  mapMarker: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  mapMarkerText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  accessRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14,
  },
  accessItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accessIcon: {
    fontSize: 18,
    color: "#F28C1B",
  },
  accessText: {
    color: "#4B5563",
    lineHeight: 18,
  },
  bookingCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6DCCF",
    padding: 16,
  },
  priceTitle: {
    color: "#2B2218",
    fontSize: 32,
    lineHeight: 38,
  },
  priceUnit: {
    color: "#727C90",
    fontSize: 18,
  },
  formBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E7F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  formRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },
  formLabel: {
    color: "#97A0B1",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  formValue: {
    color: "#2E241A",
    fontSize: 16,
    fontWeight: "700",
  },
  formIcon: {
    color: "#97A0B1",
    fontSize: 18,
  },
  summaryRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#6B7280",
    fontSize: 15,
  },
  summaryValue: {
    color: "#2E241A",
    fontSize: 15,
    fontWeight: "700",
  },
  totalRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E9ECF1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#2E241A",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    paddingRight: 12,
  },
  totalValue: {
    color: "#2E241A",
    fontSize: 18,
    fontWeight: "700",
  },
  approvedBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E2F5E8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  approvedIcon: {
    color: "#2E8B57",
    fontSize: 18,
    fontWeight: "700",
  },
  approvedText: {
    flex: 1,
    color: "#2E8B57",
    lineHeight: 20,
  },
  bookButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  note: {
    marginTop: 10,
    color: "#90A0B8",
    textAlign: "center",
    lineHeight: 18,
  },
});
