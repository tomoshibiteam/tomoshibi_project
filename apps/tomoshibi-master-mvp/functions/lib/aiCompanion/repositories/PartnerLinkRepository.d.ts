import type { PartnerLink } from "../types/partner";
import { BaseRepository, type RepositoryResult } from "./BaseRepository";
export declare class PartnerLinkRepository extends BaseRepository {
    getById(partnerLinkId: string): RepositoryResult<PartnerLink>;
}
