"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeJourney = completeJourney;
const FeedbackEventRepository_1 = require("../repositories/FeedbackEventRepository");
const GuideSessionMessageRepository_1 = require("../repositories/GuideSessionMessageRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const JourneyMemoryRepository_1 = require("../repositories/JourneyMemoryRepository");
const RelationshipRepository_1 = require("../repositories/RelationshipRepository");
const createLlmClient_1 = require("../services/companion/createLlmClient");
const JourneyMemoryService_1 = require("../services/memory/JourneyMemoryService");
const RelationshipService_1 = require("../services/memory/RelationshipService");
const EventLogService_1 = require("../services/tracking/EventLogService");
const time_1 = require("../utils/time");
async function completeJourney(input) {
    if (!input.userId || !input.sessionId || !Array.isArray(input.visitedPlaceIds))
        throw new Error("userId, sessionId, and visitedPlaceIds are required.");
    const sessionRepository = new GuideSessionRepository_1.GuideSessionRepository();
    const session = await sessionRepository.getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    const [messages, feedbackEvents] = await Promise.all([new GuideSessionMessageRepository_1.GuideSessionMessageRepository().listBySessionId(session.id), new FeedbackEventRepository_1.FeedbackEventRepository().listBySessionId(session.id)]);
    const journeyMemory = await new JourneyMemoryService_1.JourneyMemoryService((0, createLlmClient_1.createLlmClient)()).createJourneyMemory({ session, messages, feedbackEvents, visitedPlaceIds: input.visitedPlaceIds, userComment: input.userComment });
    const now = (0, time_1.nowIso)();
    const relationshipRepository = new RelationshipRepository_1.RelationshipRepository();
    const relationshipId = `${session.userId}_${session.characterId}`;
    const relationship = (await relationshipRepository.getById(relationshipId)) ?? {
        id: relationshipId,
        userId: session.userId,
        characterId: session.characterId,
        relationshipLevel: 0,
        totalSessions: 0,
        totalWalkDistanceMeters: 0,
        totalVisitedPlaces: 0,
        createdAt: now,
        updatedAt: now,
    };
    await relationshipRepository.upsert(new RelationshipService_1.RelationshipService().recordJourneyCompleted(relationship, journeyMemory, now));
    await new JourneyMemoryRepository_1.JourneyMemoryRepository().create(journeyMemory);
    await sessionRepository.update({ ...session, status: "completed", updatedAt: now });
    await new EventLogService_1.EventLogService().log({ name: "journey_completed", userId: session.userId, sessionId: session.id, characterId: session.characterId, metadata: { journeyId: journeyMemory.id, visitedPlaceCount: journeyMemory.visitedPlaces.length, learnedPreferenceCount: journeyMemory.learnedPreferences?.length ?? 0 }, createdAt: now });
    return { journeyId: journeyMemory.id, title: journeyMemory.title, summary: journeyMemory.summary, companionMessage: journeyMemory.companionMessage, learnedPreferences: journeyMemory.learnedPreferences ?? [] };
}
//# sourceMappingURL=completeJourney.js.map