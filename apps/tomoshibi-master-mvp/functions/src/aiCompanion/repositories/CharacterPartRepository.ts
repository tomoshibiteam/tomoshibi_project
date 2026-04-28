import type { CharacterPart } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class CharacterPartRepository extends BaseRepository {
  async getById(partId: string): RepositoryResult<CharacterPart> {
    return this.fromSnapshot<CharacterPart>(await this.db.collection(this.collectionPath("characterParts")).doc(partId).get());
  }

  async list(limit = 100): Promise<CharacterPart[]> {
    const snapshot = await this.db.collection(this.collectionPath("characterParts")).limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CharacterPart[];
  }

  async createIfMissing(part: CharacterPart): Promise<CharacterPart> {
    const ref = this.db.collection(this.collectionPath("characterParts")).doc(part.id);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return this.fromSnapshot<CharacterPart>(snapshot) ?? part;
    }
    await ref.set(part);
    return part;
  }
}
