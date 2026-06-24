import { useCallback, useEffect, useState } from "react";
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
import { IdentityDetailModal } from "@/components/identity-detail-modal";
import { LandlordBookingCard } from "@/components/landlord/landlord-booking-card";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking, BookingStatus } from "@/types/booking";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { id: "ALL" | BookingStatus; label: string }[] = [
  { id: "ALL", label: "Tất cả trạng thái" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Từ chối" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export default function LandlordBookingsPage() {
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [viewingIdentityId, setViewingIdentityId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const res = await bookingApi.listLandlord({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setBookings(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (err) {
      Alert.alert(
        "Không tải được danh sách đặt phòng",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setBookings([]);
      setTotalPages(1);
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
          <View style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Duyệt yêu cầu đặt phòng
            </ThemedText>
            <ThemedText type="small" style={styles.pageSubtitle}>
              Kiểm tra thông tin người thuê, thời gian nhận phòng và phản hồi
              các yêu cầu mới.
            </ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {STATUS_FILTERS.map((item) => {
              const active = statusFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setStatusFilter(item.id);
                    setPage(1);
                  }}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Chưa có danh sách đặt phòng phù hợp
              </ThemedText>
            </View>
          ) : (
            bookings.map((booking) => (
              <LandlordBookingCard
                key={booking._id}
                booking={booking}
                busy={actionTargetId === booking._id}
                onApprove={() => handleApprove(booking._id)}
                onReject={() => handleReject(booking._id)}
                onDelete={() => handleDelete(booking._id)}
                onViewIdentity={setViewingIdentityId}
              />
            ))
          )}

          {totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[
                  styles.pageBtn,
                  page <= 1 && styles.pageBtnDisabled,
                ]}
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
  header: {
    marginBottom: 14,
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
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  filterChipActive: {
    backgroundColor: "#FFF0DF",
    borderColor: "#E68A2E",
  },
  filterChipText: {
    color: "#7A869A",
  },
  filterChipTextActive: {
    color: "#C47A10",
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
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
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
