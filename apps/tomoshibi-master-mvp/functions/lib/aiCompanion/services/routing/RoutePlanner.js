"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutePlanner = void 0;
const ids_1 = require("../../utils/ids");
const RouteScorer_1 = require("./RouteScorer");
class RoutePlanner {
    scorer;
    constructor(scorer = new RouteScorer_1.RouteScorer()) {
        this.scorer = scorer;
    }
    planRoutes(places, session) {
        return [...places]
            .map((place) => ({ place, score: this.scorer.scorePlace(place, session) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ place, score }, index) => ({
            id: (0, ids_1.createId)("route"),
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
exports.RoutePlanner = RoutePlanner;
//# sourceMappingURL=RoutePlanner.js.map