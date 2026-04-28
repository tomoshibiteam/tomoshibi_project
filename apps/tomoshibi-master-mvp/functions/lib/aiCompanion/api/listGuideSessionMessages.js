"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGuideSessionMessages = listGuideSessionMessages;
const GuideSessionMessageRepository_1 = require("../repositories/GuideSessionMessageRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
async function listGuideSessionMessages(input) {
    if (!input.userId || !input.sessionId)
        throw new Error("userId and sessionId are required.");
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    const limit = typeof input.limit === "number" && input.limit > 0 ? Math.min(Math.floor(input.limit), 100) : 50;
    const messages = await new GuideSessionMessageRepository_1.GuideSessionMessageRepository().listBySessionId(input.sessionId, limit);
    return { messages };
}
//# sourceMappingURL=listGuideSessionMessages.js.map