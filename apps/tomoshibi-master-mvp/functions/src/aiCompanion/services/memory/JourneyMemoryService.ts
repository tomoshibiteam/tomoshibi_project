import type { FeedbackEvent } from "../../types/events";
import type { GuideSession } from "../../types/guide";
import type { JourneyMemory } from "../../types/memory";
import type { GuideSessionMessage } from "../../types/message";
import { createId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import type { LlmClient } from "../companion/LlmClient";
import { journeyMemoryOutputSchema } from "./journeyMemoryOutputSchema";

export type CreateJourneyMemoryInput = {
  session: GuideSession;
  messages: GuideSessionMessage[];
  feedbackEvents: FeedbackEvent[];
  visitedPlaceIds: string[];
  userComment?: string;
};

type JourneyMemoryDraft = {
  title: string;
  summary: string;
  companionMessage: string;
  learnedPreferences: string[];
};

export class JourneyMemoryService {
  constructor(private readonly llmClient?: LlmClient) {}

  async createJourneyMemory(input: CreateJourneyMemoryInput): Promise<JourneyMemory> {
    const visitedPlaces = input.visitedPlaceIds.map((placeId) => ({
      placeId,
      name: placeNameFromFeedback(input.feedbackEvents, placeId) ?? "訪れた場所",
      userReaction: reactionForPlace(input.feedbackEvents, placeId),
    }));
    const fallbackDraft = buildFallbackDraft(input, visitedPlaces);
    const draft = await this.generateDraft(input, visitedPlaces, fallbackDraft);
    return {
      id: createId("journey"),
      userId: input.session.userId,
      characterId: input.session.characterId,
      sessionId: input.session.id,
      title: draft.title,
      summary: draft.summary,
      companionMessage: draft.companionMessage,
      visitedPlaces,
      learnedPreferences: draft.learnedPreferences,
      relationshipDelta: input.feedbackEvents.filter((event) => ["liked", "saved", "visited"].includes(event.type)).length,
      createdAt: nowIso(),
    };
  }

  private async generateDraft(
    input: CreateJourneyMemoryInput,
    visitedPlaces: JourneyMemory["visitedPlaces"],
    fallbackDraft: JourneyMemoryDraft,
  ): Promise<JourneyMemoryDraft> {
    if (!this.llmClient) {
      return fallbackDraft;
    }

    try {
      const output = await this.llmClient.generateJson<JourneyMemoryDraft>({
        system: [
          "あなたはTOMOSHIBIの外出後の振り返りを作る相棒AIです。",
          "与えられていない場所情報、営業時間、料金、歴史、訪問事実を作らないでください。",
          "ユーザーの明示的な反応と会話だけから、短く自然な思い出としてまとめてください。",
          "恋愛依存的な表現、メンタルケア的な深い介入、広告的な誘導は避けてください。",
        ].join("\n"),
        user: JSON.stringify({
          session: input.session,
          visitedPlaces,
          feedbackEvents: input.feedbackEvents.map((event) => ({
            placeId: event.placeId,
            routeId: event.routeId,
            type: event.type,
            metadata: event.metadata,
            createdAt: event.createdAt,
          })),
          recentMessages: input.messages.slice(-20).map((message) => ({
            role: message.role,
            content: message.content,
            actionType: message.actionType,
            placeId: message.placeId,
            routeId: message.routeId,
          })),
          userComment: input.userComment,
          fallbackLearnedPreferences: fallbackDraft.learnedPreferences,
        }),
        responseJsonSchema: journeyMemoryOutputSchema,
      });
      return {
        title: safeText(output.title, fallbackDraft.title),
        summary: safeText(output.summary, fallbackDraft.summary),
        companionMessage: safeText(output.companionMessage, fallbackDraft.companionMessage),
        learnedPreferences: sanitizeLearnedPreferences(output.learnedPreferences, fallbackDraft.learnedPreferences),
      };
    } catch {
      return fallbackDraft;
    }
  }
}

function buildFallbackDraft(
  input: CreateJourneyMemoryInput,
  visitedPlaces: JourneyMemory["visitedPlaces"],
): JourneyMemoryDraft {
  const learnedPreferences = buildLearnedPreferences(input.feedbackEvents);
  return {
    title: visitedPlaces.length > 0 ? `${visitedPlaces.length}か所をめぐった外出` : "短い外出の記録",
    summary: `今回は${visitedPlaces.length}か所の訪問記録と${input.messages.length}件の会話をもとにした外出の記録です。${input.userComment ? ` ユーザーの一言: ${input.userComment}` : ""}`.trim(),
    companionMessage:
      learnedPreferences.length > 0
        ? `今日はおつかれさま。${learnedPreferences.slice(0, 3).join("、")}みたいな雰囲気が少し合いそうだと覚えておくね。`
        : "今日はおつかれさま。歩いたことを、次の提案にも少しずつ活かしていくね。",
    learnedPreferences,
  };
}

function buildLearnedPreferences(events: FeedbackEvent[]): string[] {
  const tags = new Set<string>();
  events
    .filter((event) => event.type === "liked" || event.type === "saved" || event.type === "visited")
    .forEach((event) => {
      [...extractStringList(event.metadata, "placeTypes"), ...extractStringList(event.metadata, "tags")].forEach((tag) => tags.add(tag));
    });
  return [...tags].slice(0, 10);
}

function placeNameFromFeedback(events: FeedbackEvent[], placeId: string): string | undefined {
  const event = events.find((candidate) => candidate.placeId === placeId && typeof candidate.metadata?.placeName === "string");
  return event?.metadata?.placeName as string | undefined;
}

function reactionForPlace(events: FeedbackEvent[], placeId: string): JourneyMemory["visitedPlaces"][number]["userReaction"] {
  const types = events.filter((event) => event.placeId === placeId).map((event) => event.type);
  if (types.includes("liked")) return "liked";
  if (types.includes("saved")) return "saved";
  if (types.includes("skipped")) return "skipped";
  return "neutral";
}

function extractStringList(metadata: Record<string, unknown> | undefined, key: string): string[] {
  const value = metadata?.[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function safeText(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 500) : fallback;
}

function sanitizeLearnedPreferences(value: string[], fallback: string[]): string[] {
  const cleaned = value.map((item) => item.trim()).filter((item) => item.length > 0);
  return (cleaned.length > 0 ? cleaned : fallback).slice(0, 10);
}
