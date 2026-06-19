import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { getApiErrorMessage } from "@/lib/api-error";

type FavoriteHeartButtonProps = {
  roomId: string;
  style?: ViewStyle;
};

export function FavoriteHeartButton({ roomId, style }: FavoriteHeartButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, checkFavorite, toggleFavorite } = useFavorites();
  const [isPending, setIsPending] = useState(false);
  const [favorited, setFavorited] = useState(() => isFavorite(roomId));

  useEffect(() => {
    setFavorited(isFavorite(roomId));
  }, [isFavorite, roomId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorited(false);
      return;
    }

    if (isFavorite(roomId)) {
      setFavorited(true);
      return;
    }

    let cancelled = false;
    void checkFavorite(roomId).then((value) => {
      if (!cancelled) setFavorited(value);
    });

    return () => {
      cancelled = true;
    };
  }, [checkFavorite, isAuthenticated, isFavorite, roomId]);

  async function handlePress() {
    if (!isAuthenticated) {
      Alert.alert("Đăng nhập", "Bạn cần đăng nhập để lưu phòng.", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng nhập",
          onPress: () => router.push("/sv/login_page" as any),
        },
      ]);
      return;
    }

    setIsPending(true);
    try {
      await toggleFavorite(roomId);
    } catch (err) {
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không thể cập nhật phòng đã lưu."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Pressable
      style={[styles.heartButton, style]}
      onPress={() => void handlePress()}
      disabled={isPending}
      hitSlop={8}
    >
      <Text style={[styles.heartIcon, favorited && styles.heartIconActive]}>
        {favorited ? "♥" : "♡"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heartButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 20,
    color: "#7E8798",
  },
  heartIconActive: {
    color: "#E85D4C",
  },
});
