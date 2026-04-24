"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISO_TIME_CAPTURE_PATTERN = exports.HH_MM_PATTERN = exports.IWAMI_TOURISM_ASSOCIATION_ID = exports.IWAMI_STATION_ORIGIN = exports.DURATION_TYPE_TO_MINUTES = exports.LOCAL_TRANSPORT = exports.RETURN_STATION_LABEL = exports.RETURN_STATION = exports.RETURN_TRANSPORT = exports.DURATION_TYPE = exports.DEPARTURE_TYPE = exports.TRIP_STYLE = exports.PLAN_GENERATION_ERROR_CODE = exports.PLAN_GENERATION_MAX_ATTEMPTS = exports.PLAN_POLLING_INTERVAL_MS = exports.PLAN_POLL_TOKEN_BYTES = exports.GENERATION_META = exports.PLAN_GENERATION_STAGE = exports.PLAN_REQUEST_STATUS = exports.PLAN_REQUESTS_COLLECTION = void 0;
exports.PLAN_REQUESTS_COLLECTION = "planRequests";
exports.PLAN_REQUEST_STATUS = {
    QUEUED: "queued",
    GENERATING: "generating",
    COMPLETED: "completed",
    FAILED: "failed",
};
exports.PLAN_GENERATION_STAGE = {
    QUEUED: "queued",
    INTENT_PARSING: "intent_parsing",
    CANDIDATE_SELECTION: "candidate_selection",
    ROUTE_PLANNING: "route_planning",
    AI_REFINEMENT: "ai_refinement",
    VALIDATING: "validating",
    COMPLETED: "completed",
    FAILED: "failed",
};
exports.GENERATION_META = {
    SOURCE: "web",
    VERSION: 1,
};
exports.PLAN_POLL_TOKEN_BYTES = 18;
exports.PLAN_POLLING_INTERVAL_MS = 2_000;
exports.PLAN_GENERATION_MAX_ATTEMPTS = 3;
exports.PLAN_GENERATION_ERROR_CODE = {
    NO_CANDIDATE: "NO_CANDIDATE",
    TIME_OVER: "TIME_OVER",
    RETURN_CONSTRAINT: "RETURN_CONSTRAINT",
    SPOT_CLOSED: "SPOT_CLOSED",
    ROUTE_UNAVAILABLE: "ROUTE_UNAVAILABLE",
    AI_PARSE_FAILED: "AI_PARSE_FAILED",
    INTERNAL: "INTERNAL",
};
exports.TRIP_STYLE = {
    DAY_TRIP: "day_trip",
    OVERNIGHT: "overnight",
};
exports.DEPARTURE_TYPE = {
    IWAMI_STATION: "iwami_station",
    CURRENT_LOCATION: "current_location",
};
exports.DURATION_TYPE = {
    TWO_HOURS: "2h",
    FOUR_HOURS: "4h",
    CUSTOM: "custom",
};
exports.RETURN_TRANSPORT = {
    TRAIN: "train",
    CAR: "car",
};
exports.RETURN_STATION = {
    IWAMI: "iwami_station",
    HIGASHIHAMA: "higashihama_station",
    OIWA: "oiwa_station",
};
exports.RETURN_STATION_LABEL = {
    [exports.RETURN_STATION.IWAMI]: "岩美駅",
    [exports.RETURN_STATION.HIGASHIHAMA]: "東浜駅",
    [exports.RETURN_STATION.OIWA]: "大岩駅",
};
exports.LOCAL_TRANSPORT = {
    WALK: "walk",
    RENTAL_CYCLE: "rental_cycle",
    CAR: "car",
    BUS: "bus",
};
exports.DURATION_TYPE_TO_MINUTES = {
    [exports.DURATION_TYPE.TWO_HOURS]: 120,
    [exports.DURATION_TYPE.FOUR_HOURS]: 240,
};
exports.IWAMI_STATION_ORIGIN = {
    type: "station",
    id: exports.DEPARTURE_TYPE.IWAMI_STATION,
    name: "岩美駅",
};
exports.IWAMI_TOURISM_ASSOCIATION_ID = "iwami-tourism-association";
exports.HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
exports.ISO_TIME_CAPTURE_PATTERN = /T([01]\d|2[0-3]):([0-5]\d)/;
//# sourceMappingURL=constants.js.map