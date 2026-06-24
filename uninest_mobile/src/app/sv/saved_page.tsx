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

import { favoriteApi } from "@/api/favorite.api";
import { BottomNavigation } from "@/components/bottom-navigation";
import {
  FavoriteRoomCard,
  type FavoriteRoomsView,
} from "@/components/favorite-room-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Room } from "@/types/room";
import { filterFavoriteRoomsBySearch, resolveFavoriteRooms } from "@/utils/favorite-display";

const PAGE_SIZE = 9;

export default function SavedPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshFavorites } = useFavorites();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<FavoriteRoomsView>("grid");
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await favoriteApi.list({ page, limit: PAGE_SIZE });
      const resolved = await resolveFavoriteRooms(response.data ?? []);
      setRooms(resolved);
      setTotalPages(response.pagination?.totalPages ?? 1);
    } catch (err) {
      setRooms([]);
      setTotalPages(1);
      setError(
        getApiErrorMessage(err, "Không thể tải phòng yêu thích. Vui lòng thử lại sau."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/" as any);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      void loadFavorites();
      void refreshFavorites();
    }, [isAuthenticated, loadFavorites, refreshFavorites]),
  );

  useEffect(() => {
    if (isAuthenticated) {
      void loadFavorites();
    }
  }, [isAuthenticated, loadFavorites]);

  const visibleRooms = useMemo(
    () => filterFavoriteRoomsBySearch(rooms, search),
    [rooms, search],
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: 120 + insets.bottom,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={styles.pageTitle}>
            Quản lý phòng yêu thích
          </ThemedText>

          <View style={styles.toolbar}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên, địa chỉ"
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={styles.viewToggle}>
              <Pressable
                style={[styles.viewBtn, view === "grid" && styles.viewBtnActive]}
                onPress={() => setView("grid")}
              >
                <Text
                  style={[
                    styles.viewBtnText,
                    view === "grid" && styles.viewBtnTextActive,
                  ]}
                >
                  ▦
                </Text>
              </Pressable>
              <Pressable
                style={[styles.viewBtn, view === "list" && styles.viewBtnActive]}
                onPress={() => setView("list")}
              >
                <Text
                  style={[
                    styles.viewBtnText,
                    view === "list" && styles.viewBtnTextActive,
                  ]}
                >
                  ☰
                </Text>
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F28C1B" />
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.messageBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable
                style={styles.retryButton}
                onPress={() => void loadFavorites()}
              >
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && visibleRooms.length === 0 ? (
            <View style={styles.messageBox}>
              <ThemedText type="small" style={styles.emptyText}>
                Chưa có phòng yêu thích phù hợp.
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && !error && visibleRooms.length > 0 ? (
            <View style={[styles.list, view === "grid" && styles.listGrid]}>
              {visibleRooms.map((room) => (
                <View
                  key={room._id}
                  style={view === "grid" ? styles.gridItem : styles.listItem}
                >
                  <FavoriteRoomCard
                    room={room}
                    view={view}
                    onFavoriteChange={() => void loadFavorites()}
                  />
                </View>
              ))}
            </View>
          ) : null}

          {!isLoading && !error && totalPages > 1 ? (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Trước
                </ThemedText>
              </Pressable>
              <ThemedText type="small" style={styles.pageInfo}>
                Trang {page}/{totalPages}
              </ThemedText>
              <Pressable
                style={[
                  styles.pageBtn,
                  page >= totalPages && styles.pageBtnDisabled,
                ]}
                disabled={page >= totalPages}
                onPress={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ThemedText type="smallBold" style={styles.pageBtnText}>
                  Sau
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <BottomNavigation activeTab="saved" />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  pageTitle: {
    color: "#1F2940",
    fontSize: 24,
    marginBottom: 16,
  },
  toolbar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: "#94A3B8",
  },
  searchInput: {
    flex: 1,
    color: "#1F2940",
    fontSize: 15,
    paddingVertical: 0,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    padding: 4,
    gap: 4,
  },
  viewBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnActive: {
    backgroundColor: "#F28C1B",
  },
  viewBtnText: {
    fontSize: 16,
    color: "#64748B",
  },
  viewBtnTextActive: {
    color: "#FFFFFF",
  },
  centerBox: {
    paddingVertical: 48,
    alignItems: "center",
  },
  messageBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#F28C1B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
  },
  list: {
    gap: 14,
  },
  listGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "100%",
  },
  listItem: {
    width: "100%",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: "#1F2940",
  },
  pageInfo: {
    color: "#64748B",
  },
});
