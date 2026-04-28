import { readEnv } from "../../utils/env";
import type { LlmClient } from "./LlmClient";
import { GeminiLlmClient } from "./GeminiLlmClient";
import { MockLlmClient } from "./MockLlmClient";

export function createLlmClient(): LlmClient {
  return readEnv("LLM_PROVIDER") === "gemini" ? new GeminiLlmClient() : new MockLlmClient();
}
