"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiLlmClient = void 0;
const env_1 = require("../../utils/env");
const llmUsage_1 = require("../../utils/llmUsage");
class GeminiLlmClient {
    apiKey;
    model;
    constructor(apiKey = (0, env_1.readEnv)("GEMINI_API_KEY"), model = (0, env_1.readEnv)("GEMINI_MODEL") ?? "gemini-2.5-flash") {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generateJson(request) {
        if (!this.apiKey) {
            throw new Error("GEMINI_API_KEY is not configured.");
        }
        (0, llmUsage_1.recordLlmCall)({
            provider: "gemini",
            model: this.model,
            operation: "generateContent",
        });
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-goog-api-key": this.apiKey,
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: request.system }],
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: request.user }],
                    },
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    ...(request.responseJsonSchema ? { responseJsonSchema: request.responseJsonSchema } : {}),
                },
            }),
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Gemini generateContent failed: ${response.status} ${responseText}`);
        }
        const payload = JSON.parse(responseText);
        (0, llmUsage_1.completeLatestLlmCall)({
            provider: "gemini",
            model: this.model,
            operation: "generateContent",
            inputTokens: payload.usageMetadata?.promptTokenCount,
            outputTokens: payload.usageMetadata?.candidatesTokenCount,
            totalTokens: payload.usageMetadata?.totalTokenCount,
        });
        const text = payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
        if (!text) {
            throw new Error("Gemini response did not include JSON text.");
        }
        return JSON.parse(text);
    }
}
exports.GeminiLlmClient = GeminiLlmClient;
//# sourceMappingURL=GeminiLlmClient.js.map