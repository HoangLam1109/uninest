import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { roomApi, type RoomSearchParams } from "@/api/room.api";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { useTenantGate } from "@/hooks/use-tenant-gate";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Room, RoomType } from "@/types/room";
import {
  formatPrice,
  formatRoomLocation,
  getRoomAmenityNames,
  getRoomImageSource,
  roomTypeLabel,
} from "@/utils/room-display";

const ROOM_TYPE_PRESETS: { value: RoomType; label: string; icon: string }[] = [
  { value: "STUDIO", label: "Studio", icon: "🏢" },
  { value: "SINGLE", label: "Phòng đơn", icon: "📍" },
  { value: "SHARED", label: "Phòng ghép", icon: "👥" },
  { value: "APARTMENT", label: "Căn hộ", icon: "🏠" },
];

const PRICE_PRESETS = [
  { label: "Dưới 3 triệu", minPrice: undefined, maxPrice: 3000000 },
  { label: "3 - 5 triệu", minPrice: 3000000, maxPrice: 5000000 },
  { label: "5 - 8 triệu", minPrice: 5000000, maxPrice: 8000000 },
  { label: "Trên 8 triệu", minPrice: 8000000, maxPrice: undefined },
] as const;

const PAGE_LIMIT = 9;

type PaginationState = {
  page: number;
  totalPages: number;
  total: number;
};

function defaultPagination(): PaginationState {
  return { page: 1, totalPages: 1, total: 0 };
}

type FilterForm = {
  keyword: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  roomType: RoomType | "";
};

function emptyFilters(): FilterForm {
  return {
    keyword: "",
    district: "",
    minPrice: "",
    maxPrice: "",
    roomType: "",
  };
}

