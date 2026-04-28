"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const firebase_1 = require("../utils/firebase");
class BaseRepository {
    db;
    constructor(db) {
        this.db = db ?? (0, firebase_1.getAppFirestore)();
    }
    collectionPath(name) {
        return name;
    }
    fromSnapshot(snapshot) {
        if (!snapshot.exists) {
            return null;
        }
        return {
            id: snapshot.id,
            ...snapshot.data(),
        };
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map