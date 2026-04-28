"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLlmClient = createLlmClient;
const env_1 = require("../../utils/env");
const GeminiLlmClient_1 = require("./GeminiLlmClient");
const MockLlmClient_1 = require("./MockLlmClient");
function createLlmClient() {
    return (0, env_1.readEnv)("LLM_PROVIDER") === "gemini" ? new GeminiLlmClient_1.GeminiLlmClient() : new MockLlmClient_1.MockLlmClient();
}
//# sourceMappingURL=createLlmClient.js.map