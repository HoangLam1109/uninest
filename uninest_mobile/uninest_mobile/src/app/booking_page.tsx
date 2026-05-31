import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getPropertyDetails, PROPERTY_IMAGES } from "@/constants/properties";
import { useAuth } from "@/context/auth-context";

const days = [
  "S",
  "M",
  "T",
  "W",
  "T",
  "F",
  "S",
  "27",
  "28",
  "29",
  "30",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "1",
];

export default function BookingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { image } = useLocalSearchParams<{ image?: string | string[] }>();
  const { isAuthenticated } = useAuth();

  const property = getPropertyDetails(image);
  const propertySource = PROPERTY_IMAGES[property.key];

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
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { top: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Đặt phòng UniNest
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 64,
            paddingBottom: 170 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Ngày nhận phòng
            </ThemedText>
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Pressable style={styles.chevronButton}>
                  <Text style={styles.chevronText}>‹</Text>
                </Pressable>
                <ThemedText type="smallBold" style={styles.monthTitle}>
                  Tháng 11 2024
                </ThemedText>
                <Pressable style={styles.chevronButton}>
                  <Text style={styles.chevronText}>›</Text>
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {days.slice(0, 7).map((day) => (
                  <Text key={day} style={styles.weekText}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.grid}>
                {days.slice(7).map((day, index) => {
                  const selected = day === "15";
                  const muted =
                    ["27", "28", "29", "30", "1"].includes(day) && index < 4;
                  return (
                    <View
                      key={`${day}-${index}`}
                      style={[
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          muted && styles.dayTextMuted,
                          selected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Thời hạn thuê
            </ThemedText>
            <View style={styles.termRow}>
              <TermChip label="NGẮN HẠN" value="6 tháng" active />
              <TermChip label="PHỔ BIẾN" value="12 tháng" />
              <TermChip label="ƯU ĐÃI" value="24 tháng" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.propertyCard}>
              <View style={styles.propertyRow}>
                <Image
                  source={propertySource}
                  style={styles.propertyImage}
                  contentFit="cover"
                />
                <View style={styles.propertyMeta}>
                  <ThemedText type="smallBold" style={styles.propertyTitle}>
                    {property.title}
                  </ThemedText>
                  <ThemedText type="small" style={styles.propertyLocation}>
                    {property.location}
                  </ThemedText>
                  <View style={styles.tagRow}>
                    <Tag text="CTA SM LỚN" />
                    <Tag text="FULL NỘI THẤT" />
                  </View>
                </View>
              </View>

              <View style={styles.line} />

              <View style={styles.priceRows}>
                <PriceRow
                  label="Giá thuê (6 tháng)"
                  value="8.500.000đ / tháng"
                />
                <PriceRow label="Tiền cọc (1 tháng)" value="8.500.000đ" />
                <PriceRow label="Phí dịch vụ" value="200.000đ" />
              </View>

              <View style={styles.totalRow}>
                <ThemedText type="smallBold" style={styles.totalLabel}>
                  Tổng thanh toán dự kiến
                </ThemedText>
                <ThemedText type="title" style={styles.totalValue}>
                  17.200.000đ
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Phương thức thanh toán
            </ThemedText>

            <PaymentOption
              active
              title="Chuyển khoản ngân hàng"
              subtitle="Xác nhận nhanh trong 5–10 phút"
              icon="🏦"
            />
            <PaymentOption
              title="Ví điện tử (Momo, ZaloPay)"
              subtitle="Thanh toán tức thì, bảo mật cao"
              icon="💳"
            />
            <PaymentOption
              title="Thẻ quốc tế (Visa, Mastercard)"
              subtitle="Hỗ trợ trả góp 0% lãi suất"
              icon="💳"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.policyCard}>
              <Text style={styles.policyIcon}>ℹ</Text>
              <View style={styles.policyContent}>
                <ThemedText type="smallBold" style={styles.policyTitle}>
                  Chính sách hủy phòng
                </ThemedText>
                <ThemedText type="small" style={styles.policyText}>
                  Hoàn trả 100% tiền cọc nếu hủy trước ngày nhận phòng 07 ngày.
                  Sau thời gian này, phí hủy sẽ tương đương 50% tiền cọc. Vui
                  lòng xem chi tiết hợp đồng thuê nhà.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.footerSummary}>
            <ThemedText type="small" style={styles.footerLabel}>
              Bạn sẽ thanh toán ngay:
            </ThemedText>
            <ThemedText type="smallBold" style={styles.footerPrice}>
              17.200.000đ
            </ThemedText>
          </View>

          <Pressable
            style={styles.confirmButton}
            onPress={() =>
              router.push({
                pathname: "/booking_success_page",
                params: { image: property.key },
              } as any)
            }
          >
            <ThemedText type="smallBold" style={styles.confirmText}>
              Xác nhận & Thanh toán →
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function TermChip({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.termChip, active && styles.termChipActive]}>
      <ThemedText
        type="smallBold"
        style={[styles.termLabel, active && styles.termLabelActive]}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        style={[styles.termValue, active && styles.termValueActive]}
      >
        {value}
      </ThemedText>
    </Pressable>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceRow}>
      <ThemedText type="small" style={styles.priceLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.priceValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function PaymentOption({
  title,
  subtitle,
  icon,
  active,
}: {
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.paymentCard, active && styles.paymentCardActive]}>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={styles.paymentIcon}>{icon}</Text>
      <View style={styles.paymentTextWrap}>
        <ThemedText type="smallBold" style={styles.paymentTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={styles.paymentSubtitle}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(63,47,34,0.08)",
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
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    color: "#3F2F22",
    fontSize: 24,
    marginBottom: 14,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronText: {
    color: "#3F2F22",
    fontSize: 24,
    fontWeight: "700",
  },
  monthTitle: {
    color: "#3F2F22",
    fontSize: 18,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekText: {
    width: 38,
    textAlign: "center",
    color: "#9AA0A9",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dayCellSelected: {
    backgroundColor: "#F28C1B",
    borderRadius: 18,
    shadowColor: "#F28C1B",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  dayText: {
    color: "#1E2230",
    fontSize: 15,
    fontWeight: "700",
  },
  dayTextMuted: {
    color: "#D1D5DB",
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  termRow: {
    flexDirection: "row",
    gap: 10,
  },
  termChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2DED8",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  termChipActive: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF8F0",
  },
  termLabel: {
    color: "#A49A90",
    fontSize: 12,
  },
  termLabelActive: {
    color: "#F28C1B",
  },
  termValue: {
    color: "#3F2F22",
    fontSize: 16,
  },
  termValueActive: {
    color: "#3F2F22",
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE4DB",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  propertyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  propertyImage: {
    width: 104,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#D7C7B1",
  },
  propertyMeta: {
    flex: 1,
    gap: 6,
  },
  propertyTitle: {
    color: "#3F2F22",
    fontSize: 18,
    lineHeight: 22,
  },
  propertyLocation: {
    color: "#8D96A7",
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#FFF1DE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: "#F28C1B",
    fontSize: 11,
    fontWeight: "700",
  },
  line: {
    height: 1,
    backgroundColor: "#F0EBE4",
    marginVertical: 14,
  },
  priceRows: {
    gap: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  priceLabel: {
    color: "#7A7F86",
  },
  priceValue: {
    color: "#3F2F22",
  },
  totalRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#3F2F22",
  },
  totalValue: {
    color: "#F28C1B",
    fontSize: 20,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    marginBottom: 12,
  },
  paymentCardActive: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF9F1",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D0D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#F28C1B",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F28C1B",
  },
  paymentIcon: {
    fontSize: 20,
    color: "#F28C1B",
  },
  paymentTextWrap: {
    flex: 1,
  },
  paymentTitle: {
    color: "#3F2F22",
    fontSize: 16,
  },
  paymentSubtitle: {
    color: "#8E95A3",
    marginTop: 2,
  },
  policyCard: {
    backgroundColor: "#FFF8EF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBCFA6",
    padding: 14,
    flexDirection: "row",
    gap: 10,
  },
  policyIcon: {
    color: "#F28C1B",
    fontSize: 18,
    marginTop: 2,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    color: "#3F2F22",
  },
  policyText: {
    color: "#7A7F86",
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#ECE5DC",
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerSummary: {
    flex: 1,
  },
  footerLabel: {
    color: "#8A8F97",
  },
  footerPrice: {
    color: "#F28C1B",
    fontSize: 24,
    marginTop: 2,
  },
  confirmButton: {
    flex: 1.2,
    minHeight: 76,
    borderRadius: 14,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 17,
    textAlign: "center",
  },
});
