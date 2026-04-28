"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPlaceProvider = void 0;
class MockPlaceProvider {
    async searchNearby(context) {
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
    async getDetails(context) {
        const places = await this.searchNearby({
            origin: { lat: 0, lng: 0 },
            radiusMeters: 1200,
            languageCode: context.languageCode,
        });
        return places.find((place) => place.providerPlaceId === context.providerPlaceId) ?? null;
    }
}
exports.MockPlaceProvider = MockPlaceProvider;
//# sourceMappingURL=MockPlaceProvider.js.map