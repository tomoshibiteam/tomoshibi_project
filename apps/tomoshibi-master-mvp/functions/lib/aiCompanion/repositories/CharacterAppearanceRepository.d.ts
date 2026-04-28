import type { CharacterAppearance } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class CharacterAppearanceRepository extends BaseRepository {
    getById(appearanceId: string): RepositoryResult<CharacterAppearance>;
    listByCharacterId(characterId: string, limit?: number): Promise<CharacterAppearance[]>;
    createIfMissing(appearance: CharacterAppearance): Promise<CharacterAppearance>;
}
