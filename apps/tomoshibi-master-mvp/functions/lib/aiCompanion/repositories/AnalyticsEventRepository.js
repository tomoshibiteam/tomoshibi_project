"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEventRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class AnalyticsEventRepository extends BaseRepository_1.BaseRepository {
    async create(event) {
        await this.db.collection(this.collectionPath("analyticsEvents")).doc(event.id).set(event);
    }
}
exports.AnalyticsEventRepository = AnalyticsEventRepository;
//# sourceMappingURL=AnalyticsEventRepository.js.map