import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  TENANT_PACKAGE_PRICE,
  UPGRADE_FEATURES,
  type UpgradeFeatureKey,
} from "@/constants/upgrade-features";
import { isGuestUser, isLandlordUser } from "@/utils/tenant-access";

type UpgradeRequiredPromptProps = {
  visible: boolean;
  feature: UpgradeFeatureKey;
  userRole?: string | null;
  onClose: () => void;
  onUpgrade: () => void;
};

export function UpgradeRequiredPrompt({
  visible,
  feature,
  userRole,
  onClose,
  onUpgrade,
}: UpgradeRequiredPromptProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const config = UPGRADE_FEATURES[feature];
  const canUpgrade = isGuestUser(userRole);
  const isLandlord = isLandlordUser(userRole);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>

          <Text style={styles.title}>
            {isLandlord ? "Tính năng dành cho người thuê" : config.title}
          </Text>

          <Text style={styles.description}>
            {isLandlord
              ? "Tài khoản Chủ nhà không thể sử dụng tính năng này. Hãy dùng tài khoản Người thuê nếu bạn muốn thuê phòng."
              : config.description}
          </Text>

          {!isLandlord ? (
            <>
              <View style={styles.benefitsWrap}>
                {config.benefits.map((item) => (
                  <View key={item} style={styles.benefitRow}>
                    <View style={styles.benefitCheck}>
                      <Text style={styles.benefitCheckMark}>✓</Text>
                    </View>
                    <Text style={styles.benefitText}>{item}</Text>
                  </View>
                ))}
              </View>

              {canUpgrade ? (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Gói Người thuê</Text>
                  <Text style={styles.priceValue}>{TENANT_PACKAGE_PRICE}</Text>
                  <Text style={styles.priceNote}>/ tháng</Text>
                </View>
              ) : null}
            </>
          ) : null}

          <View style={styles.footer}>
            {canUpgrade ? (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.laterButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={onClose}
                  hitSlop={8}
                >
                  <Text style={styles.laterButtonText}>Để sau</Text>
                </Pressable>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onUpgrade}
                  style={styles.upgradeButton}
                >
                  <Text style={styles.upgradeButtonText}>Nâng cấp ngay!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.laterButton,
                  styles.laterButtonCentered,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.laterButtonText}>Đã hiểu</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(47, 38, 26, 0.45)",
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    borderBottomWidth: 0,
    zIndex: 2,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D4C9BA",
    marginBottom: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFF4E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    color: "#2F261A",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 8,
  },
  description: {
    color: "#6B5E4D",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  benefitsWrap: {
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF4E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  benefitCheckMark: {
    color: "#F28C1B",
    fontSize: 12,
    fontWeight: "800",
  },
  benefitText: {
    flex: 1,
    color: "#4A4034",
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F5EFE6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  priceLabel: {
    color: "#8A7B68",
    fontSize: 13,
    flex: 1,
    marginRight: 6,
  },
  priceValue: {
    color: "#F28C1B",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 4,
  },
  priceNote: {
    color: "#8A7B68",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 8,
    minHeight: 48,
  },
  laterButton: {
    paddingVertical: 12,
    paddingRight: 8,
  },
  laterButtonCentered: {
    flex: 1,
    alignItems: "center",
  },
  laterButtonText: {
    color: "#6B5E4D",
    fontSize: 15,
    fontWeight: "700",
  },
  upgradeButton: {
    backgroundColor: "#F28C1B",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    minWidth: 148,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
