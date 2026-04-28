import type { FeedbackEvent } from "../../types/events";
import type { User } from "../../types/user";
import { nowIso } from "../../utils/time";

export class UserMemoryService {
  applyFeedbackSignal(user: User, event: FeedbackEvent): User {
    const signals = [...extractStringList(event.metadata, "placeTypes"), ...extractStringList(event.metadata, "tags")];
    const preferences = user.preferences ?? {};
    const likedPlaceTypes = new Set(preferences.likedPlaceTypes ?? []);
    const dislikedPlaceTypes = new Set(preferences.dislikedPlaceTypes ?? []);

    if (event.type === "liked" || event.type === "saved" || event.type === "visited") {
      signals.forEach((signal) => {
        likedPlaceTypes.add(signal);
        dislikedPlaceTypes.delete(signal);
      });
    }

    if (event.type === "not_interested" || event.type === "skipped") {
      signals.forEach((signal) => {
        dislikedPlaceTypes.add(signal);
        likedPlaceTypes.delete(signal);
      });
    }

    return {
      ...user,
      preferences: {
        ...preferences,
        likedPlaceTypes: [...likedPlaceTypes].slice(0, 30),
        dislikedPlaceTypes: [...dislikedPlaceTypes].slice(0, 30),
      },
      preferenceSummary: buildPreferenceSummary([...likedPlaceTypes], [...dislikedPlaceTypes]),
      updatedAt: nowIso(),
    };
  }
}

function extractStringList(metadata: Record<string, unknown> | undefined, key: string): string[] {
  const value = metadata?.[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function buildPreferenceSummary(likedPlaceTypes: string[], dislikedPlaceTypes: string[]): string {
  const liked = likedPlaceTypes.slice(0, 5).join(", ") || "まだ明確な好みは少ない";
  const disliked = dislikedPlaceTypes.slice(0, 5).join(", ") || "まだ明確な苦手傾向は少ない";
  return `好きそうな場所: ${liked}。今は合いにくそうな場所: ${disliked}。`;
}
