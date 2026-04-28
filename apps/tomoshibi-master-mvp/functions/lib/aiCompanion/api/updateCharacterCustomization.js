"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCharacterCustomization = updateCharacterCustomization;
const CharacterPartRepository_1 = require("../repositories/CharacterPartRepository");
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const UserCharacterCustomizationRepository_1 = require("../repositories/UserCharacterCustomizationRepository");
const time_1 = require("../utils/time");
async function updateCharacterCustomization(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    const character = await new CharacterRepository_1.CharacterRepository().getById(input.characterId);
    if (!character)
        throw new Error("Character was not found.");
    const availableParts = await new CharacterPartRepository_1.CharacterPartRepository().list();
    validateSelectedParts(input.selectedParts, new Set(availableParts.map((part) => part.id)));
    const repository = new UserCharacterCustomizationRepository_1.UserCharacterCustomizationRepository();
    const existing = await repository.getById((0, UserCharacterCustomizationRepository_1.userCharacterCustomizationId)(input.userId, input.characterId));
    const now = (0, time_1.nowIso)();
    const customization = {
        id: (0, UserCharacterCustomizationRepository_1.userCharacterCustomizationId)(input.userId, input.characterId),
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
function validateSelectedParts(selectedParts, availablePartIds) {
    Object.values(selectedParts).forEach((partId) => {
        if (partId && !availablePartIds.has(partId)) {
            throw new Error(`Character part was not found: ${partId}`);
        }
    });
}
//# sourceMappingURL=updateCharacterCustomization.js.map