"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserFeedback = saveUserFeedback;
const FeedbackEventRepository_1 = require("../repositories/FeedbackEventRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const applyFeedbackMemory_1 = require("../services/memory/applyFeedbackMemory");
const ids_1 = require("../utils/ids");
const time_1 = require("../utils/time");
async function saveUserFeedback(input) {
    if (!input.userId || !input.sessionId || !input.type)
        throw new Error("userId, sessionId, and type are required.");
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    const feedbackEvent = {
        id: (0, ids_1.createId)("feedback"),
        userId: input.userId,
        sessionId: session.id,
        characterId: input.characterId ?? session.characterId,
        placeId: input.placeId,
        routeId: input.routeId,
        type: input.type,
        metadata: input.metadata,
        createdAt: (0, time_1.nowIso)(),
    };
    await new FeedbackEventRepository_1.FeedbackEventRepository().create(feedbackEvent);
    await (0, applyFeedbackMemory_1.applyFeedbackMemory)(feedbackEvent);
    return { feedbackEventId: feedbackEvent.id };
}
//# sourceMappingURL=saveUserFeedback.js.map