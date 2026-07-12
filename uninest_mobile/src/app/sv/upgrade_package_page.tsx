import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
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
import { servicePackageApi } from "@/api/service-package.api";
import { serviceSubscriptionApi } from "@/api/service-subscription.api";
import { useAuth } from "@/context/auth-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ServicePackage } from "@/types/service-package";
import {
  formatServicePackagePrice,
  getPackageVisual,
  getServicePackageFeatureList,
  sortServicePackages,
} from "@/utils/service-package-display";

const COLORS = {
  bg: "#F5EFE6",
  card: "#FFFFFF",
  text: "#2F261A",
  textSecondary: "#6B5E4D",
  textMuted: "#8A7B68",
  border: "#E8E1D8",
  primary: "#F28C1B",
  success: "#2E7D32",
  successBg: "#E8F5E9",
};

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
  pkg: ServicePackage;
  disabled: boolean;
  onPress: () => void;
}) {
  const visual = getPackageVisual(pkg.targetRole);
  const features = getServicePackageFeatureList(pkg).slice(0, 4);

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
      <View style={[styles.cardInner, { borderLeftColor: visual.accent }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: visual.accentSoft }]}>
            <Text style={styles.iconEmoji}>{visual.icon}</Text>
          </View>
          <View style={styles.cardTopText}>
            {"recommended" in visual && visual.recommended ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Phổ biến nhất</Text>
              </View>
            ) : null}
            <Text style={styles.eyebrow}>{visual.eyebrow}</Text>
            <Text style={styles.cardTitle}>{pkg.name}</Text>
            <Text style={[styles.cardPrice, { color: visual.accent }]}>
              {formatServicePackagePrice(pkg.price)}
            </Text>
            <Text style={styles.durationNote}>{pkg.durationDays} ngày</Text>
          </View>
        </View>

        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={[styles.featureBullet, { color: visual.accent }]}>
                ✓
              </Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.detailCta, { backgroundColor: visual.accentSoft }]}>
          <Text style={[styles.detailCtaText, { color: visual.accent }]}>
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
  onSubscribe,
}: {
  pkg: ServicePackage | null;
  visible: boolean;
  loading: boolean;
  disabled: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!pkg) return null;

  const visual = getPackageVisual(pkg.targetRole);
  const features = getServicePackageFeatureList(pkg);
  const priceLabel = formatServicePackagePrice(pkg.price);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalScreen}>
        <SafeAreaView style={styles.modalSafeArea} edges={["left", "right"]}>
          <View
            style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}
          >
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
              <View
                style={[styles.modalAccentBar, { backgroundColor: visual.accent }]}
              />
              <View style={styles.modalHeroBody}>
                <View style={styles.modalHeroTop}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: visual.accentSoft },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{visual.icon}</Text>
                  </View>
                  <View style={styles.modalHeroText}>
                    <Text style={styles.eyebrow}>{visual.eyebrow}</Text>
                    <Text style={styles.modalHeroTitle}>{pkg.name}</Text>
                  </View>
                </View>
                <Text style={[styles.modalPrice, { color: visual.accent }]}>
                  {priceLabel}
                </Text>
                <Text style={styles.priceNote}>
                  Thanh toán một lần · hiệu lực {pkg.durationDays} ngày
                </Text>
                {pkg.description ? (
                  <Text style={styles.modalSummary}>{pkg.description}</Text>
                ) : null}
                {pkg.maxRooms ? (
                  <Text style={styles.maxRooms}>
                    Tối đa {pkg.maxRooms} phòng
                  </Text>
                ) : null}
              </View>
            </View>

            <DetailSection title="Tính năng bao gồm">
              {features.map((feature) => (
                <View key={feature} style={styles.bulletRow}>
                  <View style={styles.bulletCheck}>
                    <Text style={styles.bulletCheckMark}>✓</Text>
                  </View>
                  <Text style={styles.bulletText}>{feature}</Text>
                </View>
              ))}
            </DetailSection>

            <DetailSection title="Quy trình thanh toán">
              {[
                "Chọn gói và bấm đăng ký",
                "Hoàn tất thanh toán trên cổng PayOS",
                "Quay lại app — tài khoản được nâng cấp tự động",
                "Bắt đầu sử dụng đầy đủ tính năng của gói",
              ].map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View
                    style={[styles.stepIndex, { backgroundColor: visual.accent }]}
                  >
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
                tử. Gói có hiệu lực {pkg.durationDays} ngày theo cấu hình hệ
                thống.
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
              onPress={onSubscribe}
              disabled={disabled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPayButtonText}>
                  Đăng ký gói · {priceLabel}
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
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null,
  );
  const handledOrdersRef = useRef<Set<string>>(new Set());

  const isAlreadyUpgraded = Boolean(user?.role && user.role !== "GUEST");

  const loadPackages = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await servicePackageApi.listActive({ page: 1, limit: 50 });
      setPackages(sortServicePackages(res.data ?? []));
    } catch (err) {
      setPackages([]);
      setLoadError(
        getApiErrorMessage(err, "Không tải được danh sách gói dịch vụ."),
      );
    }
  }, []);

  useEffect(() => {
    setLoadingPackages(true);
    void loadPackages().finally(() => setLoadingPackages(false));
  }, [loadPackages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

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
          Alert.alert(
            "Đang xử lý",
            "Thanh toán đang được xác minh. Thử lại sau.",
          );
          return;
        }

        handledOrdersRef.current.add(orderCode);
        const me = await authApi.getMe();
        updateUser(me.data.user);
        setSelectedPackage(null);
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
        Alert.alert(
          "Lỗi",
          getApiErrorMessage(err, "Không xác minh được thanh toán."),
        );
      } finally {
        setVerifying(false);
      }
    },
    [router, updateUser],
  );

  useEffect(() => {
    const orderCode = params.orderCode ? String(params.orderCode) : "";
    if (!orderCode) return;

    router.replace({
      pathname: "/sv/payment_result_page",
      params: {
        orderCode,
        result: params.result === "cancel" ? "cancel" : "success",
      },
    } as any);
  }, [params.orderCode, params.result, router]);

  const handleSubscribe = async (pkg: ServicePackage) => {
    if (isAlreadyUpgraded) {
      Alert.alert("Thông báo", "Tài khoản đã được nâng cấp.");
      return;
    }

    setSubscribingId(pkg._id);
    try {
      const res = await serviceSubscriptionApi.subscribe(pkg._id, {
        method: "PAYOS",
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
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không đăng ký được gói."));
    } finally {
      setSubscribingId(null);
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void handleRefresh()}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>UNINEST MEMBERSHIP</Text>
              <Text style={styles.heroTitle}>
                Chọn gói phù hợp với nhu cầu của bạn
              </Text>
              <Text style={styles.heroSub}>
                Giá và quyền lợi được lấy trực tiếp từ hệ thống, giống trên
                website UniNest.
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusLabel}>VAI TRÒ HIỆN TẠI</Text>
                <Text style={styles.statusValue}>{roleLabel(user?.role)}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  isAlreadyUpgraded
                    ? styles.statusDotActive
                    : styles.statusDotGuest,
                ]}
              />
            </View>

            {isAlreadyUpgraded ? (
              <View style={styles.upgradedBanner}>
                <Text style={styles.upgradedIcon}>🎉</Text>
                <View style={styles.upgradedTextWrap}>
                  <Text style={styles.upgradedTitle}>
                    Tài khoản đã được nâng cấp
                  </Text>
                  <Text style={styles.upgradedSub}>
                    Bạn đang sử dụng gói {roleLabel(user?.role)}.
                  </Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.sectionHint}>
              Bấm vào từng gói để xem đầy đủ tính năng và đăng ký thanh toán.
            </Text>

            {loadingPackages ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 24 }}
                size="large"
              />
            ) : null}

            {loadError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{loadError}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => void handleRefresh()}
                >
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </Pressable>
              </View>
            ) : null}

            {!loadingPackages && !loadError && packages.length === 0 ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  Hiện chưa có gói dịch vụ nào đang mở bán.
                </Text>
              </View>
            ) : null}

            <View style={styles.cardsWrap}>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  disabled={isAlreadyUpgraded}
                  onPress={() => setSelectedPackage(pkg)}
                />
              ))}
            </View>
          </ScrollView>
        )}

        <PackageDetailModal
          pkg={selectedPackage}
          visible={Boolean(selectedPackage)}
          loading={Boolean(
            selectedPackage && subscribingId === selectedPackage._id,
          )}
          disabled={isAlreadyUpgraded}
          onClose={() => setSelectedPackage(null)}
          onSubscribe={() => {
            if (selectedPackage) {
              void handleSubscribe(selectedPackage);
            }
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
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  iconText: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  heroEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  heroSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
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
  sectionHint: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  durationNote: {
    color: COLORS.textMuted,
    fontSize: 12,
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
  },
  priceNote: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  modalSummary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  maxRooms: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  detailSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  detailSectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  bulletCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF4E8",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletCheckMark: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  bulletText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  modalPayInfo: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
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
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPayButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  upgradeButtonDisabled: {
    opacity: 0.55,
  },
  verifyingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  verifyingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
  },
  verifyingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  verifyingSub: {
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
