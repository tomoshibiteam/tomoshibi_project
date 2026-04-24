import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import { getFirebaseAdminDb } from "./firebase-admin";
import { getPlanRequestByIdAndPollToken } from "./repository";
import type {
  GetPlanRequestStatusErrorResponse,
  GetPlanRequestStatusResponse,
  GetPlanRequestStatusSuccessResponse,
  ValidationIssueDetail,
} from "./types";

type GetPlanRequestStatusBody = {
  planRequestId?: unknown;
  pollToken?: unknown;
};

function methodNotAllowedResponse(): GetPlanRequestStatusErrorResponse {
  return {
    ok: false,
    code: "METHOD_NOT_ALLOWED",
    message: "Only POST is supported for getPlanRequestStatus",
  };
}

function validationErrorResponse(details: ValidationIssueDetail[]): GetPlanRequestStatusErrorResponse {
  return {
    ok: false,
    code: "VALIDATION_ERROR",
    message: details[0]?.message ?? "Invalid request payload",
    details,
  };
}

function unauthorizedResponse(): GetPlanRequestStatusErrorResponse {
  return {
    ok: false,
    code: "UNAUTHORIZED",
    message: "Invalid planRequestId or pollToken",
  };
}

function notFoundResponse(): GetPlanRequestStatusErrorResponse {
  return {
    ok: false,
    code: "NOT_FOUND",
    message: "Plan request not found",
  };
}

function internalErrorResponse(): GetPlanRequestStatusErrorResponse {
  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "Failed to read plan request status",
  };
}

function parseBody(raw: unknown): { planRequestId: string; pollToken: string } | { errors: ValidationIssueDetail[] } {
  const body = (raw ?? {}) as GetPlanRequestStatusBody;
  const details: ValidationIssueDetail[] = [];

  const planRequestId = typeof body.planRequestId === "string" ? body.planRequestId.trim() : "";
  const pollToken = typeof body.pollToken === "string" ? body.pollToken.trim() : "";

  if (!planRequestId) {
    details.push({ path: "planRequestId", message: "planRequestId is required" });
  }
  if (!pollToken) {
    details.push({ path: "pollToken", message: "pollToken is required" });
  }

  if (details.length > 0) {
    return { errors: details };
  }

  return { planRequestId, pollToken };
}

export const getPlanRequestStatus = onRequest({ cors: true, region: "asia-northeast1" }, async (req, res) => {
  res.set("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    const payload = methodNotAllowedResponse();
    res.status(405).json(payload satisfies GetPlanRequestStatusResponse);
    return;
  }

  const parsed = parseBody(req.body);
  if ("errors" in parsed) {
    const payload = validationErrorResponse(parsed.errors);
    res.status(400).json(payload satisfies GetPlanRequestStatusResponse);
    return;
  }

  try {
    const db = getFirebaseAdminDb();
    const byId = await getPlanRequestByIdAndPollToken({
      db,
      planRequestId: parsed.planRequestId,
      pollToken: parsed.pollToken,
    });

    if (!byId) {
      // For security, return unauthorized uniformly instead of revealing ID existence.
      const payload = unauthorizedResponse();
      res.status(403).json(payload satisfies GetPlanRequestStatusResponse);
      return;
    }

    const payload: GetPlanRequestStatusSuccessResponse = {
      ok: true,
      status: byId.status,
      generationStage: byId.generationStage,
      progressPercent: byId.progressPercent,
      trace: byId.trace ?? [],
      result: byId.result,
      error: byId.error,
    };
    res.status(200).json(payload satisfies GetPlanRequestStatusResponse);
  } catch (error) {
    logger.error("getPlanRequestStatus failed", { error, planRequestId: parsed.planRequestId });
    const payload = internalErrorResponse();
    res.status(500).json(payload satisfies GetPlanRequestStatusResponse);
  }
});
