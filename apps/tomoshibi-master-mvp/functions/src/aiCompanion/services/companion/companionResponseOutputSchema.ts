export const companionResponseOutputSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "A short companion-style response grounded only in the provided context.",
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
            enum: ["tell_more", "change_mood", "skip_place", "save_place", "arrived", "visited", "liked", "not_interested", "next_suggestion"],
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
  required: ["message", "nextActions"],
} as const;
