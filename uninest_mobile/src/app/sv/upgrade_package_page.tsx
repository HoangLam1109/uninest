import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { authApi } from "@/api/auth.api";
import { paymentApi } from "@/api/payment.api";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RoleUpgradeTarget } from "@/types/payment";
import { buildUpgradePaymentReturnUrls } from "@/utils/payment-return-url";

const COLORS = {
  bg: "#F5EFE6",
  card: "#FFFFFF",
  text: "#2F261A",
  textSecondary: "#6B5E4D",
  textMuted: "#8A7B68",
  border: "#E8E1D8",
  primary: "#F28C1B",
  landlord: "#5D4E37",
  success: "#2E7D32",
  successBg: "#E8F5E9",
};

type PackageInfo = {
  role: RoleUpgradeTarget;
  title: string;
  eyebrow: string;
  price: string;
  priceNote: string;
  icon: string;
  accent: string;
  accentSoft: string;
  recommended?: boolean;
  summary: string;
  previewFeatures: string[];
  features: { title: string; desc: string }[];
  highlights: string[];
  limitations: string[];
  steps: string[];
};

const PACKAGES: PackageInfo[] = [
  {
    role: "TENANT",
    title: "Gói Người thuê",
    eyebrow: "Dành cho người thuê phòng",
    price: "30.000đ",
    priceNote: "Thanh toán một lần · hiệu lực 1 tháng",
    icon: "🔑",
    accent: COLORS.primary,
    accentSoft: "#FFF4E8",
    recommended: true,
    summary:
      "Dành cho sinh viên và người đi thuê muốn đặt phòng, ký hợp đồng, thanh toán hóa đơn và liên hệ chủ nhà trực tiếp trên UniNest.",
    previewFeatures: [
      "Đặt phòng & theo dõi lịch hẹn",
      "Chat với chủ nhà",
      "AI tìm phòng thông minh",
    ],
    features: [
      {
        title: "Đặt phòng trực tuyến",
        desc: "Gửi yêu cầu thuê phòng, theo dõi trạng thái duyệt từ chủ nhà.",
      },
      {
        title: "Hợp đồng điện tử",
        desc: "Xem, ký hợp đồng thuê và lưu trữ trên tài khoản của bạn.",
      },
      {
        title: "Hóa đơn & chỉ số",
        desc: "Nhận hóa đơn tiền phòng, điện nước và theo dõi chỉ số công tơ.",
      },
      {
        title: "Yêu thích & tìm kiếm",
        desc: "Lưu phòng ưa thích, tìm kiếm theo khu vực và ngân sách.",
      },
      {
        title: "Chat với chủ nhà",
        desc: "Trao đổi trực tiếp về phòng, lịch xem và điều khoản thuê.",
      },
      {
        title: "AI tìm phòng",
        desc: "Mô tả nhu cầu bằng ngôn ngữ tự nhiên, AI gợi ý phòng phù hợp.",
      },
    ],
    highlights: [
      "Kích hoạt ngay sau khi thanh toán thành công",
      "Phù hợp sinh viên tìm phòng trọ gần trường",
      "Quản lý toàn bộ quy trình thuê trên một ứng dụng",
    ],
    limitations: [
      "Không bao gồm quyền đăng tin cho thuê",
      "Không quản lý được phòng của người khác",
    ],
    steps: [
      "Chọn gói Người thuê và bấm thanh toán",
      "Hoàn tất thanh toán trên cổng PayOS",
      "Quay lại app — tài khoản được nâng cấp tự động",
      "Bắt đầu đặt phòng, chat và sử dụng AI tìm phòng",
    ],
  },
  {
    role: "LANDLORD",
    title: "Gói Chủ nhà",
    eyebrow: "Dành cho chủ nhà cho thuê",
    price: "99.000đ",
    priceNote: "Thanh toán một lần · hiệu lực 1 tháng",
    icon: "🏠",
    accent: COLORS.landlord,
    accentSoft: "#F0EBE3",
    summary:
      "Dành cho chủ nhà, chủ trọ muốn đăng phòng, duyệt khách thuê, lập hợp đồng và thu tiền qua hệ thống UniNest.",
    previewFeatures: [
      "Đăng & quản lý phòng cho thuê",
      "Duyệt yêu cầu đặt phòng",
      "Tạo hóa đơn & hợp đồng",
    ],
    features: [
      {
        title: "Quản lý phòng",
        desc: "Đăng tin, chỉnh sửa giá, tiện ích và trạng thái phòng trống/đã thuê.",
      },
      {
        title: "Duyệt đặt phòng",
        desc: "Nhận và phản hồi yêu cầu thuê từ người thuê tiềm năng.",
      },
      {
        title: "Hợp đồng cho thuê",
        desc: "Tạo hợp đồng, gửi cho người thuê ký và theo dõi trạng thái.",
      },
      {
        title: "Hóa đơn định kỳ",
        desc: "Tạo hóa đơn tiền phòng, điện nước và gửi cho người thuê.",
      },
      {
        title: "Chỉ số công tơ",
        desc: "Ghi nhận chỉ số điện nước và tính tiền tiêu thụ tự động.",
      },
      {
        title: "Theo dõi doanh thu",
        desc: "Xem lịch sử thanh toán và tình trạng thu tiền từng phòng.",
      },
    ],
    highlights: [
      "Chuyển sang giao diện quản lý chủ nhà ngay lập tức",
      "Phù hợp chủ trọ quản lý nhiều phòng",
      "Tối ưu quy trình thuê — từ đăng tin đến thu tiền",
    ],
    limitations: [
      "Không bao gồm quyền đặt phòng với tư cách người thuê",
      "Mỗi tài khoản chỉ giữ một vai trò chính tại một thời điểm",
    ],
    steps: [
      "Chọn gói Chủ nhà và bấm thanh toán",
      "Hoàn tất thanh toán trên cổng PayOS",
      "Quay lại app — chuyển sang không gian chủ nhà",
      "Bắt đầu đăng phòng và quản lý người thuê",
    ],
  },
];

