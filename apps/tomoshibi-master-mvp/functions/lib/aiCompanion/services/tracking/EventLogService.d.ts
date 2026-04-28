import { AnalyticsEventRepository } from "../../repositories/AnalyticsEventRepository";
import type { AnalyticsEventName } from "../../types/events";
export type EventLogInput = {
    name: AnalyticsEventName;
    userId?: string;
    sessionId?: string;
    characterId?: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
};
export declare class EventLogService {
    private readonly analyticsEventRepository;
    constructor(analyticsEventRepository?: AnalyticsEventRepository);
    log(input: EventLogInput): Promise<void>;
}
