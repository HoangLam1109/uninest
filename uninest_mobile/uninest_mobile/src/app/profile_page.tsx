import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { formatVnd } from "../constants/properties";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </Pressable>

          <ThemedText type="title" style={styles.pageTitle}>
            Hồ sơ của tôi
          </ThemedText>

          <Pressable style={styles.headerButton}>
            <Text style={styles.headerIcon}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarFace}>👨🏻</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>⚙</Text>
            </View>
          </View>

          <ThemedText type="title" style={styles.name}>
            Anh Tuấn
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Đại học Bách Khoa TP.HCM • Sinh viên năm 2
          </ThemedText>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>GHÉP ĐÔI ĐÃ XÁC THỰC AI</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value="3" label="ĐÃ NỘP" />
          <StatCard value="12" label="ĐÃ LƯU" />
          <StatCard value="5" label="GỢI Ý" />
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Đơn đăng ký của tôi
          </ThemedText>
          <Pressable>
            <ThemedText type="smallBold" style={styles.linkText}>
              Xem tất cả
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.applicationCard}>
          <Image
            source={require("../../assets/images/1.png")}
            style={styles.applicationThumb}
            contentFit="cover"
          />
          <View style={styles.applicationBody}>
            <ThemedText type="smallBold" style={styles.applicationTitle}>
              Ký túc xá Bách Khoa
            </ThemedText>
            <ThemedText type="small" style={styles.applicationMeta}>
              Đã nộp 3 ngày trước
            </ThemedText>
          </View>
          <View style={styles.pendingPill}>
            <Text style={styles.pendingText}>CHỜ DUYỆT</Text>
          </View>
        </View>

        <View style={styles.applicationCard}>
          <Image
            source={require("../../assets/images/2.png")}
            style={styles.applicationThumbTwo}
            contentFit="cover"
          />
          <View style={styles.applicationBody}>
            <ThemedText type="smallBold" style={styles.applicationTitle}>
              Căn hộ dịch vụ Quận 10
            </ThemedText>
            <ThemedText type="small" style={styles.applicationMeta}>
              Đã nộp 1 tuần trước
            </ThemedText>
          </View>
          <View style={styles.approvedPill}>
            <Text style={styles.approvedText}>ĐÃ CHẤP NHẬN</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <ThemedText type="title" style={styles.settingsTitle}>
              ⚡ Cài đặt Ghép đôi Thông minh
            </ThemedText>
            <Text style={styles.settingsWatermark}>⚙</Text>
          </View>

          <View style={styles.settingsGrid}>
            <SettingItem label="NGÂN SÁCH" value="20.000.000đ" />
            <SettingItem label="KHÔNG KHÍ" value="Hòa đồng & Thoải mái" />
            <SettingItem label="KHOẢNG CÁCH" value="< 15 phút đi bộ" />
            <SettingItem label="BẠN CÙNG PHÒNG" value="Chỉ sinh viên" />
          </View>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Cập nhật cài đặt</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Tin đã lưu
          </ThemedText>
          <Pressable>
            <ThemedText type="smallBold" style={styles.linkText}>
              Xem tất cả (12)
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.savedRow}>
            <SavedMiniCard
              title="Căn hộ Cao cấp Quận 1"
              price={formatVnd(9000000)}
              imageSource={require("../../assets/images/7.png")}
            />
            <SavedMiniCard
              title="Nhà phố Cách Mạng Tháng 8"
              price={formatVnd(5500000)}
              imageSource={require("../../assets/images/8.png")}
            />
            <SavedMiniCard
              title="Phòng Studio Quận 7"
              price={formatVnd(7200000)}
              imageSource={require("../../assets/images/5.png")}
            />
          </View>
        </ScrollView>
      </ScrollView>

      <BottomNavigation activeTab="profile" />
    </ThemedView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <ThemedText type="smallBold" style={styles.settingValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function SavedMiniCard({
  title,
  price,
  imageSource,
}: {
  title: string;
  price: string;
  imageSource?: any;
}) {
  return (
    <View style={styles.savedCard}>
      <View style={styles.savedImage}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.savedImageInner}
            contentFit="cover"
          />
        ) : (
          <>
            <View style={styles.savedCurtain} />
            <View style={styles.savedTV} />
            <View style={styles.savedTable} />
          </>
        )}
      </View>
      <ThemedText type="smallBold" style={styles.savedTitle} numberOfLines={1}>
        {title}
      </ThemedText>
      <Text style={styles.savedPrice}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5EFE4",
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 22,
    color: "#514132",
    fontWeight: "700",
  },
  pageTitle: {
    fontSize: 24,
    color: "#4A3A2C",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarWrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarFace: {
    fontSize: 52,
  },
  avatarBadge: {
    position: "absolute",
    right: 8,
    bottom: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F5EFE4",
  },
  avatarBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    fontSize: 26,
    color: "#4A3A2C",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9A845F",
    textAlign: "center",
  },
  aiBadge: {
    marginTop: 12,
    backgroundColor: "#F6E8D2",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  aiBadgeText: {
    color: "#E28A21",
    fontSize: 11,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    color: "#E28A21",
    lineHeight: 24,
  },
  statLabel: {
    marginTop: 2,
    color: "#9A845F",
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 19,
    color: "#4A3A2C",
  },
  linkText: {
    color: "#E28A21",
  },
  applicationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  applicationThumb: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#E4E9EF",
    marginRight: 12,
  },
  applicationThumbTwo: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#E6EEE0",
    marginRight: 12,
  },
  applicationBody: {
    flex: 1,
  },
  applicationTitle: {
    color: "#4A3A2C",
    fontSize: 15,
  },
  applicationMeta: {
    color: "#A18C6A",
    marginTop: 3,
  },
  pendingPill: {
    backgroundColor: "#F6EAB0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: {
    color: "#A18B2E",
    fontSize: 11,
    fontWeight: "800",
  },
  approvedPill: {
    backgroundColor: "#DDF0D4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  approvedText: {
    color: "#5D9158",
    fontSize: 11,
    fontWeight: "800",
  },
  settingsCard: {
    marginTop: 16,
    backgroundColor: "#F6EED9",
    borderColor: "#E7C88E",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  settingsHeader: {
    marginBottom: 14,
    position: "relative",
  },
  settingsTitle: {
    fontSize: 18,
    color: "#4A3A2C",
    paddingRight: 24,
  },
  settingsWatermark: {
    position: "absolute",
    right: 0,
    top: -2,
    fontSize: 42,
    color: "rgba(228, 138, 33, 0.12)",
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  settingItem: {
    width: "48%",
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9A845F",
    marginBottom: 4,
  },
  settingValue: {
    color: "#4A3A2C",
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#F28C1B",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  savedRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
  },
  savedCard: {
    width: 150,
  },
  savedImage: {
    height: 102,
    borderRadius: 14,
    backgroundColor: "#DCCFBF",
    marginBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  savedImageInner: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  savedCurtain: {
    position: "absolute",
    left: 12,
    top: 15,
    width: 24,
    height: 64,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  savedTV: {
    position: "absolute",
    right: 14,
    top: 34,
    width: 44,
    height: 34,
    borderRadius: 5,
    backgroundColor: "#C78A41",
  },
  savedTable: {
    position: "absolute",
    left: 47,
    bottom: 12,
    width: 56,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  savedTitle: {
    color: "#4A3A2C",
    fontSize: 12,
    marginBottom: 2,
  },
  savedPrice: {
    color: "#E28A21",
    fontSize: 11,
    fontWeight: "800",
  },
});
