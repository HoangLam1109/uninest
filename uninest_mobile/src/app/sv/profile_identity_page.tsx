import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

import { identityApi } from "@/api/identity.api";
import { IdentityDetailView } from "@/components/identity-detail-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Identity } from "@/types/identity";
import {
  formatIdentityDate,
  identityStatusColor,
  identityStatusLabel,
} from "@/utils/identity-display";
import { validateIdentityForm } from "@/utils/validation/identity";

type FormMode = "create" | "edit";

function formatDateInput(value?: string) {
  if (!value) return "";
  return value.split("T")[0] ?? value;
}

export default function ProfileIdentityPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);
  const [viewingIdentity, setViewingIdentity] = useState<Identity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);

  const loadIdentities = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await identityApi.getMy();
      setIdentities(res.data ?? []);
    } catch {
      setIdentities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadIdentities();
    }, [loadIdentities]),
  );

  const pickImage = async (side: "front" | "back") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Cần quyền thư viện ảnh.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;
    if (side === "front") setFrontUri(result.assets[0].uri);
    else setBackUri(result.assets[0].uri);
  };

  const resetForm = () => {
    setFullName("");
    setDateOfBirth("");
    setPhone("");
    setCccdNumber("");
    setFrontUri(null);
    setBackUri(null);
    setEditingIdentity(null);
    setFormMode("create");
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode("create");
    setFormOpen(true);
  };

  const openEditForm = (identity: Identity) => {
    if (identity.status !== "PENDING_VERIFICATION") {
      Alert.alert(
        "Không thể sửa",
        "Chỉ hồ sơ đang chờ xác minh mới có thể chỉnh sửa.",
      );
      return;
    }
    setEditingIdentity(identity);
    setFormMode("edit");
    setFullName(identity.fullName);
    setDateOfBirth(formatDateInput(identity.dateOfBirth));
    setPhone(identity.phone);
    setCccdNumber(identity.cccdNumber);
    setFrontUri(null);
    setBackUri(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    const error = validateIdentityForm({
      fullName,
      dateOfBirth,
      phone,
      cccdNumber: formMode === "edit" ? editingIdentity?.cccdNumber ?? cccdNumber : cccdNumber,
    });
    if (error) {
      Alert.alert("Lỗi", error);
      return;
    }

    if (formMode === "create") {
      if (!frontUri || !backUri) {
        Alert.alert("Lỗi", "Vui lòng tải ảnh CCCD mặt trước và mặt sau.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (formMode === "edit" && editingIdentity) {
        await identityApi.update(editingIdentity._id, {
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          phone: phone.trim(),
          ...(frontUri ? { cccdFront: { uri: frontUri } } : {}),
          ...(backUri ? { cccdBack: { uri: backUri } } : {}),
        });
        Alert.alert("Thành công", "Hồ sơ xác minh đã được cập nhật.");
      } else {
        await identityApi.create({
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          phone: phone.trim(),
          cccdNumber: cccdNumber.trim(),
          cccdFront: { uri: frontUri! },
          cccdBack: { uri: backUri! },
        });
        Alert.alert("Thành công", "Hồ sơ xác minh đã được gửi.");
      }
      closeForm();
      await loadIdentities(true);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        getApiErrorMessage(
          err,
          formMode === "edit"
            ? "Không cập nhật được hồ sơ."
            : "Không gửi được hồ sơ.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (identity: Identity) => {
    Alert.alert(
      "Xóa hồ sơ",
      `Bạn có chắc muốn xóa hồ sơ CCCD của ${identity.fullName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setDeletingId(identity._id);
            void identityApi
              .delete(identity._id)
              .then(async () => {
                if (viewingIdentity?._id === identity._id) {
                  setViewingIdentity(null);
                }
                await loadIdentities(true);
                Alert.alert("Thành công", "Đã xóa hồ sơ xác minh.");
              })
              .catch((err) => {
                Alert.alert(
                  "Lỗi",
                  getApiErrorMessage(err, "Không xóa được hồ sơ."),
                );
              })
              .finally(() => setDeletingId(null));
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Xác minh danh tính
          </ThemedText>
          <Pressable style={styles.iconButton} onPress={openCreateForm}>
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadIdentities(true)}
              tintColor="#F28C1B"
            />
          }
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : identities.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có hồ sơ xác minh. Nhấn + để tạo hồ sơ CCCD.
              </ThemedText>
            </View>
          ) : (
            identities.map((identity) => (
              <View key={identity._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <ThemedText type="smallBold" style={styles.cardTitle}>
                    {identity.fullName}
                  </ThemedText>
                  <Text
                    style={[
                      styles.statusText,
                      { color: identityStatusColor(identity.status) },
                    ]}
                  >
                    {identityStatusLabel(identity.status)}
                  </Text>
                </View>
                <ThemedText type="small" style={styles.cardMeta}>
                  CCCD: {identity.cccdNumber}
                </ThemedText>
                <ThemedText type="small" style={styles.cardMeta}>
                  Ngày sinh: {formatIdentityDate(identity.dateOfBirth)}
                </ThemedText>
                <ThemedText type="small" style={styles.cardMeta}>
                  SĐT: {identity.phone}
                </ThemedText>

                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setViewingIdentity(identity)}
                  >
                    <Text style={styles.actionButtonText}>Xem</Text>
                  </Pressable>
                  {identity.status === "PENDING_VERIFICATION" ? (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => openEditForm(identity)}
                    >
                      <Text style={styles.actionButtonText}>Sửa</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    disabled={deletingId === identity._id}
                    onPress={() => handleDelete(identity)}
                  >
                    {deletingId === identity._id ? (
                      <ActivityIndicator color="#D14343" size="small" />
                    ) : (
                      <Text style={styles.actionButtonDangerText}>Xóa</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={formOpen} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeForm}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              {formMode === "edit" ? "Cập nhật hồ sơ CCCD" : "Tạo hồ sơ CCCD"}
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.form}>
            <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
            <Field
              label="Ngày sinh (YYYY-MM-DD)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
            <Field label="Số điện thoại" value={phone} onChangeText={setPhone} />
            {formMode === "create" ? (
              <Field label="Số CCCD" value={cccdNumber} onChangeText={setCccdNumber} />
            ) : (
              <View style={styles.field}>
                <ThemedText type="small" style={styles.fieldLabel}>
                  Số CCCD
                </ThemedText>
                <ThemedText type="smallBold" style={styles.readOnlyValue}>
                  {cccdNumber}
                </ThemedText>
              </View>
            )}
            <Pressable style={styles.imageButton} onPress={() => void pickImage("front")}>
              <ThemedText type="smallBold" style={styles.imageButtonText}>
                {frontUri
                  ? "✓ Ảnh mặt trước mới"
                  : formMode === "edit"
                    ? "Đổi ảnh mặt trước (tuỳ chọn)"
                    : "Tải ảnh mặt trước"}
              </ThemedText>
            </Pressable>
            <Pressable style={styles.imageButton} onPress={() => void pickImage("back")}>
              <ThemedText type="smallBold" style={styles.imageButtonText}>
                {backUri
                  ? "✓ Ảnh mặt sau mới"
                  : formMode === "edit"
                    ? "Đổi ảnh mặt sau (tuỳ chọn)"
                    : "Tải ảnh mặt sau"}
              </ThemedText>
            </Pressable>
            <Pressable
              style={styles.submitButton}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.submitText}>
                  {formMode === "edit" ? "Lưu thay đổi" : "Gửi hồ sơ"}
                </ThemedText>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={Boolean(viewingIdentity)} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setViewingIdentity(null)}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Chi tiết hồ sơ
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.detailBody}>
            {viewingIdentity ? (
              <IdentityDetailView identity={viewingIdentity} />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor="#A89888"
      />
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
  addText: { fontSize: 28, color: "#F28C1B", fontWeight: "700" },
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
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
    gap: 4,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: { color: "#2F261A", flex: 1 },
  cardMeta: { color: "#8A7B68" },
  statusText: { fontSize: 12, fontWeight: "800" },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE4",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFF0DF",
  },
  actionButtonText: {
    color: "#C47A10",
    fontWeight: "700",
    fontSize: 13,
  },
  actionButtonDanger: {
    backgroundColor: "#FDECEC",
  },
  actionButtonDangerText: {
    color: "#D14343",
    fontWeight: "700",
    fontSize: 13,
  },
  modalSafe: { flex: 1, backgroundColor: "#F5EFE6" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: { fontSize: 17, color: "#2F261A" },
  detailBody: { flex: 1, paddingHorizontal: 16 },
  form: { padding: 16, gap: 12 },
  field: { gap: 6 },
  fieldLabel: { color: "#6B5C4E" },
  readOnlyValue: { color: "#2F261A" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#2F261A",
  },
  imageButton: {
    backgroundColor: "#FFF0DF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  imageButtonText: { color: "#C47A10" },
  submitButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#FFFFFF" },
});
