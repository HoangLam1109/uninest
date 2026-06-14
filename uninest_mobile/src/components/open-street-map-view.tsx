import { useCallback, useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import {
  createOpenStreetMapHtml,
  type OsmMapPayload,
} from "@/utils/open-street-map-html";

type OpenStreetMapViewProps = {
  payload: OsmMapPayload;
  style?: ViewStyle;
  onMarkerPress?: (markerId: string) => void;
  onReady?: () => void;
};

function buildMapKey(payload: OsmMapPayload) {
  const markerKey = payload.markers
    .map((marker) => `${marker.id}:${marker.lat}:${marker.lng}`)
    .join("|");
  const userKey = payload.userLocation
    ? `${payload.userLocation.lat},${payload.userLocation.lng}`
    : "none";
  return `${markerKey}::${userKey}::${payload.selectedMarkerId ?? ""}`;
}

export function OpenStreetMapView({
  payload,
  style,
  onMarkerPress,
  onReady,
}: OpenStreetMapViewProps) {
  const webViewRef = useRef<WebView | null>(null);
  const payloadRef = useRef(payload);
  const mapKey = useMemo(() => buildMapKey(payload), [payload]);
  const html = useMemo(() => createOpenStreetMapHtml(), []);
  const isReadyRef = useRef(false);

  const injectUpdate = useCallback(() => {
    const script = `window.updateMap(${JSON.stringify(payloadRef.current)}); true;`;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  useEffect(() => {
    payloadRef.current = payload;
    if (isReadyRef.current) {
      injectUpdate();
    }
  }, [mapKey, payload, injectUpdate]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        id?: string;
      };

      if (data.type === "ready") {
        isReadyRef.current = true;
        injectUpdate();
        onReady?.();
        return;
      }

      if (data.type === "markerPress" && data.id) {
        onMarkerPress?.(data.id);
      }
    } catch {
      // Ignore malformed messages from WebView.
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webView}
        onMessage={handleMessage}
        onLoadEnd={injectUpdate}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        {...(Platform.OS === "android"
          ? { androidLayerType: "hardware" as const }
          : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#F3EFE8",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
