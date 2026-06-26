import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { bookingApi } from "@/api/booking.api";
import { DatePickerField } from "@/components/date-picker-field";
import { ThemedText } from "@/components/themed-text";
import type { Booking } from "@/types/booking";
import type { Contract } from "@/types/contract";
import { getBookingRoom, getBookingTenant } from "@/utils/booking-display";
import { getExistingContractFileName } from "@/utils/contract-display";
import { formatPrice } from "@/utils/room-display";
import type { ContractPdfUpload } from "@/utils/contract-upload";
import { validateContractForm, type ContractFormMode } from "@/utils/validation/contract";

export type { ContractFormMode };

type ContractFormModalProps = {
  visible: boolean;
  mode: ContractFormMode;
  contract?: Contract | null;
  onClose: () => void;
  onSubmit: (payload: {
    bookingId?: string;
    monthlyRent: number;
    depositAmount?: number;
    terms?: string;
    contractFile?: ContractPdfUpload;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  if (!value.trim()) return undefined;
  return new Date(`${value.trim()}T00:00:00.000`).toISOString();
}

function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T00:00:00.000`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function ContractFormModal({
  visible,
  mode,
  contract,
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractFile, setContractFile] = useState<ContractPdfUpload | null>(null);
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (mode === "renew") {
      setStartDate("");
      setEndDate("");
      setMonthlyRent(String(contract?.monthlyRent ?? ""));
      setDepositAmount(String(contract?.depositAmount ?? ""));
      setContractFile(null);
      setTerms(contract?.terms ?? "");
      return;
    }

    setBookingId("");
    setMonthlyRent(String(contract?.monthlyRent ?? ""));
    setDepositAmount(String(contract?.depositAmount ?? ""));
    setStartDate(toDateInput(contract?.startDate));
    setEndDate(toDateInput(contract?.endDate));
    setContractFile(null);
    setTerms(contract?.terms ?? "");
  }, [visible, mode, contract]);

  useEffect(() => {
    if (!visible || mode !== "create") return;
    setLoadingBookings(true);
    void bookingApi
      .listLandlord({ page: 1, limit: 100, status: "APPROVED" })
      .then((res) => setBookings(res.data ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, [visible, mode]);

  const title = useMemo(() => {
    if (mode === "create") return "Tạo hợp đồng";
    if (mode === "renew") return "Gia hạn hợp đồng";
    return "Cập nhật hợp đồng";
  }, [mode]);

  const minStartDate = mode === "edit" ? undefined : startOfToday();
  const minEndDate = parseDateInput(startDate) ?? minStartDate;

  const hasExistingContractFile = Boolean(
    contract?.contractFileStorageKey ?? contract?.contractFileUrl,
  );
  const existingContractFileName = getExistingContractFileName(contract);

  const pickContractPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (asset.mimeType && asset.mimeType !== "application/pdf") {
      alert("Vui lòng chọn file PDF.");
      return;
    }

    setContractFile({
      uri: asset.uri,
      fileName: asset.name ?? "contract.pdf",
      mimeType: asset.mimeType ?? "application/pdf",
    });
  };

  const handleSubmit = async () => {
    const error = validateContractForm({
      mode,
      bookingId,
      monthlyRent,
      depositAmount,
      startDate,
      endDate,
      terms,
      hasExistingContractFile,
      contractFile,
    });
    if (error) {
      alert(error);
      return;
    }

    const rent = Number(monthlyRent);
    setSubmitting(true);
    try {
      await onSubmit({
        bookingId: mode === "create" ? bookingId : undefined,
        monthlyRent: rent,
        depositAmount: depositAmount ? Number(depositAmount) : undefined,
        terms: terms.trim() || undefined,
        contractFile: contractFile ?? undefined,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.iconText}>✕</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {title}
          </ThemedText>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.form}>
          {mode === "create" ? (
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.label}>
                Chọn đơn đã duyệt
              </ThemedText>
              {loadingBookings ? (
                <ActivityIndicator color="#E68A2E" />
              ) : bookings.length === 0 ? (
                <ThemedText type="small" style={styles.hint}>
                  Chưa có đơn đặt phòng đã duyệt.
                </ThemedText>
              ) : (
                bookings.map((booking) => {
                  const room = getBookingRoom(booking);
                  const tenant = getBookingTenant(booking);
                  const selected = bookingId === booking._id;
                  return (
                    <Pressable
                      key={booking._id}
                      style={[styles.bookingItem, selected && styles.bookingSelected]}
                      onPress={() => {
                        setBookingId(booking._id);
                        if (room?.pricePerMonth) {
                          setMonthlyRent(String(room.pricePerMonth));
                          setDepositAmount(String(room.pricePerMonth));
                        }
                        if (booking.checkInDate) {
                          setStartDate(toDateInput(booking.checkInDate));
                        }
                        if (booking.checkOutDate) {
                          setEndDate(toDateInput(booking.checkOutDate));
                        }
                      }}
                    >
                      <ThemedText type="smallBold" style={styles.bookingTitle}>
                        {tenant?.fullName ?? "Người thuê"} • {room?.title ?? "Phòng"}
                      </ThemedText>
                      <ThemedText type="small" style={styles.bookingMeta}>
                        {room?.pricePerMonth
                          ? `${formatPrice(room.pricePerMonth)}/tháng`
                          : "—"}
                      </ThemedText>
                    </Pressable>
                  );
                })
              )}
            </View>
          ) : null}

          <Field label="Giá thuê / tháng *" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />
          <Field label="Tiền cọc" value={depositAmount} onChangeText={setDepositAmount} keyboardType="numeric" />
          <DatePickerField
            label={mode === "renew" ? "Ngày bắt đầu *" : "Ngày bắt đầu"}
            value={startDate}
            onChange={setStartDate}
            placeholder="Chọn ngày bắt đầu"
            minimumDate={minStartDate}
          />
          <DatePickerField
            label="Ngày kết thúc"
            value={endDate}
            onChange={setEndDate}
            placeholder="Chọn ngày kết thúc"
            minimumDate={minEndDate}
          />
          <View style={styles.field}>
            <ThemedText type="smallBold" style={styles.label}>
              File hợp đồng (PDF)
            </ThemedText>
            <Pressable style={styles.fileBtn} onPress={() => void pickContractPdf()}>
              <Text style={styles.fileBtnText}>Chọn file PDF</Text>
            </Pressable>
            <ThemedText type="small" style={styles.fileHint}>
              {contractFile
                ? `Đã chọn: ${contractFile.fileName ?? "contract.pdf"}`
                : hasExistingContractFile
                  ? `Giữ file hiện tại: ${existingContractFileName}`
                  : "Chưa tải file hợp đồng"}
            </ThemedText>
          </View>
          <Field label="Điều khoản" value={terms} onChangeText={setTerms} multiline />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Lưu</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A89888"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F6F2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 20, color: "#1F2940" },
  headerTitle: { fontSize: 18, color: "#1F2940" },
  form: { padding: 16, gap: 14, paddingBottom: 24 },
  section: { gap: 10 },
  label: { color: "#1F2940", marginBottom: 4 },
  hint: { color: "#9AA3B2" },
  bookingItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 12,
  },
  bookingSelected: {
    borderColor: "#E68A2E",
    backgroundColor: "#FFF8F0",
  },
  bookingTitle: { color: "#1F2940" },
  bookingMeta: { color: "#9AA3B2", marginTop: 4 },
  field: { gap: 6 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1F2940",
  },
  inputMultiline: { minHeight: 100, textAlignVertical: "top" },
  fileBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  fileBtnText: { color: "#E68A2E", fontWeight: "600" },
  fileHint: { color: "#9AA3B2", marginTop: 4 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EDE8DF",
    backgroundColor: "#FFFFFF",
  },
  submitBtn: {
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
