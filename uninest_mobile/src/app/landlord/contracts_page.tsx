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

import { contractApi } from "@/api/contract.api";
import {
  ContractFormModal,
  type ContractFormMode,
} from "@/components/landlord/contract-form-modal";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Contract, ContractStatus } from "@/types/contract";
import {
  contractStatusLabel,
  getContractBookingId,
} from "@/utils/contract-display";
import { formatPrice } from "@/utils/room-display";
import { openContractFile } from "@/utils/open-contract-file";

type ModalState = {
  mode: ContractFormMode;
  contract?: Contract;
} | null;

const STATUS_FILTERS: { id: "ALL" | ContractStatus; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "DRAFT", label: "Nháp" },
  { id: "PENDING_TENANT_SIGNATURE", label: "Chờ ký" },
  { id: "ACTIVE", label: "Hiệu lực" },
  { id: "EXPIRED", label: "Hết hạn" },
  { id: "TERMINATED", label: "Đã chấm dứt" },
];

function getTenantName(contract: Contract) {
  const tenant = contract.tenantId;
  if (typeof tenant === "object" && tenant !== null) {
    return tenant.fullName ?? tenant.email ?? "Người thuê";
  }
  return "Người thuê";
}

function getRoomTitle(contract: Contract) {
  const booking = contract.bookingId;
  if (typeof booking === "object" && booking?.roomId) {
    const room = booking.roomId;
    if (typeof room === "object" && room !== null && "title" in room) {
      return room.title ?? "Phòng";
    }
  }
  return "Phòng";
}

