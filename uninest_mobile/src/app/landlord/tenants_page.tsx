import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
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
import { contractApi } from "@/api/contract.api";
import { roomApi } from "@/api/room.api";
import { LandlordBottomNavigation } from "@/components/landlord/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Contract } from "@/types/contract";
import type { LandlordTenant } from "@/types/tenant";
import {
  bookingStatusLabel,
  formatBookingDate,
  formatSubmittedAgo,
  getBookingRoom,
  getBookingTenant,
} from "@/utils/booking-display";
import {
  contractStatusLabel,
  getContractBookingId,
} from "@/utils/contract-display";
import { formatPrice } from "@/utils/room-display";

type PageSection = "requests" | "active";

const BOOKING_FILTERS: { id: "ALL" | BookingStatus; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã chấp nhận" },
  { id: "REJECTED", label: "Từ chối" },
  { id: "CANCELLED", label: "Đã hủy" },
];

function bookingBadgeStyle(status: BookingStatus) {
  if (status === "PENDING") return styles.badgePending;
  if (status === "APPROVED") return styles.badgeApproved;
  if (status === "REJECTED") return styles.badgeRejected;
  return styles.badgeCancelled;
}

function contractBadgeStyle(status?: string) {
  if (status === "DRAFT") return styles.badgeDraft;
  if (status === "PENDING_TENANT_SIGNATURE") return styles.badgePendingSign;
  if (status === "ACTIVE") return styles.badgeContractActive;
  return styles.badgeCancelled;
}

