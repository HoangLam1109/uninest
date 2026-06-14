export type OsmMapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
};

export type OsmMapPayload = {
  markers: OsmMapMarker[];
  userLocation?: { lat: number; lng: number } | null;
  selectedMarkerId?: string | null;
};

const DEFAULT_CENTER = {
  lat: 10.7769,
  lng: 106.7009,
};

const EMPTY_PAYLOAD: OsmMapPayload = {
  markers: [],
  userLocation: null,
  selectedMarkerId: null,
};

export function createOpenStreetMapHtml(initialPayload: OsmMapPayload = EMPTY_PAYLOAD) {
  const bootPayload = JSON.stringify(initialPayload);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      crossorigin=""
    />
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: #f3efe8;
      }
      .leaflet-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .leaflet-div-icon {
        background: transparent !important;
        border: none !important;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>
      const DEFAULT_CENTER = ${JSON.stringify(DEFAULT_CENTER)};
      const map = L.map("map", {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      let userMarker = null;
      let selectedMarkerId = null;

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
          const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return entities[character] || character;
        });
      }

      function postMessage(payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }

      function createRoomMarker(lat, lng, isSelected) {
        return L.circleMarker([lat, lng], {
          radius: isSelected ? 12 : 10,
          color: "#ffffff",
          weight: 3,
          fillColor: isSelected ? "#d97706" : "#f28c1b",
          fillOpacity: 1,
        });
      }

      window.updateMap = function updateMap(payload) {
        if (!payload) return;

        markersLayer.clearLayers();
        selectedMarkerId = payload.selectedMarkerId || null;

        const bounds = [];
        const markers = Array.isArray(payload.markers) ? payload.markers : [];

        markers.forEach(function (marker) {
          if (
            typeof marker.lat !== "number" ||
            typeof marker.lng !== "number" ||
            !Number.isFinite(marker.lat) ||
            !Number.isFinite(marker.lng)
          ) {
            return;
          }

          const isSelected =
            selectedMarkerId && marker.id === selectedMarkerId;
          const leafletMarker = createRoomMarker(
            marker.lat,
            marker.lng,
            isSelected,
          ).addTo(markersLayer);

          const popupHtml =
            "<strong>" +
            escapeHtml(marker.title || "") +
            "</strong>" +
            (marker.description
              ? "<br>" + escapeHtml(marker.description)
              : "");

          leafletMarker.bindPopup(popupHtml);
          leafletMarker.on("click", function () {
            postMessage({ type: "markerPress", id: marker.id });
          });
          bounds.push([marker.lat, marker.lng]);

          if (isSelected) {
            leafletMarker.openPopup();
          }
        });

        if (payload.userLocation) {
          const userPosition = [
            payload.userLocation.lat,
            payload.userLocation.lng,
          ];

          if (!userMarker) {
            userMarker = L.circleMarker(userPosition, {
              radius: 8,
              color: "#ffffff",
              weight: 2,
              fillColor: "#2563eb",
              fillOpacity: 1,
            }).addTo(map);
            userMarker.bindPopup("Vị trí của bạn");
          } else {
            userMarker.setLatLng(userPosition);
          }

          bounds.push(userPosition);
        } else if (userMarker) {
          map.removeLayer(userMarker);
          userMarker = null;
        }

        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 16);
        } else {
          map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
        }

        setTimeout(function () {
          map.invalidateSize();
        }, 150);
      };

      window.updateMap(${bootPayload});
      postMessage({ type: "ready" });
    </script>
  </body>
</html>`;
}

export function buildOsmSearchUrl(address: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
}
