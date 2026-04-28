import { RelationshipRepository } from "../../repositories/RelationshipRepository";
import { UserRepository } from "../../repositories/UserRepository";
import type { FeedbackEvent } from "../../types/events";
import type { Relationship } from "../../types/relationship";
import { nowIso } from "../../utils/time";
import { RelationshipService } from "./RelationshipService";
import { UserMemoryService } from "./UserMemoryService";

export async function applyFeedbackMemory(event: FeedbackEvent): Promise<void> {
  const userRepository = new UserRepository();
  const relationshipRepository = new RelationshipRepository();
  const user = await userRepository.getById(event.userId);
  if (user) {
    await userRepository.update(new UserMemoryService().applyFeedbackSignal(user, event));
  }

  if (!event.characterId) {
    return;
  }

  const now = nowIso();
  const relationshipId = `${event.userId}_${event.characterId}`;
  const relationship: Relationship =
    (await relationshipRepository.getById(relationshipId)) ?? {
      id: relationshipId,
      userId: event.userId,
      characterId: event.characterId,
      relationshipLevel: 0,
      totalSessions: 0,
      totalWalkDistanceMeters: 0,
      totalVisitedPlaces: 0,
      createdAt: now,
      updatedAt: now,
    };
  await relationshipRepository.upsert(new RelationshipService().applyFeedbackSignal(relationship, event, now));
}
