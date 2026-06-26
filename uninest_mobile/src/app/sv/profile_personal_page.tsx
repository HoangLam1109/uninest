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

export default function ProfilePersonalPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser, updateUser } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(sessionUser);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
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

  const displayUser = user ?? sessionUser;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hồ sơ cá nhân
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40 + insets.bottom,
          }}
        >
          <ThemedText type="small" style={styles.subtitle}>
            Quản lý thông tin cá nhân và hồ sơ định danh của bạn.
          </ThemedText>

          {loading ? (
            <ActivityIndicator color="#F28C1B" style={{ marginTop: 24 }} />
          ) : (
            <>
              <View style={styles.card}>
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
                    <ActivityIndicator color="#F28C1B" />
                  ) : (
                    <ThemedText type="small" style={styles.avatarHint}>
                      Chạm để đổi ảnh
                    </ThemedText>
                  )}
                </Pressable>

                <ThemedText type="smallBold" style={styles.userName}>
                  {displayUser?.fullName ?? "—"}
                </ThemedText>

                {displayUser?.email ? (
                  <ThemedText type="small" style={styles.contactRow}>
                    ✉ {displayUser.email}
                  </ThemedText>
                ) : null}
                {displayUser?.phone ? (
                  <ThemedText type="small" style={styles.contactRow}>
                    ☎ {displayUser.phone}
                  </ThemedText>
                ) : null}
              </View>

              <Pressable
                style={styles.identityButton}
                onPress={() => router.push("/sv/profile_identity_page" as any)}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold" style={styles.identityTitle}>
                    Hồ sơ định danh
                  </ThemedText>
                  <ThemedText type="small" style={styles.identityText}>
                    Hồ sơ định danh giúp chủ trọ xác minh danh tính khi bạn đặt
                    phòng.
                  </ThemedText>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
  subtitle: {
    color: "#8A7B68",
    lineHeight: 20,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarWrap: { alignItems: "center", gap: 8, marginBottom: 12 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFF0DF",
  },
  avatarHint: { color: "#8A7B68" },
  userName: {
    fontSize: 18,
    color: "#2F261A",
    marginBottom: 8,
    textAlign: "center",
  },
  contactRow: {
    color: "#8A7B68",
    marginTop: 4,
    textAlign: "center",
  },
  identityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  identityTitle: {
    color: "#2F261A",
    fontSize: 16,
    marginBottom: 4,
  },
  identityText: {
    color: "#8A7B68",
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: "#C5B8A8",
  },
});
