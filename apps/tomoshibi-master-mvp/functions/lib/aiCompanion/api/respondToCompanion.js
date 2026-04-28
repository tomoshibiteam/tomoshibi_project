"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToCompanion = respondToCompanion;
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const FeedbackEventRepository_1 = require("../repositories/FeedbackEventRepository");
const GuideSessionMessageRepository_1 = require("../repositories/GuideSessionMessageRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const GuideSuggestionRepository_1 = require("../repositories/GuideSuggestionRepository");
const RelationshipRepository_1 = require("../repositories/RelationshipRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const CompanionGenerator_1 = require("../services/companion/CompanionGenerator");
const createLlmClient_1 = require("../services/companion/createLlmClient");
const applyFeedbackMemory_1 = require("../services/memory/applyFeedbackMemory");
const PlaceCacheService_1 = require("../services/places/PlaceCacheService");
const createPlaceProvider_1 = require("../services/places/createPlaceProvider");
const EventLogService_1 = require("../services/tracking/EventLogService");
const ids_1 = require("../utils/ids");
const time_1 = require("../utils/time");
async function respondToCompanion(input) {
    if (!input.userId || !input.sessionId || (!input.message && !input.action))
        throw new Error("userId, sessionId, and message or action are required.");
    const now = (0, time_1.nowIso)();
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    const user = await new UserRepository_1.UserRepository().getById(input.userId);
    if (!user)
        throw new Error("User was not found.");
    const character = await new CharacterRepository_1.CharacterRepository().getById(session.characterId);
    if (!character)
        throw new Error("Character was not found.");
    const relationship = await new RelationshipRepository_1.RelationshipRepository().getById(`${user.id}_${character.id}`);
    const messageRepository = new GuideSessionMessageRepository_1.GuideSessionMessageRepository();
    if (input.message) {
        await messageRepository.create({ id: (0, ids_1.createId)("message"), sessionId: session.id, userId: input.userId, characterId: session.characterId, role: "user", content: input.message, createdAt: now });
    }
    const feedbackType = input.action ? feedbackTypeForAction(input.action.type) : undefined;
    if (feedbackType) {
        const event = { id: (0, ids_1.createId)("feedback"), userId: input.userId, sessionId: session.id, characterId: session.characterId, placeId: input.action?.placeId, routeId: input.action?.routeId, type: feedbackType, metadata: input.action?.payload, createdAt: now };
        await new FeedbackEventRepository_1.FeedbackEventRepository().create(event);
        await (0, applyFeedbackMemory_1.applyFeedbackMemory)(event);
    }
    const placeContext = await getPlaceContextForAction(input);
    const fallbackMessage = buildFallbackCompanionMessage(input, placeContext);
    const fallbackNextActions = buildNextActions(input);
    const recentMessages = await messageRepository.listBySessionId(session.id, 20);
    const companionResponse = await new CompanionGenerator_1.CompanionGenerator((0, createLlmClient_1.createLlmClient)()).generateCompanionResponse({
        user,
        character,
        relationship,
        session,
        recentMessages,
        action: input.action,
        userMessage: input.message,
        placeContext,
        fallbackMessage,
        fallbackNextActions,
    });
    await messageRepository.create({ id: (0, ids_1.createId)("message"), sessionId: session.id, userId: input.userId, characterId: session.characterId, role: "companion", content: companionResponse.message, actionType: input.action?.type, placeId: input.action?.placeId, routeId: input.action?.routeId, createdAt: (0, time_1.nowIso)() });
    await new EventLogService_1.EventLogService().log({ name: "companion_message_sent", userId: input.userId, sessionId: session.id, characterId: session.characterId, metadata: { actionType: input.action?.type, hasUserMessage: Boolean(input.message), feedbackType }, createdAt: (0, time_1.nowIso)() });
    return companionResponse;
}
function feedbackTypeForAction(actionType) {
    if (actionType === "liked")
        return "liked";
    if (actionType === "not_interested")
        return "not_interested";
    if (actionType === "save_place")
        return "saved";
    if (actionType === "skip_place")
        return "skipped";
    if (actionType === "visited")
        return "visited";
    if (actionType === "arrived")
        return "arrived";
    return undefined;
}
async function getPlaceContextForAction(input) {
    if (input.action?.type !== "tell_more" || !input.action.placeId) {
        return null;
    }
    const suggestion = await new GuideSuggestionRepository_1.GuideSuggestionRepository().getLatestBySessionId(input.sessionId);
    const routePlaces = suggestion?.routes.flatMap((route) => route.places.map((routePlace) => routePlace.place)) ?? [];
    const storedPlace = routePlaces.find((place) => place.providerPlaceId === input.action?.placeId) ?? null;
    if (!storedPlace || storedPlace.provider !== "google_places") {
        const cachedPlace = storedPlace
            ? await new PlaceCacheService_1.PlaceCacheService().get(storedPlace.provider, storedPlace.providerPlaceId)
            : null;
        if (cachedPlace) {
            return cachedPlace;
        }
        return storedPlace;
    }
    try {
        return ((await (0, createPlaceProvider_1.createPlaceProvider)().getDetails({
            providerPlaceId: storedPlace.providerPlaceId,
            languageCode: "ja",
        })) ?? storedPlace);
    }
    catch {
        return storedPlace;
    }
}
function buildFallbackCompanionMessage(input, placeContext) {
    if (input.action?.type === "liked")
        return "気に入ったんだね。こういう雰囲気、次の提案にも少し反映するよ。";
    if (input.action?.type === "save_place")
        return "保存しておいたよ。次に近くを歩くときの参考にするね。";
    if (input.action?.type === "visited")
        return "行ってみた記録を残したよ。あとで今日の思い出としてまとめよう。";
    if (input.action?.type === "tell_more" && placeContext)
        return buildTellMoreMessage(placeContext);
    return "聞いてくれてありがとう。今わかっている情報をもとに、一緒に考えるね。";
}
function buildTellMoreMessage(place) {
    const details = [
        place.address ? `住所は「${place.address}」。` : undefined,
        typeof place.rating === "number" ? `評価は${place.rating}くらい。` : undefined,
        typeof place.openNow === "boolean" ? (place.openNow ? "取得情報では、今は開いている可能性があるよ。" : "取得情報では、今は開いていない可能性があるよ。") : undefined,
        place.websiteUri ? "公式サイトも確認できるよ。" : undefined,
        place.localStory?.short,
    ].filter((detail) => Boolean(detail));
    const suffix = details.length > 0 ? details.join(" ") : "まだ詳しい情報は少ないけど、候補としては確認できている場所だよ。";
    return `${place.name}について、今わかっている範囲で伝えるね。${suffix} 行く前に営業時間や最新情報は念のため確認しよう。`;
}
function buildNextActions(input) {
    const placePayload = input.action?.placeId ? { placeId: input.action.placeId, routeId: input.action.routeId } : undefined;
    return [
        { label: "もっと知る", action: "tell_more", payload: placePayload },
        { label: "保存する", action: "save_place", payload: placePayload },
        { label: "違う候補", action: "next_suggestion", payload: input.action?.routeId ? { routeId: input.action.routeId } : undefined },
    ];
}
//# sourceMappingURL=respondToCompanion.js.map