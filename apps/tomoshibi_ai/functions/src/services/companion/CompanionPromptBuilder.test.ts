import { describe, expect, it } from "vitest";
import type { Character } from "../../types/character";
import type { GuideSession } from "../../types/guide";
import type { JourneyMemory } from "../../types/memory";
import type { Relationship } from "../../types/relationship";
import type { RoutePlan } from "../../types/route";
import type { User } from "../../types/user";
import { CompanionPromptBuilder } from "./CompanionPromptBuilder";

const now = "2026-04-27T00:00:00.000Z";

describe("CompanionPromptBuilder", () => {
  it("includes recent journey memories in route suggestion context", () => {
    const prompt = new CompanionPromptBuilder().buildRouteSuggestionPrompt({
      user,
      character,
      relationship,
      session,
      routes: [route],
      recentJourneyMemories: [journeyMemory],
    });

    const payload = JSON.parse(prompt.user) as {
      recentJourneyMemories?: {
        title: string;
        learnedPreferences?: string[];
      }[];
      user?: {
        preferenceSummary?: string;
      };
    };
    expect(payload.user?.preferenceSummary).toBe("静かな場所とカフェが好き。");
    expect(payload.recentJourneyMemories).toEqual([
      expect.objectContaining({
        title: "静かなカフェに寄った日",
        learnedPreferences: ["quiet", "cafe"],
      }),
    ]);
    expect(prompt.system).toContain("与えられていない場所情報");
  });
});

const user: User = {
  id: "user-1",
  preferenceSummary: "静かな場所とカフェが好き。",
  createdAt: now,
  updatedAt: now,
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

const relationship: Relationship = {
  id: "user-1_tomoshibi",
  userId: "user-1",
  characterId: "tomoshibi",
  relationshipLevel: 2,
  totalSessions: 1,
  totalWalkDistanceMeters: 0,
  totalVisitedPlaces: 1,
  sharedMemorySummary: "静かなカフェを一緒に記録した。",
  createdAt: now,
  updatedAt: now,
};

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
    mood: "落ち着きたい",
  },
  createdAt: now,
  updatedAt: now,
};

const route: RoutePlan = {
  id: "route-1",
  title: "静かな寄り道",
  concept: "無理なく静かな場所へ寄る",
  estimatedMinutes: 30,
  places: [],
  score: 10,
  tags: ["quiet"],
};

const journeyMemory: JourneyMemory = {
  id: "journey-1",
  userId: "user-1",
  characterId: "tomoshibi",
  sessionId: "session-old",
  title: "静かなカフェに寄った日",
  summary: "路地裏のカフェを気に入った。",
  companionMessage: "静かなカフェが合いそうだね。",
  visitedPlaces: [
    {
      placeId: "mock-cafe",
      name: "路地裏のカフェ",
      userReaction: "liked",
    },
  ],
  learnedPreferences: ["quiet", "cafe"],
  createdAt: now,
};
