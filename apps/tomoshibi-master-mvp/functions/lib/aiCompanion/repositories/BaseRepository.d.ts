import type { DocumentData, DocumentSnapshot, Firestore } from "firebase-admin/firestore";
export type RepositoryResult<T> = Promise<T | null>;
export declare abstract class BaseRepository {
    protected readonly db: Firestore;
    constructor(db?: Firestore);
    protected collectionPath(name: string): string;
    protected fromSnapshot<T extends {
        id: string;
    }>(snapshot: DocumentSnapshot<DocumentData>): T | null;
}
