"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotSearchFiltersSchema = exports.spotListFiltersSchema = exports.spotRecordSchema = exports.spotWriteInputSchema = exports.spotAiContextSchema = exports.spotPlannerAttributesSchema = exports.spotAccessSchema = exports.spotPricingSchema = exports.spotBusinessSchema = exports.spotLocationSchema = exports.spotNearestStationSchema = void 0;
const zod_1 = require("zod");
const spotConstants_1 = require("./spotConstants");
const hhmmSchema = zod_1.z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time must be HH:mm");
const nonEmptyStringSchema = zod_1.z.string().trim().min(1);
const optionalStringSchema = nonEmptyStringSchema.optional();
const nullableStringSchema = nonEmptyStringSchema.nullable();
const urlSchema = zod_1.z.string().trim().url();
const nullableUrlSchema = zod_1.z.union([urlSchema, zod_1.z.null()]);
const spotStatusSchema = zod_1.z.enum(spotConstants_1.SPOT_STATUS_VALUES);
const primaryCategorySchema = zod_1.z.enum(spotConstants_1.SPOT_PRIMARY_CATEGORY_VALUES);
const stationAreaTypeSchema = zod_1.z.enum(spotConstants_1.SPOT_STATION_AREA_TYPE_VALUES);
const transportSchema = zod_1.z.enum(spotConstants_1.SPOT_TRANSPORT_VALUES);
const priceTypeSchema = zod_1.z.enum(spotConstants_1.SPOT_PRICE_TYPE_VALUES);
const weatherRatingSchema = zod_1.z.enum(spotConstants_1.SPOT_WEATHER_RATING_VALUES);
const timeOfDaySchema = zod_1.z.enum(spotConstants_1.SPOT_TIME_OF_DAY_VALUES);
const visitPaceSchema = zod_1.z.enum(spotConstants_1.SPOT_VISIT_PACE_VALUES);
const withWhoSchema = zod_1.z.enum(spotConstants_1.SPOT_WITH_WHO_VALUES);
const physicalLoadSchema = zod_1.z.enum(spotConstants_1.SPOT_PHYSICAL_LOAD_VALUES);
const indoorOutdoorSchema = zod_1.z.enum(spotConstants_1.SPOT_INDOOR_OUTDOOR_VALUES);
const sourceSchema = zod_1.z.enum(spotConstants_1.SPOT_SOURCE_VALUES);
const requiredFirstStopReasonSchema = zod_1.z.enum(spotConstants_1.SPOT_REQUIRED_FIRST_STOP_REASON_VALUES);
const businessDaySchema = zod_1.z.enum(spotConstants_1.SPOT_BUSINESS_DAY_VALUES);
const lastAdmissionRuleTypeSchema = zod_1.z.enum(spotConstants_1.SPOT_LAST_ADMISSION_RULE_TYPE_VALUES);
exports.spotNearestStationSchema = zod_1.z.object({
    stationId: nonEmptyStringSchema,
    stationName: nonEmptyStringSchema,
    distanceMeters: zod_1.z.number().finite().min(0),
    walkMinutes: zod_1.z.number().finite().min(0),
});
exports.spotLocationSchema = zod_1.z.object({
    lat: zod_1.z.number().finite().min(-90).max(90),
    lng: zod_1.z.number().finite().min(-180).max(180),
    geohash: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    addressJa: nonEmptyStringSchema,
    areaName: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    stationAreaType: stationAreaTypeSchema,
});
const weeklyHourRangeSchema = zod_1.z
    .object({
    open: hhmmSchema,
    close: hhmmSchema,
})
    .superRefine((value, ctx) => {
    if (value.open >= value.close) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["close"],
            message: "close must be later than open",
        });
    }
});
const weeklyHoursSchema = zod_1.z
    .object({
    mon: zod_1.z.array(weeklyHourRangeSchema).optional(),
    tue: zod_1.z.array(weeklyHourRangeSchema).optional(),
    wed: zod_1.z.array(weeklyHourRangeSchema).optional(),
    thu: zod_1.z.array(weeklyHourRangeSchema).optional(),
    fri: zod_1.z.array(weeklyHourRangeSchema).optional(),
    sat: zod_1.z.array(weeklyHourRangeSchema).optional(),
    sun: zod_1.z.array(weeklyHourRangeSchema).optional(),
})
    .optional();
