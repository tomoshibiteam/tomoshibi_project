import { z } from "zod";
import * as logger from "firebase-functions/logger";
import type { Firestore } from "firebase-admin/firestore";
import { PLAN_GENERATION_ERROR_CODE, PLAN_GENERATION_MAX_ATTEMPTS, PLAN_GENERATION_STAGE, PLAN_REQUEST_STATUS } from "./constants";
import { getFirebaseAdminDb } from "./firebase-admin";
import {
  getPlanRequestById,
  savePlanRequestError,
  savePlanRequestIntent,
  savePlanRequestResult,
  updatePlanRequestStatus,
} from "./repository";
import { listSpots } from "./spots/spotService";
import type { SpotBusinessDay, SpotRecord } from "./spots/spotTypes";
import {
  computeApproximateRouteMatrix,
  type RouteMatrixLocation,
  type RouteMatrixMode,
} from "./routing/approximateRouteMatrix";
import { getNextTrips, getNode } from "./transit/repository";
import type {
  LocalTransport,
  NormalizedPlanRequest,
  PlanCandidate,
  PlanConstraintCheck,
  PlanGenerationIntent,
  PlanGenerationResult,
  PlanTimelineItem,
  PlanWaypoint,
} from "./types";

type LatLng = { lat: number; lng: number };

type GeneratePlansParams = {
  db?: Firestore;
  planRequestId: string;
};

type ScoredSpot = {
  spot: SpotRecord;
  score: number;
};

type PlanStyle = "scenic" | "food" | "balanced";

type BuildPlanResult = {
  plan: PlanCandidate;
  warnings: string[];
  notes: string[];
};

type CandidateMeta = {
  style: PlanStyle;
  scores: ScoredSpot[];
};

class PlanGenerationFailure extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const themeWeightsSchema = z.object({
  scenic: z.number().min(0).max(5),
  food: z.number().min(0).max(5),
  experience: z.number().min(0).max(5),
  shopping: z.number().min(0).max(5),
  stationArea: z.number().min(0).max(5),
});

const intentSchema = z.object({
  must: z.array(z.string()),
  prefer: z.array(z.string()),
  avoid: z.array(z.string()),
  pace: z.enum(["relaxed", "normal", "active"]),
  mood: z.array(z.string()),
  themeWeights: themeWeightsSchema,
});

const JP_LOCALE = "ja-JP";
const JP_TIMEZONE = "Asia/Tokyo";
const GEMINI_MAX_ATTEMPTS = 6;
const GEMINI_RETRYABLE_STATUS = new Set([429, 500, 503]);
const GEMINI_REQUEST_TIMEOUT_MS = 20_000;

const refinementBatchSchema = z.object({
  plans: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      reasonWhyRecommended: z.string().min(1),
      matchSummary: z.string().min(1),
    }),
  ),
});

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

function toHhmm(minutes: number): string {
  const m = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)));
  const hPart = Math.floor(m / 60)
    .toString()
    .padStart(2, "0");
  const mPart = Math.floor(m % 60)
    .toString()
    .padStart(2, "0");
  return `${hPart}:${mPart}`;
}

function getCurrentDayType(now = new Date()): SpotBusinessDay {
  const weekday = new Intl.DateTimeFormat(JP_LOCALE, { weekday: "short", timeZone: JP_TIMEZONE }).format(now);
  const map: Record<string, SpotBusinessDay> = {
    月: "mon",
    火: "tue",
    水: "wed",
    木: "thu",
    金: "fri",
    土: "sat",
    日: "sun",
  };
  return map[weekday] ?? "mon";
}

function getCurrentMonth(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: JP_TIMEZONE }).formatToParts(now);
  const month = parts.find((p) => p.type === "month")?.value;
  const parsed = Number(month);
  return Number.isFinite(parsed) ? parsed : now.getUTCMonth() + 1;
}

function readGeminiApiKey(): string | null {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ];
  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized) return normalized;
  }
  return null;
}

function readGeminiModel(): string | null {
  const runtimeModel = process.env.PLAN_GEMINI_MODEL?.trim();
  if (runtimeModel) return runtimeModel;
  return process.env.GEMINI_ROUTE_MODEL?.trim() || null;
}

