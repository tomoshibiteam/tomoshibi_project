import type { NormalizedPlanRequest, PlanGenerationIntent, PlanGenerationResult, PlanGenerationStage, PlanRequestDocument, PlanRequestStatus } from "./types";
type TimestampFactory = () => unknown;
type ArrayUnionFactory = (...values: unknown[]) => unknown;
type DocSnapshotLike = {
    exists: boolean;
    data(): unknown;
};
type DocRefLike = {
    update(data: Record<string, unknown>): Promise<unknown>;
    get(): Promise<DocSnapshotLike>;
};
type SaveFirestoreLike = {
    collection(path: string): {
        add(data: PlanRequestDocument): Promise<{
            id: string;
        }>;
        doc(id: string): DocRefLike;
    };
};
type UpdateFirestoreLike = {
    collection(path: string): {
        doc(id: string): DocRefLike;
    };
};
type SavePlanRequestParams = {
    db: SaveFirestoreLike;
    rawInput: unknown;
    normalizedRequest: NormalizedPlanRequest;
    prompt: string;
    pollToken?: string;
    timestampFactory?: TimestampFactory;
};
export declare function generatePlanPollToken(byteLength?: number): string;
export declare function buildPlanRequestDocument(params: {
    rawInput: unknown;
    normalizedRequest: NormalizedPlanRequest;
    prompt: string;
    pollToken: string;
    timestampFactory: TimestampFactory;
}): PlanRequestDocument;
export declare function savePlanRequest(params: SavePlanRequestParams): Promise<{
    planRequestId: string;
    pollToken: string;
}>;
export declare function getPlanRequestById(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
}): Promise<PlanRequestDocument | null>;
export declare function getPlanRequestByIdAndPollToken(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    pollToken: string;
}): Promise<PlanRequestDocument | null>;
export declare function updatePlanRequestStatus(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    status: PlanRequestStatus;
    generationStage?: PlanGenerationStage;
    progressPercent?: number;
    traceMessage?: string;
    traceMetadata?: Record<string, unknown>;
    timestampFactory?: TimestampFactory;
    arrayUnionFactory?: ArrayUnionFactory;
}): Promise<void>;
export declare function incrementPlanRequestAttemptCount(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    timestampFactory?: TimestampFactory;
}): Promise<void>;
export declare function savePlanRequestIntent(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    intent: PlanGenerationIntent;
    timestampFactory?: TimestampFactory;
}): Promise<void>;
export declare function savePlanRequestResult(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    result: PlanGenerationResult;
    timestampFactory?: TimestampFactory;
}): Promise<void>;
export declare function savePlanRequestError(params: {
    db: UpdateFirestoreLike;
    planRequestId: string;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestampFactory?: TimestampFactory;
}): Promise<void>;
export {};
