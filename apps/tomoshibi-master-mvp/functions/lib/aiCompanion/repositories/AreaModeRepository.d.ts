import type { AreaMode } from "../types/place";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class AreaModeRepository extends BaseRepository {
    getById(areaId: string): RepositoryResult<AreaMode>;
}
