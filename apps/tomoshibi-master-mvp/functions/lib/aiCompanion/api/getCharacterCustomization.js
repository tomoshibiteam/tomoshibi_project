"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCharacterCustomization = getCharacterCustomization;
const CharacterAppearanceRepository_1 = require("../repositories/CharacterAppearanceRepository");
const CharacterPartRepository_1 = require("../repositories/CharacterPartRepository");
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const UserCharacterCustomizationRepository_1 = require("../repositories/UserCharacterCustomizationRepository");
const time_1 = require("../utils/time");
async function getCharacterCustomization(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    const character = await new CharacterRepository_1.CharacterRepository().getById(input.characterId);
    if (!character)
        throw new Error("Character was not found.");
    const customizationRepository = new UserCharacterCustomizationRepository_1.UserCharacterCustomizationRepository();
    const customization = (await customizationRepository.getById((0, UserCharacterCustomizationRepository_1.userCharacterCustomizationId)(input.userId, input.characterId))) ??
        createDefaultCustomization(input.userId, input.characterId);
    const [availableParts, defaultAppearance] = await Promise.all([
        new CharacterPartRepository_1.CharacterPartRepository().list(),
        character.defaultAppearanceId ? new CharacterAppearanceRepository_1.CharacterAppearanceRepository().getById(character.defaultAppearanceId) : Promise.resolve(null),
    ]);
    return { customization, availableParts, defaultAppearance };
}
function createDefaultCustomization(userId, characterId) {
    const now = (0, time_1.nowIso)();
    return {
        id: (0, UserCharacterCustomizationRepository_1.userCharacterCustomizationId)(userId, characterId),
        userId,
        characterId,
        selectedParts: {},
        unlockedPartIds: [],
        lastUpdatedAt: now,
        createdAt: now,
    };
}
//# sourceMappingURL=getCharacterCustomization.js.map