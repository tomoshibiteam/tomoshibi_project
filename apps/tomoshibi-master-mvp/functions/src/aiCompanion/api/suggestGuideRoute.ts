import { AreaModeRepository } from "../repositories/AreaModeRepository";
import { CharacterRepository } from "../repositories/CharacterRepository";
import { GuideSessionRepository } from "../repositories/GuideSessionRepository";
import { GuideSuggestionRepository } from "../repositories/GuideSuggestionRepository";
import { JourneyMemoryRepository } from "../repositories/JourneyMemoryRepository";
import { PlaceAnnotationRepository } from "../repositories/PlaceAnnotationRepository";
import { RelationshipRepository } from "../repositories/RelationshipRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CompanionGenerator } from "../services/companion/CompanionGenerator";
import { createLlmClient } from "../services/companion/createLlmClient";
import { MockPlaceProvider } from "../services/places/MockPlaceProvider";
import { PlaceAnnotationMergeService } from "../services/places/PlaceAnnotationMergeService";
import { PlaceCacheService } from "../services/places/PlaceCacheService";
import { createPlaceProvider } from "../services/places/createPlaceProvider";
import { RoutePlanner } from "../services/routing/RoutePlanner";
import { EventLogService } from "../services/tracking/EventLogService";
import type { SuggestGuideRouteInput, SuggestGuideRouteOutput } from "../types/api";
import type { Relationship } from "../types/relationship";
import { createId } from "../utils/ids";
import { nowIso } from "../utils/time";

export async function suggestGuideRoute(input: SuggestGuideRouteInput): Promise<SuggestGuideRouteOutput> {
  if (!input.userId || !input.sessionId) throw new Error("userId and sessionId are required.");
  const now = nowIso();
  const session = await new GuideSessionRepository().getById(input.sessionId);
  if (!session) throw new Error("GuideSession was not found.");
  if (session.userId !== input.userId) throw new Error("GuideSession does not belong to the requested user.");
  const user = await new UserRepository().getById(input.userId);
  if (!user) throw new Error("User was not found.");
  const character = await new CharacterRepository().getById(session.characterId);
  if (!character) throw new Error("Character was not found.");
  const relationshipId = `${user.id}_${character.id}`;
  const relationship: Relationship =
    (await new RelationshipRepository().getById(relationshipId)) ?? {
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
  const areaMode = session.areaId ? await new AreaModeRepository().getById(session.areaId) : null;
  const placeSearchContext = {
    origin: session.origin,
    radiusMeters: areaMode?.defaultRadiusMeters ?? radiusForMobility(session.context.mobility),
    languageCode: "ja",
    includedTypes: session.context.interests ?? areaMode?.featuredTags,
  };
  const { places, providerMode } = await searchPlacesWithFallback(placeSearchContext);
  await new PlaceCacheService().setMany(places);
  const annotations = session.areaId ? await new PlaceAnnotationRepository().listByAreaId(session.areaId) : [];
  const annotatedPlaces = new PlaceAnnotationMergeService().merge(places, annotations);
  const routes = new RoutePlanner().planRoutes(annotatedPlaces, session);
  const recentJourneyMemories = await new JourneyMemoryRepository().listRecentByUserAndCharacter(user.id, character.id);
  const companion = await new CompanionGenerator(createLlmClient()).generateRouteGuide({ user, character, relationship, session, routes, recentJourneyMemories });
  await new GuideSuggestionRepository().create({ id: createId("suggestion"), sessionId: session.id, routes, companion, createdAt: now });
  await new EventLogService().log({
    name: "route_suggested",
    userId: user.id,
    sessionId: session.id,
    characterId: character.id,
    metadata: { routeCount: routes.length, placeProvider: providerMode, areaId: session.areaId, annotationCount: annotations.length, recentJourneyMemoryCount: recentJourneyMemories.length },
    createdAt: now,
  });
  return { sessionId: session.id, routes, companion };
}

async function searchPlacesWithFallback(placeSearchContext: Parameters<ReturnType<typeof createPlaceProvider>["searchNearby"]>[0]) {
  try {
    const places = await createPlaceProvider().searchNearby(placeSearchContext);
    return { places, providerMode: places[0]?.provider ?? "unknown" };
  } catch (error) {
    const places = await new MockPlaceProvider().searchNearby(placeSearchContext);
    return {
      places,
      providerMode: `mock_fallback:${error instanceof Error ? error.message : "unknown_error"}`,
    };
  }
}

function radiusForMobility(mobility: string): number {
  if (mobility === "bike") return 3000;
  if (mobility === "car") return 8000;
  if (mobility === "public_transport") return 5000;
  return 1200;
}
