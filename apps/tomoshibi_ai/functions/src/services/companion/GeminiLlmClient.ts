import { readEnv } from "../../utils/env";
import type { LlmClient, LlmJsonRequest } from "./LlmClient";

type GeminiGenerateContentResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
};

export class GeminiLlmClient implements LlmClient {
  constructor(
    private readonly apiKey = readEnv("GEMINI_API_KEY"),
    private readonly model = readEnv("GEMINI_MODEL") ?? "gemini-2.5-flash",
  ) {}

  async generateJson<T>(request: LlmJsonRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
      {
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
      },
    );

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Gemini generateContent failed: ${response.status} ${responseText}`);
    }

    const payload = JSON.parse(responseText) as GeminiGenerateContentResponse;
    const text = payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
    if (!text) {
      throw new Error("Gemini response did not include JSON text.");
    }

    return JSON.parse(text) as T;
  }
}
