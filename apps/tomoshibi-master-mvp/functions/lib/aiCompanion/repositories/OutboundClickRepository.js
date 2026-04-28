"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundClickRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class OutboundClickRepository extends BaseRepository_1.BaseRepository {
    async create(click) {
        await this.db.collection(this.collectionPath("outboundClicks")).doc(click.id).set(click);
    }
}
exports.OutboundClickRepository = OutboundClickRepository;
//# sourceMappingURL=OutboundClickRepository.js.map