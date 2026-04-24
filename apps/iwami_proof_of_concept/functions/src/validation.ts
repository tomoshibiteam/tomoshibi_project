import { z } from "zod";
import {
  DEPARTURE_TYPE,
  DURATION_TYPE,
  HH_MM_PATTERN,
  ISO_TIME_CAPTURE_PATTERN,
  LOCAL_TRANSPORT,
  RETURN_STATION,
  RETURN_TRANSPORT,
  TRIP_STYLE,
} from "./constants";
import { PlanRequestValidationError } from "./errors";
import type { DepartureLocation, PlanRequestInput, ValidationIssueDetail } from "./types";

const tripStyleSchema = z.enum([TRIP_STYLE.DAY_TRIP, TRIP_STYLE.OVERNIGHT]);
const departureTypeSchema = z.enum([DEPARTURE_TYPE.IWAMI_STATION, DEPARTURE_TYPE.CURRENT_LOCATION]);
const durationTypeSchema = z.enum([DURATION_TYPE.TWO_HOURS, DURATION_TYPE.FOUR_HOURS, DURATION_TYPE.CUSTOM]);
const returnTransportSchema = z.enum([RETURN_TRANSPORT.TRAIN, RETURN_TRANSPORT.CAR]);
const returnStationIdSchema = z.enum([RETURN_STATION.IWAMI, RETURN_STATION.HIGASHIHAMA, RETURN_STATION.OIWA]);
const localTransportSchema = z.enum([
  LOCAL_TRANSPORT.WALK,
  LOCAL_TRANSPORT.RENTAL_CYCLE,
  LOCAL_TRANSPORT.CAR,
  LOCAL_TRANSPORT.BUS,
]);

const departureLocationSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

const rawPlanRequestInputSchema = z.object({
  tripStyle: tripStyleSchema,
  departureType: departureTypeSchema,
  departureAt: z.union([z.string(), z.null()]).optional(),
  departureLocation: departureLocationSchema.optional(),
  durationType: durationTypeSchema,
  customDurationMinutes: z.number().int().min(1).optional(),
  returnTransport: returnTransportSchema,
  returnStationId: z.union([returnStationIdSchema, z.null()]).optional(),
  lodgingName: z.union([z.string(), z.null()]).optional(),
  localTransports: z.array(localTransportSchema).min(1, "localTransports must include at least one item"),
  desiredSpots: z.array(z.string()).optional(),
  tripPrompt: z.union([z.string(), z.null()]).optional(),
});

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSupportedDepartureAt(value: string): boolean {
  if (HH_MM_PATTERN.test(value)) return true;
  return ISO_TIME_CAPTURE_PATTERN.test(value);
}

function toValidationIssueDetails(issues: ValidationIssueDetail[]): ValidationIssueDetail[] {
  return issues.map((issue) => ({ path: issue.path, message: issue.message }));
}

function zodIssuesToValidationDetails(issues: z.ZodIssue[]): ValidationIssueDetail[] {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}

function ensureConditionalRules(input: PlanRequestInput): ValidationIssueDetail[] {
  const issues: ValidationIssueDetail[] = [];

  if (input.departureType === DEPARTURE_TYPE.CURRENT_LOCATION && !input.departureLocation) {
    issues.push({
      path: "departureLocation",
      message: "departureLocation.lat and departureLocation.lng are required when departureType is current_location",
    });
  }

  if (input.tripStyle === TRIP_STYLE.OVERNIGHT && !input.lodgingName) {
    issues.push({
      path: "lodgingName",
      message: "lodgingName is required when tripStyle is overnight",
    });
  }

  if (input.durationType === DURATION_TYPE.CUSTOM && input.customDurationMinutes == null) {
    issues.push({
      path: "customDurationMinutes",
      message: "customDurationMinutes is required when durationType is custom",
    });
  }

  if (input.returnTransport === RETURN_TRANSPORT.TRAIN && !input.returnStationId) {
    issues.push({
      path: "returnStationId",
      message: "returnStationId is required when returnTransport is train",
    });
  }

  if (input.departureAt && !isSupportedDepartureAt(input.departureAt)) {
    issues.push({
      path: "departureAt",
      message: "departureAt must be HH:mm or ISO format",
    });
  }

  return issues;
}

export function validatePlanRequestInput(rawInput: unknown): PlanRequestInput {
  const parseResult = rawPlanRequestInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const details = zodIssuesToValidationDetails(parseResult.error.issues);
    throw new PlanRequestValidationError("Invalid request payload", details);
  }

  const data = parseResult.data;
  const normalizedInput: PlanRequestInput = {
    tripStyle: data.tripStyle,
    departureType: data.departureType,
    departureAt: trimOrNull(data.departureAt),
    departureLocation: data.departureLocation as DepartureLocation | undefined,
    durationType: data.durationType,
    customDurationMinutes: data.customDurationMinutes,
    returnTransport: data.returnTransport,
    returnStationId: data.returnStationId ?? null,
    lodgingName: trimOrNull(data.lodgingName),
    localTransports: data.localTransports,
    desiredSpots: data.desiredSpots ?? [],
    tripPrompt: trimOrNull(data.tripPrompt),
  };

  const conditionalIssues = ensureConditionalRules(normalizedInput);
  if (conditionalIssues.length > 0) {
    throw new PlanRequestValidationError(
      conditionalIssues[0]?.message ?? "Invalid request payload",
      toValidationIssueDetails(conditionalIssues),
    );
  }

  return normalizedInput;
}
