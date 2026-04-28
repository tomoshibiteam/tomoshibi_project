"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaModeRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class AreaModeRepository extends BaseRepository_1.BaseRepository {
    async getById(areaId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("areaModes")).doc(areaId).get());
    }
}
exports.AreaModeRepository = AreaModeRepository;
//# sourceMappingURL=AreaModeRepository.js.map