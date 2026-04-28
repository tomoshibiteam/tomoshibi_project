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
}
