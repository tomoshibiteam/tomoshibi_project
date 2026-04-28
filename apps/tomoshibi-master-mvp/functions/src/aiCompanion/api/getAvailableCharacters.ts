import { CharacterAppearanceRepository } from "../repositories/CharacterAppearanceRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import type { GetAvailableCharactersInput, GetAvailableCharactersOutput } from "../types/api";

export async function getAvailableCharacters(_input: GetAvailableCharactersInput): Promise<GetAvailableCharactersOutput> {
  const characters = await new CharacterRepository().list();
  const appearanceRepository = new CharacterAppearanceRepository();
  return {
    characters: await Promise.all(
      characters.map(async (character) => ({
        character,
        defaultAppearance: character.defaultAppearanceId ? await appearanceRepository.getById(character.defaultAppearanceId) : null,
        previewMessage: buildPreviewMessage(character.name),
      })),
    ),
  };
}

function buildPreviewMessage(characterName: string): string {
  return `${characterName}と、今日の外出を少し相談してみる？`;
}
