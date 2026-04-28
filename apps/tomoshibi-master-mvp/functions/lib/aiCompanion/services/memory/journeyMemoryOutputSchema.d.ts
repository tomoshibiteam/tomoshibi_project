export declare const journeyMemoryOutputSchema: {
    readonly type: "object";
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly description: "A short title for the completed journey memory.";
        };
        readonly summary: {
            readonly type: "string";
            readonly description: "A concise recap grounded only in the provided visited places, messages, feedback, and user comment.";
        };
        readonly companionMessage: {
            readonly type: "string";
            readonly description: "A short companion-style closing message that is warm but not dependent or romantic.";
        };
        readonly learnedPreferences: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "Preference tags or short preference phrases learned from explicit feedback only.";
        };
    };
    readonly required: readonly ["title", "summary", "companionMessage", "learnedPreferences"];
};
