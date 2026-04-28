export declare const companionGuideOutputSchema: {
    readonly type: "object";
    readonly properties: {
        readonly openingMessage: {
            readonly type: "string";
            readonly description: "A short companion-style opening message for the route suggestions.";
        };
        readonly routeSummaries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly routeId: {
                        readonly type: "string";
                    };
                    readonly companionComment: {
                        readonly type: "string";
                    };
                    readonly whyRecommended: {
                        readonly type: "string";
                    };
                    readonly suggestedAction: {
                        readonly type: "string";
                    };
                };
                readonly required: readonly ["routeId", "companionComment", "whyRecommended", "suggestedAction"];
            };
        };
        readonly nextActions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly label: {
                        readonly type: "string";
                    };
                    readonly action: {
                        readonly type: "string";
                        readonly enum: readonly ["start_route", "tell_more", "change_mood", "save_route"];
                    };
                    readonly payload: {
                        readonly type: "object";
                        readonly additionalProperties: true;
                    };
                };
                readonly required: readonly ["label", "action"];
            };
        };
    };
    readonly required: readonly ["openingMessage", "routeSummaries", "nextActions"];
};
