import { CharacterPartRepository } from "../repositories/CharacterPartRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import {
  UserCharacterCustomizationRepository,
  userCharacterCustomizationId,
} from "../repositories/UserCharacterCustomizationRepository";
import type { UpdateCharacterCustomizationInput, UpdateCharacterCustomizationOutput } from "../types/api";
import type { CharacterPartSelection, UserCharacterCustomization } from "../types/character";
import { nowIso } from "../utils/time";

export async function updateCharacterCustomization(input: UpdateCharacterCustomizationInput): Promise<UpdateCharacterCustomizationOutput> {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  const character = await new CharacterRepository().getById(input.characterId);
  if (!character) throw new Error("Character was not found.");
  const availableParts = await new CharacterPartRepository().list();
  validateSelectedParts(input.selectedParts, new Set(availableParts.map((part) => part.id)));
  const repository = new UserCharacterCustomizationRepository();
  const existing = await repository.getById(userCharacterCustomizationId(input.userId, input.characterId));
  const now = nowIso();
  const customization: UserCharacterCustomization = {
    id: userCharacterCustomizationId(input.userId, input.characterId),
    userId: input.userId,
    characterId: input.characterId,
    appearanceName: input.appearanceName,
    selectedParts: input.selectedParts,
    unlockedPartIds: existing?.unlockedPartIds ?? availableParts.filter((part) => part.unlockCondition?.type === "free").map((part) => part.id),
    createdAt: existing?.createdAt ?? now,
    lastUpdatedAt: now,
  };
  await repository.upsert(customization);
  return { customization };
}

function validateSelectedParts(selectedParts: CharacterPartSelection, availablePartIds: Set<string>): void {
  Object.values(selectedParts).forEach((partId) => {
    if (partId && !availablePartIds.has(partId)) {
      throw new Error(`Character part was not found: ${partId}`);
    }
  });
}
