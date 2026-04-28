import type { GuideSession } from "../../types/guide";
import type { NormalizedPlace } from "../../types/place";
export declare class RouteScorer {
    scorePlace(place: NormalizedPlace, session: GuideSession): number;
}
