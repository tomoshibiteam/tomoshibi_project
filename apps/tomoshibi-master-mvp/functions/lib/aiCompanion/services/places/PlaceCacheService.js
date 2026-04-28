"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceCacheService = void 0;
const PlaceCacheRepository_1 = require("../../repositories/PlaceCacheRepository");
const time_1 = require("../../utils/time");
class PlaceCacheService {
    repository;
    constructor(repository = new PlaceCacheRepository_1.PlaceCacheRepository()) {
        this.repository = repository;
    }
    async get(provider, providerPlaceId) {
        if (!isCacheableProvider(provider)) {
            return null;
        }
        return this.repository.getByProviderPlaceId(provider, providerPlaceId);
    }
    async set(place) {
        if (!isCacheableProvider(place.provider)) {
            return;
        }
        await this.repository.set(place, (0, time_1.nowIso)());
    }
    async setMany(places) {
        await Promise.all(places.map((place) => this.set(place)));
    }
}
exports.PlaceCacheService = PlaceCacheService;
function isCacheableProvider(provider) {
    // Google Places content has storage restrictions. Keep Google data out of
    // persistent cache unless the policy is reviewed for the exact use case.
    return provider === "mock" || provider === "own_db";
}
//# sourceMappingURL=PlaceCacheService.js.map