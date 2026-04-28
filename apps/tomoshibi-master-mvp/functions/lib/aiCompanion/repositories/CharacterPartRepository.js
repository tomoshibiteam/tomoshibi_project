"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterPartRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class CharacterPartRepository extends BaseRepository_1.BaseRepository {
    async getById(partId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("characterParts")).doc(partId).get());
    }
    async list(limit = 100) {
        const snapshot = await this.db.collection(this.collectionPath("characterParts")).limit(limit).get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createIfMissing(part) {
        const ref = this.db.collection(this.collectionPath("characterParts")).doc(part.id);
        const snapshot = await ref.get();
        if (snapshot.exists) {
            return this.fromSnapshot(snapshot) ?? part;
        }
        await ref.set(part);
        return part;
    }
}
exports.CharacterPartRepository = CharacterPartRepository;
//# sourceMappingURL=CharacterPartRepository.js.map