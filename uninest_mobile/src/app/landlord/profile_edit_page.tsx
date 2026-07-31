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
import { getUserAvatarSource } from "@/utils/user-display";

export default function LandlordProfileEditPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser, updateUser } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(sessionUser);
  const [fullName, setFullName] = useState(sessionUser?.fullName ?? "");
  const [phone, setPhone] = useState(sessionUser?.phone ?? "");
  const [email, setEmail] = useState(sessionUser?.email ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getMe();
      const nextUser = res.data.user;
      setUser(nextUser);
      setFullName(nextUser.fullName ?? "");
      setPhone(nextUser.phone ?? "");
      setEmail(nextUser.email ?? "");
    } catch {
      setUser(sessionUser);
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

    setUploadingAvatar(true);
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
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      Alert.alert("Lỗi", "Họ tên phải có ít nhất 2 ký tự.");
      return;
    }

    const userId = user?.id ?? sessionUser?.id;
    if (!userId) {
      Alert.alert("Lỗi", "Không xác định được tài khoản.");
      return;
    }

    setSaving(true);
    try {
      await userApi.update(String(userId), {
        fullName: trimmedName,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      const me = await authApi.getMe();
      setUser(me.data.user);
      updateUser(me.data.user);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không lưu được hồ sơ."));
    } finally {
      setSaving(false);
    }
  };

  const displayUser = user ?? sessionUser;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chỉnh sửa hồ sơ
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <ActivityIndicator color="#E68A2E" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 40 + insets.bottom,
            }}
          >
            <Pressable
              style={styles.avatarWrap}
              onPress={() => void handlePickAvatar()}
              disabled={uploadingAvatar}
            >
              <Image
                source={getUserAvatarSource(displayUser?.avatarUrl)}
                style={styles.avatar}
                contentFit="cover"
              />
              {uploadingAvatar ? (
                <ActivityIndicator color="#E68A2E" />
              ) : (
                <ThemedText type="small" style={styles.avatarHint}>
                  Chạm để đổi ảnh
                </ThemedText>
              )}
            </Pressable>

            <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
            <Field label="Email" value={email} onChangeText={setEmail} />
            <Field label="Số điện thoại" value={phone} onChangeText={setPhone} />

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
          </ScrollView>
        )}
      </SafeAreaView>
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
  headerTitle: { fontSize: 18, color: "#2F261A", fontWeight: "700" },
  avatarWrap: { alignItems: "center", gap: 8, marginBottom: 20 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFF0DF",
  },
  avatarHint: { color: "#8A7B68" },
  field: { gap: 6, marginBottom: 12 },
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
  saveButton: {
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#FFFFFF" },
});
