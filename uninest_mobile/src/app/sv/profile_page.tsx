import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { authApi } from "@/api/auth.api";
import { bookingApi } from "@/api/booking.api";
import { roomApi } from "@/api/room.api";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { MembershipPlanCard } from "@/components/membership-plan-card";
import {
  ProfileSettingsMenu,
  type ProfileSettingsItemId,
} from "@/components/profile-settings-menu";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/hooks/use-logout";
import { useFavorites } from "@/context/favorites-context";
import { useTenantGate } from "@/hooks/use-tenant-gate";
import type { UpgradeFeatureKey } from "@/constants/upgrade-features";
import { isLandlordRole } from "@/utils/landlord-access";
import { getMembershipPlanDisplay } from "@/utils/membership-display";
import { formatPrice, getRoomImageSource } from "@/utils/room-display";
import { getUserAvatarSource } from "@/utils/user-display";
import type { AuthUser } from "@/types/auth";
import type { Booking, BookingRoomRef, BookingStatus } from "@/types/booking";
import type { Room } from "@/types/room";

const MATCHING_PREFS = [
  { label: "NGÂN SÁCH", value: "3 – 5 triệu / tháng" },
  { label: "KHÔNG KHÍ", value: "Hòa đồng & Thoải mái" },
  { label: "KHOẢNG CÁCH", value: "< 15 phút đi bộ" },
  { label: "BẠN CÙNG PHÒNG", value: "Chỉ sinh viên" },
] as const;

function getRoomFromBooking(booking: Booking): BookingRoomRef | null {
  const room = booking.roomId;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return room;
  }
  return null;
}

function getRoomIdFromBooking(booking: Booking): string | null {
  const room = booking.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

function formatSubmittedAgo(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Đã nộp hôm nay";
  return `Đã nộp ${days} ngày trước`;
}

function bookingStatusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    PENDING: "CHỜ DUYỆT",
    APPROVED: "ĐÃ CHẤP NHẬN",
    REJECTED: "TỪ CHỐI",
    CANCELLED: "ĐÃ HỦY",
  };
  return map[status] ?? status;
}

function bookingStatusStyle(status: BookingStatus) {
  if (status === "APPROVED") return styles.statusAccepted;
  if (status === "PENDING") return styles.statusPending;
  return styles.statusMuted;
}

const TENANT_SETTINGS_FEATURES: Partial<
  Record<ProfileSettingsItemId, UpgradeFeatureKey>
