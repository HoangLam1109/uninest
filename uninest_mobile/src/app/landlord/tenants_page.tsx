import { useFocusEffect } from "expo-router";
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

import { roomApi } from "@/api/room.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { LandlordTenant } from "@/types/tenant";
import { formatBookingDate } from "@/utils/booking-display";

export default function LandlordTenantsPage() {
  const insets = useSafeAreaInsets();
  const [tenants, setTenants] = useState<LandlordTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      const res = await roomApi.listTenants();
      setTenants(res.data ?? []);
    } catch (err) {
      Alert.alert(
        "Không tải được danh sách người thuê",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setTenants([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadTenants().finally(() => setLoading(false));
    }, [loadTenants]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
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
              Danh sách người thuê
            </ThemedText>
            <ThemedText type="small" style={styles.pageSubtitle}>
              Tổng {tenants.length} người thuê đang thuê phòng của bạn.
            </ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : tenants.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Chưa có người thuê nào
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Danh sách người đang thuê phòng của bạn sẽ hiển thị tại đây.
              </ThemedText>
            </View>
          ) : (
            tenants.map((tenant) => (
              <TenantCard
                key={`${tenant.tenantId}-${tenant.roomTitle}`}
                tenant={tenant}
              />
            ))
          )}
        </ScrollView>

        <LandlordBottomNavigation activeTab="tenants" />
      </SafeAreaView>
    </View>
  );
}

function TenantCard({ tenant }: { tenant: LandlordTenant }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.cardMain}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {tenant.tenantName}
          </ThemedText>
          <ThemedText type="small" style={styles.cardMeta}>
            📍 {tenant.roomTitle}
          </ThemedText>
        </View>
        {tenant.isPrimaryTenant ? (
          <View style={[styles.badge, styles.badgePrimary]}>
            <ThemedText type="small" style={styles.badgePrimaryText}>
              Chính
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.infoBox}>
        <InfoRow label="Email" value={tenant.tenantEmail} />
        <InfoRow label="Điện thoại" value={tenant.tenantPhone} />
        {tenant.dateOfBirth ? (
          <InfoRow
            label="Ngày sinh"
            value={formatBookingDate(tenant.dateOfBirth)}
          />
        ) : null}
        {tenant.cccdNumber ? (
          <InfoRow label="CCCD" value={tenant.cccdNumber} />
        ) : null}
        <InfoRow label="Địa chỉ" value={tenant.address} />
      </View>
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
    fontSize: 17,
    color: "#1F2940",
    marginBottom: 8,
  },
  emptyText: {
    color: "#7A869A",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    color: "#1F2940",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#7A869A",
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePrimary: {
    backgroundColor: "#FFF4E0",
  },
  badgePrimaryText: {
    color: "#C47A10",
    fontSize: 10,
    fontWeight: "700",
  },
  infoBox: {
    gap: 8,
    backgroundColor: "#F7F6F2",
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: "#7A869A",
    fontSize: 11,
  },
  infoValue: {
    color: "#1F2940",
  },
});
