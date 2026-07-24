import * as Location from "expo-location";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import {
  createOpenStreetMapSearchUrl,
  isValidCoordinate,
} from "@/utils/geocode-address";
import { buildLeafletMapHtml } from "@/utils/leaflet-map-html";

type RoomLocationMapProps = {
  address: string;
  title: string;
  latitude?: number;
  longitude?: number;
};

type WebViewMessage =
  | { type: "loading"; message?: string }
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "location"; lat: number; lng: number; displayName: string };

const MAP_HEIGHT = 320;

export function RoomLocationMap({
  address,
  title,
  latitude,
  longitude,
}: RoomLocationMapProps) {
  const webViewRef = useRef<WebView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayAddress, setDisplayAddress] = useState(address.trim());
  const [mapCoords, setMapCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(() =>
    isValidCoordinate(latitude) && isValidCoordinate(longitude)
      ? { lat: latitude!, lng: longitude! }
      : null,
  );

  const mapHtml = useMemo(
    () =>
      buildLeafletMapHtml({
        address,
        title,
        latitude: isValidCoordinate(latitude) ? latitude : undefined,
        longitude: isValidCoordinate(longitude) ? longitude : undefined,
      }),
    [address, title, latitude, longitude],
  );

  const searchUrl = useMemo(
    () =>
      mapCoords
        ? `https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=16/${mapCoords.lat}/${mapCoords.lng}`
        : createOpenStreetMapSearchUrl(address),
    [address, mapCoords],
  );

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as WebViewMessage;

      if (data.type === "loading") {
        setIsLoading(true);
        setErrorMessage(null);
        return;
      }

      if (data.type === "ready") {
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      if (data.type === "location") {
        setDisplayAddress(data.displayName);
        setMapCoords({ lat: data.lat, lng: data.lng });
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      if (data.type === "error") {
        setIsLoading(false);
        setErrorMessage(data.message);
      }
    } catch {
      // Ignore malformed messages from WebView.
    }
  }, []);

  const handleLocateUser = useCallback(async () => {
    setIsLocatingUser(true);
    setErrorMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setErrorMessage("Không thể lấy vị trí hiện tại của bạn.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const payload = JSON.stringify({
        type: "userLocation",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      webViewRef.current?.postMessage(payload);
      webViewRef.current?.injectJavaScript(`
        if (window.__setUserLocation) {
          window.__setUserLocation(${position.coords.latitude}, ${position.coords.longitude});
        }
        true;
      `);
    } catch {
      setErrorMessage("Không thể lấy vị trí hiện tại của bạn.");
    } finally {
      setIsLocatingUser(false);
    }
  }, []);

  const handleOpenExternalMap = useCallback(() => {
    void Linking.openURL(searchUrl);
  }, [searchUrl]);

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText type="smallBold" style={styles.eyebrow}>
              BẢN ĐỒ
            </ThemedText>
            <ThemedText type="smallBold" style={styles.title}>
              Vị trí phòng trọ
            </ThemedText>
            <ThemedText type="small" style={styles.address}>
              {displayAddress || address}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={() => void handleLocateUser()}
              disabled={isLocatingUser}
              accessibilityLabel="Lấy vị trí hiện tại"
            >
              {isLocatingUser ? (
                <ActivityIndicator color="#F28C1B" size="small" />
              ) : (
                <Text style={styles.iconButtonText}>◎</Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={handleOpenExternalMap}
              accessibilityLabel="Mở bản đồ lớn"
            >
              <Text style={styles.iconButtonText}>↗</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mapWrap}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            nestedScrollEnabled
            setSupportMultipleWindows={false}
            onMessage={handleWebViewMessage}
            mixedContentMode="always"
            allowsInlineMediaPlayback
            {...(Platform.OS === "android"
              ? { androidLayerType: "hardware" as const }
              : {})}
            onError={() => {
              setIsLoading(false);
              setErrorMessage("Không thể tải bản đồ Leaflet.");
            }}
            onHttpError={() => {
              setIsLoading(false);
              setErrorMessage("Không thể tải bản đồ Leaflet.");
            }}
          />

          {isLoading ? (
            <View style={styles.overlay} pointerEvents="none">
              <ActivityIndicator color="#F28C1B" />
              <Text style={styles.overlayText}>Đang tìm vị trí từ địa chỉ...</Text>
            </View>
          ) : null}

          {!isLoading && errorMessage ? (
            <View style={styles.overlay}>
              <Text style={styles.overlayIcon}>📍</Text>
              <Text style={styles.overlayText}>{errorMessage}</Text>
              <Pressable style={styles.retryButton} onPress={handleOpenExternalMap}>
                <Text style={styles.retryButtonText}>Mở trên OpenStreetMap</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(242, 140, 27, 0.15)",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: "#F28C1B",
    fontSize: 12,
    letterSpacing: 1.1,
  },
  title: {
    color: "#2F261A",
    fontSize: 18,
    marginTop: 4,
  },
  address: {
    color: "#6B5E4D",
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E1D8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  iconButtonPressed: {
    opacity: 0.85,
  },
  iconButtonText: {
    color: "#F28C1B",
    fontSize: 18,
    fontWeight: "700",
  },
  mapWrap: {
    marginTop: 14,
    height: MAP_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E1D8",
    backgroundColor: "#F5EFE6",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  overlayIcon: {
    fontSize: 28,
  },
  overlayText: {
    color: "#6B5E4D",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#F28C1B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
