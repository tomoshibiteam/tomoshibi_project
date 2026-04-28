import { describe, expect, it } from "vitest";
import type { GuideSession } from "../../types/guide";
import type { NormalizedPlace } from "../../types/place";
import { RouteScorer } from "./RouteScorer";

const session: GuideSession = {
  id: "session_test",
  userId: "user_test",
  characterId: "character_test",
  mode: "daily_walk",
  status: "active",
  origin: { lat: 35, lng: 139 },
  context: { availableMinutes: 30, mobility: "walk", mood: "落ち着きたい", interests: ["cafe"] },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("RouteScorer", () => {
  it("scores places higher when mood and interests match", () => {
    const scorer = new RouteScorer();
    const matchingPlace: NormalizedPlace = { provider: "mock", providerPlaceId: "matching", name: "Quiet Cafe", lat: 35, lng: 139, types: ["cafe"], rating: 4.5, openNow: true, tomoshibiTags: ["quiet", "relax"] };
    const unrelatedPlace: NormalizedPlace = { provider: "mock", providerPlaceId: "unrelated", name: "Busy Shop", lat: 35, lng: 139, types: ["store"], rating: 4.5, openNow: true, tomoshibiTags: ["busy"] };
    expect(scorer.scorePlace(matchingPlace, session)).toBeGreaterThan(scorer.scorePlace(unrelatedPlace, session));
  });

  it("penalizes places that are known to be closed", () => {
    const scorer = new RouteScorer();
    const openPlace: NormalizedPlace = { provider: "mock", providerPlaceId: "open", name: "Open Park", lat: 35, lng: 139, types: ["park"], openNow: true };
    const closedPlace: NormalizedPlace = { ...openPlace, providerPlaceId: "closed", openNow: false };
    expect(scorer.scorePlace(openPlace, session)).toBeGreaterThan(scorer.scorePlace(closedPlace, session));
  });
});
