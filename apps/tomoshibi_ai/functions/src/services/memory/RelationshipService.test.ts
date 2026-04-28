import { describe, expect, it } from "vitest";
import type { JourneyMemory } from "../../types/memory";
import type { Relationship } from "../../types/relationship";
import { RelationshipService } from "./RelationshipService";

const now = "2026-04-27T00:00:00.000Z";

const relationship: Relationship = {
  id: "user-1_tomoshibi",
  userId: "user-1",
  characterId: "tomoshibi",
  relationshipLevel: 2,
  totalSessions: 1,
  totalWalkDistanceMeters: 0,
  totalVisitedPlaces: 1,
  sharedMemorySummary: "前回: 静かな道を一緒に歩いた。",
  createdAt: now,
  updatedAt: now,
};

const journeyMemory: JourneyMemory = {
  id: "journey-1",
  userId: "user-1",
  characterId: "tomoshibi",
  sessionId: "session-1",
  title: "静かなカフェに寄った日",
  summary: "路地裏のカフェを気に入った。",
  companionMessage: "今日はおつかれさま。",
  visitedPlaces: [
    {
      placeId: "mock-cafe",
      name: "路地裏のカフェ",
      userReaction: "liked",
    },
  ],
  learnedPreferences: ["quiet", "cafe"],
  relationshipDelta: 3,
  createdAt: now,
};

describe("RelationshipService.recordJourneyCompleted", () => {
  it("adds a completed journey memory without applying feedback delta twice", () => {
    const updated = new RelationshipService().recordJourneyCompleted(relationship, journeyMemory, now);

    expect(updated.relationshipLevel).toBe(3);
    expect(updated.totalVisitedPlaces).toBe(2);
    expect(updated.sharedMemorySummary).toContain("前回");
    expect(updated.sharedMemorySummary).toContain("静かなカフェに寄った日");
    expect(updated.sharedMemorySummary).toContain("quiet, cafe");
    expect(updated.lastInteractionAt).toBe(now);
  });
});
