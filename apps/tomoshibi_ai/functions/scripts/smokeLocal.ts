type JsonValue = Record<string, unknown>;

const projectId = process.env.FIREBASE_PROJECT_ID ?? "tomoshibi-local";
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST ?? "127.0.0.1:5005";
const baseUrl = `http://${functionsHost}/${projectId}/us-central1`;

async function post<TResponse>(functionName: string, body: JsonValue): Promise<TResponse> {
  const response = await fetch(`${baseUrl}/${functionName}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const json = parseJson(responseText);

  if (!response.ok) {
    const message = isErrorResponse(json) ? json.error?.message : responseText || response.statusText;
    throw new Error(`${functionName} failed: ${message}`);
  }

  if (!json) {
    throw new Error(`${functionName} returned an empty or non-JSON response.`);
  }

  return json as TResponse;
}

function parseJson(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isErrorResponse(value: unknown): value is { error?: { message?: string } } {
  return typeof value === "object" && value !== null && "error" in value;
}

async function main(): Promise<void> {
  const userId = "smoke_user";
  const characterId = "tomoshibi";
  const availableCharacters = await post<{ characters: { character: { id: string }; defaultAppearance?: { id: string } | null }[] }>(
    "getAvailableCharacters",
    {
      userId,
    },
  );
  if (!availableCharacters.characters.some((entry) => entry.character.id === characterId)) {
    throw new Error("Default character was not returned by getAvailableCharacters.");
  }
  const customization = await post<{ customization: { id: string }; availableParts: { id: string }[] }>(
    "getCharacterCustomization",
    {
      userId,
      characterId,
    },
  );
  const selectedPartId = customization.availableParts.find((part) => part.id === "theme_amber")?.id;
  if (!selectedPartId) {
    throw new Error("Expected free character part was not seeded.");
  }
  await post("updateCharacterCustomization", {
    userId,
    characterId,
    appearanceName: "スモークテストの相棒",
    selectedParts: {
      colorTheme: selectedPartId,
    },
  });
  const createSession = await post<{ sessionId: string }>("createGuideSession", {
    userId,
    characterId,
    mode: "daily_walk",
    origin: {
      lat: 33.749,
      lng: 129.691,
      label: "壱岐テスト地点",
    },
    areaId: "iki",
    context: {
      availableMinutes: 45,
      mobility: "walk",
      mood: "落ち着きたい",
      interests: ["cafe", "quiet"],
      companionType: "solo",
    },
  });

  const routeSuggestion = await post<{ routes: { id: string; places: { place: { providerPlaceId: string } }[] }[] }>(
    "suggestGuideRoute",
    {
      userId,
      sessionId: createSession.sessionId,
    },
  );
  const firstRoute = routeSuggestion.routes[0];
  const firstPlace = firstRoute?.places[0]?.place;

  await post("respondToCompanion", {
    userId,
    sessionId: createSession.sessionId,
    action: {
      type: "tell_more",
      placeId: firstPlace?.providerPlaceId,
      routeId: firstRoute?.id,
    },
  });

  await post("respondToCompanion", {
    userId,
    sessionId: createSession.sessionId,
    action: {
      type: "liked",
      placeId: firstPlace?.providerPlaceId,
      routeId: firstRoute?.id,
      payload: {
        placeName: "路地裏のカフェ",
        placeTypes: ["cafe"],
        tags: ["quiet", "relax"],
      },
    },
  });

  await post("completeJourney", {
    userId,
    sessionId: createSession.sessionId,
    visitedPlaceIds: firstPlace?.providerPlaceId ? [firstPlace.providerPlaceId] : [],
    userComment: "短いテスト散歩",
  });

  const secondSession = await post<{ sessionId: string }>("createGuideSession", {
    userId,
    characterId,
    mode: "daily_walk",
    origin: {
      lat: 33.749,
      lng: 129.691,
      label: "壱岐テスト地点",
    },
    areaId: "iki",
    context: {
      availableMinutes: 30,
      mobility: "walk",
      mood: "前に好きだった雰囲気で歩きたい",
      interests: ["quiet", "cafe"],
      companionType: "solo",
    },
  });

  const secondRouteSuggestion = await post<{ routes: { id: string }[] }>("suggestGuideRoute", {
    userId,
    sessionId: secondSession.sessionId,
  });

  await post("trackOutboundClick", {
    userId,
    sessionId: createSession.sessionId,
    placeId: firstPlace?.providerPlaceId,
    url: "https://example.com",
    source: "place_card",
  });

  const state = await post("getUserCompanionState", {
    userId,
    characterId,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        sessionId: createSession.sessionId,
        secondSessionId: secondSession.sessionId,
        secondRouteCount: secondRouteSuggestion.routes.length,
        state,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
