"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCompanionState = getUserCompanionState;
const CharacterAppearanceRepository_1 = require("../repositories/CharacterAppearanceRepository");
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const RelationshipRepository_1 = require("../repositories/RelationshipRepository");
const UserCharacterCustomizationRepository_1 = require("../repositories/UserCharacterCustomizationRepository");
const UserRepository_1 = require("../repositories/UserRepository");
async function getUserCompanionState(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    const user = await new UserRepository_1.UserRepository().getById(input.userId);
    if (!user)
        throw new Error("User was not found.");
    const character = await new CharacterRepository_1.CharacterRepository().getById(input.characterId);
    if (!character)
        throw new Error("Character was not found.");
    const relationship = await new RelationshipRepository_1.RelationshipRepository().getById(`${input.userId}_${input.characterId}`);
    const [customization, defaultAppearance] = await Promise.all([
        new UserCharacterCustomizationRepository_1.UserCharacterCustomizationRepository().getById((0, UserCharacterCustomizationRepository_1.userCharacterCustomizationId)(input.userId, input.characterId)),
        character.defaultAppearanceId ? new CharacterAppearanceRepository_1.CharacterAppearanceRepository().getById(character.defaultAppearanceId) : Promise.resolve(null),
    ]);
    return { user, character, relationship, customization, defaultAppearance };
}
//# sourceMappingURL=getUserCompanionState.js.map