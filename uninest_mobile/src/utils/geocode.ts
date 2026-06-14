export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ResolvedRoomCoordinates = Coordinates & {
  isApproximate: boolean;
};

const geocodeCache = new Map<string, Coordinates | null>();
const NOMINATIM_DELAY_MS = 1100;
let lastNominatimRequestAt = 0;

const HCMC_ALIASES = [
  "tp. ho chi minh",
  "tp ho chi minh",
  "thanh pho ho chi minh",
  "ho chi minh city",
  "hcm",
  "hồ chí minh",
  "ho chi minh",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForNominatimSlot() {
  const elapsed = Date.now() - lastNominatimRequestAt;
  if (elapsed < NOMINATIM_DELAY_MS) {
    await sleep(NOMINATIM_DELAY_MS - elapsed);
  }
  lastNominatimRequestAt = Date.now();
}

function normalizeCity(city?: string) {
  const value = city?.trim();
  if (!value) {
    return "TP. Hồ Chí Minh";
  }

  const lower = value.toLowerCase();
  if (HCMC_ALIASES.some((alias) => lower.includes(alias))) {
    return "TP. Hồ Chí Minh";
  }

  return value;
}

export function buildGeocodeQuery(address: string): string {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    return "";
  }

  const lower = trimmedAddress.toLowerCase();
  if (lower.includes("việt nam") || lower.includes("vietnam")) {
    return trimmedAddress;
  }

  return `${trimmedAddress}, Việt Nam`;
}

export function buildRoomGeocodeQuery(room: {
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}): string {
  const city = normalizeCity(room.city);
  return [room.address, room.ward, room.district, city].filter(Boolean).join(", ");
}

export function buildRoomGeocodeAttempts(room: {
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}): string[] {
  const city = normalizeCity(room.city);
  const ward = room.ward?.trim();
  const district = room.district?.trim();
  const address = room.address?.trim();

  const attempts = [
    buildRoomGeocodeQuery(room),
    ward && district ? `${ward}, ${district}, ${city}` : "",
    district ? `${district}, ${city}` : "",
    ward ? `${ward}, ${city}` : "",
    city,
  ]
    .map((item) => buildGeocodeQuery(item))
    .filter(Boolean);

  if (address && !attempts.some((item) => item.startsWith(address))) {
    attempts.unshift(buildGeocodeQuery(`${address}, ${city}`));
  }

  return [...new Set(attempts)];
}

export function hasValidCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    latitude >= 8 &&
    latitude <= 24 &&
    longitude >= 102 &&
    longitude <= 110
  );
}

async function fetchNominatim(
  query: string,
  useCountryFilter: boolean,
): Promise<Coordinates | null> {
  const cacheKey = `${useCountryFilter ? "vn:" : "all:"}${query}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  await waitForNominatimSlot();

  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    q: query,
  });

  if (useCountryFilter) {
    params.set("countrycodes", "vn");
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "UniNest-Mobile/1.0",
        },
      },
    );

    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const results: Array<{ lat: string; lon: string }> = await response.json();
    const result = results[0];

    if (!result) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const coordinates = {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    };

    geocodeCache.set(cacheKey, coordinates);
    return coordinates;
  } catch {
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

export async function geocodeAddress(
  address: string,
): Promise<Coordinates | null> {
  const query = buildGeocodeQuery(address);
  if (!query) {
    return null;
  }

  const withoutCountry = await fetchNominatim(query, false);
  if (withoutCountry) {
    return withoutCountry;
  }

  return fetchNominatim(query, true);
}

export async function resolveRoomCoordinates(room: {
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}): Promise<ResolvedRoomCoordinates | null> {
  if (hasValidCoordinates(room.latitude, room.longitude)) {
    return {
      latitude: room.latitude as number,
      longitude: room.longitude as number,
      isApproximate: false,
    };
  }

  const attempts = buildRoomGeocodeAttempts(room);

  for (let index = 0; index < attempts.length; index += 1) {
    const coordinates = await geocodeAddress(attempts[index]);
    if (coordinates) {
      return {
        ...coordinates,
        isApproximate: index > 0,
      };
    }
  }

  return null;
}
