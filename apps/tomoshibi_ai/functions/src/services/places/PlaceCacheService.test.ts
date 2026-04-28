import { describe, expect, it, vi } from "vitest";
import type { NormalizedPlace, PlaceCacheDocument, PlaceProviderName } from "../../types/place";
import { PlaceCacheService } from "./PlaceCacheService";

class FakePlaceCacheRepository {
  readonly set = vi.fn();
  readonly getByProviderPlaceId = vi.fn(async (_provider: PlaceProviderName, _providerPlaceId: string): Promise<PlaceCacheDocument | null> => null);
}

const mockPlace: NormalizedPlace = {
  provider: "mock",
  providerPlaceId: "mock-cafe",
  name: "路地裏のカフェ",
  lat: 35,
  lng: 139,
  types: ["cafe"],
};

describe("PlaceCacheService", () => {
  it("stores cacheable provider places", async () => {
    const repository = new FakePlaceCacheRepository();
    const service = new PlaceCacheService(repository);

    await service.set(mockPlace);

    expect(repository.set).toHaveBeenCalledWith(mockPlace, expect.any(String));
  });

  it("does not persist Google Places content", async () => {
    const repository = new FakePlaceCacheRepository();
    const service = new PlaceCacheService(repository);

    await service.set({ ...mockPlace, provider: "google_places", providerPlaceId: "ChIJ-test" });
    const cached = await service.get("google_places", "ChIJ-test");

    expect(repository.set).not.toHaveBeenCalled();
    expect(repository.getByProviderPlaceId).not.toHaveBeenCalled();
    expect(cached).toBeNull();
  });
});
