"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppFirestore = getAppFirestore;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
let firestoreInstance;
function getAppFirestore() {
    if (!firestoreInstance) {
        if ((0, app_1.getApps)().length === 0) {
            (0, app_1.initializeApp)();
        }
        firestoreInstance = (0, firestore_1.getFirestore)();
        firestoreInstance.settings({
            ignoreUndefinedProperties: true,
        });
    }
    return firestoreInstance;
}
//# sourceMappingURL=firebase.js.map