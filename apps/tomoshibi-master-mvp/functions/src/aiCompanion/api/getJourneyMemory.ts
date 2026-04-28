import { JourneyMemoryRepository } from "../repositories/JourneyMemoryRepository";
import type { GetJourneyMemoryInput, GetJourneyMemoryOutput } from "../types/api";

export async function getJourneyMemory(input: GetJourneyMemoryInput): Promise<GetJourneyMemoryOutput> {
  if (!input.userId || !input.journeyId) throw new Error("userId and journeyId are required.");
  const memory = await new JourneyMemoryRepository().getById(input.journeyId);
  if (!memory) throw new Error("JourneyMemory was not found.");
  if (memory.userId !== input.userId) throw new Error("JourneyMemory does not belong to the requested user.");
  if (input.characterId && memory.characterId !== input.characterId) {
    throw new Error("JourneyMemory does not belong to the requested character.");
  }
  return { memory };
}
