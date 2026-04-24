"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gtfsCalendarDatesSchema = exports.gtfsCalendarsSchema = exports.gtfsStopTimesSchema = exports.gtfsTripsSchema = exports.gtfsRoutesSchema = exports.gtfsStopsSchema = exports.gtfsCalendarDateSchema = exports.gtfsCalendarSchema = exports.gtfsStopTimeSchema = exports.gtfsTripSchema = exports.gtfsRouteSchema = exports.gtfsStopSchema = void 0;
const zod_1 = require("zod");
const nonEmptyString = zod_1.z.string().trim().min(1);
const optionalString = zod_1.z.string().trim().optional();
const gtfsTimeSchema = zod_1.z
    .string()
    .trim()
    .regex(/^(\d{1,2}):([0-5]\d)(:[0-5]\d)?$/, "GTFS time must be HH:MM(:SS)");
exports.gtfsStopSchema = zod_1.z
    .object({
    stop_id: nonEmptyString,
    stop_name: nonEmptyString,
    stop_lat: zod_1.z.string().trim().regex(/^-?\d+(\.\d+)?$/),
    stop_lon: zod_1.z.string().trim().regex(/^-?\d+(\.\d+)?$/),
    parent_station: optionalString,
})
    .passthrough();
exports.gtfsRouteSchema = zod_1.z
    .object({
    route_id: nonEmptyString,
    route_short_name: optionalString,
    route_long_name: optionalString,
    route_desc: optionalString,
})
    .passthrough();
exports.gtfsTripSchema = zod_1.z
    .object({
    route_id: nonEmptyString,
    service_id: nonEmptyString,
    trip_id: nonEmptyString,
    trip_headsign: optionalString,
    direction_id: optionalString,
})
    .passthrough();
exports.gtfsStopTimeSchema = zod_1.z
    .object({
    trip_id: nonEmptyString,
    arrival_time: gtfsTimeSchema,
    departure_time: gtfsTimeSchema,
    stop_id: nonEmptyString,
    stop_sequence: zod_1.z.string().trim().regex(/^\d+$/),
})
    .passthrough();
const binaryStringSchema = zod_1.z.string().trim().regex(/^[01]$/);
exports.gtfsCalendarSchema = zod_1.z
    .object({
    service_id: nonEmptyString,
    monday: binaryStringSchema,
    tuesday: binaryStringSchema,
    wednesday: binaryStringSchema,
    thursday: binaryStringSchema,
    friday: binaryStringSchema,
    saturday: binaryStringSchema,
    sunday: binaryStringSchema,
    start_date: zod_1.z.string().trim().regex(/^\d{8}$/),
    end_date: zod_1.z.string().trim().regex(/^\d{8}$/),
})
    .passthrough();
exports.gtfsCalendarDateSchema = zod_1.z
    .object({
    service_id: nonEmptyString,
    date: zod_1.z.string().trim().regex(/^\d{8}$/),
    exception_type: zod_1.z.string().trim().regex(/^[12]$/),
})
    .passthrough();
exports.gtfsStopsSchema = zod_1.z.array(exports.gtfsStopSchema);
exports.gtfsRoutesSchema = zod_1.z.array(exports.gtfsRouteSchema);
exports.gtfsTripsSchema = zod_1.z.array(exports.gtfsTripSchema);
exports.gtfsStopTimesSchema = zod_1.z.array(exports.gtfsStopTimeSchema);
exports.gtfsCalendarsSchema = zod_1.z.array(exports.gtfsCalendarSchema);
exports.gtfsCalendarDatesSchema = zod_1.z.array(exports.gtfsCalendarDateSchema);
//# sourceMappingURL=schemas.js.map