import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { ContractSummary } from "@/components/landlord/contract-summary";
import { LandlordContractCard } from "@/components/landlord/landlord-contract-card";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  Contract,
  CreateContractPayload,
  RenewContractPayload,
  UpdateContractPayload,
} from "@/types/contract";
import { openContractFile } from "@/utils/open-contract-file";

const PAGE_SIZE = 10;

type ModalState = {
  mode: ContractFormMode;
  contract?: Contract;
} | null;

export default function LandlordContractsPage() {
  const insets = useSafeAreaInsets();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await contractApi.listLandlord({ page, limit: PAGE_SIZE });
      setContracts(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? res.data?.length ?? 0);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không tải được hợp đồng."));
      setContracts([]);
      setTotalPages(1);
      setTotal(0);
    }
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  useEffect(() => {
    setLoading(true);
    void loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const runAction = async (
    contractId: string,
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ) => {
    setActionId(contractId);
    try {
      await action();
      await loadData();
      Alert.alert("Thành công", successMessage);
    } catch (err) {
      Alert.alert(errorMessage, getApiErrorMessage(err, "Vui lòng thử lại."));
    } finally {
      setActionId(null);
    }
  };

  const handleActivate = (contract: Contract) => {
    void runAction(
      contract._id,
      () => contractApi.activate(contract._id),
      "Đã gửi hợp đồng cho người thuê ký.",
      "Không gửi được hợp đồng",
    );
  };

  const handleTerminate = (contract: Contract) => {
    Alert.alert("Chấm dứt hợp đồng", "Bạn có chắc muốn chấm dứt hợp đồng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấm dứt",
        style: "destructive",
        onPress: () => {
          void runAction(
            contract._id,
            () => contractApi.terminate(contract._id),
            "Hợp đồng đã được chấm dứt.",
            "Không chấm dứt được hợp đồng",
          );
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
    contractFile?: CreateContractPayload["contractFile"];
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
        contractFile: payload.contractFile,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      Alert.alert("Thành công", "Đã tạo hợp đồng nháp.");
    } else if (modalState.mode === "edit" && modalState.contract) {
      const updatePayload: UpdateContractPayload = {
        monthlyRent: payload.monthlyRent,
        depositAmount: payload.depositAmount,
        terms: payload.terms,
        contractFile: payload.contractFile,
        startDate: payload.startDate,
        endDate: payload.endDate,
      };
      await contractApi.update(modalState.contract._id, updatePayload);
      Alert.alert("Thành công", "Đã cập nhật hợp đồng.");
    } else if (modalState.mode === "renew" && modalState.contract) {
      if (!payload.startDate) throw new Error("Thiếu ngày bắt đầu");
      const renewPayload: RenewContractPayload = {
        monthlyRent: payload.monthlyRent,
        depositAmount: payload.depositAmount,
        terms: payload.terms,
        contractFile: payload.contractFile,
        startDate: payload.startDate,
        endDate: payload.endDate,
      };
      await contractApi.renew(modalState.contract._id, renewPayload);
      Alert.alert("Thành công", "Đã gia hạn hợp đồng.");
    }

    setModalState(null);
    await loadData();
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
            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.pageTitle}>
                Quản lý hợp đồng
              </ThemedText>
              <ThemedText type="small" style={styles.pageSubtitle}>
                Theo dõi trạng thái ký, thời hạn thuê và file hợp đồng của từng
                phòng.
              </ThemedText>
            </View>
            <Pressable
              style={styles.createBtn}
              onPress={() => setModalState({ mode: "create" })}
            >
              <Text style={styles.createBtnIcon}>+</Text>
              <ThemedText type="smallBold" style={styles.createBtnText}>
                Tạo hợp đồng
              </ThemedText>
            </Pressable>
          </View>

          <ContractSummary contracts={contracts} total={total} />

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 32 }}
              size="large"
            />
          ) : contracts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>📄</Text>
              </View>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Chưa có hợp đồng nào
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Tạo hợp đồng từ booking đã duyệt để quản lý thời hạn thuê và
                quy trình ký.
              </ThemedText>
            </View>
          ) : (
            contracts.map((contract) => (
              <LandlordContractCard
                key={contract._id}
                contract={contract}
                busy={actionId === contract._id}
                onEdit={() => setModalState({ mode: "edit", contract })}
                onRenew={() => setModalState({ mode: "renew", contract })}
                onActivate={() => handleActivate(contract)}
                onTerminate={() => handleTerminate(contract)}
                onOpenFile={() => handleOpenFile(contract)}
              />
            ))
          )}

          {totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Trước
                </ThemedText>
              </Pressable>
              <ThemedText type="small" style={styles.pageInfo}>
                Trang {page}/{totalPages}
              </ThemedText>
              <Pressable
                style={[
                  styles.pageBtn,
                  page >= totalPages && styles.pageBtnDisabled,
                ]}
                disabled={page >= totalPages}
                onPress={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Sau
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <LandlordBottomNavigation activeTab="profile" />
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F6F2" },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    gap: 14,
    marginBottom: 16,
  },
  headerText: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    color: "#1F2940",
  },
  pageSubtitle: {
    color: "#7A869A",
    lineHeight: 18,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  createBtnIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    marginTop: 8,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#1F2940",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#7A869A",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  pageBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: "#1F2940",
  },
  pageInfo: {
    color: "#7A869A",
  },
});
