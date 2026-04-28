import type { UserCharacterCustomization } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class UserCharacterCustomizationRepository extends BaseRepository {
    getById(customizationId: string): RepositoryResult<UserCharacterCustomization>;
    upsert(customization: UserCharacterCustomization): Promise<void>;
}
export declare function userCharacterCustomizationId(userId: string, characterId: string): string;
