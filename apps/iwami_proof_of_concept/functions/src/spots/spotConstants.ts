export const SPOT_STATUS_VALUES = ["draft", "published", "archived"] as const;
export const SPOT_PRIMARY_CATEGORY_VALUES = ["see", "eat", "shop", "stay", "experience"] as const;
export const SPOT_STATION_AREA_TYPE_VALUES = [
  "iwami_station_area",
  "higashihama_station_area",
  "oiwa_station_area",
  "none",
] as const;
export const SPOT_TRANSPORT_VALUES = ["walk", "rental_cycle", "car", "bus", "train"] as const;
export const SPOT_PRICE_TYPE_VALUES = ["free", "paid", "purchase_optional", "unknown"] as const;
export const SPOT_WEATHER_RATING_VALUES = ["good", "ok", "bad"] as const;
export const SPOT_TIME_OF_DAY_VALUES = ["morning", "daytime", "sunset", "night"] as const;
export const SPOT_VISIT_PACE_VALUES = ["short_stop", "normal_stop", "long_stay"] as const;
export const SPOT_WITH_WHO_VALUES = ["solo", "friends", "couple", "family"] as const;
export const SPOT_PHYSICAL_LOAD_VALUES = ["low", "medium", "high"] as const;
export const SPOT_INDOOR_OUTDOOR_VALUES = ["indoor", "outdoor", "mixed"] as const;
export const SPOT_SOURCE_VALUES = ["manual", "import_csv", "import_json"] as const;
export const SPOT_REQUIRED_FIRST_STOP_REASON_VALUES = [
  "rental_cycle_pickup",
  "ticket_exchange",
  "checkin_required",
  "other",
] as const;
export const SPOT_BUSINESS_DAY_VALUES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"] as const;
export const SPOT_LAST_ADMISSION_RULE_TYPE_VALUES = ["none", "fixed_time", "before_close"] as const;

export const SPOT_THEME_VALUES = [
  "sea_view",
  "seafood",
  "relax",
  "history",
  "family",
  "photo",
  "station_stopover",
  "shopping",
  "activity",
] as const;

export const SPOT_SECONDARY_CATEGORY_VALUES = [
  "scenery",
  "beach",
  "seafood",
  "cafe",
  "souvenir",
  "onsen",
  "activity",
  "story_spot",
  "station_area",
] as const;

export const IWAMI_STATION_IDS = ["iwami-station", "higashihama-station", "oiwa-station"] as const;
