import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import { validateLandlordProfileEdit } from "@/utils/validation/profile";

function validateForm(
  fullName: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
): string | null {
  return validateLandlordProfileEdit(
    fullName,
    email,
    phone,
    password,
    confirmPassword,
  );
}

export default function LandlordProfileEditPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser, updateUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getMe();
      const user = res.data.user;
      setFullName(user.fullName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    } catch (err) {
      if (sessionUser) {
        setFullName(sessionUser.fullName ?? "");
        setEmail(sessionUser.email ?? "");
        setPhone(sessionUser.phone ?? "");
      }
      Alert.alert(
        "Không tải được hồ sơ",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    const userId = sessionUser?.id;
    if (!userId) {
      Alert.alert("Lỗi", "Không xác định được tài khoản. Vui lòng đăng nhập lại.");
      return;
    }

    const error = validateForm(
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    );
    if (error) {
      Alert.alert("Không thể lưu", error);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        ...(password ? { password } : {}),
      };

      await userApi.update(userId, payload);
      const me = await authApi.getMe();
      updateUser(me.data.user);

      Alert.alert("Đã lưu", "Hồ sơ của bạn đã được cập nhật.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(
        "Không thể lưu",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Chỉnh sửa hồ sơ
          </ThemedText>
          <View style={styles.headerButton} />
        </View>

        {loading ? (
          <ActivityIndicator color="#E68A2E" style={{ marginTop: 40 }} />
        ) : (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.select({ ios: "padding", android: undefined })}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24 + insets.bottom,
              }}
            >
              <ThemedText type="small" style={styles.hint}>
                Cập nhật thông tin liên hệ của bạn. Email dùng để đăng nhập.
              </ThemedText>

              <Field label="Họ và tên" required>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </Field>

              <Field label="Email" required>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ten@email.com"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>

              <Field label="Số điện thoại" required>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="09xx xxx xxx"
                  placeholderTextColor="#9AA3B2"
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </Field>

              <View style={styles.passwordSection}>
                <ThemedText type="smallBold" style={styles.passwordTitle}>
                  Đổi mật khẩu (tùy chọn)
                </ThemedText>
                <ThemedText type="small" style={styles.passwordHint}>
                  Để trống nếu không muốn đổi mật khẩu.
                </ThemedText>
              </View>

              <Field label="Mật khẩu mới">
                <View style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Tối thiểu 8 ký tự"
                    placeholderTextColor="#9AA3B2"
                    style={[styles.input, styles.passwordInput]}
                    secureTextEntry={!passwordVisible}
                  />
                  <Pressable
                    onPress={() => setPasswordVisible((v) => !v)}
                    hitSlop={10}
                  >
                    <Text style={styles.eyeIcon}>
                      {passwordVisible ? "🙈" : "👁️"}
                    </Text>
                  </Pressable>
                </View>
              </Field>

              <Field label="Xác nhận mật khẩu">
                <View style={styles.passwordRow}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9AA3B2"
                    style={[styles.input, styles.passwordInput]}
                    secureTextEntry={!confirmVisible}
                  />
                  <Pressable
                    onPress={() => setConfirmVisible((v) => !v)}
                    hitSlop={10}
                  >
                    <Text style={styles.eyeIcon}>
                      {confirmVisible ? "🙈" : "👁️"}
                    </Text>
                  </Pressable>
                </View>
              </Field>

              <Pressable
                style={[styles.saveButton, isSubmitting && styles.saveDisabled]}
                onPress={() => void handleSave()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.saveText}>
                    Lưu thay đổi
                  </ThemedText>
                )}
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 22,
    color: "#1F2940",
  },
  headerTitle: {
    fontSize: 18,
    color: "#1F2940",
  },
  hint: {
    color: "#7A869A",
    marginBottom: 16,
    lineHeight: 20,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: "#1F2940",
    marginBottom: 8,
    fontSize: 14,
  },
  required: {
    color: "#D14343",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2940",
  },
  passwordSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  passwordTitle: {
    color: "#1F2940",
    fontSize: 15,
  },
  passwordHint: {
    color: "#9AA3B2",
    marginTop: 4,
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
    borderRadius: 12,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  eyeIcon: {
    fontSize: 18,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
