import type { NormalizedPlace, PlaceCacheDocument } from "../../types/place";
import type { PlaceProviderName } from "../../types/place";
type PlaceCacheStore = {
    getByProviderPlaceId(provider: PlaceProviderName, providerPlaceId: string): Promise<PlaceCacheDocument | null>;
    set(place: NormalizedPlace, now: string): Promise<void>;
};
export declare class PlaceCacheService {
    private readonly repository;
    constructor(repository?: PlaceCacheStore);
    get(provider: PlaceProviderName, providerPlaceId: string): Promise<NormalizedPlace | null>;
    set(place: NormalizedPlace): Promise<void>;
    setMany(places: NormalizedPlace[]): Promise<void>;
}
export {};
