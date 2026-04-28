import type { LlmClient, LlmJsonRequest } from "./LlmClient";

export class MockLlmClient implements LlmClient {
  async generateJson<T>(_request: LlmJsonRequest): Promise<T> {
    throw new Error("MockLlmClient requires caller fallback.");
  }
}
