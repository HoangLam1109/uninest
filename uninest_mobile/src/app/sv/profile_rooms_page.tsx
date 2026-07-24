import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
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
import {
  BookingStatusFilterRow,
  BookingSummarySection,
} from "@/components/booking-summary-section";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking, BookingStatus } from "@/types/booking";
import {
  bookingStatusLabel,
  formatBookingCurrency,
  formatBookingDate,
  formatRoomLocationParts,
  getBookingRoom,
} from "@/utils/booking-display";
import {
  BOOKING_STATUS_FILTERS,
  buildBookingSummaryItems,
} from "@/utils/booking-summary";

const PAGE_SIZE = 10;

function getRoomId(booking: Booking): string | null {
  const room = booking.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

function statusBadgeStyle(status: BookingStatus) {
  if (status === "PENDING") return styles.badgePending;
  if (status === "APPROVED") return styles.badgeApproved;
  if (status === "REJECTED") return styles.badgeRejected;
  return styles.badgeCancelled;
}

export default function ProfileRoomsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await bookingApi.listMine({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setBookings(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotalCount(res.pagination?.total ?? res.data?.length ?? 0);
    } catch (err) {
      setLoadError(
        getApiErrorMessage(err, "Không thể tải danh sách đặt phòng."),
      );
      setBookings([]);
      setTotalPages(1);
      setTotalCount(0);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    setLoading(true);
    void loadBookings().finally(() => setLoading(false));
  }, [loadBookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const summaryItems = useMemo(
    () => buildBookingSummaryItems(bookings, totalCount),
    [bookings, totalCount],
  );

  const handleCancel = (booking: Booking) => {
    if (booking.status !== "PENDING") return;
    Alert.alert("Hủy đặt phòng", "Bạn có chắc muốn hủy đơn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: () => {
          setCancellingId(booking._id);
          bookingApi
            .cancel(booking._id)
            .then(() => loadBookings())
            .catch((err) =>
              Alert.alert(
                "Lỗi",
                getApiErrorMessage(err, "Không hủy được đơn."),
              ),
            )
            .finally(() => setCancellingId(null));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor="#F28C1B"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: insets.top + 8,
            paddingBottom: 100 + insets.bottom,
          }}
        >
          <View style={styles.heroCard}>
            <ThemedText type="small" style={styles.eyebrow}>
              BOOKING CENTER
            </ThemedText>
            <ThemedText type="title" style={styles.pageTitle}>
              Theo dõi yêu cầu đặt phòng
            </ThemedText>
            <ThemedText type="small" style={styles.pageSubtitle}>
              Theo dõi trạng thái từng yêu cầu, quản lý lịch nhận phòng và xử
              lý nhanh các booking đang chờ phản hồi.
            </ThemedText>
          </View>

          <BookingStatusFilterRow
            filters={BOOKING_STATUS_FILTERS}
            activeId={statusFilter}
            accentColor="#F28C1B"
            onChange={(id) => {
              setStatusFilter(id as "ALL" | BookingStatus);
              setPage(1);
            }}
          />

          {!loadError ? (
            <BookingSummarySection items={summaryItems} loading={loading} />
          ) : null}

          {loadError ? (
            <View style={styles.errorCard}>
              <ThemedText type="small" style={styles.errorText}>
                {loadError}
              </ThemedText>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 16 }} />
          ) : null}

          {!loading && !loadError && bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                {statusFilter === "ALL"
                  ? "Bạn chưa gửi yêu cầu đặt phòng nào."
                  : "Không có yêu cầu đặt phòng nào phù hợp."}
              </ThemedText>
            </View>
          ) : null}

          {!loading && !loadError && bookings.length > 0 ? (
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold" style={styles.listTitle}>
                    Danh sách booking
                  </ThemedText>
                  <ThemedText type="small" style={styles.listSubtitle}>
                    Hiển thị các booking theo kiểu card để dễ theo dõi từng
                    yêu cầu.
                  </ThemedText>
                </View>
                <ThemedText type="small" style={styles.pageInfo}>
                  Trang {page}/{totalPages}
                </ThemedText>
              </View>

              {bookings.map((booking) => {
                const room = getBookingRoom(booking);
                const roomId = getRoomId(booking);
                return (
                  <Pressable
                    key={booking._id}
                    style={styles.card}
                    onPress={() => {
                      if (roomId) {
                        router.push({
                          pathname: "/sv/detail_page",
                          params: { id: roomId },
                        } as any);
                      }
                    }}
                  >
                    <View style={styles.cardTop}>
                      <View style={[styles.badge, statusBadgeStyle(booking.status)]}>
                        <Text style={styles.badgeText}>
                          {bookingStatusLabel(booking.status)}
                        </Text>
                      </View>
                      {booking.createdAt ? (
                        <ThemedText type="small" style={styles.createdAt}>
                          Tạo ngày {formatBookingDate(booking.createdAt)}
                        </ThemedText>
                      ) : null}
                    </View>

                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      {room?.title ?? "Phòng"}
                    </ThemedText>

                    {room ? (
                      <ThemedText type="small" style={styles.cardMeta}>
                        🏠{" "}
                        {formatRoomLocationParts(
                          room.address,
                          room.district,
                          room.city,
                        )}
                      </ThemedText>
                    ) : null}

                    <View style={styles.infoRow}>
                      <View style={styles.infoCell}>
                        <ThemedText type="small" style={styles.infoLabel}>
                          Ngày đến xem phòng
                        </ThemedText>
                        <ThemedText type="smallBold" style={styles.infoValue}>
                          {formatBookingDate(booking.checkInDate)}
                        </ThemedText>
                      </View>
                      {room?.pricePerMonth ? (
                        <View style={styles.infoCell}>
                          <ThemedText type="small" style={styles.infoLabel}>
                            Giá phòng
                          </ThemedText>
                          <ThemedText type="smallBold" style={styles.priceValue}>
                            {formatBookingCurrency(room.pricePerMonth)}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>

                    {booking.status === "PENDING" ? (
                      <Pressable
                        style={styles.cancelButton}
                        onPress={(event) => {
                          event.stopPropagation?.();
                          handleCancel(booking);
                        }}
                        disabled={cancellingId === booking._id}
                      >
                        {cancellingId === booking._id ? (
                          <ActivityIndicator color="#D14343" size="small" />
                        ) : (
                          <Text style={styles.cancelText}>Hủy yêu cầu</Text>
                        )}
                      </Pressable>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {!loading && !loadError && totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Trước
                </ThemedText>
              </Pressable>
              <ThemedText type="small" style={styles.pageInfo}>
                Trang {page}/{totalPages}
              </ThemedText>
              <Pressable
                style={[
                  styles.pageBtn,
                  page >= totalPages && styles.pageBtnDisabled,
                ]}
                disabled={page >= totalPages}
                onPress={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Sau
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <BottomNavigation activeTab="bookings" />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5EFE6" },
  safeArea: { flex: 1 },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  eyebrow: {
    color: "#F28C1B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 24,
    color: "#2F261A",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#8A7B68",
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F5C2C2",
  },
  errorText: {
    color: "#D14343",
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  emptyText: { color: "#8A7B68", textAlign: "center" },
  listSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 17,
    color: "#2F261A",
  },
  listSubtitle: {
    color: "#8A7B68",
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#F5EFE6",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  cardTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePending: { backgroundColor: "#FFF4D6" },
  badgeApproved: { backgroundColor: "#E2F5E8" },
  badgeRejected: { backgroundColor: "#FDECEC" },
  badgeCancelled: { backgroundColor: "#F0EBE4" },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2F261A",
  },
  createdAt: {
    color: "#8A7B68",
    fontSize: 11,
  },
  cardTitle: { color: "#2F261A", fontSize: 17, marginBottom: 4 },
  cardMeta: { color: "#8A7B68", lineHeight: 18 },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  infoCell: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
  },
  infoLabel: {
    color: "#8A7B68",
    marginBottom: 4,
    fontSize: 11,
  },
  infoValue: {
    color: "#2F261A",
  },
  priceValue: {
    color: "#F28C1B",
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
  },
  cancelText: {
    color: "#D14343",
    fontSize: 12,
    fontWeight: "700",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  pageBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: "#2F261A",
  },
  pageInfo: {
    color: "#8A7B68",
  },
});
