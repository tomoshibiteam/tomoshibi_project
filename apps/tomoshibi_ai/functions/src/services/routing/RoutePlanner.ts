import type { GuideSession } from "../../types/guide";
import type { NormalizedPlace } from "../../types/place";
import type { RoutePlan } from "../../types/route";
import { createId } from "../../utils/ids";
import { RouteScorer } from "./RouteScorer";

export class RoutePlanner {
  constructor(private readonly scorer = new RouteScorer()) {}

  planRoutes(places: NormalizedPlace[], session: GuideSession): RoutePlan[] {
    return [...places]
      .map((place) => ({ place, score: this.scorer.scorePlace(place, session) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ place, score }, index) => ({
        id: createId("route"),
        title: `${place.name}に立ち寄る${index + 1}案`,
        concept: "今の条件に合わせた短い街歩き",
        estimatedMinutes: Math.min(session.context.availableMinutes, 30),
        places: [
          {
            place,
            order: 1,
            estimatedStayMinutes: Math.min(20, session.context.availableMinutes),
            reason: "現在の気分や興味に合う可能性があるため",
          },
        ],
        score,
        tags: place.tomoshibiTags ?? place.types,
      }));
  }
}
