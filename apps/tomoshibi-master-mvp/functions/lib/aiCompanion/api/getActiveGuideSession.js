"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveGuideSession = getActiveGuideSession;
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const GuideSuggestionRepository_1 = require("../repositories/GuideSuggestionRepository");
async function getActiveGuideSession(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getLatestActiveByUserAndCharacter(input.userId, input.characterId);
    if (!session)
        return { session: null, latestSuggestion: null };
    const latestSuggestion = await new GuideSuggestionRepository_1.GuideSuggestionRepository().getLatestBySessionId(session.id);
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
//# sourceMappingURL=getActiveGuideSession.js.map