import type { GuideSession } from "../types/guide";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class GuideSessionRepository extends BaseRepository {
  async getById(sessionId: string): RepositoryResult<GuideSession> {
    return this.fromSnapshot<GuideSession>(await this.db.collection(this.collectionPath("guideSessions")).doc(sessionId).get());
  }

  async create(session: GuideSession): Promise<void> {
    await this.db.collection(this.collectionPath("guideSessions")).doc(session.id).set(session);
  }

  async update(session: GuideSession): Promise<void> {
    await this.db.collection(this.collectionPath("guideSessions")).doc(session.id).set(session, { merge: true });
  }

  async getLatestActiveByUserAndCharacter(userId: string, characterId: string): Promise<GuideSession | null> {
    const snapshot = await this.db
      .collection(this.collectionPath("guideSessions"))
      .where("userId", "==", userId)
      .where("characterId", "==", characterId)
      .where("status", "==", "active")
      .limit(20)
      .get();
    const sessions = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as GuideSession)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return sessions[0] ?? null;
  }
}
