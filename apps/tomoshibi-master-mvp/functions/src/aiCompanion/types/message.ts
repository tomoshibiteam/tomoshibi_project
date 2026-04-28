export type GuideSessionMessageRole = "user" | "companion" | "system";

export type GuideSessionMessage = {
  id: string;
  sessionId: string;
  userId: string;
  characterId: string;
  role: GuideSessionMessageRole;
  content: string;
  actionType?: string;
  placeId?: string;
  routeId?: string;
  createdAt: string;
};
