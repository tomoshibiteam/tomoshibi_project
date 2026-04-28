import { describe, expect, it, vi } from "vitest";
import type { Character } from "../../types/character";
import type { GuideSession } from "../../types/guide";
import type { User } from "../../types/user";
import { CompanionGenerator } from "./CompanionGenerator";
import type { LlmClient, LlmJsonRequest } from "./LlmClient";

const now = "2026-04-27T00:00:00.000Z";

const user: User = {
  id: "user-1",
  createdAt: now,
  updatedAt: now,
  preferenceSummary: "静かなカフェが好き。",
};

const character: Character = {
  id: "tomoshibi",
  name: "トモシビ",
  description: "外出の相棒AI。",
  persona: {
    personality: ["穏やか"],
    tone: "calm",
    firstPerson: "私",
    userCallNameDefault: "あなた",
  },
  guideStyle: {
    detailLevel: "normal",
    historyLevel: "medium",
    emotionalDistance: "balanced",
    humorLevel: "low",
  },
  createdAt: now,
  updatedAt: now,
};

const session: GuideSession = {
  id: "session-1",
  userId: user.id,
  characterId: character.id,
  mode: "daily_walk",
  status: "active",
  origin: { lat: 35, lng: 139 },
  context: {
    availableMinutes: 30,
    mobility: "walk",
  },
  createdAt: now,
  updatedAt: now,
};

describe("CompanionGenerator.generateCompanionResponse", () => {
  it("returns structured LLM output", async () => {
    const llmClient = new FixedLlmClient({
      message: "今の気分なら、ここを少し見てみるのが合いそう。",
      nextActions: [{ label: "保存する", action: "save_place" }],
    });

    const response = await new CompanionGenerator(llmClient).generateCompanionResponse({
      user,
      character,
      relationship: null,
      session,
      recentMessages: [],
      placeContext: null,
      fallbackMessage: "fallback",
      fallbackNextActions: [{ label: "もっと知る", action: "tell_more" }],
    });

    expect(response.message).toBe("今の気分なら、ここを少し見てみるのが合いそう。");
    expect(response.nextActions).toEqual([{ label: "保存する", action: "save_place" }]);
  });

  it("falls back when the LLM fails", async () => {
    const llmClient: LlmClient = {
      generateJson: vi.fn(async () => {
        throw new Error("LLM unavailable");
      }),
    };

    const response = await new CompanionGenerator(llmClient).generateCompanionResponse({
      user,
      character,
      relationship: null,
      session,
      recentMessages: [],
      placeContext: null,
      fallbackMessage: "聞いてくれてありがとう。",
      fallbackNextActions: [{ label: "もっと知る", action: "tell_more" }],
    });

    expect(response).toEqual({
      message: "聞いてくれてありがとう。",
      nextActions: [{ label: "もっと知る", action: "tell_more" }],
    });
  });
});

class FixedLlmClient implements LlmClient {
  constructor(private readonly output: unknown) {}

  async generateJson<T>(_request: LlmJsonRequest): Promise<T> {
    return this.output as T;
  }
}
