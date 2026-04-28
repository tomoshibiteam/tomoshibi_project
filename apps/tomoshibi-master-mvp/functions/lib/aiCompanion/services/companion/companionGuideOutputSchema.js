"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionGuideOutputSchema = void 0;
exports.companionGuideOutputSchema = {
    type: "object",
    properties: {
        openingMessage: {
            type: "string",
            description: "A short companion-style opening message for the route suggestions.",
        },
        routeSummaries: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    routeId: {
                        type: "string",
                    },
                    companionComment: {
                        type: "string",
                    },
                    whyRecommended: {
                        type: "string",
                    },
                    suggestedAction: {
                        type: "string",
                    },
                },
                required: ["routeId", "companionComment", "whyRecommended", "suggestedAction"],
            },
        },
        nextActions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    label: {
                        type: "string",
                    },
                    action: {
                        type: "string",
                        enum: ["start_route", "tell_more", "change_mood", "save_route"],
                    },
                    payload: {
                        type: "object",
                        additionalProperties: true,
                    },
                },
                required: ["label", "action"],
            },
        },
    },
    required: ["openingMessage", "routeSummaries", "nextActions"],
};
//# sourceMappingURL=companionGuideOutputSchema.js.map