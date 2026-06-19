import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { roomApi } from "@/api/room.api";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Room } from "@/types/room";

const PLACEHOLDER_IMAGE = require("@/assets/images/tutorial-web.png");

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function locationLabel(room: Room) {
  const parts = [room.district, room.city].filter(Boolean);
  if (parts.length > 0) return `📍 ${parts.join(", ")}`;
  return `📍 ${room.address}`;
}

function roomTypeLabel(roomType?: string) {
  if (!roomType) return "Phòng trọ";
  const map: Record<string, string> = {
    STUDIO: "Studio",
    SINGLE: "Phòng đơn",
    SHARED: "Ở ghép",
    APARTMENT: "Căn hộ",
  };
  return map[roomType] ?? roomType;
}

/** Hiển thị mọi phòng API trả về (không lọc isPublished). */
function isExploreRoom(_room: Room) {
  return true;
}

function matchesKeyword(room: Room, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return [room.title, room.address, room.city, room.district, room.ward]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshFavorites } = useFavorites();
  const [keyword, setKeyword] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await roomApi.list({ page: 1, limit: 50 });
      setRooms(response.data ?? []);
    } catch (err) {
      setRooms([]);
      setError(
        getApiErrorMessage(err, "Không tải được danh sách phòng từ máy chủ."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRooms();
      if (isAuthenticated) {
        void refreshFavorites();
      }
    }, [loadRooms, isAuthenticated, refreshFavorites]),
  );

  const listings = useMemo(
    () =>
      rooms
        .filter(isExploreRoom)
        .filter((room) => matchesKeyword(room, keyword)),
    [rooms, keyword],
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.headerContainer, { top: insets.top }]}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Text style={styles.iconText}>←</Text>
            </Pressable>

            <ThemedText
              type="smallBold"
              style={styles.headerTitle}
              numberOfLines={1}
            >
              Tìm UniNest của bạn
            </ThemedText>

            <Pressable style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 86,
            paddingBottom: 140 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchBoxWrap}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm trường, quận, địa chỉ..."
                placeholderTextColor="#8D97A7"
                value={keyword}
                onChangeText={setKeyword}
                returnKeyType="search"
              />
              <Pressable onPress={() => void loadRooms()}>
                <Text style={styles.filterIcon}>↻</Text>
              </Pressable>
            </View>

            <View style={styles.filtersRow}>
              <FilterChip label="Ngân sách" />
              <FilterChip label="Khoảng cách" />
              <FilterChip label="Loại phòng" />
            </View>
          </View>

          <View style={styles.modeRow}>
            <View style={styles.modeActive}>
              <Text style={styles.modeActiveIcon}>▦</Text>
              <ThemedText type="smallBold" style={styles.modeActiveText}>
                DẠNG LƯỚI
              </ThemedText>
            </View>
            <View style={styles.modeInactive}>
              <Text style={styles.modeInactiveIcon}>🗺</Text>
              <ThemedText type="smallBold" style={styles.modeInactiveText}>
                BẢN ĐỒ
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" style={styles.resultText}>
            Hiển thị {listings.length} phòng
          </ThemedText>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F28C1B" />
              <ThemedText type="small" style={styles.hintText}>
                Đang tải danh sách phòng...
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable style={styles.retryButton} onPress={() => void loadRooms()}>
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && listings.length === 0 ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.hintText}>
                {rooms.length === 0
                  ? "API chưa trả phòng nào."
                  : "Không có phòng khớp từ khóa tìm kiếm."}
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && !error
            ? listings.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onPress={() =>
                    router.push({
                      pathname: "/sv/detail_page",
                      params: { id: room._id },
                    } as any)
                  }
                />
              ))
            : null}
        </ScrollView>

        {isAuthenticated ? <BottomNavigation activeTab="explore" /> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function RoomCard({ room, onPress }: { room: Room; onPress: () => void }) {
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
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image
          source={imageUrl ? { uri: imageUrl } : PLACEHOLDER_IMAGE}
          style={styles.propertyImage}
          contentFit="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🛡</Text>
          <Text style={styles.badgeText}>
            {room.status === "AVAILABLE" ? "CÒN TRỐNG" : "ĐÃ XÁC MINH"}
          </Text>
        </View>
        <FavoriteHeartButton roomId={room._id} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold" style={styles.propertyTitle}>
            {room.title}
          </ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="smallBold" style={styles.price}>
              {formatPrice(room.pricePerMonth)}
            </ThemedText>
            <ThemedText type="small" style={styles.priceUnit}>
              /tháng
            </ThemedText>
          </View>
        </View>

        <ThemedText type="small" style={styles.locationText}>
          {locationLabel(room)}
        </ThemedText>

        <View style={styles.featureRow}>
          <FeatureItem icon="🏠" label={roomTypeLabel(room.roomType)} />
          {room.areaSqm ? (
            <FeatureItem icon="📐" label={`${room.areaSqm} m²`} />
          ) : null}
          {room.maxOccupants ? (
            <FeatureItem icon="👥" label={`${room.maxOccupants} người`} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <Pressable style={styles.filterChip}>
      <ThemedText type="smallBold" style={styles.filterChipText}>
        {label}
        <Text style={styles.chevron}> ▾</Text>
      </ThemedText>
    </Pressable>
  );
}

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <ThemedText type="small" style={styles.featureText}>
        {label}
      </ThemedText>
    </View>
  );
}

