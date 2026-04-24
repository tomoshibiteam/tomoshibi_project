import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import {
  GENERATION_META,
  PLAN_GENERATION_STAGE,
  PLAN_POLL_TOKEN_BYTES,
  PLAN_REQUEST_STATUS,
  PLAN_REQUESTS_COLLECTION,
} from "./constants";
import type {
  NormalizedPlanRequest,
  PlanGenerationIntent,
  PlanGenerationMeta,
  PlanGenerationResult,
  PlanGenerationStage,
  PlanRequestDocument,
  PlanRequestStatus,
  PlanTraceItem,
} from "./types";

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
    add(data: PlanRequestDocument): Promise<{ id: string }>;
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

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeProgressPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function generatePlanPollToken(byteLength = PLAN_POLL_TOKEN_BYTES): string {
  return randomBytes(byteLength).toString("base64url");
}

export function buildPlanRequestDocument(params: {
  rawInput: unknown;
  normalizedRequest: NormalizedPlanRequest;
  prompt: string;
  pollToken: string;
  timestampFactory: TimestampFactory;
}): PlanRequestDocument {
  const generationMeta: PlanGenerationMeta = {
    source: GENERATION_META.SOURCE,
    version: GENERATION_META.VERSION,
    prompt: params.prompt,
  };

  return {
    createdAt: params.timestampFactory(),
    updatedAt: params.timestampFactory(),
    status: PLAN_REQUEST_STATUS.QUEUED,
    generationStage: PLAN_GENERATION_STAGE.QUEUED,
    progressPercent: 0,
    attemptCount: 0,
    pollToken: params.pollToken,
    trace: [
      {
        at: nowIso(),
        stage: PLAN_GENERATION_STAGE.QUEUED,
        message: "Plan request queued",
      },
    ],
    intent: null,
    rawInput: params.rawInput,
    normalizedRequest: params.normalizedRequest,
    generationMeta,
    result: null,
    error: null,
  };
}

export async function savePlanRequest(params: SavePlanRequestParams): Promise<{ planRequestId: string; pollToken: string }> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const pollToken = params.pollToken ?? generatePlanPollToken();
  const doc = buildPlanRequestDocument({
    rawInput: params.rawInput,
    normalizedRequest: params.normalizedRequest,
    prompt: params.prompt,
    pollToken,
    timestampFactory,
  });

  const docRef = await params.db.collection(PLAN_REQUESTS_COLLECTION).add(doc);
  return { planRequestId: docRef.id, pollToken };
}

export async function getPlanRequestById(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
}): Promise<PlanRequestDocument | null> {
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;
  return snapshot.data() as PlanRequestDocument;
}

export async function getPlanRequestByIdAndPollToken(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  pollToken: string;
}): Promise<PlanRequestDocument | null> {
  const doc = await getPlanRequestById(params);
  if (!doc) return null;
  if (doc.pollToken !== params.pollToken) return null;
  return doc;
}

export async function updatePlanRequestStatus(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  status: PlanRequestStatus;
  generationStage?: PlanGenerationStage;
  progressPercent?: number;
  traceMessage?: string;
  traceMetadata?: Record<string, unknown>;
  timestampFactory?: TimestampFactory;
  arrayUnionFactory?: ArrayUnionFactory;
}): Promise<void> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const arrayUnionFactory = params.arrayUnionFactory ?? ((...values: unknown[]) => FieldValue.arrayUnion(...values));
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);

  const update: Record<string, unknown> = {
    status: params.status,
    updatedAt: timestampFactory(),
  };

  if (params.generationStage) {
    update.generationStage = params.generationStage;
  }
  if (typeof params.progressPercent === "number") {
    update.progressPercent = normalizeProgressPercent(params.progressPercent);
  }
  if (params.traceMessage) {
    const traceItem: PlanTraceItem = {
      at: nowIso(),
      stage: params.generationStage ?? PLAN_GENERATION_STAGE.QUEUED,
      message: params.traceMessage,
    };
    if (params.traceMetadata) {
      traceItem.metadata = params.traceMetadata;
    }
    update.trace = arrayUnionFactory(traceItem);
  }

  await docRef.update(update);
}

export async function incrementPlanRequestAttemptCount(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  timestampFactory?: TimestampFactory;
}): Promise<void> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
  await docRef.update({
    attemptCount: FieldValue.increment(1),
    updatedAt: timestampFactory(),
  });
}

export async function savePlanRequestIntent(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  intent: PlanGenerationIntent;
  timestampFactory?: TimestampFactory;
}): Promise<void> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
  await docRef.update({
    intent: params.intent,
    updatedAt: timestampFactory(),
  });
}

export async function savePlanRequestResult(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  result: PlanGenerationResult;
  timestampFactory?: TimestampFactory;
}): Promise<void> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
  await docRef.update({
    status: PLAN_REQUEST_STATUS.COMPLETED,
    generationStage: PLAN_GENERATION_STAGE.COMPLETED,
    progressPercent: 100,
    result: params.result,
    error: null,
    updatedAt: timestampFactory(),
    trace: FieldValue.arrayUnion({
      at: nowIso(),
      stage: PLAN_GENERATION_STAGE.COMPLETED,
      message: "Plan generation completed",
    }),
  });
}

export async function savePlanRequestError(params: {
  db: UpdateFirestoreLike;
  planRequestId: string;
  error: { code: string; message: string; details?: unknown };
  timestampFactory?: TimestampFactory;
}): Promise<void> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const docRef = params.db.collection(PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
  await docRef.update({
    status: PLAN_REQUEST_STATUS.FAILED,
    generationStage: PLAN_GENERATION_STAGE.FAILED,
    error: params.error,
    updatedAt: timestampFactory(),
    trace: FieldValue.arrayUnion({
      at: nowIso(),
      stage: PLAN_GENERATION_STAGE.FAILED,
      message: "Plan generation failed",
      metadata: { code: params.error.code },
    }),
  });
}
