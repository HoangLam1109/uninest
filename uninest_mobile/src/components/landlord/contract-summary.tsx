import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Contract, ContractStatus } from "@/types/contract";

type ContractSummaryProps = {
  contracts: Contract[];
  total?: number;
};

const defaultSummary: Record<ContractStatus, number> = {
  DRAFT: 0,
  PENDING_TENANT_SIGNATURE: 0,
  ACTIVE: 0,
  EXPIRED: 0,
  TERMINATED: 0,
};

const SUMMARY_ITEMS = [
  { key: "total", label: "Tổng hợp đồng", icon: "📄", color: "#1F2940" },
  { key: "ACTIVE", label: "Đang hiệu lực", icon: "✓", color: "#2E8B57" },
  {
    key: "PENDING_TENANT_SIGNATURE",
    label: "Chờ người thuê ký",
    icon: "✍",
    color: "#2563EB",
  },
  { key: "DRAFT", label: "Bản nháp", icon: "⏱", color: "#C47A10" },
  { key: "ended", label: "Đã kết thúc", icon: "✕", color: "#D14343" },
] as const;

export function ContractSummary({ contracts, total }: ContractSummaryProps) {
  const summary = contracts.reduce(
    (acc, contract) => {
      acc[contract.status] += 1;
      return acc;
    },
    { ...defaultSummary },
  );

  const values: Record<string, number> = {
    total: total ?? contracts.length,
    ACTIVE: summary.ACTIVE,
    PENDING_TENANT_SIGNATURE: summary.PENDING_TENANT_SIGNATURE,
    DRAFT: summary.DRAFT,
    ended: summary.EXPIRED + summary.TERMINATED,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SUMMARY_ITEMS.map((item) => (
        <View key={item.key} style={styles.card}>
          <View style={styles.cardTop}>
            <ThemedText type="small" style={styles.cardLabel}>
              {item.label.toUpperCase()}
            </ThemedText>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
          </View>
          <Text style={[styles.value, { color: item.color }]}>
            {values[item.key]}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    width: 148,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardLabel: {
    flex: 1,
    color: "#7A869A",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 14,
    color: "#E68A2E",
  },
  value: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "800",
  },
});