export function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: boolean;
}) {
  return (
    <Pressable style={styles.navItem}>
      <View style={styles.navIconWrap}>
        <NavIcon name={icon} active={active} />
        {badge ? <View style={styles.navBadge} /> : null}
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const color = active ? "#F28C1B" : "#7E8798";

  if (name === "home-outline") {
    return (
      <View style={styles.iconHome}>
        <View style={[styles.iconHomeRoof, { borderBottomColor: color }]} />
        <View style={[styles.iconHomeBody, { borderColor: color }]} />
      </View>
    );
  }

  if (name === "compass-outline") {
    return (
      <View style={[styles.iconCompass, { borderColor: color }]}>
        <View style={[styles.iconCompassNeedle, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === "heart-outline") {
    return (
      <Text style={[styles.iconHeart, { color }]}>{active ? "♥" : "♡"}</Text>
    );
  }

  if (name === "chatbubble-outline") {
    return (
      <View style={[styles.iconChat, { borderColor: color }]}>
        <View style={[styles.iconChatTail, { borderTopColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.iconPerson}>
      <View style={[styles.iconPersonHead, { borderColor: color }]} />
      <View style={[styles.iconPersonBody, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6EFE6",
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    color: "#564738",
  },
  headerTitle: {
    color: "#4A3B2B",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  searchBoxWrap: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  searchBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5D8C8",
  },
  searchIcon: {
    fontSize: 18,
    color: "#8C725A",
  },
  searchText: {
    flex: 1,
    color: "#4A3B2B",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: "#4A3B2B",
    fontSize: 16,
    paddingVertical: 0,
  },
  filterIcon: {
    fontSize: 18,
    color: "#F28C1B",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    flexWrap: "nowrap",
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8DED0",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipText: {
    color: "#5F5245",
  },
  chevron: {
    color: "#9A8C7D",
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#EDE3D3",
    borderRadius: 14,
    marginHorizontal: 14,
    padding: 6,
    marginTop: 6,
    gap: 6,
  },
  modeActive: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
  },
  modeInactive: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modeActiveIcon: {
    color: "#4A3B2B",
    fontSize: 18,
  },
  modeInactiveIcon: {
    color: "#9A8C7D",
    fontSize: 18,
  },
  modeActiveText: {
    color: "#4A3B2B",
    letterSpacing: 0.2,
  },
  modeInactiveText: {
    color: "#9A8C7D",
    letterSpacing: 0.2,
  },
  resultText: {
    color: "#968575",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  hintText: {
    color: "#7A6A5C",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: "#D14343",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#F28C1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
  },
  card: {
    marginHorizontal: 14,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageWrap: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 230,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFF8EF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 11,
    color: "#2F2A24",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heartButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  propertyTitle: {
    flex: 1,
    color: "#3E3228",
    fontSize: 19,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  price: {
    color: "#F28C1B",
    fontSize: 18,
  },
  priceUnit: {
    color: "#A08F7B",
    fontSize: 12,
  },
  locationText: {
    color: "#8B7E70",
    marginTop: 4,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE6DB",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureIcon: {
    fontSize: 14,
  },
  featureText: {
    color: "#6D6154",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E2DA",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  navIconWrap: {
    position: "relative",
    height: 26,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  iconHome: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconHomeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderStyle: "solid",
  },
  iconHomeBody: {
    width: 14,
    height: 10,
    marginTop: -1,
    borderWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderRadius: 1,
    backgroundColor: "transparent",
  },
  iconCompass: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCompassNeedle: {
    width: 8,
    height: 8,
    transform: [{ rotate: "45deg" }],
  },
  iconHeart: {
    fontSize: 23,
    lineHeight: 24,
    textAlign: "center",
  },
  iconChat: {
    width: 24,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  iconChatTail: {
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
  iconPerson: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPersonHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    marginBottom: 2,
  },
  iconPersonBody: {
    width: 18,
    height: 8,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomWidth: 2,
  },
  navBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#F28C1B",
  },
  navLabel: {
    width: "100%",
    fontSize: 9,
    color: "#7E8798",
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 11,
  },
  navLabelActive: {
    color: "#F28C1B",
  },
});
