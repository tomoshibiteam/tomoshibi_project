import type { Relationship } from "../types/relationship";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class RelationshipRepository extends BaseRepository {
    getById(relationshipId: string): RepositoryResult<Relationship>;
    upsert(relationship: Relationship): Promise<void>;
}
