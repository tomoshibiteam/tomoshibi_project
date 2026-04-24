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
    source: "approximate";
    mode: RouteMatrixMode;
    durationsMinutes: Record<string, Record<string, number | null>>;
    distancesMeters: Record<string, Record<string, number | null>>;
    unresolvedPairs: RouteMatrixPairIssue[];
};
export declare function computeApproximateRouteMatrix(params: {
    locations: RouteMatrixLocation[];
    mode: RouteMatrixMode;
}): Promise<RouteMatrixResult>;
