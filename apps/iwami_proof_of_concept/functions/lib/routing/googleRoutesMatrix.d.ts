export type RouteMatrixMode = "walk" | "rental_cycle" | "car" | "bus" | "train";
export type RouteMatrixLocation = {
    id: string;
    lat: number;
    lng: number;
};
export type RouteMatrixPairIssue = {
    fromId: string;
    toId: string;
    reason: string;
};
export type RouteMatrixResult = {
    source: "google_routes_api";
    mode: RouteMatrixMode;
    durationsMinutes: Record<string, Record<string, number | null>>;
    distancesMeters: Record<string, Record<string, number | null>>;
    unresolvedPairs: RouteMatrixPairIssue[];
};
export declare function computeRouteMatrix(params: {
    locations: RouteMatrixLocation[];
    mode: RouteMatrixMode;
    departureTime?: string | null;
    apiKey?: string;
}): Promise<RouteMatrixResult>;
