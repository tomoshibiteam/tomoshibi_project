"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteScorer = void 0;
const moodTagMap = {
    "落ち着きたい": ["quiet", "park", "cafe", "nature"],
    "歴史を知りたい": ["history", "museum", "shrine", "landmark"],
    "写真を撮りたい": ["scenic", "view", "architecture"],
    "カフェに行きたい": ["cafe", "coffee", "relax"],
    "軽く歩きたい": ["short_walk", "nearby", "easy"],
    "夜に楽しみたい": ["night", "restaurant", "view"],
};
class RouteScorer {
    scorePlace(place, session) {
        const moodTags = session.context.mood ? moodTagMap[session.context.mood] ?? [] : [];
        const placeTags = new Set([...place.types, ...(place.tomoshibiTags ?? [])]);
        const moodScore = moodTags.filter((tag) => placeTags.has(tag)).length * 10;
        const interestScore = (session.context.interests ?? []).filter((interest) => placeTags.has(interest)).length * 8;
        const ratingScore = place.rating ? Math.min(place.rating, 5) : 0;
        const openScore = place.openNow === false ? -10 : 3;
        return moodScore + interestScore + ratingScore + openScore;
    }
}
exports.RouteScorer = RouteScorer;
//# sourceMappingURL=RouteScorer.js.map