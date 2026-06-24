import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { useLogout } from "@/hooks/use-logout";

type SettingsItem = {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
};

const MENU_ITEMS: SettingsItem[] = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: "👤" },
  { id: "contracts", label: "Hợp đồng", icon: "📄" },
  { id: "messages", label: "Tin nhắn", icon: "💬" },
  { id: "invoices", label: "Hóa đơn", icon: "🧾" },
  { id: "properties", label: "Căn hộ", icon: "🏠" },
  { id: "upgrade", label: "Nâng cấp gói Chủ nhà", icon: "👑" },
  { id: "logout", label: "Đăng xuất", icon: "↪", danger: true },
];

export default function LandlordSettingsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useLogout();

  const handlePress = (item: SettingsItem) => {
    if (item.id === "logout") {
      logout();
      return;
    }

    if (item.id === "profile") {
      router.push("/landlord/profile_page" as any);
      return;
    }

    if (item.id === "contracts") {
      router.push("/landlord/contracts_page" as any);
      return;
    }

    if (item.id === "messages") {
      router.push("/landlord/messages_page" as any);
      return;
    }

    if (item.id === "upgrade") {
      router.push("/sv/upgrade_package_page" as any);
      return;
    }

    if (item.id === "invoices") {
      router.push("/landlord/invoices_page" as any);
      return;
    }

    if (item.id === "properties") {
      router.push("/landlord/rooms_page" as any);
      return;
    }

    Alert.alert(item.label, "Tính năng đang được phát triển.");
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Cài đặt
          </ThemedText>
          <ThemedText type="small" style={styles.headerSubtitle}>
            Quản lý tài khoản & hệ thống
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  style={styles.menuRow}
                  onPress={() => handlePress(item)}
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      item.danger && styles.menuIconWrapDanger,
                    ]}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.menuLabel,
                      item.danger && styles.menuLabelDanger,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
                {index < MENU_ITEMS.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>

        <LandlordBottomNavigation activeTab="settings" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    color: "#1F2940",
  },
  headerSubtitle: {
    color: "#9AA3B2",
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE8DF",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconWrapDanger: {
    backgroundColor: "#FDECEC",
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    flex: 1,
    color: "#1F2940",
    fontSize: 16,
  },
  menuLabelDanger: {
    color: "#D14343",
  },
  chevron: {
    fontSize: 22,
    color: "#C5CCD6",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBE3",
    marginLeft: 70,
  },
});
