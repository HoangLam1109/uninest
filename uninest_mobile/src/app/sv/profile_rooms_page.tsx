import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking, BookingRoomRef, BookingStatus } from "@/types/booking";

function getRoomTitle(booking: Booking) {
  const room = booking.roomId;
  if (typeof room === "object" && room !== null && "title" in room) {
    return (room as BookingRoomRef).title ?? "Phòng";
  }
  return "Phòng";
}

function getRoomId(booking: Booking): string | null {
  const room = booking.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

function statusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    PENDING: "CHỜ DUYỆT",
    APPROVED: "ĐÃ CHẤP NHẬN",
    REJECTED: "TỪ CHỐI",
    CANCELLED: "ĐÃ HỦY",
  };
  return map[status] ?? status;
}

export default function ProfileRoomsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.listMine({ page: 1, limit: 50 });
      setBookings(res.data ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

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
              Alert.alert("Lỗi", getApiErrorMessage(err, "Không hủy được đơn.")),
            )
            .finally(() => setCancellingId(null));
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Phòng
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Bạn chưa có đơn đặt phòng nào.
              </ThemedText>
            </View>
          ) : (
            bookings.map((booking) => {
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
                  <ThemedText type="smallBold" style={styles.cardTitle}>
                    {getRoomTitle(booking)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardMeta}>
                    {booking.checkInDate
                      ? `Nhận phòng: ${new Date(booking.checkInDate).toLocaleDateString("vi-VN")}`
                      : ""}
                  </ThemedText>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>
                      {statusLabel(booking.status)}
                    </Text>
                  </View>
                  {booking.status === "PENDING" ? (
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => handleCancel(booking)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? (
                        <ActivityIndicator color="#D14343" size="small" />
                      ) : (
                        <Text style={styles.cancelText}>Hủy đặt phòng</Text>
                      )}
                    </Pressable>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5EFE6" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: "#3D3428" },
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#8A7B68", textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  cardTitle: { color: "#2F261A", fontSize: 16 },
  cardMeta: { color: "#8A7B68", marginTop: 4 },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#FFF4D6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#C47A10",
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },
  cancelText: {
    color: "#D14343",
    fontSize: 12,
    fontWeight: "700",
  },
});
