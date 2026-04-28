"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideSuggestionRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class GuideSuggestionRepository extends BaseRepository_1.BaseRepository {
    async create(suggestion) {
        await this.db
            .collection(this.collectionPath("guideSessions"))
            .doc(suggestion.sessionId)
            .collection("suggestions")
            .doc(suggestion.id)
            .set(suggestion);
    }
    async getLatestBySessionId(sessionId) {
        const snapshot = await this.db
            .collection(this.collectionPath("guideSessions"))
            .doc(sessionId)
            .collection("suggestions")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();
        const [document] = snapshot.docs;
        return document ? { id: document.id, ...document.data() } : null;
    }
}
exports.GuideSuggestionRepository = GuideSuggestionRepository;
//# sourceMappingURL=GuideSuggestionRepository.js.map