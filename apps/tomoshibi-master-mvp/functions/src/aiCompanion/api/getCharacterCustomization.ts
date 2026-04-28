import { CharacterAppearanceRepository } from "../repositories/CharacterAppearanceRepository";
import { CharacterPartRepository } from "../repositories/CharacterPartRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import {
  UserCharacterCustomizationRepository,
  userCharacterCustomizationId,
} from "../repositories/UserCharacterCustomizationRepository";
import type { GetCharacterCustomizationInput, GetCharacterCustomizationOutput } from "../types/api";
import type { UserCharacterCustomization } from "../types/character";
import { nowIso } from "../utils/time";

export async function getCharacterCustomization(input: GetCharacterCustomizationInput): Promise<GetCharacterCustomizationOutput> {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  const character = await new CharacterRepository().getById(input.characterId);
  if (!character) throw new Error("Character was not found.");
  const customizationRepository = new UserCharacterCustomizationRepository();
  const customization =
    (await customizationRepository.getById(userCharacterCustomizationId(input.userId, input.characterId))) ??
    createDefaultCustomization(input.userId, input.characterId);
  const [availableParts, defaultAppearance] = await Promise.all([
    new CharacterPartRepository().list(),
    character.defaultAppearanceId ? new CharacterAppearanceRepository().getById(character.defaultAppearanceId) : Promise.resolve(null),
  ]);
  return { customization, availableParts, defaultAppearance };
}

function createDefaultCustomization(userId: string, characterId: string): UserCharacterCustomization {
  const now = nowIso();
  return {
    id: userCharacterCustomizationId(userId, characterId),
    userId,
    characterId,
    selectedParts: {},
    unlockedPartIds: [],
    lastUpdatedAt: now,
    createdAt: now,
  };
}
