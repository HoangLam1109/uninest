import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

import { authApi } from "@/api/auth.api";
import { invoiceApi } from "@/api/invoice.api";
import { roomApi } from "@/api/room.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Invoice } from "@/types/invoice";
import type { Room } from "@/types/room";
import {
  getRoomTitleFromInvoice,
  getTenantName,
  sumUnpaidAmount,
} from "@/utils/invoice-display";
import { formatPrice } from "@/utils/room-display";

type RecentPayment = {
  id: string;
  name: string;
  meta: string;
  amount: string;
  status: "paid" | "pending";
};

type ChartMonth = {
  label: string;
  billingMonth: string;
  value: number;
  amount: number;
  active: boolean;
};

function currentBillingMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function previousBillingMonth() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
}

function getLast6BillingMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

function monthLabel(billingMonth: string) {
  const month = Number(billingMonth.split("-")[1]);
  return Number.isFinite(month) ? `Th${month}` : billingMonth;
}

function sumPaidForMonth(invoices: Invoice[], billingMonth: string) {
  return invoices
    .filter((inv) => inv.status === "PAID" && inv.billingMonth === billingMonth)
    .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0);
}

function sumUtilityForMonth(invoices: Invoice[], billingMonth: string) {
  return invoices
    .filter((inv) => inv.billingMonth === billingMonth)
    .reduce(
      (sum, inv) =>
        sum + (inv.electricityAmount ?? 0) + (inv.waterAmount ?? 0),
      0,
    );
}

function buildUtilityChart(invoices: Invoice[]): ChartMonth[] {
  const months = getLast6BillingMonths();
  const current = currentBillingMonth();
  const amounts = months.map((billingMonth) =>
    sumUtilityForMonth(invoices, billingMonth),
  );
  const maxAmount = Math.max(...amounts, 1);

  return months.map((billingMonth, index) => ({
    label: monthLabel(billingMonth),
    billingMonth,
    amount: amounts[index],
    value: amounts[index] / maxAmount,
    active: billingMonth === current,
  }));
}

