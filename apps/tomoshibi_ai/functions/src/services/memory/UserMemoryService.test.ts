import { describe, expect, it } from "vitest";
import type { FeedbackEvent } from "../../types/events";
import type { User } from "../../types/user";
import { UserMemoryService } from "./UserMemoryService";

const user: User = {
  id: "user_test",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("UserMemoryService", () => {
  it("adds explicit positive tags to likedPlaceTypes", () => {
    const event: FeedbackEvent = { id: "feedback_1", userId: user.id, sessionId: "session_test", type: "liked", metadata: { placeTypes: ["cafe"], tags: ["quiet"] }, createdAt: "2026-01-01T00:00:00.000Z" };
    const updated = new UserMemoryService().applyFeedbackSignal(user, event);
    expect(updated.preferences?.likedPlaceTypes).toEqual(["cafe", "quiet"]);
    expect(updated.preferences?.dislikedPlaceTypes).toEqual([]);
  });

  it("moves explicit negative tags out of likedPlaceTypes", () => {
    const event: FeedbackEvent = { id: "feedback_2", userId: user.id, sessionId: "session_test", type: "skipped", metadata: { tags: ["busy"] }, createdAt: "2026-01-01T00:00:00.000Z" };
    const updated = new UserMemoryService().applyFeedbackSignal({ ...user, preferences: { likedPlaceTypes: ["busy", "quiet"] } }, event);
    expect(updated.preferences?.likedPlaceTypes).toEqual(["quiet"]);
    expect(updated.preferences?.dislikedPlaceTypes).toEqual(["busy"]);
  });
});
