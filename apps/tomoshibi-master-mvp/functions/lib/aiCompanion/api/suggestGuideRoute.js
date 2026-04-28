"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestGuideRoute = suggestGuideRoute;
const AreaModeRepository_1 = require("../repositories/AreaModeRepository");
const CharacterRepository_1 = require("../repositories/CharacterRepository");
const GuideSessionRepository_1 = require("../repositories/GuideSessionRepository");
const GuideSuggestionRepository_1 = require("../repositories/GuideSuggestionRepository");
const JourneyMemoryRepository_1 = require("../repositories/JourneyMemoryRepository");
const PlaceAnnotationRepository_1 = require("../repositories/PlaceAnnotationRepository");
const RelationshipRepository_1 = require("../repositories/RelationshipRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const CompanionGenerator_1 = require("../services/companion/CompanionGenerator");
const createLlmClient_1 = require("../services/companion/createLlmClient");
const MockPlaceProvider_1 = require("../services/places/MockPlaceProvider");
const PlaceAnnotationMergeService_1 = require("../services/places/PlaceAnnotationMergeService");
const PlaceCacheService_1 = require("../services/places/PlaceCacheService");
const createPlaceProvider_1 = require("../services/places/createPlaceProvider");
const RoutePlanner_1 = require("../services/routing/RoutePlanner");
const EventLogService_1 = require("../services/tracking/EventLogService");
const ids_1 = require("../utils/ids");
const time_1 = require("../utils/time");
async function suggestGuideRoute(input) {
    if (!input.userId || !input.sessionId)
        throw new Error("userId and sessionId are required.");
    const now = (0, time_1.nowIso)();
    const session = await new GuideSessionRepository_1.GuideSessionRepository().getById(input.sessionId);
    if (!session)
        throw new Error("GuideSession was not found.");
    if (session.userId !== input.userId)
        throw new Error("GuideSession does not belong to the requested user.");
    const user = await new UserRepository_1.UserRepository().getById(input.userId);
    if (!user)
        throw new Error("User was not found.");
    const character = await new CharacterRepository_1.CharacterRepository().getById(session.characterId);
    if (!character)
        throw new Error("Character was not found.");
    const relationshipId = `${user.id}_${character.id}`;
    const relationship = (await new RelationshipRepository_1.RelationshipRepository().getById(relationshipId)) ?? {
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
    const areaMode = session.areaId ? await new AreaModeRepository_1.AreaModeRepository().getById(session.areaId) : null;
    const placeSearchContext = {
        origin: session.origin,
        radiusMeters: areaMode?.defaultRadiusMeters ?? radiusForMobility(session.context.mobility),
        languageCode: "ja",
        includedTypes: session.context.interests ?? areaMode?.featuredTags,
    };
    const { places, providerMode } = await searchPlacesWithFallback(placeSearchContext);
    await new PlaceCacheService_1.PlaceCacheService().setMany(places);
    const annotations = session.areaId ? await new PlaceAnnotationRepository_1.PlaceAnnotationRepository().listByAreaId(session.areaId) : [];
    const annotatedPlaces = new PlaceAnnotationMergeService_1.PlaceAnnotationMergeService().merge(places, annotations);
    const routes = new RoutePlanner_1.RoutePlanner().planRoutes(annotatedPlaces, session);
    const recentJourneyMemories = await new JourneyMemoryRepository_1.JourneyMemoryRepository().listRecentByUserAndCharacter(user.id, character.id);
    const companion = await new CompanionGenerator_1.CompanionGenerator((0, createLlmClient_1.createLlmClient)()).generateRouteGuide({ user, character, relationship, session, routes, recentJourneyMemories });
    await new GuideSuggestionRepository_1.GuideSuggestionRepository().create({ id: (0, ids_1.createId)("suggestion"), sessionId: session.id, routes, companion, createdAt: now });
    await new EventLogService_1.EventLogService().log({
        name: "route_suggested",
        userId: user.id,
        sessionId: session.id,
        characterId: character.id,
        metadata: { routeCount: routes.length, placeProvider: providerMode, areaId: session.areaId, annotationCount: annotations.length, recentJourneyMemoryCount: recentJourneyMemories.length },
        createdAt: now,
    });
    return { sessionId: session.id, routes, companion };
}
async function searchPlacesWithFallback(placeSearchContext) {
    try {
        const places = await (0, createPlaceProvider_1.createPlaceProvider)().searchNearby(placeSearchContext);
        return { places, providerMode: places[0]?.provider ?? "unknown" };
    }
    catch (error) {
        const places = await new MockPlaceProvider_1.MockPlaceProvider().searchNearby(placeSearchContext);
        return {
            places,
            providerMode: `mock_fallback:${error instanceof Error ? error.message : "unknown_error"}`,
        };
    }
}
function radiusForMobility(mobility) {
    if (mobility === "bike")
        return 3000;
    if (mobility === "car")
        return 8000;
    if (mobility === "public_transport")
        return 5000;
    return 1200;
}
//# sourceMappingURL=suggestGuideRoute.js.map