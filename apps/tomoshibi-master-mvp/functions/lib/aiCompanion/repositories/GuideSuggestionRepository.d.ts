import type { CompanionGuideOutput } from "../types/guide";
import type { RoutePlan } from "../types/route";
import { BaseRepository } from "./BaseRepository";
export type GuideSuggestionDocument = {
    id: string;
    sessionId: string;
    routes: RoutePlan[];
    companion: CompanionGuideOutput;
    createdAt: string;
};
export declare class GuideSuggestionRepository extends BaseRepository {
    create(suggestion: GuideSuggestionDocument): Promise<void>;
    getLatestBySessionId(sessionId: string): Promise<GuideSuggestionDocument | null>;
}
