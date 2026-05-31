import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [studentTab, setStudentTab] = useState(true);

  const handleLogin = () => {
    signIn();
    router.replace("/" as any);
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
              Đăng nhập (HCMC)
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
                  Ngôi nhà của bạn xa giảng đường
                </ThemedText>
              </View>

              <View style={styles.tabRow}>
                <Pressable
                  onPress={() => setStudentTab(true)}
                  style={[
                    styles.tab,
                    studentTab ? styles.tabActive : styles.tabIdle,
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={
                      studentTab ? styles.tabTextActive : styles.tabTextIdle
                    }
                  >
                    Đăng nhập Sinh viên
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setStudentTab(false)}
                  style={[
                    styles.tab,
                    !studentTab ? styles.tabActive : styles.tabIdle,
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={
                      !studentTab ? styles.tabTextActive : styles.tabTextIdle
                    }
                  >
                    Đăng nhập Cho nhà
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.bannerWrap}>
                <Image
                  source={require("../../assets/images/4.png")}
                  style={styles.banner}
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
                style={styles.primaryButton}
                onPressIn={handleLogin}
                onPress={handleLogin}
              >
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Đăng nhập
                </ThemedText>
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
                <Pressable>
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
  tabRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
  },
  tabActive: {
    borderBottomColor: "#F28C1B",
  },
  tabIdle: {
    borderBottomColor: "#E7D8C5",
  },
  tabTextActive: {
    color: "#F28C1B",
  },
  tabTextIdle: {
    color: "#7A869A",
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
