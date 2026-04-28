import type { FeedbackEvent } from "../../types/events";
import type { GuideSession } from "../../types/guide";
import type { JourneyMemory } from "../../types/memory";
import type { GuideSessionMessage } from "../../types/message";
import type { LlmClient } from "../companion/LlmClient";
export type CreateJourneyMemoryInput = {
    session: GuideSession;
    messages: GuideSessionMessage[];
    feedbackEvents: FeedbackEvent[];
    visitedPlaceIds: string[];
    userComment?: string;
};
export declare class JourneyMemoryService {
    private readonly llmClient?;
    constructor(llmClient?: LlmClient | undefined);
    createJourneyMemory(input: CreateJourneyMemoryInput): Promise<JourneyMemory>;
    private generateDraft;
}
