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

function asPlainObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asNormalizedStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isDefined(value: unknown): boolean {
  return value !== undefined;
}

function derivePriceLabel(params: {
  priceType: unknown;
  priceMinYen: unknown;
  priceMaxYen: unknown;
  currentLabel: unknown;
}): string | null {
  const current = asTrimmedString(params.currentLabel);
  if (current) return current;

  const priceType = asTrimmedString(params.priceType);
  const min = typeof params.priceMinYen === "number" && Number.isFinite(params.priceMinYen) ? Math.round(params.priceMinYen) : null;
  const max = typeof params.priceMaxYen === "number" && Number.isFinite(params.priceMaxYen) ? Math.round(params.priceMaxYen) : null;

  if (priceType === "free") return "無料";
  if (priceType === "purchase_optional") return "購入時のみ料金";
  if (priceType === "paid") {
    if (min != null && max != null) {
      if (min === max) return `${min}円`;
      return `${min}〜${max}円`;
    }
    if (min != null) return `${min}円〜`;
    if (max != null) return `〜${max}円`;
    return "有料";
  }
  return null;
}

function preprocessSpotInputForAuthoring(rawInput: unknown): unknown {
  const root = asPlainObject(rawInput);
  if (!root) return rawInput;

  const next: Record<string, unknown> = { ...root };

  const nameJa = asTrimmedString(root.nameJa);
  const descriptionShort = asTrimmedString(root.descriptionShort);

  if (!asTrimmedString(root.shortName) && nameJa) {
    next.shortName = nameJa;
  }

  if (!asTrimmedString(root.descriptionLong) && descriptionShort) {
    next.descriptionLong = descriptionShort;
  }

  if (!Array.isArray(root.tags)) {
    next.tags = [];
  }
  if (!Array.isArray(root.secondaryCategories)) {
    next.secondaryCategories = [];
  }
  if (!Array.isArray(root.relatedSpotIds)) {
    next.relatedSpotIds = [];
  }

  const tags = asNormalizedStringArray(next.tags);

  const pricing = asPlainObject(root.pricing);
  if (pricing) {
    const nextPricing: Record<string, unknown> = { ...pricing };
    const priceType = asTrimmedString(nextPricing.priceType);
    if (!isDefined(nextPricing.priceMinYen)) {
      nextPricing.priceMinYen = priceType === "free" ? 0 : null;
    }
    if (!isDefined(nextPricing.priceMaxYen)) {
      nextPricing.priceMaxYen = priceType === "free" ? 0 : null;
    }
    nextPricing.priceLabel = derivePriceLabel({
      priceType: nextPricing.priceType,
      priceMinYen: nextPricing.priceMinYen,
      priceMaxYen: nextPricing.priceMaxYen,
      currentLabel: nextPricing.priceLabel,
    });
    next.pricing = nextPricing;
  }

  const plannerAttributes = asPlainObject(root.plannerAttributes);
  if (plannerAttributes) {
    const nextPlannerAttributes: Record<string, unknown> = { ...plannerAttributes };
    if (!Array.isArray(nextPlannerAttributes.themes)) {
      nextPlannerAttributes.themes = tags.slice(0, 6);
    }
    if (!Array.isArray(nextPlannerAttributes.moodTags)) {
      nextPlannerAttributes.moodTags = tags.slice(0, 6);
    }
    next.plannerAttributes = nextPlannerAttributes;
  }

  const planner = asPlainObject(next.plannerAttributes);
  const themes = asNormalizedStringArray(planner?.themes);
  const moodTags = asNormalizedStringArray(planner?.moodTags);

  const aiContext = asPlainObject(root.aiContext);
  const nextAiContext: Record<string, unknown> = { ...(aiContext ?? {}) };
  if (!asTrimmedString(nextAiContext.plannerSummary)) {
    nextAiContext.plannerSummary = descriptionShort ?? nameJa ?? "スポット情報";
  }
  if (!Array.isArray(nextAiContext.whyVisit) || asNormalizedStringArray(nextAiContext.whyVisit).length === 0) {
    nextAiContext.whyVisit = [descriptionShort ?? `${nameJa ?? "このスポット"}を楽しめます`];
  }
  if (!Array.isArray(nextAiContext.bestFor) || asNormalizedStringArray(nextAiContext.bestFor).length === 0) {
    nextAiContext.bestFor = [...themes, ...moodTags].slice(0, 4);
  }
  if (!Array.isArray(nextAiContext.avoidIf)) {
    nextAiContext.avoidIf = [];
  }
  if (!Array.isArray(nextAiContext.sampleUseCases) || asNormalizedStringArray(nextAiContext.sampleUseCases).length === 0) {
    nextAiContext.sampleUseCases = descriptionShort ? [descriptionShort] : [];
  }
  next.aiContext = nextAiContext;

  return next;
}

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
  const parsed = spotWriteInputSchema.safeParse(preprocessSpotInputForAuthoring(rawInput));
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
