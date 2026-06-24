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

export default function ProfileIdentityPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
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
  };

  const handleSubmit = async () => {
    const error = validateIdentityForm({
      fullName,
      dateOfBirth,
      phone,
      cccdNumber,
    });
    if (error) {
      Alert.alert("Lỗi", error);
      return;
    }
    if (!frontUri || !backUri) {
      Alert.alert("Lỗi", "Vui lòng tải ảnh CCCD mặt trước và mặt sau.");
      return;
    }

    setSubmitting(true);
    try {
      await identityApi.create({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        phone: phone.trim(),
        cccdNumber: cccdNumber.trim(),
        cccdFront: { uri: frontUri },
        cccdBack: { uri: backUri },
      });
      Alert.alert("Thành công", "Hồ sơ xác minh đã được gửi.");
      setFormOpen(false);
      resetForm();
      await loadIdentities(true);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không gửi được hồ sơ."));
    } finally {
      setSubmitting(false);
    }
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
          <Pressable style={styles.iconButton} onPress={() => setFormOpen(true)}>
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
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={formOpen} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setFormOpen(false)}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Tạo hồ sơ CCCD
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
            <Field label="Số CCCD" value={cccdNumber} onChangeText={setCccdNumber} />
            <Pressable style={styles.imageButton} onPress={() => void pickImage("front")}>
              <ThemedText type="smallBold" style={styles.imageButtonText}>
                {frontUri ? "✓ Ảnh mặt trước" : "Tải ảnh mặt trước"}
              </ThemedText>
            </Pressable>
            <Pressable style={styles.imageButton} onPress={() => void pickImage("back")}>
              <ThemedText type="smallBold" style={styles.imageButtonText}>
                {backUri ? "✓ Ảnh mặt sau" : "Tải ảnh mặt sau"}
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
                  Gửi hồ sơ
                </ThemedText>
              )}
            </Pressable>
          </ScrollView>
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
  modalSafe: { flex: 1, backgroundColor: "#F5EFE6" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: { fontSize: 17, color: "#2F261A" },
  form: { padding: 16, gap: 12 },
  field: { gap: 6 },
  fieldLabel: { color: "#6B5C4E" },
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