function roleLabel(role?: string) {
  if (role === "TENANT") return "Người thuê";
  if (role === "LANDLORD") return "Chủ nhà";
  if (role === "ADMIN") return "Quản trị viên";
  return "Khách";
}

function PackageCard({
  pkg,
  disabled,
  onPress,
}: {
  pkg: PackageInfo;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cardPressable,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.cardInner,
          { borderLeftColor: pkg.accent },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: pkg.accentSoft }]}>
            <Text style={styles.iconEmoji}>{pkg.icon}</Text>
          </View>
          <View style={styles.cardTopText}>
            {pkg.recommended ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Phổ biến nhất</Text>
              </View>
            ) : null}
            <Text style={styles.eyebrow}>{pkg.eyebrow}</Text>
            <Text style={styles.cardTitle}>{pkg.title}</Text>
            <Text style={[styles.cardPrice, { color: pkg.accent }]}>
              {pkg.price}
            </Text>
          </View>
        </View>

        <View style={styles.featureList}>
          {pkg.previewFeatures.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={[styles.featureBullet, { color: pkg.accent }]}>
                ✓
              </Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.detailCta, { backgroundColor: pkg.accentSoft }]}>
          <Text style={[styles.detailCtaText, { color: pkg.accent }]}>
            Xem chi tiết gói →
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function PackageDetailModal({
  pkg,
  visible,
  loading,
  disabled,
  onClose,
  onUpgrade,
}: {
  pkg: PackageInfo | null;
  visible: boolean;
  loading: boolean;
  disabled: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!pkg) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalScreen}>
        <SafeAreaView style={styles.modalSafeArea} edges={["left", "right"]}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
            <Pressable style={styles.iconButton} onPress={onClose}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Chi tiết gói</Text>
            <View style={styles.iconButton} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.modalScrollContent,
              { paddingBottom: 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHero}>
              <View style={[styles.modalAccentBar, { backgroundColor: pkg.accent }]} />
              <View style={styles.modalHeroBody}>
                <View style={styles.modalHeroTop}>
                  <View style={[styles.iconWrap, { backgroundColor: pkg.accentSoft }]}>
                    <Text style={styles.iconEmoji}>{pkg.icon}</Text>
                  </View>
                  <View style={styles.modalHeroText}>
                    <Text style={styles.eyebrow}>{pkg.eyebrow}</Text>
                    <Text style={styles.modalHeroTitle}>{pkg.title}</Text>
                  </View>
                </View>
                <Text style={[styles.modalPrice, { color: pkg.accent }]}>
                  {pkg.price}
                </Text>
                <Text style={styles.priceNote}>{pkg.priceNote}</Text>
                <Text style={styles.modalSummary}>{pkg.summary}</Text>
              </View>
            </View>

            <DetailSection title="Tính năng bao gồm">
              {pkg.features.map((feature) => (
                <View key={feature.title} style={styles.detailFeatureCard}>
                  <Text style={styles.detailFeatureTitle}>{feature.title}</Text>
                  <Text style={styles.detailFeatureDesc}>{feature.desc}</Text>
                </View>
              ))}
            </DetailSection>

            <DetailSection title="Điểm nổi bật">
              {pkg.highlights.map((item) => (
                <View key={item} style={styles.bulletRow}>
                  <View style={styles.bulletCheck}>
                    <Text style={styles.bulletCheckMark}>✓</Text>
                  </View>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </DetailSection>

            <DetailSection title="Lưu ý">
              {pkg.limitations.map((item) => (
                <View key={item} style={styles.bulletRow}>
                  <View style={styles.bulletInfo}>
                    <Text style={styles.bulletInfoMark}>i</Text>
                  </View>
                  <Text style={styles.bulletMuted}>{item}</Text>
                </View>
              ))}
            </DetailSection>

            <DetailSection title="Quy trình thanh toán">
              {pkg.steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={[styles.stepIndex, { backgroundColor: pkg.accent }]}>
                    <Text style={styles.stepIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </DetailSection>

            <View style={styles.modalPayInfo}>
              <Text style={styles.payHintIcon}>🛡️</Text>
              <Text style={styles.modalPayInfoText}>
                Thanh toán qua PayOS — bảo mật, hỗ trợ chuyển khoản và ví điện
                tử. Gói có hiệu lực 30 ngày, hết hạn sẽ về tài khoản Khách.
              </Text>
            </View>
          </ScrollView>

          <View
            style={[
              styles.modalFooter,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.modalPayButton,
                (disabled || loading) && styles.upgradeButtonDisabled,
              ]}
              onPress={onUpgrade}
              disabled={disabled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPayButtonText}>
                  Thanh toán {pkg.price}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function UpgradePackagePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ result?: string; orderCode?: string }>();
  const { user, updateUser } = useAuth();
  const [loadingRole, setLoadingRole] = useState<RoleUpgradeTarget | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleUpgradeTarget | null>(null);
  const handledOrdersRef = useRef<Set<string>>(new Set());

  const selectedPackage =
    PACKAGES.find((pkg) => pkg.role === selectedRole) ?? null;
  const isAlreadyUpgraded = Boolean(user?.role && user.role !== "GUEST");

  const verifyPayment = useCallback(
    async (orderCode: string, result: "success" | "cancel") => {
      if (handledOrdersRef.current.has(orderCode)) return;

      setVerifying(true);
      try {
        if (result === "cancel") {
          await paymentApi.cancelPayOSPayment(orderCode).catch(() => undefined);
          handledOrdersRef.current.add(orderCode);
          Alert.alert("Đã hủy", "Thanh toán đã bị hủy.");
          return;
        }

        let completed = false;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const statusRes = await paymentApi.getPayOSPaymentStatus(orderCode);
          if (statusRes.data.payment.status === "COMPLETED") {
            completed = true;
            break;
          }
          if (statusRes.data.payment.status === "CANCELLED") {
            handledOrdersRef.current.add(orderCode);
            Alert.alert("Đã hủy", "Thanh toán đã bị hủy.");
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }

        if (!completed) {
          Alert.alert("Đang xử lý", "Thanh toán đang được xác minh. Thử lại sau.");
          return;
        }

        handledOrdersRef.current.add(orderCode);
        const me = await authApi.getMe();
        updateUser(me.data.user);
        setSelectedRole(null);
        Alert.alert(
          "Thanh toán thành công",
          "Nâng cấp tài khoản thành công! Bạn có thể sử dụng đầy đủ tính năng ngay bây giờ.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/sv/profile_page" as any),
            },
          ],
        );
      } catch (err) {
        Alert.alert("Lỗi", getApiErrorMessage(err, "Không xác minh được thanh toán."));
      } finally {
        setVerifying(false);
      }
    },
    [router, updateUser],
  );

  useEffect(() => {
    const orderCode = params.orderCode ? String(params.orderCode) : "";
    if (!orderCode) return;

    void verifyPayment(
      orderCode,
      params.result === "cancel" ? "cancel" : "success",
    );
  }, [params.orderCode, params.result, verifyPayment]);

  const handleUpgrade = async (targetRole: RoleUpgradeTarget) => {
    if (isAlreadyUpgraded) {
      Alert.alert("Thông báo", "Tài khoản đã được nâng cấp.");
      return;
    }

    setLoadingRole(targetRole);
    try {
      const { returnUrl, cancelUrl } = buildUpgradePaymentReturnUrls();
      const res = await paymentApi.createRoleUpgradePayment({
        targetRole,
        returnUrl,
        cancelUrl,
      });
      const checkoutUrl = res.data.checkoutUrl;
      const orderCode = String(res.data.orderCode);
      if (!checkoutUrl) {
        throw new Error("Không nhận được link thanh toán.");
      }

      await WebBrowser.openBrowserAsync(checkoutUrl);

      if (!handledOrdersRef.current.has(orderCode)) {
        await verifyPayment(orderCode, "success");
      }
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không tạo được thanh toán."));
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Nâng cấp gói</Text>
          <View style={styles.iconButton} />
        </View>

        {verifying ? (
          <View style={styles.verifyingWrap}>
            <View style={styles.verifyingCard}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.verifyingTitle}>Đang xác minh thanh toán</Text>
              <Text style={styles.verifyingSub}>
                Vui lòng đợi trong giây lát...
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeIcon}>👑</Text>
                <Text style={styles.heroBadgeText}>UniNest Membership</Text>
              </View>
              <Text style={styles.heroTitle}>Mở khóa toàn bộ tính năng</Text>
              <Text style={styles.heroSub}>
                Chọn gói để xem chi tiết quyền lợi và bắt đầu sử dụng ngay.
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusLabel}>GÓI HIỆN TẠI</Text>
                <Text style={styles.statusValue}>{roleLabel(user?.role)}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  isAlreadyUpgraded ? styles.statusDotActive : styles.statusDotGuest,
                ]}
              />
            </View>

            {isAlreadyUpgraded ? (
              <View style={styles.upgradedBanner}>
                <Text style={styles.upgradedIcon}>🎉</Text>
                <View style={styles.upgradedTextWrap}>
                  <Text style={styles.upgradedTitle}>Tài khoản đã được nâng cấp</Text>
                  <Text style={styles.upgradedSub}>
                    Bạn đang sử dụng gói {roleLabel(user?.role)}.
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.cardsWrap}>
              {PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.role}
                  pkg={pkg}
                  disabled={loadingRole !== null || isAlreadyUpgraded}
                  onPress={() => setSelectedRole(pkg.role)}
                />
              ))}
            </View>

            <Text style={styles.footerNote}>
              Bấm vào từng gói để xem đầy đủ tính năng và hướng dẫn thanh toán.
            </Text>
          </ScrollView>
        )}

        <PackageDetailModal
          pkg={selectedPackage}
          visible={selectedRole !== null}
          loading={loadingRole === selectedRole}
          disabled={loadingRole !== null || isAlreadyUpgraded}
          onClose={() => setSelectedRole(null)}
          onUpgrade={() => {
            if (selectedRole) void handleUpgrade(selectedRole);
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  iconButtonPressed: {
    opacity: 0.85,
  },
  iconText: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  hero: {
    gap: 8,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF4E8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#F28C1B33",
  },
  heroBadgeIcon: {
    fontSize: 13,
  },
  heroBadgeText: {
    color: "#C96F0A",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  heroSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotGuest: {
    backgroundColor: "#D4C9BA",
  },
  statusDotActive: {
    backgroundColor: "#4CAF50",
  },
  upgradedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.successBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  upgradedIcon: {
    fontSize: 22,
  },
  upgradedTextWrap: {
    flex: 1,
    gap: 2,
  },
  upgradedTitle: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: "700",
  },
  upgradedSub: {
    color: "#558B2F",
    fontSize: 13,
    lineHeight: 19,
  },
  cardsWrap: {
    gap: 12,
  },
  cardPressable: {
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardInner: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardTopText: {
    flex: 1,
    gap: 2,
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  featureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureBullet: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
    width: 16,
  },
  featureText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  detailCta: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailCtaText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalScreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  modalHero: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  modalAccentBar: {
    height: 4,
    width: "100%",
  },
  modalHeroBody: {
    padding: 16,
    gap: 6,
  },
  modalHeroTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  modalHeroText: {
    flex: 1,
    gap: 2,
  },
  modalHeroTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  priceNote: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  modalSummary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailFeatureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
  },
  detailFeatureTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  detailFeatureDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  bulletCheckMark: {
    color: "#4CAF50",
    fontSize: 11,
    fontWeight: "800",
  },
  bulletInfo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF4E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  bulletInfoMark: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  bulletText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletMuted: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 2,
  },
  modalPayInfo: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  payHintIcon: {
    fontSize: 16,
  },
  modalPayInfoText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  modalPayButton: {
    backgroundColor: "#2F261A",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalPayButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  upgradeButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeButtonDisabled: {
    opacity: 0.55,
  },
  upgradeButtonPressed: {
    opacity: 0.88,
  },
  upgradeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerNote: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  verifyingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  verifyingCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifyingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  verifyingSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
