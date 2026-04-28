import type { PartnerLink } from "../types/partner";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";

export class PartnerLinkRepository extends BaseRepository {
  async getById(partnerLinkId: string): RepositoryResult<PartnerLink> {
    return this.fromSnapshot<PartnerLink>(
      await this.db.collection(this.collectionPath("partnerLinks")).doc(partnerLinkId).get(),
    );
  }
}
