export declare const PLAN_REQUESTS_COLLECTION = "planRequests";
export declare const PLAN_REQUEST_STATUS: {
    readonly QUEUED: "queued";
    readonly GENERATING: "generating";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export declare const PLAN_GENERATION_STAGE: {
    readonly QUEUED: "queued";
    readonly INTENT_PARSING: "intent_parsing";
    readonly CANDIDATE_SELECTION: "candidate_selection";
    readonly ROUTE_PLANNING: "route_planning";
    readonly AI_REFINEMENT: "ai_refinement";
    readonly VALIDATING: "validating";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export declare const GENERATION_META: {
    readonly SOURCE: "web";
    readonly VERSION: 1;
};
export declare const PLAN_POLL_TOKEN_BYTES = 18;
export declare const PLAN_POLLING_INTERVAL_MS = 2000;
export declare const PLAN_GENERATION_MAX_ATTEMPTS = 3;
export declare const PLAN_GENERATION_ERROR_CODE: {
    readonly NO_CANDIDATE: "NO_CANDIDATE";
    readonly TIME_OVER: "TIME_OVER";
    readonly RETURN_CONSTRAINT: "RETURN_CONSTRAINT";
    readonly SPOT_CLOSED: "SPOT_CLOSED";
    readonly ROUTE_UNAVAILABLE: "ROUTE_UNAVAILABLE";
    readonly AI_PARSE_FAILED: "AI_PARSE_FAILED";
    readonly INTERNAL: "INTERNAL";
};
export declare const TRIP_STYLE: {
    readonly DAY_TRIP: "day_trip";
    readonly OVERNIGHT: "overnight";
};
export declare const DEPARTURE_TYPE: {
    readonly IWAMI_STATION: "iwami_station";
    readonly CURRENT_LOCATION: "current_location";
};
export declare const DURATION_TYPE: {
    readonly TWO_HOURS: "2h";
    readonly FOUR_HOURS: "4h";
    readonly CUSTOM: "custom";
};
export declare const RETURN_TRANSPORT: {
    readonly TRAIN: "train";
    readonly CAR: "car";
};
export declare const RETURN_STATION: {
    readonly IWAMI: "iwami_station";
    readonly HIGASHIHAMA: "higashihama_station";
    readonly OIWA: "oiwa_station";
};
export declare const RETURN_STATION_LABEL: Record<(typeof RETURN_STATION)[keyof typeof RETURN_STATION], string>;
export declare const LOCAL_TRANSPORT: {
    readonly WALK: "walk";
    readonly RENTAL_CYCLE: "rental_cycle";
    readonly CAR: "car";
    readonly BUS: "bus";
};
export declare const DURATION_TYPE_TO_MINUTES: {
    readonly "2h": 120;
    readonly "4h": 240;
};
export declare const IWAMI_STATION_ORIGIN: {
    type: "station";
    id: "iwami_station";
    name: string;
};
export declare const IWAMI_TOURISM_ASSOCIATION_ID = "iwami-tourism-association";
export declare const HH_MM_PATTERN: RegExp;
export declare const ISO_TIME_CAPTURE_PATTERN: RegExp;
