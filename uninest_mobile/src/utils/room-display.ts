import type { Room, RoomImage, RoomStatus } from "@/types/room";

export function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function formatRoomLocation(room: Room) {
  const parts = [room.address, room.ward, room.district, room.city].filter(
    Boolean,
  );
  return parts.join(", ");
}

export function roomStatusLabel(status?: RoomStatus | string) {
  const map: Record<string, string> = {
    AVAILABLE: "Còn trống",
    RENTED: "Đã thuê",
    MAINTENANCE: "Bảo trì",
  };
  return status ? (map[status] ?? status) : "—";
}

export function roomTypeLabel(roomType?: string) {
  if (!roomType) return "Phòng trọ";
  const map: Record<string, string> = {
    STUDIO: "Studio",
    SINGLE: "Phòng đơn",
    SHARED: "Ở ghép",
    APARTMENT: "Căn hộ",
  };
  return map[roomType] ?? roomType;
}

export function getLandlordName(room: Room): string {
  const landlord = room.landlordId;
  if (typeof landlord === "object" && landlord !== null && "fullName" in landlord) {
    return landlord.fullName ?? "Chủ nhà";
  }
  return "Chủ nhà";
}

export function sortRoomImages(images: RoomImage[]) {
  return [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export function buildRoomHighlights(room: Room): string[] {
  const items: string[] = [];
  if (room.areaSqm) items.push(`${room.areaSqm} m²`);
  if (room.maxOccupants) items.push(`Tối đa ${room.maxOccupants} người`);
  if (room.roomType) items.push(roomTypeLabel(room.roomType));
  if (room.electricityRate) items.push(`Điện: ${formatPrice(room.electricityRate)}`);
  if (room.waterRate) items.push(`Nước: ${formatPrice(room.waterRate)}`);
  if (room.status === "AVAILABLE") items.push("Còn trống");
  return items;
}
