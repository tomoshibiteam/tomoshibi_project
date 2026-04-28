import type { Character } from "../../types/character";
import type { RespondToCompanionInput, RespondToCompanionOutput } from "../../types/api";
import type { CompanionGuideOutput, GuideSession } from "../../types/guide";
import type { JourneyMemory } from "../../types/memory";
import type { GuideSessionMessage } from "../../types/message";
import type { NormalizedPlace } from "../../types/place";
import type { Relationship } from "../../types/relationship";
import type { RoutePlan } from "../../types/route";
import type { User } from "../../types/user";
import { CompanionPromptBuilder } from "./CompanionPromptBuilder";
import type { LlmClient } from "./LlmClient";
export declare class CompanionGenerator {
    private readonly llmClient;
    private readonly promptBuilder;
    constructor(llmClient: LlmClient, promptBuilder?: CompanionPromptBuilder);
    generateRouteGuide(input: {
        user: User;
        character: Character;
        relationship: Relationship;
        session: GuideSession;
        routes: RoutePlan[];
        recentJourneyMemories?: JourneyMemory[];
    }): Promise<CompanionGuideOutput>;
    generateCompanionResponse(input: {
        user: User;
        character: Character;
        relationship: Relationship | null;
        session: GuideSession;
        recentMessages: GuideSessionMessage[];
        action?: RespondToCompanionInput["action"];
        userMessage?: string;
        placeContext: NormalizedPlace | null;
        fallbackMessage: string;
        fallbackNextActions: RespondToCompanionOutput["nextActions"];
    }): Promise<RespondToCompanionOutput>;
}
