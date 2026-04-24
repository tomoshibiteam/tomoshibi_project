import { z } from "zod";
export declare const gtfsStopSchema: z.ZodObject<{
    stop_id: z.ZodString;
    stop_name: z.ZodString;
    stop_lat: z.ZodString;
    stop_lon: z.ZodString;
    parent_station: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const gtfsRouteSchema: z.ZodObject<{
    route_id: z.ZodString;
    route_short_name: z.ZodOptional<z.ZodString>;
    route_long_name: z.ZodOptional<z.ZodString>;
    route_desc: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const gtfsTripSchema: z.ZodObject<{
    route_id: z.ZodString;
    service_id: z.ZodString;
    trip_id: z.ZodString;
    trip_headsign: z.ZodOptional<z.ZodString>;
    direction_id: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const gtfsStopTimeSchema: z.ZodObject<{
    trip_id: z.ZodString;
    arrival_time: z.ZodString;
    departure_time: z.ZodString;
    stop_id: z.ZodString;
    stop_sequence: z.ZodString;
}, z.core.$loose>;
export declare const gtfsCalendarSchema: z.ZodObject<{
    service_id: z.ZodString;
    monday: z.ZodString;
    tuesday: z.ZodString;
    wednesday: z.ZodString;
    thursday: z.ZodString;
    friday: z.ZodString;
    saturday: z.ZodString;
    sunday: z.ZodString;
    start_date: z.ZodString;
    end_date: z.ZodString;
}, z.core.$loose>;
export declare const gtfsCalendarDateSchema: z.ZodObject<{
    service_id: z.ZodString;
    date: z.ZodString;
    exception_type: z.ZodString;
}, z.core.$loose>;
export declare const gtfsStopsSchema: z.ZodArray<z.ZodObject<{
    stop_id: z.ZodString;
    stop_name: z.ZodString;
    stop_lat: z.ZodString;
    stop_lon: z.ZodString;
    parent_station: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>;
export declare const gtfsRoutesSchema: z.ZodArray<z.ZodObject<{
    route_id: z.ZodString;
    route_short_name: z.ZodOptional<z.ZodString>;
    route_long_name: z.ZodOptional<z.ZodString>;
    route_desc: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>;
export declare const gtfsTripsSchema: z.ZodArray<z.ZodObject<{
    route_id: z.ZodString;
    service_id: z.ZodString;
    trip_id: z.ZodString;
    trip_headsign: z.ZodOptional<z.ZodString>;
    direction_id: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>;
export declare const gtfsStopTimesSchema: z.ZodArray<z.ZodObject<{
    trip_id: z.ZodString;
    arrival_time: z.ZodString;
    departure_time: z.ZodString;
    stop_id: z.ZodString;
    stop_sequence: z.ZodString;
}, z.core.$loose>>;
export declare const gtfsCalendarsSchema: z.ZodArray<z.ZodObject<{
    service_id: z.ZodString;
    monday: z.ZodString;
    tuesday: z.ZodString;
    wednesday: z.ZodString;
    thursday: z.ZodString;
    friday: z.ZodString;
    saturday: z.ZodString;
    sunday: z.ZodString;
    start_date: z.ZodString;
    end_date: z.ZodString;
}, z.core.$loose>>;
export declare const gtfsCalendarDatesSchema: z.ZodArray<z.ZodObject<{
    service_id: z.ZodString;
    date: z.ZodString;
    exception_type: z.ZodString;
}, z.core.$loose>>;
