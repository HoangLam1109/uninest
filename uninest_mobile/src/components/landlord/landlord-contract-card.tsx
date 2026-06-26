import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Contract } from "@/types/contract";
import {
  contractStatusBadgeStyle,
  contractStatusLabel,
  formatContractCurrency,
  formatContractDate,
  getContractPartyName,
  getContractRoomTitle,
  hasContractFile,
} from "@/utils/contract-display";

function badgeStyle(status: ReturnType<typeof contractStatusBadgeStyle>) {
  if (status === "draft") return styles.badgeDraft;
  if (status === "pending") return styles.badgePending;
  if (status === "active") return styles.badgeActive;
  if (status === "expired") return styles.badgeExpired;
  return styles.badgeTerminated;
}

export function LandlordContractCard({
  contract,
  busy,
  onEdit,
  onRenew,
  onActivate,
  onTerminate,
  onOpenFile,
}: {
  contract: Contract;
  busy?: boolean;
  onEdit: () => void;
  onRenew: () => void;
  onActivate: () => void;
  onTerminate: () => void;
  onOpenFile: () => void;
}) {
  const [openingFile, setOpeningFile] = useState(false);
  const canEdit = contract.status === "DRAFT";
  const canActivate = contract.status === "DRAFT";
  const canTerminate = contract.status === "ACTIVE";
  const canRenew =
    contract.status === "ACTIVE" || contract.status === "EXPIRED";
  const fileAvailable = hasContractFile(contract);

  const handleOpenFile = async () => {
    setOpeningFile(true);
    try {
      await onOpenFile();
    } finally {
      setOpeningFile(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.badge,
              badgeStyle(contractStatusBadgeStyle(contract.status)),
            ]}
          >
            <ThemedText type="small" style={styles.badgeText}>
              {contractStatusLabel(contract.status)}
            </ThemedText>
          </View>
          {contract.createdAt ? (
            <ThemedText type="small" style={styles.createdAt}>
              ⏱ {formatContractDate(contract.createdAt)}
            </ThemedText>
          ) : null}
        </View>

        <ThemedText type="smallBold" style={styles.roomTitle}>
          {getContractRoomTitle(contract)}
        </ThemedText>
        <ThemedText type="small" style={styles.tenantName}>
          👤 {getContractPartyName(contract.tenantId)}
        </ThemedText>

        <View style={styles.rentBox}>
          <ThemedText type="small" style={styles.rentLabel}>
            💰 TIỀN THUÊ
          </ThemedText>
          <ThemedText type="smallBold" style={styles.rentValue}>
            {formatContractCurrency(contract.monthlyRent)}
          </ThemedText>
          <ThemedText type="small" style={styles.depositText}>
            Cọc {formatContractCurrency(contract.depositAmount)}
          </ThemedText>
        </View>

        <View style={styles.dateGrid}>
          <View style={styles.dateCell}>
            <ThemedText type="small" style={styles.dateLabel}>
              📅 Bắt đầu
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dateValue}>
              {formatContractDate(contract.startDate)}
            </ThemedText>
          </View>
          <View style={styles.dateCell}>
            <ThemedText type="small" style={styles.dateLabel}>
              📅 Kết thúc
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dateValue}>
              {formatContractDate(contract.endDate ?? undefined)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.fileRow}>
          <Text style={styles.fileIcon}>{fileAvailable ? "✅" : "🛡"}</Text>
          <ThemedText type="small" style={styles.fileText}>
            {fileAvailable ? "Đã có file hợp đồng" : "Chưa có file hợp đồng"}
          </ThemedText>
        </View>

        {contract.terms ? (
          <ThemedText type="small" style={styles.terms} numberOfLines={2}>
            {contract.terms}
          </ThemedText>
        ) : null}

        <View style={styles.actions}>
          {fileAvailable ? (
            <ActionButton
              label={openingFile ? "Đang mở file" : "Xem file"}
              onPress={() => void handleOpenFile()}
              disabled={busy || openingFile}
            />
          ) : null}
          {canEdit ? (
            <ActionButton label="Sửa" onPress={onEdit} disabled={busy} />
          ) : null}
          {canRenew ? (
            <ActionButton label="Gia hạn" onPress={onRenew} disabled={busy} />
          ) : null}
          {canTerminate ? (
            <ActionButton
              label="Chấm dứt"
              onPress={onTerminate}
              danger
              disabled={busy}
            />
          ) : null}
          {canActivate ? (
            <ActionButton
              label="Gửi ký"
              onPress={onActivate}
              primary
              disabled={busy}
            />
          ) : null}
        </View>
      </View>
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
      {disabled && primary ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <ThemedText
          type="smallBold"
          style={[
            styles.actionBtnText,
            primary && styles.actionBtnTextPrimary,
            danger && styles.actionBtnTextDanger,
          ]}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
    overflow: "hidden",
  },
  accentBar: {
    height: 5,
    backgroundColor: "#E68A2E",
  },
  body: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDraft: { backgroundColor: "#F1F3F7" },
  badgePending: { backgroundColor: "#E8F0FE" },
  badgeActive: { backgroundColor: "#E8F6EE" },
  badgeExpired: { backgroundColor: "#FFF4E0" },
  badgeTerminated: { backgroundColor: "#FDECEC" },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2940",
  },
  createdAt: {
    color: "#9AA3B2",
    fontSize: 11,
  },
  roomTitle: {
    fontSize: 18,
    color: "#1F2940",
    marginBottom: 6,
  },
  tenantName: {
    color: "#7A869A",
    marginBottom: 12,
  },
  rentBox: {
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0D9BC",
    padding: 12,
    marginBottom: 10,
  },
  rentLabel: {
    color: "#C47A10",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  rentValue: {
    fontSize: 20,
    color: "#1F2940",
  },
  depositText: {
    color: "#7A869A",
    marginTop: 4,
    fontSize: 12,
  },
  dateGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  dateCell: {
    flex: 1,
    backgroundColor: "#F7F6F2",
    borderRadius: 10,
    padding: 10,
  },
  dateLabel: {
    color: "#7A869A",
    fontSize: 11,
    marginBottom: 4,
  },
  dateValue: {
    color: "#1F2940",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F7F6F2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  fileIcon: {
    fontSize: 14,
  },
  fileText: {
    color: "#5C6778",
    fontWeight: "600",
  },
  terms: {
    color: "#5C6778",
    lineHeight: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E8EF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    minWidth: 88,
    alignItems: "center",
  },
  actionBtnPrimary: {
    backgroundColor: "#E68A2E",
    borderColor: "#E68A2E",
  },
  actionBtnDanger: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F5D0D0",
  },
  actionBtnDisabled: {
    opacity: 0.65,
  },
  actionBtnText: {
    color: "#1F2940",
    fontSize: 12,
  },
  actionBtnTextPrimary: {
    color: "#FFFFFF",
  },
  actionBtnTextDanger: {
    color: "#D14343",
  },
});
