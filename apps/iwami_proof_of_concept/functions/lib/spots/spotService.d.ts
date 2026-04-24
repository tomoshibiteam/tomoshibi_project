import type { Firestore } from "firebase-admin/firestore";
import type { SpotListFilters, SpotPrimaryCategory, SpotRecord, SpotSearchFilters } from "./spotTypes";
export declare function createSpot(params: {
    db?: Firestore;
    rawInput: unknown;
}): Promise<SpotRecord>;
export declare function updateSpot(params: {
    db?: Firestore;
    spotId: string;
    patch: unknown;
}): Promise<SpotRecord>;
export declare function getSpotById(params: {
    db?: Firestore;
    spotId: string;
}): Promise<SpotRecord | null>;
export declare function deleteSpot(params: {
    db?: Firestore;
    spotId: string;
}): Promise<void>;
export declare function listSpots(params: {
    db?: Firestore;
    filters?: SpotListFilters;
}): Promise<SpotRecord[]>;
export declare function listSpotsByCategory(params: {
    db?: Firestore;
    category: SpotPrimaryCategory;
    filters?: Omit<SpotListFilters, "primaryCategory">;
}): Promise<SpotRecord[]>;
export declare function searchSpots(params: {
    db?: Firestore;
    filters: SpotSearchFilters;
}): Promise<SpotRecord[]>;
