import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { GuideSuggestionRepository } from "../repositories/GuideSuggestionRepository";
import type { GetActiveGuideSessionInput, GetActiveGuideSessionOutput } from "../types/api";

export async function getActiveGuideSession(input: GetActiveGuideSessionInput): Promise<GetActiveGuideSessionOutput> {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  const session = await new GuideSessionRepository().getLatestActiveByUserAndCharacter(input.userId, input.characterId);
  if (!session) return { session: null, latestSuggestion: null };
  const latestSuggestion = await new GuideSuggestionRepository().getLatestBySessionId(session.id);
  return {
    session,
    latestSuggestion: latestSuggestion
      ? {
          routes: latestSuggestion.routes,
          companion: latestSuggestion.companion,
        }
      : null,
  };
}
