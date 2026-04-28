import type { Character } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class CharacterRepository extends BaseRepository {
  async getById(characterId: string): RepositoryResult<Character> {
    return this.fromSnapshot<Character>(await this.db.collection(this.collectionPath("characters")).doc(characterId).get());
  }

  async list(limit = 20): Promise<Character[]> {
    const snapshot = await this.db.collection(this.collectionPath("characters")).limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Character[];
  }

  async createIfMissing(character: Character): Promise<Character> {
    const ref = this.db.collection(this.collectionPath("characters")).doc(character.id);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return this.fromSnapshot<Character>(snapshot) ?? character;
    }
    await ref.set(character);
    return character;
  }
}
