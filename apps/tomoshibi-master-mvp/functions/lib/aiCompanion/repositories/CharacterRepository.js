"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class CharacterRepository extends BaseRepository_1.BaseRepository {
    async getById(characterId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("characters")).doc(characterId).get());
    }
    async list(limit = 20) {
        const snapshot = await this.db.collection(this.collectionPath("characters")).limit(limit).get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createIfMissing(character) {
        const ref = this.db.collection(this.collectionPath("characters")).doc(character.id);
        const snapshot = await ref.get();
        if (snapshot.exists) {
            return this.fromSnapshot(snapshot) ?? character;
        }
        await ref.set(character);
        return character;
    }
}
exports.CharacterRepository = CharacterRepository;
//# sourceMappingURL=CharacterRepository.js.map