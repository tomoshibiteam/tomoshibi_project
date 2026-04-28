"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceCacheRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class PlaceCacheRepository extends BaseRepository_1.BaseRepository {
    async getByProviderPlaceId(provider, providerPlaceId) {
        const snapshot = await this.db.collection(this.collectionPath("placeCache")).doc(cacheDocumentId(provider, providerPlaceId)).get();
        if (!snapshot.exists) {
            return null;
        }
        return snapshot.data();
    }
    async set(place, now) {
        const id = cacheDocumentId(place.provider, place.providerPlaceId);
        const document = {
            ...place,
            id,
            cachedAt: now,
            updatedAt: now,
        };
        await this.db.collection(this.collectionPath("placeCache")).doc(id).set(document);
    }
}
exports.PlaceCacheRepository = PlaceCacheRepository;
function cacheDocumentId(provider, providerPlaceId) {
    return `${provider}_${encodeURIComponent(providerPlaceId)}`;
}
//# sourceMappingURL=PlaceCacheRepository.js.map