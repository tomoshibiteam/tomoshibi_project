import type { Character } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class CharacterRepository extends BaseRepository {
    getById(characterId: string): RepositoryResult<Character>;
    list(limit?: number): Promise<Character[]>;
    createIfMissing(character: Character): Promise<Character>;
}
