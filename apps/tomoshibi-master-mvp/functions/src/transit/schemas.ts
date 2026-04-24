import { z } from "zod";
import {
  TRANSIT_DAY_TYPE_VALUES,
  TRANSIT_MODE_VALUES,
  TRANSIT_NODE_TYPE_VALUES,
  TRANSIT_STATUS_VALUES,
  TRANSIT_TIMEZONE_VALUES,
} from "./types";

const hhmmSchema = z
  .string()
  .trim()
  .regex(/^(\d{1,2}):([0-5]\d)$/, "time must be HH:mm");

const nonEmptyStringSchema = z.string().trim().min(1);

const transitNodeTypeSchema = z.enum(TRANSIT_NODE_TYPE_VALUES);
const transitModeSchema = z.enum(TRANSIT_MODE_VALUES);
const transitStatusSchema = z.enum(TRANSIT_STATUS_VALUES);
const transitDayTypeSchema = z.enum(TRANSIT_DAY_TYPE_VALUES);
const transitTimezoneSchema = z.enum(TRANSIT_TIMEZONE_VALUES);

export const transportNodeSeedSchema = z
  .object({
    nodeId: nonEmptyStringSchema,
    nodeType: transitNodeTypeSchema,
    nameJa: nonEmptyStringSchema,
    location: z.object({
      lat: z.number().finite().min(-90).max(90),
      lng: z.number().finite().min(-180).max(180),
    }),
    isOriginCandidate: z.boolean(),
    isReturnCandidate: z.boolean(),
    linkedSpotId: z.union([nonEmptyStringSchema, z.null()]),
    status: transitStatusSchema,
  })
  .strict();

export const transitCalendarSeedSchema = z
  .object({
    calendarId: nonEmptyStringSchema,
    nameJa: nonEmptyStringSchema,
    dayTypes: z.array(transitDayTypeSchema).min(1),
    status: transitStatusSchema,
    metadata: z
      .object({
        gtfsServiceIds: z.array(nonEmptyStringSchema),
      })
      .strict()
      .optional(),
  })
  .strict();

export const transitServiceSeedSchema = z
  .object({
    serviceId: nonEmptyStringSchema,
    mode: transitModeSchema,
    operator: nonEmptyStringSchema,
    lineName: nonEmptyStringSchema,
    routeName: z.union([nonEmptyStringSchema, z.null()]),
    fromNodeId: z.union([nonEmptyStringSchema, z.null()]),
    toNodeId: z.union([nonEmptyStringSchema, z.null()]),
    isMajor: z.boolean(),
    status: transitStatusSchema,
    metadata: z
      .object({
        effectiveFromDate: z.union([nonEmptyStringSchema, z.null()]),
        bookingRules: z.array(nonEmptyStringSchema),
        routeShape: z.union([nonEmptyStringSchema, z.null()]),
        shoppingStops: z.array(nonEmptyStringSchema),
        remarks: z.array(nonEmptyStringSchema),
        routeVariantHints: z.array(nonEmptyStringSchema).optional(),
        gtfsRouteIds: z.array(nonEmptyStringSchema).optional(),
        gtfsDirectionIds: z.array(nonEmptyStringSchema).optional(),
        gtfsServiceIds: z.array(nonEmptyStringSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const transitTripSeedSchema = z
  .object({
    departAt: hhmmSchema,
    arriveAt: hhmmSchema,
    tripCode: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transitEdgeScheduleSeedSchema = z
  .object({
    edgeScheduleId: nonEmptyStringSchema,
    serviceId: nonEmptyStringSchema,
    mode: transitModeSchema,
    fromNodeId: nonEmptyStringSchema,
    toNodeId: nonEmptyStringSchema,
    calendarId: nonEmptyStringSchema,
    timezone: transitTimezoneSchema,
    trips: z.array(transitTripSeedSchema).min(1),
    status: transitStatusSchema,
  })
  .strict();

export const transitTripSchema = z
  .object({
    departAt: hhmmSchema,
    arriveAt: hhmmSchema,
    departMinutes: z.number().int().min(0).max(47 * 60 + 59),
    arriveMinutes: z.number().int().min(0).max(47 * 60 + 59),
    durationMinutes: z.number().int().min(1).max(48 * 60),
    tripCode: z.union([nonEmptyStringSchema, z.null()]),
    gtfsTripId: z.union([nonEmptyStringSchema, z.null()]).optional(),
    routeVariant: z.union([nonEmptyStringSchema, z.null()]).optional(),
    isShoppingTrip: z.boolean().optional(),
    shoppingViaStops: z.array(nonEmptyStringSchema).optional(),
    reservationRuleType: z.union([nonEmptyStringSchema, z.null()]).optional(),
    reservationRuleNote: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transportNodeRecordSchema = transportNodeSeedSchema
  .extend({
    source: nonEmptyStringSchema,
    version: z.number().int().min(1),
    importedAt: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transitCalendarRecordSchema = transitCalendarSeedSchema
  .extend({
    source: nonEmptyStringSchema,
    version: z.number().int().min(1),
    importedAt: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transitServiceRecordSchema = transitServiceSeedSchema
  .extend({
    source: nonEmptyStringSchema,
    version: z.number().int().min(1),
    importedAt: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transitEdgeScheduleRecordSchema = transitEdgeScheduleSeedSchema
  .extend({
    trips: z.array(transitTripSchema).min(1),
    source: nonEmptyStringSchema,
    version: z.number().int().min(1),
    importedAt: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const transportNodeSeedArraySchema = z.array(transportNodeSeedSchema);
export const transitCalendarSeedArraySchema = z.array(transitCalendarSeedSchema);
export const transitServiceSeedArraySchema = z.array(transitServiceSeedSchema);
export const transitEdgeScheduleSeedArraySchema = z.array(transitEdgeScheduleSeedSchema);

const locationSchema = z
  .object({
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
  })
  .strict();

const locationStatusSchema = z.enum(["pending", "approx", "exact"]);

export const busStopCandidateSeedSchema = z
  .object({
    candidateId: nonEmptyStringSchema,
    serviceId: nonEmptyStringSchema,
    lineName: nonEmptyStringSchema,
    stopOrder: z.number().int().min(1),
    nameJa: nonEmptyStringSchema,
    location: z.union([locationSchema, z.null()]),
    locationStatus: locationStatusSchema,
    status: transitStatusSchema,
  })
  .strict();

export const busStopCandidateRecordSchema = busStopCandidateSeedSchema
  .extend({
    source: nonEmptyStringSchema,
    version: z.number().int().min(1),
    importedAt: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const busStopCandidateSeedArraySchema = z.array(busStopCandidateSeedSchema);
