import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Booking, BookingIdentityRef } from "@/types/booking";
import {
  bookingStatusBadgeStyle,
  bookingStatusLabel,
  formatBookingCurrency,
  formatBookingDate,
  formatRoomLocationParts,
  getBookingRoom,
  getBookingTenant,
} from "@/utils/booking-display";

function getBookingIdentityItems(booking: Booking) {
  return (booking.identityIds ?? []).map((item, index) => {
    if (typeof item === "string") {
      return { id: item, name: `Người ${index + 1}`, cccd: "", phone: "" };
    }
    const identity = item as BookingIdentityRef;
    return {
      id: identity._id,
      name: identity.fullName ?? `Người ${index + 1}`,
      cccd: identity.cccdNumber ?? "",
      phone: identity.phone ?? "",
    };
  });
}

function badgeStyle(status: ReturnType<typeof bookingStatusBadgeStyle>) {
  if (status === "pending") return styles.badgePending;
  if (status === "approved") return styles.badgeApproved;
  if (status === "rejected") return styles.badgeRejected;
  return styles.badgeCancelled;
}

export function LandlordBookingCard({
  booking,
  busy,
  onApprove,
  onReject,
  onDelete,
  onViewIdentity,
}: {
  booking: Booking;
  busy?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onViewIdentity: (identityId: string) => void;
}) {
  const room = getBookingRoom(booking);
  const tenant = getBookingTenant(booking);
  const identities = getBookingIdentityItems(booking);
  const canReview = booking.status === "PENDING";
  const canDelete = !canReview;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderMain}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                badgeStyle(bookingStatusBadgeStyle(booking.status)),
              ]}
            >
              <ThemedText type="small" style={styles.badgeText}>
                {bookingStatusLabel(booking.status)}
              </ThemedText>
            </View>
            {booking.createdAt ? (
              <ThemedText type="small" style={styles.createdAt}>
                Tạo ngày {formatBookingDate(booking.createdAt)}
              </ThemedText>
            ) : null}
          </View>

          <ThemedText type="smallBold" style={styles.roomTitle}>
            {room?.title ?? "Phòng không khả dụng"}
          </ThemedText>
          <ThemedText type="small" style={styles.roomAddress}>
            🏠{" "}
            {room
              ? formatRoomLocationParts(room.address, room.district, room.city)
              : "Chưa có thông tin phòng"}
          </ThemedText>
        </View>

        {room?.pricePerMonth ? (
          <View style={styles.priceBox}>
            <ThemedText type="small" style={styles.priceLabel}>
              GIÁ PHÒNG
            </ThemedText>
            <ThemedText type="smallBold" style={styles.priceValue}>
              {formatBookingCurrency(room.pricePerMonth)}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <ThemedText type="small" style={styles.infoLabel}>
            Ngày đến xem phòng
          </ThemedText>
          <ThemedText type="smallBold" style={styles.infoValue}>
            📅 {formatBookingDate(booking.checkInDate)}
          </ThemedText>
        </View>
        <View style={styles.infoCell}>
          <ThemedText type="small" style={styles.infoLabel}>
            Người thuê
          </ThemedText>
          <ThemedText type="smallBold" style={styles.infoValue}>
            {tenant?.fullName ?? tenant?.email ?? "Chưa có thông tin"}
          </ThemedText>
        </View>
      </View>

      {tenant?.email || tenant?.phone ? (
        <View style={styles.contactRow}>
          {tenant.email ? (
            <ThemedText type="small" style={styles.contactText}>
              ✉ {tenant.email}
            </ThemedText>
          ) : null}
          {tenant.phone ? (
            <ThemedText type="small" style={styles.contactText}>
              ☎ {tenant.phone}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {booking.notes ? (
        <View style={styles.notesBox}>
          <ThemedText type="small" style={styles.infoLabel}>
            Ghi chú
          </ThemedText>
          <ThemedText type="small" style={styles.notesText}>
            {booking.notes}
          </ThemedText>
        </View>
      ) : null}

      {identities.length > 0 ? (
        <View style={styles.identitySection}>
          <ThemedText type="smallBold" style={styles.identityTitle}>
            HỒ SƠ ĐỊNH DANH ({identities.length})
          </ThemedText>
          {identities.map((identity) => (
            <View key={identity.id} style={styles.identityRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" style={styles.identityName}>
                  {identity.name}
                </ThemedText>
                <ThemedText type="small" style={styles.identityMeta}>
                  {identity.cccd ? `CCCD: ${identity.cccd}` : ""}
                  {identity.cccd && identity.phone ? " • " : ""}
                  {identity.phone}
                </ThemedText>
              </View>
              <Pressable
                style={styles.viewIdentityBtn}
                onPress={() => onViewIdentity(identity.id)}
              >
                <ThemedText type="smallBold" style={styles.viewIdentityText}>
                  Xem
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {canReview ? (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={onReject}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#7A869A" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnOutlineText}>
                Từ chối
              </ThemedText>
            )}
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={onApprove}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.actionBtnPrimaryText}>
                Phê duyệt
              </ThemedText>
            )}
          </Pressable>
        </View>
      ) : null}

      {canDelete ? (
        <View style={styles.deleteRow}>
          <Pressable onPress={onDelete} disabled={busy} hitSlop={8}>
            <ThemedText type="small" style={styles.deleteText}>
              🗑 Xóa
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  cardHeaderMain: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePending: {
    backgroundColor: "#FFF4E0",
  },
  badgeApproved: {
    backgroundColor: "#E8F6EE",
  },
  badgeRejected: {
    backgroundColor: "#FDECEC",
  },
  badgeCancelled: {
    backgroundColor: "#F1F3F7",
  },
  badgeText: {
    color: "#1F2940",
    fontSize: 11,
    fontWeight: "700",
  },
  createdAt: {
    color: "#9AA3B2",
    fontSize: 11,
  },
  roomTitle: {
    fontSize: 18,
    color: "#1F2940",
    marginBottom: 6,
  },
  roomAddress: {
    color: "#7A869A",
    lineHeight: 18,
  },
  priceBox: {
    backgroundColor: "#FFF0DF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110,
  },
  priceLabel: {
    color: "#C47A10",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceValue: {
    color: "#C47A10",
    fontSize: 16,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  infoCell: {
    flex: 1,
    backgroundColor: "#F7F6F2",
    borderRadius: 10,
    padding: 10,
  },
  infoLabel: {
    color: "#7A869A",
    marginBottom: 4,
  },
  infoValue: {
    color: "#1F2940",
  },
  contactRow: {
    marginTop: 12,
    gap: 6,
  },
  contactText: {
    color: "#7A869A",
  },
  notesBox: {
    marginTop: 12,
    backgroundColor: "#F7F6F2",
    borderRadius: 10,
    padding: 10,
  },
  notesText: {
    color: "#1F2940",
    marginTop: 4,
    lineHeight: 18,
  },
  identitySection: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0D9BC",
    backgroundColor: "#FFF8F0",
    padding: 10,
  },
  identityTitle: {
    color: "#C47A10",
    fontSize: 11,
    marginBottom: 8,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  identityName: {
    color: "#1F2940",
  },
  identityMeta: {
    color: "#7A869A",
    marginTop: 2,
    fontSize: 11,
  },
  viewIdentityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewIdentityText: {
    color: "#C47A10",
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    justifyContent: "flex-end",
  },
  actionBtn: {
    minWidth: 110,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: "#E4E8EF",
    backgroundColor: "#FFFFFF",
  },
  actionBtnOutlineText: {
    color: "#7A869A",
  },
  actionBtnPrimary: {
    backgroundColor: "#E68A2E",
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
  },
  deleteRow: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  deleteText: {
    color: "#9AA3B2",
    fontSize: 12,
  },
});
