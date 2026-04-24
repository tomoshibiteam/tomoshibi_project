import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import { PlanRequestValidationError } from "./errors";
import { getFirebaseAdminDb } from "./firebase-admin";
import { normalizePlanRequest } from "./normalize";
import { buildPlanGenerationPrompt } from "./prompt";
import { savePlanRequest } from "./repository";
import { validatePlanRequestInput } from "./validation";
import { PLAN_REQUEST_STATUS } from "./constants";
import type { CreatePlanRequestErrorResponse, CreatePlanRequestResponse, CreatePlanRequestSuccessResponse } from "./types";

function methodNotAllowedResponse(): CreatePlanRequestErrorResponse {
  return {
    ok: false,
    code: "METHOD_NOT_ALLOWED",
    message: "Only POST is supported for createPlanRequest",
  };
}

function validationErrorResponse(error: PlanRequestValidationError): CreatePlanRequestErrorResponse {
  return {
    ok: false,
    code: "VALIDATION_ERROR",
    message: error.message,
    details: error.details,
  };
}

function internalErrorResponse(): CreatePlanRequestErrorResponse {
  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "Failed to create plan request",
  };
}

export const createPlanRequest = onRequest({ cors: true, region: "asia-northeast1" }, async (req, res) => {
  res.set("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    const payload = methodNotAllowedResponse();
    res.status(405).json(payload satisfies CreatePlanRequestResponse);
    return;
  }

  try {
    const validatedInput = validatePlanRequestInput(req.body);
    const normalizedRequest = normalizePlanRequest(validatedInput);
    const prompt = buildPlanGenerationPrompt(normalizedRequest);

    const db = getFirebaseAdminDb();
    const { planRequestId, pollToken } = await savePlanRequest({
      db,
      rawInput: req.body,
      normalizedRequest,
      prompt,
    });

    const payload: CreatePlanRequestSuccessResponse = {
      ok: true,
      planRequestId,
      status: PLAN_REQUEST_STATUS.QUEUED,
      pollToken,
    };
    res.status(200).json(payload satisfies CreatePlanRequestResponse);
  } catch (error) {
    if (error instanceof PlanRequestValidationError) {
      logger.warn("createPlanRequest validation error", { details: error.details });
      const payload = validationErrorResponse(error);
      res.status(400).json(payload satisfies CreatePlanRequestResponse);
      return;
    }

    logger.error("createPlanRequest failed", { error });
    const payload = internalErrorResponse();
    res.status(500).json(payload satisfies CreatePlanRequestResponse);
  }
});
