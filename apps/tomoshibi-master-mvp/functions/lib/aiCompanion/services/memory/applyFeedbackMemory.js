"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFeedbackMemory = applyFeedbackMemory;
const RelationshipRepository_1 = require("../../repositories/RelationshipRepository");
const UserRepository_1 = require("../../repositories/UserRepository");
const time_1 = require("../../utils/time");
const RelationshipService_1 = require("./RelationshipService");
const UserMemoryService_1 = require("./UserMemoryService");
async function applyFeedbackMemory(event) {
    const userRepository = new UserRepository_1.UserRepository();
    const relationshipRepository = new RelationshipRepository_1.RelationshipRepository();
    const user = await userRepository.getById(event.userId);
    if (user) {
        await userRepository.update(new UserMemoryService_1.UserMemoryService().applyFeedbackSignal(user, event));
    }
    if (!event.characterId) {
        return;
    }
    const now = (0, time_1.nowIso)();
    const relationshipId = `${event.userId}_${event.characterId}`;
    const relationship = (await relationshipRepository.getById(relationshipId)) ?? {
        id: relationshipId,
        userId: event.userId,
        characterId: event.characterId,
        relationshipLevel: 0,
        totalSessions: 0,
        totalWalkDistanceMeters: 0,
        totalVisitedPlaces: 0,
        createdAt: now,
        updatedAt: now,
    };
    await relationshipRepository.upsert(new RelationshipService_1.RelationshipService().applyFeedbackSignal(relationship, event, now));
}
//# sourceMappingURL=applyFeedbackMemory.js.map