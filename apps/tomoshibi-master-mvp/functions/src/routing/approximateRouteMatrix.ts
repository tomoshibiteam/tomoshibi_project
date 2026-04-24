export type RouteMatrixMode = "walk" | "rental_cycle" | "car" | "bus" | "train";

export type RouteMatrixLocation = {
  id: string;
  lat: number;
  lng: number;
};

export type RouteMatrixPairIssue = {
  fromId: string;
  toId: string;
  reason: string;
};

export type RouteMatrixResult = {
  source: "approximate";
  mode: RouteMatrixMode;
  durationsMinutes: Record<string, Record<string, number | null>>;
  distancesMeters: Record<string, Record<string, number | null>>;
  unresolvedPairs: RouteMatrixPairIssue[];
};

type ApproximationProfile = {
  speedMetersPerMinute: number;
  detourFactor: number;
  fixedMinutes: number;
  minimumMinutes: number;
};

const APPROXIMATION_PROFILE_BY_MODE: Record<RouteMatrixMode, ApproximationProfile> = {
  walk: {
    speedMetersPerMinute: 75,
    detourFactor: 1.2,
    fixedMinutes: 2,
    minimumMinutes: 3,
  },
  rental_cycle: {
    speedMetersPerMinute: 220,
    detourFactor: 1.25,
    fixedMinutes: 3,
    minimumMinutes: 4,
  },
  car: {
    speedMetersPerMinute: 500,
    detourFactor: 1.35,
    fixedMinutes: 4,
    minimumMinutes: 5,
  },
  bus: {
    speedMetersPerMinute: 320,
    detourFactor: 1.35,
    fixedMinutes: 7,
    minimumMinutes: 7,
  },
  train: {
    speedMetersPerMinute: 900,
    detourFactor: 1.1,
    fixedMinutes: 8,
    minimumMinutes: 8,
  },
};

function initMatrix<T>(locations: RouteMatrixLocation[], initialValue: T): Record<string, Record<string, T>> {
  const matrix: Record<string, Record<string, T>> = {};
  for (const from of locations) {
    matrix[from.id] = {};
    for (const to of locations) {
      matrix[from.id][to.id] = initialValue;
    }
  }
  return matrix;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function computeApproximateMinutes(distanceMeters: number, mode: RouteMatrixMode): number {
  if (distanceMeters <= 0) return 0;
  const profile = APPROXIMATION_PROFILE_BY_MODE[mode];
  const routeDistance = distanceMeters * profile.detourFactor;
  const movingMinutes = routeDistance / profile.speedMetersPerMinute;
  const total = Math.round(movingMinutes + profile.fixedMinutes);
  return Math.max(profile.minimumMinutes, total);
}

export async function computeApproximateRouteMatrix(params: {
  locations: RouteMatrixLocation[];
  mode: RouteMatrixMode;
}): Promise<RouteMatrixResult> {
  if (params.locations.length < 2) {
    throw new Error("At least two locations are required for route matrix computation.");
  }

  const durationsMinutes = initMatrix<number | null>(params.locations, null);
  const distancesMeters = initMatrix<number | null>(params.locations, null);

  for (const from of params.locations) {
    for (const to of params.locations) {
      if (from.id === to.id) {
        distancesMeters[from.id][to.id] = 0;
        durationsMinutes[from.id][to.id] = 0;
        continue;
      }
      const distance = Math.max(
        0,
        Math.round(
          haversineMeters(
            { lat: from.lat, lng: from.lng },
            { lat: to.lat, lng: to.lng },
          ),
        ),
      );
      distancesMeters[from.id][to.id] = distance;
      durationsMinutes[from.id][to.id] = computeApproximateMinutes(distance, params.mode);
    }
  }

  return {
    source: "approximate",
    mode: params.mode,
    durationsMinutes,
    distancesMeters,
    unresolvedPairs: [],
  };
}
