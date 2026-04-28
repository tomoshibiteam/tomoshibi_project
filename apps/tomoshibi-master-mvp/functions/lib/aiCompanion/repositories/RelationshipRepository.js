"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class RelationshipRepository extends BaseRepository_1.BaseRepository {
    async getById(relationshipId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("relationships")).doc(relationshipId).get());
    }
    async upsert(relationship) {
        await this.db.collection(this.collectionPath("relationships")).doc(relationship.id).set(relationship, { merge: true });
    }
}
exports.RelationshipRepository = RelationshipRepository;
//# sourceMappingURL=RelationshipRepository.js.map