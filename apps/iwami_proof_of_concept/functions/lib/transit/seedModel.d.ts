import type { TransitEdgeScheduleRecord, TransitEdgeScheduleSeed, TransitTrip, TransitTripSeed } from "./types";
export declare function hhmmToMinutes(value: string): number;
export declare function buildTransitTrip(seed: TransitTripSeed): TransitTrip;
export declare function buildTransitEdgeScheduleRecord(seed: TransitEdgeScheduleSeed): TransitEdgeScheduleRecord;
