"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerLinkRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class PartnerLinkRepository extends BaseRepository_1.BaseRepository {
    async getById(partnerLinkId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("partnerLinks")).doc(partnerLinkId).get());
    }
}
exports.PartnerLinkRepository = PartnerLinkRepository;
//# sourceMappingURL=PartnerLinkRepository.js.map