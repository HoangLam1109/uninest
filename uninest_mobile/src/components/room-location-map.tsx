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
import { resolveRoomCoordinates } from "@/utils/geocode";
import {
  buildOsmSearchUrl,
  type OsmMapPayload,
} from "@/utils/open-street-map-html";

type RoomLocationMapProps = {
  address: string;
  title: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export function RoomLocationMap({
  address,
  title,
  ward,
  district,
  city,
  latitude,
  longitude,
}: RoomLocationMapProps) {
  const [roomLocation, setRoomLocation] = useState<{
    lat: number;
    lng: number;
    displayName: string;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveLocation() {
      const trimmedAddress = address.trim();
      if (!trimmedAddress) {
        setRoomLocation(null);
        setErrorMessage("Chưa có địa chỉ để hiển thị bản đồ.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const coordinates = await resolveRoomCoordinates({
        address: trimmedAddress,
        ward,
        district,
        city,
        latitude,
        longitude,
      });
      if (cancelled) {
        return;
      }

      if (!coordinates) {
        setRoomLocation(null);
        setErrorMessage("Không tìm thấy vị trí phù hợp với địa chỉ này.");
      } else {
        setRoomLocation({
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          displayName: trimmedAddress,
        });
        setErrorMessage(null);
      }

      setIsLoading(false);
    }

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [address, ward, district, city, latitude, longitude]);

  const mapPayload = useMemo<OsmMapPayload>(() => {
    if (!roomLocation) {
      return { markers: [], userLocation };
    }

    return {
      markers: [
        {
          id: "room",
          lat: roomLocation.lat,
          lng: roomLocation.lng,
          title,
          description: roomLocation.displayName,
        },
      ],
      userLocation,
      selectedMarkerId: "room",
    };
  }, [roomLocation, title, userLocation]);

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
        lat: position.coords.latitude,
        lng: position.coords.longitude,
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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="smallBold" style={styles.kicker}>
            Bản đồ
          </ThemedText>
          <ThemedText type="smallBold" style={styles.title}>
            Vị trí phòng trọ
          </ThemedText>
          <ThemedText type="small" style={styles.address}>
            {address}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, isLocatingUser && styles.actionButtonDisabled]}
            onPress={() => void handleLocateUser()}
            disabled={isLocatingUser}
          >
            {isLocatingUser ? (
              <ActivityIndicator color="#4A3B2B" size="small" />
            ) : (
              <Text style={styles.actionIcon}>◎</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => void Linking.openURL(buildOsmSearchUrl(address))}
          >
            <Text style={styles.actionIcon}>↗</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <OpenStreetMapView payload={mapPayload} style={styles.map} />

        {isLoading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color="#F28C1B" />
            <ThemedText type="small" style={styles.overlayText}>
              Đang tìm vị trí từ địa chỉ...
            </ThemedText>
          </View>
        ) : null}

        {!isLoading && errorMessage && !roomLocation ? (
          <View style={styles.overlay}>
            <Text style={styles.overlayIcon}>📍</Text>
            <ThemedText type="small" style={styles.overlayText}>
              {errorMessage}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    color: "#F28C1B",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    color: "#3E3228",
    fontSize: 18,
  },
  address: {
    color: "#8B7E70",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E0D5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionIcon: {
    fontSize: 18,
    color: "#4A3B2B",
  },
  mapWrap: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    backgroundColor: "#F3EFE8",
  },
  map: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  overlayIcon: {
    fontSize: 28,
  },
  overlayText: {
    color: "#6D6154",
    textAlign: "center",
    lineHeight: 20,
  },
});
