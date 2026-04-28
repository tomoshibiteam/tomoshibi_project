"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideSessionRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class GuideSessionRepository extends BaseRepository_1.BaseRepository {
    async getById(sessionId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("guideSessions")).doc(sessionId).get());
    }
    async create(session) {
        await this.db.collection(this.collectionPath("guideSessions")).doc(session.id).set(session);
    }
    async update(session) {
        await this.db.collection(this.collectionPath("guideSessions")).doc(session.id).set(session, { merge: true });
    }
    async getLatestActiveByUserAndCharacter(userId, characterId) {
        const snapshot = await this.db
            .collection(this.collectionPath("guideSessions"))
            .where("userId", "==", userId)
            .where("characterId", "==", characterId)
            .where("status", "==", "active")
            .limit(20)
            .get();
        const sessions = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        return sessions[0] ?? null;
    }
}
exports.GuideSessionRepository = GuideSessionRepository;
//# sourceMappingURL=GuideSessionRepository.js.map