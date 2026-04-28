"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackEventRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class FeedbackEventRepository extends BaseRepository_1.BaseRepository {
    async create(event) {
        await this.db.collection(this.collectionPath("feedbackEvents")).doc(event.id).set(event);
    }
    async listBySessionId(sessionId, limit = 100) {
        const snapshot = await this.db
            .collection(this.collectionPath("feedbackEvents"))
            .where("sessionId", "==", sessionId)
            .orderBy("createdAt", "asc")
            .limit(limit)
            .get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
}
exports.FeedbackEventRepository = FeedbackEventRepository;
//# sourceMappingURL=FeedbackEventRepository.js.map