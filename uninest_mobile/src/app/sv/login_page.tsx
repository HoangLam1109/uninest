import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { authApi } from "@/api/auth.api";
import { AppLogo } from "@/components/app-logo";
import { AuthBanner } from "@/components/auth-banner";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import { isLandlordRole } from "@/utils/landlord-access";

function getLoginErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, "");
  const normalized = message.trim().toLowerCase();

  if (
    normalized === "user not found!" ||
    normalized === "user not found" ||
    normalized === "invalid password!" ||
    normalized === "invalid password"
  ) {
    return "Sai mật khẩu hoặc mail không tồn tại.";
  }

  return message || "Vui lòng kiểm tra email và mật khẩu.";
}

function validateLogin(email: string, password: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return "Vui lòng nhập email.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "Email không hợp lệ.";
  }
  if (!password) {
    return "Vui lòng nhập mật khẩu.";
  }
  return null;
}

export default function LoginPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const error = validateLogin(email, password);
    if (error) {
      Alert.alert("Đăng nhập thất bại", error);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      signIn({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });

      const role = response.data.user.role;
      if (isLandlordRole(role)) {
        router.replace("/landlord/home_page" as any);
      } else {
        router.replace("/" as any);
      }
    } catch (err) {
      Alert.alert(
        "Đăng nhập thất bại",
        getLoginErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.keyboardWrap}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 8 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.card}>
              <View style={styles.heroBlock}>
                <AppLogo size={72} style={styles.logoCircle} withBackground={false} />
                <ThemedText type="title" style={styles.brand}>
                  UniNest
                </ThemedText>
                <ThemedText type="small" style={styles.subtitle}>
                  Ngôi nhà của bạn xa giảng đường
                </ThemedText>
              </View>

              <AuthBanner />

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Địa chỉ Email
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>✉️</ThemedText>
                <TextInput
                  placeholder="ten@truong.edu.vn"
                  placeholderTextColor="#7E8694"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.labelRow}>
                <ThemedText type="smallBold" style={styles.fieldLabel}>
                  Mật khẩu
                </ThemedText>
                <Pressable
                  onPress={() => setPasswordVisible((current) => !current)}
                >
                  <ThemedText type="smallBold" style={styles.forgotLink}>
                    Quên mật khẩu?
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>🔒</ThemedText>
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#7E8694"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                />
                <Pressable
                  onPress={() => setPasswordVisible((current) => !current)}
                  hitSlop={10}
                >
                  <ThemedText style={styles.eyeIcon}>
                    {passwordVisible ? "🙈" : "👁️"}
                  </ThemedText>
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={styles.primaryButtonText}
                  >
                    Đăng nhập
                  </ThemedText>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <ThemedText type="small" style={styles.dividerText}>
                  HOẶC TIẾP TỤC VỚI
                </ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <Pressable style={styles.socialButton}>
                  <ThemedText style={styles.socialLabel}>Google</ThemedText>
                </Pressable>
                <Pressable style={styles.socialButton}>
                  <ThemedText style={styles.socialLabel}>Apple</ThemedText>
                </Pressable>
              </View>

              <View style={styles.signupRow}>
                <ThemedText type="small" style={styles.signupText}>
                  Bạn chưa có tài khoản?{" "}
                </ThemedText>
                <Pressable
                  onPress={() => router.push("/sv/register_page" as any)}
                >
                  <ThemedText type="smallBold" style={styles.signupLink}>
                    Đăng ký ngay
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EFEFEF",
  },
  safeArea: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#F8F6F2",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    marginBottom: 12,
  },
  brand: {
    fontSize: 31,
    color: "#1F2940",
    marginBottom: 4,
  },
  subtitle: {
    color: "#4B5568",
    textAlign: "center",
    lineHeight: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: "#263045",
    marginBottom: 8,
  },
  forgotLink: {
    color: "#F28C1B",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5F0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2940",
    paddingVertical: 0,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    marginTop: 6,
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5DCCF",
  },
  dividerText: {
    color: "#99A0AD",
    letterSpacing: 1.4,
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE5F0",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  socialLabel: {
    color: "#354053",
    fontSize: 16,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  signupText: {
    color: "#535C6A",
  },
  signupLink: {
    color: "#F28C1B",
  },
});
