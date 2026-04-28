"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOutboundClick = exports.listGuideSessionMessages = exports.getJourneyMemory = exports.listJourneyMemories = exports.completeJourney = exports.updateCharacterCustomization = exports.getCharacterCustomization = exports.getAvailableCharacters = exports.getActiveGuideSession = exports.getUserCompanionState = exports.saveUserFeedback = exports.respondToCompanion = exports.suggestGuideRoute = exports.createGuideSession = exports.health = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
const completeJourney_1 = require("./api/completeJourney");
const createGuideSession_1 = require("./api/createGuideSession");
const getActiveGuideSession_1 = require("./api/getActiveGuideSession");
const getAvailableCharacters_1 = require("./api/getAvailableCharacters");
const getCharacterCustomization_1 = require("./api/getCharacterCustomization");
const getJourneyMemory_1 = require("./api/getJourneyMemory");
const getUserCompanionState_1 = require("./api/getUserCompanionState");
const listJourneyMemories_1 = require("./api/listJourneyMemories");
const listGuideSessionMessages_1 = require("./api/listGuideSessionMessages");
const respondToCompanion_1 = require("./api/respondToCompanion");
const saveUserFeedback_1 = require("./api/saveUserFeedback");
const suggestGuideRoute_1 = require("./api/suggestGuideRoute");
const trackOutboundClick_1 = require("./api/trackOutboundClick");
const updateCharacterCustomization_1 = require("./api/updateCharacterCustomization");
const http_1 = require("./utils/http");
const httpOptions = { cors: true, region: "asia-northeast1" };
const authedRequest = { requireAuth: true };
exports.health = (0, https_1.onRequest)(httpOptions, (_request, response) => {
    firebase_functions_1.logger.info("health check");
    response.status(200).json({ ok: true, service: "tomoshibi-functions" });
});
exports.createGuideSession = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, createGuideSession_1.createGuideSession, authedRequest);
});
exports.suggestGuideRoute = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, suggestGuideRoute_1.suggestGuideRoute, authedRequest);
});
exports.respondToCompanion = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, respondToCompanion_1.respondToCompanion, authedRequest);
});
exports.saveUserFeedback = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, saveUserFeedback_1.saveUserFeedback, authedRequest);
});
exports.getUserCompanionState = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, getUserCompanionState_1.getUserCompanionState, authedRequest);
});
exports.getActiveGuideSession = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, getActiveGuideSession_1.getActiveGuideSession, authedRequest);
});
exports.getAvailableCharacters = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, getAvailableCharacters_1.getAvailableCharacters, authedRequest);
});
exports.getCharacterCustomization = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, getCharacterCustomization_1.getCharacterCustomization, authedRequest);
});
exports.updateCharacterCustomization = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, updateCharacterCustomization_1.updateCharacterCustomization, authedRequest);
});
exports.completeJourney = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, completeJourney_1.completeJourney, authedRequest);
});
exports.listJourneyMemories = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, listJourneyMemories_1.listJourneyMemories, authedRequest);
});
exports.getJourneyMemory = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, getJourneyMemory_1.getJourneyMemory, authedRequest);
});
exports.listGuideSessionMessages = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, listGuideSessionMessages_1.listGuideSessionMessages, authedRequest);
});
exports.trackOutboundClick = (0, https_1.onRequest)(httpOptions, async (request, response) => {
    await (0, http_1.handleJsonRequest)(request, response, trackOutboundClick_1.trackOutboundClick, authedRequest);
});
//# sourceMappingURL=index.js.map