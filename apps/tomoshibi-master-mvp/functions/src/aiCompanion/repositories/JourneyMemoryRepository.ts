import type { JourneyMemory } from "../types/memory";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class JourneyMemoryRepository extends BaseRepository {
  async getById(journeyId: string): RepositoryResult<JourneyMemory> {
    return this.fromSnapshot<JourneyMemory>(
      await this.db.collection(this.collectionPath("journeyMemories")).doc(journeyId).get(),
    );
  }

  async create(memory: JourneyMemory): Promise<void> {
    await this.db.collection(this.collectionPath("journeyMemories")).doc(memory.id).set(memory);
  }

  async listRecentByUserAndCharacter(userId: string, characterId: string, limit = 5): Promise<JourneyMemory[]> {
    const snapshot = await this.db
      .collection(this.collectionPath("journeyMemories"))
      .where("userId", "==", userId)
      .limit(30)
      .get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as JourneyMemory)
      .filter((memory) => memory.characterId === characterId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
