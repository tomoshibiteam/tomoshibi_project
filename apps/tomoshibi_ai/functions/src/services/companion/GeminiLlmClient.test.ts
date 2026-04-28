import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiLlmClient } from "./GeminiLlmClient";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("GeminiLlmClient", () => {
  it("fails fast when GEMINI_API_KEY is not configured", async () => {
    const client = new GeminiLlmClient(undefined, "gemini-2.5-flash");

    await expect(client.generateJson({ system: "system", user: "user" })).rejects.toThrow("GEMINI_API_KEY is not configured.");
  });

  it("sends responseJsonSchema when provided", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({ ok: true }),
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    });
    globalThis.fetch = fetchMock;
    const client = new GeminiLlmClient("test-key", "gemini-test");

    await expect(
      client.generateJson<{ ok: boolean }>({
        system: "system",
        user: "user",
        responseJsonSchema: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
            },
          },
          required: ["ok"],
        },
      }),
    ).resolves.toEqual({ ok: true });

    const firstCall = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(firstCall[1].body as string) as {
      generationConfig?: {
        responseMimeType?: string;
        responseJsonSchema?: Record<string, unknown>;
      };
    };
    expect(body.generationConfig?.responseMimeType).toBe("application/json");
    expect(body.generationConfig?.responseJsonSchema).toEqual({
      type: "object",
      properties: {
        ok: {
          type: "boolean",
        },
      },
      required: ["ok"],
    });
  });
});
