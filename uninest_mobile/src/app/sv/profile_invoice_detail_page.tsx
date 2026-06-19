import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
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

import { invoiceApi } from "@/api/invoice.api";
import { roomApi } from "@/api/room.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Invoice, InvoiceDetail } from "@/types/invoice";
import { formatPrice } from "@/utils/room-display";
import {
  formatBillingMonth,
  formatInvoiceDate,
  getBookingRoomId,
  getLandlordName,
  invoiceStatusLabel,
  invoiceStatusStyle,
} from "@/utils/invoice-display";

function LineRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.lineRow}>
      <ThemedText type="small" style={styles.lineLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        style={[styles.lineValue, bold && styles.lineValueBold]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function amountOrDash(value?: number) {
  if (value === undefined || value === null) return "—";
  return formatPrice(value);
}

export default function ProfileInvoiceDetailPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [roomTitle, setRoomTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!invoiceId) {
      setError("Không tìm thấy mã hóa đơn.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [invoiceRes, detailRes] = await Promise.all([
        invoiceApi.getById(invoiceId),
        invoiceApi.getDetail(invoiceId).catch(() => ({
          success: true,
          data: null,
        })),
      ]);

      const inv = invoiceRes.data
        ? { ...invoiceRes.data, _id: String(invoiceRes.data._id) }
        : null;
      setInvoice(inv);
      setDetail(detailRes.data ?? null);

      const roomId = inv ? getBookingRoomId(inv) : null;
      if (roomId) {
        try {
          const roomRes = await roomApi.getById(roomId);
          if (roomRes.data?.title) setRoomTitle(roomRes.data.title);
        } catch {
          setRoomTitle(null);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được hóa đơn."));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusStyle = invoice
    ? invoiceStatusStyle(invoice.status)
    : invoiceStatusStyle("DRAFT");

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chi tiết hóa đơn
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#F28C1B" />
          </View>
        ) : error || !invoice ? (
          <View style={styles.centerBox}>
            <ThemedText type="small" style={styles.errorText}>
              {error ?? "Không tìm thấy hóa đơn."}
            </ThemedText>
            <Pressable style={styles.retryButton} onPress={() => void load()}>
              <ThemedText type="smallBold" style={styles.retryText}>
                Thử lại
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 32 + insets.bottom,
            }}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <ThemedText type="title" style={styles.heroTitle}>
                    {formatBillingMonth(invoice.billingMonth)}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroSubtitle}>
                    {roomTitle ?? "Phòng thuê"}
                  </ThemedText>
                </View>
                <View style={[styles.statusPill, statusStyle.pill]}>
                  <Text style={[styles.statusText, statusStyle.text]}>
                    {invoiceStatusLabel(invoice.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroAmount}>
                {formatPrice(invoice.totalAmount)}
              </Text>
              <ThemedText type="small" style={styles.heroDue}>
                Hạn thanh toán: {formatInvoiceDate(invoice.dueDate)}
              </ThemedText>
              {invoice.paidAt ? (
                <ThemedText type="small" style={styles.heroPaid}>
                  Đã thanh toán: {formatInvoiceDate(invoice.paidAt)}
                </ThemedText>
              ) : null}
            </View>

            <Section title="Thông tin">
              <LineRow label="Chủ nhà" value={getLandlordName(invoice)} />
              {invoice.sentAt ? (
                <LineRow
                  label="Ngày gửi"
                  value={formatInvoiceDate(invoice.sentAt)}
                />
              ) : null}
              <LineRow
                label="Ngày tạo"
                value={
                  invoice.createdAt
                    ? formatInvoiceDate(invoice.createdAt)
                    : "—"
                }
              />
            </Section>

            <Section title="Chi phí">
              <LineRow
                label="Tiền thuê"
                value={amountOrDash(invoice.rentAmount)}
              />
              <LineRow
                label="Tiền điện"
                value={amountOrDash(invoice.electricityAmount)}
              />
              <LineRow
                label="Tiền nước"
                value={amountOrDash(invoice.waterAmount)}
              />
              {(invoice.additionalFees ?? 0) > 0 ? (
                <LineRow
                  label="Phí khác"
                  value={amountOrDash(invoice.additionalFees)}
                />
              ) : null}
              <View style={styles.totalLine}>
                <ThemedText type="smallBold" style={styles.totalLabel}>
                  Tổng cộng
                </ThemedText>
                <ThemedText type="smallBold" style={styles.totalValue}>
                  {formatPrice(invoice.totalAmount)}
                </ThemedText>
              </View>
            </Section>

            {detail ? (
              <Section title="Chỉ số điện nước">
                {detail.electricityUsage != null ? (
                  <LineRow
                    label="Điện tiêu thụ"
                    value={`${detail.electricityUsage} kWh`}
                  />
                ) : null}
                {detail.electricityOldIndex != null &&
                detail.electricityNewIndex != null ? (
                  <LineRow
                    label="Chỉ số điện"
                    value={`${detail.electricityOldIndex} → ${detail.electricityNewIndex}`}
                  />
                ) : null}
                {detail.waterUsage != null ? (
                  <LineRow
                    label="Nước tiêu thụ"
                    value={`${detail.waterUsage} m³`}
                  />
                ) : null}
                {detail.waterOldIndex != null &&
                detail.waterNewIndex != null ? (
                  <LineRow
                    label="Chỉ số nước"
                    value={`${detail.waterOldIndex} → ${detail.waterNewIndex}`}
                  />
                ) : null}
              </Section>
            ) : null}

            {invoice.notes ? (
              <Section title="Ghi chú">
                <ThemedText type="small" style={styles.notes}>
                  {invoice.notes}
                </ThemedText>
              </Section>
            ) : null}

            {invoice.status === "SENT" || invoice.status === "OVERDUE" ? (
              <View style={styles.payHintCard}>
                <Text style={styles.payHintIcon}>💳</Text>
                <ThemedText type="small" style={styles.payHintText}>
                  Vui lòng thanh toán trước hạn. Liên hệ chủ nhà nếu cần xác
                  nhận đã chuyển khoản.
                </ThemedText>
              </View>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.sectionCard}>{children}</View>
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
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  errorText: { color: "#D14343", textAlign: "center" },
  retryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#FFFFFF" },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  heroTitle: { color: "#2F261A", fontSize: 22 },
  heroSubtitle: { color: "#8A7B68", marginTop: 4 },
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
  heroAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F28C1B",
    marginTop: 16,
  },
  heroDue: { color: "#8A7B68", marginTop: 8 },
  heroPaid: { color: "#2E8B57", marginTop: 4 },
  section: { marginBottom: 14 },
  sectionTitle: {
    color: "#2F261A",
    fontSize: 15,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    gap: 10,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  lineLabel: { color: "#8A7B68", flex: 1 },
  lineValue: { color: "#2F261A" },
  lineValueBold: { color: "#F28C1B", fontSize: 16 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE4",
  },
  totalLabel: { color: "#2F261A", fontSize: 15 },
  totalValue: { color: "#F28C1B", fontSize: 17 },
  notes: { color: "#5A4936", lineHeight: 20 },
  payHintCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF8EF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBCFA6",
    padding: 14,
    alignItems: "flex-start",
  },
  payHintIcon: { fontSize: 20 },
  payHintText: { flex: 1, color: "#7A6B58", lineHeight: 20 },
});
