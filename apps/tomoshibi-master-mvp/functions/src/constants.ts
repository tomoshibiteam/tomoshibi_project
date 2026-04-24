export const PLAN_REQUESTS_COLLECTION = "planRequests";

export const PLAN_REQUEST_STATUS = {
  QUEUED: "queued",
  GENERATING: "generating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const PLAN_GENERATION_STAGE = {
  QUEUED: "queued",
  INTENT_PARSING: "intent_parsing",
  CANDIDATE_SELECTION: "candidate_selection",
  ROUTE_PLANNING: "route_planning",
  AI_REFINEMENT: "ai_refinement",
  VALIDATING: "validating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const GENERATION_META = {
  SOURCE: "web",
  VERSION: 1,
} as const;

export const PLAN_POLL_TOKEN_BYTES = 18;
export const PLAN_POLLING_INTERVAL_MS = 2_000;
export const PLAN_GENERATION_MAX_ATTEMPTS = 3;

export const PLAN_GENERATION_ERROR_CODE = {
  NO_CANDIDATE: "NO_CANDIDATE",
  TIME_OVER: "TIME_OVER",
  RETURN_CONSTRAINT: "RETURN_CONSTRAINT",
  SPOT_CLOSED: "SPOT_CLOSED",
  ROUTE_UNAVAILABLE: "ROUTE_UNAVAILABLE",
  AI_PARSE_FAILED: "AI_PARSE_FAILED",
  INTERNAL: "INTERNAL",
} as const;

export const TRIP_STYLE = {
  DAY_TRIP: "day_trip",
  OVERNIGHT: "overnight",
} as const;

export const DEPARTURE_TYPE = {
  IWAMI_STATION: "iwami_station",
  CURRENT_LOCATION: "current_location",
} as const;

export const DURATION_TYPE = {
  TWO_HOURS: "2h",
  FOUR_HOURS: "4h",
  CUSTOM: "custom",
} as const;

export const RETURN_TRANSPORT = {
  TRAIN: "train",
  CAR: "car",
} as const;

export const RETURN_STATION = {
  IWAMI: "iwami_station",
  HIGASHIHAMA: "higashihama_station",
  OIWA: "oiwa_station",
} as const;

export const RETURN_STATION_LABEL: Record<(typeof RETURN_STATION)[keyof typeof RETURN_STATION], string> = {
  [RETURN_STATION.IWAMI]: "岩美駅",
  [RETURN_STATION.HIGASHIHAMA]: "東浜駅",
  [RETURN_STATION.OIWA]: "大岩駅",
};

export const LOCAL_TRANSPORT = {
  WALK: "walk",
  RENTAL_CYCLE: "rental_cycle",
  CAR: "car",
  BUS: "bus",
} as const;

export const DURATION_TYPE_TO_MINUTES = {
  [DURATION_TYPE.TWO_HOURS]: 120,
  [DURATION_TYPE.FOUR_HOURS]: 240,
} as const;

export const IWAMI_STATION_ORIGIN = {
  type: "station" as const,
  id: DEPARTURE_TYPE.IWAMI_STATION,
  name: "岩美駅",
};

export const IWAMI_TOURISM_ASSOCIATION_ID = "iwami-tourism-association";

export const HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const ISO_TIME_CAPTURE_PATTERN = /T([01]\d|2[0-3]):([0-5]\d)/;
