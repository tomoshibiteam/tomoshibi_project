import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { ClickTrackingService } from "../services/tracking/ClickTrackingService";
import type { TrackOutboundClickInput, TrackOutboundClickOutput } from "../types/api";

export async function trackOutboundClick(input: TrackOutboundClickInput): Promise<TrackOutboundClickOutput> {
  if (!input.userId || !input.sessionId || !input.url) throw new Error("userId, sessionId, and url are required.");
  const url = new URL(input.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("url must be http or https.");
  const session = await new GuideSessionRepository().getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  return new ClickTrackingService().track(input);
}
