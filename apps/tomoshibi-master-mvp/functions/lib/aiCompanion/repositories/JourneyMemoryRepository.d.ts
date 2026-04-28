import type { JourneyMemory } from "../types/memory";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class JourneyMemoryRepository extends BaseRepository {
    getById(journeyId: string): RepositoryResult<JourneyMemory>;
    create(memory: JourneyMemory): Promise<void>;
    listRecentByUserAndCharacter(userId: string, characterId: string, limit?: number): Promise<JourneyMemory[]>;
}
