import type { Relationship } from "../types/relationship";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class RelationshipRepository extends BaseRepository {
  async getById(relationshipId: string): RepositoryResult<Relationship> {
    return this.fromSnapshot<Relationship>(
      await this.db.collection(this.collectionPath("relationships")).doc(relationshipId).get(),
    );
  }

  async upsert(relationship: Relationship): Promise<void> {
    await this.db.collection(this.collectionPath("relationships")).doc(relationship.id).set(relationship, { merge: true });
  }
}
