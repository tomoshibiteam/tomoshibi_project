import type { FeedbackEvent } from "../types/events";
import { BaseRepository } from "./BaseRepository";

export class FeedbackEventRepository extends BaseRepository {
  async create(event: FeedbackEvent): Promise<void> {
    await this.db.collection(this.collectionPath("feedbackEvents")).doc(event.id).set(event);
  }

  async listBySessionId(sessionId: string, limit = 100): Promise<FeedbackEvent[]> {
    const snapshot = await this.db
      .collection(this.collectionPath("feedbackEvents"))
      .where("sessionId", "==", sessionId)
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FeedbackEvent[];
  }
}
