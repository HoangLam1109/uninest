import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { roomApi } from "@/api/room.api";
import { ThemedText } from "@/components/themed-text";
import { useFavorites } from "@/context/favorites-context";
import type { Room } from "@/types/room";
import {
  formatPrice,
  formatRoomLocation,
  getRoomAmenityNames,
  getRoomImageSource,
  roomStatusBadgeStyle,
  roomStatusLabel,
} from "@/utils/room-display";

export type FavoriteRoomsView = "grid" | "list";

type FavoriteRoomCardProps = {
  room: Room;
  view: FavoriteRoomsView;
  onFavoriteChange?: () => void;
};

export function FavoriteRoomCard({
  room,
  view,
  onFavoriteChange,
}: FavoriteRoomCardProps) {
  const router = useRouter();
  const { toggleFavorite } = useFavorites();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const isListView = view === "list";
  const amenityNames = getRoomAmenityNames(room);
  const statusStyle = roomStatusBadgeStyle(room.status);

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

  const openDetail = () => {
    router.push({
      pathname: "/sv/detail_page",
      params: { id: room._id },
    } as any);
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await toggleFavorite(room._id);
      onFavoriteChange?.();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <View style={[styles.card, isListView && styles.cardList]}>
      <Pressable
        style={[styles.imageWrap, isListView && styles.imageWrapList]}
        onPress={openDetail}
      >
        <Image
          source={getRoomImageSource(imageUrl)}
          style={styles.image}
          contentFit="cover"
        />
      </Pressable>

      <View style={[styles.body, isListView && styles.bodyList]}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Pressable onPress={openDetail}>
              <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
                {room.title}
              </ThemedText>
            </Pressable>
            <ThemedText type="small" style={styles.location} numberOfLines={2}>
              📍 {formatRoomLocation(room) || "Chưa có địa chỉ"}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {roomStatusLabel(room.status)}
            </Text>
          </View>
        </View>

        {amenityNames.length > 0 ? (
          <View style={styles.amenitiesRow}>
            {amenityNames.slice(0, 3).map((amenity) => (
              <View key={amenity} style={styles.amenityChip}>
                <ThemedText type="small" style={styles.amenityText}>
                  {amenity}
                </ThemedText>
              </View>
            ))}
            {amenityNames.length > 3 ? (
              <View style={styles.amenityChipMuted}>
                <ThemedText type="small" style={styles.amenityTextMuted}>
                  +{amenityNames.length - 3}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.footer, isListView && styles.footerList]}>
          <ThemedText type="smallBold" style={styles.price}>
            {formatPrice(room.pricePerMonth)}
            <ThemedText type="small" style={styles.priceUnit}>
              /tháng
            </ThemedText>
          </ThemedText>

          <View style={styles.actions}>
            <Pressable
              style={styles.removeButton}
              onPress={() => void handleRemove()}
              disabled={removing}
            >
              {removing ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.removeIcon}>♥</Text>
              )}
            </Pressable>
            <Pressable style={styles.detailButton} onPress={openDetail}>
              <Text style={styles.detailIcon}>→</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0E6D8",
    overflow: "hidden",
  },
  cardList: {
    flexDirection: "row",
  },
  imageWrap: {
    height: 168,
    backgroundColor: "#EDE8E0",
  },
  imageWrapList: {
    width: 120,
    alignSelf: "stretch",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    padding: 14,
    gap: 10,
  },
  bodyList: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#1F2940",
    fontSize: 16,
    lineHeight: 22,
  },
  location: {
    color: "#64748B",
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityChip: {
    backgroundColor: "#FFF0DD",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  amenityChipMuted: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  amenityText: {
    color: "#C47A10",
    fontSize: 11,
    fontWeight: "600",
  },
  amenityTextMuted: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerList: {
    marginTop: 0,
  },
  price: {
    color: "#F28C1B",
    fontSize: 16,
  },
  priceUnit: {
    color: "#64748B",
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeIcon: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
  detailButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  detailIcon: {
    color: "#1F2940",
    fontSize: 18,
    fontWeight: "700",
  },
});
