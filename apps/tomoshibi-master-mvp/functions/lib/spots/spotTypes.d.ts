import type { SPOT_BUSINESS_DAY_VALUES, SPOT_INDOOR_OUTDOOR_VALUES, SPOT_LAST_ADMISSION_RULE_TYPE_VALUES, SPOT_PHYSICAL_LOAD_VALUES, SPOT_PRICE_TYPE_VALUES, SPOT_PRIMARY_CATEGORY_VALUES, SPOT_REQUIRED_FIRST_STOP_REASON_VALUES, SPOT_SOURCE_VALUES, SPOT_STATION_AREA_TYPE_VALUES, SPOT_STATUS_VALUES, SPOT_THEME_VALUES, SPOT_TIME_OF_DAY_VALUES, SPOT_TRANSPORT_VALUES, SPOT_VISIT_PACE_VALUES, SPOT_WEATHER_RATING_VALUES, SPOT_WITH_WHO_VALUES } from "./spotConstants";
export type SpotStatus = (typeof SPOT_STATUS_VALUES)[number];
export type SpotPrimaryCategory = (typeof SPOT_PRIMARY_CATEGORY_VALUES)[number];
export type SpotStationAreaType = (typeof SPOT_STATION_AREA_TYPE_VALUES)[number];
export type SpotTransport = (typeof SPOT_TRANSPORT_VALUES)[number];
export type SpotPriceType = (typeof SPOT_PRICE_TYPE_VALUES)[number];
export type SpotWeatherRating = (typeof SPOT_WEATHER_RATING_VALUES)[number];
export type SpotTimeOfDay = (typeof SPOT_TIME_OF_DAY_VALUES)[number];
export type SpotVisitPace = (typeof SPOT_VISIT_PACE_VALUES)[number];
export type SpotWithWho = (typeof SPOT_WITH_WHO_VALUES)[number];
export type SpotPhysicalLoad = (typeof SPOT_PHYSICAL_LOAD_VALUES)[number];
export type SpotIndoorOutdoor = (typeof SPOT_INDOOR_OUTDOOR_VALUES)[number];
export type SpotSource = (typeof SPOT_SOURCE_VALUES)[number];
export type SpotRequiredFirstStopReason = (typeof SPOT_REQUIRED_FIRST_STOP_REASON_VALUES)[number];
export type SpotTheme = (typeof SPOT_THEME_VALUES)[number] | string;
export type SpotBusinessDay = (typeof SPOT_BUSINESS_DAY_VALUES)[number];
export type SpotLastAdmissionRuleType = (typeof SPOT_LAST_ADMISSION_RULE_TYPE_VALUES)[number];
export type SpotNearestStation = {
    stationId: string;
    stationName: string;
    distanceMeters: number;
    walkMinutes: number;
};
export type SpotLocation = {
    lat: number;
    lng: number;
    geohash: string | null;
    addressJa: string;
    areaName: string | null;
    stationAreaType: SpotStationAreaType;
};
export type SpotWeeklyHoursRange = {
    open: string;
    close: string;
};
export type SpotWeeklyHours = Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", SpotWeeklyHoursRange[]>>;
export type SpotSeasonalClosure = {
    startDate: string | null;
    endDate: string | null;
    startMonth: number | null;
    endMonth: number | null;
    note: string | null;
};
export type SpotLastAdmissionRule = {
    type: SpotLastAdmissionRuleType;
    time: string | null;
    minutesBeforeClose: number | null;
    note: string | null;
};
export type SpotResearchMeta = {
    confidence: string | null;
    notes: string | null;
    primarySources: string[];
    weeklyHoursRaw?: Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>>;
};
export type SpotOperationalJudgement = {
    regularClosedDays: SpotBusinessDay[];
    hasIrregularClosures: boolean;
    seasonalClosures: SpotSeasonalClosure[];
    lastAdmission: SpotLastAdmissionRule;
    flags: {
        hasRegularHolidayRule: boolean;
        hasSeasonalClosureRule: boolean;
        hasLastAdmissionRule: boolean;
    };
    needsManualReview: boolean;
    parserVersion: number;
    researchMeta?: SpotResearchMeta;
};
export type SpotBusiness = {
    isAlwaysOpen: boolean;
    openingHoursText: string | null;
    regularHolidaysText: string | null;
    reservationRequired: boolean;
    lastEntryTime: string | null;
    estimatedStayMinutesMin: number;
    estimatedStayMinutesMax: number;
    weeklyHours?: SpotWeeklyHours;
    operationalJudgement?: SpotOperationalJudgement;
};
export type SpotPricing = {
    priceType: SpotPriceType;
    priceLabel: string | null;
    priceMinYen: number | null;
    priceMaxYen: number | null;
};
export type SpotAccess = {
    supportedTransports: SpotTransport[];
    parkingAvailable: boolean;
    bikeParkingAvailable: boolean;
    busStopNearby: boolean;
    requiresFirstStop: boolean;
    requiredFirstStopReason: SpotRequiredFirstStopReason | null;
};
export type SpotPlannerAttributes = {
    themes: SpotTheme[];
    moodTags: string[];
    weatherSuitability: {
        sunny: SpotWeatherRating;
        cloudy: SpotWeatherRating;
        rainy: SpotWeatherRating;
        windy: SpotWeatherRating;
    };
    timeOfDaySuitability: SpotTimeOfDay[];
    visitPace: SpotVisitPace[];
    withWho: SpotWithWho[];
    physicalLoad: SpotPhysicalLoad;
    indoorOutdoor: SpotIndoorOutdoor;
    rainFallbackCandidate: boolean;
    photoSpotScore: number;
    scenicScore: number;
    foodScore: number;
    shoppingScore: number;
    experienceScore: number;
    stationStopoverScore: number;
    priorityScore: number;
};
export type SpotAiContext = {
    plannerSummary: string;
    whyVisit: string[];
    bestFor: string[];
    avoidIf: string[];
    sampleUseCases: string[];
};
export type SpotRecord = {
    id: string;
    slug: string;
    nameJa: string;
    nameEn: string | null;
    shortName: string;
    status: SpotStatus;
    primaryCategory: SpotPrimaryCategory;
    secondaryCategories: string[];
    tags: string[];
    location: SpotLocation;
    nearestStations: SpotNearestStation[];
    descriptionShort: string;
    descriptionLong: string;
    heroImageUrl: string | null;
    galleryImageUrls: string[];
    thumbnailUrl: string | null;
    websiteUrl: string | null;
    instagramUrl: string | null;
    phoneNumber: string | null;
    operatorName: string | null;
    business: SpotBusiness;
    pricing: SpotPricing;
    access: SpotAccess;
    plannerAttributes: SpotPlannerAttributes;
    aiContext: SpotAiContext;
    relatedSpotIds: string[];
    campaignCompatible: boolean;
    couponCompatible: boolean;
    storyCompatible: boolean;
    source: SpotSource;
    lastReviewedAt: string | null;
    searchText: string;
    createdAt: unknown;
    updatedAt: unknown;
};
export type SpotWriteInput = Omit<SpotRecord, "createdAt" | "updatedAt" | "searchText" | "id"> & {
    id?: string;
    searchText?: string | null;
};
export type SpotListFilters = {
    status?: SpotStatus;
    primaryCategory?: SpotPrimaryCategory;
    areaName?: string;
    stationAreaType?: SpotStationAreaType;
    supportedTransports?: SpotTransport[];
    storyCompatible?: boolean;
    couponCompatible?: boolean;
    campaignCompatible?: boolean;
    limit?: number;
};
export type SpotSearchFilters = SpotListFilters & {
    query: string;
};