export default function LandlordTenantsPage() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<PageSection>("requests");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<LandlordTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"ALL" | BookingStatus>(
    "PENDING",
  );
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [bookingsRes, tenantsRes, contractsRes] = await Promise.all([
        bookingApi.listLandlord({
          page: 1,
          limit: 100,
          status: bookingFilter === "ALL" ? undefined : bookingFilter,
        }),
        roomApi.listTenants(),
        contractApi.listLandlord({ page: 1, limit: 100 }),
      ]);
      setBookings(bookingsRes.data ?? []);
      setTenants(tenantsRes.data ?? []);
      setContracts(contractsRes.data ?? []);
    } catch (err) {
      Alert.alert(
        "Không tải được dữ liệu",
        getApiErrorMessage(err, "Vui lòng thử lại."),
      );
      setBookings([]);
      setTenants([]);
      setContracts([]);
    }
  }, [bookingFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  useEffect(() => {
    if (section !== "requests") return;
    setLoading(true);
    void loadData().finally(() => setLoading(false));
  }, [bookingFilter, section, loadData]);

  const bookingSummary = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        if (booking.status === "PENDING") acc.pending += 1;
        if (booking.status === "APPROVED") acc.approved += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0 },
    );
  }, [bookings]);

  const contractByBookingId = useMemo(() => {
    const map = new Map<string, Contract>();
    for (const contract of contracts) {
      const bookingId = getContractBookingId(contract);
      if (bookingId) map.set(bookingId, contract);
    }
    return map;
  }, [contracts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = (booking: Booking) => {
    Alert.alert(
      "Duyệt đơn đặt phòng",
      `Chấp nhận yêu cầu của ${getBookingTenant(booking)?.fullName ?? "người thuê"}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Duyệt",
          onPress: () => {
            setActionTargetId(booking._id);
            void bookingApi
              .approve(booking._id)
              .then(() => loadData())
              .then(() =>
                Alert.alert("Thành công", "Đã duyệt đơn đặt phòng."),
              )
              .catch((err) =>
                Alert.alert(
                  "Duyệt thất bại",
                  getApiErrorMessage(err, "Không thể duyệt đơn."),
                ),
              )
              .finally(() => setActionTargetId(null));
          },
        },
      ],
    );
  };

  const handleReject = (booking: Booking) => {
    Alert.alert(
      "Từ chối đơn đặt phòng",
      `Từ chối yêu cầu của ${getBookingTenant(booking)?.fullName ?? "người thuê"}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: () => {
            setActionTargetId(booking._id);
            void bookingApi
              .reject(booking._id)
              .then(() => loadData())
              .then(() =>
                Alert.alert("Đã từ chối", "Đơn đặt phòng đã bị từ chối."),
              )
              .catch((err) =>
                Alert.alert(
                  "Thao tác thất bại",
                  getApiErrorMessage(err, "Không thể từ chối đơn."),
                ),
              )
              .finally(() => setActionTargetId(null));
          },
        },
      ],
    );
  };

  const handleCreateContract = (booking: Booking) => {
    const room = getBookingRoom(booking);
    const tenant = getBookingTenant(booking);
    const monthlyRent = room?.pricePerMonth ?? 0;

    if (!monthlyRent) {
      Alert.alert("Thiếu thông tin", "Không xác định được giá thuê của phòng.");
      return;
    }

    Alert.alert(
      "Tạo hợp đồng",
      `Tạo hợp đồng cho ${tenant?.fullName ?? "người thuê"} với giá ${formatPrice(monthlyRent)}/tháng?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tạo",
          onPress: () => {
            setActionTargetId(booking._id);
            void contractApi
              .createFromBooking({
                bookingId: booking._id,
                monthlyRent,
                depositAmount: monthlyRent,
                startDate: booking.checkInDate,
                endDate: booking.checkOutDate,
              })
              .then(() => loadData())
              .then(() =>
                Alert.alert(
                  "Thành công",
                  "Đã tạo hợp đồng nháp. Bạn có thể gửi cho người thuê ký.",
                ),
              )
              .catch((err) =>
                Alert.alert(
                  "Tạo hợp đồng thất bại",
                  getApiErrorMessage(err, "Không thể tạo hợp đồng."),
                ),
              )
              .finally(() => setActionTargetId(null));
          },
        },
      ],
    );
  };

  const handleActivateContract = (contract: Contract) => {
    Alert.alert(
      "Gửi hợp đồng",
      "Gửi hợp đồng cho người thuê ký xác nhận?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          onPress: () => {
            setActionTargetId(contract._id);
            void contractApi
              .activate(contract._id)
              .then(() => loadData())
              .then(() =>
                Alert.alert(
                  "Đã gửi",
                  "Hợp đồng đang chờ người thuê ký xác nhận.",
                ),
              )
              .catch((err) =>
                Alert.alert(
                  "Gửi thất bại",
                  getApiErrorMessage(err, "Không thể gửi hợp đồng."),
                ),
              )
              .finally(() => setActionTargetId(null));
          },
        },
      ],
    );
  };

  const handleDeleteBooking = (booking: Booking) => {
    Alert.alert("Xóa đơn", "Bạn có chắc muốn xóa đơn đặt phòng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setActionTargetId(booking._id);
          void bookingApi
            .delete(booking._id)
            .then(() => loadData())
            .catch((err) =>
              Alert.alert(
                "Xóa thất bại",
                getApiErrorMessage(err, "Không thể xóa đơn."),
              ),
            )
            .finally(() => setActionTargetId(null));
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor="#E68A2E"
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Người thuê
            </ThemedText>
            <ThemedText type="small" style={styles.pageSubtitle}>
              Duyệt yêu cầu đặt phòng và quản lý người đang thuê
            </ThemedText>
          </View>

          <View style={styles.sectionTabs}>
            <Pressable
              style={[
                styles.sectionTab,
                section === "requests" && styles.sectionTabActive,
              ]}
              onPress={() => setSection("requests")}
            >
              <ThemedText
                type="smallBold"
                style={[
                  styles.sectionTabText,
                  section === "requests" && styles.sectionTabTextActive,
                ]}
              >
                Yêu cầu đặt phòng
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.sectionTab,
                section === "active" && styles.sectionTabActive,
              ]}
              onPress={() => setSection("active")}
            >
              <ThemedText
                type="smallBold"
                style={[
                  styles.sectionTabText,
                  section === "active" && styles.sectionTabTextActive,
                ]}
              >
                Đang thuê ({tenants.length})
              </ThemedText>
            </Pressable>
          </View>

          {section === "requests" ? (
            <>
              <View style={styles.statsRow}>
                <StatCard label="Tổng đơn" value={String(bookingSummary.total)} />
                <StatCard
                  label="Chờ duyệt"
                  value={String(bookingSummary.pending)}
                  accent="#C47A10"
                />
                <StatCard
                  label="Đã chấp nhận"
                  value={String(bookingSummary.approved)}
                  accent="#2E8B57"
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {BOOKING_FILTERS.map((item) => {
                  const active = bookingFilter === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setBookingFilter(item.id)}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActive,
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.filterChipText,
                          active && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {loading ? (
                <ActivityIndicator
                  color="#E68A2E"
                  style={{ marginTop: 40 }}
                  size="large"
                />
              ) : bookings.length === 0 ? (
                <EmptyCard
                  icon="📋"
                  title="Chưa có yêu cầu"
                  text="Khi sinh viên đặt phòng, đơn sẽ hiển thị tại đây để bạn duyệt."
                />
              ) : (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    contract={contractByBookingId.get(booking._id)}
                    busy={
                      actionTargetId === booking._id ||
                      actionTargetId === contractByBookingId.get(booking._id)?._id
                    }
                    onApprove={() => handleApprove(booking)}
                    onReject={() => handleReject(booking)}
                    onCreateContract={() => handleCreateContract(booking)}
                    onActivateContract={handleActivateContract}
                    onDelete={() => handleDeleteBooking(booking)}
                  />
                ))
              )}
            </>
          ) : loading ? (
            <ActivityIndicator
              color="#E68A2E"
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : tenants.length === 0 ? (
            <EmptyCard
              icon="👥"
              title="Chưa có người thuê"
              text="Danh sách người đang thuê phòng của bạn sẽ hiển thị tại đây."
            />
          ) : (
            tenants.map((tenant) => (
              <TenantCard key={`${tenant.tenantId}-${tenant.roomTitle}`} tenant={tenant} />
            ))
          )}
        </ScrollView>

        <LandlordBottomNavigation activeTab="tenants" />
      </SafeAreaView>
    </View>
  );
}

function StatCard({
  label,
  value,
  accent = "#1F2940",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function EmptyCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <ThemedText type="smallBold" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      <ThemedText type="small" style={styles.emptyText}>
        {text}
      </ThemedText>
    </View>
  );
}

function BookingCard({
  booking,
  contract,
  busy,
  onApprove,
  onReject,
  onCreateContract,
  onActivateContract,
  onDelete,
}: {
  booking: Booking;
  contract?: Contract;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCreateContract: () => void;
  onActivateContract: (contract: Contract) => void;
  onDelete: () => void;
}) {
  const tenant = getBookingTenant(booking);
  const room = getBookingRoom(booking);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.cardMain}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {tenant?.fullName ?? "Người thuê"}
          </ThemedText>
          <ThemedText type="small" style={styles.cardMeta}>
            {tenant?.email ?? "—"}
            {tenant?.phone ? ` • ${tenant.phone}` : ""}
          </ThemedText>
        </View>
        <View style={[styles.badge, bookingBadgeStyle(booking.status)]}>
          <ThemedText type="small" style={styles.badgeText}>
            {bookingStatusLabel(booking.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.infoBox}>
        <InfoRow label="Phòng" value={room?.title ?? "—"} />
        <InfoRow label="Địa chỉ" value={room?.address ?? "—"} />
        {room?.pricePerMonth ? (
          <InfoRow
            label="Giá thuê"
            value={`${formatPrice(room.pricePerMonth)}/tháng`}
          />
        ) : null}
        <InfoRow
          label="Ngày vào"
          value={formatBookingDate(booking.checkInDate)}
        />
        {booking.checkOutDate ? (
          <InfoRow
            label="Ngày ra"
            value={formatBookingDate(booking.checkOutDate)}
          />
        ) : null}
        <InfoRow
          label="Gửi lúc"
          value={formatSubmittedAgo(booking.createdAt)}
        />
        {booking.notes ? (
          <InfoRow label="Ghi chú" value={booking.notes} />
        ) : null}
        {contract ? (
          <View style={styles.contractRow}>
            <ThemedText type="small" style={styles.infoLabel}>
              Hợp đồng
            </ThemedText>
            <View style={[styles.badge, contractBadgeStyle(contract.status)]}>
              <ThemedText type="small" style={styles.badgeText}>
                {contractStatusLabel(contract.status)}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>

      {booking.status === "PENDING" ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnReject]}
            onPress={onReject}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#D14343" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnRejectText}>
                Từ chối
              </ThemedText>
            )}
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnApprove]}
            onPress={onApprove}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnApproveText}>
                Duyệt đơn
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}

      {booking.status === "APPROVED" && !contract ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnApprove]}
            onPress={onCreateContract}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnApproveText}>
                Tạo hợp đồng
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}

      {contract?.status === "DRAFT" ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnApprove]}
            onPress={() => onActivateContract(contract)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnApproveText}>
                Gửi ký
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}

      {booking.status === "REJECTED" || booking.status === "CANCELLED" ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnReject]}
            onPress={onDelete}
            disabled={busy}
          >
            <ThemedText type="smallBold" style={styles.actionBtnRejectText}>
              Xóa đơn
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function TenantCard({ tenant }: { tenant: LandlordTenant }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.cardMain}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            {tenant.tenantName}
          </ThemedText>
          <ThemedText type="small" style={styles.cardMeta}>
            {tenant.tenantEmail}
            {tenant.tenantPhone ? ` • ${tenant.tenantPhone}` : ""}
          </ThemedText>
        </View>
        {tenant.isPrimaryTenant ? (
          <View style={[styles.badge, styles.badgePrimary]}>
            <ThemedText type="small" style={styles.badgePrimaryText}>
              CHÍNH
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.infoBox}>
        <InfoRow label="Phòng" value={tenant.roomTitle} />
        <InfoRow label="Địa chỉ" value={tenant.address} />
        {tenant.cccdNumber ? (
          <InfoRow label="CCCD" value={tenant.cccdNumber} />
        ) : null}
        {tenant.dateOfBirth ? (
          <InfoRow
            label="Ngày sinh"
            value={formatBookingDate(tenant.dateOfBirth)}
          />
        ) : null}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 24,
    color: "#1F2940",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "#7A869A",
    lineHeight: 18,
  },
  sectionTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  sectionTabActive: {
    backgroundColor: "#FFF0DF",
  },
  sectionTabText: {
    color: "#7A869A",
    fontSize: 12,
  },
  sectionTabTextActive: {
    color: "#C47A10",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  statLabel: {
    color: "#7A869A",
    fontSize: 10,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  filterChipActive: {
    backgroundColor: "#FFF0DF",
    borderColor: "#E68A2E",
  },
  filterChipText: {
    color: "#7A869A",
  },
  filterChipTextActive: {
    color: "#C47A10",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    color: "#1F2940",
    marginBottom: 8,
  },
  emptyText: {
    color: "#7A869A",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    color: "#1F2940",
    marginBottom: 4,
  },
  cardMeta: {
    color: "#7A869A",
    lineHeight: 18,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4B5568",
  },
  badgePending: {
    backgroundColor: "#FFF4D6",
  },
  badgeApproved: {
    backgroundColor: "#E2F5E8",
  },
  badgeRejected: {
    backgroundColor: "#FDECEC",
  },
  badgeCancelled: {
    backgroundColor: "#F0EBE4",
  },
  badgeDraft: {
    backgroundColor: "#F0EBE4",
  },
  badgePendingSign: {
    backgroundColor: "#FFF4D6",
  },
  badgeContractActive: {
    backgroundColor: "#E2F5E8",
  },
  contractRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  badgePrimary: {
    backgroundColor: "#E8F0FF",
  },
  badgePrimaryText: {
    color: "#4B6CB7",
    fontSize: 10,
    fontWeight: "800",
  },
  infoBox: {
    backgroundColor: "#FAFAF8",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: "#9AA3B2",
    fontSize: 11,
  },
  infoValue: {
    color: "#1F2940",
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnReject: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#F5D0D0",
  },
  actionBtnRejectText: {
    color: "#D14343",
  },
  actionBtnApprove: {
    backgroundColor: "#E68A2E",
  },
  actionBtnApproveText: {
    color: "#FFFFFF",
  },
});
