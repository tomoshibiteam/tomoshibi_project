import type { OutboundClick } from "../types/events";
import { BaseRepository } from "./BaseRepository";
export declare class OutboundClickRepository extends BaseRepository {
    create(click: OutboundClick): Promise<void>;
}
