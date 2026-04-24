import {
  DEPARTURE_TYPE,
  DURATION_TYPE,
  DURATION_TYPE_TO_MINUTES,
  HH_MM_PATTERN,
  ISO_TIME_CAPTURE_PATTERN,
  IWAMI_STATION_ORIGIN,
  IWAMI_TOURISM_ASSOCIATION_ID,
  LOCAL_TRANSPORT,
  RETURN_TRANSPORT,
  TRIP_STYLE,
} from "./constants";
import type { LocalTransport, NormalizedPlanRequest, PlanRequestInput, ReturnConstraint } from "./types";

function dedupeStrings(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const rawValue of values) {
    const normalized = rawValue.trim();
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function dedupeLocalTransports(values: LocalTransport[]): LocalTransport[] {
  const out: LocalTransport[] = [];
  const seen = new Set<LocalTransport>();
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function normalizeDepartureAt(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (HH_MM_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const isoMatch = trimmed.match(ISO_TIME_CAPTURE_PATTERN);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  return null;
}

function toDurationMinutes(input: PlanRequestInput): number {
  if (input.durationType === DURATION_TYPE.CUSTOM) {
    return input.customDurationMinutes ?? 0;
  }
  return DURATION_TYPE_TO_MINUTES[input.durationType];
}

function toReturnConstraint(input: PlanRequestInput): ReturnConstraint {
  if (input.returnTransport === RETURN_TRANSPORT.TRAIN) {
    return {
      type: "train_station",
      stationId: input.returnStationId ?? "iwami_station",
    };
  }
  return { type: "free" };
}

export function normalizePlanRequest(input: PlanRequestInput): NormalizedPlanRequest {
  const localTransports = dedupeLocalTransports(input.localTransports);
  const desiredSpots = dedupeStrings(input.desiredSpots);
  const tripPrompt = (input.tripPrompt ?? "").trim();

  const requiresCyclePickup = localTransports.includes(LOCAL_TRANSPORT.RENTAL_CYCLE);
  const cyclePickupLocationId = requiresCyclePickup ? IWAMI_TOURISM_ASSOCIATION_ID : null;

  const origin =
    input.departureType === DEPARTURE_TYPE.IWAMI_STATION
      ? IWAMI_STATION_ORIGIN
      : {
          type: DEPARTURE_TYPE.CURRENT_LOCATION,
          lat: input.departureLocation?.lat ?? 0,
          lng: input.departureLocation?.lng ?? 0,
        };

  return {
    tripStyle: input.tripStyle,
    origin,
    departureAt: normalizeDepartureAt(input.departureAt),
    durationMinutes: toDurationMinutes(input),
    returnTransport: input.returnTransport,
    returnConstraint: toReturnConstraint(input),
    lodgingName: input.tripStyle === TRIP_STYLE.OVERNIGHT ? (input.lodgingName ?? null) : null,
    localTransports,
    desiredSpots,
    tripPrompt,
    requiresCyclePickup,
    cyclePickupLocationId,
  };
}
