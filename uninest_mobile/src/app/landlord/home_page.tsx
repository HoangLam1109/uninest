import { Image } from "expo-image";
import { useState } from "react";
import {
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

import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";

const CHART_MONTHS = [
  { label: "Th1", value: 0.45 },
  { label: "Th2", value: 0.55 },
  { label: "Th3", value: 0.5 },
  { label: "Th4", value: 0.65 },
  { label: "Th5", value: 0.7 },
  { label: "Th6", value: 0.85, active: true },
];

const RECENT_PAYMENTS = [
  {
    id: "1",
    name: "Nguyễn Minh Tuấn",
    meta: "Phòng 402 • 2 giờ trước",
    amount: "6.000.000 đ",
    status: "paid" as const,
  },
  {
    id: "2",
    name: "Lê Thị Lan Anh",
    meta: "Phòng 105 • 5 giờ trước",
    amount: "20.000.000 đ",
    status: "paid" as const,
  },
  {
    id: "3",
    name: "Trần Hoàng Nam",
    meta: "Phòng 212 • Hôm qua",
    amount: "20.000.000 đ",
    status: "pending" as const,
  },
];

function StatCard({
  title,
  value,
  sub,
  trend,
  trendUp,
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <ThemedText type="small" style={styles.statTitle}>
          {title}
        </ThemedText>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {trend ? (
        <ThemedText
          type="smallBold"
          style={trendUp ? styles.trendUp : styles.trendDown}
        >
          {trendUp ? "↑ " : "↘ "}
          {trend}
        </ThemedText>
      ) : (
        <ThemedText type="small" style={styles.statSub}>
          {sub}
        </ThemedText>
      )}
    </View>
  );
}

function PaymentRow({
  name,
  meta,
  amount,
  status,
}: {
  name: string;
  meta: string;
  amount: string;
  status: "paid" | "pending";
}) {
  const paid = status === "paid";
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentAvatar}>
        <Text style={styles.paymentAvatarIcon}>👤</Text>
      </View>
      <View style={styles.paymentBody}>
        <ThemedText type="smallBold" style={styles.paymentName}>
          {name}
        </ThemedText>
        <ThemedText type="small" style={styles.paymentMeta}>
          {meta}
        </ThemedText>
      </View>
      <View style={styles.paymentRight}>
        <ThemedText type="smallBold" style={styles.paymentAmount}>
          {amount}
        </ThemedText>
        <View
          style={[styles.badge, paid ? styles.badgePaid : styles.badgePending]}
        >
          <ThemedText
            type="small"
            style={paid ? styles.badgePaidText : styles.badgePendingText}
          >
            {paid ? "ĐÃ THANH TOÁN" : "CHỜ XỬ LÝ"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function LandlordHomePage() {
  const insets = useSafeAreaInsets();
  const [activeChartMonth] = useState(5);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBox}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
              <View>
                <ThemedText type="smallBold" style={styles.brand}>
                  UniNest
                </ThemedText>
                <ThemedText type="small" style={styles.portal}>
                  CỔNG THÔNG TIN CHỦ NHÀ
                </ThemedText>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Pressable style={styles.iconCircle}>
                <Text style={styles.bellIcon}>🔔</Text>
              </Pressable>
              <View style={styles.profileCircle}>
                <Text style={styles.profileEmoji}>👨🏻</Text>
              </View>
            </View>
          </View>

          <StatCard
            title="Tổng số phòng"
            value="20"
            sub="Sức chứa"
            icon="🛏️"
          />
          <StatCard
            title="Tỉ lệ lấp đầy"
            value="92%"
            trend="+4%"
            trendUp
            icon="👥"
          />
          <StatCard
            title="Doanh thu tháng"
            value="50.000.000đ"
            trend="-2%"
            trendUp={false}
            icon="💵"
          />

          <View style={styles.utilityCard}>
            <View style={styles.utilityHeader}>
              <View style={styles.utilityTitleBlock}>
                <ThemedText type="smallBold" style={styles.utilityTitle}>
                  Theo dõi điện nước
                </ThemedText>
                <ThemedText type="small" style={styles.utilitySubtitle}>
                  Mức tiêu thụ điện & nước trung bình mỗi căn
                </ThemedText>
              </View>
              <Pressable style={styles.exportBtn}>
                <Text style={styles.exportIcon}>⬇</Text>
                <ThemedText type="smallBold" style={styles.exportText}>
                  Xuất báo cáo
                </ThemedText>
              </Pressable>
            </View>

            <Text style={styles.utilityAmount}>10.000.000đ</Text>
            <ThemedText type="small" style={styles.utilityAmountLabel}>
              Tổng tháng
            </ThemedText>

            <View style={styles.chartArea}>
              <View style={styles.chartBars}>
                {CHART_MONTHS.map((month, index) => (
                  <View key={month.label} style={styles.chartColumn}>
                    {month.active ? (
                      <Text style={styles.chartSpark}>〰</Text>
                    ) : (
                      <View style={styles.chartSparkSpacer} />
                    )}
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: 24 + month.value * 56,
                          backgroundColor:
                            index === activeChartMonth ? "#E68A2E" : "#E5DCCF",
                        },
                      ]}
                    />
                    <ThemedText
                      type="small"
                      style={[
                        styles.chartLabel,
                        index === activeChartMonth && styles.chartLabelActive,
                      ]}
                    >
                      {month.label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.paymentsHeader}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Thanh toán gần đây
            </ThemedText>
            <Pressable>
              <ThemedText type="smallBold" style={styles.seeAll}>
                Xem tất cả
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.paymentsCard}>
            {RECENT_PAYMENTS.map((item, index) => (
              <View key={item.id}>
                <PaymentRow
                  name={item.name}
                  meta={item.meta}
                  amount={item.amount}
                  status={item.status}
                />
                {index < RECENT_PAYMENTS.length - 1 ? (
                  <View style={styles.paymentDivider} />
                ) : null}
              </View>
            ))}
          </View>

          <Pressable style={styles.primaryButton}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              (+) Thêm người thuê mới
            </ThemedText>
          </Pressable>
        </ScrollView>

        <LandlordBottomNavigation activeTab="home" />
      </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  brand: {
    fontSize: 18,
    color: "#1F2940",
  },
  portal: {
    color: "#7A869A",
    letterSpacing: 0.3,
    marginTop: 2,
    fontSize: 11,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E2D8",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 18,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8EDF5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileEmoji: {
    fontSize: 22,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statTitle: {
    color: "#6B7280",
    flex: 1,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 36,
    lineHeight: 42,
    color: "#1F2940",
    fontWeight: "700",
  },
  statSub: {
    color: "#9AA3B2",
    marginTop: 4,
  },
  trendUp: {
    color: "#22A06B",
    marginTop: 4,
  },
  trendDown: {
    color: "#D14343",
    marginTop: 4,
  },
  utilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  utilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  utilityTitleBlock: {
    flex: 1,
  },
  utilityTitle: {
    color: "#1F2940",
    fontSize: 16,
  },
  utilitySubtitle: {
    color: "#9AA3B2",
    marginTop: 4,
    lineHeight: 18,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF0DF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  exportIcon: {
    color: "#E68A2E",
    fontSize: 14,
  },
  exportText: {
    color: "#E68A2E",
    fontSize: 12,
  },
  utilityAmount: {
    fontSize: 32,
    lineHeight: 38,
    color: "#1F2940",
    fontWeight: "700",
  },
  utilityAmountLabel: {
    color: "#9AA3B2",
    marginBottom: 16,
  },
  chartArea: {
    borderTopWidth: 1,
    borderTopColor: "#F0EBE3",
    paddingTop: 16,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    paddingHorizontal: 4,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartSpark: {
    color: "#E68A2E",
    fontSize: 14,
    marginBottom: 4,
  },
  chartSparkSpacer: {
    height: 18,
  },
  chartBar: {
    width: "70%",
    maxWidth: 28,
    borderRadius: 6,
    minHeight: 8,
  },
  chartLabel: {
    marginTop: 8,
    color: "#9AA3B2",
    fontSize: 12,
  },
  chartLabelActive: {
    color: "#E68A2E",
    fontWeight: "700",
  },
  paymentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#1F2940",
    fontSize: 16,
  },
  seeAll: {
    color: "#E68A2E",
  },
  paymentsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  paymentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentAvatarIcon: {
    fontSize: 20,
    color: "#9AA3B2",
  },
  paymentBody: {
    flex: 1,
  },
  paymentName: {
    color: "#1F2940",
  },
  paymentMeta: {
    color: "#9AA3B2",
    marginTop: 2,
  },
  paymentRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  paymentAmount: {
    color: "#1F2940",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePaid: {
    backgroundColor: "#E6F4EC",
  },
  badgePending: {
    backgroundColor: "#FFF0DF",
  },
  badgePaidText: {
    color: "#1B7F4B",
    fontSize: 10,
    fontWeight: "700",
  },
  badgePendingText: {
    color: "#C76B12",
    fontSize: 10,
    fontWeight: "700",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#F0EBE3",
    marginLeft: 70,
  },
  primaryButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
