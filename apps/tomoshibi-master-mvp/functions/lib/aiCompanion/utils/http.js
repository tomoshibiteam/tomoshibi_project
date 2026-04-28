"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJsonRequest = handleJsonRequest;
const auth_1 = require("./auth");
const llmUsage_1 = require("./llmUsage");
async function handleJsonRequest(request, response, handler, options = {}) {
    if (request.method !== "POST") {
        response.status(405).json({ error: { code: "method_not_allowed", message: "Use POST." } });
        return;
    }
    if (options.requireAuth) {
        const authenticated = await (0, auth_1.applyAuthUserId)(request, response);
        if (!authenticated)
            return;
    }
    try {
        const { result, calls } = await (0, llmUsage_1.runWithLlmUsageTracking)(() => handler(request.body));
        if (calls.length > 0) {
            const totalInputTokens = sumNumbers(calls.map((call) => call.inputTokens));
            const totalOutputTokens = sumNumbers(calls.map((call) => call.outputTokens));
            const totalTokens = sumNumbers(calls.map((call) => call.totalTokens));
            const estimatedUsd = sumNumbers(calls.map((call) => call.estimatedUsd));
            const estimatedJpy = sumNumbers(calls.map((call) => call.estimatedJpy));
            const usdJpyRate = calls.find((call) => typeof call.usdJpyRate === "number")?.usdJpyRate;
            response.setHeader("X-Tomoshibi-AI-LLM-Calls", String(calls.length));
            response.setHeader("X-Tomoshibi-AI-LLM-Provider", calls.map((call) => call.provider).join(","));
            response.setHeader("X-Tomoshibi-AI-LLM-Model", calls.map((call) => call.model).join(","));
            response.setHeader("X-Tomoshibi-AI-LLM-Operation", calls.map((call) => call.operation).join(","));
            response.setHeader("X-Tomoshibi-AI-LLM-Input-Tokens", String(totalInputTokens));
            response.setHeader("X-Tomoshibi-AI-LLM-Output-Tokens", String(totalOutputTokens));
            response.setHeader("X-Tomoshibi-AI-LLM-Total-Tokens", String(totalTokens));
            response.setHeader("X-Tomoshibi-AI-LLM-Estimated-USD", estimatedUsd.toFixed(8));
            response.setHeader("X-Tomoshibi-AI-LLM-Estimated-JPY", estimatedJpy.toFixed(4));
            if (typeof usdJpyRate === "number") {
                response.setHeader("X-Tomoshibi-AI-LLM-USD-JPY-Rate", String(usdJpyRate));
            }
        }
        response.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        response.status(500).json({ error: { code: "internal", message } });
    }
}
function sumNumbers(values) {
    let total = 0;
    values.forEach((value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
            total += value;
        }
    });
    return total;
}
//# sourceMappingURL=http.js.map