const isoDateSchema = zod_1.z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
const seasonalClosureSchema = zod_1.z.object({
    startDate: zod_1.z.union([isoDateSchema, zod_1.z.null()]),
    endDate: zod_1.z.union([isoDateSchema, zod_1.z.null()]),
    startMonth: zod_1.z.union([zod_1.z.number().int().min(1).max(12), zod_1.z.null()]),
    endMonth: zod_1.z.union([zod_1.z.number().int().min(1).max(12), zod_1.z.null()]),
    note: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
});
const lastAdmissionRuleSchema = zod_1.z
    .object({
    type: lastAdmissionRuleTypeSchema,
    time: zod_1.z.union([hhmmSchema, zod_1.z.null()]),
    minutesBeforeClose: zod_1.z.union([zod_1.z.number().int().min(1), zod_1.z.null()]),
    note: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
})
    .superRefine((value, ctx) => {
    if (value.type === "fixed_time" && value.time == null) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["time"],
            message: "time is required when lastAdmission.type is fixed_time",
        });
    }
    if (value.type === "before_close" && value.minutesBeforeClose == null) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["minutesBeforeClose"],
            message: "minutesBeforeClose is required when lastAdmission.type is before_close",
        });
    }
});
const operationalJudgementSchema = zod_1.z.object({
    regularClosedDays: zod_1.z.array(businessDaySchema),
    hasIrregularClosures: zod_1.z.boolean().default(false),
    seasonalClosures: zod_1.z.array(seasonalClosureSchema).default([]),
    lastAdmission: lastAdmissionRuleSchema,
    flags: zod_1.z.object({
        hasRegularHolidayRule: zod_1.z.boolean().default(false),
        hasSeasonalClosureRule: zod_1.z.boolean().default(false),
        hasLastAdmissionRule: zod_1.z.boolean().default(false),
    }),
    needsManualReview: zod_1.z.boolean().default(false),
    parserVersion: zod_1.z.number().int().min(1),
    researchMeta: zod_1.z
        .object({
        confidence: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
        notes: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
        primarySources: zod_1.z.array(nonEmptyStringSchema),
        weeklyHoursRaw: zod_1.z
            .object({
            mon: nonEmptyStringSchema.optional(),
            tue: nonEmptyStringSchema.optional(),
            wed: nonEmptyStringSchema.optional(),
            thu: nonEmptyStringSchema.optional(),
            fri: nonEmptyStringSchema.optional(),
            sat: nonEmptyStringSchema.optional(),
            sun: nonEmptyStringSchema.optional(),
        })
            .optional(),
    })
        .optional(),
});
exports.spotBusinessSchema = zod_1.z
    .object({
    isAlwaysOpen: zod_1.z.boolean(),
    openingHoursText: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    regularHolidaysText: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    reservationRequired: zod_1.z.boolean().default(false),
    lastEntryTime: zod_1.z.union([hhmmSchema, zod_1.z.null()]),
    estimatedStayMinutesMin: zod_1.z.number().int().min(1),
    estimatedStayMinutesMax: zod_1.z.number().int().min(1),
    weeklyHours: weeklyHoursSchema,
    operationalJudgement: operationalJudgementSchema.optional(),
})
    .superRefine((value, ctx) => {
    if (value.estimatedStayMinutesMin > value.estimatedStayMinutesMax) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["estimatedStayMinutesMax"],
            message: "estimatedStayMinutesMax must be greater than or equal to estimatedStayMinutesMin",
        });
    }
});
exports.spotPricingSchema = zod_1.z
    .object({
    priceType: priceTypeSchema,
    priceLabel: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]),
    priceMinYen: zod_1.z.union([zod_1.z.number().int().min(0), zod_1.z.null()]),
    priceMaxYen: zod_1.z.union([zod_1.z.number().int().min(0), zod_1.z.null()]),
})
    .superRefine((value, ctx) => {
    if (value.priceMinYen != null && value.priceMaxYen != null && value.priceMinYen > value.priceMaxYen) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["priceMaxYen"],
            message: "priceMaxYen must be greater than or equal to priceMinYen",
        });
    }
});
exports.spotAccessSchema = zod_1.z
    .object({
    supportedTransports: zod_1.z.array(transportSchema).min(1),
    parkingAvailable: zod_1.z.boolean().default(false),
    bikeParkingAvailable: zod_1.z.boolean().default(false),
    busStopNearby: zod_1.z.boolean().default(false),
    requiresFirstStop: zod_1.z.boolean().default(false),
    requiredFirstStopReason: zod_1.z.union([requiredFirstStopReasonSchema, zod_1.z.null()]).default(null),
})
    .superRefine((value, ctx) => {
    if (value.requiresFirstStop && !value.requiredFirstStopReason) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["requiredFirstStopReason"],
            message: "requiredFirstStopReason is required when requiresFirstStop is true",
        });
    }
});
exports.spotPlannerAttributesSchema = zod_1.z.object({
    themes: zod_1.z.array(nonEmptyStringSchema),
    moodTags: zod_1.z.array(nonEmptyStringSchema),
    weatherSuitability: zod_1.z.object({
        sunny: weatherRatingSchema,
        cloudy: weatherRatingSchema,
        rainy: weatherRatingSchema,
        windy: weatherRatingSchema,
    }),
    timeOfDaySuitability: zod_1.z.array(timeOfDaySchema),
    visitPace: zod_1.z.array(visitPaceSchema),
    withWho: zod_1.z.array(withWhoSchema),
    physicalLoad: physicalLoadSchema,
    indoorOutdoor: indoorOutdoorSchema,
    rainFallbackCandidate: zod_1.z.boolean(),
    photoSpotScore: zod_1.z.number().int().min(1).max(5),
    scenicScore: zod_1.z.number().int().min(1).max(5),
    foodScore: zod_1.z.number().int().min(1).max(5),
    shoppingScore: zod_1.z.number().int().min(1).max(5),
    experienceScore: zod_1.z.number().int().min(1).max(5),
    stationStopoverScore: zod_1.z.number().int().min(1).max(5),
    priorityScore: zod_1.z.number().finite(),
});
exports.spotAiContextSchema = zod_1.z.object({
    plannerSummary: nonEmptyStringSchema,
    whyVisit: zod_1.z.array(nonEmptyStringSchema),
    bestFor: zod_1.z.array(nonEmptyStringSchema),
    avoidIf: zod_1.z.array(nonEmptyStringSchema),
    sampleUseCases: zod_1.z.array(nonEmptyStringSchema),
});
exports.spotWriteInputSchema = zod_1.z
    .object({
    id: optionalStringSchema,
    slug: nonEmptyStringSchema,
    nameJa: nonEmptyStringSchema,
    nameEn: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional().default(null),
    shortName: nonEmptyStringSchema,
    status: spotStatusSchema,
    primaryCategory: primaryCategorySchema,
    secondaryCategories: zod_1.z.array(nonEmptyStringSchema),
    tags: zod_1.z.array(nonEmptyStringSchema),
    location: exports.spotLocationSchema,
    nearestStations: zod_1.z.array(exports.spotNearestStationSchema),
    descriptionShort: nonEmptyStringSchema,
    descriptionLong: nonEmptyStringSchema,
    heroImageUrl: nullableUrlSchema.optional().default(null),
    galleryImageUrls: zod_1.z.array(urlSchema).optional().default([]),
    thumbnailUrl: nullableUrlSchema.optional().default(null),
    websiteUrl: nullableUrlSchema.optional().default(null),
    instagramUrl: nullableUrlSchema.optional().default(null),
    phoneNumber: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional().default(null),
    operatorName: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional().default(null),
    business: exports.spotBusinessSchema,
    pricing: exports.spotPricingSchema,
    access: exports.spotAccessSchema,
    plannerAttributes: exports.spotPlannerAttributesSchema,
    aiContext: exports.spotAiContextSchema,
    relatedSpotIds: zod_1.z.array(nonEmptyStringSchema).optional().default([]),
    campaignCompatible: zod_1.z.boolean().optional().default(false),
    couponCompatible: zod_1.z.boolean().optional().default(false),
    storyCompatible: zod_1.z.boolean().optional().default(false),
    source: sourceSchema,
    lastReviewedAt: zod_1.z.union([zod_1.z.string().trim().datetime({ offset: true }), zod_1.z.null()]).optional().default(null),
    searchText: zod_1.z.union([nonEmptyStringSchema, zod_1.z.null()]).optional(),
})
    .strict();
exports.spotRecordSchema = exports.spotWriteInputSchema.extend({
    id: nonEmptyStringSchema,
    searchText: nonEmptyStringSchema,
    createdAt: zod_1.z.unknown(),
    updatedAt: zod_1.z.unknown(),
});
exports.spotListFiltersSchema = zod_1.z
    .object({
    status: spotStatusSchema.optional(),
    primaryCategory: primaryCategorySchema.optional(),
    areaName: zod_1.z.string().trim().min(1).optional(),
    stationAreaType: stationAreaTypeSchema.optional(),
    supportedTransports: zod_1.z.array(transportSchema).min(1).optional(),
    storyCompatible: zod_1.z.boolean().optional(),
    couponCompatible: zod_1.z.boolean().optional(),
    campaignCompatible: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().int().min(1).max(200).optional(),
})
    .strict();
exports.spotSearchFiltersSchema = exports.spotListFiltersSchema.extend({
    query: nonEmptyStringSchema,
});
//# sourceMappingURL=spotSchema.js.map