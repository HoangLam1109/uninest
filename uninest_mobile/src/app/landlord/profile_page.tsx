import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { ApiError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth-session";
import type { AuthUser } from "@/types/auth";
import { getRoleLabel } from "@/utils/landlord-access";
import { sumPaidAmount } from "@/utils/invoice-display";
import { formatPrice } from "@/utils/room-display";
import { getUserAvatarSource } from "@/utils/user-display";

type ProfileStats = {
  roomCount: number;
  tenantCount: number;
  invoiceCount: number;
  paidRevenue: number;
};

type SettingsItem = {
  id: string;
  label: string;
  icon: string;
};

const SETTINGS_MENU_ITEMS: SettingsItem[] = [
  { id: "bookings", label: "Duyệt đặt phòng", icon: "📅" },
  { id: "contracts", label: "Hợp đồng", icon: "📄" },
  { id: "messages", label: "Tin nhắn", icon: "💬" },
  { id: "invoices", label: "Hóa đơn", icon: "🧾" },
  { id: "rooms", label: "Quản lý phòng", icon: "🛏" },
  { id: "tenants", label: "Người thuê", icon: "👥" },
  { id: "properties", label: "Căn hộ", icon: "🏠" },
];

export default function LandlordProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user: sessionUser, signOut } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(sessionUser);
  const [stats, setStats] = useState<ProfileStats>({
    roomCount: 0,
    tenantCount: 0,
    invoiceCount: 0,
    paidRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !getAccessToken()) return;

    try {
      const [me, roomsRes, tenantsRes, invoicesRes] = await Promise.all([
        authApi.getMe(),
        roomApi.listMy({ page: 1, limit: 100 }),
        roomApi.listTenants().catch(() => ({ success: true, data: [] })),
        invoiceApi.listLandlord({ page: 1, limit: 100 }),
      ]);

      if (!getAccessToken()) return;

      const invoices = invoicesRes.data ?? [];
      setUser(me.data.user);
      setStats({
        roomCount: roomsRes.data?.length ?? 0,
        tenantCount: tenantsRes.data?.length ?? 0,
        invoiceCount: invoices.length,
        paidRevenue: sumPaidAmount(invoices),
      });
    } catch (err) {
      if (!getAccessToken()) return;
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return;
      }
      setUser(sessionUser);
      Alert.alert(
        "Không tải được hồ sơ",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
    }
  }, [isAuthenticated, sessionUser]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      setLoading(true);
      void loadProfile().finally(() => setLoading(false));
    }, [isAuthenticated, loadProfile]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/sv/login_page" as any);
        },
      },
    ]);
  };

  const handleSettingsPress = (item: SettingsItem) => {
    if (item.id === "bookings") {
      router.push("/landlord/bookings_page" as any);
      return;
    }
    if (item.id === "contracts") {
      router.push("/landlord/contracts_page" as any);
      return;
    }
    if (item.id === "messages") {
      router.push("/landlord/messages_page" as any);
      return;
    }
    if (item.id === "invoices") {
      router.push("/landlord/invoices_page" as any);
      return;
    }
    if (item.id === "rooms") {
      router.push("/landlord/rooms_page" as any);
      return;
    }
    if (item.id === "tenants") {
      router.push("/landlord/tenants_page" as any);
      return;
    }
    if (item.id === "properties") {
      router.push("/landlord/rooms_page" as any);
      return;
    }

    Alert.alert(item.label, "Tính năng đang được phát triển.");
  };

  const displayUser = user ?? sessionUser;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.pageHeader}>
          <ThemedText type="title" style={styles.pageTitle}>
            Hồ sơ
          </ThemedText>
          <ThemedText type="small" style={styles.pageSubtitle}>
            Quản lý tài khoản & hệ thống
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor="#E68A2E"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120 + insets.bottom,
          }}
        >
          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : (
            <>
              <View style={styles.heroCard}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={getUserAvatarSource(displayUser?.avatarUrl)}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                  </View>
                </View>

                <ThemedText type="title" style={styles.userName}>
                  {displayUser?.fullName ?? "Chủ nhà"}
                </ThemedText>
                <ThemedText type="small" style={styles.userEmail}>
                  {displayUser?.email ?? "—"}
                </ThemedText>

                <View style={styles.roleBadge}>
                  <ThemedText type="smallBold" style={styles.roleBadgeText}>
                    {getRoleLabel(displayUser?.role).toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <StatCard label="Phòng" value={String(stats.roomCount)} />
                <StatCard label="Người thuê" value={String(stats.tenantCount)} />
                <StatCard label="Hóa đơn" value={String(stats.invoiceCount)} />
              </View>

              <View style={styles.revenueCard}>
                <ThemedText type="small" style={styles.revenueLabel}>
                  Doanh thu đã thu
                </ThemedText>
                <ThemedText type="title" style={styles.revenueValue}>
                  {formatPrice(stats.paidRevenue)}
                </ThemedText>
              </View>

              <View style={styles.sectionCard}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Thông tin cá nhân
                </ThemedText>
                <InfoRow label="Họ và tên" value={displayUser?.fullName ?? "—"} />
                <View style={styles.divider} />
                <InfoRow label="Email" value={displayUser?.email ?? "—"} />
                <View style={styles.divider} />
                <InfoRow label="Số điện thoại" value={displayUser?.phone ?? "—"} />
                <View style={styles.divider} />
                <InfoRow
                  label="Vai trò"
                  value={getRoleLabel(displayUser?.role)}
                />
              </View>

              <ThemedText type="smallBold" style={styles.linksTitle}>
                Tiện ích
              </ThemedText>
              <View style={styles.linksCard}>
                {SETTINGS_MENU_ITEMS.map((item, index) => (
                  <View key={item.id}>
                    <Pressable
                      style={styles.linkRow}
                      onPress={() => handleSettingsPress(item)}
                    >
                      <View style={styles.linkIconWrap}>
                        <Text style={styles.linkIcon}>{item.icon}</Text>
                      </View>
                      <ThemedText type="smallBold" style={styles.linkLabel}>
                        {item.label}
                      </ThemedText>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    {index < SETTINGS_MENU_ITEMS.length - 1 ? (
                      <View style={styles.linkDivider} />
                    ) : null}
                  </View>
                ))}
              </View>

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <ThemedText type="smallBold" style={styles.logoutText}>
                  Đăng xuất
                </ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>

        <LandlordBottomNavigation activeTab="profile" />
      </SafeAreaView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
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
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  avatarWrap: {
    width: 96,
    height: 96,
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFF0DF",
  },
  verifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E68A2E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  verifiedIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  userName: {
    fontSize: 24,
    color: "#1F2940",
    textAlign: "center",
    marginBottom: 4,
  },
  userEmail: {
    color: "#7A869A",
    textAlign: "center",
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: "#FFF0DF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleBadgeText: {
    color: "#C47A10",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  statLabel: {
    color: "#7A869A",
    fontSize: 11,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2940",
  },
  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  revenueLabel: {
    color: "#7A869A",
    marginBottom: 6,
  },
  revenueValue: {
    color: "#2E8B57",
    fontSize: 26,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#1F2940",
    marginBottom: 12,
  },
  infoRow: {
    gap: 4,
    paddingVertical: 4,
  },
  infoLabel: {
    color: "#9AA3B2",
    fontSize: 12,
  },
  infoValue: {
    color: "#1F2940",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBE4",
    marginVertical: 10,
  },
  linksTitle: {
    fontSize: 16,
    color: "#1F2940",
    marginBottom: 10,
  },
  linksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
    overflow: "hidden",
    marginBottom: 14,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  linkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  linkIcon: {
    fontSize: 18,
  },
  linkLabel: {
    flex: 1,
    color: "#1F2940",
    fontSize: 15,
  },
  chevron: {
    fontSize: 22,
    color: "#C5CCD6",
  },
  linkDivider: {
    height: 1,
    backgroundColor: "#F0EBE4",
    marginLeft: 68,
  },
  logoutButton: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5D0D0",
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#D14343",
  },
});
