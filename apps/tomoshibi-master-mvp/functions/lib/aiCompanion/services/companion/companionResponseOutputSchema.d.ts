export declare const companionResponseOutputSchema: {
    readonly type: "object";
    readonly properties: {
        readonly message: {
            readonly type: "string";
            readonly description: "A short companion-style response grounded only in the provided context.";
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
                        readonly enum: readonly ["tell_more", "change_mood", "skip_place", "save_place", "arrived", "visited", "liked", "not_interested", "next_suggestion"];
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
    readonly required: readonly ["message", "nextActions"];
};
