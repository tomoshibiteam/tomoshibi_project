import type { FeedbackEvent } from "../types/events";
import { BaseRepository } from "./BaseRepository";
export declare class FeedbackEventRepository extends BaseRepository {
    create(event: FeedbackEvent): Promise<void>;
    listBySessionId(sessionId: string, limit?: number): Promise<FeedbackEvent[]>;
}
