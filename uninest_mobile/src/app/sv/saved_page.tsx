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
import type { Room } from "@/types/room";

const PLACEHOLDER_IMAGE = require("@/assets/images/tutorial-web.png");

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function matchesKeyword(room: Room, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return [room.title, room.address, room.city, room.district]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

export default function SavedPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { favoriteRooms, isLoading, error, refreshFavorites } = useFavorites();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/" as any);
    }
  }, [isAuthenticated, router]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refreshFavorites();
      }
    }, [isAuthenticated, refreshFavorites]),
  );

  const listings = useMemo(
    () => favoriteRooms.filter((room) => matchesKeyword(room, keyword)),
    [favoriteRooms, keyword],
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { top: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>

          <ThemedText type="smallBold" style={styles.title}>
            Phòng đã lưu
          </ThemedText>

          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>⋮</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 78,
            paddingBottom: 150 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm trong danh sách đã lưu"
              placeholderTextColor="#9A8C7D"
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          <View style={styles.tabsRow}>
            <TabItem label="Tất cả" active />
            <TabItem label="Ưu tiên" />
            <TabItem label="Gần trường" />
            <TabItem label="Căn hộ" />
          </View>

          <View style={styles.filterRow}>
            <FilterChip label="Giá cả" />
            <FilterChip label="Ngày lưu" />
            <FilterChip label="Khoảng cách" />
          </View>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F28C1B" />
              <ThemedText type="small" style={styles.hintText}>
                Đang tải phòng đã lưu...
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable
                style={styles.retryButton}
                onPress={() => void refreshFavorites()}
              >
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && listings.length === 0 ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.hintText}>
                {favoriteRooms.length === 0
                  ? "Chưa có phòng đã lưu. Nhấn ♡ ở trang Khám phá để lưu phòng."
                  : "Không có phòng khớp từ khóa."}
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && !error
            ? listings.map((room, index) => {
                const isAvailable = room.status === "AVAILABLE";
                return (
                  <SavedCard
                    key={room._id}
                    roomId={room._id}
                    onPress={() =>
                      router.push({
                        pathname: "/sv/detail_page",
                        params: { id: room._id },
                      } as any)
                    }
                    title={room.title}
                    price={formatPrice(room.pricePerMonth)}
                    status={isAvailable ? "CÒN TRỐNG" : "ĐÃ HẾT PHÒNG"}
                    statusStyle={
                      isAvailable
                        ? styles.statusAvailable
                        : styles.statusSoldOut
                    }
                    badge={isAvailable ? "ĐÃ XÁC MINH" : "HẾT PHÒNG"}
                    imageColor={
                      ["#F3F0EA", "#E9E6E0", "#F0EAE2"][index % 3] ?? "#F3F0EA"
                    }
                  />
                );
              })
            : null}
        </ScrollView>

        <View style={styles.compareButtonWrap}>
          <Pressable style={styles.compareButton}>
            <Text style={styles.compareIcon}>⇄</Text>
            <ThemedText type="smallBold" style={styles.compareText}>
              So sánh ngay (1)
            </ThemedText>
          </Pressable>
        </View>

        <BottomNavigation activeTab="saved" />
      </SafeAreaView>
    </ThemedView>
  );
}

function TabItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <Pressable style={[styles.tabItem, active && styles.tabItemActive]}>
      <ThemedText
        type="smallBold"
        style={[styles.tabText, active && styles.tabTextActive]}
      >
        {label}
      </ThemedText>
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

function SavedCard({
  roomId,
  onPress,
  title,
  price,
  status,
  statusStyle,
  badge,
  imageColor,
}: {
  roomId: string;
  onPress: () => void;
  title: string;
  price: string;
  status: string;
  statusStyle: object;
  badge: string;
  imageColor: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void roomApi
      .listImages(roomId)
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
  }, [roomId]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View
        style={[
          styles.imageBlock,
          !imageUrl ? { backgroundColor: imageColor } : null,
        ]}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : PLACEHOLDER_IMAGE}
          style={styles.roomImage}
          contentFit="cover"
        />
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>{badge}</Text>
        </View>
        <FavoriteHeartButton
          roomId={roomId}
          style={styles.favoriteButton}
        />
        {status.includes("HẾT") ? (
          <View style={styles.soldOutOverlay}>
            <ThemedText type="smallBold" style={styles.soldOutText}>
              HẾT PHÒNG
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <ThemedText
            type="smallBold"
            style={styles.cardTitle}
            numberOfLines={1}
          >
            {title}
          </ThemedText>
          <View style={[styles.statusPill, statusStyle]}>
            <ThemedText type="smallBold" style={styles.statusText}>
              {status}
            </ThemedText>
          </View>
        </View>

        <View style={styles.priceRow}>
          <ThemedText type="smallBold" style={styles.priceText}>
            {price}
          </ThemedText>
          <ThemedText type="small" style={styles.priceUnit}>
            /tháng
          </ThemedText>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.compareRow}>
            <View style={styles.checkbox} />
            <ThemedText type="small" style={styles.compareLabel}>
              So sánh
            </ThemedText>
          </View>
          <View style={styles.actionsRow}>
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionIcon}>🗑</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  screen: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 52,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F2E9",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(90, 69, 42, 0.08)",
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
    color: "#5A452A",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "#5A452A",
  },
  scroll: {
    flex: 1,
  },
  searchBox: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: "#E08B2D",
  },
  searchPlaceholder: {
    color: "#A3AAB8",
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    color: "#5A452A",
    fontSize: 15,
    paddingVertical: 0,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8DCC7",
  },
  tabItem: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#F28C1B",
  },
  tabText: {
    color: "#7F6F5C",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#2F261A",
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipText: {
    color: "#5B4936",
    fontSize: 13,
  },
  chevron: {
    color: "#8F7C67",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageBlock: {
    height: 170,
    position: "relative",
    overflow: "hidden",
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  topBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topBadgeText: {
    color: "#667AA7",
    fontSize: 11,
    fontWeight: "700",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIcon: {
    color: "#F28C1B",
    fontSize: 18,
  },
  roomScene: {
    width: "78%",
    height: 118,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.35)",
    padding: 14,
    justifyContent: "space-between",
  },
  windowPane: {
    width: 18,
    height: 56,
    backgroundColor: "#E9F0F6",
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  bed: {
    width: 118,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#F8F5EF",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
  },
  pillow: {
    width: 26,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 3,
  },
  sideTable: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 38,
    height: 44,
    borderRadius: 4,
    backgroundColor: "#D8B074",
  },
  soldOutOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -52 }, { translateY: -16 }],
    backgroundColor: "#6E717B",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  soldOutText: {
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: "#4A3B2B",
    fontSize: 16,
  },
  statusPill: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusAvailable: {
    backgroundColor: "#DDF6D5",
  },
  statusSoldOut: {
    backgroundColor: "#E7EBF1",
  },
  statusText: {
    fontSize: 11,
    color: "#6F7B60",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  priceText: {
    color: "#F28C1B",
    fontSize: 18,
  },
  priceUnit: {
    color: "#7D8695",
    marginLeft: 2,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D3D7DD",
  },
  compareLabel: {
    color: "#5F6672",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionIcon: {
    fontSize: 18,
    color: "#7E8795",
  },
  compareButtonWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 82,
    zIndex: 20,
  },
  compareButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E9922E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  compareIcon: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  compareText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
