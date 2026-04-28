import type { NormalizedPlace } from "./place";
export type RoutePlan = {
    id: string;
    title: string;
    concept: string;
    estimatedMinutes: number;
    totalDistanceMeters?: number;
    places: {
        place: NormalizedPlace;
        order: number;
        estimatedStayMinutes: number;
        reason: string;
    }[];
    score: number;
    tags: string[];
};
