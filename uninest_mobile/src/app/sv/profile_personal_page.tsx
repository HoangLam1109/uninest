import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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

import { authApi } from "@/api/auth.api";
import { userApi } from "@/api/user.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AuthUser } from "@/types/auth";
import { validateProfilePersonal } from "@/utils/validation/profile";

const AVATAR_PLACEHOLDER = require("@/assets/images/icon.png");

export default function ProfilePersonalPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser, updateUser } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(sessionUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getMe();
      const nextUser = res.data.user;
      setUser(nextUser);
      setFullName(nextUser.fullName ?? "");
      setPhone(nextUser.phone ?? "");
    } catch {
      setUser(sessionUser);
      setFullName(sessionUser?.fullName ?? "");
      setPhone(sessionUser?.phone ?? "");
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handlePickAvatar = async () => {
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

    try {
      const res = await userApi.uploadAvatar({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType ?? "image/jpeg",
        fileName: result.assets[0].fileName ?? undefined,
      });
      const nextUser = { ...res.data.user, avatarUrl: res.data.avatarUrl };
      setUser(nextUser);
      updateUser(nextUser);
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không tải được ảnh."));
    }
  };

  const handleSave = async () => {
    const userId = user?.id ?? sessionUser?.id;
    if (!userId) return;
    const error = validateProfilePersonal(fullName, phone);
    if (error) {
      Alert.alert("Lỗi", error);
      return;
    }

    setSaving(true);
    try {
      const res = await userApi.update(userId, {
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      const nextUser: AuthUser = {
        id: userId,
        email: user?.email ?? sessionUser?.email ?? res.data.email,
        fullName: res.data.fullName,
        phone: res.data.phone,
        role: res.data.role ?? user?.role,
        avatarUrl: user?.avatarUrl,
      };
      setUser(nextUser);
      updateUser(nextUser);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không lưu được hồ sơ."));
    } finally {
      setSaving(false);
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
            Thông tin cá nhân
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : (
            <View style={styles.card}>
              <Pressable style={styles.avatarWrap} onPress={() => void handlePickAvatar()}>
                <Image
                  source={
                    user?.avatarUrl ? { uri: user.avatarUrl } : AVATAR_PLACEHOLDER
                  }
                  style={styles.avatar}
                />
                <ThemedText type="small" style={styles.avatarHint}>
                  Chạm để đổi ảnh
                </ThemedText>
              </Pressable>

              <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
              <Field
                label="Email"
                value={user?.email ?? "—"}
                editable={false}
              />
              <Field label="Số điện thoại" value={phone} onChangeText={setPhone} />
              <InfoRow label="Vai trò" value={user?.role ?? "Sinh viên"} />

              <Pressable
                style={styles.saveButton}
                onPress={() => void handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.saveText}>
                    Lưu thay đổi
                  </ThemedText>
                )}
              </Pressable>

              <Pressable
                style={styles.identityLink}
                onPress={() => router.push("/sv/profile_identity_page" as any)}
              >
                <ThemedText type="smallBold" style={styles.identityLinkText}>
                  Quản lý xác minh CCCD →
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="#A89888"
        />
      ) : (
        <ThemedText type="smallBold" style={styles.readonlyValue}>
          {value}
        </ThemedText>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.readonlyValue}>
        {value}
      </ThemedText>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    gap: 12,
  },
  avatarWrap: { alignItems: "center", gap: 8, marginBottom: 4 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarHint: { color: "#8A7B68" },
  field: { gap: 6 },
  fieldLabel: { color: "#8A7B68", fontSize: 13 },
  input: {
    backgroundColor: "#FAF7F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#2F261A",
  },
  readonlyValue: { color: "#2F261A", fontSize: 16 },
  infoRow: { gap: 4 },
  saveButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveText: { color: "#FFFFFF" },
  identityLink: { alignItems: "center", paddingVertical: 8 },
  identityLinkText: { color: "#F28C1B" },
});
