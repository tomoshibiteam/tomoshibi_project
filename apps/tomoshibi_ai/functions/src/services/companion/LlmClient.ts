export type LlmJsonRequest = {
  system: string;
  user: string;
  responseJsonSchema?: Record<string, unknown>;
};

export interface LlmClient {
  generateJson<T>(request: LlmJsonRequest): Promise<T>;
}