function parsePrice(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function hasSearchCriteria(filters: FilterForm) {
  return Boolean(
    filters.keyword.trim() ||
      filters.district.trim() ||
      filters.minPrice.trim() ||
      filters.maxPrice.trim() ||
      filters.roomType,
  );
}

function buildApiParams(filters: FilterForm, page: number): RoomSearchParams {
  return {
    page,
    limit: PAGE_LIMIT,
    status: "AVAILABLE",
    q: filters.keyword.trim() || undefined,
    district: filters.district.trim() || undefined,
    minPrice: parsePrice(filters.minPrice),
    maxPrice: parsePrice(filters.maxPrice),
    roomType: filters.roomType || undefined,
  };
}

function formatPriceRange(minPrice?: string, maxPrice?: string) {
  const min = parsePrice(minPrice ?? "");
  const max = parsePrice(maxPrice ?? "");
  if (min != null && max != null) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
  if (min != null) return `Từ ${formatPrice(min)}`;
  if (max != null) return `Dưới ${formatPrice(max)}`;
  return null;
}

function buildActiveFilterLabels(filters: FilterForm) {
  const labels: string[] = [];
  if (filters.keyword.trim()) labels.push(`Từ khóa: ${filters.keyword.trim()}`);
  if (filters.district.trim()) {
    labels.push(`Quận/Huyện: ${filters.district.trim()}`);
  }
  if (filters.roomType) {
    labels.push(`Loại phòng: ${roomTypeLabel(filters.roomType)}`);
  }
  const priceRange = formatPriceRange(filters.minPrice, filters.maxPrice);
  if (priceRange) labels.push(`Mức giá: ${priceRange}`);
  return labels;
}

function buildSearchSummary(filters: FilterForm) {
  const parts = [
    filters.keyword.trim() || null,
    filters.district.trim() ? `Quận: ${filters.district.trim()}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function buildPriceSummary(filters: FilterForm) {
  return formatPriceRange(filters.minPrice, filters.maxPrice) ?? undefined;
}

function CollapsibleFilterCard({
  title,
  icon,
  expanded,
  onToggle,
  summary,
  children,
}: {
  title: string;
  icon?: string;
  expanded: boolean;
  onToggle: () => void;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.filterCard}>
      <Pressable
        style={styles.collapsibleHeader}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.collapsibleHeaderMain}>
          <View style={styles.sectionHeading}>
            {icon ? <Text style={styles.sectionIcon}>{icon}</Text> : null}
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              {title}
            </ThemedText>
          </View>
          {!expanded && summary ? (
            <ThemedText type="small" style={styles.collapsedSummary} numberOfLines={1}>
              {summary}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.collapseButton}>
          <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
        </View>
      </Pressable>
      {expanded ? <View style={styles.collapsibleBody}>{children}</View> : null}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function RoomPagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const canGoPrev = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  return (
    <View style={styles.paginationRow}>
      <Text style={styles.paginationLabel}>
        Trang {currentPage}/{Math.max(totalPages, 1)}
      </Text>
      <View style={styles.paginationControls}>
        <Pressable
          style={[styles.paginationButton, !canGoPrev && styles.paginationButtonDisabled]}
          disabled={!canGoPrev}
          onPress={() => onPageChange(currentPage - 1)}
        >
          <Text
            style={[
              styles.paginationButtonText,
              !canGoPrev && styles.paginationButtonTextDisabled,
            ]}
          >
            Trước
          </Text>
        </Pressable>
        <Pressable
          style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
          disabled={!canGoNext}
          onPress={() => onPageChange(currentPage + 1)}
        >
          <Text
            style={[
              styles.paginationButtonText,
              canGoNext && styles.paginationButtonTextActive,
              !canGoNext && styles.paginationButtonTextDisabled,
            ]}
          >
            Sau
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function RoomListCard({
  room,
  onPress,
}: {
  room: Room;
  onPress: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const amenityNames = getRoomAmenityNames(room);

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
          source={getRoomImageSource(imageUrl)}
          style={styles.cardImage}
          contentFit="cover"
        />
        <FavoriteHeartButton roomId={room._id} />
      </View>

      <View style={styles.cardBody}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          {room.title}
        </ThemedText>
        <ThemedText type="small" style={styles.cardLocation} numberOfLines={2}>
          📍 {formatRoomLocation(room)}
        </ThemedText>

        <View style={styles.metaGrid}>
          <ThemedText type="small" style={styles.metaItem}>
            {room.areaSqm ?? 0} m²
          </ThemedText>
          <ThemedText type="small" style={styles.metaItem}>
            {room.maxOccupants ?? "—"} người
          </ThemedText>
          <ThemedText type="small" style={styles.metaItem}>
            {roomTypeLabel(room.roomType)}
          </ThemedText>
        </View>

        {amenityNames.length > 0 ? (
          <View style={styles.amenityRow}>
            {amenityNames.slice(0, 3).map((amenity) => (
              <View key={amenity} style={styles.amenityPill}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {amenityNames.length > 3 ? (
              <View style={styles.amenityPillMuted}>
                <Text style={styles.amenityTextMuted}>
                  +{amenityNames.length - 3}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.priceWrap}>
            <ThemedText type="smallBold" style={styles.cardPrice}>
              {formatPrice(room.pricePerMonth)}
            </ThemedText>
            <ThemedText type="small" style={styles.cardPriceUnit}>
              /tháng
            </ThemedText>
          </View>
          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>→</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { requireTenant, TenantGatePrompt } = useTenantGate();
  const { refreshFavorites } = useFavorites();
  const [draftFilters, setDraftFilters] = useState<FilterForm>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterForm>(emptyFilters);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const scrollRef = useRef<ScrollViewType>(null);

  const loadRooms = useCallback(
    async (filters: FilterForm, page: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const params = buildApiParams(filters, page);
        const response = hasSearchCriteria(filters)
          ? await roomApi.search(params)
          : await roomApi.list(params);
        setRooms(response.data ?? []);
        const nextPagination = response.pagination;
        setPagination({
          page: nextPagination?.page ?? page,
          totalPages: Math.max(nextPagination?.totalPages ?? 1, 1),
          total: nextPagination?.total ?? response.data?.length ?? 0,
        });
        setCurrentPage(nextPagination?.page ?? page);
      } catch (err) {
        setRooms([]);
        setPagination(defaultPagination());
        setError(
          getApiErrorMessage(err, "Không tải được danh sách phòng từ máy chủ."),
        );
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const loadTotalAvailable = useCallback(async () => {
    try {
      const response = await roomApi.list({
        page: 1,
        limit: 1,
        status: "AVAILABLE",
      });
      setTotalAvailable(response.pagination?.total ?? response.data?.length ?? 0);
    } catch {
      setTotalAvailable(0);
    }
  }, []);

  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  useFocusEffect(
    useCallback(() => {
      void loadRooms(appliedFiltersRef.current, currentPageRef.current);
      void loadTotalAvailable();
      if (isAuthenticated) {
        void refreshFavorites();
      }
    }, [loadRooms, loadTotalAvailable, isAuthenticated, refreshFavorites]),
  );

  const listings = rooms;

  const availableCount = totalAvailable;

  const activeFilterLabels = useMemo(
    () => buildActiveFilterLabels(appliedFilters),
    [appliedFilters],
  );

  const setDraftField = <K extends keyof FilterForm>(
    key: K,
    value: FilterForm[K],
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const next: FilterForm = { ...appliedFilters, ...draftFilters };
    setAppliedFilters(next);
    setDraftFilters(next);
    setCurrentPage(1);
    void loadRooms(next, 1);
  };

  const handleReset = () => {
    const empty = emptyFilters();
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setCurrentPage(1);
    void loadRooms(empty, 1);
  };

  const handleRoomTypeSelect = (roomType: RoomType) => {
    const nextType: FilterForm["roomType"] =
      appliedFilters.roomType === roomType ? "" : roomType;
    const next: FilterForm = { ...appliedFilters, roomType: nextType };
    setAppliedFilters(next);
    setDraftFilters((prev) => ({ ...prev, roomType: nextType }));
    setCurrentPage(1);
    void loadRooms(next, 1);
  };

  const handlePricePreset = (min?: number, max?: number) => {
    const nextMin = min != null ? String(min) : "";
    const nextMax = max != null ? String(max) : "";
    const isSame =
      appliedFilters.minPrice === nextMin &&
      appliedFilters.maxPrice === nextMax;
    const next: FilterForm = isSame
      ? { ...appliedFilters, minPrice: "", maxPrice: "" }
      : { ...appliedFilters, minPrice: nextMin, maxPrice: nextMax };
    setAppliedFilters(next);
    setDraftFilters((prev) => ({
      ...prev,
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
    }));
    setCurrentPage(1);
    void loadRooms(next, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    void loadRooms(appliedFilters, page);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadRooms(appliedFilters, currentPage, true)}
              tintColor="#E68A2E"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 120 + insets.bottom,
          }}
        >
          <View style={styles.heroRow}>
            <ThemedText type="title" style={styles.heroTitle}>
              Tìm phòng phù hợp với bạn
            </ThemedText>
            <Pressable
              style={styles.aiButton}
              onPress={() => {
                if (!requireTenant("ai_search", { requireAuth: true })) return;
                router.push("/sv/ai_search_page" as any);
              }}
            >
              <Text style={styles.aiButtonText}>✨</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Text style={styles.statLabel}>KẾT QUẢ HIỂN THỊ</Text>
              <Text style={styles.statValue}>{listings.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ĐANG MỞ BÁN</Text>
              <Text style={[styles.statValue, styles.statValueAccent]}>
                {availableCount}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionIcon}>🏢</Text>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Loại phòng
              </ThemedText>
            </View>
            <View style={styles.roomTypeGrid}>
              {ROOM_TYPE_PRESETS.map((preset) => {
                const active = appliedFilters.roomType === preset.value;
                return (
                  <Pressable
                    key={preset.value}
                    style={[
                      styles.roomTypeCard,
                      active && styles.roomTypeCardActive,
                    ]}
                    onPress={() => handleRoomTypeSelect(preset.value)}
                  >
                    <View style={styles.roomTypeCardTop}>
                      <View
                        style={[
                          styles.roomTypeIconWrap,
                          active && styles.roomTypeIconWrapActive,
                        ]}
                      >
                        <Text style={styles.roomTypeIcon}>{preset.icon}</Text>
                      </View>
                      <Text
                        style={[
                          styles.roomTypeCode,
                          active && styles.roomTypeCodeActive,
                        ]}
                      >
                        {preset.value}
                      </Text>
                    </View>
                    <ThemedText
                      type="smallBold"
                      style={[
                        styles.roomTypeLabel,
                        active && styles.roomTypeLabelActive,
                      ]}
                    >
                      {preset.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <CollapsibleFilterCard
            title="Tìm kiếm"
            icon="⌕"
            expanded={searchExpanded}
            onToggle={() => setSearchExpanded((prev) => !prev)}
            summary={buildSearchSummary(appliedFilters)}
          >
            <FieldLabel label="Từ khóa" />
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>⌕</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên phòng"
                placeholderTextColor="#94A3B8"
                value={draftFilters.keyword}
                onChangeText={(value) => setDraftField("keyword", value)}
                returnKeyType="search"
                onSubmitEditing={handleApplyFilters}
              />
            </View>

            <View style={styles.fieldSpacer} />
            <FieldLabel label="Quận/Huyện" />
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="VD: Long Bình"
                placeholderTextColor="#94A3B8"
                value={draftFilters.district}
                onChangeText={(value) => setDraftField("district", value)}
                returnKeyType="search"
                onSubmitEditing={handleApplyFilters}
              />
            </View>

            <View style={styles.filterActions}>
              <Pressable style={styles.applyButton} onPress={handleApplyFilters}>
                <ThemedText type="smallBold" style={styles.applyButtonText}>
                  Áp dụng
                </ThemedText>
              </Pressable>
              <Pressable style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>↺</Text>
              </Pressable>
            </View>
          </CollapsibleFilterCard>

          <CollapsibleFilterCard
            title="Khoảng giá"
            icon="💰"
            expanded={priceExpanded}
            onToggle={() => setPriceExpanded((prev) => !prev)}
            summary={buildPriceSummary(appliedFilters)}
          >
            <ThemedText type="small" style={styles.priceHint}>
              Chọn nhanh theo ngân sách hoặc nhập mức giá cụ thể.
            </ThemedText>

            <View style={styles.priceInputRow}>
              <View style={styles.priceInputCol}>
                <FieldLabel label="Tối thiểu" />
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="3000000"
                    placeholderTextColor="#94A3B8"
                    value={draftFilters.minPrice}
                    onChangeText={(value) => setDraftField("minPrice", value)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={styles.priceInputCol}>
                <FieldLabel label="Tối đa" />
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="8000000"
                    placeholderTextColor="#94A3B8"
                    value={draftFilters.maxPrice}
                    onChangeText={(value) => setDraftField("maxPrice", value)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.pricePresetList}>
              {PRICE_PRESETS.map((preset) => {
                const active =
                  String(preset.minPrice ?? "") === appliedFilters.minPrice &&
                  String(preset.maxPrice ?? "") === appliedFilters.maxPrice;
                return (
                  <Pressable
                    key={preset.label}
                    style={[
                      styles.pricePreset,
                      active && styles.pricePresetActive,
                    ]}
                    onPress={() =>
                      handlePricePreset(preset.minPrice, preset.maxPrice)
                    }
                  >
                    <ThemedText
                      type="smallBold"
                      style={[
                        styles.pricePresetText,
                        active && styles.pricePresetTextActive,
                      ]}
                    >
                      {preset.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </CollapsibleFilterCard>

          {activeFilterLabels.length > 0 ? (
            <View style={styles.activeFilters}>
              {activeFilterLabels.map((label) => (
                <View key={label} style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {isLoading && !refreshing ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.skeletonCard} />
              ))}
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.centerBox}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
              <Pressable
                style={styles.retryButton}
                onPress={() => void loadRooms(appliedFilters, currentPage)}
              >
                <ThemedText type="smallBold" style={styles.retryText}>
                  Thử lại
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && listings.length === 0 ? (
            <View style={styles.emptyCard}>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Chưa có phòng phù hợp với bộ lọc hiện tại.
              </ThemedText>
              <ThemedText type="small" style={styles.emptyText}>
                Thử mở rộng mức giá, đổi khu vực hoặc reset bộ lọc để xem thêm
                lựa chọn.
              </ThemedText>
            </View>
          ) : null}

          {!isLoading && !error
            ? listings.map((room) => (
                <RoomListCard
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

          {!isLoading && !error && pagination.totalPages > 1 ? (
            <RoomPagination
              page={currentPage}
              totalPages={pagination.totalPages}
              disabled={isLoading || refreshing}
              onPageChange={handlePageChange}
            />
          ) : null}
        </ScrollView>

        {isAuthenticated ? <BottomNavigation activeTab="explore" /> : null}
        <TenantGatePrompt />
      </SafeAreaView>
    </ThemedView>
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
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  heroTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    color: "#1F2940",
    fontWeight: "800",
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonText: {
    fontSize: 20,
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
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
  },
  statCardPrimary: {
    backgroundColor: "rgba(232, 138, 46, 0.08)",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  statValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
  },
  statValueAccent: {
    color: "#E68A2E",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 14,
  },
  roomTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  roomTypeCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    padding: 14,
  },
  roomTypeCardActive: {
    backgroundColor: "#E68A2E",
    borderColor: "#E68A2E",
    shadowColor: "#E68A2E",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  roomTypeCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roomTypeIconWrap: {
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    borderRadius: 10,
    padding: 8,
  },
  roomTypeIconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  roomTypeIcon: {
    fontSize: 16,
  },
  roomTypeCode: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  roomTypeCodeActive: {
    color: "rgba(255,255,255,0.85)",
  },
  roomTypeLabel: {
    marginTop: 12,
    color: "#0F172A",
    fontSize: 15,
  },
  roomTypeLabelActive: {
    color: "#FFFFFF",
  },
  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  collapsibleHeaderMain: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  collapsibleBody: {
    marginTop: 14,
  },
  collapsedSummary: {
    color: "#64748B",
    lineHeight: 18,
  },
  collapseButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  fieldSpacer: {
    height: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  inputIcon: {
    fontSize: 16,
    color: "#94A3B8",
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
    paddingVertical: 0,
  },
  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#E68A2E",
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  resetButtonText: {
    fontSize: 18,
    color: "#64748B",
  },
  priceHint: {
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  priceInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  priceInputCol: {
    flex: 1,
  },
  pricePresetList: {
    gap: 8,
  },
  pricePreset: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pricePresetActive: {
    backgroundColor: "#E68A2E",
    borderColor: "#E68A2E",
  },
  pricePresetText: {
    color: "#475569",
    fontSize: 12,
  },
  pricePresetTextActive: {
    color: "#FFFFFF",
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  activeFilterPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.15)",
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E68A2E",
  },
  skeletonGrid: {
    gap: 14,
    marginBottom: 8,
  },
  skeletonCard: {
    height: 360,
    borderRadius: 16,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#E68A2E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    padding: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrap: {
    position: "relative",
    backgroundColor: "rgba(148, 163, 184, 0.2)",
  },
  cardImage: {
    width: "100%",
    height: 224,
  },
  cardBody: {
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    lineHeight: 22,
  },
  cardLocation: {
    color: "#64748B",
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    color: "#64748B",
    minWidth: "30%",
  },
  amenityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityPill: {
    backgroundColor: "rgba(232, 138, 46, 0.1)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E68A2E",
  },
  amenityPillMuted: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amenityTextMuted: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 10,
  },
  priceWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  cardPrice: {
    color: "#E68A2E",
    fontSize: 18,
  },
  cardPriceUnit: {
    color: "#94A3B8",
    fontSize: 12,
  },
  detailButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
    gap: 12,
  },
  paginationLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paginationButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(232, 138, 46, 0.12)",
    minWidth: 72,
    alignItems: "center",
  },
  paginationButtonDisabled: {
    opacity: 0.85,
  },
  paginationButtonText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  paginationButtonTextActive: {
    fontWeight: "800",
  },
  paginationButtonTextDisabled: {
    color: "#94A3B8",
    fontWeight: "500",
  },
});
