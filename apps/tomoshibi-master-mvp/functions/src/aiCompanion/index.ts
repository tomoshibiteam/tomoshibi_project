import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { completeJourney as completeJourneyHandler } from "./api/completeJourney";
import { createGuideSession as createGuideSessionHandler } from "./api/createGuideSession";
import { getActiveGuideSession as getActiveGuideSessionHandler } from "./api/getActiveGuideSession";
import { getAvailableCharacters as getAvailableCharactersHandler } from "./api/getAvailableCharacters";
import { getCharacterCustomization as getCharacterCustomizationHandler } from "./api/getCharacterCustomization";
import { getJourneyMemory as getJourneyMemoryHandler } from "./api/getJourneyMemory";
import { getUserCompanionState as getUserCompanionStateHandler } from "./api/getUserCompanionState";
import { listJourneyMemories as listJourneyMemoriesHandler } from "./api/listJourneyMemories";
import { listGuideSessionMessages as listGuideSessionMessagesHandler } from "./api/listGuideSessionMessages";
import { respondToCompanion as respondToCompanionHandler } from "./api/respondToCompanion";
import { saveUserFeedback as saveUserFeedbackHandler } from "./api/saveUserFeedback";
import { suggestGuideRoute as suggestGuideRouteHandler } from "./api/suggestGuideRoute";
import { trackOutboundClick as trackOutboundClickHandler } from "./api/trackOutboundClick";
import { updateCharacterCustomization as updateCharacterCustomizationHandler } from "./api/updateCharacterCustomization";
import { handleJsonRequest } from "./utils/http";

const httpOptions = { cors: true, region: "asia-northeast1" as const };
const authedRequest = { requireAuth: true };

export const health = onRequest(httpOptions, (_request, response) => {
  logger.info("health check");
  response.status(200).json({ ok: true, service: "tomoshibi-functions" });
});

export const createGuideSession = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, createGuideSessionHandler, authedRequest);
});
export const suggestGuideRoute = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, suggestGuideRouteHandler, authedRequest);
});
export const respondToCompanion = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, respondToCompanionHandler, authedRequest);
});
export const saveUserFeedback = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, saveUserFeedbackHandler, authedRequest);
});
export const getUserCompanionState = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, getUserCompanionStateHandler, authedRequest);
});
export const getActiveGuideSession = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, getActiveGuideSessionHandler, authedRequest);
});
export const getAvailableCharacters = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, getAvailableCharactersHandler, authedRequest);
});
export const getCharacterCustomization = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, getCharacterCustomizationHandler, authedRequest);
});
export const updateCharacterCustomization = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, updateCharacterCustomizationHandler, authedRequest);
});
export const completeJourney = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, completeJourneyHandler, authedRequest);
});
export const listJourneyMemories = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, listJourneyMemoriesHandler, authedRequest);
});
export const getJourneyMemory = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, getJourneyMemoryHandler, authedRequest);
});
export const listGuideSessionMessages = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, listGuideSessionMessagesHandler, authedRequest);
});
export const trackOutboundClick = onRequest(httpOptions, async (request, response) => {
  await handleJsonRequest(request, response, trackOutboundClickHandler, authedRequest);
});
