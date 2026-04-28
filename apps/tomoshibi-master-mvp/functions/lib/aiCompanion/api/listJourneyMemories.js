"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJourneyMemories = listJourneyMemories;
const JourneyMemoryRepository_1 = require("../repositories/JourneyMemoryRepository");
async function listJourneyMemories(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    const limit = typeof input.limit === "number" && input.limit > 0 ? Math.min(Math.floor(input.limit), 30) : 10;
    const memories = await new JourneyMemoryRepository_1.JourneyMemoryRepository().listRecentByUserAndCharacter(input.userId, input.characterId, limit);
    return { memories };
}
//# sourceMappingURL=listJourneyMemories.js.map