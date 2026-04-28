"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanionGenerator = void 0;
const CompanionPromptBuilder_1 = require("./CompanionPromptBuilder");
const companionGuideOutputSchema_1 = require("./companionGuideOutputSchema");
const companionResponseOutputSchema_1 = require("./companionResponseOutputSchema");
class CompanionGenerator {
    llmClient;
    promptBuilder;
    constructor(llmClient, promptBuilder = new CompanionPromptBuilder_1.CompanionPromptBuilder()) {
        this.llmClient = llmClient;
        this.promptBuilder = promptBuilder;
    }
    async generateRouteGuide(input) {
        const prompt = this.promptBuilder.buildRouteSuggestionPrompt(input);
        try {
            return await this.llmClient.generateJson({
                ...prompt,
                responseJsonSchema: companionGuideOutputSchema_1.companionGuideOutputSchema,
            });
        }
        catch {
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
    async generateCompanionResponse(input) {
        const prompt = this.promptBuilder.buildCompanionResponsePrompt(input);
        try {
            const output = await this.llmClient.generateJson({
                ...prompt,
                responseJsonSchema: companionResponseOutputSchema_1.companionResponseOutputSchema,
            });
            return {
                message: output.message || input.fallbackMessage,
                nextActions: output.nextActions?.length ? output.nextActions : input.fallbackNextActions,
            };
        }
        catch {
            return {
                message: input.fallbackMessage,
                nextActions: input.fallbackNextActions,
            };
        }
    }
}
exports.CompanionGenerator = CompanionGenerator;
//# sourceMappingURL=CompanionGenerator.js.map