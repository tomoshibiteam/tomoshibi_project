export type JourneyMemory = {
  id: string;
  userId: string;
  characterId: string;
  sessionId: string;
  title: string;
  summary: string;
  companionMessage: string;
  visitedPlaces: {
    placeId: string;
    name: string;
    visitedAt?: string;
    userReaction?: "liked" | "neutral" | "skipped" | "saved";
  }[];
  learnedPreferences?: string[];
  relationshipDelta?: number;
  createdAt: string;
};
