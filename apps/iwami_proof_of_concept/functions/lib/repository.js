"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlanPollToken = generatePlanPollToken;
exports.buildPlanRequestDocument = buildPlanRequestDocument;
exports.savePlanRequest = savePlanRequest;
exports.getPlanRequestById = getPlanRequestById;
exports.getPlanRequestByIdAndPollToken = getPlanRequestByIdAndPollToken;
exports.updatePlanRequestStatus = updatePlanRequestStatus;
exports.incrementPlanRequestAttemptCount = incrementPlanRequestAttemptCount;
exports.savePlanRequestIntent = savePlanRequestIntent;
exports.savePlanRequestResult = savePlanRequestResult;
exports.savePlanRequestError = savePlanRequestError;
const node_crypto_1 = require("node:crypto");
const firestore_1 = require("firebase-admin/firestore");
const constants_1 = require("./constants");
function nowIso() {
    return new Date().toISOString();
}
function normalizeProgressPercent(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
}
function generatePlanPollToken(byteLength = constants_1.PLAN_POLL_TOKEN_BYTES) {
    return (0, node_crypto_1.randomBytes)(byteLength).toString("base64url");
}
function buildPlanRequestDocument(params) {
    const generationMeta = {
        source: constants_1.GENERATION_META.SOURCE,
        version: constants_1.GENERATION_META.VERSION,
        prompt: params.prompt,
    };
    return {
        createdAt: params.timestampFactory(),
        updatedAt: params.timestampFactory(),
        status: constants_1.PLAN_REQUEST_STATUS.QUEUED,
        generationStage: constants_1.PLAN_GENERATION_STAGE.QUEUED,
        progressPercent: 0,
        attemptCount: 0,
        pollToken: params.pollToken,
        trace: [
            {
                at: nowIso(),
                stage: constants_1.PLAN_GENERATION_STAGE.QUEUED,
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
async function savePlanRequest(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const pollToken = params.pollToken ?? generatePlanPollToken();
    const doc = buildPlanRequestDocument({
        rawInput: params.rawInput,
        normalizedRequest: params.normalizedRequest,
        prompt: params.prompt,
        pollToken,
        timestampFactory,
    });
    const docRef = await params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).add(doc);
    return { planRequestId: docRef.id, pollToken };
}
async function getPlanRequestById(params) {
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    const snapshot = await docRef.get();
    if (!snapshot.exists)
        return null;
    return snapshot.data();
}
async function getPlanRequestByIdAndPollToken(params) {
    const doc = await getPlanRequestById(params);
    if (!doc)
        return null;
    if (doc.pollToken !== params.pollToken)
        return null;
    return doc;
}
async function updatePlanRequestStatus(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const arrayUnionFactory = params.arrayUnionFactory ?? ((...values) => firestore_1.FieldValue.arrayUnion(...values));
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    const update = {
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
        const traceItem = {
            at: nowIso(),
            stage: params.generationStage ?? constants_1.PLAN_GENERATION_STAGE.QUEUED,
            message: params.traceMessage,
        };
        if (params.traceMetadata) {
            traceItem.metadata = params.traceMetadata;
        }
        update.trace = arrayUnionFactory(traceItem);
    }
    await docRef.update(update);
}
async function incrementPlanRequestAttemptCount(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    await docRef.update({
        attemptCount: firestore_1.FieldValue.increment(1),
        updatedAt: timestampFactory(),
    });
}
async function savePlanRequestIntent(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    await docRef.update({
        intent: params.intent,
        updatedAt: timestampFactory(),
    });
}
async function savePlanRequestResult(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    await docRef.update({
        status: constants_1.PLAN_REQUEST_STATUS.COMPLETED,
        generationStage: constants_1.PLAN_GENERATION_STAGE.COMPLETED,
        progressPercent: 100,
        result: params.result,
        error: null,
        updatedAt: timestampFactory(),
        trace: firestore_1.FieldValue.arrayUnion({
            at: nowIso(),
            stage: constants_1.PLAN_GENERATION_STAGE.COMPLETED,
            message: "Plan generation completed",
        }),
    });
}
async function savePlanRequestError(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const docRef = params.db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(params.planRequestId);
    await docRef.update({
        status: constants_1.PLAN_REQUEST_STATUS.FAILED,
        generationStage: constants_1.PLAN_GENERATION_STAGE.FAILED,
        error: params.error,
        updatedAt: timestampFactory(),
        trace: firestore_1.FieldValue.arrayUnion({
            at: nowIso(),
            stage: constants_1.PLAN_GENERATION_STAGE.FAILED,
            message: "Plan generation failed",
            metadata: { code: params.error.code },
        }),
    });
}
//# sourceMappingURL=repository.js.map