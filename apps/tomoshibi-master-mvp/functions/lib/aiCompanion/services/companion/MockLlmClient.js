"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLlmClient = void 0;
class MockLlmClient {
    async generateJson(_request) {
        throw new Error("MockLlmClient requires caller fallback.");
    }
}
exports.MockLlmClient = MockLlmClient;
//# sourceMappingURL=MockLlmClient.js.map