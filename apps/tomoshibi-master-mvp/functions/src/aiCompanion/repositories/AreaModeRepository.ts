import type { AreaMode } from "../types/place";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class AreaModeRepository extends BaseRepository {
  async getById(areaId: string): RepositoryResult<AreaMode> {
    return this.fromSnapshot<AreaMode>(await this.db.collection(this.collectionPath("areaModes")).doc(areaId).get());
  }
}
