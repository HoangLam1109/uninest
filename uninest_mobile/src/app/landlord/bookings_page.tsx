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
import { IdentityDetailModal } from "@/components/identity-detail-modal";
import { LandlordBookingCard } from "@/components/landlord/landlord-booking-card";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking, BookingStatus } from "@/types/booking";
import {
  BOOKING_STATUS_FILTERS,
  buildBookingSummaryItems,
} from "@/utils/booking-summary";

const PAGE_SIZE = 10;

export default function LandlordBookingsPage() {
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [viewingIdentityId, setViewingIdentityId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await bookingApi.listLandlord({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setBookings(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotalCount(res.pagination?.total ?? res.data?.length ?? 0);
    } catch (err) {
      const message = getApiErrorMessage(err, "Vui lòng thử lại.");
      setLoadError(message);
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

  const runAction = async (
    bookingId: string,
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ) => {
    setActionTargetId(bookingId);
    try {
      await action();
      await loadBookings();
      Alert.alert("Thành công", successMessage);
    } catch (err) {
      Alert.alert(errorMessage, getApiErrorMessage(err, "Vui lòng thử lại."));
    } finally {
      setActionTargetId(null);
    }
  };

  const handleApprove = (bookingId: string) => {
    void runAction(
      bookingId,
      () => bookingApi.approve(bookingId),
      "Đã phê duyệt yêu cầu",
      "Không thể phê duyệt yêu cầu",
    );
  };

  const handleReject = (bookingId: string) => {
    void runAction(
      bookingId,
      () => bookingApi.reject(bookingId),
      "Đã từ chối yêu cầu",
      "Không thể từ chối yêu cầu",
    );
  };

  const handleDelete = (bookingId: string) => {
    Alert.alert("Xóa đơn", "Bạn có chắc muốn xóa đơn đặt phòng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          void runAction(
            bookingId,
            () => bookingApi.delete(bookingId),
            "Đã xóa đơn đặt phòng",
            "Không thể xóa đơn",
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor="#E68A2E"
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.heroCard}>
            <ThemedText type="small" style={styles.eyebrow}>
              BOOKING CENTER
            </ThemedText>
            <ThemedText type="title" style={styles.pageTitle}>
              Duyệt yêu cầu đặt phòng
            </ThemedText>
            <ThemedText type="small" style={styles.pageSubtitle}>
              Kiểm tra thông tin người thuê, thời gian nhận phòng và phản hồi
              các yêu cầu mới.
            </ThemedText>
          </View>

          <BookingStatusFilterRow
            filters={BOOKING_STATUS_FILTERS}
            activeId={statusFilter}
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
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 16 }}
              size="large"
            />
          ) : null}

          {!loading && !loadError && bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                {statusFilter === "ALL"
                  ? "Chưa có danh sách đặt phòng phù hợp"
                  : "Không có yêu cầu đặt phòng nào phù hợp"}
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
                    Hiển thị từng yêu cầu theo dạng card để thao tác duyệt
                    nhanh hơn.
                  </ThemedText>
                </View>
                <ThemedText type="small" style={styles.pageInfo}>
                  Trang {page}/{totalPages}
                </ThemedText>
              </View>

              {bookings.map((booking) => (
                <LandlordBookingCard
                  key={booking._id}
                  booking={booking}
                  busy={actionTargetId === booking._id}
                  onApprove={() => handleApprove(booking._id)}
                  onReject={() => handleReject(booking._id)}
                  onDelete={() => handleDelete(booking._id)}
                  onViewIdentity={setViewingIdentityId}
                />
              ))}
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

        <LandlordBottomNavigation activeTab="bookings" />
      </SafeAreaView>

      <IdentityDetailModal
        visible={Boolean(viewingIdentityId)}
        identityId={viewingIdentityId}
        onClose={() => setViewingIdentityId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  eyebrow: {
    color: "#E68A2E",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 24,
    color: "#1F2940",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#7A869A",
    lineHeight: 18,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
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
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: "#7A869A",
    textAlign: "center",
  },
  listSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 17,
    color: "#1F2940",
  },
  listSubtitle: {
    color: "#7A869A",
    marginTop: 4,
    lineHeight: 18,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  pageBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: "#1F2940",
  },
  pageInfo: {
    color: "#7A869A",
  },
});
