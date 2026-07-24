type LeafletMapHtmlOptions = {
  address: string;
  title: string;
  latitude?: number;
  longitude?: number;
};

function escapeJsString(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export function buildLeafletMapHtml({
  address,
  title,
  latitude,
  longitude,
}: LeafletMapHtmlOptions) {
  const safeAddress = escapeJsString(address.trim());
  const safeTitle = escapeJsString(title.trim());
  const hasCoords =
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude);

  const initialLat = hasCoords ? latitude : 10.7769;
  const initialLng = hasCoords ? longitude : 106.7009;
  const initialZoom = hasCoords ? 16 : 13;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #f5efe6;
    }
    .leaflet-control-attribution {
      font-size: 10px;
    }
    .user-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2563eb;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""
  ></script>
  <script>
    (function () {
      var address = '${safeAddress}';
      var title = '${safeTitle}';
      var hasStoredCoords = ${hasCoords ? "true" : "false"};
      var storedLat = ${initialLat};
      var storedLng = ${initialLng};

      var map = L.map('map', {
        center: [storedLat, storedLng],
        zoom: ${initialZoom},
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      var roomMarker = null;
      var userMarker = null;

      var roomIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      var userIcon = L.divIcon({
        className: '',
        html: '<span class="user-marker"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      function post(type, payload) {
        var message = JSON.stringify(Object.assign({ type: type }, payload || {}));
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(message);
        }
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
          var entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          };
          return entities[character] || character;
        });
      }

      function setRoomLocation(lat, lng, displayName) {
        var position = [lat, lng];
        map.setView(position, 16);

        if (!roomMarker) {
          roomMarker = L.marker(position, { icon: roomIcon }).addTo(map);
        } else {
          roomMarker.setLatLng(position);
        }

        roomMarker
          .bindPopup(
            '<strong>' + escapeHtml(title) + '</strong><br>' + escapeHtml(displayName),
          )
          .openPopup();

        post('location', { lat: lat, lng: lng, displayName: displayName });
      }

      function setUserLocation(lat, lng) {
        var position = [lat, lng];

        if (!userMarker) {
          userMarker = L.marker(position, { icon: userIcon }).addTo(map);
        } else {
          userMarker.setLatLng(position);
        }

        userMarker.bindPopup('Vị trí của bạn');

        if (roomMarker) {
          var roomLatLng = roomMarker.getLatLng();
          map.fitBounds(
            L.latLngBounds([
              [roomLatLng.lat, roomLatLng.lng],
              position,
            ]),
            { padding: [40, 40], maxZoom: 16 },
          );
        }
      }

      async function geocodeAddress() {
        if (!address) {
          post('error', { message: 'Chưa có địa chỉ để hiển thị bản đồ.' });
          return;
        }

        if (hasStoredCoords) {
          setRoomLocation(storedLat, storedLng, address);
          post('ready');
          return;
        }

        post('loading', { message: 'Đang tìm vị trí từ địa chỉ...' });

        var queries = [address];
        if (!/vietnam|việt nam/i.test(address)) {
          queries.push(address + ', Vietnam');
        }

        for (var i = 0; i < queries.length; i += 1) {
          try {
            var response = await fetch(
              'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=' +
                encodeURIComponent(queries[i]),
              {
                headers: {
                  Accept: 'application/json',
                },
              },
            );

            if (!response.ok) {
              throw new Error('Geocoding request failed');
            }

            var results = await response.json();
            var result = results[0];
            if (!result) continue;

            setRoomLocation(
              Number(result.lat),
              Number(result.lon),
              result.display_name,
            );
            post('ready');
            return;
          } catch (error) {
            if (i === queries.length - 1) {
              post('error', {
                message: 'Không thể tải vị trí bản đồ. Vui lòng thử lại sau.',
              });
            }
          }
        }

        post('error', {
          message: 'Không tìm thấy vị trí phù hợp với địa chỉ này.',
        });
      }

      window.__setUserLocation = setUserLocation;

      document.addEventListener('message', function (event) {
        try {
          var data = JSON.parse(event.data);
          if (data.type === 'userLocation') {
            setUserLocation(Number(data.lat), Number(data.lng));
          }
        } catch (error) {}
      });

      window.addEventListener('message', function (event) {
        try {
          var data = JSON.parse(event.data);
          if (data.type === 'userLocation') {
            setUserLocation(Number(data.lat), Number(data.lng));
          }
        } catch (error) {}
      });

      map.whenReady(function () {
        void geocodeAddress();
      });
    })();
  </script>
</body>
</html>`;
}
