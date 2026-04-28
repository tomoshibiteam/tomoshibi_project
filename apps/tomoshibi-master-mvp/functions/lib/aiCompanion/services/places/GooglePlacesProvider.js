"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlacesProvider = void 0;
const env_1 = require("../../utils/env");
const nearbySearchUrl = "https://places.googleapis.com/v1/places:searchNearby";
const nearbySearchFieldMask = [
    "places.id",
    "places.name",
    "places.displayName",
    "places.location",
    "places.formattedAddress",
    "places.types",
    "places.googleMapsUri",
    "places.photos",
].join(",");
const placeDetailsUrl = "https://places.googleapis.com/v1/places";
const placeDetailsFieldMask = [
    "id",
    "name",
    "displayName",
    "location",
    "formattedAddress",
    "types",
    "rating",
    "userRatingCount",
    "currentOpeningHours",
    "websiteUri",
    "googleMapsUri",
    "photos",
].join(",");
const interestToGoogleTypes = {
    cafe: ["cafe"],
    coffee: ["cafe"],
    park: ["park"],
    nature: ["park"],
    museum: ["museum"],
    history: ["museum", "tourist_attraction"],
    restaurant: ["restaurant"],
    food: ["restaurant"],
    scenic: ["tourist_attraction"],
    landmark: ["tourist_attraction"],
};
class GooglePlacesProvider {
    apiKey;
    constructor(apiKey = (0, env_1.readEnv)("GOOGLE_PLACES_API_KEY")) {
        this.apiKey = apiKey;
    }
    async searchNearby(context) {
        if (!this.apiKey) {
            throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
        }
        const response = await fetch(nearbySearchUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-goog-api-key": this.apiKey,
                "x-goog-fieldmask": nearbySearchFieldMask,
            },
            body: JSON.stringify({
                ...(googleIncludedTypes(context.includedTypes).length > 0 ? { includedTypes: googleIncludedTypes(context.includedTypes) } : {}),
                maxResultCount: 10,
                languageCode: context.languageCode ?? "ja",
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: context.origin.lat,
                            longitude: context.origin.lng,
                        },
                        radius: clampRadius(context.radiusMeters),
                    },
                },
            }),
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Google Places Nearby Search failed: ${response.status} ${responseText}`);
        }
        const payload = JSON.parse(responseText);
        return (payload.places ?? []).flatMap((place) => normalizeGooglePlace(place));
    }
    async getDetails(context) {
        if (!this.apiKey) {
            throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
        }
        const searchParams = new URLSearchParams();
        if (context.languageCode) {
            searchParams.set("languageCode", context.languageCode);
        }
        const url = `${placeDetailsUrl}/${encodeURIComponent(context.providerPlaceId)}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "x-goog-api-key": this.apiKey,
                "x-goog-fieldmask": placeDetailsFieldMask,
            },
        });
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Google Places Details failed: ${response.status} ${responseText}`);
        }
        const [place] = normalizeGooglePlace(JSON.parse(responseText));
        return place ?? null;
    }
}
exports.GooglePlacesProvider = GooglePlacesProvider;
function normalizeGooglePlace(place) {
    const providerPlaceId = place.id ?? parsePlaceIdFromResourceName(place.name);
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const name = place.displayName?.text;
    if (!providerPlaceId || typeof lat !== "number" || typeof lng !== "number" || !name) {
        return [];
    }
    return [
        {
            provider: "google_places",
            providerPlaceId,
            name,
            lat,
            lng,
            address: place.formattedAddress,
            types: place.types ?? [],
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            openNow: place.currentOpeningHours?.openNow,
            websiteUri: place.websiteUri,
            googleMapsUri: place.googleMapsUri,
            photoRefs: place.photos?.flatMap((photo) => (photo.name ? [photo.name] : [])),
        },
    ];
}
function parsePlaceIdFromResourceName(resourceName) {
    return resourceName?.startsWith("places/") ? resourceName.slice("places/".length) : undefined;
}
function clampRadius(radiusMeters) {
    return Math.min(Math.max(radiusMeters, 1), 50000);
}
function googleIncludedTypes(interests) {
    const mapped = new Set();
    (interests ?? []).forEach((interest) => {
        (interestToGoogleTypes[interest] ?? []).forEach((type) => mapped.add(type));
    });
    return [...mapped].slice(0, 10);
}
//# sourceMappingURL=GooglePlacesProvider.js.map