import type { LlmClient, LlmJsonRequest } from "./LlmClient";
export declare class MockLlmClient implements LlmClient {
    generateJson<T>(_request: LlmJsonRequest): Promise<T>;
}
