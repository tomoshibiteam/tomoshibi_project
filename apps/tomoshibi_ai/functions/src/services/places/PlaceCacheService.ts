import { PlaceCacheRepository } from "../../repositories/PlaceCacheRepository";
import type { NormalizedPlace, PlaceCacheDocument } from "../../types/place";
import type { PlaceProviderName } from "../../types/place";
import { nowIso } from "../../utils/time";

type PlaceCacheStore = {
  getByProviderPlaceId(provider: PlaceProviderName, providerPlaceId: string): Promise<PlaceCacheDocument | null>;
  set(place: NormalizedPlace, now: string): Promise<void>;
};

export class PlaceCacheService {
  constructor(private readonly repository: PlaceCacheStore = new PlaceCacheRepository()) {}

  async get(provider: PlaceProviderName, providerPlaceId: string): Promise<NormalizedPlace | null> {
    if (!isCacheableProvider(provider)) {
      return null;
    }
    return this.repository.getByProviderPlaceId(provider, providerPlaceId);
  }

  async set(place: NormalizedPlace): Promise<void> {
    if (!isCacheableProvider(place.provider)) {
      return;
    }
    await this.repository.set(place, nowIso());
  }

  async setMany(places: NormalizedPlace[]): Promise<void> {
    await Promise.all(places.map((place) => this.set(place)));
  }
}

function isCacheableProvider(provider: PlaceProviderName): boolean {
  // Google Places content has storage restrictions. Keep Google data out of
  // persistent cache unless the policy is reviewed for the exact use case.
  return provider === "mock" || provider === "own_db";
}
