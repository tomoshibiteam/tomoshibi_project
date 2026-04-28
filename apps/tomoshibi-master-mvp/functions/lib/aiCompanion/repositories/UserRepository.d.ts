import type { User } from "../types/user";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class UserRepository extends BaseRepository {
    getById(userId: string): RepositoryResult<User>;
    create(user: User): Promise<void>;
    update(user: User): Promise<void>;
    createIfMissing(user: User): Promise<User>;
}
