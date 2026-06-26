import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type LandlordTab =
  | "home"
  | "rooms"
  | "bookings"
  | "tenants"
  | "reports"
  | "profile";

const TAB_ROUTES: Partial<Record<LandlordTab, string>> = {
  home: "/landlord/home_page",
  rooms: "/landlord/rooms_page",
  bookings: "/landlord/bookings_page",
  tenants: "/landlord/tenants_page",
  reports: "/landlord/invoices_page",
  profile: "/landlord/profile_page",
};

export function LandlordBottomNavigation({
  activeTab,
}: {
  activeTab: LandlordTab;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const items: { id: LandlordTab; label: string; icon: string }[] = [
    { id: "home", label: "Trang chủ", icon: "▦" },
    { id: "rooms", label: "Phòng", icon: "🛏" },
    { id: "bookings", label: "Đặt phòng", icon: "📅" },
    { id: "tenants", label: "Người thuê", icon: "👥" },
    { id: "reports", label: "Báo cáo", icon: "🧾" },
    { id: "profile", label: "Hồ sơ", icon: "👤" },
  ];

  const handlePress = (tab: LandlordTab) => {
    const route = TAB_ROUTES[tab];
    if (route) {
      router.replace(route as any);
    }
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {items.map((item) => {
        const active = activeTab === item.id;
        return (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => handlePress(item.id)}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>
              {item.icon}
            </Text>
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E2D8",
    paddingTop: 10,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  icon: {
    fontSize: 20,
    color: "#9AA3B2",
  },
  iconActive: {
    color: "#E68A2E",
  },
  label: {
    fontSize: 8,
    fontWeight: "700",
    color: "#9AA3B2",
    textAlign: "center",
  },
  labelActive: {
    color: "#E68A2E",
  },
});
