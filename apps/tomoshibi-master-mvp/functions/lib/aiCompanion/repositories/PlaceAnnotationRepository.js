"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceAnnotationRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class PlaceAnnotationRepository extends BaseRepository_1.BaseRepository {
    async listByAreaId(areaId, limit = 100) {
        const snapshot = await this.db.collection(this.collectionPath("placeAnnotations")).where("areaId", "==", areaId).limit(limit).get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
}
exports.PlaceAnnotationRepository = PlaceAnnotationRepository;
//# sourceMappingURL=PlaceAnnotationRepository.js.map