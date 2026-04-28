import type { LlmClient, LlmJsonRequest } from "./LlmClient";
export declare class GeminiLlmClient implements LlmClient {
    private readonly apiKey;
    private readonly model;
    constructor(apiKey?: string | undefined, model?: string);
    generateJson<T>(request: LlmJsonRequest): Promise<T>;
}
