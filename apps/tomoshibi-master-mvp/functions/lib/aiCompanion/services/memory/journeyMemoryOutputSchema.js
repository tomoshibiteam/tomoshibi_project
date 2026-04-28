"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journeyMemoryOutputSchema = void 0;
exports.journeyMemoryOutputSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "A short title for the completed journey memory.",
        },
        summary: {
            type: "string",
            description: "A concise recap grounded only in the provided visited places, messages, feedback, and user comment.",
        },
        companionMessage: {
            type: "string",
            description: "A short companion-style closing message that is warm but not dependent or romantic.",
        },
        learnedPreferences: {
            type: "array",
            items: {
                type: "string",
            },
            description: "Preference tags or short preference phrases learned from explicit feedback only.",
        },
    },
    required: ["title", "summary", "companionMessage", "learnedPreferences"],
};
//# sourceMappingURL=journeyMemoryOutputSchema.js.map