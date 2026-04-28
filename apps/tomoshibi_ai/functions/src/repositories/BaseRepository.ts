import type { DocumentData, DocumentSnapshot, Firestore } from "firebase-admin/firestore";
import { getAppFirestore } from "../utils/firebase";

export type RepositoryResult<T> = Promise<T | null>;

export abstract class BaseRepository {
  protected readonly db: Firestore;

  constructor(db?: Firestore) {
    this.db = db ?? getAppFirestore();
  }

  protected collectionPath(name: string): string {
    return name;
  }

  protected fromSnapshot<T extends { id: string }>(snapshot: DocumentSnapshot<DocumentData>): T | null {
    if (!snapshot.exists) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as T;
  }
}
