import { z } from "zod";
import {
  SPOT_BUSINESS_DAY_VALUES,
  SPOT_INDOOR_OUTDOOR_VALUES,
  SPOT_LAST_ADMISSION_RULE_TYPE_VALUES,
  SPOT_PHYSICAL_LOAD_VALUES,
  SPOT_PRICE_TYPE_VALUES,
  SPOT_PRIMARY_CATEGORY_VALUES,
  SPOT_REQUIRED_FIRST_STOP_REASON_VALUES,
  SPOT_SOURCE_VALUES,
  SPOT_STATION_AREA_TYPE_VALUES,
  SPOT_STATUS_VALUES,
  SPOT_TIME_OF_DAY_VALUES,
  SPOT_TRANSPORT_VALUES,
  SPOT_VISIT_PACE_VALUES,
  SPOT_WEATHER_RATING_VALUES,
  SPOT_WITH_WHO_VALUES,
} from "./spotConstants";

const hhmmSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time must be HH:mm");

const nonEmptyStringSchema = z.string().trim().min(1);
const optionalStringSchema = nonEmptyStringSchema.optional();
const nullableStringSchema = nonEmptyStringSchema.nullable();

const urlSchema = z.string().trim().url();
const nullableUrlSchema = z.union([urlSchema, z.null()]);

const spotStatusSchema = z.enum(SPOT_STATUS_VALUES);
const primaryCategorySchema = z.enum(SPOT_PRIMARY_CATEGORY_VALUES);
const stationAreaTypeSchema = z.enum(SPOT_STATION_AREA_TYPE_VALUES);
const transportSchema = z.enum(SPOT_TRANSPORT_VALUES);
const priceTypeSchema = z.enum(SPOT_PRICE_TYPE_VALUES);
const weatherRatingSchema = z.enum(SPOT_WEATHER_RATING_VALUES);
const timeOfDaySchema = z.enum(SPOT_TIME_OF_DAY_VALUES);
const visitPaceSchema = z.enum(SPOT_VISIT_PACE_VALUES);
const withWhoSchema = z.enum(SPOT_WITH_WHO_VALUES);
const physicalLoadSchema = z.enum(SPOT_PHYSICAL_LOAD_VALUES);
const indoorOutdoorSchema = z.enum(SPOT_INDOOR_OUTDOOR_VALUES);
const sourceSchema = z.enum(SPOT_SOURCE_VALUES);
const requiredFirstStopReasonSchema = z.enum(SPOT_REQUIRED_FIRST_STOP_REASON_VALUES);
const businessDaySchema = z.enum(SPOT_BUSINESS_DAY_VALUES);
const lastAdmissionRuleTypeSchema = z.enum(SPOT_LAST_ADMISSION_RULE_TYPE_VALUES);

export const spotNearestStationSchema = z.object({
  stationId: nonEmptyStringSchema,
  stationName: nonEmptyStringSchema,
  distanceMeters: z.number().finite().min(0),
  walkMinutes: z.number().finite().min(0),
});

export const spotLocationSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  geohash: z.union([nonEmptyStringSchema, z.null()]),
  addressJa: nonEmptyStringSchema,
  areaName: z.union([nonEmptyStringSchema, z.null()]),
  stationAreaType: stationAreaTypeSchema,
});

const weeklyHourRangeSchema = z
  .object({
    open: hhmmSchema,
    close: hhmmSchema,
  })
  .superRefine((value, ctx) => {
    if (value.open >= value.close) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["close"],
        message: "close must be later than open",
      });
    }
  });

const weeklyHoursSchema = z
  .object({
    mon: z.array(weeklyHourRangeSchema).optional(),
    tue: z.array(weeklyHourRangeSchema).optional(),
    wed: z.array(weeklyHourRangeSchema).optional(),
    thu: z.array(weeklyHourRangeSchema).optional(),
    fri: z.array(weeklyHourRangeSchema).optional(),
    sat: z.array(weeklyHourRangeSchema).optional(),
    sun: z.array(weeklyHourRangeSchema).optional(),
  })
  .optional();

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const seasonalClosureSchema = z.object({
  startDate: z.union([isoDateSchema, z.null()]),
  endDate: z.union([isoDateSchema, z.null()]),
  startMonth: z.union([z.number().int().min(1).max(12), z.null()]),
  endMonth: z.union([z.number().int().min(1).max(12), z.null()]),
  note: z.union([nonEmptyStringSchema, z.null()]),
});

