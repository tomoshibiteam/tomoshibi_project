import { FeedbackEventRepository } from "../repositories/FeedbackEventRepository";
import { GuideSessionMessageRepository } from "../repositories/GuideSessionMessageRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { JourneyMemoryRepository } from "../repositories/JourneyMemoryRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import { createLlmClient } from "../services/companion/createLlmClient";
import { JourneyMemoryService } from "../services/memory/JourneyMemoryService";
import { RelationshipService } from "../services/memory/RelationshipService";
import { EventLogService } from "../services/tracking/EventLogService";
import type { CompleteJourneyInput, CompleteJourneyOutput } from "../types/api";
import type { Relationship } from "../types/relationship";
import { nowIso } from "../utils/time";

export async function completeJourney(input: CompleteJourneyInput): Promise<CompleteJourneyOutput> {
  if (!input.userId || !input.sessionId || !Array.isArray(input.visitedPlaceIds)) throw new Error("userId, sessionId, and visitedPlaceIds are required.");
  const sessionRepository = new GuideSessionRepository();
  const session = await sessionRepository.getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  const [messages, feedbackEvents] = await Promise.all([new GuideSessionMessageRepository().listBySessionId(session.id), new FeedbackEventRepository().listBySessionId(session.id)]);
  const journeyMemory = await new JourneyMemoryService(createLlmClient()).createJourneyMemory({ session, messages, feedbackEvents, visitedPlaceIds: input.visitedPlaceIds, userComment: input.userComment });
  const now = nowIso();
  const relationshipRepository = new RelationshipRepository();
  const relationshipId = `${session.userId}_${session.characterId}`;
  const relationship: Relationship =
    (await relationshipRepository.getById(relationshipId)) ?? {
      id: relationshipId,
      userId: session.userId,
      characterId: session.characterId,
      relationshipLevel: 0,
      totalSessions: 0,
      totalWalkDistanceMeters: 0,
      totalVisitedPlaces: 0,
      createdAt: now,
      updatedAt: now,
    };
  await relationshipRepository.upsert(new RelationshipService().recordJourneyCompleted(relationship, journeyMemory, now));
  await new JourneyMemoryRepository().create(journeyMemory);
  await sessionRepository.update({ ...session, status: "completed", updatedAt: now });
  await new EventLogService().log({ name: "journey_completed", userId: session.userId, sessionId: session.id, characterId: session.characterId, metadata: { journeyId: journeyMemory.id, visitedPlaceCount: journeyMemory.visitedPlaces.length, learnedPreferenceCount: journeyMemory.learnedPreferences?.length ?? 0 }, createdAt: now });
  return { journeyId: journeyMemory.id, title: journeyMemory.title, summary: journeyMemory.summary, companionMessage: journeyMemory.companionMessage, learnedPreferences: journeyMemory.learnedPreferences ?? [] };
}
