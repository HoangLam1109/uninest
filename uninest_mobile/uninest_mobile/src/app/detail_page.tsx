import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";

export default function DetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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
          <View style={styles.galleryCard}>
            <Image
              source={require("../../assets/images/tutorial-web.png")}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.galleryCounter}>
              <Text style={styles.galleryCounterText}>🖼 1/12</Text>
            </View>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.verifiedTag}>
              <Text style={styles.tagIcon}>✪</Text>
              <Text style={styles.verifiedText}>VERIFIED LISTING</Text>
            </View>
            <View style={styles.quickTag}>
              <Text style={styles.quickIcon}>⚡</Text>
              <Text style={styles.quickText}>ĐẶT PHÒNG NHANH</Text>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.title}>
              Phòng Studio Cao cấp UniNest
            </ThemedText>
            <ThemedText type="small" style={styles.location}>
              📍 123 Đại lộ Võ Văn Kiệt, Quận 1, TP.HCM
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Về không gian này
            </ThemedText>
            <ThemedText type="small" style={styles.bodyText}>
              Căn hộ studio hiện đại, đầy đủ nội thất được thiết kế riêng cho
              cuộc sống sinh viên. Vị trí đắc địa, chỉ cách thư viện chính 5
              phút đi bộ. Internet tốc độ cao, không gian làm việc công thái học
              và tất cả chi phí tiện ích đã bao gồm trong giá thuê hàng tháng.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Tiện ích
            </ThemedText>
            <View style={styles.amenitiesGrid}>
              {[
                "Wi‑Fi Tốc độ cao",
                "Điều hòa nhiệt độ",
                "Chỗ đậu xe miễn phí",
                "Máy giặt riêng",
                "Bếp đầy đủ tiện nghi",
                "Bàn học tập",
              ].map((item) => (
                <View key={item} style={styles.amenityCard}>
                  <Text style={styles.amenityIcon}>✳</Text>
                  <ThemedText type="smallBold" style={styles.amenityText}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.ownerCard}>
            <View style={styles.ownerTopRow}>
              <View style={styles.ownerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👨🏻</Text>
                </View>
                <View style={styles.ownerMeta}>
                  <ThemedText type="smallBold" style={styles.ownerName}>
                    Chủ nhà: Nguyễn Văn A
                  </ThemedText>
                  <ThemedText type="small" style={styles.ownerSubtext}>
                    Chủ nhà đã xác minh • 3 năm kinh nghiệm
                  </ThemedText>
                </View>
              </View>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingStar}>☆ 4.9</Text>
                <Text style={styles.ratingText}>128 đánh giá</Text>
              </View>
            </View>

            <ThemedText type="small" style={styles.quote}>
              "Tôi mong muốn mang đến trải nghiệm lưu trú tốt nhất cho sinh viên
              tại thành phố. Phản hồi nhanh chóng và duy trì cơ sở vật chất luôn
              là ưu tiên hàng đầu của tôi."
            </ThemedText>

            <Pressable style={styles.contactButton}>
              <ThemedText type="smallBold" style={styles.contactText}>
                Liên hệ chủ nhà
              </ThemedText>
            </Pressable>
          </View>

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

          <View style={styles.bookingCard}>
            <ThemedText type="title" style={styles.priceTitle}>
              15.000.000đ
              <ThemedText type="small" style={styles.priceUnit}>
                / tháng
              </ThemedText>
            </ThemedText>

            <View style={styles.formBox}>
              <View style={styles.formRow}>
                <View>
                  <Text style={styles.formLabel}>NGÀY DỌN VÀO</Text>
                  <Text style={styles.formValue}>25 tháng 8, 2024</Text>
                </View>
                <Text style={styles.formIcon}>📅</Text>
              </View>
              <View style={styles.formRow}>
                <View>
                  <Text style={styles.formLabel}>THỜI HẠN THUÊ</Text>
                  <Text style={styles.formValue}>12 Tháng</Text>
                </View>
                <Text style={styles.formIcon}>⌄</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tiền đặt cọc</Text>
              <Text style={styles.summaryValue}>15.000.000đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
              <Text style={styles.summaryValue}>500.000đ</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán hôm nay</Text>
              <Text style={styles.totalValue}>15.500.000đ</Text>
            </View>

            <Pressable
              style={styles.bookButton}
              onPress={() => router.push("/booking_page" as any)}
            >
              <Text style={styles.bookButtonText}>Đặt ngay →</Text>
            </Pressable>

            <Text style={styles.note}>
              Chưa thu tiền thanh toán. Bạn sẽ được xem xét hợp đồng thuê trước
              khi ký.
            </Text>
          </View>
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
  galleryCard: {
    marginHorizontal: 0,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 320,
  },
  galleryCounter: {
    position: "absolute",
    top: 14,
    right: 14,
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
