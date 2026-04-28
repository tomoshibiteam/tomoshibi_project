import type { AnalyticsEvent } from "../types/events";
import { BaseRepository } from "./BaseRepository";
export declare class AnalyticsEventRepository extends BaseRepository {
    create(event: AnalyticsEvent): Promise<void>;
}
