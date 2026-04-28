"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableCharacters = getAvailableCharacters;
const CharacterAppearanceRepository_1 = require("../repositories/CharacterAppearanceRepository");
const CharacterRepository_1 = require("../repositories/CharacterRepository");
async function getAvailableCharacters(_input) {
    const characters = await new CharacterRepository_1.CharacterRepository().list();
    const appearanceRepository = new CharacterAppearanceRepository_1.CharacterAppearanceRepository();
    return {
        characters: await Promise.all(characters.map(async (character) => ({
            character,
            defaultAppearance: character.defaultAppearanceId ? await appearanceRepository.getById(character.defaultAppearanceId) : null,
            previewMessage: buildPreviewMessage(character.name),
        }))),
    };
}
function buildPreviewMessage(characterName) {
    return `${characterName}と、今日の外出を少し相談してみる？`;
}
//# sourceMappingURL=getAvailableCharacters.js.map