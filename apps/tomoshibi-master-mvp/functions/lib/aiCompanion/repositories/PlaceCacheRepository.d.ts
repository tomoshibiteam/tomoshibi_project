import type { NormalizedPlace, PlaceCacheDocument, PlaceProviderName } from "../types/place";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class PlaceCacheRepository extends BaseRepository {
    getByProviderPlaceId(provider: PlaceProviderName, providerPlaceId: string): RepositoryResult<PlaceCacheDocument>;
    set(place: NormalizedPlace, now: string): Promise<void>;
}