const lastAdmissionRuleSchema = z
  .object({
    type: lastAdmissionRuleTypeSchema,
    time: z.union([hhmmSchema, z.null()]),
    minutesBeforeClose: z.union([z.number().int().min(1), z.null()]),
    note: z.union([nonEmptyStringSchema, z.null()]),
  })
  .superRefine((value, ctx) => {
    if (value.type === "fixed_time" && value.time == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["time"],
        message: "time is required when lastAdmission.type is fixed_time",
      });
    }
    if (value.type === "before_close" && value.minutesBeforeClose == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minutesBeforeClose"],
        message: "minutesBeforeClose is required when lastAdmission.type is before_close",
      });
    }
  });

const operationalJudgementSchema = z.object({
  regularClosedDays: z.array(businessDaySchema),
  hasIrregularClosures: z.boolean().default(false),
  seasonalClosures: z.array(seasonalClosureSchema).default([]),
  lastAdmission: lastAdmissionRuleSchema,
  flags: z.object({
    hasRegularHolidayRule: z.boolean().default(false),
    hasSeasonalClosureRule: z.boolean().default(false),
    hasLastAdmissionRule: z.boolean().default(false),
  }),
  needsManualReview: z.boolean().default(false),
  parserVersion: z.number().int().min(1),
  researchMeta: z
    .object({
      confidence: z.union([nonEmptyStringSchema, z.null()]),
      notes: z.union([nonEmptyStringSchema, z.null()]),
      primarySources: z.array(nonEmptyStringSchema),
      weeklyHoursRaw: z
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

export const spotBusinessSchema = z
  .object({
    isAlwaysOpen: z.boolean(),
    openingHoursText: z.union([nonEmptyStringSchema, z.null()]),
    regularHolidaysText: z.union([nonEmptyStringSchema, z.null()]),
    reservationRequired: z.boolean().default(false),
    lastEntryTime: z.union([hhmmSchema, z.null()]),
    estimatedStayMinutesMin: z.number().int().min(1),
    estimatedStayMinutesMax: z.number().int().min(1),
    weeklyHours: weeklyHoursSchema,
    operationalJudgement: operationalJudgementSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.estimatedStayMinutesMin > value.estimatedStayMinutesMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estimatedStayMinutesMax"],
        message: "estimatedStayMinutesMax must be greater than or equal to estimatedStayMinutesMin",
      });
    }
  });

export const spotPricingSchema = z
  .object({
    priceType: priceTypeSchema,
    priceLabel: z.union([nonEmptyStringSchema, z.null()]),
    priceMinYen: z.union([z.number().int().min(0), z.null()]),
    priceMaxYen: z.union([z.number().int().min(0), z.null()]),
  })
  .superRefine((value, ctx) => {
    if (value.priceMinYen != null && value.priceMaxYen != null && value.priceMinYen > value.priceMaxYen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priceMaxYen"],
        message: "priceMaxYen must be greater than or equal to priceMinYen",
      });
    }
  });

export const spotAccessSchema = z
  .object({
    supportedTransports: z.array(transportSchema).min(1),
    parkingAvailable: z.boolean().default(false),
    bikeParkingAvailable: z.boolean().default(false),
    busStopNearby: z.boolean().default(false),
    requiresFirstStop: z.boolean().default(false),
    requiredFirstStopReason: z.union([requiredFirstStopReasonSchema, z.null()]).default(null),
  })
  .superRefine((value, ctx) => {
    if (value.requiresFirstStop && !value.requiredFirstStopReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiredFirstStopReason"],
        message: "requiredFirstStopReason is required when requiresFirstStop is true",
      });
    }
  });

