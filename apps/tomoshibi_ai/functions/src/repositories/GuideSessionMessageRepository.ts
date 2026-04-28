import type { GuideSessionMessage } from "../types/message";
import { BaseRepository } from "./BaseRepository";

export class GuideSessionMessageRepository extends BaseRepository {
  async create(message: GuideSessionMessage): Promise<void> {
    await this.db
      .collection(this.collectionPath("guideSessions"))
      .doc(message.sessionId)
      .collection("messages")
      .doc(message.id)
      .set(message);
  }

  async listBySessionId(sessionId: string, limit = 100): Promise<GuideSessionMessage[]> {
    const snapshot = await this.db
      .collection(this.collectionPath("guideSessions"))
      .doc(sessionId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as GuideSessionMessage[];
  }
}
