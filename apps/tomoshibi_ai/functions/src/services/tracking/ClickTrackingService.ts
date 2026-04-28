import { OutboundClickRepository } from "../../repositories/OutboundClickRepository";
import type { TrackOutboundClickInput, TrackOutboundClickOutput } from "../../types/api";
import { createId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { EventLogService } from "./EventLogService";

export class ClickTrackingService {
  constructor(
    private readonly outboundClickRepository = new OutboundClickRepository(),
    private readonly eventLogService = new EventLogService(),
  ) {}

  async track(input: TrackOutboundClickInput): Promise<TrackOutboundClickOutput> {
    const now = nowIso();
    const clickId = createId("click");
    await this.outboundClickRepository.create(
      omitUndefined({
        id: clickId,
        ...input,
        createdAt: now,
      }),
    );
    await this.eventLogService.log({
      name: "outbound_clicked",
      userId: input.userId,
      sessionId: input.sessionId,
      metadata: omitUndefined({ clickId, placeId: input.placeId, partnerLinkId: input.partnerLinkId, source: input.source }),
      createdAt: now,
    });
    return { redirectUrl: input.url };
  }
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)) as T;
}
