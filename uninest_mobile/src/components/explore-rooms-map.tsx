import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OpenStreetMapView } from "@/components/open-street-map-view";
import { ThemedText } from "@/components/themed-text";
import type { Room } from "@/types/room";
import { resolveRoomCoordinates } from "@/utils/geocode";
import type { OsmMapPayload } from "@/utils/open-street-map-html";
import { formatPrice, formatRoomLocation } from "@/utils/room-display";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RoomMapPoint = {
  room: Room;
  latitude: number;
  longitude: number;
  isApproximate: boolean;
};

type ExploreRoomsMapProps = {
  rooms: Room[];
  onRoomPress: (room: Room) => void;
};

export function ExploreRoomsMap({ rooms, onRoomPress }: ExploreRoomsMapProps) {
  const [points, setPoints] = useState<RoomMapPoint[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveRoomPoints() {
      if (rooms.length === 0) {
        setPoints([]);
        setResolveError(null);
        return;
      }

      setIsResolving(true);
      setResolveError(null);

      const resolved: RoomMapPoint[] = [];
      let failedCount = 0;
      let approximateCount = 0;

      for (const room of rooms) {
        if (cancelled) {
          return;
        }

        const coordinates = await resolveRoomCoordinates(room);
        if (coordinates) {
          resolved.push({
            room,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            isApproximate: coordinates.isApproximate,
          });
          if (coordinates.isApproximate) {
            approximateCount += 1;
          }
        } else {
          failedCount += 1;
        }
      }

      if (cancelled) {
        return;
      }

      setPoints(resolved);
      setIsResolving(false);

      if (resolved.length === 0) {
        setResolveError(
          "Không xác định được vị trí. Hãy cập nhật quận/phường trong Quản lý phòng.",
        );
      } else if (failedCount > 0) {
        setResolveError(
          `Hiển thị ${resolved.length}/${rooms.length} phòng. ${failedCount} phòng chưa có vị trí.`,
        );
      } else if (approximateCount > 0) {
        setResolveError(
          `${approximateCount} phòng hiển thị vị trí gần đúng theo quận/phường.`,
        );
      } else {
        setResolveError(null);
      }
    }

    void resolveRoomPoints();

    return () => {
      cancelled = true;
    };
  }, [rooms]);

  const selectedPoint = points.find((point) => point.room._id === selectedRoomId);

  const mapPayload = useMemo<OsmMapPayload>(
    () => ({
      markers: points.map((point) => ({
        id: point.room._id,
        lat: point.latitude,
        lng: point.longitude,
        title: point.room.title,
        description: formatPrice(point.room.pricePerMonth),
      })),
      userLocation: userLocation
        ? {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          }
        : null,
      selectedMarkerId: selectedRoomId,
    }),
    [points, selectedRoomId, userLocation],
  );

  const handleLocateUser = async () => {
    setIsLocatingUser(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Không thể định vị",
          "Vui lòng cho phép UniNest truy cập vị trí để hiển thị trên bản đồ.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert(
        "Không thể định vị",
        "Không lấy được vị trí hiện tại của bạn. Vui lòng thử lại.",
      );
    } finally {
      setIsLocatingUser(false);
    }
  };

  const handleOpenSelectedInMaps = () => {
    if (!selectedPoint) {
      return;
    }

    const address = formatRoomLocation(selectedPoint.room);
    void Linking.openURL(
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`,
    );
  };

  return (
    <View style={styles.container}>
      <OpenStreetMapView
        payload={mapPayload}
        style={styles.map}
        onMarkerPress={setSelectedRoomId}
      />

      <Pressable
        style={[styles.locateButton, isLocatingUser && styles.locateButtonDisabled]}
        onPress={() => void handleLocateUser()}
        disabled={isLocatingUser}
      >
        {isLocatingUser ? (
          <ActivityIndicator color="#4A3B2B" size="small" />
        ) : (
          <Text style={styles.locateIcon}>◎</Text>
        )}
      </Pressable>

      {selectedPoint ? (
        <Pressable
          style={styles.externalButton}
          onPress={handleOpenSelectedInMaps}
        >
          <Text style={styles.externalIcon}>↗</Text>
        </Pressable>
      ) : null}

      {isResolving ? (
        <View style={styles.overlayCard}>
          <ActivityIndicator color="#F28C1B" />
          <ThemedText type="small" style={styles.overlayText}>
            Đang tìm vị trí phòng trên bản đồ...
          </ThemedText>
        </View>
      ) : null}

      {!isResolving && resolveError ? (
        <View style={styles.overlayCard}>
          <ThemedText type="small" style={styles.overlayText}>
            {resolveError}
          </ThemedText>
        </View>
      ) : null}

      {selectedPoint ? (
        <Pressable
          style={styles.selectedCard}
          onPress={() => onRoomPress(selectedPoint.room)}
        >
          <View style={styles.selectedHeader}>
            <ThemedText type="smallBold" style={styles.selectedTitle}>
              {selectedPoint.room.title}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.selectedPrice}>
              {formatPrice(selectedPoint.room.pricePerMonth)}
              <ThemedText type="small" style={styles.selectedPriceUnit}>
                /tháng
              </ThemedText>
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.selectedAddress}>
            {formatRoomLocation(selectedPoint.room)}
            {selectedPoint.isApproximate ? " (vị trí gần đúng)" : ""}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.selectedAction}>
            Xem chi tiết →
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    backgroundColor: "#FFFFFF",
  },
  map: {
    flex: 1,
    minHeight: 420,
  },
  locateButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  externalButton: {
    position: "absolute",
    top: 64,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  locateButtonDisabled: {
    opacity: 0.7,
  },
  locateIcon: {
    fontSize: 22,
    color: "#4A3B2B",
    lineHeight: 24,
  },
  externalIcon: {
    fontSize: 18,
    color: "#4A3B2B",
    lineHeight: 20,
  },
  overlayCard: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 70,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overlayText: {
    flex: 1,
    color: "#6D6154",
    lineHeight: 18,
  },
  selectedCard: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  selectedTitle: {
    flex: 1,
    color: "#3E3228",
    fontSize: 16,
    lineHeight: 22,
  },
  selectedPrice: {
    color: "#F28C1B",
    fontSize: 16,
  },
  selectedPriceUnit: {
    color: "#A08F7B",
    fontSize: 12,
  },
  selectedAddress: {
    color: "#8B7E70",
    marginTop: 4,
    lineHeight: 18,
  },
  selectedAction: {
    color: "#F28C1B",
    marginTop: 8,
  },
});
