import type { CompanionGuideOutput } from "../types/guide";
import type { RoutePlan } from "../types/route";
import { BaseRepository } from "./BaseRepository";

export type GuideSuggestionDocument = {
  id: string;
  sessionId: string;
  routes: RoutePlan[];
  companion: CompanionGuideOutput;
  createdAt: string;
};

export class GuideSuggestionRepository extends BaseRepository {
  async create(suggestion: GuideSuggestionDocument): Promise<void> {
    await this.db
      .collection(this.collectionPath("guideSessions"))
      .doc(suggestion.sessionId)
      .collection("suggestions")
      .doc(suggestion.id)
      .set(suggestion);
  }

  async getLatestBySessionId(sessionId: string): Promise<GuideSuggestionDocument | null> {
    const snapshot = await this.db
      .collection(this.collectionPath("guideSessions"))
      .doc(sessionId)
      .collection("suggestions")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    const [document] = snapshot.docs;
    return document ? ({ id: document.id, ...document.data() } as GuideSuggestionDocument) : null;
  }
}
