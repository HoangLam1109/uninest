import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getMembershipPlanDisplay,
  type MembershipStatusTone,
} from "@/utils/membership-display";

type MembershipPlanCardProps = {
  role?: string | null;
  roleExpiresAt?: string | null;
  onPress?: () => void;
};

function statusStyle(tone: MembershipStatusTone) {
  switch (tone) {
    case "active":
      return styles.statusActive;
    case "expired":
      return styles.statusExpired;
    default:
      return styles.statusFree;
  }
}

function statusTextStyle(tone: MembershipStatusTone) {
  switch (tone) {
    case "active":
      return styles.statusActiveText;
    case "expired":
      return styles.statusExpiredText;
    default:
      return styles.statusFreeText;
  }
}

export function MembershipPlanCard({
  role,
  roleExpiresAt,
  onPress,
}: MembershipPlanCardProps) {
  const plan = getMembershipPlanDisplay(role, roleExpiresAt);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={styles.wrap}
    >
      <View style={[styles.card, { backgroundColor: plan.accentSoft }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: plan.accent }]}>
            <Text style={styles.icon}>{plan.icon}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.eyebrow}>Gói hiện tại</Text>
            <Text style={styles.title}>{plan.title}</Text>
            {plan.priceLabel ? (
              <Text style={styles.price}>{plan.priceLabel}</Text>
            ) : null}
          </View>

          <View style={[styles.statusBadge, statusStyle(plan.statusTone)]}>
            <Text style={[styles.statusText, statusTextStyle(plan.statusTone)]}>
              {plan.statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{plan.subtitle}</Text>

        {plan.expiryText ? (
          <Text style={styles.expiry}>{plan.expiryText}</Text>
        ) : null}

        {onPress ? (
          <View style={[styles.actionRow, { borderColor: plan.accent }]}>
            <Text style={[styles.actionText, { color: plan.accent }]}>
              {plan.actionLabel}
            </Text>
            <Text style={[styles.actionArrow, { color: plan.accent }]}>→</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    paddingTop: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A7B68",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: "#2F261A",
  },
  price: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B5E4D",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusActive: {
    backgroundColor: "#E8F5E9",
  },
  statusExpired: {
    backgroundColor: "#FFEBEE",
  },
  statusFree: {
    backgroundColor: "#FFFFFF",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusActiveText: {
    color: "#2E7D32",
  },
  statusExpiredText: {
    color: "#C62828",
  },
  statusFreeText: {
    color: "#8A7B68",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B5E4D",
  },
  expiry: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#8A7B68",
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionArrow: {
    fontSize: 16,
    fontWeight: "700",
  },
});
