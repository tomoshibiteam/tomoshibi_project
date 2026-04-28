import { OutboundClickRepository } from "../../repositories/OutboundClickRepository";
import type { TrackOutboundClickInput, TrackOutboundClickOutput } from "../../types/api";
import { EventLogService } from "./EventLogService";
export declare class ClickTrackingService {
    private readonly outboundClickRepository;
    private readonly eventLogService;
    constructor(outboundClickRepository?: OutboundClickRepository, eventLogService?: EventLogService);
    track(input: TrackOutboundClickInput): Promise<TrackOutboundClickOutput>;
}
