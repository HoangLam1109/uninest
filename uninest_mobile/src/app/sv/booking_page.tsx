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
  TextInput,
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
import type { Identity } from "@/types/identity";
import type { Room } from "@/types/room";
import { formatRoomLocation, sortRoomImages, getRoomImageSource } from "@/utils/room-display";
import {
  toBookingIsoDate,
  validateBookingNotes,
  validateCheckInDate,
} from "@/utils/validation/booking";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function getDefaultCheckIn() {
  return startOfDay(new Date());
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
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function formatMonthTitle(date: Date) {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
}

export default function BookingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
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
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loadingIdentities, setLoadingIdentities] = useState(true);
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const calendarCells = useMemo(() => buildCalendarCells(viewMonth), [viewMonth]);

  const canSubmit =
    Boolean(roomId) &&
    Boolean(room) &&
    selectedIdentityIds.length > 0 &&
    !loadingIdentities &&
    !submitting;

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

    const checkInError = validateCheckInDate(selectedDate);
    if (checkInError) {
      Alert.alert("Ngày không hợp lệ", checkInError);
      return;
    }

    const notesError = validateBookingNotes(notes);
    if (notesError) {
      Alert.alert("Ghi chú không hợp lệ", notesError);
      return;
    }

    if (selectedIdentityIds.length === 0) {
      Alert.alert(
        "Thiếu hồ sơ định danh",
        identities.length === 0
          ? "Bạn cần có hồ sơ định danh đã xác minh mới được đặt phòng."
          : "Vui lòng chọn ít nhất một hồ sơ định danh đã xác minh.",
        identities.length === 0
          ? [
              { text: "Để sau", style: "cancel" },
              {
                text: "Tạo hồ sơ",
                onPress: () => router.push("/sv/profile_identity_page" as any),
              },
            ]
          : [{ text: "OK" }],
      );
      return;
    }

    setSubmitting(true);
    try {
      const trimmedNotes = notes.trim();
      const checkInIso = toBookingIsoDate(selectedDate);
      const res = await bookingApi.create({
        roomId,
        checkInDate: checkInIso,
        identityIds: selectedIdentityIds,
        notes: trimmedNotes || undefined,
      });

      router.replace({
        pathname: "/sv/booking_success_page",
        params: {
          bookingId: String(res.data._id),
          roomTitle: room.title,
          checkInDate: checkInIso,
          roomLocation: formatRoomLocation(room),
          notes: trimmedNotes,
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
            Đặt phòng
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
                paddingBottom: 100 + insets.bottom,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.section}>
                <View style={styles.roomHighlight}>
                  <ThemedText type="smallBold" style={styles.roomHighlightLabel}>
                    Phòng đang đặt
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.roomHighlightTitle}>
                    {displayTitle}
                  </ThemedText>
                  {room ? (
                    <ThemedText type="small" style={styles.roomHighlightMeta}>
                      📍 {formatRoomLocation(room)}
                    </ThemedText>
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Hồ sơ định danh <Text style={styles.required}>*</Text>
                </ThemedText>

                <View style={styles.tenantSummary}>
                  <View style={styles.tenantSummaryMain}>
                    <ThemedText type="smallBold" style={styles.tenantName}>
                      {user?.fullName ?? "Người thuê"}
                    </ThemedText>
                    <ThemedText type="small" style={styles.tenantMeta}>
                      {[user?.phone, user?.email].filter(Boolean).join(" • ")}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={styles.identityCount}>
                    {loadingIdentities
                      ? "..."
                      : `${selectedIdentityIds.length}/${identities.length} hồ sơ`}
                  </ThemedText>
                </View>

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
                      Bạn chưa có hồ sơ định danh. Vui lòng tạo hồ sơ và chờ xác
                      minh để có thể đặt phòng.
                    </ThemedText>
                    <Pressable
                      style={styles.identityLinkButton}
                      onPress={() =>
                        router.push("/sv/profile_identity_page" as any)
                      }
                    >
                      <ThemedText type="smallBold" style={styles.identityLinkText}>
                        Tạo hồ sơ định danh →
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
                              {identity.phone ? ` • ${identity.phone}` : ""}
                            </ThemedText>
                          </View>
                          <ThemedText type="small" style={styles.verifiedBadge}>
                            Đã xác minh
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {selectedIdentityIds.length > 0 ? (
                  <ThemedText type="small" style={styles.selectedHint}>
                    Đã chọn {selectedIdentityIds.length} hồ sơ định danh
                  </ThemedText>
                ) : !loadingIdentities && identities.length > 0 ? (
                  <ThemedText type="small" style={styles.warningHint}>
                    Bạn cần chọn ít nhất một hồ sơ định danh đã xác minh.
                  </ThemedText>
                ) : null}
              </View>

              <View style={styles.section}>
                <ThemedText type="title" style={styles.sectionTitle}>
                  Ngày đến xem phòng <Text style={styles.required}>*</Text>
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
                  Ghi chú
                </ThemedText>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ví dụ: tôi muốn thuê dài hạn, cần tư vấn về phòng"
                  placeholderTextColor="#A89888"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={styles.notesInput}
                />
                <ThemedText type="small" style={styles.notesHint}>
                  Tối đa 500 ký tự
                </ThemedText>
              </View>

              {room ? (
                <View style={styles.section}>
                  <View style={styles.propertyCard}>
                    <Image
                      source={getRoomImageSource(imageUrl)}
                      style={styles.propertyImage}
                      contentFit="cover"
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <Pressable
                style={[
                  styles.confirmButton,
                  !canSubmit && styles.confirmButtonDisabled,
                ]}
                disabled={!canSubmit}
                onPress={() => void handleConfirm()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={styles.confirmText}>
                    Gửi yêu cầu đặt phòng
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
    fontSize: 22,
    marginBottom: 14,
  },
  required: {
    color: "#D14343",
  },
  roomHighlight: {
    backgroundColor: "rgba(242, 140, 27, 0.12)",
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  roomHighlightLabel: {
    color: "#F28C1B",
    fontSize: 14,
  },
  roomHighlightTitle: {
    color: "#3F2F22",
    fontSize: 18,
  },
  roomHighlightMeta: {
    color: "#8D96A7",
  },
  tenantSummary: {
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
  tenantSummaryMain: {
    flex: 1,
    gap: 4,
  },
  tenantName: {
    color: "#3F2F22",
    fontSize: 16,
  },
  tenantMeta: {
    color: "#8E95A3",
  },
  identityCount: {
    color: "#9AA0A9",
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
  verifiedBadge: {
    color: "#2E9B57",
    fontWeight: "700",
    fontSize: 11,
  },
  selectedHint: {
    color: "#F28C1B",
    marginTop: 10,
  },
  warningHint: {
    color: "#C47A10",
    marginTop: 10,
    fontWeight: "600",
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
    marginBottom: 10,
  },
  weekText: {
    width: "14.28%",
    textAlign: "center",
    color: "#9AA0A9",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  notesInput: {
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#3F2F22",
    fontSize: 15,
    lineHeight: 22,
  },
  notesHint: {
    color: "#9AA0A9",
    marginTop: 8,
  },
  propertyCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#D7C7B1",
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
  },
  confirmButton: {
    minHeight: 56,
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