> = {
  rooms: "rooms",
  invoices: "invoices",
  contracts: "contracts",
  meter: "meter",
  identity: "identity",
};

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user: sessionUser, updateUser } = useAuth();
  const logout = useLogout();
  const { requireTenant, TenantGatePrompt } = useTenantGate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { favoriteRooms } = useFavorites();

  const [profileUser, setProfileUser] = useState<AuthUser | null>(sessionUser);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const hasLoadedOnceRef = useRef(false);

  const displayUser = profileUser ?? sessionUser;
  const membershipPlan = getMembershipPlanDisplay(
    displayUser?.role,
    displayUser?.roleExpiresAt,
  );
  const savedCount = favoriteRooms.length;
  const suggestedCount = 0;

  const loadData = useCallback(async () => {
    const showLoading = !hasLoadedOnceRef.current;
    if (showLoading) {
      setLoadingProfile(true);
      setLoadingBookings(true);
    }

    try {
      const me = await authApi.getMe();
      setProfileUser(me.data.user);
      updateUser(me.data.user);
    } catch {
      // Giữ dữ liệu profile hiện có khi refresh thất bại
    } finally {
      setLoadingProfile(false);
    }

    try {
      const res = await bookingApi.listMine({ page: 1, limit: 10 });
      setBookings(res.data ?? []);
      setBookingTotal(res.pagination?.total ?? res.data?.length ?? 0);
    } catch {
      setBookings([]);
      setBookingTotal(0);
    } finally {
      setLoadingBookings(false);
      hasLoadedOnceRef.current = true;
    }
  }, [updateUser]);

  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        router.replace("/sv/login_page" as any);
        return;
      }
      void loadDataRef.current();
    }, [isAuthenticated, router]),
  );

  if (!isAuthenticated) {
    return null;
  }

  const recentBookings = bookings.slice(0, 2);
  const savedPreview = favoriteRooms.slice(0, 6);

  const handleSettingsSelect = (id: ProfileSettingsItemId) => {
    setSettingsOpen(false);

    if (id === "landlord") {
      const role = displayUser?.role ?? sessionUser?.role;
      if (isLandlordRole(role)) {
        router.push("/landlord/home_page" as any);
      } else {
        router.push("/sv/landlord_request_page" as any);
      }
      return;
    }

    if (id === "logout") {
      logout();
      return;
    }

    const tenantFeature = TENANT_SETTINGS_FEATURES[id];
    if (tenantFeature && !requireTenant(tenantFeature)) {
      return;
    }

    const routes: Record<
      Exclude<
        ProfileSettingsItemId,
        "logout" | "landlord"
      >,
      string
    > = {
      personal: "/sv/profile_personal_page",
      rooms: "/sv/profile_rooms_page",
      invoices: "/sv/profile_invoices_page",
      contracts: "/sv/profile_contracts_page",
      meter: "/sv/profile_meter_readings_page",
      identity: "/sv/profile_identity_page",
      upgrade: "/sv/upgrade_package_page",
    };
    router.push(routes[id] as any);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Hồ sơ của tôi
          </ThemedText>
          <Pressable
            style={styles.iconButton}
            onPress={() => setSettingsOpen(true)}
          >
            <Text style={styles.iconText}>⚙</Text>
          </Pressable>
        </View>

        <ProfileSettingsMenu
          visible={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSelect={handleSettingsSelect}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120 + insets.bottom,
          }}
        >
          <View style={styles.heroSection}>
            <View style={styles.avatarWrap}>
              <Image
                source={getUserAvatarSource(displayUser?.avatarUrl)}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            </View>

            {loadingProfile ? (
              <ActivityIndicator color="#F28C1B" style={{ marginTop: 12 }} />
            ) : (
              <>
                <Text style={styles.userName}>
                  {displayUser?.fullName ?? "Sinh viên"}
                </Text>
                <Text style={styles.userSubtitle}>
                  {displayUser?.email ?? "UniNest"}
                  {displayUser?.phone ? ` • ${displayUser.phone}` : ""}
                </Text>
              </>
            )}

            {!loadingProfile ? (
              <View
                style={[
                  styles.planPill,
                  { backgroundColor: membershipPlan.accent },
                ]}
              >
                <Text style={styles.planPillText}>
                  {membershipPlan.title.toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>

          {!loadingProfile ? (
            <MembershipPlanCard
              role={displayUser?.role}
              roleExpiresAt={displayUser?.roleExpiresAt}
              onPress={() => router.push("/sv/upgrade_package_page" as any)}
            />
          ) : null}

          <View style={styles.statsRow}>
            <StatCard value={String(bookingTotal)} label="ĐÃ NỘP" />
            <StatCard value={String(savedCount)} label="ĐÃ LƯU" />
            <StatCard value={String(suggestedCount)} label="GỢI Ý" />
          </View>

          <SectionHeader
            title="Đơn đăng ký của tôi"
            actionLabel="Xem tất cả"
            onAction={() =>
              Alert.alert(
                "Đơn đăng ký",
                bookingTotal > 0
                  ? `Bạn có ${bookingTotal} đơn đăng ký.`
                  : "Chưa có đơn đăng ký nào.",
              )
            }
          />

          {loadingBookings ? (
            <ActivityIndicator
              color="#F28C1B"
              style={{ marginVertical: 16 }}
            />
          ) : recentBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có đơn đăng ký. Đặt phòng từ trang chi tiết phòng.
              </ThemedText>
            </View>
          ) : (
            recentBookings.map((booking) => (
              <ApplicationRow key={booking._id} booking={booking} />
            ))
          )}

          <View style={styles.matchingCard}>
            <Text style={styles.matchingTitle}>
              ✨ Cài đặt Ghép đôi Thông minh
            </Text>
            <View style={styles.matchingGrid}>
              {MATCHING_PREFS.map((item) => (
                <View key={item.label} style={styles.matchingCell}>
                  <Text style={styles.matchingLabel}>{item.label}</Text>
                  <Text style={styles.matchingValue}>{item.value}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={styles.updateButton}
              onPress={() => {
                if (!requireTenant("ai_search")) return;
                router.push("/sv/ai_search_page" as any);
              }}
            >
              <Text style={styles.updateButtonText}>Mở AI tìm phòng</Text>
            </Pressable>
          </View>

          <SectionHeader
            title="Tin đã lưu"
            actionLabel={`Xem tất cả (${savedCount})`}
            onAction={() => router.push("/sv/saved_page" as any)}
          />

          {savedPreview.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có tin đã lưu. Khám phá phòng và nhấn ♡ để lưu.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedScroll}
            >
              {savedPreview.map((room) => (
                <SavedPreviewCard
                  key={room._id}
                  room={room}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/detail_page",
                      params: { id: room._id },
                    } as any)
                  }
                />
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <BottomNavigation activeTab="profile" />
        <TenantGatePrompt />
      </SafeAreaView>
    </ThemedView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function ApplicationRow({ booking }: { booking: Booking }) {
  const router = useRouter();
  const room = getRoomFromBooking(booking);
  const roomId = getRoomIdFromBooking(booking);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    void roomApi
      .listImages(roomId)
      .then((res) => {
        if (cancelled) return;
        const images = res.data ?? [];
        const primary = images.find((img) => img.isPrimary) ?? images[0];
        if (primary?.url) setThumbUrl(primary.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return (
    <Pressable
      style={styles.applicationCard}
      onPress={() => {
        if (roomId) {
          router.push({
            pathname: "/sv/detail_page",
            params: { id: roomId },
          } as any);
        }
      }}
    >
      <Image
        source={getRoomImageSource(thumbUrl)}
        style={styles.applicationThumb}
        contentFit="cover"
      />
      <View style={styles.applicationBody}>
        <Text style={styles.applicationTitle} numberOfLines={1}>
          {room?.title ?? "Phòng đã đăng ký"}
        </Text>
        <Text style={styles.applicationMeta}>
          {formatSubmittedAgo(booking.createdAt)}
        </Text>
      </View>
      <View
        style={[
          styles.applicationStatus,
          bookingStatusStyle(booking.status),
        ]}
      >
        <Text
          style={[
            styles.applicationStatusText,
            booking.status === "PENDING" && styles.statusTextPending,
            booking.status === "APPROVED" && styles.statusTextAccepted,
          ]}
        >
          {bookingStatusLabel(booking.status)}
        </Text>
      </View>
    </Pressable>
  );
}

function SavedPreviewCard({
  room,
  onPress,
}: {
  room: Room;
  onPress: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void roomApi
      .listImages(room._id)
      .then((res) => {
        if (cancelled) return;
        const images = res.data ?? [];
        const primary = images.find((img) => img.isPrimary) ?? images[0];
        if (primary?.url) setImageUrl(primary.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [room._id]);

  return (
    <Pressable style={styles.savedCard} onPress={onPress}>
      <View style={styles.savedImageWrap}>
        <Image
          source={getRoomImageSource(imageUrl)}
          style={styles.savedImage}
          contentFit="cover"
        />
        <FavoriteHeartButton
          roomId={room._id}
          style={styles.savedHeart}
        />
      </View>
      <Text style={styles.savedTitle} numberOfLines={2}>
        {room.title}
      </Text>
      <Text style={styles.savedPrice}>
        {formatPrice(room.pricePerMonth)}
        <Text style={styles.savedPriceUnit}>/tháng</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5EFE6",
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
    backgroundColor: "#F5EFE6",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    color: "#3D3428",
  },
  headerTitle: {
    fontFamily: "serif",
    fontSize: 18,
    color: "#2F261A",
    fontWeight: "700",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  avatarWrap: {
    width: 108,
    height: 108,
    position: "relative",
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F5EFE6",
  },
  verifiedIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  userName: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: "700",
    color: "#2F261A",
    fontFamily: "serif",
    textAlign: "center",
  },
  userSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#7A6B58",
    textAlign: "center",
    lineHeight: 18,
  },
  planPill: {
    marginTop: 12,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  planPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F28C1B",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#8A7B68",
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2F261A",
    fontFamily: "serif",
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F28C1B",
  },
  applicationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  applicationThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#EDE6DC",
  },
  applicationBody: {
    flex: 1,
    minWidth: 0,
  },
  applicationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F261A",
  },
  applicationMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#8A7B68",
  },
  applicationStatus: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  applicationStatusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#7A6B58",
  },
  statusTextPending: {
    color: "#C47A10",
  },
  statusTextAccepted: {
    color: "#2E8B57",
  },
  statusPending: {
    backgroundColor: "#FFF4D6",
  },
  statusAccepted: {
    backgroundColor: "#E2F5E8",
  },
  statusMuted: {
    backgroundColor: "#F0EBE4",
  },
  matchingCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#F0E4D4",
  },
  matchingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F261A",
    marginBottom: 14,
    fontFamily: "serif",
  },
  matchingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  matchingCell: {
    width: "47%",
    marginBottom: 4,
  },
  matchingLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#9A8570",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  matchingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3D3428",
    lineHeight: 18,
  },
  updateButton: {
    marginTop: 16,
    backgroundColor: "#F28C1B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  savedScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  savedCard: {
    width: 200,
  },
  savedImageWrap: {
    height: 130,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EDE6DC",
    position: "relative",
  },
  savedImage: {
    width: "100%",
    height: "100%",
  },
  savedHeart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  savedTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#2F261A",
    lineHeight: 18,
  },
  savedPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#F28C1B",
  },
  savedPriceUnit: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8A7B68",
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    color: "#8A7B68",
    textAlign: "center",
  },
});
