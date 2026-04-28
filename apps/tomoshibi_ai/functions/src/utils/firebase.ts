import { getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | undefined;

export function getAppFirestore(): Firestore {
  if (!firestoreInstance) {
    if (getApps().length === 0) {
      initializeApp();
    }

    firestoreInstance = getFirestore();
    firestoreInstance.settings({
      ignoreUndefinedProperties: true,
    });
  }

  return firestoreInstance;
}
