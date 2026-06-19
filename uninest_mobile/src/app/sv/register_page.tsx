import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

function validateRegister(form: RegisterForm): string | null {
  const fullName = form.fullName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();

  if (fullName.length < 3) {
    return "Họ và tên phải có ít nhất 3 ký tự.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email không hợp lệ.";
  }
  if (!/^0\d{9,10}$/.test(phone)) {
    return "Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số.";
  }
  if (form.password.length < 8) {
    return "Mật khẩu tối thiểu 8 ký tự.";
  }
  if (form.password !== form.confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  if (!form.terms) {
    return "Bạn cần đồng ý điều khoản sử dụng.";
  }
  return null;
}

export default function RegisterPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const error = validateRegister({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      terms: termsAccepted,
    });

    if (error) {
      Alert.alert("Đăng ký thất bại", error);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      Alert.alert(
        "Đăng ký thành công",
        response.message ||
          "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.",
        [
          {
            text: "Đăng nhập",
            onPress: () => router.replace("/sv/login_page" as any),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        "Đăng ký thất bại",
        getApiErrorMessage(
          err,
          "Không thể kết nối máy chủ. Kiểm tra backend và EXPO_PUBLIC_API_BASE_URL.",
        ),
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
            <ThemedText type="small" style={styles.pageTitle}>
              Đăng ký (HCMC)
            </ThemedText>

            <View style={styles.card}>
              <View style={styles.heroBlock}>
                <View style={styles.logoCircle}>
                  <ThemedText style={styles.logoIcon}>🎓</ThemedText>
                </View>
                <ThemedText type="title" style={styles.brand}>
                  UniNest
                </ThemedText>
                <ThemedText type="small" style={styles.subtitle}>
                  Tạo tài khoản — ngôi nhà của bạn xa giảng đường
                </ThemedText>
              </View>

              <View style={styles.bannerWrap}>
                <Image
                  source={require("@/assets/images/tutorial-web.png")}
                  style={styles.banner}
                />
              </View>

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Họ và tên
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>👤</ThemedText>
                <TextInput
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#7E8694"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

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

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Số điện thoại
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>📱</ThemedText>
                <TextInput
                  placeholder="09xx xxx xxx"
                  placeholderTextColor="#7E8694"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </View>

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Mật khẩu
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>🔒</ThemedText>
                <TextInput
                  placeholder="Tối thiểu 8 ký tự"
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

              <ThemedText type="smallBold" style={styles.fieldLabel}>
                Xác nhận mật khẩu
              </ThemedText>
              <View style={styles.inputBox}>
                <ThemedText style={styles.inputIcon}>🔒</ThemedText>
                <TextInput
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#7E8694"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  secureTextEntry={!confirmVisible}
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
                style={styles.termsRow}
                onPress={() => setTermsAccepted((current) => !current)}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked,
                  ]}
                >
                  {termsAccepted ? (
                    <ThemedText style={styles.checkboxMark}>✓</ThemedText>
                  ) : null}
                </View>
                <ThemedText type="small" style={styles.termsText}>
                  Tôi đồng ý với{" "}
                  <ThemedText type="smallBold" style={styles.termsLink}>
                    Điều khoản sử dụng
                  </ThemedText>{" "}
                  và{" "}
                  <ThemedText type="smallBold" style={styles.termsLink}>
                    Chính sách bảo mật
                  </ThemedText>
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.primaryButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText
                    type="smallBold"
                    style={styles.primaryButtonText}
                  >
                    Tạo tài khoản
                  </ThemedText>
                )}
              </Pressable>

              <View style={styles.signupRow}>
                <ThemedText type="small" style={styles.signupText}>
                  Đã có tài khoản?{" "}
                </ThemedText>
                <Pressable onPress={() => router.push("/sv/login_page" as any)}>
                  <ThemedText type="smallBold" style={styles.signupLink}>
                    Đăng nhập
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
  pageTitle: {
    color: "#8D8D8D",
    fontSize: 22,
    marginBottom: 12,
  },
  card: {
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
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
  bannerWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
  },
  banner: {
    width: "100%",
    height: 134,
    resizeMode: "cover",
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
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#DDE5F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#F28C1B",
    borderColor: "#F28C1B",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "700",
  },
  termsText: {
    flex: 1,
    color: "#535C6A",
    lineHeight: 20,
  },
  termsLink: {
    color: "#F28C1B",
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
