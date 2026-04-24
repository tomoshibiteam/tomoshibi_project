import { FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { PLAN_GENERATION_STAGE, PLAN_REQUEST_STATUS, PLAN_REQUESTS_COLLECTION } from "./constants";
import { getFirebaseAdminDb } from "./firebase-admin";
import { runPlanGenerationWithFailureHandling } from "./generate";
import type { PlanRequestDocument } from "./types";

async function tryAcquireGenerationLock(planRequestId: string): Promise<boolean> {
  const db = getFirebaseAdminDb();
  const ref = db.collection(PLAN_REQUESTS_COLLECTION).doc(planRequestId);

  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) {
      return false;
    }
    const doc = snapshot.data() as PlanRequestDocument;
    if (doc.status !== PLAN_REQUEST_STATUS.QUEUED) {
      return false;
    }

    tx.update(ref, {
      status: PLAN_REQUEST_STATUS.GENERATING,
      generationStage: PLAN_GENERATION_STAGE.INTENT_PARSING,
      progressPercent: 6,
      attemptCount: (doc.attemptCount ?? 0) + 1,
      updatedAt: FieldValue.serverTimestamp(),
      trace: FieldValue.arrayUnion({
        at: new Date().toISOString(),
        stage: PLAN_GENERATION_STAGE.INTENT_PARSING,
        message: "Generation worker started",
      }),
    });
    return true;
  });
}

export const onPlanRequestCreated = onDocumentCreated(
  {
    document: `${PLAN_REQUESTS_COLLECTION}/{planRequestId}`,
    region: "asia-northeast1",
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (event) => {
    const planRequestId = event.params.planRequestId;
    if (!planRequestId) {
      return;
    }

    const acquired = await tryAcquireGenerationLock(planRequestId);
    if (!acquired) {
      logger.info("Skipped generation; lock not acquired", { planRequestId });
      return;
    }

    await runPlanGenerationWithFailureHandling({
      planRequestId,
      db: getFirebaseAdminDb(),
    });
  },
);
