import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { getApiErrorMessage } from "@/lib/api-error";
import type { Contract } from "@/types/contract";
import { contractStatusLabel } from "@/utils/contract-display";
import { formatPrice } from "@/utils/room-display";
import { imageUriToDataUrl } from "@/utils/image-data-url";

export default function ProfileContractsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

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

  const openSignModal = (contract: Contract) => {
    setSelectedContract(contract);
    setSignModalOpen(true);
  };

  const handlePickSignature = async () => {
    if (!selectedContract) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Cần quyền thư viện ảnh để tải chữ ký.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    setSigningId(selectedContract._id);
    try {
      const dataUrl = await imageUriToDataUrl(
        result.assets[0].uri,
        result.assets[0].mimeType ?? "image/jpeg",
      );
      await contractApi.confirmByTenant(selectedContract._id, {
        tenantSignatureDataUrl: dataUrl,
      });
      Alert.alert("Thành công", "Bạn đã ký hợp đồng.");
      setSignModalOpen(false);
      setSelectedContract(null);
      await loadContracts(true);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không ký được hợp đồng."));
    } finally {
      setSigningId(null);
    }
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
              const canSign = contract.status === "PENDING_TENANT_SIGNATURE";
              return (
                <View key={contract._id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <ThemedText type="smallBold" style={styles.cardTitle}>
                      Hợp đồng #{contract._id.slice(-6).toUpperCase()}
                    </ThemedText>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>
                        {contractStatusLabel(contract.status)}
                      </Text>
                    </View>
                  </View>
                  <ThemedText type="small" style={styles.cardMeta}>
                    Tiền thuê: {formatPrice(contract.monthlyRent)}/tháng
                  </ThemedText>
                  {contract.startDate ? (
                    <ThemedText type="small" style={styles.cardMeta}>
                      Bắt đầu:{" "}
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                    </ThemedText>
                  ) : null}
                  {canSign ? (
                    <Pressable
                      style={styles.signButton}
                      onPress={() => openSignModal(contract)}
                    >
                      <ThemedText type="smallBold" style={styles.signButtonText}>
                        Ký hợp đồng
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={signModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Ký hợp đồng
            </ThemedText>
            <ThemedText type="small" style={styles.modalDesc}>
              Tải ảnh chữ ký (PNG/JPG) để xác nhận hợp đồng, tương tự phiên bản
              web.
            </ThemedText>
            <Pressable
              style={styles.signButton}
              onPress={() => void handlePickSignature()}
              disabled={signingId !== null}
            >
              {signingId ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.signButtonText}>
                  Chọn ảnh chữ ký
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setSignModalOpen(false);
                setSelectedContract(null);
              }}
            >
              <ThemedText type="smallBold" style={styles.cancelText}>
                Đóng
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  cardTitle: { color: "#2F261A", flex: 1 },
  cardMeta: { color: "#8A7B68" },
  statusPill: {
    backgroundColor: "#FFF4D6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "800", color: "#C47A10" },
  signButton: {
    marginTop: 8,
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  signButtonText: { color: "#FFFFFF" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(47, 38, 26, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontSize: 18, color: "#2F261A", textAlign: "center" },
  modalDesc: { color: "#8A7B68", textAlign: "center", lineHeight: 20 },
  cancelButton: { alignItems: "center", paddingVertical: 8 },
  cancelText: { color: "#8A7B68" },
});
