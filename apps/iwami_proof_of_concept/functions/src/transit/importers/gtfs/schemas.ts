import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalString = z.string().trim().optional();
const gtfsTimeSchema = z
  .string()
  .trim()
  .regex(/^(\d{1,2}):([0-5]\d)(:[0-5]\d)?$/, "GTFS time must be HH:MM(:SS)");

export const gtfsStopSchema = z
  .object({
    stop_id: nonEmptyString,
    stop_name: nonEmptyString,
    stop_lat: z.string().trim().regex(/^-?\d+(\.\d+)?$/),
    stop_lon: z.string().trim().regex(/^-?\d+(\.\d+)?$/),
    parent_station: optionalString,
  })
  .passthrough();

export const gtfsRouteSchema = z
  .object({
    route_id: nonEmptyString,
    route_short_name: optionalString,
    route_long_name: optionalString,
    route_desc: optionalString,
  })
  .passthrough();

export const gtfsTripSchema = z
  .object({
    route_id: nonEmptyString,
    service_id: nonEmptyString,
    trip_id: nonEmptyString,
    trip_headsign: optionalString,
    direction_id: optionalString,
  })
  .passthrough();

export const gtfsStopTimeSchema = z
  .object({
    trip_id: nonEmptyString,
    arrival_time: gtfsTimeSchema,
    departure_time: gtfsTimeSchema,
    stop_id: nonEmptyString,
    stop_sequence: z.string().trim().regex(/^\d+$/),
  })
  .passthrough();

const binaryStringSchema = z.string().trim().regex(/^[01]$/);

export const gtfsCalendarSchema = z
  .object({
    service_id: nonEmptyString,
    monday: binaryStringSchema,
    tuesday: binaryStringSchema,
    wednesday: binaryStringSchema,
    thursday: binaryStringSchema,
    friday: binaryStringSchema,
    saturday: binaryStringSchema,
    sunday: binaryStringSchema,
    start_date: z.string().trim().regex(/^\d{8}$/),
    end_date: z.string().trim().regex(/^\d{8}$/),
  })
  .passthrough();

export const gtfsCalendarDateSchema = z
  .object({
    service_id: nonEmptyString,
    date: z.string().trim().regex(/^\d{8}$/),
    exception_type: z.string().trim().regex(/^[12]$/),
  })
  .passthrough();

export const gtfsStopsSchema = z.array(gtfsStopSchema);
export const gtfsRoutesSchema = z.array(gtfsRouteSchema);
export const gtfsTripsSchema = z.array(gtfsTripSchema);
export const gtfsStopTimesSchema = z.array(gtfsStopTimeSchema);
export const gtfsCalendarsSchema = z.array(gtfsCalendarSchema);
export const gtfsCalendarDatesSchema = z.array(gtfsCalendarDateSchema);
