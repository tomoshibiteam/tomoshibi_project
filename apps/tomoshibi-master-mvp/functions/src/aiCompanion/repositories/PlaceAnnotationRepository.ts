import type { PlaceAnnotation } from "../types/place";
import { BaseRepository } from "./BaseRepository";

export class PlaceAnnotationRepository extends BaseRepository {
  async listByAreaId(areaId: string, limit = 100): Promise<PlaceAnnotation[]> {
    const snapshot = await this.db.collection(this.collectionPath("placeAnnotations")).where("areaId", "==", areaId).limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PlaceAnnotation[];
  }
}
