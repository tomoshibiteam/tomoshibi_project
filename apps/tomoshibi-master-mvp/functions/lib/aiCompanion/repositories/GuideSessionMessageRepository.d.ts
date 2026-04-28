import type { GuideSessionMessage } from "../types/message";
import { BaseRepository } from "./BaseRepository";
export declare class GuideSessionMessageRepository extends BaseRepository {
    create(message: GuideSessionMessage): Promise<void>;
    listBySessionId(sessionId: string, limit?: number): Promise<GuideSessionMessage[]>;
}
