"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCharacterCustomizationRepository = void 0;
exports.userCharacterCustomizationId = userCharacterCustomizationId;
const BaseRepository_1 = require("./BaseRepository");
class UserCharacterCustomizationRepository extends BaseRepository_1.BaseRepository {
    async getById(customizationId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("userCharacterCustomizations")).doc(customizationId).get());
    }
    async upsert(customization) {
        await this.db.collection(this.collectionPath("userCharacterCustomizations")).doc(customization.id).set(customization, { merge: true });
    }
}
exports.UserCharacterCustomizationRepository = UserCharacterCustomizationRepository;
function userCharacterCustomizationId(userId, characterId) {
    return `${userId}_${characterId}`;
}
//# sourceMappingURL=UserCharacterCustomizationRepository.js.map