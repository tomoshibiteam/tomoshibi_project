export declare const TRANSIT_NODE_TYPE_VALUES: readonly ["station", "bus_stop"];
export declare const TRANSIT_MODE_VALUES: readonly ["train", "bus"];
export declare const TRANSIT_STATUS_VALUES: readonly ["active", "inactive"];
export declare const TRANSIT_DAY_TYPE_VALUES: readonly ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];
export declare const TRANSIT_TIMEZONE_VALUES: readonly ["Asia/Tokyo"];
export type TransitNodeType = (typeof TRANSIT_NODE_TYPE_VALUES)[number];
export type TransitMode = (typeof TRANSIT_MODE_VALUES)[number];
export type TransitStatus = (typeof TRANSIT_STATUS_VALUES)[number];
export type TransitDayType = (typeof TRANSIT_DAY_TYPE_VALUES)[number];
export type TransitTimezone = (typeof TRANSIT_TIMEZONE_VALUES)[number];
export type TransportNodeRecord = {
    nodeId: string;
    nodeType: TransitNodeType;
    nameJa: string;
    location: {
        lat: number;
        lng: number;
    };
    isOriginCandidate: boolean;
    isReturnCandidate: boolean;
    linkedSpotId: string | null;
    status: TransitStatus;
    source: string;
    version: number;
    importedAt?: string | null;
};
export type TransitCalendarRecord = {
    calendarId: string;
    nameJa: string;
    dayTypes: TransitDayType[];
    status: TransitStatus;
    metadata?: {
        gtfsServiceIds: string[];
    };
    source: string;
    version: number;
    importedAt?: string | null;
};
export type TransitServiceRecord = {
    serviceId: string;
    mode: TransitMode;
    operator: string;
    lineName: string;
    routeName: string | null;
    fromNodeId: string | null;
    toNodeId: string | null;
    isMajor: boolean;
    status: TransitStatus;
    metadata?: {
        effectiveFromDate: string | null;
        bookingRules: string[];
        routeShape: string | null;
        shoppingStops: string[];
        remarks: string[];
        routeVariantHints?: string[];
        gtfsRouteIds?: string[];
        gtfsDirectionIds?: string[];
        gtfsServiceIds?: string[];
    };
    source: string;
    version: number;
    importedAt?: string | null;
};
export type TransitTrip = {
    departAt: string;
    arriveAt: string;
    departMinutes: number;
    arriveMinutes: number;
    durationMinutes: number;
    tripCode: string | null;
    gtfsTripId?: string | null;
    routeVariant?: string | null;
    isShoppingTrip?: boolean;
    shoppingViaStops?: string[];
    reservationRuleType?: string | null;
    reservationRuleNote?: string | null;
};
export type TransitEdgeScheduleRecord = {
    edgeScheduleId: string;
    serviceId: string;
    mode: TransitMode;
    fromNodeId: string;
    toNodeId: string;
    calendarId: string;
    timezone: TransitTimezone;
    trips: TransitTrip[];
    status: TransitStatus;
    source: string;
    version: number;
    importedAt?: string | null;
};
export type TransitTripSeed = {
    departAt: string;
    arriveAt: string;
    tripCode?: string | null;
};
export type TransitEdgeScheduleSeed = Omit<TransitEdgeScheduleRecord, "trips" | "source" | "version"> & {
    trips: TransitTripSeed[];
};
export type BusStopCandidateRecord = {
    candidateId: string;
    serviceId: string;
    lineName: string;
    stopOrder: number;
    nameJa: string;
    location: {
        lat: number;
        lng: number;
    } | null;
    locationStatus: "pending" | "approx" | "exact";
    status: TransitStatus;
    source: string;
    version: number;
    importedAt?: string | null;
};
export type GetNextTripsParams = {
    fromNodeId: string;
    toNodeId: string;
    mode: TransitMode;
    calendarId: string;
    afterMinutes: number;
    limit: number;
};
