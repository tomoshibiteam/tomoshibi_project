import type { OutboundClick } from "../types/events";
import { BaseRepository } from "./BaseRepository";

export class OutboundClickRepository extends BaseRepository {
  async create(click: OutboundClick): Promise<void> {
    await this.db.collection(this.collectionPath("outboundClicks")).doc(click.id).set(click);
  }
}
