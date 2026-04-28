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
import { companionGuideOutputSchema } from "./companionGuideOutputSchema";
import { companionResponseOutputSchema } from "./companionResponseOutputSchema";

export class CompanionGenerator {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptBuilder = new CompanionPromptBuilder(),
  ) {}

  async generateRouteGuide(input: {
    user: User;
    character: Character;
    relationship: Relationship;
    session: GuideSession;
    routes: RoutePlan[];
    recentJourneyMemories?: JourneyMemory[];
  }): Promise<CompanionGuideOutput> {
    const prompt = this.promptBuilder.buildRouteSuggestionPrompt(input);
    try {
      return await this.llmClient.generateJson<CompanionGuideOutput>({
        ...prompt,
        responseJsonSchema: companionGuideOutputSchema,
      });
    } catch {
      return {
        openingMessage: "今の条件なら、無理なく寄れそうな候補をいくつか出してみたよ。",
        routeSummaries: input.routes.map((route) => ({
          routeId: route.id,
          companionComment: `${route.title}が合いそう。`,
          whyRecommended: route.concept,
          suggestedAction: "気になったら、少し詳しく見てみよう。",
        })),
        nextActions: [
          { label: "詳しく聞く", action: "tell_more" },
          { label: "保存する", action: "save_route" },
        ],
      };
    }
  }

  async generateCompanionResponse(input: {
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
  }): Promise<RespondToCompanionOutput> {
    const prompt = this.promptBuilder.buildCompanionResponsePrompt(input);
    try {
      const output = await this.llmClient.generateJson<RespondToCompanionOutput>({
        ...prompt,
        responseJsonSchema: companionResponseOutputSchema,
      });
      return {
        message: output.message || input.fallbackMessage,
        nextActions: output.nextActions?.length ? output.nextActions : input.fallbackNextActions,
      };
    } catch {
      return {
        message: input.fallbackMessage,
        nextActions: input.fallbackNextActions,
      };
    }
  }
}
