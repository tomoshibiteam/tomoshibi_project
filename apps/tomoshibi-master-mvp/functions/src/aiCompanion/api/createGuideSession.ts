import { CharacterRepository } from "../repositories/CharacterRepository";
import { GuideSessionMessageRepository } from "../repositories/GuideSessionMessageRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import { UserRepository } from "../repositories/UserRepository";
import { createDefaultCharacter } from "../services/companion/defaultCharacter";
import { RelationshipService } from "../services/memory/RelationshipService";
import { EventLogService } from "../services/tracking/EventLogService";
import type { CreateGuideSessionInput, CreateGuideSessionOutput } from "../types/api";
import type { Relationship } from "../types/relationship";
import { createId } from "../utils/ids";
import { nowIso } from "../utils/time";

export async function createGuideSession(input: CreateGuideSessionInput): Promise<CreateGuideSessionOutput> {
  validate(input);
  const now = nowIso();
  const openingMessage = "外出セッションを始めたよ。今の気分に合わせて、近くの候補を一緒に探してみよう。";
  const userRepository = new UserRepository();
  const characterRepository = new CharacterRepository();
  const relationshipRepository = new RelationshipRepository();
  const guideSessionRepository = new GuideSessionRepository();
  const user = await userRepository.createIfMissing({ id: input.userId, createdAt: now, updatedAt: now });
  const character =
    (await characterRepository.getById(input.characterId)) ??
    (await characterRepository.createIfMissing(createDefaultCharacter(input.characterId, now)));
  const relationshipId = `${user.id}_${character.id}`;
  const baseRelationship: Relationship =
    (await relationshipRepository.getById(relationshipId)) ?? {
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
  const sessionId = createId("session");
  await relationshipRepository.upsert(new RelationshipService().recordSessionStarted(baseRelationship, now));
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
  await new GuideSessionMessageRepository().create({
    id: createId("message"),
    sessionId,
    userId: user.id,
    characterId: character.id,
    role: "companion",
    content: openingMessage,
    createdAt: now,
  });
  await new EventLogService().log({
    name: "session_started",
    userId: user.id,
    sessionId,
    characterId: character.id,
    metadata: { mode: input.mode, mobility: input.context.mobility, availableMinutes: input.context.availableMinutes, areaId: input.areaId },
    createdAt: now,
  });
  return { sessionId, message: openingMessage };
}

function validate(input: CreateGuideSessionInput): void {
  if (!input.userId || !input.characterId) throw new Error("userId and characterId are required.");
  if (!Number.isFinite(input.origin.lat) || !Number.isFinite(input.origin.lng)) throw new Error("origin.lat and origin.lng are required.");
  if (!Number.isFinite(input.context.availableMinutes) || input.context.availableMinutes <= 0) throw new Error("context.availableMinutes must be greater than 0.");
}
