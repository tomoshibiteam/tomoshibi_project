import type { PlaceAnnotation } from "../types/place";
import { BaseRepository } from "./BaseRepository";
export declare class PlaceAnnotationRepository extends BaseRepository {
    listByAreaId(areaId: string, limit?: number): Promise<PlaceAnnotation[]>;
}
