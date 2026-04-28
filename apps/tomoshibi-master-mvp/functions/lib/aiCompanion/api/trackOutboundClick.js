"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOutboundClick = trackOutboundClick;
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const ClickTrackingService_1 = require("../services/tracking/ClickTrackingService");
async function trackOutboundClick(input) {
    if (!input.userId || !input.sessionId || !input.url)
        throw new Error("userId, sessionId, and url are required.");
    const url = new URL(input.url);
    if (url.protocol !== "http:" && url.protocol !== "https:")
        throw new Error("url must be http or https.");
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    return new ClickTrackingService_1.ClickTrackingService().track(input);
}
//# sourceMappingURL=trackOutboundClick.js.map