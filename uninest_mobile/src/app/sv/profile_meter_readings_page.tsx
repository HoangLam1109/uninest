import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

import { invoiceApi } from "@/api/invoice.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { MeterReading, MeterType } from "@/types/meter";
import {
  formatBillingMonth,
  formatReadingDate,
  meterTypeLabel,
  meterUnit,
  readingSourceLabel,
} from "@/utils/meter-display";

type FilterKey = "ALL" | MeterType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "ELECTRICITY", label: "Điện" },
  { key: "WATER", label: "Nước" },
];

function groupByMonth(readings: MeterReading[]) {
  const map = new Map<
    string,
    { billingMonth: string; electricity?: MeterReading; water?: MeterReading }
  >();

  for (const reading of readings) {
    const key = reading.billingMonth;
    const entry = map.get(key) ?? { billingMonth: key };
    if (reading.meterType === "ELECTRICITY") entry.electricity = reading;
    if (reading.meterType === "WATER") entry.water = reading;
    map.set(key, entry);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.billingMonth).getTime() - new Date(a.billingMonth).getTime(),
  );
}

export default function ProfileMeterReadingsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const loadReadings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await invoiceApi.getMyMeterReadings({
        page: 1,
        limit: 100,
        meterType: filter === "ALL" ? undefined : filter,
      });
      setReadings(res.data ?? []);
    } catch {
      setReadings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void loadReadings();
    }, [loadReadings]),
  );

  const grouped = useMemo(() => groupByMonth(readings), [readings]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chỉ số điện nước
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => (
            <Pressable
              key={item.key}
              style={[
                styles.filterChip,
                filter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadReadings(true)}
              tintColor="#F28C1B"
            />
          }
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : grouped.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chỉ số sẽ hiển thị khi chủ nhà tạo hóa đơn đầu tiên.
              </ThemedText>
            </View>
          ) : (
            grouped.map((entry) => (
              <View key={entry.billingMonth} style={styles.card}>
                <ThemedText type="smallBold" style={styles.monthTitle}>
                  {formatBillingMonth(entry.billingMonth)}
                </ThemedText>
                {entry.electricity ? (
                  <ReadingRow reading={entry.electricity} />
                ) : null}
                {entry.water ? <ReadingRow reading={entry.water} /> : null}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ReadingRow({ reading }: { reading: MeterReading }) {
  return (
    <View style={styles.readingRow}>
      <View style={styles.readingLeft}>
        <ThemedText type="smallBold" style={styles.readingType}>
          {meterTypeLabel(reading.meterType)}
        </ThemedText>
        <ThemedText type="small" style={styles.readingMeta}>
          {readingSourceLabel(reading.source)} •{" "}
          {formatReadingDate(reading.readingDate)}
        </ThemedText>
      </View>
      <View style={styles.readingRight}>
        <ThemedText type="smallBold" style={styles.readingValue}>
          {reading.readingValue} {meterUnit(reading.meterType)}
        </ThemedText>
        {reading.invoiceId ? (
          <Text style={styles.invoiceBadge}>Đã lập HĐ</Text>
        ) : null}
      </View>
    </View>
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
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  filterChipActive: { backgroundColor: "#F28C1B", borderColor: "#F28C1B" },
  filterText: { color: "#6B5C4E", fontWeight: "600", fontSize: 13 },
  filterTextActive: { color: "#FFFFFF" },
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
    gap: 10,
  },
  monthTitle: { color: "#2F261A", fontSize: 16 },
  readingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
  },
  readingLeft: { flex: 1, gap: 2 },
  readingType: { color: "#3F2F22" },
  readingMeta: { color: "#8A7B68" },
  readingRight: { alignItems: "flex-end", gap: 4 },
  readingValue: { color: "#2F261A" },
  invoiceBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E8B57",
    backgroundColor: "#E8F5EC",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
});
