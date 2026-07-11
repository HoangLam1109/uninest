export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "UniNest-Mobile/1.0 (contact@uninest.app)",
};

function buildGeocodeQueries(address: string) {
  const trimmed = address.trim();
  if (!trimmed) return [];

  const queries = [trimmed];
  if (!/vietnam|việt nam/i.test(trimmed)) {
    queries.push(`${trimmed}, Vietnam`);
  }
  return [...new Set(queries)];
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const queries = buildGeocodeQueries(address);
  if (queries.length === 0) return null;

  for (const query of queries) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`,
      {
        signal,
        headers: NOMINATIM_HEADERS,
      },
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const results: Array<{ lat: string; lon: string; display_name: string }> =
      await response.json();
    const result = results[0];
    if (!result) continue;

    return {
      lat: Number(result.lat),
      lng: Number(result.lon),
      displayName: result.display_name,
    };
  }

  return null;
}

export function createOpenStreetMapSearchUrl(address: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address.trim())}`;
}

export function isValidCoordinate(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value);
}
