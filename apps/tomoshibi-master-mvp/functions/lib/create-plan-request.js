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
exports.createPlanRequest = void 0;
const logger = __importStar(require("firebase-functions/logger"));
const https_1 = require("firebase-functions/v2/https");
const errors_1 = require("./errors");
const firebase_admin_1 = require("./firebase-admin");
const normalize_1 = require("./normalize");
const prompt_1 = require("./prompt");
const repository_1 = require("./repository");
const validation_1 = require("./validation");
const constants_1 = require("./constants");
function methodNotAllowedResponse() {
    return {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST is supported for createPlanRequest",
    };
}
function validationErrorResponse(error) {
    return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: error.message,
        details: error.details,
    };
}
function internalErrorResponse() {
    return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Failed to create plan request",
    };
}
exports.createPlanRequest = (0, https_1.onRequest)({ cors: true, region: "asia-northeast1" }, async (req, res) => {
    res.set("Content-Type", "application/json; charset=utf-8");
    if (req.method !== "POST") {
        const payload = methodNotAllowedResponse();
        res.status(405).json(payload);
        return;
    }
    try {
        const validatedInput = (0, validation_1.validatePlanRequestInput)(req.body);
        const normalizedRequest = (0, normalize_1.normalizePlanRequest)(validatedInput);
        const prompt = (0, prompt_1.buildPlanGenerationPrompt)(normalizedRequest);
        const db = (0, firebase_admin_1.getFirebaseAdminDb)();
        const { planRequestId, pollToken } = await (0, repository_1.savePlanRequest)({
            db,
            rawInput: req.body,
            normalizedRequest,
            prompt,
        });
        const payload = {
            ok: true,
            planRequestId,
            status: constants_1.PLAN_REQUEST_STATUS.QUEUED,
            pollToken,
        };
        res.status(200).json(payload);
    }
    catch (error) {
        if (error instanceof errors_1.PlanRequestValidationError) {
            logger.warn("createPlanRequest validation error", { details: error.details });
            const payload = validationErrorResponse(error);
            res.status(400).json(payload);
            return;
        }
        logger.error("createPlanRequest failed", { error });
        const payload = internalErrorResponse();
        res.status(500).json(payload);
    }
});
//# sourceMappingURL=create-plan-request.js.map