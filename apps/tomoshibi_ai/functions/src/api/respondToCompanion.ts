import { CharacterRepository } from "../repositories/CharacterRepository";
import { FeedbackEventRepository } from "../repositories/FeedbackEventRepository";
import { GuideSessionMessageRepository } from "../repositories/GuideSessionMessageRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { GuideSuggestionRepository } from "../repositories/GuideSuggestionRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CompanionGenerator } from "../services/companion/CompanionGenerator";
import { createLlmClient } from "../services/companion/createLlmClient";
import { applyFeedbackMemory } from "../services/memory/applyFeedbackMemory";
import { PlaceCacheService } from "../services/places/PlaceCacheService";
import { createPlaceProvider } from "../services/places/createPlaceProvider";
import { EventLogService } from "../services/tracking/EventLogService";
import type { RespondToCompanionInput, RespondToCompanionOutput } from "../types/api";
import type { FeedbackEventType } from "../types/events";
import type { NormalizedPlace } from "../types/place";
import { createId } from "../utils/ids";
import { nowIso } from "../utils/time";

type CompanionAction = NonNullable<RespondToCompanionInput["action"]>;

export async function respondToCompanion(input: RespondToCompanionInput): Promise<RespondToCompanionOutput> {
  if (!input.userId || !input.sessionId || (!input.message && !input.action)) throw new Error("userId, sessionId, and message or action are required.");
  const now = nowIso();
  const session = await new GuideSessionRepository().getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  const user = await new UserRepository().getById(input.userId);
  if (!user) throw new Error("User was not found.");
  const character = await new CharacterRepository().getById(session.characterId);
  if (!character) throw new Error("Character was not found.");
  const relationship = await new RelationshipRepository().getById(`${user.id}_${character.id}`);
  const messageRepository = new GuideSessionMessageRepository();
  if (input.message) {
    await messageRepository.create({ id: createId("message"), sessionId: session.id, userId: input.userId, characterId: session.characterId, role: "user", content: input.message, createdAt: now });
  }
  const feedbackType = input.action ? feedbackTypeForAction(input.action.type) : undefined;
  if (feedbackType) {
    const event = { id: createId("feedback"), userId: input.userId, sessionId: session.id, characterId: session.characterId, placeId: input.action?.placeId, routeId: input.action?.routeId, type: feedbackType, metadata: input.action?.payload, createdAt: now };
    await new FeedbackEventRepository().create(event);
    await applyFeedbackMemory(event);
  }
  const placeContext = await getPlaceContextForAction(input);
  const fallbackMessage = buildFallbackCompanionMessage(input, placeContext);
  const fallbackNextActions = buildNextActions(input);
  const recentMessages = await messageRepository.listBySessionId(session.id, 20);
  const companionResponse = await new CompanionGenerator(createLlmClient()).generateCompanionResponse({
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
  await messageRepository.create({ id: createId("message"), sessionId: session.id, userId: input.userId, characterId: session.characterId, role: "companion", content: companionResponse.message, actionType: input.action?.type, placeId: input.action?.placeId, routeId: input.action?.routeId, createdAt: nowIso() });
  await new EventLogService().log({ name: "companion_message_sent", userId: input.userId, sessionId: session.id, characterId: session.characterId, metadata: { actionType: input.action?.type, hasUserMessage: Boolean(input.message), feedbackType }, createdAt: nowIso() });
  return companionResponse;
}

function feedbackTypeForAction(actionType: CompanionAction["type"]): FeedbackEventType | undefined {
  if (actionType === "liked") return "liked";
  if (actionType === "not_interested") return "not_interested";
  if (actionType === "save_place") return "saved";
  if (actionType === "skip_place") return "skipped";
  if (actionType === "visited") return "visited";
  if (actionType === "arrived") return "arrived";
  return undefined;
}

async function getPlaceContextForAction(input: RespondToCompanionInput): Promise<NormalizedPlace | null> {
  if (input.action?.type !== "tell_more" || !input.action.placeId) {
    return null;
  }
  const suggestion = await new GuideSuggestionRepository().getLatestBySessionId(input.sessionId);
  const routePlaces = suggestion?.routes.flatMap((route) => route.places.map((routePlace) => routePlace.place)) ?? [];
  const storedPlace = routePlaces.find((place) => place.providerPlaceId === input.action?.placeId) ?? null;
  if (!storedPlace || storedPlace.provider !== "google_places") {
    const cachedPlace = storedPlace
      ? await new PlaceCacheService().get(storedPlace.provider, storedPlace.providerPlaceId)
      : null;
    if (cachedPlace) {
      return cachedPlace;
    }
    return storedPlace;
  }

  try {
    return (
      (await createPlaceProvider().getDetails({
        providerPlaceId: storedPlace.providerPlaceId,
        languageCode: "ja",
      })) ?? storedPlace
    );
  } catch {
    return storedPlace;
  }
}

function buildFallbackCompanionMessage(input: RespondToCompanionInput, placeContext: NormalizedPlace | null): string {
  if (input.action?.type === "liked") return "気に入ったんだね。こういう雰囲気、次の提案にも少し反映するよ。";
  if (input.action?.type === "save_place") return "保存しておいたよ。次に近くを歩くときの参考にするね。";
  if (input.action?.type === "visited") return "行ってみた記録を残したよ。あとで今日の思い出としてまとめよう。";
  if (input.action?.type === "tell_more" && placeContext) return buildTellMoreMessage(placeContext);
  return "聞いてくれてありがとう。今わかっている情報をもとに、一緒に考えるね。";
}

function buildTellMoreMessage(place: NormalizedPlace): string {
  const details = [
    place.address ? `住所は「${place.address}」。` : undefined,
    typeof place.rating === "number" ? `評価は${place.rating}くらい。` : undefined,
    typeof place.openNow === "boolean" ? (place.openNow ? "取得情報では、今は開いている可能性があるよ。" : "取得情報では、今は開いていない可能性があるよ。") : undefined,
    place.websiteUri ? "公式サイトも確認できるよ。" : undefined,
    place.localStory?.short,
  ].filter((detail): detail is string => Boolean(detail));
  const suffix = details.length > 0 ? details.join(" ") : "まだ詳しい情報は少ないけど、候補としては確認できている場所だよ。";
  return `${place.name}について、今わかっている範囲で伝えるね。${suffix} 行く前に営業時間や最新情報は念のため確認しよう。`;
}

function buildNextActions(input: RespondToCompanionInput): RespondToCompanionOutput["nextActions"] {
  const placePayload = input.action?.placeId ? { placeId: input.action.placeId, routeId: input.action.routeId } : undefined;
  return [
    { label: "もっと知る", action: "tell_more", payload: placePayload },
    { label: "保存する", action: "save_place", payload: placePayload },
    { label: "違う候補", action: "next_suggestion", payload: input.action?.routeId ? { routeId: input.action.routeId } : undefined },
  ];
}
