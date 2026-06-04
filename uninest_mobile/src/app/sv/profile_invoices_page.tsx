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
import { getApiErrorMessage } from "@/lib/api-error";
import type { Invoice } from "@/types/invoice";
import { formatPrice } from "@/utils/room-display";
import {
  formatBillingMonth,
  formatInvoiceDate,
  getLandlordName,
  getRoomTitleFromInvoice,
  invoiceStatusLabel,
  invoiceStatusStyle,
  isInvoiceUnpaid,
  sumUnpaidAmount,
} from "@/utils/invoice-display";

type FilterKey = "all" | "unpaid" | "paid";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unpaid", label: "Chưa thanh toán" },
  { key: "paid", label: "Đã thanh toán" },
];

function matchesFilter(invoice: Invoice, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "paid") return invoice.status === "PAID";
  return isInvoiceUnpaid(invoice.status);
}

export default function ProfileInvoicesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const loadInvoices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.listTenant({ page: 1, limit: 100 });
      setInvoices(
        (res.data ?? []).map((inv) => ({
          ...inv,
          _id: String(inv._id),
        })),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh sách hóa đơn."));
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvoices();
    }, [loadInvoices]),
  );

  const filtered = useMemo(
    () => invoices.filter((inv) => matchesFilter(inv, filter)),
    [invoices, filter],
  );

  const unpaidTotal = useMemo(() => sumUnpaidAmount(invoices), [invoices]);
  const paidCount = useMemo(
    () => invoices.filter((inv) => inv.status === "PAID").length,
    [invoices],
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hóa đơn
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadInvoices(true)}
              tintColor="#F28C1B"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32 + insets.bottom,
          }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {formatPrice(unpaidTotal)}
              </Text>
              <Text style={styles.summaryLabel}>CẦN THANH TOÁN</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, styles.summaryValueMuted]}>
                {paidCount}
              </Text>
              <Text style={styles.summaryLabel}>ĐÃ THANH TOÁN</Text>
            </View>
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

          {loading && !refreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F28C1B" />
              <ThemedText type="small" style={styles.hintText}>
                Đang tải hóa đơn...
              </ThemedText>
            </View>
          ) : null}

          {!loading && error ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable
                style={styles.retryButton}
                onPress={() => void loadInvoices()}
              >
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                {invoices.length === 0
                  ? "Chưa có hóa đơn"
                  : "Không có hóa đơn trong mục này"}
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                {invoices.length === 0
                  ? "Hóa đơn sẽ hiển thị khi chủ nhà gửi cho bạn sau khi thuê phòng."
                  : "Thử chọn bộ lọc khác."}
              </ThemedText>
            </View>
          ) : null}

          {!loading && !error
            ? filtered.map((invoice) => (
                <InvoiceCard
                  key={invoice._id}
                  invoice={invoice}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/profile_invoice_detail_page",
                      params: { id: invoice._id },
                    } as any)
                  }
                />
              ))
            : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function InvoiceCard({
  invoice,
  onPress,
}: {
  invoice: Invoice;
  onPress: () => void;
}) {
  const statusStyle = invoiceStatusStyle(invoice.status);
  const roomTitle = getRoomTitleFromInvoice(invoice);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleBlock}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {formatBillingMonth(invoice.billingMonth)}
          </ThemedText>
          <ThemedText type="small" style={styles.cardSubtitle} numberOfLines={1}>
            {roomTitle ?? `Chủ nhà: ${getLandlordName(invoice)}`}
          </ThemedText>
        </View>
        <View style={[styles.statusPill, statusStyle.pill]}>
          <Text style={[styles.statusText, statusStyle.text]}>
            {invoiceStatusLabel(invoice.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardMetaRow}>
        <MetaItem label="Hạn TT" value={formatInvoiceDate(invoice.dueDate)} />
        {invoice.paidAt ? (
          <MetaItem
            label="Đã TT"
            value={formatInvoiceDate(invoice.paidAt)}
          />
        ) : null}
      </View>

      <View style={styles.cardAmountRow}>
        <View>
          <Text style={styles.amountLabel}>Tổng tiền</Text>
          <Text style={styles.amountValue}>
            {formatPrice(invoice.totalAmount)}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(63,47,34,0.08)",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: "#3D3428" },
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F28C1B",
  },
  summaryValueMuted: {
    color: "#2F261A",
    fontSize: 24,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#8A7B68",
    letterSpacing: 0.3,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  filterChipActive: {
    backgroundColor: "#FFF8F0",
    borderColor: "#F28C1B",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A7B68",
  },
  filterTextActive: {
    color: "#F28C1B",
    fontWeight: "700",
  },
  centerBox: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  hintText: { color: "#8A7B68" },
  errorText: { color: "#D14343", textAlign: "center" },
  retryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#FFFFFF" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: "#2F261A", fontSize: 16, marginBottom: 6 },
  emptyText: { color: "#8A7B68", textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitleBlock: { flex: 1, minWidth: 0 },
  cardTitle: { color: "#2F261A", fontSize: 17 },
  cardSubtitle: { color: "#8A7B68", marginTop: 4 },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  cardMetaRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE4",
  },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 11, color: "#9A8C7D", fontWeight: "600" },
  metaValue: { fontSize: 13, color: "#3D3428", fontWeight: "600" },
  cardAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  amountLabel: { fontSize: 12, color: "#8A7B68" },
  amountValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F28C1B",
    marginTop: 2,
  },
  chevron: {
    fontSize: 28,
    color: "#D8CEC0",
    lineHeight: 30,
  },
});
