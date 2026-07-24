import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
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
  canTenantConfirmTransfer,
  formatBillingMonth,
  formatInvoiceDate,
  getBookingRoomId,
  getLandlordName,
  invoicePaymentStatusLabel,
  invoicePaymentStatusStyle,
  invoiceStatusLabel,
  invoiceStatusStyle,
  isInvoiceUnpaid,
} from "@/utils/invoice-display";

function LineRow({
  label,
  value,
  bold,
  copyable,
}: {
  label: string;
  value: string;
  bold?: boolean;
  copyable?: boolean;
}) {
  const handleCopy = async () => {
    try {
      await Share.share({ message: value });
    } catch {
      Alert.alert(label, value);
    }
  };

  return (
    <View style={styles.lineRow}>
      <ThemedText type="small" style={styles.lineLabel}>
        {label}
      </ThemedText>
      <Pressable
        style={styles.lineValueWrap}
        onPress={copyable ? () => void handleCopy() : undefined}
        disabled={!copyable}
      >
        <ThemedText
          type="smallBold"
          style={[styles.lineValue, bold && styles.lineValueBold]}
        >
          {value}
        </ThemedText>
        {copyable ? (
          <ThemedText type="small" style={styles.copyHint}>
            Chia sẻ
          </ThemedText>
        ) : null}
      </Pressable>
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
  const params = useLocalSearchParams<{ id: string }>();
  const invoiceId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [roomTitle, setRoomTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
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

  const handleConfirmTransfer = async () => {
    if (!invoice || !canTenantConfirmTransfer(invoice)) return;

    setConfirming(true);
    try {
      await invoiceApi.markPendingConfirmation(invoice._id);
      await load();
      Alert.alert(
        "Đã gửi xác nhận",
        "Chủ trọ sẽ kiểm tra và xác nhận thanh toán.",
      );
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không gửi được xác nhận."));
    } finally {
      setConfirming(false);
    }
  };

  const statusStyle = invoice
    ? invoiceStatusStyle(invoice.status)
    : invoiceStatusStyle("DRAFT");
  const paymentStyle = invoice
    ? invoicePaymentStatusStyle(invoice.paymentStatus)
    : invoicePaymentStatusStyle("unpaid");
  const showPaymentInfo =
    invoice &&
    (invoice.status === "SENT" || invoice.status === "OVERDUE") &&
    invoice.paymentBankName;

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
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
                paddingBottom:
                  canTenantConfirmTransfer(invoice) ||
                  invoice.paymentStatus === "pending_confirmation"
                    ? 100 + insets.bottom
                    : 32 + insets.bottom,
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
                  <View style={styles.badgeColumn}>
                    <View style={[styles.statusPill, statusStyle.pill]}>
                      <Text style={[styles.statusText, statusStyle.text]}>
                        {invoiceStatusLabel(invoice.status)}
                      </Text>
                    </View>
                    {invoice.paymentStatus ? (
                      <View style={[styles.statusPill, paymentStyle.pill]}>
                        <Text style={[styles.statusText, paymentStyle.text]}>
                          {invoicePaymentStatusLabel(invoice.paymentStatus)}
                        </Text>
                      </View>
                    ) : null}
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

              {showPaymentInfo ? (
                <Section title="Thông tin thanh toán">
                  <ThemedText type="small" style={styles.paymentHint}>
                    Vui lòng chuyển khoản trực tiếp cho chủ trọ theo thông tin
                    dưới đây. Hệ thống không xử lý giao dịch thanh toán hóa đơn.
                  </ThemedText>
                  <LineRow label="Ngân hàng" value={invoice.paymentBankName!} />
                  <LineRow
                    label="Số tài khoản"
                    value={invoice.paymentAccountNumber ?? "—"}
                    copyable
                  />
                  <LineRow
                    label="Chủ tài khoản"
                    value={invoice.paymentAccountHolder ?? "—"}
                  />
                  {invoice.paymentNote ? (
                    <LineRow
                      label="Nội dung chuyển khoản"
                      value={invoice.paymentNote}
                      copyable
                      bold
                    />
                  ) : null}
                  {invoice.paymentQrUrl ? (
                    <View style={styles.qrWrap}>
                      <ThemedText type="small" style={styles.qrLabel}>
                        Quét mã QR để chuyển khoản
                      </ThemedText>
                      <Image
                        source={{ uri: invoice.paymentQrUrl }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : null}
                </Section>
              ) : isInvoiceUnpaid(invoice.status) ? (
                <View style={styles.payHintCard}>
                  <Text style={styles.payHintIcon}>🏦</Text>
                  <ThemedText type="small" style={styles.payHintText}>
                    Chưa có thông tin chuyển khoản trên hóa đơn. Vui lòng liên
                    hệ chủ trọ.
                  </ThemedText>
                </View>
              ) : null}

              {invoice.status === "PAID" ? (
                <View style={styles.paidCard}>
                  <Text style={styles.paidIcon}>✓</Text>
                  <View style={styles.paidTextWrap}>
                    <ThemedText type="smallBold" style={styles.paidTitle}>
                      Đã thanh toán
                    </ThemedText>
                    <ThemedText type="small" style={styles.paidText}>
                      Hóa đơn đã được xác nhận
                      {invoice.paidAt
                        ? ` vào ${formatInvoiceDate(invoice.paidAt)}`
                        : ""}
                      .
                    </ThemedText>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {canTenantConfirmTransfer(invoice) ? (
              <View
                style={[
                  styles.payFooter,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <Pressable
                  style={[
                    styles.confirmButton,
                    confirming && styles.confirmButtonDisabled,
                  ]}
                  disabled={confirming}
                  onPress={() => void handleConfirmTransfer()}
                >
                  {confirming ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText type="smallBold" style={styles.confirmButtonText}>
                      Tôi đã chuyển khoản
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            ) : invoice.paymentStatus === "pending_confirmation" ? (
              <View
                style={[
                  styles.pendingFooter,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <ThemedText type="smallBold" style={styles.pendingFooterText}>
                  Đã gửi xác nhận, chờ chủ trọ kiểm tra
                </ThemedText>
              </View>
            ) : null}
          </>
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
  badgeColumn: { gap: 6, alignItems: "flex-end" },
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
    alignItems: "flex-start",
    gap: 12,
  },
  lineLabel: { color: "#8A7B68", flex: 1 },
  lineValueWrap: { alignItems: "flex-end", maxWidth: "62%" },
  lineValue: { color: "#2F261A", textAlign: "right" },
  lineValueBold: { color: "#F28C1B", fontSize: 16 },
  copyHint: { color: "#E68A2E", marginTop: 2, fontSize: 11 },
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
  paymentHint: { color: "#7A6B58", lineHeight: 20, marginBottom: 4 },
  qrWrap: { alignItems: "center", gap: 8, marginTop: 8 },
  qrLabel: { color: "#8A7B68" },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
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
  paidCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#E2F5E8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B8E6C8",
    padding: 14,
    alignItems: "flex-start",
  },
  paidIcon: { fontSize: 20, color: "#2E8B57" },
  paidTextWrap: { flex: 1, gap: 4 },
  paidTitle: { color: "#2E8B57" },
  paidText: { color: "#3D7A55", lineHeight: 20 },
  payFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#F5EFE6",
    borderTopWidth: 1,
    borderTopColor: "rgba(63,47,34,0.08)",
  },
  confirmButton: {
    backgroundColor: "#1F2940",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { color: "#FFFFFF", fontSize: 16 },
  pendingFooter: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    paddingVertical: 14,
    backgroundColor: "#E8F0FF",
    borderRadius: 12,
    alignItems: "center",
  },
  pendingFooterText: { color: "#4B6CB7" },
});