export const spotPlannerAttributesSchema = z.object({
  themes: z.array(nonEmptyStringSchema),
  moodTags: z.array(nonEmptyStringSchema),
  weatherSuitability: z.object({
    sunny: weatherRatingSchema,
    cloudy: weatherRatingSchema,
    rainy: weatherRatingSchema,
    windy: weatherRatingSchema,
  }),
  timeOfDaySuitability: z.array(timeOfDaySchema),
  visitPace: z.array(visitPaceSchema),
  withWho: z.array(withWhoSchema),
  physicalLoad: physicalLoadSchema,
  indoorOutdoor: indoorOutdoorSchema,
  rainFallbackCandidate: z.boolean(),
  photoSpotScore: z.number().int().min(1).max(5),
  scenicScore: z.number().int().min(1).max(5),
  foodScore: z.number().int().min(1).max(5),
  shoppingScore: z.number().int().min(1).max(5),
  experienceScore: z.number().int().min(1).max(5),
  stationStopoverScore: z.number().int().min(1).max(5),
  priorityScore: z.number().finite(),
});

export const spotAiContextSchema = z.object({
  plannerSummary: nonEmptyStringSchema,
  whyVisit: z.array(nonEmptyStringSchema),
  bestFor: z.array(nonEmptyStringSchema),
  avoidIf: z.array(nonEmptyStringSchema),
  sampleUseCases: z.array(nonEmptyStringSchema),
});

export const spotWriteInputSchema = z
  .object({
    id: optionalStringSchema,
    slug: nonEmptyStringSchema,
    nameJa: nonEmptyStringSchema,
    nameEn: z.union([nonEmptyStringSchema, z.null()]).optional().default(null),
    shortName: nonEmptyStringSchema,
    status: spotStatusSchema,
    primaryCategory: primaryCategorySchema,
    secondaryCategories: z.array(nonEmptyStringSchema),
    tags: z.array(nonEmptyStringSchema),
    location: spotLocationSchema,
    nearestStations: z.array(spotNearestStationSchema),
    descriptionShort: nonEmptyStringSchema,
    descriptionLong: nonEmptyStringSchema,
    heroImageUrl: nullableUrlSchema.optional().default(null),
    galleryImageUrls: z.array(urlSchema).optional().default([]),
    thumbnailUrl: nullableUrlSchema.optional().default(null),
    websiteUrl: nullableUrlSchema.optional().default(null),
    instagramUrl: nullableUrlSchema.optional().default(null),
    phoneNumber: z.union([nonEmptyStringSchema, z.null()]).optional().default(null),
    operatorName: z.union([nonEmptyStringSchema, z.null()]).optional().default(null),
    business: spotBusinessSchema,
    pricing: spotPricingSchema,
    access: spotAccessSchema,
    plannerAttributes: spotPlannerAttributesSchema,
    aiContext: spotAiContextSchema,
    relatedSpotIds: z.array(nonEmptyStringSchema).optional().default([]),
    campaignCompatible: z.boolean().optional().default(false),
    couponCompatible: z.boolean().optional().default(false),
    storyCompatible: z.boolean().optional().default(false),
    source: sourceSchema,
    lastReviewedAt: z.union([z.string().trim().datetime({ offset: true }), z.null()]).optional().default(null),
    searchText: z.union([nonEmptyStringSchema, z.null()]).optional(),
  })
  .strict();

export const spotRecordSchema = spotWriteInputSchema.extend({
  id: nonEmptyStringSchema,
  searchText: nonEmptyStringSchema,
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});

export const spotListFiltersSchema = z
  .object({
    status: spotStatusSchema.optional(),
    primaryCategory: primaryCategorySchema.optional(),
    areaName: z.string().trim().min(1).optional(),
    stationAreaType: stationAreaTypeSchema.optional(),
    supportedTransports: z.array(transportSchema).min(1).optional(),
    storyCompatible: z.boolean().optional(),
    couponCompatible: z.boolean().optional(),
    campaignCompatible: z.boolean().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  })
  .strict();

export const spotSearchFiltersSchema = spotListFiltersSchema.extend({
  query: nonEmptyStringSchema,
});

export type SpotWriteInputSchema = z.infer<typeof spotWriteInputSchema>;
export type SpotRecordSchema = z.infer<typeof spotRecordSchema>;
export type SpotListFiltersSchema = z.infer<typeof spotListFiltersSchema>;
export type SpotSearchFiltersSchema = z.infer<typeof spotSearchFiltersSchema>;
