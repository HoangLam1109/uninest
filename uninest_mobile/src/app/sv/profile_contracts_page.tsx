import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

import { contractApi } from "@/api/contract.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Contract } from "@/types/contract";
import {
  contractStatusLabel,
  contractStatusPillStyle,
  formatContractDate,
  getContractRoomTitle,
} from "@/utils/contract-display";
import { formatPrice } from "@/utils/room-display";

export default function ProfileContractsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContracts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await contractApi.listTenant({ page: 1, limit: 100 });
      setContracts(res.data ?? []);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadContracts();
    }, [loadContracts]),
  );

  const openDetail = (contract: Contract) => {
    router.push({
      pathname: "/sv/profile_contract_detail_page",
      params: { id: contract._id },
    } as any);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hợp đồng
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadContracts(true)}
              tintColor="#F28C1B"
            />
          }
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : contracts.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Bạn chưa có hợp đồng nào.
              </ThemedText>
            </View>
          ) : (
            contracts.map((contract) => {
              const statusStyle = contractStatusPillStyle(contract.status);
              return (
                <Pressable
                  key={contract._id}
                  style={styles.card}
                  onPress={() => openDetail(contract)}
                >
                  <View style={styles.cardTop}>
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      Hợp đồng #{contract._id.slice(-6).toUpperCase()}
                    </ThemedText>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusStyle.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusStyle.color }]}
                      >
                        {contractStatusLabel(contract.status)}
                      </Text>
                    </View>
                  </View>
                  <ThemedText type="smallBold" style={styles.roomTitle}>
                    {getContractRoomTitle(contract)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.cardMeta}>
                    Tiền thuê: {formatPrice(contract.monthlyRent)}/tháng
                  </ThemedText>
                  {contract.startDate ? (
                    <ThemedText type="small" style={styles.cardMeta}>
                      Bắt đầu: {formatContractDate(contract.startDate)}
                    </ThemedText>
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
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { color: "#8A7B68", flex: 1, fontSize: 12 },
  roomTitle: { color: "#2F261A", fontSize: 16 },
  cardMeta: { color: "#8A7B68" },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "800" },
});
