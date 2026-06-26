import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

import { contractApi } from "@/api/contract.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Contract } from "@/types/contract";
import {
  contractStatusLabel,
  contractStatusPillStyle,
  formatContractCurrency,
  formatContractDate,
  getContractPartyName,
  getContractRoomAddress,
  getContractRoomTitle,
  hasContractFile,
} from "@/utils/contract-display";
import { imageUriToDataUrl } from "@/utils/image-data-url";
import { openContractFile } from "@/utils/open-contract-file";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.detailValue}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function ProfileContractDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const contractId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  const loadContract = useCallback(async () => {
    if (!contractId) {
      setError("Không tìm thấy hợp đồng.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await contractApi.getById(contractId);
      setContract(
        res.data ? { ...res.data, _id: String(res.data._id) } : null,
      );
    } catch (err) {
      setContract(null);
      setError(getApiErrorMessage(err, "Không tải được hợp đồng."));
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useFocusEffect(
    useCallback(() => {
      void loadContract();
    }, [loadContract]),
  );

  const handleOpenFile = async () => {
    if (!contract) return;
    setOpeningFile(true);
    try {
      await openContractFile(contract._id, contract.contractFileUrl);
    } catch (err) {
      Alert.alert(
        "Không mở được file",
        getApiErrorMessage(err, "Vui lòng thử lại sau."),
      );
    } finally {
      setOpeningFile(false);
    }
  };

  const handlePickSignature = async () => {
    if (!contract) return;
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

    setSigning(true);
    try {
      const dataUrl = await imageUriToDataUrl(
        result.assets[0].uri,
        result.assets[0].mimeType ?? "image/jpeg",
      );
      await contractApi.confirmByTenant(contract._id, {
        tenantSignatureDataUrl: dataUrl,
      });
      Alert.alert("Thành công", "Bạn đã ký hợp đồng.");
      setSignModalOpen(false);
      await loadContract();
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không ký được hợp đồng."));
    } finally {
      setSigning(false);
    }
  };

  const canSign = contract?.status === "PENDING_TENANT_SIGNATURE";
  const statusStyle = contract
    ? contractStatusPillStyle(contract.status)
    : null;
  const roomAddress = contract ? getContractRoomAddress(contract) : null;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chi tiết hợp đồng
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color="#F28C1B" size="large" />
          </View>
        ) : error ? (
          <View style={styles.centerWrap}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : contract ? (
          <>
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 120 + insets.bottom,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                  <ThemedText type="smallBold" style={styles.contractCode}>
                    Hợp đồng #{contract._id.slice(-6).toUpperCase()}
                  </ThemedText>
                  {statusStyle ? (
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
                  ) : null}
                </View>

                <ThemedText type="title" style={styles.roomTitle}>
                  {getContractRoomTitle(contract)}
                </ThemedText>
                {roomAddress ? (
                  <ThemedText type="small" style={styles.roomAddress}>
                    📍 {roomAddress}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" style={styles.createdAt}>
                  Tạo ngày {formatContractDate(contract.createdAt)}
                </ThemedText>
              </View>

              <View style={styles.sectionCard}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Thông tin các bên
                </ThemedText>
                <DetailRow
                  label="Chủ nhà"
                  value={getContractPartyName(contract.landlordId)}
                />
                <DetailRow
                  label="Người thuê"
                  value={getContractPartyName(contract.tenantId)}
                />
              </View>

              <View style={styles.sectionCard}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Chi phí
                </ThemedText>
                <View style={styles.priceHighlight}>
                  <ThemedText type="small" style={styles.priceLabel}>
                    Tiền thuê / tháng
                  </ThemedText>
                  <ThemedText type="title" style={styles.priceValue}>
                    {formatContractCurrency(contract.monthlyRent)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.depositText}>
                    Tiền cọc: {formatContractCurrency(contract.depositAmount)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Thời hạn
                </ThemedText>
                <View style={styles.dateGrid}>
                  <View style={styles.dateBox}>
                    <ThemedText type="small" style={styles.dateLabel}>
                      Bắt đầu
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.dateValue}>
                      {formatContractDate(contract.startDate)}
                    </ThemedText>
                  </View>
                  <View style={styles.dateBox}>
                    <ThemedText type="small" style={styles.dateLabel}>
                      Kết thúc
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.dateValue}>
                      {formatContractDate(contract.endDate ?? undefined)}
                    </ThemedText>
                  </View>
                </View>
                {contract.signedAt ? (
                  <DetailRow
                    label="Ngày ký"
                    value={formatContractDate(contract.signedAt)}
                  />
                ) : null}
              </View>

              <View style={styles.sectionCard}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  File hợp đồng
                </ThemedText>
                <ThemedText type="small" style={styles.fileHint}>
                  {hasContractFile(contract)
                    ? "Đã có file hợp đồng đính kèm."
                    : "Chưa có file hợp đồng."}
                </ThemedText>
                {hasContractFile(contract) ? (
                  <Pressable
                    style={styles.outlineButton}
                    onPress={() => void handleOpenFile()}
                    disabled={openingFile}
                  >
                    {openingFile ? (
                      <ActivityIndicator color="#F28C1B" />
                    ) : (
                      <ThemedText type="smallBold" style={styles.outlineButtonText}>
                        Xem file hợp đồng
                      </ThemedText>
                    )}
                  </Pressable>
                ) : null}
              </View>

              {contract.terms ? (
                <View style={styles.sectionCard}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Điều khoản
                  </ThemedText>
                  <ThemedText type="small" style={styles.termsText}>
                    {contract.terms}
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>

            {canSign ? (
              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setSignModalOpen(true)}
                >
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>
                    Ký hợp đồng
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </SafeAreaView>

      <Modal visible={signModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Ký hợp đồng
            </ThemedText>
            <ThemedText type="small" style={styles.modalDesc}>
              Tải ảnh chữ ký (PNG/JPG) để xác nhận hợp đồng.
            </ThemedText>
            <Pressable
              style={styles.primaryButton}
              onPress={() => void handlePickSignature()}
              disabled={signing}
            >
              {signing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Chọn ảnh chữ ký
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setSignModalOpen(false)}
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
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: { color: "#D14343", textAlign: "center" },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    gap: 8,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  contractCode: { color: "#8A7B68", flex: 1 },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "800" },
  roomTitle: { color: "#2F261A", fontSize: 22 },
  roomAddress: { color: "#8A7B68", lineHeight: 20 },
  createdAt: { color: "#9AA0A9" },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    gap: 10,
  },
  sectionTitle: { color: "#2F261A", fontSize: 16, marginBottom: 2 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  detailLabel: { color: "#8A7B68", flex: 1 },
  detailValue: { color: "#2F261A", flex: 1, textAlign: "right" },
  priceHighlight: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  priceLabel: { color: "#F28C1B", fontWeight: "700" },
  priceValue: { color: "#2F261A", fontSize: 24 },
  depositText: { color: "#8A7B68" },
  dateGrid: {
    flexDirection: "row",
    gap: 10,
  },
  dateBox: {
    flex: 1,
    backgroundColor: "#F7F2E9",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  dateLabel: { color: "#8A7B68" },
  dateValue: { color: "#2F261A" },
  fileHint: { color: "#8A7B68" },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#F28C1B",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonText: { color: "#F28C1B" },
  termsText: { color: "#5C5348", lineHeight: 22 },
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
  },
  primaryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16 },
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
