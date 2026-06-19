import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { favoriteApi } from "@/api/favorite.api";
import { roomApi } from "@/api/room.api";
import { ApiError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import type { RoomFavorite } from "@/types/favorite";
import type { Room } from "@/types/room";

import { useAuth } from "./auth-context";

function getFavoriteRoomId(favorite: RoomFavorite): string | null {
  const room = favorite.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

function roomFromFavorite(favorite: RoomFavorite): Room | null {
  const room = favorite.roomId;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return { ...(room as Room), _id: String(room._id) };
  }
  return null;
}

async function resolveFavoriteRooms(favorites: RoomFavorite[]): Promise<Room[]> {
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

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  favoriteRooms: Room[];
  isLoading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
  isFavorite: (roomId: string) => boolean;
  checkFavorite: (roomId: string) => Promise<boolean>;
  toggleFavorite: (roomId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavoriteRooms([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await favoriteApi.list({ page: 1, limit: 100 });
      const rooms = await resolveFavoriteRooms(response.data ?? []);

      setFavoriteRooms(rooms);
      setFavoriteIds(new Set(rooms.map((room) => room._id)));
    } catch (err) {
      setFavoriteRooms([]);
      setFavoriteIds(new Set());
      setError(getApiErrorMessage(err, "Không tải được danh sách đã lưu."));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const isFavorite = useCallback(
    (roomId: string) => favoriteIds.has(roomId),
    [favoriteIds],
  );

  const checkFavorite = useCallback(
    async (roomId: string) => {
      if (!isAuthenticated) return false;
      try {
        const response = await favoriteApi.check(roomId);
        return response.data?.isFavorited ?? false;
      } catch {
        return false;
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (roomId: string) => {
      if (!isAuthenticated) {
        throw new Error("Bạn cần đăng nhập để lưu phòng.");
      }

      const wasFavorite = favoriteIds.has(roomId);

      if (wasFavorite) {
        await favoriteApi.remove(roomId);
      } else {
        try {
          await favoriteApi.add(roomId);
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            // POST trả 409: phòng đã có trong danh sách
          } else {
            throw err;
          }
        }
      }

      await refreshFavorites();
    },
    [favoriteIds, isAuthenticated, refreshFavorites],
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteRooms,
      isLoading,
      error,
      refreshFavorites,
      isFavorite,
      checkFavorite,
      toggleFavorite,
    }),
    [
      favoriteIds,
      favoriteRooms,
      isLoading,
      error,
      refreshFavorites,
      isFavorite,
      checkFavorite,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
