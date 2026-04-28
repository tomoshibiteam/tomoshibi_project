import type { FeedbackEvent } from "../../types/events";
import type { JourneyMemory } from "../../types/memory";
import type { Relationship } from "../../types/relationship";

export class RelationshipService {
  recordSessionStarted(relationship: Relationship, now: string): Relationship {
    return {
      ...relationship,
      totalSessions: relationship.totalSessions + 1,
      lastInteractionAt: now,
      updatedAt: now,
    };
  }

  applyFeedbackSignal(relationship: Relationship, event: FeedbackEvent, now: string): Relationship {
    const relationshipDelta = event.type === "liked" || event.type === "saved" || event.type === "visited" ? 1 : 0;
    return {
      ...relationship,
      relationshipLevel: Math.max(0, relationship.relationshipLevel + relationshipDelta),
      totalVisitedPlaces: relationship.totalVisitedPlaces + (event.type === "visited" ? 1 : 0),
      lastInteractionAt: now,
      updatedAt: now,
    };
  }

  recordJourneyCompleted(relationship: Relationship, journeyMemory: JourneyMemory, now: string): Relationship {
    const visitedCount = journeyMemory.visitedPlaces.filter((place) => place.userReaction !== "skipped").length;
    return {
      ...relationship,
      relationshipLevel: Math.max(0, relationship.relationshipLevel + (visitedCount > 0 ? 1 : 0)),
      totalVisitedPlaces: relationship.totalVisitedPlaces + visitedCount,
      sharedMemorySummary: buildSharedMemorySummary(relationship.sharedMemorySummary, journeyMemory),
      lastInteractionAt: now,
      updatedAt: now,
    };
  }
}

function buildSharedMemorySummary(currentSummary: string | undefined, journeyMemory: JourneyMemory): string {
  const visitedPlaceNames = journeyMemory.visitedPlaces
    .filter((place) => place.userReaction !== "skipped")
    .map((place) => place.name)
    .slice(0, 3);
  const preferenceText = journeyMemory.learnedPreferences?.length
    ? ` 好みとして ${journeyMemory.learnedPreferences.slice(0, 5).join(", ")} を覚えた。`
    : "";
  const newMemory = `${journeyMemory.title}: ${visitedPlaceNames.length > 0 ? `${visitedPlaceNames.join("、")}を一緒に記録した。` : journeyMemory.summary}${preferenceText}`;
  return [currentSummary, newMemory]
    .filter((item): item is string => Boolean(item?.trim()))
    .join("\n")
    .slice(-1200);
}
