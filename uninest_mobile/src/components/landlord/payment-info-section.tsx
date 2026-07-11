import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { landlordPaymentInfoApi } from "@/api/landlord-payment-info.api";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  LandlordPaymentInfo,
  LandlordPaymentInfoPayload,
} from "@/types/landlord-payment-info";
import { hasApprovedPaymentInfo } from "@/utils/invoice-display";

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
} as const;

export function PaymentInfoSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<LandlordPaymentInfo | null>(
    null,
  );
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [paymentQrUrl, setPaymentQrUrl] = useState("");
  const [paymentNoteTemplate, setPaymentNoteTemplate] = useState(
    "THANHTOAN {invoiceCode}",
  );

  const syncForm = useCallback((info: LandlordPaymentInfo | null) => {
    setBankName(info?.bankName ?? "");
    setBankAccountNumber(info?.bankAccountNumber ?? "");
    setBankAccountHolder(info?.bankAccountHolder ?? "");
    setPaymentQrUrl(info?.paymentQrUrl ?? "");
    setPaymentNoteTemplate(
      info?.paymentNoteTemplate ?? "THANHTOAN {invoiceCode}",
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await landlordPaymentInfoApi.getMy();
      const info = res.data ?? null;
      setPaymentInfo(info);
      syncForm(info);
      if (!info) setEditing(true);
    } catch {
      setPaymentInfo(null);
    } finally {
      setLoading(false);
    }
  }, [syncForm]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountHolder.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin ngân hàng.");
      return;
    }

    const payload: LandlordPaymentInfoPayload = {
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountHolder: bankAccountHolder.trim(),
      paymentQrUrl: paymentQrUrl.trim() || undefined,
      paymentNoteTemplate: paymentNoteTemplate.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await landlordPaymentInfoApi.upsertMy(payload);
      setPaymentInfo(res.data ?? null);
      syncForm(res.data ?? null);
      setEditing(false);
      Alert.alert(
        "Đã lưu",
        "Thông tin thanh toán đã được gửi. Admin sẽ duyệt trước khi bạn tạo hóa đơn.",
      );
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không lưu được thông tin."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    syncForm(paymentInfo);
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#E68A2E" />
      </View>
    );
  }

  const approved = hasApprovedPaymentInfo(paymentInfo);

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Thông tin thanh toán
      </ThemedText>
      <ThemedText type="small" style={styles.sectionHint}>
        Thông tin này hiển thị trên hóa đơn để người thuê chuyển khoản trực tiếp
        cho bạn.
      </ThemedText>

      {paymentInfo && !editing ? (
        <View style={styles.card}>
          <View style={[styles.statusBadge, statusStyle(paymentInfo.status)]}>
            <Text style={[styles.statusText, statusTextStyle(paymentInfo.status)]}>
              {STATUS_LABELS[paymentInfo.status]}
            </Text>
          </View>

          {paymentInfo.status === "PENDING" ? (
            <ThemedText type="small" style={styles.noteText}>
              Thông tin đang chờ admin duyệt. Bạn chưa thể tạo hóa đơn.
            </ThemedText>
          ) : null}

          {paymentInfo.status === "REJECTED" && paymentInfo.rejectionReason ? (
            <ThemedText type="small" style={styles.rejectText}>
              Lý do từ chối: {paymentInfo.rejectionReason}
            </ThemedText>
          ) : null}

          <InfoLine label="Ngân hàng" value={paymentInfo.bankName} />
          <InfoLine label="Số tài khoản" value={paymentInfo.bankAccountNumber} />
          <InfoLine label="Chủ tài khoản" value={paymentInfo.bankAccountHolder} />
          <InfoLine
            label="Mẫu nội dung CK"
            value={paymentInfo.paymentNoteTemplate ?? "THANHTOAN {invoiceCode}"}
          />

          {paymentInfo.paymentQrUrl ? (
            <View style={styles.qrWrap}>
              <ThemedText type="small" style={styles.qrLabel}>
                Mã QR
              </ThemedText>
              <Image
                source={{ uri: paymentInfo.paymentQrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {paymentInfo.status === "REJECTED" || !approved ? (
            <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
              <ThemedText type="smallBold" style={styles.editBtnText}>
                Cập nhật lại
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.card}>
          <Field label="Tên ngân hàng *" value={bankName} onChangeText={setBankName} />
          <Field
            label="Số tài khoản *"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            keyboardType="number-pad"
          />
          <Field
            label="Chủ tài khoản *"
            value={bankAccountHolder}
            onChangeText={setBankAccountHolder}
          />
          <Field
            label="URL ảnh QR (tuỳ chọn)"
            value={paymentQrUrl}
            onChangeText={setPaymentQrUrl}
            placeholder="https://..."
          />
          <Field
            label="Mẫu nội dung CK"
            value={paymentNoteTemplate}
            onChangeText={setPaymentNoteTemplate}
            placeholder="THANHTOAN {invoiceCode}"
          />

          <View style={styles.formActions}>
            {paymentInfo ? (
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <ThemedText type="smallBold" style={styles.cancelBtnText}>
                  Hủy
                </ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.saveBtnText}>
                  Lưu thông tin
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA3B2"
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <ThemedText type="small" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function statusStyle(status: LandlordPaymentInfo["status"]) {
  if (status === "APPROVED") return { backgroundColor: "#E2F5E8" };
  if (status === "REJECTED") return { backgroundColor: "#FDECEC" };
  return { backgroundColor: "#FFF4D6" };
}

function statusTextStyle(status: LandlordPaymentInfo["status"]) {
  if (status === "APPROVED") return { color: "#2E8B57" };
  if (status === "REJECTED") return { color: "#D14343" };
  return { color: "#C47A10" };
}

const styles = StyleSheet.create({
  section: { marginTop: 16 },
  sectionTitle: { color: "#1F2940", fontSize: 16, marginBottom: 4 },
  sectionHint: { color: "#9AA3B2", marginBottom: 12, lineHeight: 20 },
  loadingBox: { paddingVertical: 24, alignItems: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    gap: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  noteText: { color: "#C47A10", lineHeight: 20 },
  rejectText: { color: "#D14343", lineHeight: 20 },
  infoLine: { gap: 2 },
  infoLabel: { color: "#9AA3B2" },
  infoValue: { color: "#1F2940" },
  qrWrap: { alignItems: "center", gap: 8, marginTop: 4 },
  qrLabel: { color: "#9AA3B2" },
  qrImage: { width: 120, height: 120, borderRadius: 12 },
  editBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E68A2E",
  },
  editBtnText: { color: "#E68A2E" },
  field: { gap: 6 },
  fieldLabel: { color: "#1F2940" },
  input: {
    backgroundColor: "#F7F6F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1F2940",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  cancelBtnText: { color: "#7A6B58" },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E68A2E",
    minWidth: 120,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#FFFFFF" },
});
