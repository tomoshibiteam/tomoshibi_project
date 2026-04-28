import type { GuideSession } from "../../types/guide";
import type { NormalizedPlace } from "../../types/place";
import type { RoutePlan } from "../../types/route";
import { RouteScorer } from "./RouteScorer";
export declare class RoutePlanner {
    private readonly scorer;
    constructor(scorer?: RouteScorer);
    planRoutes(places: NormalizedPlace[], session: GuideSession): RoutePlan[];
}
