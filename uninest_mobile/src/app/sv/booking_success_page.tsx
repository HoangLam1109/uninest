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

const nextSteps = [
  {
    number: "1",
    title: "Kiểm tra Email",
    description:
      "Chúng tôi đã gửi hợp đồng điện tử và hướng dẫn chi tiết cho bạn qua email đã đăng ký.",
  },
  {
    number: "2",
    title: "Cập nhật hồ sơ sinh viên",
    description:
      "Vui lòng tải lên ảnh thẻ sinh viên hoặc giấy báo nhập học để hoàn tất thủ tục.",
  },
  {
    number: "3",
    title: "Nhận phòng",
    description:
      "Đến quầy lễ tân UniNest vào ngày nhận phòng để nhận chìa khóa và thẻ cư dân.",
  },
];

export default function BookingSuccessPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Xác nhận đặt phòng
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 60,
            paddingBottom: 126 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroWrap}>
            <Image
              source={require("@/assets/images/tutorial-web.png")}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>

          <View style={styles.centerBlock}>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeIcon}>✓</Text>
            </View>

            <ThemedText type="title" style={styles.successTitle}>
              Đặt phòng thành công!
            </ThemedText>

            <ThemedText type="small" style={styles.successDescription}>
              Cảm ơn bạn đã tin tưởng UniNest. Yêu cầu đặt phòng của bạn đã được
              xác nhận và thanh toán thành công.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                Chi tiết đặt phòng
              </ThemedText>

              <View style={styles.divider} />

              <DetailRow label="Mã đặt phòng" value="UN-827391-VN" />
              <DetailRow
                label="Chỗ ở"
                value="Căn hộ Studio cao cấp"
                subValue="Phân khu A, Tầng 12"
              />
              <DetailRow label="Ngày nhận phòng" value="01 Tháng 9, 2024" />
              <DetailRow
                label="Tổng thanh toán"
                value="7.500.000đ"
                valueStyle={styles.priceValue}
              />

              <Pressable style={styles.invoiceButton}>
                <Text style={styles.invoiceIcon}>↓</Text>
                <Text style={styles.invoiceText}>Tải hóa đơn thanh toán</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.stepsTitle}>
              Các bước tiếp theo
            </ThemedText>

            <View style={styles.stepsList}>
              {nextSteps.map((step) => (
                <View key={step.number} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <View style={styles.stepTextWrap}>
                    <ThemedText type="smallBold" style={styles.stepTitle}>
                      {step.title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.stepDescription}>
                      {step.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/" as any)}
          >
            <Text style={styles.homeIcon}>⌂</Text>
            <Text style={styles.homeText}>Quay lại Trang chủ</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({
  label,
  value,
  subValue,
  valueStyle,
}: {
  label: string;
  value: string;
  subValue?: string;
  valueStyle?: any;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <View style={styles.detailValueWrap}>
        <ThemedText type="smallBold" style={[styles.detailValue, valueStyle]}>
          {value}
        </ThemedText>
        {subValue ? (
          <ThemedText type="small" style={styles.detailSubValue}>
            {subValue}
          </ThemedText>
        ) : null}
      </View>
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
    position: "absolute",
    left: 16,
    right: 16,
    height: 52,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FCFAF6",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#1E2230",
    fontSize: 21,
    fontWeight: "700",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#1E2230",
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  heroWrap: {
    paddingHorizontal: 16,
  },
  heroImage: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    backgroundColor: "#E8DED0",
  },
  centerBlock: {
    alignItems: "center",
    paddingHorizontal: 28,
    marginTop: 26,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1992D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successBadgeIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  successTitle: {
    color: "#1E2230",
    fontSize: 28,
    textAlign: "center",
  },
  successDescription: {
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    color: "#1E2230",
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E6D8",
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  detailLabel: {
    color: "#8A8F97",
    width: 120,
  },
  detailValueWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  detailValue: {
    color: "#1E2230",
    textAlign: "right",
  },
  detailSubValue: {
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 2,
  },
  priceValue: {
    color: "#F1992D",
    fontSize: 20,
  },
  invoiceButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#FCF1E3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  invoiceIcon: {
    color: "#F1992D",
    fontSize: 18,
    fontWeight: "700",
  },
  invoiceText: {
    color: "#F1992D",
    fontSize: 16,
    fontWeight: "700",
  },
  stepsTitle: {
    color: "#1E2230",
    fontSize: 22,
    marginBottom: 14,
  },
  stepsList: {
    gap: 18,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F9E5C1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#F1992D",
    fontSize: 14,
    fontWeight: "800",
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    color: "#1E2230",
    fontSize: 17,
  },
  stepDescription: {
    color: "#6B7280",
    lineHeight: 22,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FCFAF6",
  },
  homeButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#F1992D",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#F1992D",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  homeIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  homeText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