export default function LandlordContractsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ContractStatus>("ALL");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await contractApi.listLandlord({ page: 1, limit: 100 });
      setContracts(res.data ?? []);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không tải được hợp đồng."));
      setContracts([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return contracts;
    return contracts.filter((item) => item.status === statusFilter);
  }, [contracts, statusFilter]);

  const summary = useMemo(() => {
    return contracts.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "DRAFT") acc.draft += 1;
        if (item.status === "ACTIVE") acc.active += 1;
        if (item.status === "PENDING_TENANT_SIGNATURE") acc.pending += 1;
        return acc;
      },
      { total: 0, draft: 0, active: 0, pending: 0 },
    );
  }, [contracts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleActivate = (contract: Contract) => {
    Alert.alert("Gửi hợp đồng", "Gửi hợp đồng cho người thuê ký?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gửi",
        onPress: () => {
          setActionId(contract._id);
          void contractApi
            .activate(contract._id)
            .then(() => loadData())
            .then(() => Alert.alert("Thành công", "Đã gửi hợp đồng cho người thuê ký."))
            .catch((err) =>
              Alert.alert("Lỗi", getApiErrorMessage(err, "Không gửi được hợp đồng.")),
            )
            .finally(() => setActionId(null));
        },
      },
    ]);
  };

  const handleTerminate = (contract: Contract) => {
    Alert.alert("Chấm dứt hợp đồng", "Bạn có chắc muốn chấm dứt hợp đồng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấm dứt",
        style: "destructive",
        onPress: () => {
          setActionId(contract._id);
          void contractApi
            .terminate(contract._id)
            .then(() => loadData())
            .then(() => Alert.alert("Đã chấm dứt", "Hợp đồng đã được chấm dứt."))
            .catch((err) =>
              Alert.alert("Lỗi", getApiErrorMessage(err, "Không chấm dứt được hợp đồng.")),
            )
            .finally(() => setActionId(null));
        },
      },
    ]);
  };

  const handleOpenFile = async (contract: Contract) => {
    try {
      await openContractFile(contract._id, contract.contractFileUrl);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không mở được file hợp đồng."));
    }
  };

  const handleSubmitForm = async (payload: {
    bookingId?: string;
    monthlyRent: number;
    depositAmount?: number;
    terms?: string;
    contractFileUrl?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!modalState) return;

    if (modalState.mode === "create") {
      if (!payload.bookingId) throw new Error("Thiếu bookingId");
      await contractApi.createFromBooking({
        bookingId: payload.bookingId,
        monthlyRent: payload.monthlyRent,
        depositAmount: payload.depositAmount,
        terms: payload.terms,
        contractFileUrl: payload.contractFileUrl,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      Alert.alert("Thành công", "Đã tạo hợp đồng nháp.");
    } else if (modalState.mode === "edit" && modalState.contract) {
      await contractApi.update(modalState.contract._id, payload);
      Alert.alert("Thành công", "Đã cập nhật hợp đồng.");
    } else if (modalState.mode === "renew" && modalState.contract) {
      if (!payload.startDate) throw new Error("Thiếu ngày bắt đầu");
      await contractApi.renew(modalState.contract._id, {
        monthlyRent: payload.monthlyRent,
        depositAmount: payload.depositAmount,
        terms: payload.terms,
        contractFileUrl: payload.contractFileUrl,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      Alert.alert("Thành công", "Đã gia hạn hợp đồng.");
    }

    setModalState(null);
    await loadData();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerTextWrap}>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              Hợp đồng
            </ThemedText>
            <ThemedText type="small" style={styles.headerSubtitle}>
              Quản lý hợp đồng thuê phòng
            </ThemedText>
          </View>
          <Pressable
            style={styles.createBtn}
            onPress={() => setModalState({ mode: "create" })}
          >
            <Text style={styles.createBtnText}>+ Tạo</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard label="Tổng" value={String(summary.total)} />
          <StatCard label="Nháp" value={String(summary.draft)} />
          <StatCard label="Chờ ký" value={String(summary.pending)} />
          <StatCard label="Hiệu lực" value={String(summary.active)} />
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setStatusFilter(filter.id)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 + insets.bottom }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor="#E68A2E" />
          }
        >
          {loading ? (
            <ActivityIndicator color="#E68A2E" style={{ marginTop: 24 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có hợp đồng nào.
              </ThemedText>
            </View>
          ) : (
            filtered.map((contract) => (
              <ContractCard
                key={contract._id}
                contract={contract}
                busy={actionId === contract._id}
                onEdit={() => setModalState({ mode: "edit", contract })}
                onRenew={() => setModalState({ mode: "renew", contract })}
                onActivate={() => handleActivate(contract)}
                onTerminate={() => handleTerminate(contract)}
                onOpenFile={() => void handleOpenFile(contract)}
              />
            ))
          )}
        </ScrollView>

        <LandlordBottomNavigation activeTab="settings" />
      </SafeAreaView>

      <ContractFormModal
        visible={modalState !== null}
        mode={modalState?.mode ?? "create"}
        contract={modalState?.contract}
        onClose={() => setModalState(null)}
        onSubmit={handleSubmitForm}
      />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ContractCard({
  contract,
  busy,
  onEdit,
  onRenew,
  onActivate,
  onTerminate,
  onOpenFile,
}: {
  contract: Contract;
  busy: boolean;
  onEdit: () => void;
  onRenew: () => void;
  onActivate: () => void;
  onTerminate: () => void;
  onOpenFile: () => void;
}) {
  const bookingId = getContractBookingId(contract);
  const canEdit = contract.status === "DRAFT";
  const canActivate = contract.status === "DRAFT";
  const canTerminate = contract.status === "ACTIVE";
  const canRenew = contract.status === "ACTIVE" || contract.status === "EXPIRED";

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {getTenantName(contract)}
          </ThemedText>
          <ThemedText type="small" style={styles.cardMeta}>
            {getRoomTitle(contract)}
          </ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {contractStatusLabel(contract.status)}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <InfoRow label="Giá thuê" value={`${formatPrice(contract.monthlyRent)}/tháng`} />
        {contract.depositAmount ? (
          <InfoRow label="Tiền cọc" value={formatPrice(contract.depositAmount)} />
        ) : null}
        {bookingId ? <InfoRow label="Mã đơn" value={bookingId.slice(-8)} /> : null}
      </View>

      <View style={styles.actionRow}>
        <ActionButton label="PDF" onPress={onOpenFile} />
        {canEdit ? <ActionButton label="Sửa" onPress={onEdit} primary /> : null}
        {canActivate ? (
          <ActionButton label="Gửi ký" onPress={onActivate} primary disabled={busy} />
        ) : null}
        {canRenew ? <ActionButton label="Gia hạn" onPress={onRenew} /> : null}
        {canTerminate ? (
          <ActionButton label="Chấm dứt" onPress={onTerminate} danger disabled={busy} />
        ) : null}
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

function ActionButton({
  label,
  onPress,
  primary,
  danger,
  disabled,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.actionBtn,
        primary && styles.actionBtnPrimary,
        danger && styles.actionBtnDanger,
        disabled && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.actionBtnText,
          primary && styles.actionBtnTextPrimary,
          danger && styles.actionBtnTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F6F2" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 22, color: "#1F2940" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 22, color: "#1F2940" },
  headerSubtitle: { color: "#9AA3B2", marginTop: 2 },
  createBtn: {
    backgroundColor: "#E68A2E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  statsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
  statCard: {
    minWidth: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EDE8DF",
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#E68A2E" },
  statLabel: { fontSize: 11, color: "#9AA3B2", marginTop: 4 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE8DF",
  },
  filterChipActive: { backgroundColor: "#FFF4E8", borderColor: "#E68A2E" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#9AA3B2" },
  filterTextActive: { color: "#E68A2E" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { color: "#9AA3B2" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE8DF",
    padding: 14,
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { color: "#1F2940", fontSize: 16 },
  cardMeta: { color: "#9AA3B2", marginTop: 4 },
  statusBadge: {
    backgroundColor: "#FFF4E8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700", color: "#E68A2E" },
  infoBox: { marginTop: 12, gap: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  infoLabel: { color: "#9AA3B2" },
  infoValue: { color: "#1F2940" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  actionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EDE8DF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  actionBtnPrimary: { backgroundColor: "#E68A2E", borderColor: "#E68A2E" },
  actionBtnDanger: { backgroundColor: "#FFEBEE", borderColor: "#FFCDD2" },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#1F2940" },
  actionBtnTextPrimary: { color: "#FFFFFF" },
  actionBtnTextDanger: { color: "#C62828" },
});
