import { roomApi } from "@/api/room.api";
import type { RoomFavorite } from "@/types/favorite";
import type { Room } from "@/types/room";
import { getRoomAmenityNames } from "@/utils/room-display";

export function getFavoriteRoomId(favorite: RoomFavorite): string | null {
  const room = favorite.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

export function roomFromFavorite(favorite: RoomFavorite): Room | null {
  const room = favorite.roomId;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return { ...(room as Room), _id: String(room._id) };
  }
  return null;
}

export async function resolveFavoriteRooms(
  favorites: RoomFavorite[],
): Promise<Room[]> {
  const rooms: Room[] = [];

  for (const favorite of favorites) {
    const embedded = roomFromFavorite(favorite);
    if (embedded) {
      rooms.push(embedded);
      continue;
    }

    const roomId = getFavoriteRoomId(favorite);
    if (!roomId) continue;

    try {
      const detail = await roomApi.getById(roomId);
      if (detail.data) {
        rooms.push({ ...detail.data, _id: String(detail.data._id) });
      }
    } catch {
      // Bỏ qua phòng không tải được chi tiết
    }
  }

  return rooms;
}

export function filterFavoriteRoomsBySearch(rooms: Room[], search: string) {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return rooms;

  return rooms.filter((room) =>
    [
      room.title,
      room.address,
      room.city,
      room.district,
      room.description,
      room.roomType,
      room.status,
      ...getRoomAmenityNames(room),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword)),
  );
}
