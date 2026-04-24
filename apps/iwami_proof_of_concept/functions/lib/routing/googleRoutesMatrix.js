"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRouteMatrix = computeRouteMatrix;
const ROUTES_MATRIX_ENDPOINT = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
const ROUTES_FIELD_MASK = "originIndex,destinationIndex,duration,distanceMeters,condition,status";
function resolveGoogleApiKey(explicitApiKey) {
    const candidates = [
        explicitApiKey,
        process.env.GOOGLE_MAPS_SERVER_API_KEY,
        process.env.GOOGLE_MAPS_API_KEY,
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    ];
    for (const candidate of candidates) {
        const normalized = candidate?.trim();
        if (normalized)
            return normalized;
    }
    throw new Error("Google Routes API key is missing. Set GOOGLE_MAPS_SERVER_API_KEY (or GOOGLE_MAPS_API_KEY) on Functions runtime.");
}
function mapToGoogleTravelMode(mode) {
    if (mode === "car")
        return "DRIVE";
    if (mode === "walk")
        return "WALK";
    if (mode === "rental_cycle")
        return "BICYCLE";
    return "TRANSIT";
}
function parseGoogleDurationToMinutes(rawDuration) {
    if (!rawDuration)
        return null;
    const matched = rawDuration.match(/^(\d+(?:\.\d+)?)s$/);
    if (!matched)
        return null;
    const seconds = Number(matched[1]);
    if (!Number.isFinite(seconds))
        return null;
    return Math.max(0, Math.round(seconds / 60));
}
function initMatrix(locations, initialValue) {
    const matrix = {};
    for (const from of locations) {
        matrix[from.id] = {};
        for (const to of locations) {
            matrix[from.id][to.id] = initialValue;
        }
    }
    return matrix;
}
function formatBodyLocations(locations) {
    return locations.map((location) => ({
        waypoint: {
            location: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng,
                },
            },
        },
    }));
}
async function computeRouteMatrix(params) {
    if (params.locations.length < 2) {
        throw new Error("At least two locations are required for route matrix computation.");
    }
    const apiKey = resolveGoogleApiKey(params.apiKey);
    const travelMode = mapToGoogleTravelMode(params.mode);
    const body = {
        origins: formatBodyLocations(params.locations),
        destinations: formatBodyLocations(params.locations),
        travelMode,
        units: "METRIC",
        languageCode: "ja",
        regionCode: "JP",
    };
    if (travelMode === "TRANSIT") {
        body.departureTime = params.departureTime ?? new Date().toISOString();
    }
    const response = await fetch(ROUTES_MATRIX_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": ROUTES_FIELD_MASK,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Routes API error: status=${response.status} body=${errorText.slice(0, 500)}`);
    }
    const responseText = await response.text();
    const lines = responseText
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const durationsMinutes = initMatrix(params.locations, null);
    const distancesMeters = initMatrix(params.locations, null);
    const unresolvedPairs = [];
    for (const line of lines) {
        const row = JSON.parse(line);
        const originIndex = row.originIndex;
        const destinationIndex = row.destinationIndex;
        if (originIndex == null || destinationIndex == null)
            continue;
        const from = params.locations[originIndex];
        const to = params.locations[destinationIndex];
        if (!from || !to)
            continue;
        if (row.condition === "ROUTE_EXISTS" || row.condition == null) {
            durationsMinutes[from.id][to.id] = parseGoogleDurationToMinutes(row.duration);
            distancesMeters[from.id][to.id] =
                typeof row.distanceMeters === "number" && Number.isFinite(row.distanceMeters)
                    ? Math.max(0, Math.round(row.distanceMeters))
                    : null;
            continue;
        }
        unresolvedPairs.push({
            fromId: from.id,
            toId: to.id,
            reason: row.status?.message ?? row.condition,
        });
    }
    return {
        source: "google_routes_api",
        mode: params.mode,
        durationsMinutes,
        distancesMeters,
        unresolvedPairs,
    };
}
//# sourceMappingURL=googleRoutesMatrix.js.map