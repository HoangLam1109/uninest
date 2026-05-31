import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomTab = "home" | "explore" | "saved" | "messages" | "profile";

export function BottomNavigation({ activeTab }: { activeTab: BottomTab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <NavItem
        label="Trang chủ"
        icon="home"
        active={activeTab === "home"}
        onPress={() => router.push("/" as any)}
      />
      <NavItem
        label="Khám phá"
        icon="compass"
        active={activeTab === "explore"}
        onPress={() => router.push("/search_page" as any)}
      />
      <NavItem
        label="Đã lưu"
        icon="heart"
        active={activeTab === "saved"}
        onPress={() => router.push("/saved_page" as any)}
      />
      <NavItem
        label="Tin nhắn"
        icon="message"
        active={activeTab === "messages"}
      />
      <NavItem
        label="Cá nhân"
        icon="person"
        active={activeTab === "profile"}
        onPress={() => router.push("/profile_page" as any)}
      />
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: "home" | "compass" | "heart" | "message" | "person";
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const color = active ? "#F28C1B" : "#98A0AB";

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.iconWrap}>
        <NavIcon icon={icon} color={color} active={active} />
      </View>
      <Text
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NavIcon({
  icon,
  color,
  active,
}: {
  icon: "home" | "compass" | "heart" | "message" | "person";
  color: string;
  active?: boolean;
}) {
  if (icon === "home") {
    return (
      <View style={styles.homeIcon}>
        <View style={[styles.homeRoof, { borderBottomColor: color }]} />
        <View style={[styles.homeBody, { borderColor: color }]} />
      </View>
    );
  }

  if (icon === "compass") {
    return (
      <View style={[styles.compassIcon, { borderColor: color }]}>
        <View style={[styles.compassNeedle, { backgroundColor: color }]} />
      </View>
    );
  }

  if (icon === "heart") {
    return (
      <Text style={[styles.heartIcon, { color }]}>{active ? "♥" : "♡"}</Text>
    );
  }

  if (icon === "message") {
    return (
      <View style={[styles.messageIcon, { borderColor: color }]}>
        <View style={[styles.messageTail, { borderTopColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.personIcon}>
      <View style={[styles.personHead, { borderColor: color }]} />
      <View style={[styles.personBody, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E2DA",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  iconWrap: {
    height: 26,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  label: {
    width: "100%",
    fontSize: 9,
    lineHeight: 11,
    textAlign: "center",
    color: "#98A0AB",
    fontWeight: "700",
    includeFontPadding: false,
  },
  labelActive: {
    color: "#F28C1B",
  },
  homeIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderStyle: "solid",
  },
  homeBody: {
    width: 14,
    height: 10,
    marginTop: -1,
    borderWidth: 2,
    borderRadius: 1,
    backgroundColor: "transparent",
  },
  compassIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  compassNeedle: {
    width: 8,
    height: 8,
    transform: [{ rotate: "45deg" }],
  },
  heartIcon: {
    fontSize: 23,
    lineHeight: 24,
    textAlign: "center",
  },
  messageIcon: {
    width: 24,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  messageTail: {
    position: "absolute",
    left: 2,
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderStyle: "solid",
  },
  personIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  personHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    marginBottom: 2,
  },
  personBody: {
    width: 18,
    height: 8,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
});
