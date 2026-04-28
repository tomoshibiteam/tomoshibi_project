import { JourneyMemoryRepository } from "../repositories/JourneyMemoryRepository";
import type { ListJourneyMemoriesInput, ListJourneyMemoriesOutput } from "../types/api";

export async function listJourneyMemories(input: ListJourneyMemoriesInput): Promise<ListJourneyMemoriesOutput> {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  const limit = typeof input.limit === "number" && input.limit > 0 ? Math.min(Math.floor(input.limit), 30) : 10;
  const memories = await new JourneyMemoryRepository().listRecentByUserAndCharacter(input.userId, input.characterId, limit);
  return { memories };
}
