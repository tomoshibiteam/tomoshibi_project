const FUNCTION_REGION = "asia-northeast1";
const CREATE_PLAN_REQUEST_FUNCTION_NAME = "createPlanRequest";
const GET_PLAN_REQUEST_STATUS_FUNCTION_NAME = "getPlanRequestStatus";

export type TripStyle = "day_trip" | "overnight";
export type DepartureType = "iwami_station" | "current_location";
export type DurationType = "2h" | "4h" | "custom";
export type ReturnTransport = "train" | "car";
export type ReturnStationId = "iwami_station" | "higashihama_station" | "oiwa_station";
export type LocalTransport = "walk" | "rental_cycle" | "car" | "bus";

export type CreatePlanRequestPayload = {
  tripStyle: TripStyle;
  departureType: DepartureType;
  departureAt: string | null;
  departureLocation?: {
    lat: number;
    lng: number;
  };
  durationType: DurationType;
  customDurationMinutes?: number;
  returnTransport: ReturnTransport;
  returnStationId: ReturnStationId | null;
  lodgingName: string | null;
  localTransports: LocalTransport[];
  desiredSpots: string[];
  tripPrompt: string | null;
};

export type PlanTimelineItem = {
  spotId: string;
  spotName: string;
  arrivalAt: string;
  departureAt: string;
  stayMinutes: number;
  transportFromPrev: LocalTransport | "train" | "none";
  travelMinutesFromPrev: number;
  note: string;
};

export type PlanConstraintCheck = {
  code: string;
  passed: boolean;
  message: string;
};

export type PlanCandidate = {
  id: string;
  title: string;
  description: string;
  planStyle: "scenic" | "food" | "balanced";
  matchSummary: string;
  reasonWhyRecommended: string;
  estimatedDurationMinutes: number;
  transportModes: LocalTransport[];
  waypoints: Array<{ id: string; name: string }>;
  timeline: PlanTimelineItem[];
  constraintChecks: PlanConstraintCheck[];
  tags: string[];
  couponCompatible: boolean;
  storyCompatible: boolean;
};

export type PlanGenerationResult = {
  plans: PlanCandidate[];
  summary: string;
  generationNotes: string[];
  warnings: string[];
};

export type PlanTraceItem = {
  at: string;
  stage:
    | "queued"
    | "intent_parsing"
    | "candidate_selection"
    | "route_planning"
    | "ai_refinement"
    | "validating"
    | "completed"
    | "failed";
  message: string;
  metadata?: Record<string, unknown>;
};

export type CreatePlanRequestSuccessResponse = {
  ok: true;
  planRequestId: string;
  pollToken: string;
  status: "queued" | "generating" | "completed" | "failed";
};

export type CreatePlanRequestErrorResponse = {
  ok: false;
  code: "VALIDATION_ERROR" | "METHOD_NOT_ALLOWED" | "INTERNAL_ERROR" | "NOT_FOUND" | "UNAUTHORIZED";
  message: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
};

export type CreatePlanRequestResponse = CreatePlanRequestSuccessResponse | CreatePlanRequestErrorResponse;

export type GetPlanRequestStatusPayload = {
  planRequestId: string;
  pollToken: string;
};

export type GetPlanRequestStatusSuccessResponse = {
  ok: true;
  status: "queued" | "generating" | "completed" | "failed";
  generationStage:
    | "queued"
    | "intent_parsing"
    | "candidate_selection"
    | "route_planning"
    | "ai_refinement"
    | "validating"
    | "completed"
    | "failed";
  progressPercent: number;
  trace: PlanTraceItem[];
  result: PlanGenerationResult | null;
  error: { code: string; message: string; details?: unknown } | null;
};

export type GetPlanRequestStatusErrorResponse = {
  ok: false;
  code: "VALIDATION_ERROR" | "METHOD_NOT_ALLOWED" | "INTERNAL_ERROR" | "NOT_FOUND" | "UNAUTHORIZED";
  message: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
};

export type GetPlanRequestStatusResponse = GetPlanRequestStatusSuccessResponse | GetPlanRequestStatusErrorResponse;

function readTrimmedEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function shouldUseFirebaseEmulators(): boolean {
  const raw = readTrimmedEnv(process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS);
  if (!raw) return false;
  const normalized = raw.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function resolveFunctionUrl(functionName: string): string | null {
  if (shouldUseFirebaseEmulators()) {
    const host = readTrimmedEnv(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST);
    const port = readTrimmedEnv(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);
    const projectId = readTrimmedEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    if (host && port && projectId) {
      return `http://${host}:${port}/${projectId}/${FUNCTION_REGION}/${functionName}`;
    }
  }

  const projectId = readTrimmedEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  if (!projectId) return null;
  return `https://${FUNCTION_REGION}-${projectId}.cloudfunctions.net/${functionName}`;
}

export function resolveCreatePlanRequestUrl(): string | null {
  const explicitUrl = readTrimmedEnv(process.env.NEXT_PUBLIC_CREATE_PLAN_REQUEST_URL);
  if (explicitUrl) return explicitUrl;
  return resolveFunctionUrl(CREATE_PLAN_REQUEST_FUNCTION_NAME);
}

export function resolveGetPlanRequestStatusUrl(): string | null {
  const explicitUrl = readTrimmedEnv(process.env.NEXT_PUBLIC_GET_PLAN_REQUEST_STATUS_URL);
  if (explicitUrl) return explicitUrl;
  return resolveFunctionUrl(GET_PLAN_REQUEST_STATUS_FUNCTION_NAME);
}

async function postJson<TResponse>(endpoint: string, payload: unknown): Promise<TResponse | null> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);
  if (data && typeof data === "object" && "ok" in data) {
    return data as TResponse;
  }
  return null;
}

export async function createPlanRequest(payload: CreatePlanRequestPayload): Promise<CreatePlanRequestResponse> {
  const endpoint = resolveCreatePlanRequestUrl();
  if (!endpoint) {
    throw new Error("createPlanRequest endpoint is not configured");
  }

  const parsed = await postJson<CreatePlanRequestResponse>(endpoint, payload);
  if (parsed) return parsed;

  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "createPlanRequest の呼び出しに失敗しました。",
  };
}

export async function getPlanRequestStatus(payload: GetPlanRequestStatusPayload): Promise<GetPlanRequestStatusResponse> {
  const endpoint = resolveGetPlanRequestStatusUrl();
  if (!endpoint) {
    throw new Error("getPlanRequestStatus endpoint is not configured");
  }

  const parsed = await postJson<GetPlanRequestStatusResponse>(endpoint, payload);
  if (parsed) return parsed;

  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "getPlanRequestStatus の呼び出しに失敗しました。",
  };
}
