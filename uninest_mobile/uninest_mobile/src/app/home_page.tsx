import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/use-theme";

export default function HomePage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const goToLogin = () => {
    try {
      console.log("goToLogin: navigating to /login_page");
      router.push("/login_page" as any);
    } catch (err) {
      console.warn("Navigation failed:", err);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header (sticky) */}
        <View style={[styles.headerContainer, { top: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.leftGroup}>
              <View style={styles.logoBox}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.logoImage}
                />
              </View>
              <ThemedText type="smallBold" style={styles.brand}>
                UniNest
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.cta} onPress={goToLogin}>
              <ThemedText type="smallBold" style={styles.ctaText}>
                Bắt đầu ngay
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.safeArea,
            { paddingTop: insets.top + 80, paddingBottom: 140 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroText}>
            <ThemedText type="small" style={styles.badge}>
              #1 Nền tảng sinh viên tin cậy
            </ThemedText>

            <ThemedText type="title" style={styles.title}>
              Tìm ngôi nhà{"\n"}
              <ThemedText style={[styles.title, { color: "#e38b2f" }]}>
                ngôi nhà
              </ThemedText>{" "}
              của bạn
            </ThemedText>

            <ThemedText type="small" style={styles.subtitle}>
              Giá rẻ, uy tín và gần trường học. Khám phá nhà ở được thiết kế
              riêng cho cuộc sống đại học và ngân sách của bạn.
            </ThemedText>
          </View>

          <View
            style={[
              styles.searchCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <View style={styles.inputRow}>
              <ThemedText type="small" style={styles.inputIcon}>
                📍
              </ThemedText>
              <TextInput
                placeholder="Nhập tên trường hoặc khu vực"
                style={styles.textInput}
              />
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.selectRow}>
                <ThemedText type="small" style={styles.inputIcon}>
                  💰
                </ThemedText>
                <ThemedText type="small">Khoảng giá</ThemedText>
              </View>
              <View style={styles.selectRow}>
                <ThemedText type="small" style={styles.inputIcon}>
                  🛏️
                </ThemedText>
                <ThemedText type="small">Loại phòng</ThemedText>
              </View>
            </View>

            <TouchableOpacity style={styles.searchButton}>
              <ThemedText type="smallBold" style={styles.searchButtonText}>
                Tìm kiếm
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../assets/images/tutorial-web.png")}
            style={styles.heroImage}
          />

          <View style={styles.featuresSection}>
            <ThemedText type="subtitle" style={styles.featuresTitle}>
              Tại sao sinh viên chọn UniNest
            </ThemedText>
            <ThemedText type="small" style={styles.featuresSubtitle}>
              Chúng tôi đơn giản hóa việc tìm kiếm nhà ở để bạn có thể tập trung
              vào những điều quan trọng nhất: việc học và trải nghiệm đại học.
            </ThemedText>

            <View style={styles.cardsContainer}>
              <View
                style={[
                  styles.featureCard,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <View style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <ThemedText>🔒</ThemedText>
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText type="smallBold" style={styles.featureTitle}>
                      Nhà ở tin cậy
                    </ThemedText>
                    <ThemedText type="small" style={styles.featureDesc}>
                      Mọi bất động sản và chủ nhà đều được đội ngũ của chúng tôi
                      xác minh thủ công để đảm bảo an toàn cho bạn.
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.featureCard,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <View style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <ThemedText>🗺️</ThemedText>
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText type="smallBold" style={styles.featureTitle}>
                      Gần trường học
                    </ThemedText>
                    <ThemedText type="small" style={styles.featureDesc}>
                      Chúng tôi lập bản đồ mọi tin đăng so với trường đại học
                      của bạn.
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.featureCard,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <View style={styles.featureRow}>
                  <View style={styles.featureIconBox}>
                    <ThemedText>🤝</ThemedText>
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText type="smallBold" style={styles.featureTitle}>
                      Hỗ trợ sinh viên
                    </ThemedText>
                    <ThemedText type="small" style={styles.featureDesc}>
                      Đội ngũ hỗ trợ tận tâm của chúng tôi giúp bạn xử lý hợp
                      đồng và dọn vào ở.
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.listingsSection}>
            <ThemedText type="subtitle" style={styles.listingsTitle}>
              Căn hộ sinh viên tiêu biểu
            </ThemedText>
            <ThemedText type="small" style={styles.listingsSubtitle}>
              Bất động sản được chọn lọc kỹ lưỡng gần các trường đại học hàng
              đầu
            </ThemedText>

            <View style={styles.listingsContainer}>
              <View style={styles.listingCard}>
                <Image
                  source={require("../../assets/images/tutorial-web.png")}
                  style={styles.listingImage}
                />
                <View style={styles.listingBody}>
                  <ThemedText type="smallBold" style={styles.listingTitle}>
                    Căn hộ The Scholar - Quận 1
                  </ThemedText>
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.price}>15.000.000</ThemedText>
                    <ThemedText type="small" style={{ marginLeft: 6 }}>
                      /tháng
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.listingLocation}>
                    5 phút đi bộ đến ĐH KHXH&NV
                  </ThemedText>

                  <View style={styles.metaRow}>
                    <ThemedText type="small">1 PN</ThemedText>
                    <ThemedText type="small" style={styles.metaItem}>
                      1 PT
                    </ThemedText>
                    <ThemedText type="small" style={styles.metaItem}>
                      WiFi miễn phí
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.listingCard}>
                <Image
                  source={require("../../assets/images/tutorial-web.png")}
                  style={styles.listingImage}
                />
                <View style={styles.listingBody}>
                  <ThemedText type="smallBold" style={styles.listingTitle}>
                    Khu tập thể Greenfield - Thủ Đức
                  </ThemedText>
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.price}>8.500.000</ThemedText>
                    <ThemedText type="small" style={{ marginLeft: 6 }}>
                      /tháng
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.listingLocation}>
                    10 phút xe buýt đến ĐH Bách Khoa
                  </ThemedText>

                  <View style={styles.metaRow}>
                    <ThemedText type="small">Ở chung</ThemedText>
                    <ThemedText type="small" style={styles.metaItem}>
                      Bếp chung
                    </ThemedText>
                    <ThemedText type="small" style={styles.metaItem}>
                      Giặt ủi
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.viewAllLink}>
            <ThemedText type="smallBold" style={styles.viewAllText}>
              Xem tất cả hơn 2.400 tin đăng →
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.landlordCard}>
            <ThemedText type="title" style={styles.landlordTitle}>
              Are you a landlord?
            </ThemedText>
            <ThemedText type="small" style={styles.landlordSubtitle}>
              Reach thousands of students looking for their next home. List your
              property on UniNest and find quality tenants quickly.
            </ThemedText>

            <View style={styles.landlordButtons}>
              <TouchableOpacity style={styles.landlordPrimary}>
                <ThemedText type="smallBold" style={{ color: "#fff" }}>
                  List Your Property
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.landlordSecondary}
                onPress={goToLogin}
              >
                <ThemedText type="smallBold" style={{ color: "#fff" }}>
                  Learn More
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.footerLogo}
            />
            <ThemedText type="smallBold">UniNest</ThemedText>
            <ThemedText type="small" style={styles.footerText}>
              © 2024 UniNest Student Housing. Bảo lưu mọi quyền.
            </ThemedText>
          </View>
        </ScrollView>

        {isAuthenticated ? <BottomNavigation activeTab="home" /> : null}

        <View style={[styles.badgeBox, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" style={styles.badgeTitle}>
            Chỉ tin đăng đã xác thực
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.badgeSubtitle, { color: theme.textSecondary }]}
          >
            Cam kết 100% không lừa đảo
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F3EE" },
  safeArea: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.four * 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContainer: {
    position: "absolute",
    left: Spacing.four,
    right: Spacing.four,
    height: 64,
    zIndex: 30,
    justifyContent: "center",
    backgroundColor: "#F6EFE6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2F6F60",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },
  logoImage: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 20,
    color: "#2F2A25",
  },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#e38b2f",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  ctaText: {
    color: "#fff",
  },
  heroText: {
    paddingTop: Spacing.two,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: Spacing.two,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.two,
    backgroundColor: "#FFF3E6",
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: Spacing.two,
    color: "#60646C",
    maxWidth: 520,
  },
  searchCard: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E9",
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    marginTop: Spacing.two,
    backgroundColor: "#e38b2f",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
  },
  heroImage: {
    marginTop: Spacing.three,
    width: "100%",
    height: 260,
    borderRadius: 12,
  },
  badgeBox: {
    position: "absolute",
    left: Spacing.four,
    bottom: Platform.OS === "android" ? 92 : 98,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 18,
    minWidth: 220,
    maxWidth: 360,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
    backgroundColor: "#fff",
  },
  badgeTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontSize: 13,
    color: "#60646C",
  },
  featuresSection: {
    marginTop: Spacing.four,
    width: "100%",
  },
  featuresTitle: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: Spacing.one,
  },
  featuresSubtitle: {
    color: "#60646C",
    textAlign: "center",
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  cardsContainer: {
    gap: Spacing.three,
  },
  featureCard: {
    borderRadius: 12,
    padding: Spacing.three,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF0DE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.two,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 6,
  },
  featureDesc: {
    color: "#60646C",
  },
  listingsSection: {
    marginTop: Spacing.four,
  },
  listingsTitle: {
    fontSize: 28,
    marginBottom: Spacing.one,
  },
  listingsSubtitle: {
    color: "#60646C",
    marginBottom: Spacing.three,
  },
  listingsContainer: {
    gap: Spacing.three,
  },
  listingCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: Spacing.three,
  },
  listingImage: {
    width: "100%",
    height: 180,
  },
  listingBody: {
    padding: Spacing.three,
  },
  listingTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 6,
  },
  price: {
    color: "#e38b2f",
    fontSize: 16,
    fontWeight: "700",
  },
  listingLocation: {
    color: "#60646C",
    marginBottom: Spacing.two,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  metaItem: {
    marginLeft: Spacing.two,
  },
  viewAllLink: {
    marginTop: Spacing.three,
    alignItems: "center",
  },
  viewAllText: {
    color: "#e38b2f",
  },
  landlordCard: {
    marginTop: Spacing.four,
    borderRadius: 16,
    padding: Spacing.four,
    backgroundColor: "#2b2b2b",
  },
  landlordTitle: {
    color: "#fff",
    marginBottom: Spacing.two,
  },
  landlordSubtitle: {
    color: "#ddd",
    marginBottom: Spacing.three,
  },
  landlordButtons: {
    flexDirection: "column",
    gap: Spacing.two,
  },
  landlordPrimary: {
    backgroundColor: "#e38b2f",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  landlordSecondary: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: "center",
    paddingVertical: Spacing.three,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: Spacing.one,
  },
  footerText: {
    color: "#60646C",
    marginTop: Spacing.one,
  },
});
