import type { GENERATION_META, PLAN_GENERATION_ERROR_CODE, PLAN_GENERATION_STAGE, PLAN_REQUEST_STATUS } from "./constants";
export type TripStyle = "day_trip" | "overnight";
export type DepartureType = "iwami_station" | "current_location";
export type DurationType = "2h" | "4h" | "custom";
export type ReturnTransport = "train" | "car";
export type ReturnStationId = "iwami_station" | "higashihama_station" | "oiwa_station";
export type LocalTransport = "walk" | "rental_cycle" | "car" | "bus";
export type DepartureLocation = {
    lat: number;
    lng: number;
};
export type PlanRequestInput = {
    tripStyle: TripStyle;
    departureType: DepartureType;
    departureAt: string | null;
    departureLocation?: DepartureLocation;
    durationType: DurationType;
    customDurationMinutes?: number;
    returnTransport: ReturnTransport;
    returnStationId: ReturnStationId | null;
    lodgingName: string | null;
    localTransports: LocalTransport[];
    desiredSpots: string[];
    tripPrompt: string | null;
};
export type StationOrigin = {
    type: "station";
    id: "iwami_station";
    name: string;
};
export type CurrentLocationOrigin = {
    type: "current_location";
    lat: number;
    lng: number;
};
export type NormalizedOrigin = StationOrigin | CurrentLocationOrigin;
export type ReturnConstraintTrainStation = {
    type: "train_station";
    stationId: ReturnStationId;
};
export type ReturnConstraintFree = {
    type: "free";
};
export type ReturnConstraint = ReturnConstraintTrainStation | ReturnConstraintFree;
export type NormalizedPlanRequest = {
    tripStyle: TripStyle;
    origin: NormalizedOrigin;
    departureAt: string | null;
    durationMinutes: number;
    returnTransport: ReturnTransport;
    returnConstraint: ReturnConstraint;
    lodgingName: string | null;
    localTransports: LocalTransport[];
    desiredSpots: string[];
    tripPrompt: string;
    requiresCyclePickup: boolean;
    cyclePickupLocationId: string | null;
};
export type PlanGenerationIntent = {
    must: string[];
    prefer: string[];
    avoid: string[];
    pace: "relaxed" | "normal" | "active";
    mood: string[];
    themeWeights: {
        scenic: number;
        food: number;
        experience: number;
        shopping: number;
        stationArea: number;
    };
};
export type PlanTraceItem = {
    at: string;
    stage: PlanGenerationStage;
    message: string;
    metadata?: Record<string, unknown>;
};
export type PlanWaypoint = {
    id: string;
    name: string;
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
    waypoints: PlanWaypoint[];
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
export type PlanRequestStatus = (typeof PLAN_REQUEST_STATUS)[keyof typeof PLAN_REQUEST_STATUS];
export type PlanGenerationStage = (typeof PLAN_GENERATION_STAGE)[keyof typeof PLAN_GENERATION_STAGE];
export type PlanGenerationErrorCode = (typeof PLAN_GENERATION_ERROR_CODE)[keyof typeof PLAN_GENERATION_ERROR_CODE];
export type PlanGenerationMeta = {
    source: (typeof GENERATION_META)["SOURCE"];
    version: (typeof GENERATION_META)["VERSION"];
    prompt: string;
};
export type PlanRequestDocument = {
    createdAt: unknown;
    updatedAt: unknown;
    status: PlanRequestStatus;
    generationStage: PlanGenerationStage;
    progressPercent: number;
    attemptCount: number;
    pollToken: string;
    trace: PlanTraceItem[];
    intent: PlanGenerationIntent | null;
    rawInput: unknown;
    normalizedRequest: NormalizedPlanRequest;
    generationMeta: PlanGenerationMeta;
    result: PlanGenerationResult | null;
    error: {
        code: PlanGenerationErrorCode | string;
        message: string;
        details?: unknown;
    } | null;
};
export type ValidationIssueDetail = {
    path: string;
    message: string;
};
export type PlanRequestErrorCode = "VALIDATION_ERROR" | "METHOD_NOT_ALLOWED" | "INTERNAL_ERROR" | "NOT_FOUND" | "UNAUTHORIZED";
export type CreatePlanRequestSuccessResponse = {
    ok: true;
    planRequestId: string;
    status: PlanRequestStatus;
    pollToken: string;
};
export type CreatePlanRequestErrorResponse = {
    ok: false;
    code: PlanRequestErrorCode;
    message: string;
    details?: ValidationIssueDetail[];
};
export type CreatePlanRequestResponse = CreatePlanRequestSuccessResponse | CreatePlanRequestErrorResponse;
export type GetPlanRequestStatusSuccessResponse = {
    ok: true;
    status: PlanRequestStatus;
    generationStage: PlanGenerationStage;
    progressPercent: number;
    trace: PlanTraceItem[];
    result: PlanGenerationResult | null;
    error: PlanRequestDocument["error"] | null;
};
export type GetPlanRequestStatusErrorResponse = {
    ok: false;
    code: "METHOD_NOT_ALLOWED" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
    details?: ValidationIssueDetail[];
};
export type GetPlanRequestStatusResponse = GetPlanRequestStatusSuccessResponse | GetPlanRequestStatusErrorResponse;