async function callGeminiJson<T>(params: {
  systemInstruction: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  context: string;
  responseSchema?: Record<string, unknown>;
}): Promise<T> {
  const apiKey = readGeminiApiKey();
  if (!apiKey) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini API key is not configured", {
      context: params.context,
      envSource: "runtime-env",
    });
  }

  const model = readGeminiModel();
  if (!model) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini model is not configured", {
      context: params.context,
      required: ["PLAN_GEMINI_MODEL", "GEMINI_ROUTE_MODEL"],
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const backoff = (attempt: number) => Math.min(8_000, 450 * Math.pow(2, attempt - 1) + Math.round(Math.random() * 350));

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: params.systemInstruction }],
          },
          contents: [{ role: "user", parts: [{ text: params.userPrompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
            ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
          },
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutHandle);
      const timeoutLike = error instanceof Error && (error.name === "AbortError" || /aborted|timeout/i.test(error.message));
      if (attempt < GEMINI_MAX_ATTEMPTS) {
        const waitMs = backoff(attempt);
        logger.warn("Gemini network error, retrying", {
          context: params.context,
          attempt,
          waitMs,
          reason: timeoutLike ? "timeout" : "network_error",
        });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini call failed", {
        context: params.context,
        reason: timeoutLike ? "timeout" : "network_error",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeoutHandle);
    }

    if (!response.ok) {
      const body = await response.text();
      if (attempt < GEMINI_MAX_ATTEMPTS && GEMINI_RETRYABLE_STATUS.has(response.status)) {
        const waitMs = backoff(attempt);
        logger.warn("Gemini retryable response", { context: params.context, attempt, status: response.status, waitMs });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini response not ok", {
        context: params.context,
        status: response.status,
        body: body.slice(0, 500),
      });
    }

    let json: {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    try {
      json = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
    } catch (error) {
      if (attempt < GEMINI_MAX_ATTEMPTS) {
        const waitMs = backoff(attempt);
        logger.warn("Gemini response JSON parse failed, retrying", { context: params.context, attempt, waitMs });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini response JSON parse failed", {
        context: params.context,
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) {
      if (attempt < GEMINI_MAX_ATTEMPTS) {
        const waitMs = backoff(attempt);
        logger.warn("Gemini returned empty text, retrying", { context: params.context, attempt, waitMs });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini returned empty JSON text", {
        context: params.context,
        model,
      });
    }

    try {
      const parsed = JSON.parse(text) as unknown;
      return params.schema.parse(parsed);
    } catch (error) {
      if (attempt < GEMINI_MAX_ATTEMPTS) {
        const waitMs = backoff(attempt);
        logger.warn("Gemini schema parse failed, retrying", { context: params.context, attempt, waitMs });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini schema parse failed", {
        context: params.context,
        raw: text.slice(0, 500),
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "Gemini retry limit exceeded", {
    context: params.context,
    attempts: GEMINI_MAX_ATTEMPTS,
  });
}

async function extractIntent(request: NormalizedPlanRequest): Promise<PlanGenerationIntent> {
  return callGeminiJson({
    systemInstruction:
      "あなたは旅行プランナーです。与えられた条件から意図を構造化JSONで返してください。出力はJSONのみ。",
    userPrompt: [
      "次の旅行条件をもとに意図をJSONで返してください。",
      "must/prefer/avoid は短い配列。pace は relaxed/normal/active のいずれか。",
      "themeWeights は scenic/food/experience/shopping/stationArea を 0-5 で返す。",
      JSON.stringify(
        {
          tripPrompt: request.tripPrompt,
          desiredSpots: request.desiredSpots,
          localTransports: request.localTransports,
          returnConstraint: request.returnConstraint,
          durationMinutes: request.durationMinutes,
        },
        null,
        2,
      ),
    ].join("\n"),
    schema: intentSchema,
    context: "intent_parsing",
    responseSchema: {
      type: "OBJECT",
      properties: {
        must: { type: "ARRAY", items: { type: "STRING" } },
        prefer: { type: "ARRAY", items: { type: "STRING" } },
        avoid: { type: "ARRAY", items: { type: "STRING" } },
        pace: { type: "STRING", enum: ["relaxed", "normal", "active"] },
        mood: { type: "ARRAY", items: { type: "STRING" } },
        themeWeights: {
          type: "OBJECT",
          properties: {
            scenic: { type: "NUMBER" },
            food: { type: "NUMBER" },
            experience: { type: "NUMBER" },
            shopping: { type: "NUMBER" },
            stationArea: { type: "NUMBER" },
          },
        },
      },
      required: ["must", "prefer", "avoid", "pace", "mood", "themeWeights"],
    },
  });
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function includesAnyText(base: string, needles: string[]): boolean {
  if (needles.length === 0) return false;
  return needles.some((needle) => {
    const normalized = normalizeText(needle);
    if (!normalized) return false;
    return base.includes(normalized);
  });
}

function resolvePrimaryTransport(localTransports: LocalTransport[]): LocalTransport {
  const priority: LocalTransport[] = ["car", "rental_cycle", "bus", "walk"];
  for (const transport of priority) {
    if (localTransports.includes(transport)) return transport;
  }
  return "walk";
}

function toRouteMatrixMode(mode: LocalTransport): RouteMatrixMode {
  if (mode === "rental_cycle") return "rental_cycle";
  if (mode === "car") return "car";
  if (mode === "bus") return "bus";
  return "walk";
}

function isTransportCompatible(spot: SpotRecord, localTransports: LocalTransport[]): boolean {
  return localTransports.some((transport) => spot.access.supportedTransports.includes(transport));
}

function scoreSpot(
  spot: SpotRecord,
  style: PlanStyle,
  intent: PlanGenerationIntent,
  request: NormalizedPlanRequest,
): number {
  const planner = spot.plannerAttributes;
  const text = normalizeText(
    [
      spot.nameJa,
      spot.shortName,
      spot.descriptionShort,
      spot.aiContext.plannerSummary,
      ...spot.tags,
      ...spot.plannerAttributes.themes,
      ...spot.plannerAttributes.moodTags,
    ].join(" "),
  );

  const desiredHit = includesAnyText(text, request.desiredSpots) ? 4 : 0;
  const mustHit = includesAnyText(text, intent.must) ? 2.2 : 0;
  const preferHit = includesAnyText(text, intent.prefer) ? 1.6 : 0;
  const avoidPenalty = includesAnyText(text, intent.avoid) ? -3.5 : 0;
  const stationBonus = planner.stationStopoverScore * (intent.themeWeights.stationArea / 5);
  const paceBonus = (() => {
    if (intent.pace === "relaxed") {
      return planner.visitPace.includes("short_stop") || planner.visitPace.includes("normal_stop") ? 1.2 : 0;
    }
    if (intent.pace === "active") {
      return planner.physicalLoad === "high" || planner.experienceScore >= 4 ? 0.8 : 0.1;
    }
    return 0.4;
  })();

  const styleScore =
    style === "scenic"
      ? planner.scenicScore * 2 + planner.photoSpotScore * 1.2 + planner.foodScore * 0.5
      : style === "food"
        ? planner.foodScore * 2 + planner.scenicScore * 0.5 + planner.shoppingScore * 0.7
        : planner.scenicScore * 1.2 + planner.foodScore * 1.2 + planner.experienceScore * 1.1 + planner.shoppingScore * 0.5;

  return (
    planner.priorityScore * 0.35 +
    styleScore +
    desiredHit +
    mustHit +
    preferHit +
    paceBonus +
    stationBonus +
    avoidPenalty
  );
}

function selectCandidates(
  spots: SpotRecord[],
  intent: PlanGenerationIntent,
  request: NormalizedPlanRequest,
): CandidateMeta[] {
  const filtered = spots.filter((spot) => isTransportCompatible(spot, request.localTransports));
  const styles: PlanStyle[] = ["scenic", "food", "balanced"];

  return styles.map((style) => {
    const ranked = filtered
      .map((spot) => ({ spot, score: scoreSpot(spot, style, intent, request) }))
      .sort((a, b) => b.score - a.score);

    if (request.requiresCyclePickup && request.cyclePickupLocationId) {
      const pickupSpot = filtered.find((spot) => spot.id === request.cyclePickupLocationId);
      if (pickupSpot) {
        const rankedPickup =
          ranked.find((item) => item.spot.id === pickupSpot.id) ??
          ({
            spot: pickupSpot,
            score: scoreSpot(pickupSpot, style, intent, request),
          } satisfies ScoredSpot);
        const withoutPickup = ranked.filter((item) => item.spot.id !== pickupSpot.id);
        return { style, scores: [rankedPickup, ...withoutPickup].slice(0, 18) };
      }
    }

    return { style, scores: ranked.slice(0, 18) };
  });
}

function toDayKey(dayType: SpotBusinessDay): keyof NonNullable<SpotRecord["business"]["weeklyHours"]> {
  if (dayType === "holiday") return "sun";
  return dayType;
}

function isSeasonalClosed(spot: SpotRecord, month: number): boolean {
  const entries = spot.business.operationalJudgement?.seasonalClosures ?? [];
  return entries.some((entry) => {
    if (entry.startMonth == null || entry.endMonth == null) return false;
    if (entry.startMonth <= entry.endMonth) {
      return month >= entry.startMonth && month <= entry.endMonth;
    }
    return month >= entry.startMonth || month <= entry.endMonth;
  });
}

function isWithinWeeklyHours(spot: SpotRecord, dayType: SpotBusinessDay, arrival: number, departure: number): boolean {
  if (spot.business.isAlwaysOpen) return true;
  const weeklyHours = spot.business.weeklyHours;
  if (!weeklyHours) return true;
  const key = toDayKey(dayType);
  const ranges = weeklyHours[key];
  if (!ranges || ranges.length === 0) return false;
  return ranges.some((range) => {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);
    return arrival >= open && departure <= close;
  });
}

function passesLastAdmission(spot: SpotRecord, arrival: number): boolean {
  const rule = spot.business.operationalJudgement?.lastAdmission;
  if (!rule) return true;
  if (rule.type === "none") return true;
  if (rule.type === "fixed_time") {
    if (!rule.time) return true;
    return arrival <= toMinutes(rule.time);
  }
  if (rule.type === "before_close") {
    const minutes = rule.minutesBeforeClose ?? 0;
    const weeklyHours = spot.business.weeklyHours;
    if (!weeklyHours) return true;
    const dayKey = getCurrentDayType();
    const ranges = weeklyHours[toDayKey(dayKey)];
    if (!ranges || ranges.length === 0) return true;
    const latestClose = Math.max(...ranges.map((range) => toMinutes(range.close)));
    return arrival <= latestClose - minutes;
  }
  return true;
}

function isSpotAvailableAt(spot: SpotRecord, dayType: SpotBusinessDay, month: number, arrival: number, departure: number): boolean {
  const closedDays = spot.business.operationalJudgement?.regularClosedDays ?? [];
  if (closedDays.includes(dayType)) return false;
  if (isSeasonalClosed(spot, month)) return false;
  if (!isWithinWeeklyHours(spot, dayType, arrival, departure)) return false;
  if (!passesLastAdmission(spot, arrival)) return false;
  return true;
}

function resolveEstimatedStayMinutes(spot: SpotRecord): number {
  return Math.max(15, spot.business.estimatedStayMinutesMin);
}

function sanitizeSpotsForPlan(scores: ScoredSpot[]): ScoredSpot[] {
  const seen = new Set<string>();
  const filtered: ScoredSpot[] = [];
  for (const item of scores) {
    if (seen.has(item.spot.id)) continue;
    seen.add(item.spot.id);
    filtered.push(item);
  }
  return filtered;
}

function createConstraintChecks(params: {
  totalMinutes: number;
  allowedMinutes: number;
  returnConstraintPassed: boolean;
  hasTimeline: boolean;
}): PlanConstraintCheck[] {
  return [
    {
      code: "TIME_WITHIN_LIMIT",
      passed: params.totalMinutes <= params.allowedMinutes,
      message:
        params.totalMinutes <= params.allowedMinutes
          ? "滞在時間内で成立しています。"
          : "滞在時間を超過しています。",
    },
    {
      code: "RETURN_CONSTRAINT",
      passed: params.returnConstraintPassed,
      message: params.returnConstraintPassed ? "帰着条件を満たしています。" : "帰着条件を満たせません。",
    },
    {
      code: "HAS_TIMELINE",
      passed: params.hasTimeline,
      message: params.hasTimeline ? "時系列行程を生成しました。" : "行程の生成に失敗しました。",
    },
  ];
}

async function buildSinglePlan(params: {
  db: Firestore;
  style: PlanStyle;
  scores: ScoredSpot[];
  request: NormalizedPlanRequest;
  origin: LatLng;
  returnLocation: LatLng | null;
  transitReturnStationName: string | null;
}): Promise<BuildPlanResult> {
  let chosen = sanitizeSpotsForPlan(params.scores);
  if (chosen.length === 0) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE, "No scored spots for this plan style", {
      style: params.style,
    });
  }

  const cyclePickupSpotId = params.request.requiresCyclePickup ? params.request.cyclePickupLocationId : null;
  if (cyclePickupSpotId) {
    const pickupEntry = chosen.find((entry) => entry.spot.id === cyclePickupSpotId);
    if (!pickupEntry) {
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE, "Cycle pickup spot is not available", {
        style: params.style,
        cyclePickupSpotId,
      });
    }
    chosen = [pickupEntry, ...chosen.filter((entry) => entry.spot.id !== cyclePickupSpotId)];
  }

  const primaryTransport = resolvePrimaryTransport(params.request.localTransports);
  const matrixMode = toRouteMatrixMode(primaryTransport);
  const dayType = getCurrentDayType();
  const month = getCurrentMonth();

  const departureMinutes = params.request.departureAt ? toMinutes(params.request.departureAt) : 9 * 60;
  const endLimit = departureMinutes + params.request.durationMinutes;

  const locationMap = new Map<string, LatLng>();
  locationMap.set("__origin__", params.origin);
  if (params.returnLocation) {
    locationMap.set("__return__", params.returnLocation);
  }
  for (const item of chosen) {
    locationMap.set(item.spot.id, { lat: item.spot.location.lat, lng: item.spot.location.lng });
  }
  const matrixLocations: RouteMatrixLocation[] = Array.from(locationMap.entries()).map(([id, coords]) => ({
    id,
    lat: coords.lat,
    lng: coords.lng,
  }));

  const timeline: PlanTimelineItem[] = [];
  const waypoints: PlanWaypoint[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const originSpotId = params.request.origin.type === "station" ? params.request.origin.id : "current_location";
  const originSpotName = params.request.origin.type === "station" ? params.request.origin.name : "現在地";
  timeline.push({
    spotId: originSpotId,
    spotName: originSpotName,
    arrivalAt: toHhmm(departureMinutes),
    departureAt: toHhmm(departureMinutes),
    stayMinutes: 0,
    transportFromPrev: "none",
    travelMinutesFromPrev: 0,
    note: "出発地点",
  });
  waypoints.push({ id: originSpotId, name: originSpotName });

  let matrixDurations: Record<string, Record<string, number | null>> = {};
  try {
    const matrix = await computeApproximateRouteMatrix({
      locations: matrixLocations,
      mode: matrixMode,
    });
    matrixDurations = matrix.durationsMinutes;
    notes.push(`travel_time_source=${matrix.source}`);
    warnings.push("移動時間は座標ベースの近似計算です。道路状況により実際と差が出る場合があります。");
  } catch (error) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.ROUTE_UNAVAILABLE, "Failed to compute route matrix", {
      mode: matrixMode,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  const getTravelMinutes = (fromId: string, toId: string): number => {
    const matrixValue = matrixDurations[fromId]?.[toId];
    if (typeof matrixValue === "number" && Number.isFinite(matrixValue) && matrixValue >= 0) {
      return Math.max(0, Math.round(matrixValue));
    }
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.ROUTE_UNAVAILABLE, "Missing route matrix pair", {
      fromId,
      toId,
      mode: matrixMode,
    });
  };

  let currentId = "__origin__";
  let currentMinutes = departureMinutes;
  let visitedSpotCount = 0;

  const maxStops = params.request.tripStyle === "overnight" ? 5 : 4;

  for (const entry of chosen) {
    if (visitedSpotCount >= maxStops) break;
    const spot = entry.spot;
    const mustPickupHere = Boolean(cyclePickupSpotId) && visitedSpotCount === 0 && spot.id === cyclePickupSpotId;

    const travelMinutes = getTravelMinutes(currentId, spot.id);
    const arrival = currentMinutes + travelMinutes;
    const stayMinutes = resolveEstimatedStayMinutes(spot);
    const departure = arrival + stayMinutes;

    if (!isSpotAvailableAt(spot, dayType, month, arrival, departure)) {
      if (mustPickupHere) {
        throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.SPOT_CLOSED, "Cycle pickup spot is closed at departure time", {
          spotId: spot.id,
          arrivalAt: toHhmm(arrival),
          departureAt: toHhmm(departure),
        });
      }
      continue;
    }

    const returnMinutes =
      params.request.returnConstraint.type === "train_station" && params.returnLocation
        ? getTravelMinutes(spot.id, "__return__")
        : 0;
    if (departure + returnMinutes > endLimit) {
      if (mustPickupHere) {
        throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.TIME_OVER, "Cycle pickup spot cannot be visited within time limit", {
          spotId: spot.id,
          departureAt: toHhmm(departure),
          endLimit: toHhmm(endLimit),
        });
      }
      continue;
    }

    timeline.push({
      spotId: spot.id,
      spotName: spot.shortName,
      arrivalAt: toHhmm(arrival),
      departureAt: toHhmm(departure),
      stayMinutes,
      transportFromPrev: primaryTransport,
      travelMinutesFromPrev: travelMinutes,
      note: spot.descriptionShort,
    });
    waypoints.push({ id: spot.id, name: spot.shortName });
    currentId = spot.id;
    currentMinutes = departure;
    visitedSpotCount += 1;
  }

  if (visitedSpotCount === 0) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE, "No feasible spots found");
  }

  let returnConstraintPassed = true;
  if (params.request.returnConstraint.type === "train_station" && params.returnLocation) {
    const travelBack = getTravelMinutes(currentId, "__return__");
    const arrivalAtReturn = currentMinutes + travelBack;
    if (arrivalAtReturn > endLimit) {
      returnConstraintPassed = false;
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.RETURN_CONSTRAINT, "Cannot satisfy train return constraint");
    }
    currentMinutes = arrivalAtReturn;
    timeline.push({
      spotId: params.request.returnConstraint.stationId,
      spotName: params.transitReturnStationName ?? params.request.returnConstraint.stationId,
      arrivalAt: toHhmm(arrivalAtReturn),
      departureAt: toHhmm(arrivalAtReturn),
      stayMinutes: 0,
      transportFromPrev: primaryTransport,
      travelMinutesFromPrev: travelBack,
      note: "帰着地点",
    });
    waypoints.push({
      id: params.request.returnConstraint.stationId,
      name: params.transitReturnStationName ?? params.request.returnConstraint.stationId,
    });
  }

  const estimatedDurationMinutes = Math.max(1, currentMinutes - departureMinutes);

  const checks = createConstraintChecks({
    totalMinutes: estimatedDurationMinutes,
    allowedMinutes: params.request.durationMinutes,
    returnConstraintPassed,
    hasTimeline: visitedSpotCount > 0,
  });

  if (checks.some((check) => !check.passed)) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.TIME_OVER, "Constraint check failed", {
      checks,
    });
  }

  const baseTitle = params.style === "scenic" ? "景観を楽しむルート" : params.style === "food" ? "海鮮と食を楽しむルート" : "バランスよく巡るルート";

  const plan: PlanCandidate = {
    id: `${params.style}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: baseTitle,
    description:
      params.style === "scenic"
        ? "岩美町の海景観を中心に、写真映えと移動負荷のバランスを取ったルートです。"
        : params.style === "food"
          ? "海鮮や地域の食体験を重視しつつ、移動の負担を抑えたルートです。"
          : "景色・食・体験のバランスを取り、初めてでも回りやすいルートです。",
    planStyle: params.style,
    matchSummary: "",
    reasonWhyRecommended: "",
    estimatedDurationMinutes,
    transportModes: params.request.localTransports,
    waypoints,
    timeline,
    constraintChecks: checks,
    tags:
      params.style === "scenic"
        ? ["景観重視", "写真スポット"]
        : params.style === "food"
          ? ["食重視", "海鮮"]
          : ["バランス", "初回向け"],
    couponCompatible: timeline.some((item) => item.spotName.includes("道の駅")),
    storyCompatible: params.request.tripPrompt.includes("物語") || timeline.some((item) => item.spotName.includes("駅")),
  };

  if (params.request.returnConstraint.type === "train_station" && params.request.origin.type === "station") {
    try {
      const trips = await getNextTrips({
        db: params.db,
        fromNodeId: params.request.origin.id,
        toNodeId: params.request.returnConstraint.stationId,
        mode: "train",
        calendarId: "weekday",
        afterMinutes: Math.max(currentMinutes - 120, 0),
        limit: 1,
      });
      const next = trips[0];
      if (next) {
        warnings.push(`参考列車: ${next.departAt} 発 -> ${next.arriveAt} 着`);
      }
    } catch (error) {
      logger.warn("failed to fetch reference train", { error });
    }
  }

  notes.push(`style=${params.style}`);
  return { plan, warnings, notes };
}

async function refinePlansWithAI(plans: PlanCandidate[], request: NormalizedPlanRequest): Promise<PlanCandidate[]> {
  const refined = await callGeminiJson({
    systemInstruction:
      "あなたは旅行プランの編集者です。時系列や制約は変更せず、各案のタイトルと推薦理由のみを改善してください。JSONのみ返してください。",
    userPrompt: JSON.stringify(
      {
        tripPrompt: request.tripPrompt,
        desiredSpots: request.desiredSpots,
        plans: plans.map((plan) => ({
          id: plan.id,
          style: plan.planStyle,
          timeline: plan.timeline.map((item) => ({
            spotName: item.spotName,
            arrivalAt: item.arrivalAt,
            departureAt: item.departureAt,
          })),
        })),
      },
      null,
      2,
    ),
    schema: refinementBatchSchema,
    context: "ai_refinement_batch",
    responseSchema: {
      type: "OBJECT",
      properties: {
        plans: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              title: { type: "STRING" },
              reasonWhyRecommended: { type: "STRING" },
              matchSummary: { type: "STRING" },
            },
            required: ["id", "title", "reasonWhyRecommended", "matchSummary"],
          },
        },
      },
      required: ["plans"],
    },
  });

  const refinedById = new Map(refined.plans.map((item) => [item.id, item]));
  return plans.map((plan) => {
    const item = refinedById.get(plan.id);
    if (!item) {
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED, "AI refinement result missing plan id", {
        planId: plan.id,
      });
    }
    return {
      ...plan,
      title: item.title,
      reasonWhyRecommended: item.reasonWhyRecommended,
      matchSummary: item.matchSummary,
    };
  });
}

async function resolveReturnLocation(request: NormalizedPlanRequest, origin: LatLng, db: Firestore): Promise<{ coords: LatLng; name: string } | null> {
  if (request.returnConstraint.type !== "train_station") return null;
  const node = await getNode({ db, nodeId: request.returnConstraint.stationId });
  if (!node) {
    throw new PlanGenerationFailure(
      PLAN_GENERATION_ERROR_CODE.RETURN_CONSTRAINT,
      "Return station node is missing",
      {
        stationId: request.returnConstraint.stationId,
        origin,
      },
    );
  }
  return {
    coords: { lat: node.location.lat, lng: node.location.lng },
    name: node.nameJa,
  };
}

async function resolveOriginLocation(request: NormalizedPlanRequest, db: Firestore): Promise<LatLng> {
  if (request.origin.type === "current_location") {
    return { lat: request.origin.lat, lng: request.origin.lng };
  }
  const stationNode = await getNode({ db, nodeId: request.origin.id });
  if (!stationNode) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.ROUTE_UNAVAILABLE, "Origin station node is missing", {
      originId: request.origin.id,
    });
  }
  return { lat: stationNode.location.lat, lng: stationNode.location.lng };
}

export async function generatePlans(params: GeneratePlansParams): Promise<void> {
  const db = params.db ?? getFirebaseAdminDb();
  const doc = await getPlanRequestById({ db, planRequestId: params.planRequestId });
  if (!doc) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.INTERNAL, "Plan request not found");
  }

  const request = doc.normalizedRequest;

  await updatePlanRequestStatus({
    db,
    planRequestId: params.planRequestId,
    status: PLAN_REQUEST_STATUS.GENERATING,
    generationStage: PLAN_GENERATION_STAGE.INTENT_PARSING,
    progressPercent: 12,
    traceMessage: "Extracting trip intent",
  });

  const intent = await extractIntent(request);
  await savePlanRequestIntent({ db, planRequestId: params.planRequestId, intent });

  await updatePlanRequestStatus({
    db,
    planRequestId: params.planRequestId,
    status: PLAN_REQUEST_STATUS.GENERATING,
    generationStage: PLAN_GENERATION_STAGE.CANDIDATE_SELECTION,
    progressPercent: 28,
    traceMessage: "Selecting candidate spots",
  });

  const publishedSpots = await listSpots({ db, filters: { status: "published" } });
  if (publishedSpots.length === 0) {
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE, "No published spots available");
  }

  const metas = selectCandidates(publishedSpots, intent, request);

  await updatePlanRequestStatus({
    db,
    planRequestId: params.planRequestId,
    status: PLAN_REQUEST_STATUS.GENERATING,
    generationStage: PLAN_GENERATION_STAGE.ROUTE_PLANNING,
    progressPercent: 56,
    traceMessage: "Building deterministic route timeline",
  });

  const origin = await resolveOriginLocation(request, db);
  const returnInfo = await resolveReturnLocation(request, origin, db);

  const plans: PlanCandidate[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];
  const terminalFailures: Array<{ style: PlanStyle; error: PlanGenerationFailure }> = [];

  for (const meta of metas) {
    let built: BuildPlanResult | null = null;
    let attempts = 0;
    while (!built && attempts < PLAN_GENERATION_MAX_ATTEMPTS) {
      attempts += 1;
      try {
        built = await buildSinglePlan({
          db,
          style: meta.style,
          scores: meta.scores,
          request,
          origin,
          returnLocation: returnInfo?.coords ?? null,
          transitReturnStationName: returnInfo?.name ?? null,
        });
      } catch (error) {
        if (error instanceof PlanGenerationFailure) {
          notes.push(`${meta.style}: ${error.code}`);
          if (attempts >= PLAN_GENERATION_MAX_ATTEMPTS) {
            warnings.push(`${meta.style}案は制約上、再構成が必要でした。`);
            terminalFailures.push({ style: meta.style, error });
          }
          continue;
        }
        throw error;
      }
    }
    if (built) {
      plans.push(built.plan);
      warnings.push(...built.warnings);
      notes.push(...built.notes);
    }
  }

  if (plans.length < 3) {
    if (terminalFailures.length > 0) {
      const byPriority = [
        PLAN_GENERATION_ERROR_CODE.ROUTE_UNAVAILABLE,
        PLAN_GENERATION_ERROR_CODE.AI_PARSE_FAILED,
        PLAN_GENERATION_ERROR_CODE.RETURN_CONSTRAINT,
        PLAN_GENERATION_ERROR_CODE.TIME_OVER,
        PLAN_GENERATION_ERROR_CODE.SPOT_CLOSED,
        PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE,
      ] as const;
      for (const code of byPriority) {
        const matched = terminalFailures.find((item) => item.error.code === code);
        if (matched) {
          throw new PlanGenerationFailure(matched.error.code, matched.error.message, {
            style: matched.style,
            originalDetails: matched.error.details,
            terminalFailureCount: terminalFailures.length,
          });
        }
      }
    }
    throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.NO_CANDIDATE, "Unable to produce three valid plans", {
      builtPlans: plans.length,
    });
  }
  const finalizedPlans = plans.slice(0, 3);

  await updatePlanRequestStatus({
    db,
    planRequestId: params.planRequestId,
    status: PLAN_REQUEST_STATUS.GENERATING,
    generationStage: PLAN_GENERATION_STAGE.AI_REFINEMENT,
    progressPercent: 76,
    traceMessage: "Refining recommendation text with AI",
  });

  const refinedPlans = await refinePlansWithAI(finalizedPlans, request);

  await updatePlanRequestStatus({
    db,
    planRequestId: params.planRequestId,
    status: PLAN_REQUEST_STATUS.GENERATING,
    generationStage: PLAN_GENERATION_STAGE.VALIDATING,
    progressPercent: 92,
    traceMessage: "Final validation",
  });

  for (const plan of refinedPlans) {
    const hasViolation = plan.constraintChecks.some((check) => !check.passed);
    if (hasViolation) {
      throw new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.TIME_OVER, "Constraint violation detected in final plans");
    }
  }

  const result: PlanGenerationResult = {
    plans: refinedPlans,
    summary: "条件に合う3つの旅程候補を作成しました。",
    generationNotes: Array.from(new Set(notes)).slice(0, 8),
    warnings: Array.from(new Set(warnings)).slice(0, 8),
  };

  await savePlanRequestResult({
    db,
    planRequestId: params.planRequestId,
    result,
  });
}

export async function runPlanGenerationWithFailureHandling(params: GeneratePlansParams): Promise<void> {
  const db = params.db ?? getFirebaseAdminDb();
  try {
    await generatePlans(params);
  } catch (error) {
    const normalizedError =
      error instanceof PlanGenerationFailure
        ? error
        : new PlanGenerationFailure(PLAN_GENERATION_ERROR_CODE.INTERNAL, "Unexpected generation failure", {
            raw: error instanceof Error ? error.message : String(error),
          });

    logger.error("plan generation failed", {
      planRequestId: params.planRequestId,
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
    });

    await savePlanRequestError({
      db,
      planRequestId: params.planRequestId,
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        details: normalizedError.details,
      },
    });
  }
}
