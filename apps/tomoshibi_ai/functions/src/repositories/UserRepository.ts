import type { User } from "../types/user";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class UserRepository extends BaseRepository {
  async getById(userId: string): RepositoryResult<User> {
    return this.fromSnapshot<User>(await this.db.collection(this.collectionPath("users")).doc(userId).get());
  }

  async create(user: User): Promise<void> {
    await this.db.collection(this.collectionPath("users")).doc(user.id).set(user);
  }

  async update(user: User): Promise<void> {
    await this.db.collection(this.collectionPath("users")).doc(user.id).set(user, { merge: true });
  }

  async createIfMissing(user: User): Promise<User> {
    const ref = this.db.collection(this.collectionPath("users")).doc(user.id);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return this.fromSnapshot<User>(snapshot) ?? user;
    }
    await ref.set(user);
    return user;
  }
}
