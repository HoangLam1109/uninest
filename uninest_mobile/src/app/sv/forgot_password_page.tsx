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
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  validateEmailValue,
  validateResetPasswordForm,
} from "@/utils/validation/auth";

export default function ForgotPasswordPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSendOtp = async () => {
    const emailError = validateEmailValue(email);
    if (emailError) {
      Alert.alert("Gửi mã thất bại", emailError);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSendingOtp(true);
    try {
      const response = await authApi.forgotPassword({ email: normalizedEmail });
      setSubmittedEmail(normalizedEmail);
      Alert.alert(
        "Đã gửi mã xác nhận",
        response.message ||
          "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được OTP trong ít phút.",
      );
    } catch (err) {
      Alert.alert(
        "Không thể gửi mã xác nhận",
        getApiErrorMessage(err, "Vui lòng kiểm tra lại email và thử lại."),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setSubmittedEmail(null);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async () => {
    if (!submittedEmail) return;

    const error = validateResetPasswordForm({
      email: submittedEmail,
      otp,
      newPassword,
      confirmPassword,
    });
    if (error) {
      Alert.alert("Đặt lại mật khẩu thất bại", error);
      return;
    }

    setIsResetting(true);
    try {
      await authApi.resetPassword({
        email: submittedEmail,
        otp: otp.trim(),
        newPassword,
      });
      Alert.alert(
        "Đổi mật khẩu thành công",
        "Bạn có thể đăng nhập lại bằng mật khẩu mới.",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/sv/login_page" as any),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "Không thể đổi mật khẩu",
        getApiErrorMessage(err, "Vui lòng kiểm tra lại mã OTP và thử lại."),
      );
    } finally {
      setIsResetting(false);
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
                <AppLogo
                  size={64}
                  style={styles.logoCircle}
                  withBackground={false}
                />
                <ThemedText type="title" style={styles.title}>
                  Quên mật khẩu
                </ThemedText>
                <ThemedText type="small" style={styles.subtitle}>
                  Nhập email đã đăng ký để nhận mã OTP và đặt lại mật khẩu mới.
                </ThemedText>
              </View>

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Email
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>✉️</ThemedText>
                <TextInput
                  placeholder="name@email.com"
                  placeholderTextColor="#7E8694"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!submittedEmail}
                />
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    styles.actionButton,
                    submittedEmail ? styles.outlineButton : null,
                    isSendingOtp && styles.buttonDisabled,
                  ]}
                  onPress={() => void handleSendOtp()}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <ActivityIndicator
                      color={submittedEmail ? "#F28C1B" : "#FFFFFF"}
                    />
                  ) : (
                    <ThemedText
                      type="smallBold"
                      style={[
                        styles.primaryButtonText,
                        submittedEmail ? styles.outlineButtonText : null,
                      ]}
                    >
                      {submittedEmail ? "Gửi lại mã OTP" : "Gửi mã OTP"}
                    </ThemedText>
                  )}
                </Pressable>

                {submittedEmail ? (
                  <Pressable
                    style={styles.ghostButton}
                    onPress={handleUseDifferentEmail}
                  >
                    <ThemedText type="smallBold" style={styles.ghostButtonText}>
                      Dùng email khác
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>

              {submittedEmail ? (
                <View style={styles.resetSection}>
                  <View style={styles.infoBox}>
                    <ThemedText type="small" style={styles.infoText}>
                      Mã OTP đã được gửi đến{" "}
                      <ThemedText type="smallBold" style={styles.infoEmail}>
                        {submittedEmail}
                      </ThemedText>
                      .
                    </ThemedText>
                  </View>

                  <ThemedText type="smallBold" style={styles.fieldLabel}>
                    Mã OTP
                  </ThemedText>
                  <View style={styles.inputBox}>
                    <ThemedText style={styles.inputIcon}>🔢</ThemedText>
                    <TextInput
                      placeholder="Nhập 6 chữ số"
                      placeholderTextColor="#7E8694"
                      value={otp}
                      onChangeText={setOtp}
                      style={styles.input}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                  </View>

                  <ThemedText type="smallBold" style={styles.fieldLabel}>
                    Mật khẩu mới
                  </ThemedText>
                  <View style={styles.inputBox}>
                    <ThemedText style={styles.inputIcon}>🔒</ThemedText>
                    <TextInput
                      placeholder="Tối thiểu 8 ký tự"
                      placeholderTextColor="#7E8694"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      style={styles.input}
                      secureTextEntry={!passwordVisible}
                      autoComplete="new-password"
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

                  <ThemedText type="smallBold" style={styles.fieldLabel}>
                    Xác nhận mật khẩu mới
                  </ThemedText>
                  <View style={styles.inputBox}>
                    <ThemedText style={styles.inputIcon}>🔒</ThemedText>
                    <TextInput
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#7E8694"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.input}
                      secureTextEntry={!confirmVisible}
                      autoComplete="new-password"
                    />
                    <Pressable
                      onPress={() => setConfirmVisible((current) => !current)}
                      hitSlop={10}
                    >
                      <ThemedText style={styles.eyeIcon}>
                        {confirmVisible ? "🙈" : "👁️"}
                      </ThemedText>
                    </Pressable>
                  </View>

                  <Pressable
                    style={[
                      styles.primaryButton,
                      isResetting && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleResetPassword()}
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText
                        type="smallBold"
                        style={styles.primaryButtonText}
                      >
                        Đặt lại mật khẩu
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.footerRow}>
                <ThemedText type="small" style={styles.footerText}>
                  Nhớ mật khẩu rồi?{" "}
                </ThemedText>
                <Pressable
                  onPress={() => router.replace("/sv/login_page" as any)}
                >
                  <ThemedText type="smallBold" style={styles.footerLink}>
                    Quay lại đăng nhập
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
  title: {
    fontSize: 28,
    color: "#1F2940",
    marginBottom: 6,
  },
  subtitle: {
    color: "#4B5568",
    textAlign: "center",
    lineHeight: 20,
  },
  fieldLabel: {
    color: "#263045",
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
  actionRow: {
    gap: 10,
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 0,
    marginBottom: 0,
  },
  primaryButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 6,
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F28C1B",
  },
  outlineButtonText: {
    color: "#F28C1B",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  ghostButtonText: {
    color: "#6B7280",
  },
  resetSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5DCCF",
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  infoText: {
    color: "#6B7280",
    lineHeight: 20,
  },
  infoEmail: {
    color: "#1F2940",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  footerText: {
    color: "#535C6A",
  },
  footerLink: {
    color: "#F28C1B",
  },
});
