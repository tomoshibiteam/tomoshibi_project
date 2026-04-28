import { GuideSessionMessageRepository } from "../repositories/GuideSessionMessageRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import type { ListGuideSessionMessagesInput, ListGuideSessionMessagesOutput } from "../types/api";

export async function listGuideSessionMessages(
  input: ListGuideSessionMessagesInput,
): Promise<ListGuideSessionMessagesOutput> {
  if (!input.userId || !input.sessionId) throw new Error("userId and sessionId are required.");
  const session = await new GuideSessionRepository().getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  const limit = typeof input.limit === "number" && input.limit > 0 ? Math.min(Math.floor(input.limit), 100) : 50;
  const messages = await new GuideSessionMessageRepository().listBySessionId(input.sessionId, limit);
  return { messages };
}
