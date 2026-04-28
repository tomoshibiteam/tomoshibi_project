import type { CharacterAppearance } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class CharacterAppearanceRepository extends BaseRepository {
  async getById(appearanceId: string): RepositoryResult<CharacterAppearance> {
    return this.fromSnapshot<CharacterAppearance>(
      await this.db.collection(this.collectionPath("characterAppearances")).doc(appearanceId).get(),
    );
  }

  async listByCharacterId(characterId: string, limit = 20): Promise<CharacterAppearance[]> {
    const snapshot = await this.db
      .collection(this.collectionPath("characterAppearances"))
      .where("characterId", "==", characterId)
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CharacterAppearance[];
  }

  async createIfMissing(appearance: CharacterAppearance): Promise<CharacterAppearance> {
    const ref = this.db.collection(this.collectionPath("characterAppearances")).doc(appearance.id);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return this.fromSnapshot<CharacterAppearance>(snapshot) ?? appearance;
    }
    await ref.set(appearance);
    return appearance;
  }
}
