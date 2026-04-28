import type { CharacterPart } from "../types/character";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class CharacterPartRepository extends BaseRepository {
    getById(partId: string): RepositoryResult<CharacterPart>;
    list(limit?: number): Promise<CharacterPart[]>;
    createIfMissing(part: CharacterPart): Promise<CharacterPart>;
}
