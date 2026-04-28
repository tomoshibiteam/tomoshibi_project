"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyMemoryRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class JourneyMemoryRepository extends BaseRepository_1.BaseRepository {
    async getById(journeyId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("journeyMemories")).doc(journeyId).get());
    }
    async create(memory) {
        await this.db.collection(this.collectionPath("journeyMemories")).doc(memory.id).set(memory);
    }
    async listRecentByUserAndCharacter(userId, characterId, limit = 5) {
        const snapshot = await this.db
            .collection(this.collectionPath("journeyMemories"))
            .where("userId", "==", userId)
            .limit(30)
            .get();
        return snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((memory) => memory.characterId === characterId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
}
exports.JourneyMemoryRepository = JourneyMemoryRepository;
//# sourceMappingURL=JourneyMemoryRepository.js.map