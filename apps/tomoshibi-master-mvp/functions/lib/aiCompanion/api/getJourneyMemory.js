"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJourneyMemory = getJourneyMemory;
const JourneyMemoryRepository_1 = require("../repositories/JourneyMemoryRepository");
async function getJourneyMemory(input) {
    if (!input.userId || !input.journeyId)
        throw new Error("userId and journeyId are required.");
    const memory = await new JourneyMemoryRepository_1.JourneyMemoryRepository().getById(input.journeyId);
    if (!memory)
        throw new Error("JourneyMemory was not found.");
    if (memory.userId !== input.userId)
        throw new Error("JourneyMemory does not belong to the requested user.");
    if (input.characterId && memory.characterId !== input.characterId) {
        throw new Error("JourneyMemory does not belong to the requested character.");
    }
    return { memory };
}
//# sourceMappingURL=getJourneyMemory.js.map