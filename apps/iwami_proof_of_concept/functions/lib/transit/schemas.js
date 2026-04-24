"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.busStopCandidateSeedArraySchema = exports.busStopCandidateRecordSchema = exports.busStopCandidateSeedSchema = exports.transitEdgeScheduleSeedArraySchema = exports.transitServiceSeedArraySchema = exports.transitCalendarSeedArraySchema = exports.transportNodeSeedArraySchema = exports.transitEdgeScheduleRecordSchema = exports.transitServiceRecordSchema = exports.transitCalendarRecordSchema = exports.transportNodeRecordSchema = exports.transitTripSchema = exports.transitEdgeScheduleSeedSchema = exports.transitTripSeedSchema = exports.transitServiceSeedSchema = exports.transitCalendarSeedSchema = exports.transportNodeSeedSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("./types");
const hhmmSchema = zod_1.z
    .string()
    .trim()
    .regex(/^(\d{1,2}):([0-5]\d)$/, "time must be HH:mm");
const nonEmptyStringSchema = zod_1.z.string().trim().min(1);
const transitNodeTypeSchema = zod_1.z.enum(types_1.TRANSIT_NODE_TYPE_VALUES);
const transitModeSchema = zod_1.z.enum(types_1.TRANSIT_MODE_VALUES);
const transitStatusSchema = zod_1.z.enum(types_1.TRANSIT_STATUS_VALUES);
const transitDayTypeSchema = zod_1.z.enum(types_1.TRANSIT_DAY_TYPE_VALUES);
const transitTimezoneSchema = zod_1.z.enum(types_1.TRANSIT_TIMEZONE_VALUES);
exports.transportNodeSeedSchema = zod_1.z
    .object({
    nodeId: nonEmptyStringSchema,
    nodeType: transitNodeTypeSchema,
    nameJa: nonEmptyStringSchema,
    location: zod_1.z.object({
        lat: zod_1.z.number().finite().min(-90).max(90),
        lng: zod_1.z.number().finite().min(-180).max(180),
    }),
    isOriginCandidate: zod_1.z.boolean(),
    isReturnCandidate: zod_1.z.boolean(),
    linkedSpotId: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    status: transitStatusSchema,
})
    .strict();
exports.transitCalendarSeedSchema = zod_1.z
    .object({
    calendarId: nonEmptyStringSchema,
    nameJa: nonEmptyStringSchema,
    dayTypes: zod_1.z.array(transitDayTypeSchema).min(1),
    status: transitStatusSchema,
    metadata: zod_1.z
        .object({
        gtfsServiceIds: zod_1.z.array(nonEmptyStringSchema),
    })
        .strict()
        .optional(),
})
    .strict();
exports.transitServiceSeedSchema = zod_1.z
    .object({
    serviceId: nonEmptyStringSchema,
    mode: transitModeSchema,
    operator: nonEmptyStringSchema,
    lineName: nonEmptyStringSchema,
    routeName: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    fromNodeId: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    toNodeId: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    isMajor: zod_1.z.boolean(),
    status: transitStatusSchema,
    metadata: zod_1.z
        .object({
        effectiveFromDate: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
        bookingRules: zod_1.z.array(nonEmptyStringSchema),
        routeShape: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
        shoppingStops: zod_1.z.array(nonEmptyStringSchema),
        remarks: zod_1.z.array(nonEmptyStringSchema),
        routeVariantHints: zod_1.z.array(nonEmptyStringSchema).optional(),
        gtfsRouteIds: zod_1.z.array(nonEmptyStringSchema).optional(),
        gtfsDirectionIds: zod_1.z.array(nonEmptyStringSchema).optional(),
        gtfsServiceIds: zod_1.z.array(nonEmptyStringSchema).optional(),
    })
        .strict()
        .optional(),
})
    .strict();
exports.transitTripSeedSchema = zod_1.z
    .object({
    departAt: hhmmSchema,
    arriveAt: hhmmSchema,
    tripCode: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transitEdgeScheduleSeedSchema = zod_1.z
    .object({
    edgeScheduleId: nonEmptyStringSchema,
    serviceId: nonEmptyStringSchema,
    mode: transitModeSchema,
    fromNodeId: nonEmptyStringSchema,
    toNodeId: nonEmptyStringSchema,
    calendarId: nonEmptyStringSchema,
    timezone: transitTimezoneSchema,
    trips: zod_1.z.array(exports.transitTripSeedSchema).min(1),
    status: transitStatusSchema,
})
    .strict();
exports.transitTripSchema = zod_1.z
    .object({
    departAt: hhmmSchema,
    arriveAt: hhmmSchema,
    departMinutes: zod_1.z.number().int().min(0).max(47 * 60 + 59),
    arriveMinutes: zod_1.z.number().int().min(0).max(47 * 60 + 59),
    durationMinutes: zod_1.z.number().int().min(1).max(48 * 60),
    tripCode: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    gtfsTripId: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
    routeVariant: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
    isShoppingTrip: zod_1.z.boolean().optional(),
    shoppingViaStops: zod_1.z.array(nonEmptyStringSchema).optional(),
    reservationRuleType: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
    reservationRuleNote: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transportNodeRecordSchema = exports.transportNodeSeedSchema
    .extend({
    source: nonEmptyStringSchema,
    version: zod_1.z.number().int().min(1),
    importedAt: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transitCalendarRecordSchema = exports.transitCalendarSeedSchema
    .extend({
    source: nonEmptyStringSchema,
    version: zod_1.z.number().int().min(1),
    importedAt: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transitServiceRecordSchema = exports.transitServiceSeedSchema
    .extend({
    source: nonEmptyStringSchema,
    version: zod_1.z.number().int().min(1),
    importedAt: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transitEdgeScheduleRecordSchema = exports.transitEdgeScheduleSeedSchema
    .extend({
    trips: zod_1.z.array(exports.transitTripSchema).min(1),
    source: nonEmptyStringSchema,
    version: zod_1.z.number().int().min(1),
    importedAt: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.transportNodeSeedArraySchema = zod_1.z.array(exports.transportNodeSeedSchema);
exports.transitCalendarSeedArraySchema = zod_1.z.array(exports.transitCalendarSeedSchema);
exports.transitServiceSeedArraySchema = zod_1.z.array(exports.transitServiceSeedSchema);
exports.transitEdgeScheduleSeedArraySchema = zod_1.z.array(exports.transitEdgeScheduleSeedSchema);
const locationSchema = zod_1.z
    .object({
    lat: zod_1.z.number().finite().min(-90).max(90),
    lng: zod_1.z.number().finite().min(-180).max(180),
})
    .strict();
const locationStatusSchema = zod_1.z.enum(["pending", "approx", "exact"]);
exports.busStopCandidateSeedSchema = zod_1.z
    .object({
    candidateId: nonEmptyStringSchema,
    serviceId: nonEmptyStringSchema,
    lineName: nonEmptyStringSchema,
    stopOrder: zod_1.z.number().int().min(1),
    nameJa: nonEmptyStringSchema,
    location: zod_1.z.union([locationSchema, zod_1.z.null()]),
    locationStatus: locationStatusSchema,
    status: transitStatusSchema,
})
    .strict();
exports.busStopCandidateRecordSchema = exports.busStopCandidateSeedSchema
    .extend({
    source: nonEmptyStringSchema,
    version: zod_1.z.number().int().min(1),
    importedAt: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.busStopCandidateSeedArraySchema = zod_1.z.array(exports.busStopCandidateSeedSchema);
//# sourceMappingURL=schemas.js.map