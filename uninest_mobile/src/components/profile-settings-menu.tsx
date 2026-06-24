import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";

export type ProfileSettingsItemId =
  | "personal"
  | "rooms"
  | "invoices"
  | "contracts"
  | "meter"
  | "identity"
  | "upgrade"
  | "landlord"
  | "logout";

type MenuItem = {
  id: ProfileSettingsItemId;
  label: string;
  icon: string;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "personal", label: "Hồ sơ cá nhân", icon: "👤" },
  { id: "rooms", label: "Đặt phòng", icon: "🏠" },
  { id: "invoices", label: "Hóa đơn", icon: "🧾" },
  { id: "contracts", label: "Hợp đồng", icon: "📄" },
  { id: "meter", label: "Chỉ số điện nước", icon: "⚡" },
  { id: "identity", label: "Xác minh danh tính", icon: "🪪" },
  { id: "upgrade", label: "Nâng cấp gói", icon: "⭐" },
  { id: "landlord", label: "Làm chủ nhà", icon: "🏢" },
  { id: "logout", label: "Đăng xuất", icon: "↪", danger: true },
];

type ProfileSettingsMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: ProfileSettingsItemId) => void;
};

export function ProfileSettingsMenu({
  visible,
  onClose,
  onSelect,
}: ProfileSettingsMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.sheetHandle} />
          <ThemedText type="smallBold" style={styles.sheetTitle}>
            Cài đặt
          </ThemedText>

          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  style={styles.menuRow}
                  onPress={() => onSelect(item.id)}
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

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <ThemedText type="smallBold" style={styles.cancelText}>
              Đóng
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropPress: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(47, 38, 26, 0.45)",
  },
  sheet: {
    backgroundColor: "#F5EFE6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D8CEC0",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    color: "#2F261A",
    marginBottom: 14,
    textAlign: "center",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
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
    color: "#2F261A",
    fontSize: 16,
  },
  menuLabelDanger: {
    color: "#D14343",
  },
  chevron: {
    fontSize: 22,
    color: "#C5B8A8",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBE4",
    marginLeft: 70,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#8A7B68",
    fontSize: 15,
  },
});
