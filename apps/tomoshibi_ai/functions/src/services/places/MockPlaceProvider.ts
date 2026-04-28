import type { NormalizedPlace, PlaceDetailsContext, PlaceSearchContext } from "../../types/place";
import type { PlaceProvider } from "./PlaceProvider";

export class MockPlaceProvider implements PlaceProvider {
  async searchNearby(context: PlaceSearchContext): Promise<NormalizedPlace[]> {
    return [
      {
        provider: "mock",
        providerPlaceId: "mock-quiet-park",
        name: "静かな小さな公園",
        lat: context.origin.lat + 0.001,
        lng: context.origin.lng + 0.001,
        types: ["park"],
        rating: 4.2,
        userRatingCount: 32,
        openNow: true,
        tomoshibiTags: ["quiet", "nature", "short_walk"],
      },
      {
        provider: "mock",
        providerPlaceId: "mock-cafe",
        name: "路地裏のカフェ",
        lat: context.origin.lat + 0.0015,
        lng: context.origin.lng - 0.001,
        types: ["cafe"],
        rating: 4.4,
        userRatingCount: 58,
        openNow: true,
        tomoshibiTags: ["cafe", "coffee", "relax"],
      },
    ];
  }

  async getDetails(context: PlaceDetailsContext): Promise<NormalizedPlace | null> {
    const places = await this.searchNearby({
      origin: { lat: 0, lng: 0 },
      radiusMeters: 1200,
      languageCode: context.languageCode,
    });
    return places.find((place) => place.providerPlaceId === context.providerPlaceId) ?? null;
  }
}
