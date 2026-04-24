"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanRequestStatus = void 0;
const logger = __importStar(require("firebase-functions/logger"));
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("./firebase-admin");
const repository_1 = require("./repository");
function methodNotAllowedResponse() {
    return {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST is supported for getPlanRequestStatus",
    };
}
function validationErrorResponse(details) {
    return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: details[0]?.message ?? "Invalid request payload",
        details,
    };
}
function unauthorizedResponse() {
    return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "Invalid planRequestId or pollToken",
    };
}
function notFoundResponse() {
    return {
        ok: false,
        code: "NOT_FOUND",
        message: "Plan request not found",
    };
}
function internalErrorResponse() {
    return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Failed to read plan request status",
    };
}
function parseBody(raw) {
    const body = (raw ?? {});
    const details = [];
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
exports.getPlanRequestStatus = (0, https_1.onRequest)({ cors: true, region: "asia-northeast1" }, async (req, res) => {
    res.set("Content-Type", "application/json; charset=utf-8");
    if (req.method !== "POST") {
        const payload = methodNotAllowedResponse();
        res.status(405).json(payload);
        return;
    }
    const parsed = parseBody(req.body);
    if ("errors" in parsed) {
        const payload = validationErrorResponse(parsed.errors);
        res.status(400).json(payload);
        return;
    }
    try {
        const db = (0, firebase_admin_1.getFirebaseAdminDb)();
        const byId = await (0, repository_1.getPlanRequestByIdAndPollToken)({
            db,
            planRequestId: parsed.planRequestId,
            pollToken: parsed.pollToken,
        });
        if (!byId) {
            // For security, return unauthorized uniformly instead of revealing ID existence.
            const payload = unauthorizedResponse();
            res.status(403).json(payload);
            return;
        }
        const payload = {
            ok: true,
            status: byId.status,
            generationStage: byId.generationStage,
            progressPercent: byId.progressPercent,
            trace: byId.trace ?? [],
            result: byId.result,
            error: byId.error,
        };
        res.status(200).json(payload);
    }
    catch (error) {
        logger.error("getPlanRequestStatus failed", { error, planRequestId: parsed.planRequestId });
        const payload = internalErrorResponse();
        res.status(500).json(payload);
    }
});
//# sourceMappingURL=get-plan-request-status.js.map