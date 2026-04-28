import type { NormalizedPlace, PlaceCacheDocument, PlaceProviderName } from "../types/place";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class PlaceCacheRepository extends BaseRepository {
  async getByProviderPlaceId(provider: PlaceProviderName, providerPlaceId: string): RepositoryResult<PlaceCacheDocument> {
    const snapshot = await this.db.collection(this.collectionPath("placeCache")).doc(cacheDocumentId(provider, providerPlaceId)).get();
    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as PlaceCacheDocument;
  }

  async set(place: NormalizedPlace, now: string): Promise<void> {
    const id = cacheDocumentId(place.provider, place.providerPlaceId);
    const document: PlaceCacheDocument = {
      ...place,
      id,
      cachedAt: now,
      updatedAt: now,
    };
    await this.db.collection(this.collectionPath("placeCache")).doc(id).set(document);
  }
}

function cacheDocumentId(provider: PlaceProviderName, providerPlaceId: string): string {
  return `${provider}_${encodeURIComponent(providerPlaceId)}`;
}
