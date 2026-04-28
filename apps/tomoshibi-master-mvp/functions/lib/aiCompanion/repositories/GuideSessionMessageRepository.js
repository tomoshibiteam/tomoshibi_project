"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideSessionMessageRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class GuideSessionMessageRepository extends BaseRepository_1.BaseRepository {
    async create(message) {
        await this.db
            .collection(this.collectionPath("guideSessions"))
            .doc(message.sessionId)
            .collection("messages")
            .doc(message.id)
            .set(message);
    }
    async listBySessionId(sessionId, limit = 100) {
        const snapshot = await this.db
            .collection(this.collectionPath("guideSessions"))
            .doc(sessionId)
            .collection("messages")
            .orderBy("createdAt", "asc")
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
}
exports.GuideSessionMessageRepository = GuideSessionMessageRepository;
//# sourceMappingURL=GuideSessionMessageRepository.js.map