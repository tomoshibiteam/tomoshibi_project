"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPlanRequestCreated = void 0;
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
const firebase_functions_1 = require("firebase-functions");
const constants_1 = require("./constants");
const firebase_admin_1 = require("./firebase-admin");
const generate_1 = require("./generate");
async function tryAcquireGenerationLock(planRequestId) {
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    const ref = db.collection(constants_1.PLAN_REQUESTS_COLLECTION).doc(planRequestId);
    return db.runTransaction(async (tx) => {
        const snapshot = await tx.get(ref);
        if (!snapshot.exists) {
            return false;
        }
        const doc = snapshot.data();
        if (doc.status !== constants_1.PLAN_REQUEST_STATUS.QUEUED) {
            return false;
        }
        tx.update(ref, {
            status: constants_1.PLAN_REQUEST_STATUS.GENERATING,
            generationStage: constants_1.PLAN_GENERATION_STAGE.INTENT_PARSING,
            progressPercent: 6,
            attemptCount: (doc.attemptCount ?? 0) + 1,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            trace: firestore_1.FieldValue.arrayUnion({
                at: new Date().toISOString(),
                stage: constants_1.PLAN_GENERATION_STAGE.INTENT_PARSING,
                message: "Generation worker started",
            }),
        });
        return true;
    });
}
exports.onPlanRequestCreated = (0, firestore_2.onDocumentCreated)({
    document: `${constants_1.PLAN_REQUESTS_COLLECTION}/{planRequestId}`,
    region: "asia-northeast1",
    timeoutSeconds: 300,
    memory: "512MiB",
}, async (event) => {
    const planRequestId = event.params.planRequestId;
    if (!planRequestId) {
        return;
    }
    const acquired = await tryAcquireGenerationLock(planRequestId);
    if (!acquired) {
        firebase_functions_1.logger.info("Skipped generation; lock not acquired", { planRequestId });
        return;
    }
    await (0, generate_1.runPlanGenerationWithFailureHandling)({
        planRequestId,
        db: (0, firebase_admin_1.getFirebaseAdminDb)(),
    });
});
//# sourceMappingURL=plan-request-worker.js.map