import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { completeJourney as completeJourneyHandler } from "./api/completeJourney";
import { createGuideSession as createGuideSessionHandler } from "./api/createGuideSession";
import { getAvailableCharacters as getAvailableCharactersHandler } from "./api/getAvailableCharacters";
import { getCharacterCustomization as getCharacterCustomizationHandler } from "./api/getCharacterCustomization";
import { getUserCompanionState as getUserCompanionStateHandler } from "./api/getUserCompanionState";
import { respondToCompanion as respondToCompanionHandler } from "./api/respondToCompanion";
import { saveUserFeedback as saveUserFeedbackHandler } from "./api/saveUserFeedback";
import { suggestGuideRoute as suggestGuideRouteHandler } from "./api/suggestGuideRoute";
import { trackOutboundClick as trackOutboundClickHandler } from "./api/trackOutboundClick";
import { updateCharacterCustomization as updateCharacterCustomizationHandler } from "./api/updateCharacterCustomization";
import { handleJsonRequest } from "./utils/http";

export const health = onRequest((_request, response) => {
  logger.info("health check");
  response.status(200).json({ ok: true, service: "tomoshibi-functions" });
});

export const createGuideSession = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, createGuideSessionHandler);
});
export const suggestGuideRoute = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, suggestGuideRouteHandler);
});
export const respondToCompanion = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, respondToCompanionHandler);
});
export const saveUserFeedback = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, saveUserFeedbackHandler);
});
export const getUserCompanionState = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, getUserCompanionStateHandler);
});
export const getAvailableCharacters = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, getAvailableCharactersHandler);
});
export const getCharacterCustomization = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, getCharacterCustomizationHandler);
});
export const updateCharacterCustomization = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, updateCharacterCustomizationHandler);
});
export const completeJourney = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, completeJourneyHandler);
});
export const trackOutboundClick = onRequest(async (request, response) => {
  await handleJsonRequest(request, response, trackOutboundClickHandler);
});
