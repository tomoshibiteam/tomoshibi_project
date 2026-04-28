import { FeedbackEventRepository } from "../repositories/FeedbackEventRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { applyFeedbackMemory } from "../services/memory/applyFeedbackMemory";
import type { SaveUserFeedbackInput, SaveUserFeedbackOutput } from "../types/api";
import { createId } from "../utils/ids";
import { nowIso } from "../utils/time";

export async function saveUserFeedback(input: SaveUserFeedbackInput): Promise<SaveUserFeedbackOutput> {
  if (!input.userId || !input.sessionId || !input.type) throw new Error("userId, sessionId, and type are required.");
  const session = await new GuideSessionRepository().getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  const feedbackEvent = {
    id: createId("feedback"),
    userId: input.userId,
    sessionId: session.id,
    characterId: input.characterId ?? session.characterId,
    placeId: input.placeId,
    routeId: input.routeId,
    type: input.type,
    metadata: input.metadata,
    createdAt: nowIso(),
  };
  await new FeedbackEventRepository().create(feedbackEvent);
  await applyFeedbackMemory(feedbackEvent);
  return { feedbackEventId: feedbackEvent.id };
}
