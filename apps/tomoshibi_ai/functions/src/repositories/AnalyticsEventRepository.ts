import type { AnalyticsEvent } from "../types/events";
import { BaseRepository } from "./BaseRepository";

export class AnalyticsEventRepository extends BaseRepository {
  async create(event: AnalyticsEvent): Promise<void> {
    await this.db.collection(this.collectionPath("analyticsEvents")).doc(event.id).set(event);
  }
}
