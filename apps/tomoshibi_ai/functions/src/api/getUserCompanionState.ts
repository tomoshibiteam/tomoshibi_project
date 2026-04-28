import { CharacterAppearanceRepository } from "../repositories/CharacterAppearanceRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import {
  UserCharacterCustomizationRepository,
  userCharacterCustomizationId,
} from "../repositories/UserCharacterCustomizationRepository";
import { UserRepository } from "../repositories/UserRepository";
import type { GetUserCompanionStateInput, GetUserCompanionStateOutput } from "../types/api";

export async function getUserCompanionState(input: GetUserCompanionStateInput): Promise<GetUserCompanionStateOutput> {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  const user = await new UserRepository().getById(input.userId);
  if (!user) throw new Error("User was not found.");
  const character = await new CharacterRepository().getById(input.characterId);
  if (!character) throw new Error("Character was not found.");
  const relationship = await new RelationshipRepository().getById(`${input.userId}_${input.characterId}`);
  const [customization, defaultAppearance] = await Promise.all([
    new UserCharacterCustomizationRepository().getById(userCharacterCustomizationId(input.userId, input.characterId)),
    character.defaultAppearanceId ? new CharacterAppearanceRepository().getById(character.defaultAppearanceId) : Promise.resolve(null),
  ]);
  return { user, character, relationship, customization, defaultAppearance };
}
