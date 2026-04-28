import { AnalyticsEventRepository } from "../../repositories/AnalyticsEventRepository";
import type { AnalyticsEventName } from "../../types/events";
import { createId } from "../../utils/ids";
import { nowIso } from "../../utils/time";

export type EventLogInput = {
  name: AnalyticsEventName;
  userId?: string;
  sessionId?: string;
  characterId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export class EventLogService {
  constructor(private readonly analyticsEventRepository = new AnalyticsEventRepository()) {}

  async log(input: EventLogInput): Promise<void> {
    await this.analyticsEventRepository.create({
      id: createId("event"),
      name: input.name,
      userId: input.userId,
      sessionId: input.sessionId,
      characterId: input.characterId,
      metadata: input.metadata,
      createdAt: input.createdAt ?? nowIso(),
    });
  }
}
