"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    async getById(userId) {
        return this.fromSnapshot(await this.db.collection(this.collectionPath("users")).doc(userId).get());
    }
    async create(user) {
        await this.db.collection(this.collectionPath("users")).doc(user.id).set(user);
    }
    async update(user) {
        await this.db.collection(this.collectionPath("users")).doc(user.id).set(user, { merge: true });
    }
    async createIfMissing(user) {
        const ref = this.db.collection(this.collectionPath("users")).doc(user.id);
        const snapshot = await ref.get();
        if (snapshot.exists) {
            return this.fromSnapshot(snapshot) ?? user;
        }
        await ref.set(user);
        return user;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map