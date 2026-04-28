import type { GuideSession } from "../types/guide";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class GuideSessionRepository extends BaseRepository {
    getById(sessionId: string): RepositoryResult<GuideSession>;
    create(session: GuideSession): Promise<void>;
    update(session: GuideSession): Promise<void>;
    getLatestActiveByUserAndCharacter(userId: string, characterId: string): Promise<GuideSession | null>;
}
