import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import {
  bookingStatusLabel,
  formatBookingDate,
} from "@/utils/booking-display";

function getParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{
    bookingId?: string;
    roomTitle?: string;
    checkInDate?: string;
    roomLocation?: string;
    notes?: string;
  }>();

  const bookingId = getParam(params.bookingId);
  const roomTitle = getParam(params.roomTitle) || "Phòng đã chọn";
  const checkInDate = getParam(params.checkInDate);
  const roomLocation = getParam(params.roomLocation);
  const notes = getParam(params.notes);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/" as any);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Đặt phòng
          </ThemedText>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120 + insets.bottom,
          }}
        >
          <View style={styles.centerBlock}>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeIcon}>✓</Text>
            </View>

            <ThemedText type="title" style={styles.successTitle}>
              Đã gửi yêu cầu đặt phòng
            </ThemedText>

            <ThemedText type="small" style={styles.successDescription}>
              Yêu cầu của bạn đã được gửi tới chủ nhà. Bạn có thể theo dõi trạng
              thái duyệt trong mục Đặt phòng.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Thông tin yêu cầu
            </ThemedText>
            <View style={styles.divider} />

            <View style={styles.roomHighlight}>
              <ThemedText type="small" style={styles.roomHighlightLabel}>
                Phòng đang đặt
              </ThemedText>
              <ThemedText type="smallBold" style={styles.roomHighlightTitle}>
                {roomTitle}
              </ThemedText>
              {roomLocation ? (
                <ThemedText type="small" style={styles.roomHighlightMeta}>
                  {roomLocation}
                </ThemedText>
              ) : null}
            </View>

            <DetailRow
              label="Trạng thái"
              value={bookingStatusLabel("PENDING")}
              valueStyle={styles.statusValue}
            />
            {bookingId ? (
              <DetailRow
                label="Mã yêu cầu"
                value={bookingId.slice(-8).toUpperCase()}
              />
            ) : null}
            {checkInDate ? (
              <DetailRow
                label="Ngày đến xem phòng"
                value={formatBookingDate(checkInDate)}
              />
            ) : null}
            {notes ? <DetailRow label="Ghi chú" value={notes} /> : null}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/sv/profile_rooms_page" as any)}
          >
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              Xem đơn đặt phòng
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/" as any)}
          >
            <ThemedText type="smallBold" style={styles.secondaryButtonText}>
              Về trang chủ
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        style={[styles.detailValue, valueStyle]}
        numberOfLines={3}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFAF6",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#1E2230",
    fontSize: 22,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#1E2230",
    fontSize: 18,
  },
  centerBlock: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1992D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successBadgeIcon: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  successTitle: {
    color: "#1E2230",
    fontSize: 24,
    textAlign: "center",
  },
  successDescription: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    padding: 16,
  },
  cardTitle: {
    color: "#1E2230",
    fontSize: 17,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6D8",
    marginVertical: 12,
  },
  roomHighlight: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0D9BC",
    padding: 12,
    marginBottom: 14,
  },
  roomHighlightLabel: {
    color: "#C47A10",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  roomHighlightTitle: {
    color: "#1E2230",
    fontSize: 16,
  },
  roomHighlightMeta: {
    color: "#7A869A",
    marginTop: 4,
    lineHeight: 18,
  },
  detailRow: {
    gap: 4,
    marginBottom: 12,
  },
  detailLabel: {
    color: "#8A8F97",
    fontSize: 12,
  },
  detailValue: {
    color: "#1E2230",
    fontSize: 15,
  },
  statusValue: {
    color: "#C47A10",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FCFAF6",
    gap: 10,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#F1992D",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 15,
  },
});
