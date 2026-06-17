import { useEffect, useMemo, useReducer, useRef } from 'react'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { ExternalLink, LocateFixed, MapPinned } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Coordinates = {
  lat: number
  lng: number
}

type GeocodeResult = Coordinates & {
  displayName: string
}

type RoomLocationMapProps = {
  address: string
  title: string
  className?: string
}

type RoomLocationState = {
  location: GeocodeResult | null
  userLocation: Coordinates | null
  isLoading: boolean
  isLocatingUser: boolean
  errorMessage: string | null
}

type RoomLocationAction = {
  type: 'patch'
  value: Partial<RoomLocationState>
}

const DEFAULT_CENTER: Coordinates = {
  lat: 10.7769,
  lng: 106.7009,
}

const ROOM_MARKER_ICON = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const USER_MARKER_ICON = L.divIcon({
  className: '',
  html: '<span class="block size-4 rounded-full border-2 border-white bg-blue-600 shadow-md"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const INITIAL_ROOM_LOCATION_STATE: RoomLocationState = {
  location: null,
  userLocation: null,
  isLoading: false,
  isLocatingUser: false,
  errorMessage: null,
}

function roomLocationReducer(
  state: RoomLocationState,
  action: RoomLocationAction,
): RoomLocationState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.value }
  }
}

function createSearchUrl(address: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}

export function RoomLocationMap({
  address,
  title,
  className,
}: RoomLocationMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const roomMarkerRef = useRef<L.Marker | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [mapState, dispatchMap] = useReducer(
    roomLocationReducer,
    INITIAL_ROOM_LOCATION_STATE,
  )
  const { location, userLocation, isLoading, isLocatingUser, errorMessage } =
    mapState
  const searchUrl = useMemo(() => createSearchUrl(address), [address])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 13,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      roomMarkerRef.current = null
      userMarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const trimmedAddress = address.trim()

    async function geocodeAddress() {
      if (!trimmedAddress) {
        dispatchMap({
          type: 'patch',
          value: {
            location: null,
            errorMessage: 'Chưa có địa chỉ để hiển thị bản đồ.',
          },
        })
        return
      }

      dispatchMap({
        type: 'patch',
        value: { isLoading: true, errorMessage: null },
      })

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            trimmedAddress,
          )}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        )

        if (!response.ok) {
          throw new Error('Geocoding request failed')
        }

        const results: Array<{
          lat: string
          lon: string
          display_name: string
        }> = await response.json()
        const result = results[0]

        if (!result) {
          dispatchMap({
            type: 'patch',
            value: {
              location: null,
              errorMessage: 'Không tìm thấy vị trí phù hợp với địa chỉ này.',
            },
          })
          return
        }

        dispatchMap({
          type: 'patch',
          value: {
            location: {
              lat: Number(result.lat),
              lng: Number(result.lon),
              displayName: result.display_name,
            },
          },
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        dispatchMap({
          type: 'patch',
          value: {
            location: null,
            errorMessage: 'Không thể tải vị trí bản đồ. Vui lòng thử lại sau.',
          },
        })
      } finally {
        dispatchMap({ type: 'patch', value: { isLoading: false } })
      }
    }

    void geocodeAddress()

    return () => {
      controller.abort()
    }
  }, [address])

  useEffect(() => {
    if (!mapRef.current) return

    if (!location) {
      roomMarkerRef.current?.remove()
      roomMarkerRef.current = null
      return
    }

    const position: L.LatLngExpression = [location.lat, location.lng]
    mapRef.current.setView(position, 16)

    if (!roomMarkerRef.current) {
      roomMarkerRef.current = L.marker(position, { icon: ROOM_MARKER_ICON }).addTo(
        mapRef.current,
      )
    } else {
      roomMarkerRef.current.setLatLng(position)
    }

    roomMarkerRef.current
      .bindPopup(
        `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(
          location.displayName,
        )}`,
      )
      .openPopup()
  }, [location, title])

  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    const position: L.LatLngExpression = [userLocation.lat, userLocation.lng]

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(position, { icon: USER_MARKER_ICON }).addTo(
        mapRef.current,
      )
    } else {
      userMarkerRef.current.setLatLng(position)
    }

    userMarkerRef.current.bindPopup('Vị trí của bạn')
  }, [userLocation])

  function handleLocateUser() {
    if (!navigator.geolocation) {
      dispatchMap({
        type: 'patch',
        value: { errorMessage: 'Trình duyệt không hỗ trợ lấy vị trí hiện tại.' },
      })
      return
    }

    dispatchMap({ type: 'patch', value: { isLocatingUser: true } })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextUserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        dispatchMap({
          type: 'patch',
          value: {
            userLocation: nextUserLocation,
            isLocatingUser: false,
          },
        })

        if (mapRef.current && location) {
          const bounds = L.latLngBounds([
            [location.lat, location.lng],
            [nextUserLocation.lat, nextUserLocation.lng],
          ])
          mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
        }
      },
      () => {
        dispatchMap({
          type: 'patch',
          value: {
            isLocatingUser: false,
            errorMessage: 'Không thể lấy vị trí hiện tại của bạn.',
          },
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  return (
    <section className={className}>
      <div className="rounded-xl border border-primary/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">
              Bản đồ
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Vị trí phòng trọ
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {address}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Lấy vị trí hiện tại"
              onClick={handleLocateUser}
              disabled={isLocatingUser}
            >
              <LocateFixed className="size-4" />
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="Mở bản đồ lớn">
              <a href={searchUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative isolate mt-4 overflow-hidden rounded-lg border border-border">
          <div ref={containerRef} className="h-80 w-full bg-surface" />
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-semibold text-muted-foreground">
              Đang tìm vị trí từ địa chỉ...
            </div>
          ) : null}
          {!isLoading && errorMessage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 px-6 text-center text-sm text-muted-foreground">
              <MapPinned className="size-8 text-primary" />
              <p>{errorMessage}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
