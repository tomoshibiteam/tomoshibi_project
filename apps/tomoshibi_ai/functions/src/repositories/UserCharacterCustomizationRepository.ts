import type { UserCharacterCustomization } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class UserCharacterCustomizationRepository extends BaseRepository {
  async getById(customizationId: string): RepositoryResult<UserCharacterCustomization> {
    return this.fromSnapshot<UserCharacterCustomization>(
      await this.db.collection(this.collectionPath("userCharacterCustomizations")).doc(customizationId).get(),
    );
  }

  async upsert(customization: UserCharacterCustomization): Promise<void> {
    await this.db.collection(this.collectionPath("userCharacterCustomizations")).doc(customization.id).set(customization, { merge: true });
  }
}

export function userCharacterCustomizationId(userId: string, characterId: string): string {
  return `${userId}_${characterId}`;
}
