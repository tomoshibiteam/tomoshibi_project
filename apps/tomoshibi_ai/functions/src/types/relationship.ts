export type Relationship = {
  id: string;
  userId: string;
  characterId: string;
  relationshipLevel: number;
  totalSessions: number;
  totalWalkDistanceMeters: number;
  totalVisitedPlaces: number;
  sharedMemorySummary?: string;
  unlockedPhrases?: string[];
  lastInteractionAt?: string;
  createdAt: string;
  updatedAt: string;
};
