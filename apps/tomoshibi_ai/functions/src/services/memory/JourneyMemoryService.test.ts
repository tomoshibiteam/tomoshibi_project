import { describe, expect, it } from "vitest";
import type { FeedbackEvent } from "../../types/events";
import type { GuideSession } from "../../types/guide";
import type { LlmClient, LlmJsonRequest } from "../companion/LlmClient";
import { JourneyMemoryService } from "./JourneyMemoryService";

const now = "2026-04-27T00:00:00.000Z";

const session: GuideSession = {
  id: "session-1",
  userId: "user-1",
  characterId: "tomoshibi",
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

const likedFeedback: FeedbackEvent = {
  id: "feedback-1",
  userId: "user-1",
  sessionId: "session-1",
  characterId: "tomoshibi",
  placeId: "mock-cafe",
  type: "liked",
  metadata: {
    placeName: "路地裏のカフェ",
    tags: ["quiet", "cafe"],
    placeTypes: ["cafe"],
  },
  createdAt: now,
};

describe("JourneyMemoryService", () => {
  it("uses LLM output for the journey recap when available", async () => {
    const llmClient = new FixedLlmClient({
      title: "静かなカフェに寄った日",
      summary: "路地裏のカフェを気に入った、短い散歩の記録です。",
      companionMessage: "今日はおつかれさま。静かなカフェ、やっぱり合いそうだね。",
      learnedPreferences: ["quiet", "cafe"],
    });

    const memory = await new JourneyMemoryService(llmClient).createJourneyMemory({
      session,
      messages: [],
      feedbackEvents: [likedFeedback],
      visitedPlaceIds: ["mock-cafe"],
      userComment: "落ち着いた",
    });

    expect(memory.title).toBe("静かなカフェに寄った日");
    expect(memory.summary).toBe("路地裏のカフェを気に入った、短い散歩の記録です。");
    expect(memory.companionMessage).toBe("今日はおつかれさま。静かなカフェ、やっぱり合いそうだね。");
    expect(memory.learnedPreferences).toEqual(["quiet", "cafe"]);
    expect(memory.visitedPlaces[0]).toEqual({
      placeId: "mock-cafe",
      name: "路地裏のカフェ",
      userReaction: "liked",
    });
  });

  it("falls back when the LLM fails", async () => {
    const llmClient: LlmClient = {
      async generateJson<T>(_request: LlmJsonRequest): Promise<T> {
        throw new Error("LLM unavailable");
      },
    };

    const memory = await new JourneyMemoryService(llmClient).createJourneyMemory({
      session,
      messages: [],
      feedbackEvents: [likedFeedback],
      visitedPlaceIds: ["mock-cafe"],
      userComment: "落ち着いた",
    });

    expect(memory.title).toBe("1か所をめぐった外出");
    expect(memory.learnedPreferences).toEqual(["cafe", "quiet"]);
    expect(memory.companionMessage).toContain("cafe");
  });
});

class FixedLlmClient implements LlmClient {
  constructor(private readonly output: unknown) {}

  async generateJson<T>(_request: LlmJsonRequest): Promise<T> {
    return this.output as T;
  }
}
