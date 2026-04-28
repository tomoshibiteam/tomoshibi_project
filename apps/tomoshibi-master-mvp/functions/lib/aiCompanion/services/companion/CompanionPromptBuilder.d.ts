import type { Character } from "../../types/character";
import type { RespondToCompanionInput } from "../../types/api";
import type { GuideSession } from "../../types/guide";
import type { JourneyMemory } from "../../types/memory";
import type { GuideSessionMessage } from "../../types/message";
import type { NormalizedPlace } from "../../types/place";
import type { Relationship } from "../../types/relationship";
import type { RoutePlan } from "../../types/route";
import type { User } from "../../types/user";
export declare class CompanionPromptBuilder {
    buildRouteSuggestionPrompt(input: {
        user: User;
        character: Character;
        relationship: Relationship;
        session: GuideSession;
        routes: RoutePlan[];
        recentJourneyMemories?: JourneyMemory[];
    }): {
        system: string;
        user: string;
    };
    buildCompanionResponsePrompt(input: {
        user: User;
        character: Character;
        relationship: Relationship | null;
        session: GuideSession;
        recentMessages: GuideSessionMessage[];
        action?: RespondToCompanionInput["action"];
        userMessage?: string;
        placeContext: NormalizedPlace | null;
    }): {
        system: string;
        user: string;
    };
}
