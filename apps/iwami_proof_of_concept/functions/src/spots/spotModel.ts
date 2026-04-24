import { deriveBusinessOperationalData } from "./businessRules";
import { spotListFiltersSchema, spotRecordSchema, spotSearchFiltersSchema, spotWriteInputSchema } from "./spotSchema";
import { SpotValidationError, zodIssuesToSpotValidationIssues } from "./spotErrors";
import type {
  SpotListFilters,
  SpotOperationalJudgement,
  SpotRecord,
  SpotSearchFilters,
  SpotWriteInput,
  SpotWeeklyHours,
  SpotWeeklyHoursRange,
} from "./spotTypes";

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeStringArray(values: string[]): string[] {
  const deduped = new Set<string>();
  for (const raw of values) {
    const normalized = normalizeSpaces(raw);
    if (!normalized) continue;
    deduped.add(normalized);
  }
  return [...deduped];
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = normalizeSpaces(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeWeeklyHoursRange(range: SpotWeeklyHoursRange): SpotWeeklyHoursRange {
  return {
    open: normalizeSpaces(range.open),
    close: normalizeSpaces(range.close),
  };
}

function normalizeWeeklyHours(weeklyHours: SpotWeeklyHours | undefined): SpotWeeklyHours | undefined {
  if (!weeklyHours) return undefined;

  const normalized: SpotWeeklyHours = {};
  for (const [day, ranges] of Object.entries(weeklyHours)) {
    if (!ranges) continue;
    normalized[day as keyof SpotWeeklyHours] = ranges.map(normalizeWeeklyHoursRange);
  }
  return normalized;
}

function normalizeOperationalJudgement(input: SpotOperationalJudgement): SpotOperationalJudgement {
  const regularClosedDays = [...new Set(input.regularClosedDays)];
  const seasonalClosures = input.seasonalClosures.map((closure) => ({
    startDate: normalizeOptionalString(closure.startDate),
    endDate: normalizeOptionalString(closure.endDate),
    startMonth: closure.startMonth,
    endMonth: closure.endMonth,
    note: normalizeOptionalString(closure.note),
  }));
  const weeklyHoursRaw = input.researchMeta?.weeklyHoursRaw
    ? Object.fromEntries(
        Object.entries(input.researchMeta.weeklyHoursRaw)
          .map(([day, text]) => [day, normalizeOptionalString(text) ?? ""])
          .filter(([, text]) => text.length > 0),
      )
    : undefined;

  return {
    regularClosedDays,
    hasIrregularClosures: input.hasIrregularClosures,
    seasonalClosures,
    lastAdmission: {
      type: input.lastAdmission.type,
      time: normalizeOptionalString(input.lastAdmission.time),
      minutesBeforeClose: input.lastAdmission.minutesBeforeClose,
      note: normalizeOptionalString(input.lastAdmission.note),
    },
    flags: {
      hasRegularHolidayRule: input.flags.hasRegularHolidayRule,
      hasSeasonalClosureRule: input.flags.hasSeasonalClosureRule,
      hasLastAdmissionRule: input.flags.hasLastAdmissionRule,
    },
    needsManualReview: input.needsManualReview,
    parserVersion: input.parserVersion,
    ...(input.researchMeta
      ? {
          researchMeta: {
            confidence: normalizeOptionalString(input.researchMeta.confidence),
            notes: normalizeOptionalString(input.researchMeta.notes),
            primarySources: normalizeStringArray(input.researchMeta.primarySources),
            ...(weeklyHoursRaw && Object.keys(weeklyHoursRaw).length > 0 ? { weeklyHoursRaw } : {}),
          },
        }
      : {}),
  };
}

function normalizeSlug(rawSlug: string): string {
  return normalizeSpaces(rawSlug)
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildSearchText(input: {
  nameJa: string;
  nameEn: string | null;
  shortName: string;
  descriptionShort: string;
  descriptionLong: string;
  tags: string[];
  secondaryCategories: string[];
  areaName: string | null;
  addressJa: string;
}): string {
  const parts = [
    input.nameJa,
    input.nameEn,
    input.shortName,
    input.descriptionShort,
    input.descriptionLong,
    input.areaName,
    input.addressJa,
    ...input.tags,
    ...input.secondaryCategories,
  ];

  return normalizeStringArray(
    parts
      .filter((value): value is string => value != null)
      .map((value) => normalizeSpaces(value).toLowerCase()),
  ).join(" ");
}

export function validateSpotInput(rawInput: unknown): SpotWriteInput {
  const parsed = spotWriteInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const details = zodIssuesToSpotValidationIssues(parsed.error.issues);
    throw new SpotValidationError(details[0]?.message ?? "Invalid spot input", details);
  }
  return parsed.data;
}

export function normalizeSpotData(input: SpotWriteInput): Omit<SpotRecord, "createdAt" | "updatedAt"> {
  const slug = normalizeSlug(input.slug);
  if (!slug) {
    throw new SpotValidationError("slug is required", [{ path: "slug", message: "slug is required" }]);
  }

  const id = normalizeOptionalString(input.id) ?? slug;
  if (id !== slug) {
    throw new SpotValidationError("id and slug must match", [
      { path: "id", message: "id and slug must match" },
      { path: "slug", message: "id and slug must match" },
    ]);
  }

  const normalized: Omit<SpotRecord, "createdAt" | "updatedAt"> = {
    id,
    slug,
    nameJa: normalizeSpaces(input.nameJa),
    nameEn: normalizeOptionalString(input.nameEn),
    shortName: normalizeSpaces(input.shortName),
    status: input.status,
    primaryCategory: input.primaryCategory,
    secondaryCategories: normalizeStringArray(input.secondaryCategories),
    tags: normalizeStringArray(input.tags),
    location: {
      lat: input.location.lat,
      lng: input.location.lng,
      geohash: normalizeOptionalString(input.location.geohash),
      addressJa: normalizeSpaces(input.location.addressJa),
      areaName: normalizeOptionalString(input.location.areaName),
      stationAreaType: input.location.stationAreaType,
    },
    nearestStations: input.nearestStations.map((station) => ({
      stationId: normalizeSpaces(station.stationId),
      stationName: normalizeSpaces(station.stationName),
      distanceMeters: station.distanceMeters,
      walkMinutes: station.walkMinutes,
    })),
    descriptionShort: normalizeSpaces(input.descriptionShort),
    descriptionLong: normalizeSpaces(input.descriptionLong),
    heroImageUrl: normalizeOptionalString(input.heroImageUrl),
    galleryImageUrls: normalizeStringArray(input.galleryImageUrls),
    thumbnailUrl: normalizeOptionalString(input.thumbnailUrl),
    websiteUrl: normalizeOptionalString(input.websiteUrl),
    instagramUrl: normalizeOptionalString(input.instagramUrl),
    phoneNumber: normalizeOptionalString(input.phoneNumber),
    operatorName: normalizeOptionalString(input.operatorName),
    business: (() => {
      const derivedBusiness = deriveBusinessOperationalData({
        isAlwaysOpen: input.business.isAlwaysOpen,
        openingHoursText: input.business.openingHoursText,
        regularHolidaysText: input.business.regularHolidaysText,
        lastEntryTime: input.business.lastEntryTime,
        weeklyHours: input.business.weeklyHours,
        operationalJudgement: input.business.operationalJudgement,
      });
      const weeklyHours = normalizeWeeklyHours(derivedBusiness.weeklyHours);
      return {
        isAlwaysOpen: input.business.isAlwaysOpen,
        openingHoursText: normalizeOptionalString(input.business.openingHoursText),
        regularHolidaysText: normalizeOptionalString(input.business.regularHolidaysText),
        reservationRequired: input.business.reservationRequired,
        lastEntryTime: normalizeOptionalString(derivedBusiness.lastEntryTime),
        estimatedStayMinutesMin: input.business.estimatedStayMinutesMin,
        estimatedStayMinutesMax: input.business.estimatedStayMinutesMax,
        operationalJudgement: normalizeOperationalJudgement(derivedBusiness.operationalJudgement),
        ...(weeklyHours ? { weeklyHours } : {}),
      };
    })(),
    pricing: {
      ...input.pricing,
      priceLabel: normalizeOptionalString(input.pricing.priceLabel),
    },
    access: {
      ...input.access,
      supportedTransports: [...new Set(input.access.supportedTransports)],
      requiredFirstStopReason: input.access.requiresFirstStop ? input.access.requiredFirstStopReason : null,
    },
    plannerAttributes: {
      ...input.plannerAttributes,
      themes: normalizeStringArray(input.plannerAttributes.themes),
      moodTags: normalizeStringArray(input.plannerAttributes.moodTags),
      timeOfDaySuitability: [...new Set(input.plannerAttributes.timeOfDaySuitability)],
      visitPace: [...new Set(input.plannerAttributes.visitPace)],
      withWho: [...new Set(input.plannerAttributes.withWho)],
    },
    aiContext: {
      plannerSummary: normalizeSpaces(input.aiContext.plannerSummary),
      whyVisit: normalizeStringArray(input.aiContext.whyVisit),
      bestFor: normalizeStringArray(input.aiContext.bestFor),
      avoidIf: normalizeStringArray(input.aiContext.avoidIf),
      sampleUseCases: normalizeStringArray(input.aiContext.sampleUseCases),
    },
    relatedSpotIds: normalizeStringArray(input.relatedSpotIds),
    campaignCompatible: input.campaignCompatible,
    couponCompatible: input.couponCompatible,
    storyCompatible: input.storyCompatible,
    source: input.source,
    lastReviewedAt: normalizeOptionalString(input.lastReviewedAt),
    searchText:
      normalizeOptionalString(input.searchText) ??
      buildSearchText({
        nameJa: input.nameJa,
        nameEn: input.nameEn,
        shortName: input.shortName,
        descriptionShort: input.descriptionShort,
        descriptionLong: input.descriptionLong,
        tags: input.tags,
        secondaryCategories: input.secondaryCategories,
        areaName: input.location.areaName,
        addressJa: input.location.addressJa,
      }),
  };

  const recordValidation = spotRecordSchema.safeParse({
    ...normalized,
    createdAt: "placeholder",
    updatedAt: "placeholder",
  });

  if (!recordValidation.success) {
    const details = zodIssuesToSpotValidationIssues(recordValidation.error.issues);
    throw new SpotValidationError(details[0]?.message ?? "Invalid normalized spot", details);
  }

  return normalized;
}

export function validateSpotListFilters(rawFilters: unknown): SpotListFilters {
  const parsed = spotListFiltersSchema.safeParse(rawFilters ?? {});
  if (!parsed.success) {
    const details = zodIssuesToSpotValidationIssues(parsed.error.issues);
    throw new SpotValidationError(details[0]?.message ?? "Invalid filters", details);
  }
  return parsed.data;
}

export function validateSpotSearchFilters(rawFilters: unknown): SpotSearchFilters {
  const parsed = spotSearchFiltersSchema.safeParse(rawFilters ?? {});
  if (!parsed.success) {
    const details = zodIssuesToSpotValidationIssues(parsed.error.issues);
    throw new SpotValidationError(details[0]?.message ?? "Invalid filters", details);
  }
  return parsed.data;
}
