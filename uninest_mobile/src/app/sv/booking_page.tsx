import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { bookingApi } from "@/api/booking.api";
import { identityApi } from "@/api/identity.api";
import { roomApi } from "@/api/room.api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { useTenantGate } from "@/hooks/use-tenant-gate";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Room } from "@/types/room";
import type { Identity } from "@/types/identity";
import { formatPrice, formatRoomLocation, sortRoomImages } from "@/utils/room-display";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const SERVICE_FEE = 200_000;
const PLACEHOLDER_IMAGE = require("@/assets/images/tutorial-web.png");

const TERM_OPTIONS = [
  { label: "NGẮN HẠN", value: "6 tháng", months: 6 },
  { label: "PHỔ BIẾN", value: "12 tháng", months: 12 },
  { label: "ƯU ĐÃI", value: "24 tháng", months: 24 },
] as const;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function getDefaultCheckIn() {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + 7);
  return d;
}

function buildCalendarCells(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

function formatMonthTitle(date: Date) {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
}

export default function BookingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { requireTenant, handleTenantApiError, TenantGatePrompt } = useTenantGate();
  const params = useLocalSearchParams<{ roomId?: string; title?: string }>();
  const roomId =
    typeof params.roomId === "string"
      ? params.roomId
      : Array.isArray(params.roomId)
        ? params.roomId[0]
        : "";

  const [room, setRoom] = useState<Room | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => {
    const checkIn = getDefaultCheckIn();
    return new Date(checkIn.getFullYear(), checkIn.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(getDefaultCheckIn);
  const [termMonths, setTermMonths] = useState<number>(6);
  const [submitting, setSubmitting] = useState(false);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loadingIdentities, setLoadingIdentities] = useState(true);
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const calendarCells = useMemo(() => buildCalendarCells(viewMonth), [viewMonth]);

  const monthlyRent = room?.pricePerMonth ?? 0;
  const deposit = monthlyRent;
  const payNow = monthlyRent + deposit + SERVICE_FEE;

  const loadRoom = useCallback(async () => {
    if (!roomId) {
      setLoadingRoom(false);
      return;
    }
    setLoadingRoom(true);
    try {
      const [roomRes, imagesRes] = await Promise.all([
        roomApi.getById(roomId),
        roomApi.listImages(roomId),
      ]);
      const loaded = roomRes.data
        ? { ...roomRes.data, _id: String(roomRes.data._id) }
        : null;
      setRoom(loaded);
      const sorted = sortRoomImages(imagesRes.data ?? []);
      const primary = sorted.find((img) => img.isPrimary) ?? sorted[0];
      setImageUrl(primary?.url ?? null);
    } catch (error) {
      Alert.alert(
        "Không tải được phòng",
        getApiErrorMessage(error, "Vui lòng thử lại."),
        [{ text: "Quay lại", onPress: () => router.back() }],
      );
    } finally {
      setLoadingRoom(false);
    }
  }, [roomId, router]);

  const loadIdentities = useCallback(async () => {
    setLoadingIdentities(true);
    try {
      const res = await identityApi.getMy();
      const verified = (res.data ?? []).filter(
        (identity) => identity.status === "VERIFIED",
      );
      setIdentities(verified);
      if (verified.length === 1) {
        setSelectedIdentityIds([String(verified[0]._id)]);
      }
    } catch {
      setIdentities([]);
    } finally {
      setLoadingIdentities(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/sv/login_page" as any);
      return;
    }
    if (!roomId) {
      Alert.alert("Thiếu thông tin phòng", "Vui lòng chọn phòng từ trang chi tiết.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }
    void loadRoom();
    void loadIdentities();
  }, [isAuthenticated, loadIdentities, loadRoom, roomId, router]);

  const toggleIdentity = (id: string) => {
    setSelectedIdentityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    if (!roomId || !room || submitting) return;
    if (!requireTenant("booking")) return;

    if (startOfDay(selectedDate) < today) {
      Alert.alert("Ngày không hợp lệ", "Vui lòng chọn ngày nhận phòng từ hôm nay trở đi.");
      return;
    }

    if (selectedIdentityIds.length === 0) {
      Alert.alert(
        "Thiếu hồ sơ định danh",
        identities.length === 0
          ? "Bạn cần xác minh CCCD trước khi đặt phòng. Vào Hồ sơ → Xác minh danh tính."
          : "Vui lòng chọn ít nhất một hồ sơ định danh đã xác minh.",
        identities.length === 0
          ? [
              { text: "Để sau", style: "cancel" },
              {
                text: "Xác minh ngay",
                onPress: () => router.push("/sv/profile_identity_page" as any),
              },
            ]
          : [{ text: "OK" }],
      );
      return;
    }

    setSubmitting(true);
    try {
      const checkOutDate = addMonths(selectedDate, termMonths);
      const res = await bookingApi.create({
        roomId,
        checkInDate: selectedDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        identityIds: selectedIdentityIds,
        notes: `Thời hạn thuê ${termMonths} tháng`,
      });

      router.replace({
        pathname: "/sv/booking_success_page",
        params: {
          bookingId: String(res.data._id),
          roomTitle: room.title,
        },
      } as any);
    } catch (error) {
      if (!handleTenantApiError(error, "booking")) {
        Alert.alert(
          "Không đặt được phòng",
          getApiErrorMessage(error, "Vui lòng thử lại sau."),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayTitle =
    room?.title ??
    (typeof params.title === "string" ? params.title : "Phòng đang đặt");

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { top: insets.top }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Đặt phòng UniNest
          </ThemedText>
          <View style={styles.iconButton} />
        </View>

        {loadingRoom ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#F28C1B" />
            <ThemedText type="small" style={styles.loadingText}>
              Đang tải thông tin phòng...
            </ThemedText>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{
                paddingTop: insets.top + 64,
                paddingBottom: 170 + insets.bottom,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Ngày nhận phòng
                </ThemedText>
                <View style={styles.calendarCard}>
                  <View style={styles.calendarHeader}>
                    <Pressable
                      style={styles.chevronButton}
                      onPress={() => shiftMonth(-1)}
                    >
                      <Text style={styles.chevronText}>‹</Text>
                    </Pressable>
                    <ThemedText type="smallBold" style={styles.monthTitle}>
                      {formatMonthTitle(viewMonth)}
                    </ThemedText>
                    <Pressable
                      style={styles.chevronButton}
                      onPress={() => shiftMonth(1)}
                    >
                      <Text style={styles.chevronText}>›</Text>
                    </Pressable>
                  </View>

                  <View style={styles.weekRow}>
                    {WEEKDAYS.map((day) => (
                      <Text key={day} style={styles.weekText}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.grid}>
                    {calendarCells.map((date, index) => {
                      if (!date) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                      }
                      const selected = isSameDay(date, selectedDate);
                      const isPast = startOfDay(date) < today;
                      return (
                        <Pressable
                          key={date.toISOString()}
                          style={[
                            styles.dayCell,
                            selected && styles.dayCellSelected,
                          ]}
                          disabled={isPast}
                          onPress={() => setSelectedDate(date)}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isPast && styles.dayTextMuted,
                              selected && styles.dayTextSelected,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Thời hạn thuê
                </ThemedText>
                <View style={styles.termRow}>
                  {TERM_OPTIONS.map((term) => (
                    <TermChip
                      key={term.months}
                      label={term.label}
                      value={term.value}
                      active={termMonths === term.months}
                      onPress={() => setTermMonths(term.months)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.propertyCard}>
                  <View style={styles.propertyRow}>
                    <Image
                      source={imageUrl ? { uri: imageUrl } : PLACEHOLDER_IMAGE}
                      style={styles.propertyImage}
                      contentFit="cover"
                    />
                    <View style={styles.propertyMeta}>
                      <ThemedText type="smallBold" style={styles.propertyTitle}>
                        {displayTitle}
                      </ThemedText>
                      <ThemedText type="small" style={styles.propertyLocation}>
                        📍 {room ? formatRoomLocation(room) : "—"}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.line} />

                  <View style={styles.priceRows}>
                    <PriceRow
                      label={`Giá thuê (${termMonths} tháng)`}
                      value={`${formatPrice(monthlyRent)} / tháng`}
                    />
                    <PriceRow
                      label="Tiền cọc (1 tháng)"
                      value={formatPrice(deposit)}
                    />
                    <PriceRow
                      label="Phí dịch vụ"
                      value={formatPrice(SERVICE_FEE)}
                    />
                  </View>

                  <View style={styles.totalRow}>
                    <ThemedText type="smallBold" style={styles.totalLabel}>
                      Tổng thanh toán dự kiến
                    </ThemedText>
                    <ThemedText type="title" style={styles.totalValue}>
                      {formatPrice(payNow)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Hồ sơ định danh
                </ThemedText>
                {loadingIdentities ? (
                  <View style={styles.identityLoading}>
                    <ActivityIndicator color="#F28C1B" />
                    <ThemedText type="small" style={styles.identityHint}>
                      Đang tải hồ sơ...
                    </ThemedText>
                  </View>
                ) : identities.length === 0 ? (
                  <View style={styles.identityEmptyCard}>
                    <ThemedText type="small" style={styles.identityHint}>
                      Bạn chưa có hồ sơ CCCD đã xác minh. Cần xác minh danh tính
                      trước khi đặt phòng.
                    </ThemedText>
                    <Pressable
                      style={styles.identityLinkButton}
                      onPress={() =>
                        router.push("/sv/profile_identity_page" as any)
                      }
                    >
                      <ThemedText type="smallBold" style={styles.identityLinkText}>
                        Xác minh danh tính →
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.identityList}>
                    {identities.map((identity) => {
                      const id = String(identity._id);
                      const selected = selectedIdentityIds.includes(id);
                      return (
                        <Pressable
                          key={id}
                          style={[
                            styles.identityCard,
                            selected && styles.identityCardSelected,
                          ]}
                          onPress={() => toggleIdentity(id)}
                        >
                          <View
                            style={[
                              styles.radio,
                              selected && styles.radioActive,
                            ]}
                          >
                            {selected ? <View style={styles.radioDot} /> : null}
                          </View>
                          <View style={styles.identityMeta}>
                            <ThemedText type="smallBold" style={styles.identityName}>
                              {identity.fullName}
                            </ThemedText>
                            <ThemedText type="small" style={styles.identitySub}>
                              CCCD: {identity.cccdNumber}
                            </ThemedText>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Phương thức thanh toán
                </ThemedText>

                <PaymentOption
                  active
                  title="Chuyển khoản ngân hàng"
                  subtitle="Xác nhận nhanh trong 5–10 phút"
                  icon="🏦"
                />
                <PaymentOption
                  title="Ví điện tử (Momo, ZaloPay)"
                  subtitle="Thanh toán tức thì, bảo mật cao"
                  icon="💳"
                />
                <PaymentOption
                  title="Thẻ quốc tế (Visa, Mastercard)"
                  subtitle="Hỗ trợ trả góp 0% lãi suất"
                  icon="💳"
                />
              </View>

              <View style={styles.section}>
                <View style={styles.policyCard}>
                  <Text style={styles.policyIcon}>ℹ</Text>
                  <View style={styles.policyContent}>
                    <ThemedText type="smallBold" style={styles.policyTitle}>
                      Chính sách hủy phòng
                    </ThemedText>
                    <ThemedText type="small" style={styles.policyText}>
                      Hoàn trả 100% tiền cọc nếu hủy trước ngày nhận phòng 07 ngày.
                      Sau thời gian này, phí hủy sẽ tương đương 50% tiền cọc. Vui
                      lòng xem chi tiết hợp đồng thuê nhà.
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <View style={styles.footerSummary}>
                <ThemedText type="small" style={styles.footerLabel}>
                  Bạn sẽ thanh toán ngay:
                </ThemedText>
                <ThemedText type="smallBold" style={styles.footerPrice}>
                  {formatPrice(payNow)}
                </ThemedText>
              </View>

              <Pressable
                style={[
                  styles.confirmButton,
                  (submitting ||
                    !room ||
                    loadingIdentities ||
                    selectedIdentityIds.length === 0) &&
                    styles.confirmButtonDisabled,
                ]}
                disabled={
                  submitting ||
                  !room ||
                  loadingIdentities ||
                  selectedIdentityIds.length === 0
                }
                onPress={() => void handleConfirm()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.confirmText}>
                    Xác nhận & Thanh toán →
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </>
        )}
        <TenantGatePrompt />
      </SafeAreaView>
    </ThemedView>
  );
}

function TermChip({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.termChip, active && styles.termChipActive]}
      onPress={onPress}
    >
      <ThemedText
        type="smallBold"
        style={[styles.termLabel, active && styles.termLabelActive]}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        style={[styles.termValue, active && styles.termValueActive]}
      >
        {value}
      </ThemedText>
    </Pressable>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceRow}>
      <ThemedText type="small" style={styles.priceLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.priceValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function PaymentOption({
  title,
  subtitle,
  icon,
  active,
}: {
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.paymentCard, active && styles.paymentCardActive]}>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={styles.paymentIcon}>{icon}</Text>
      <View style={styles.paymentTextWrap}>
        <ThemedText type="smallBold" style={styles.paymentTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={styles.paymentSubtitle}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#8A7B68",
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
    borderBottomColor: "rgba(63,47,34,0.08)",
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#3F2F22",
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#3F2F22",
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    color: "#3F2F22",
    fontSize: 24,
    marginBottom: 14,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronText: {
    color: "#3F2F22",
    fontSize: 24,
    fontWeight: "700",
  },
  monthTitle: {
    color: "#3F2F22",
    fontSize: 18,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekText: {
    width: 38,
    textAlign: "center",
    color: "#9AA0A9",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dayCellSelected: {
    backgroundColor: "#F28C1B",
    borderRadius: 18,
    shadowColor: "#F28C1B",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  dayText: {
    color: "#1E2230",
    fontSize: 15,
    fontWeight: "700",
  },
  dayTextMuted: {
    color: "#D1D5DB",
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  termRow: {
    flexDirection: "row",
    gap: 10,
  },
  termChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2DED8",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  termChipActive: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF8F0",
  },
  termLabel: {
    color: "#A49A90",
    fontSize: 12,
  },
  termLabelActive: {
    color: "#F28C1B",
  },
  termValue: {
    color: "#3F2F22",
    fontSize: 16,
  },
  termValueActive: {
    color: "#3F2F22",
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE4DB",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  propertyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  propertyImage: {
    width: 104,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#D7C7B1",
  },
  propertyMeta: {
    flex: 1,
    gap: 6,
  },
  propertyTitle: {
    color: "#3F2F22",
    fontSize: 18,
    lineHeight: 22,
  },
  propertyLocation: {
    color: "#8D96A7",
  },
  line: {
    height: 1,
    backgroundColor: "#F0EBE4",
    marginVertical: 14,
  },
  priceRows: {
    gap: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  priceLabel: {
    color: "#7A7F86",
  },
  priceValue: {
    color: "#3F2F22",
  },
  totalRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EBE4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#3F2F22",
  },
  totalValue: {
    color: "#F28C1B",
    fontSize: 20,
  },
  identityLoading: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  identityHint: {
    color: "#8A7B68",
    lineHeight: 20,
  },
  identityEmptyCard: {
    backgroundColor: "#FFF8EF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBCFA6",
    padding: 14,
    gap: 12,
  },
  identityLinkButton: {
    alignSelf: "flex-start",
  },
  identityLinkText: {
    color: "#F28C1B",
  },
  identityList: {
    gap: 10,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
  },
  identityCardSelected: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF9F1",
  },
  identityMeta: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    color: "#3F2F22",
    fontSize: 16,
  },
  identitySub: {
    color: "#8E95A3",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    padding: 14,
    marginBottom: 12,
  },
  paymentCardActive: {
    borderColor: "#F28C1B",
    backgroundColor: "#FFF9F1",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D0D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#F28C1B",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F28C1B",
  },
  paymentIcon: {
    fontSize: 20,
    color: "#F28C1B",
  },
  paymentTextWrap: {
    flex: 1,
  },
  paymentTitle: {
    color: "#3F2F22",
    fontSize: 16,
  },
  paymentSubtitle: {
    color: "#8E95A3",
    marginTop: 2,
  },
  policyCard: {
    backgroundColor: "#FFF8EF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBCFA6",
    padding: 14,
    flexDirection: "row",
    gap: 10,
  },
  policyIcon: {
    color: "#F28C1B",
    fontSize: 18,
    marginTop: 2,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    color: "#3F2F22",
  },
  policyText: {
    color: "#7A7F86",
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#ECE5DC",
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerSummary: {
    flex: 1,
  },
  footerLabel: {
    color: "#8A8F97",
  },
  footerPrice: {
    color: "#F28C1B",
    fontSize: 24,
    marginTop: 2,
  },
  confirmButton: {
    flex: 1.2,
    minHeight: 76,
    borderRadius: 14,
    backgroundColor: "#F28C1B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 17,
    textAlign: "center",
  },
});
