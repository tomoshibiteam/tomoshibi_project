import { TRANSIT_SEED_SOURCE, TRANSIT_SEED_VERSION } from "./constants";
import { transitEdgeScheduleRecordSchema, transitTripSchema } from "./schemas";
import type { TransitEdgeScheduleRecord, TransitEdgeScheduleSeed, TransitTrip, TransitTripSeed } from "./types";

const HH_MM_CAPTURE_PATTERN = /^(\d{1,2}):([0-5]\d)$/;

export function hhmmToMinutes(value: string): number {
  const match = value.match(HH_MM_CAPTURE_PATTERN);
  if (!match) {
    throw new Error(`time must be HH:mm: ${value}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 47) {
    throw new Error(`time hour must be <=47: ${value}`);
  }
  return hour * 60 + minute;
}

export function buildTransitTrip(seed: TransitTripSeed): TransitTrip {
  const departMinutes = hhmmToMinutes(seed.departAt);
  const arriveMinutes = hhmmToMinutes(seed.arriveAt);
  const durationMinutes = arriveMinutes - departMinutes;

  if (durationMinutes <= 0) {
    throw new Error(`arriveAt must be later than departAt: ${seed.departAt} -> ${seed.arriveAt}`);
  }

  return transitTripSchema.parse({
    departAt: seed.departAt,
    arriveAt: seed.arriveAt,
    departMinutes,
    arriveMinutes,
    durationMinutes,
    tripCode: seed.tripCode ?? null,
  });
}

export function buildTransitEdgeScheduleRecord(seed: TransitEdgeScheduleSeed): TransitEdgeScheduleRecord {
  const trips = seed.trips.map(buildTransitTrip).sort((a, b) => a.departMinutes - b.departMinutes);

  return transitEdgeScheduleRecordSchema.parse({
    ...seed,
    trips,
    source: TRANSIT_SEED_SOURCE,
    version: TRANSIT_SEED_VERSION,
  });
}
