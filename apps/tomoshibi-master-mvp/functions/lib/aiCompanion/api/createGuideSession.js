"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuideSession = createGuideSession;
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const GuideSessionMessageRepository_1 = require("../repositories/GuideSessionMessageRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const RelationshipRepository_1 = require("../repositories/RelationshipRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const defaultCharacter_1 = require("../services/companion/defaultCharacter");
const RelationshipService_1 = require("../services/memory/RelationshipService");
const EventLogService_1 = require("../services/tracking/EventLogService");
const ids_1 = require("../utils/ids");
const time_1 = require("../utils/time");
async function createGuideSession(input) {
    validate(input);
    const now = (0, time_1.nowIso)();
    const openingMessage = "外出セッションを始めたよ。今の気分に合わせて、近くの候補を一緒に探してみよう。";
    const userRepository = new UserRepository_1.UserRepository();
    const characterRepository = new CharacterRepository_1.CharacterRepository();
    const relationshipRepository = new RelationshipRepository_1.RelationshipRepository();
    const guideSessionRepository = new GuideSessionRepository_1.GuideSessionRepository();
    const user = await userRepository.createIfMissing({ id: input.userId, createdAt: now, updatedAt: now });
    const character = (await characterRepository.getById(input.characterId)) ??
        (await characterRepository.createIfMissing((0, defaultCharacter_1.createDefaultCharacter)(input.characterId, now)));
    const relationshipId = `${user.id}_${character.id}`;
    const baseRelationship = (await relationshipRepository.getById(relationshipId)) ?? {
        id: relationshipId,
        userId: user.id,
        characterId: character.id,
        relationshipLevel: 0,
        totalSessions: 0,
        totalWalkDistanceMeters: 0,
        totalVisitedPlaces: 0,
        createdAt: now,
        updatedAt: now,
    };
    const sessionId = (0, ids_1.createId)("session");
    await relationshipRepository.upsert(new RelationshipService_1.RelationshipService().recordSessionStarted(baseRelationship, now));
    await guideSessionRepository.create({
        id: sessionId,
        userId: user.id,
        characterId: character.id,
        mode: input.mode,
        status: "active",
        origin: input.origin,
        areaId: input.areaId,
        context: input.context,
        createdAt: now,
        updatedAt: now,
    });
    await new GuideSessionMessageRepository_1.GuideSessionMessageRepository().create({
        id: (0, ids_1.createId)("message"),
        sessionId,
        userId: user.id,
        characterId: character.id,
        role: "companion",
        content: openingMessage,
        createdAt: now,
    });
    await new EventLogService_1.EventLogService().log({
        name: "session_started",
        userId: user.id,
        sessionId,
        characterId: character.id,
        metadata: { mode: input.mode, mobility: input.context.mobility, availableMinutes: input.context.availableMinutes, areaId: input.areaId },
        createdAt: now,
    });
    return { sessionId, message: openingMessage };
}
function validate(input) {
    if (!input.userId || !input.characterId)
        throw new Error("userId and characterId are required.");
    if (!Number.isFinite(input.origin.lat) || !Number.isFinite(input.origin.lng))
        throw new Error("origin.lat and origin.lng are required.");
    if (!Number.isFinite(input.context.availableMinutes) || input.context.availableMinutes <= 0)
        throw new Error("context.availableMinutes must be greater than 0.");
}
//# sourceMappingURL=createGuideSession.js.map