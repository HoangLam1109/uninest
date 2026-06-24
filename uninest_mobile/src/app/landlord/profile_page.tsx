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
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AuthUser } from "@/types/auth";
import { getRoleLabel } from "@/utils/landlord-access";
import { sumPaidAmount } from "@/utils/invoice-display";
import { formatPrice } from "@/utils/room-display";

const AVATAR_PLACEHOLDER = require("@/assets/images/icon.png");

type ProfileStats = {
  roomCount: number;
  tenantCount: number;
  invoiceCount: number;
  paidRevenue: number;
};

const QUICK_LINKS = [
  { id: "rooms", label: "Quản lý phòng", icon: "🛏", route: "/landlord/rooms_page" },
  { id: "tenants", label: "Người thuê", icon: "👥", route: "/landlord/tenants_page" },
  { id: "invoices", label: "Báo cáo hóa đơn", icon: "🧾", route: "/landlord/invoices_page" },
  { id: "settings", label: "Cài đặt", icon: "⚙", route: "/landlord/settings_page" },
] as const;

export default function LandlordProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser } = useAuth();
  const logout = useLogout();
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
    try {
      const [me, roomsRes, tenantsRes, invoicesRes] = await Promise.all([
        authApi.getMe(),
        roomApi.listMy({ page: 1, limit: 100 }),
        roomApi.listTenants().catch(() => ({ success: true, data: [] })),
        invoiceApi.listLandlord({ page: 1, limit: 100 }),
      ]);

      const invoices = invoicesRes.data ?? [];
      setUser(me.data.user);
      setStats({
        roomCount: roomsRes.data?.length ?? 0,
        tenantCount: tenantsRes.data?.length ?? 0,
        invoiceCount: invoices.length,
        paidRevenue: sumPaidAmount(invoices),
      });
    } catch (err) {
      setUser(sessionUser);
      Alert.alert(
        "Không tải được hồ sơ",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
    }
  }, [sessionUser]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadProfile().finally(() => setLoading(false));
    }, [loadProfile]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const displayUser = user ?? sessionUser;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hồ sơ chủ nhà
          </ThemedText>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/landlord/profile_edit_page" as any)}
          >
            <Text style={styles.editIcon}>✎</Text>
          </Pressable>
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
            paddingBottom: 32 + insets.bottom,
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
                    source={AVATAR_PLACEHOLDER}
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
                Truy cập nhanh
              </ThemedText>
              <View style={styles.linksCard}>
                {QUICK_LINKS.map((item, index) => (
                  <View key={item.id}>
                    <Pressable
                      style={styles.linkRow}
                      onPress={() => router.push(item.route as any)}
                    >
                      <View style={styles.linkIconWrap}>
                        <Text style={styles.linkIcon}>{item.icon}</Text>
                      </View>
                      <ThemedText type="smallBold" style={styles.linkLabel}>
                        {item.label}
                      </ThemedText>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    {index < QUICK_LINKS.length - 1 ? (
                      <View style={styles.linkDivider} />
                    ) : null}
                  </View>
                ))}
              </View>

              <Pressable style={styles.logoutButton} onPress={logout}>
                <ThemedText type="smallBold" style={styles.logoutText}>
                  Đăng xuất
                </ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: "#1F2940",
  },
  editIcon: {
    fontSize: 20,
    color: "#E68A2E",
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    color: "#1F2940",
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
