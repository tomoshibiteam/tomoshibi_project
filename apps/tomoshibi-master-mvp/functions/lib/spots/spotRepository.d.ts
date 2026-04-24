import { type Firestore } from "firebase-admin/firestore";
import type { SpotListFilters, SpotRecord, SpotSearchFilters } from "./spotTypes";
export declare const SPOTS_COLLECTION = "spots";
type TimestampFactory = () => unknown;
export type SaveSpotParams = {
    db: Firestore;
    spot: Omit<SpotRecord, "createdAt" | "updatedAt">;
    mode?: "create" | "update" | "upsert";
    timestampFactory?: TimestampFactory;
};
export declare function saveSpot(params: SaveSpotParams): Promise<string>;
export declare function getSpotDocById(params: {
    db: Firestore;
    spotId: string;
}): Promise<SpotRecord | null>;
export declare function deleteSpotDocById(params: {
    db: Firestore;
    spotId: string;
}): Promise<void>;
export declare function listSpotsWithFilters(params: {
    db: Firestore;
    filters: SpotListFilters;
}): Promise<SpotRecord[]>;
export declare function searchSpotsWithFilters(params: {
    db: Firestore;
    filters: SpotSearchFilters;
}): Promise<SpotRecord[]>;
export {};
