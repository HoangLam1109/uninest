import type { Room, RoomImage, RoomStatus } from "@/types/room";
import type { ImageSourcePropType } from "react-native";

import { ROOM_DEFAULT_IMAGE } from "@/constants/images";

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

export function getPrimaryRoomImageUrl(images: RoomImage[]): string | null {
  const sorted = sortRoomImages(images);
  const primary = sorted[0];
  return primary?.url ?? null;
}

export function getRoomImageSource(url?: string | null): ImageSourcePropType {
  return url ? { uri: url } : ROOM_DEFAULT_IMAGE;
}

type RoomAmenitySource = {
  amenityIds?: Room["amenityIds"];
  amenities?: string[];
};

export function getRoomAmenityNames(room: RoomAmenitySource): string[] {  const names = new Set<string>();

  room.amenities?.forEach((amenity) => {
    const name = amenity.trim();
    if (name) names.add(name);
  });

  room.amenityIds?.forEach((amenity) => {
    if (typeof amenity === "string") {
      const value = amenity.trim();
      if (value && !/^[a-f\d]{24}$/i.test(value)) names.add(value);
      return;
    }
    const name = amenity.name?.trim();
    if (name) names.add(name);
  });

  return Array.from(names);
}

export function roomStatusBadgeStyle(status?: string) {
  switch (status) {
    case "AVAILABLE":
      return { backgroundColor: "#DDF6D5", color: "#2E7D4E" };
    case "RENTED":
      return { backgroundColor: "#FFF0DD", color: "#C47A10" };
    case "MAINTENANCE":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
    default:
      return { backgroundColor: "#E7EBF1", color: "#5F6672" };
  }
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
