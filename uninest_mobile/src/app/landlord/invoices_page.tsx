import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { bookingApi } from "@/api/booking.api";
import { invoiceApi } from "@/api/invoice.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking } from "@/types/booking";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import {
  getBookingRoom,
  getBookingTenant,
} from "@/utils/booking-display";
import {
  formatBillingMonth,
  formatInvoiceDate,
  getRoomTitleFromInvoice,
  getTenantName,
  invoiceStatusLabel,
  invoiceStatusStyle,
  sumPaidAmount,
  sumUnpaidAmount,
} from "@/utils/invoice-display";
import { formatPrice } from "@/utils/room-display";

type StatusFilter = "ALL" | InvoiceStatus | "UNPAID";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "DRAFT", label: "Nháp" },
  { id: "UNPAID", label: "Chờ thu" },
  { id: "PAID", label: "Đã thu" },
  { id: "OVERDUE", label: "Quá hạn" },
];

type CreateForm = {
  bookingId: string;
  billingMonth: string;
  dueDate: string;
  rentAmount: string;
  electricityAmount: string;
  waterAmount: string;
  additionalFees: string;
  notes: string;
};

function currentBillingMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

function parseAmount(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function matchesFilter(invoice: Invoice, filter: StatusFilter) {
  if (filter === "ALL") return true;
  if (filter === "UNPAID") {
    return invoice.status === "SENT" || invoice.status === "OVERDUE";
  }
  return invoice.status === filter;
}

function emptyCreateForm(): CreateForm {
  return {
    bookingId: "",
    billingMonth: currentBillingMonth(),
    dueDate: defaultDueDate(),
    rentAmount: "",
    electricityAmount: "",
    waterAmount: "",
    additionalFees: "",
    notes: "",
  };
}

function validateCreateForm(form: CreateForm): string | null {
  if (!form.bookingId) return "Vui lòng chọn đơn đặt phòng.";
  if (!/^\d{4}-\d{2}$/.test(form.billingMonth.trim())) {
    return "Kỳ hóa đơn phải theo định dạng YYYY-MM.";
  }
  if (!form.dueDate.trim()) return "Vui lòng nhập hạn thanh toán.";
  const rent = parseAmount(form.rentAmount);
  if (rent == null || rent <= 0) return "Tiền thuê phải lớn hơn 0.";
  return null;
}

export default function LandlordInvoicesPage() {
  const insets = useSafeAreaInsets();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [actionInvoiceId, setActionInvoiceId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyCreateForm);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const loadInvoices = useCallback(async () => {
    const res = await invoiceApi.listLandlord({ page: 1, limit: 100 });
    setInvoices(res.data ?? []);
  }, []);

  const loadData = useCallback(async () => {
    try {
      await loadInvoices();
    } catch (err) {
      Alert.alert(
        "Không tải được hóa đơn",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setInvoices([]);
    }
  }, [loadInvoices]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  const filtered = useMemo(
    () => invoices.filter((inv) => matchesFilter(inv, statusFilter)),
    [invoices, statusFilter],
  );

  const summary = useMemo(() => {
    return {
      total: invoices.length,
      paidAmount: sumPaidAmount(invoices),
      unpaidAmount: sumUnpaidAmount(invoices),
      draftCount: invoices.filter((inv) => inv.status === "DRAFT").length,
    };
  }, [invoices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateForm = async () => {
    setForm(emptyCreateForm());
    setFormOpen(true);
    setLoadingBookings(true);
    try {
      const res = await bookingApi.listLandlord({
        page: 1,
        limit: 100,
        status: "APPROVED",
      });
      setApprovedBookings(res.data ?? []);
    } catch {
      setApprovedBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const closeCreateForm = () => {
    setFormOpen(false);
    setForm(emptyCreateForm());
  };

  const handleCreate = async () => {
    const error = validateCreateForm(form);
    if (error) {
      Alert.alert("Không thể tạo hóa đơn", error);
      return;
    }

    setIsSubmitting(true);
    try {
      await invoiceApi.create({
        bookingId: form.bookingId,
        billingMonth: form.billingMonth.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        rentAmount: parseAmount(form.rentAmount) ?? 0,
        electricityAmount: parseAmount(form.electricityAmount),
        waterAmount: parseAmount(form.waterAmount),
        additionalFees: parseAmount(form.additionalFees),
        notes: form.notes.trim() || undefined,
      });
      closeCreateForm();
      await loadInvoices();
      Alert.alert("Thành công", "Đã tạo hóa đơn nháp.");
    } catch (err) {
      Alert.alert(
        "Tạo hóa đơn thất bại",
        getApiErrorMessage(err, "Không thể tạo hóa đơn."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const runInvoiceAction = async (
    invoice: Invoice,
    action: "send" | "markPaid" | "delete",
    successMessage: string,
  ) => {
    setActionInvoiceId(invoice._id);
    try {
      if (action === "send") await invoiceApi.send(invoice._id);
      if (action === "markPaid") await invoiceApi.markPaid(invoice._id);
      if (action === "delete") await invoiceApi.delete(invoice._id);
      await loadInvoices();
      Alert.alert("Thành công", successMessage);
    } catch (err) {
      Alert.alert(
        "Thao tác thất bại",
        getApiErrorMessage(err, "Không thể cập nhật hóa đơn."),
      );
    } finally {
      setActionInvoiceId(null);
    }
  };

  const handleSend = (invoice: Invoice) => {
    Alert.alert("Gửi hóa đơn", "Gửi hóa đơn cho người thuê thanh toán?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gửi",
        onPress: () =>
          void runInvoiceAction(invoice, "send", "Đã gửi hóa đơn."),
      },
    ]);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    Alert.alert(
      "Xác nhận thanh toán",
      `Đánh dấu hóa đơn ${formatBillingMonth(invoice.billingMonth)} đã thanh toán?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () =>
            void runInvoiceAction(
              invoice,
              "markPaid",
              "Đã đánh dấu thanh toán.",
            ),
        },
      ],
    );
  };

  const handleDelete = (invoice: Invoice) => {
    Alert.alert("Xóa hóa đơn", "Chỉ xóa được hóa đơn ở trạng thái nháp.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () =>
          void runInvoiceAction(invoice, "delete", "Đã xóa hóa đơn."),
      },
    ]);
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
                Báo cáo hóa đơn
              </ThemedText>
              <ThemedText type="small" style={styles.pageSubtitle}>
                Tạo, gửi và theo dõi thanh toán từ người thuê
              </ThemedText>
            </View>
            <Pressable style={styles.addButton} onPress={() => void openCreateForm()}>
              <Text style={styles.addButtonIcon}>+</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Tổng HĐ" value={String(summary.total)} />
            <StatCard
              label="Đã thu"
              value={formatPrice(summary.paidAmount)}
              accent="#2E8B57"
              compact
            />
            <StatCard
              label="Chờ thu"
              value={formatPrice(summary.unpaidAmount)}
              accent="#C47A10"
              compact
            />
            <StatCard
              label="Nháp"
              value={String(summary.draftCount)}
              accent="#4B6CB7"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {STATUS_FILTERS.map((item) => {
              const active = statusFilter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setStatusFilter(item.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                {invoices.length === 0
                  ? "Chưa có hóa đơn"
                  : "Không có hóa đơn trong mục này"}
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                {invoices.length === 0
                  ? "Tạo hóa đơn từ đơn đặt phòng đã được duyệt."
                  : "Thử chọn bộ lọc khác."}
              </ThemedText>
              {invoices.length === 0 ? (
                <Pressable
                  style={styles.emptyButton}
                  onPress={() => void openCreateForm()}
                >
                  <ThemedText type="smallBold" style={styles.emptyButtonText}>
                    Tạo hóa đơn
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          ) : (
            filtered.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                invoice={invoice}
                busy={actionInvoiceId === invoice._id}
                onSend={() => handleSend(invoice)}
                onMarkPaid={() => handleMarkPaid(invoice)}
                onDelete={() => handleDelete(invoice)}
              />
            ))
          )}
        </ScrollView>

        <CreateInvoiceModal
          visible={formOpen}
          form={form}
          bookings={approvedBookings}
          loadingBookings={loadingBookings}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onClose={closeCreateForm}
          onSubmit={() => void handleCreate()}
        />

        <LandlordBottomNavigation activeTab="reports" />
      </SafeAreaView>
    </View>
  );
}

function StatCard({
  label,
  value,
  accent = "#1F2940",
  compact = false,
}: {
  label: string;
  value: string;
  accent?: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
      <Text
        style={[
          styles.statValue,
          compact && styles.statValueCompact,
          { color: accent },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

function InvoiceCard({
  invoice,
  busy,
  onSend,
  onMarkPaid,
  onDelete,
}: {
  invoice: Invoice;
  busy: boolean;
  onSend: () => void;
  onMarkPaid: () => void;
  onDelete: () => void;
}) {
  const statusStyle = invoiceStatusStyle(invoice.status);
  const roomTitle = getRoomTitleFromInvoice(invoice);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardMain}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {formatBillingMonth(invoice.billingMonth)}
          </ThemedText>
          <ThemedText type="small" style={styles.cardMeta}>
            {getTenantName(invoice)}
            {roomTitle ? ` • ${roomTitle}` : ""}
          </ThemedText>
        </View>
        <View style={[styles.statusPill, statusStyle.pill]}>
          <Text style={[styles.statusText, statusStyle.text]}>
            {invoiceStatusLabel(invoice.status)}
          </Text>
        </View>
      </View>

      <View style={styles.amountBox}>
        <AmountRow label="Tiền thuê" value={formatPrice(invoice.rentAmount)} />
        {invoice.electricityAmount ? (
          <AmountRow
            label="Điện"
            value={formatPrice(invoice.electricityAmount)}
          />
        ) : null}
        {invoice.waterAmount ? (
          <AmountRow label="Nước" value={formatPrice(invoice.waterAmount)} />
        ) : null}
        {invoice.additionalFees ? (
          <AmountRow
            label="Phí khác"
            value={formatPrice(invoice.additionalFees)}
          />
        ) : null}
        <View style={styles.totalRow}>
          <ThemedText type="smallBold" style={styles.totalLabel}>
            Tổng cộng
          </ThemedText>
          <ThemedText type="smallBold" style={styles.totalValue}>
            {formatPrice(invoice.totalAmount)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <MetaItem label="Hạn TT" value={formatInvoiceDate(invoice.dueDate)} />
        {invoice.paidAt ? (
          <MetaItem label="Đã TT" value={formatInvoiceDate(invoice.paidAt)} />
        ) : null}
      </View>

      {invoice.notes ? (
        <ThemedText type="small" style={styles.notes}>
          Ghi chú: {invoice.notes}
        </ThemedText>
      ) : null}

      {invoice.status === "DRAFT" ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={onDelete}
            disabled={busy}
          >
            <ThemedText type="smallBold" style={styles.actionBtnDangerText}>
              Xóa
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={onSend}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnPrimaryText}>
                Gửi hóa đơn
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}

      {invoice.status === "SENT" || invoice.status === "OVERDUE" ? (
        <Pressable
          style={[styles.actionBtn, styles.actionBtnPrimary, styles.actionBtnFull]}
          onPress={onMarkPaid}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText type="smallBold" style={styles.actionBtnPrimaryText}>
              Đánh dấu đã thanh toán
            </ThemedText>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.amountRow}>
      <ThemedText type="small" style={styles.amountLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.amountValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <ThemedText type="small" style={styles.metaLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.metaValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function CreateInvoiceModal({
  visible,
  form,
  bookings,
  loadingBookings,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  form: CreateForm;
  bookings: Booking[];
  loadingBookings: boolean;
  isSubmitting: boolean;
  onChange: (next: CreateForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const insets = useSafeAreaInsets();

  const setField = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.modalKeyboard}
        >
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" style={styles.modalTitle}>
                Tạo hóa đơn
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Field label="Đơn đặt phòng" required>
                {loadingBookings ? (
                  <ActivityIndicator color="#E68A2E" style={{ marginVertical: 12 }} />
                ) : bookings.length === 0 ? (
                  <ThemedText type="small" style={styles.hintText}>
                    Chưa có đơn đặt phòng đã duyệt để tạo hóa đơn.
                  </ThemedText>
                ) : (
                  <View style={styles.bookingList}>
                    {bookings.map((booking) => {
                      const active = form.bookingId === booking._id;
                      const tenant = getBookingTenant(booking);
                      const room = getBookingRoom(booking);
                      return (
                        <Pressable
                          key={booking._id}
                          onPress={() => setField("bookingId", booking._id)}
                          style={[
                            styles.bookingItem,
                            active && styles.bookingItemActive,
                          ]}
                        >
                          <ThemedText type="smallBold" style={styles.bookingTitle}>
                            {tenant?.fullName ?? "Người thuê"}
                          </ThemedText>
                          <ThemedText type="small" style={styles.bookingMeta}>
                            {room?.title ?? "Phòng"}
                            {room?.pricePerMonth
                              ? ` • ${formatPrice(room.pricePerMonth)}/tháng`
                              : ""}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Field>

              <Field label="Kỳ hóa đơn (YYYY-MM)" required>
                <TextInput
                  value={form.billingMonth}
                  onChangeText={(v) => setField("billingMonth", v)}
                  placeholder="2026-06"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                />
              </Field>

              <Field label="Hạn thanh toán" required>
                <TextInput
                  value={form.dueDate}
                  onChangeText={(v) => setField("dueDate", v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                />
              </Field>

              <Field label="Tiền thuê" required>
                <TextInput
                  value={form.rentAmount}
                  onChangeText={(v) => setField("rentAmount", v)}
                  placeholder="3500000"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </Field>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Field label="Tiền điện">
                    <TextInput
                      value={form.electricityAmount}
                      onChangeText={(v) => setField("electricityAmount", v)}
                      placeholder="0"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
                <View style={styles.formCol}>
                  <Field label="Tiền nước">
                    <TextInput
                      value={form.waterAmount}
                      onChangeText={(v) => setField("waterAmount", v)}
                      placeholder="0"
                      placeholderTextColor="#9AA3B2"
                      style={styles.input}
                      keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              <Field label="Phí khác">
                <TextInput
                  value={form.additionalFees}
                  onChangeText={(v) => setField("additionalFees", v)}
                  placeholder="0"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </Field>

              <Field label="Ghi chú">
                <TextInput
                  value={form.notes}
                  onChangeText={(v) => setField("notes", v)}
                  placeholder="Ghi chú cho người thuê..."
                  placeholderTextColor="#9AA3B2"
                  style={[styles.input, styles.textArea]}
                  multiline
                  textAlignVertical="top"
                />
              </Field>

              <Pressable
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={onSubmit}
                disabled={isSubmitting || bookings.length === 0}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.submitButtonText}>
                    Tạo hóa đơn nháp
                  </ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
        {required ? " *" : ""}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    color: "#1F2940",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#7A869A",
    lineHeight: 18,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E68A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "300",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  statLabel: {
    color: "#7A869A",
    fontSize: 10,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statValueCompact: {
    fontSize: 13,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  filterChipActive: {
    backgroundColor: "#FFF0DF",
    borderColor: "#E68A2E",
  },
  filterChipText: {
    color: "#7A869A",
  },
  filterChipTextActive: {
    color: "#C47A10",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    color: "#1F2940",
    marginBottom: 8,
  },
  emptyText: {
    color: "#7A869A",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    color: "#1F2940",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#7A869A",
    lineHeight: 18,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  amountBox: {
    backgroundColor: "#FAFAF8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: "#9AA3B2",
  },
  amountValue: {
    color: "#4B5568",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECE7DF",
  },
  totalLabel: {
    color: "#1F2940",
  },
  totalValue: {
    color: "#E68A2E",
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    color: "#9AA3B2",
    fontSize: 11,
  },
  metaValue: {
    color: "#1F2940",
    fontSize: 13,
  },
  notes: {
    color: "#7A869A",
    lineHeight: 18,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionBtnFull: {
    marginTop: 4,
  },
  actionBtnPrimary: {
    backgroundColor: "#E68A2E",
    borderColor: "#E68A2E",
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
  },
  actionBtnDanger: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F5D0D0",
  },
  actionBtnDangerText: {
    color: "#D14343",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(31, 41, 64, 0.45)",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    maxHeight: "92%",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: "#1F2940",
  },
  modalClose: {
    fontSize: 20,
    color: "#7A869A",
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#1F2940",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 15,
    color: "#1F2940",
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
    paddingBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  formCol: {
    flex: 1,
  },
  bookingList: {
    gap: 8,
  },
  bookingItem: {
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAFAF8",
  },
  bookingItemActive: {
    borderColor: "#E68A2E",
    backgroundColor: "#FFF8F0",
  },
  bookingTitle: {
    color: "#1F2940",
    marginBottom: 4,
  },
  bookingMeta: {
    color: "#7A869A",
  },
  hintText: {
    color: "#7A869A",
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