function formatTimeAgo(iso?: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

function buildRecentPayments(invoices: Invoice[]): RecentPayment[] {
  const sorted = [...invoices].sort((a, b) => {
    const aTime = new Date(a.paidAt ?? a.sentAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.paidAt ?? b.sentAt ?? b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });

  return sorted.slice(0, 5).map((invoice) => {
    const roomTitle = getRoomTitleFromInvoice(invoice);
    const timeLabel = formatTimeAgo(
      invoice.paidAt ?? invoice.sentAt ?? invoice.createdAt,
    );
    const paid = invoice.status === "PAID";

    return {
      id: invoice._id,
      name: getTenantName(invoice),
      meta: [roomTitle, timeLabel].filter(Boolean).join(" • "),
      amount: formatPrice(invoice.totalAmount ?? 0),
      status: paid ? "paid" : "pending",
    };
  });
}

function calcOccupancyRate(rooms: Room[]) {
  if (rooms.length === 0) return 0;
  const rented = rooms.filter((room) => room.status === "RENTED").length;
  return Math.round((rented / rooms.length) * 100);
}

function calcRevenueTrend(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? { text: "+100%", up: true } : { text: "0%", up: true };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return { text: "0%", up: true };
  return {
    text: `${change > 0 ? "+" : ""}${change}%`,
    up: change >= 0,
  };
}

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
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenantCount, setTenantCount] = useState(0);
  const [displayName, setDisplayName] = useState(sessionUser?.fullName ?? "Chủ nhà");

  const loadDashboard = useCallback(async () => {
    try {
      const [meRes, roomsRes, tenantsRes, invoicesRes] = await Promise.all([
        authApi.getMe().catch(() => null),
        roomApi.listMy({ page: 1, limit: 100 }),
        roomApi.listTenants().catch(() => ({ success: true, data: [] })),
        invoiceApi.listLandlord({ page: 1, limit: 100 }),
      ]);

      setDisplayName(meRes?.data?.user?.fullName ?? sessionUser?.fullName ?? "Chủ nhà");
      setRooms(roomsRes.data ?? []);
      setTenantCount(tenantsRes.data?.length ?? 0);
      setInvoices(invoicesRes.data ?? []);
    } catch (err) {
      Alert.alert(
        "Không tải được dữ liệu",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setRooms([]);
      setInvoices([]);
      setTenantCount(0);
    }
  }, [sessionUser?.fullName]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadDashboard().finally(() => setLoading(false));
    }, [loadDashboard]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const occupancyRate = useMemo(() => calcOccupancyRate(rooms), [rooms]);
  const currentMonth = currentBillingMonth();
  const previousMonth = previousBillingMonth();
  const monthlyRevenue = useMemo(
    () => sumPaidForMonth(invoices, currentMonth),
    [invoices, currentMonth],
  );
  const previousRevenue = useMemo(
    () => sumPaidForMonth(invoices, previousMonth),
    [invoices, previousMonth],
  );
  const revenueTrend = useMemo(
    () => calcRevenueTrend(monthlyRevenue, previousRevenue),
    [monthlyRevenue, previousRevenue],
  );
  const utilityChart = useMemo(() => buildUtilityChart(invoices), [invoices]);
  const currentUtilityTotal = useMemo(
    () => sumUtilityForMonth(invoices, currentMonth),
    [invoices, currentMonth],
  );
  const recentPayments = useMemo(
    () => buildRecentPayments(invoices),
    [invoices],
  );
  const activeChartIndex = utilityChart.findIndex((item) => item.active);

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
              <Pressable
                style={styles.profileCircle}
                onPress={() => router.push("/landlord/profile_page" as any)}
              >
                <Text style={styles.profileEmoji}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginVertical: 40 }}
              size="large"
            />
          ) : (
            <>
          <StatCard
            title="Tổng số phòng"
            value={String(rooms.length)}
            sub={`${tenantCount} người thuê`}
            icon="🛏️"
          />
          <StatCard
            title="Tỉ lệ lấp đầy"
            value={`${occupancyRate}%`}
            sub={`${rooms.filter((r) => r.status === "RENTED").length}/${rooms.length} phòng đã thuê`}
            icon="👥"
          />
          <StatCard
            title="Doanh thu tháng"
            value={formatPrice(monthlyRevenue)}
            trend={revenueTrend.text}
            trendUp={revenueTrend.up}
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
              <Pressable
                style={styles.exportBtn}
                onPress={() => router.push("/landlord/invoices_page" as any)}
              >
                <Text style={styles.exportIcon}>⬇</Text>
                <ThemedText type="smallBold" style={styles.exportText}>
                  Xuất báo cáo
                </ThemedText>
              </Pressable>
            </View>

            <Text style={styles.utilityAmount}>
              {formatPrice(currentUtilityTotal)}
            </Text>
            <ThemedText type="small" style={styles.utilityAmountLabel}>
              Tổng điện nước tháng {monthLabel(currentMonth)}
            </ThemedText>

            <View style={styles.chartArea}>
              <View style={styles.chartBars}>
                {utilityChart.map((month, index) => (
                  <View key={month.billingMonth} style={styles.chartColumn}>
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
                            index === activeChartIndex ? "#E68A2E" : "#E5DCCF",
                        },
                      ]}
                    />
                    <ThemedText
                      type="small"
                      style={[
                        styles.chartLabel,
                        index === activeChartIndex && styles.chartLabelActive,
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
            <Pressable onPress={() => router.push("/landlord/invoices_page" as any)}>
              <ThemedText type="smallBold" style={styles.seeAll}>
                Xem tất cả
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.paymentsCard}>
            {recentPayments.length === 0 ? (
              <View style={styles.emptyPayments}>
                <ThemedText type="small" style={styles.emptyPaymentsText}>
                  Chưa có hóa đơn nào. Tạo hóa đơn tại tab Báo cáo.
                </ThemedText>
                <ThemedText type="small" style={styles.emptyPaymentsSub}>
                  Chờ thu: {formatPrice(sumUnpaidAmount(invoices))}
                </ThemedText>
              </View>
            ) : (
              recentPayments.map((item, index) => (
                <View key={item.id}>
                  <PaymentRow
                    name={item.name}
                    meta={item.meta}
                    amount={item.amount}
                    status={item.status}
                  />
                  {index < recentPayments.length - 1 ? (
                    <View style={styles.paymentDivider} />
                  ) : null}
                </View>
              ))
            )}
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/landlord/tenants_page" as any)}
          >
            <ThemedText type="smallBold" style={styles.primaryButtonText}>
              (+) Quản lý người thuê
            </ThemedText>
          </Pressable>
            </>
          )}
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
  emptyPayments: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 6,
  },
  emptyPaymentsText: {
    color: "#7A869A",
    lineHeight: 18,
  },
  emptyPaymentsSub: {
    color: "#C47A10",
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
