"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanionPromptBuilder = void 0;
class CompanionPromptBuilder {
    buildRouteSuggestionPrompt(input) {
        return {
            system: [
                "あなたはユーザーと一緒に街を歩く相棒AIです。",
                "与えられていない場所情報、営業時間、料金、歴史情報を断定しないでください。",
                "広告のように押し売りせず、短く自然に提案してください。",
            ].join("\n"),
            user: JSON.stringify({
                user: {
                    id: input.user.id,
                    preferenceSummary: input.user.preferenceSummary,
                    preferences: input.user.preferences,
                },
                character: input.character,
                relationship: input.relationship,
                session: input.session,
                routes: input.routes,
                recentJourneyMemories: (input.recentJourneyMemories ?? []).map((memory) => ({
                    title: memory.title,
                    summary: memory.summary,
                    companionMessage: memory.companionMessage,
                    visitedPlaces: memory.visitedPlaces,
                    learnedPreferences: memory.learnedPreferences,
                    createdAt: memory.createdAt,
                })),
            }),
        };
    }
    buildCompanionResponsePrompt(input) {
        return {
            system: [
                "あなたはユーザーと一緒に街を歩く相棒AIです。",
                "観光案内人ではなく、外出の相棒として短く自然に返答してください。",
                "与えられていない場所情報、営業時間、料金、歴史情報を断定しないでください。",
                "placeContextにない事実を補完しないでください。",
                "広告のような強い誘導、恋愛依存的な表現、メンタルケア的な深い介入は避けてください。",
                "ユーザーの気分、好み、直近の会話を踏まえつつ、1から3文で返してください。",
            ].join("\n"),
            user: JSON.stringify({
                user: {
                    id: input.user.id,
                    preferenceSummary: input.user.preferenceSummary,
                    preferences: input.user.preferences,
                },
                character: input.character,
                relationship: input.relationship,
                session: input.session,
                recentMessages: input.recentMessages.slice(-12),
                action: input.action,
                userMessage: input.userMessage,
                placeContext: input.placeContext,
            }),
        };
    }
}
exports.CompanionPromptBuilder = CompanionPromptBuilder;
//# sourceMappingURL=CompanionPromptBuilder.js.map