"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterAppearanceRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class CharacterAppearanceRepository extends BaseRepository_1.BaseRepository {
    async getById(appearanceId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("characterAppearances")).doc(appearanceId).get());
    }
    async listByCharacterId(characterId, limit = 20) {
        const snapshot = await this.db
            .collection(this.collectionPath("characterAppearances"))
            .where("characterId", "==", characterId)
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createIfMissing(appearance) {
        const ref = this.db.collection(this.collectionPath("characterAppearances")).doc(appearance.id);
        const snapshot = await ref.get();
        if (snapshot.exists) {
            return this.fromSnapshot(snapshot) ?? appearance;
        }
        await ref.set(appearance);
        return appearance;
    }
}
exports.CharacterAppearanceRepository = CharacterAppearanceRepository;
//# sourceMappingURL=CharacterAppearanceRepository.js.map