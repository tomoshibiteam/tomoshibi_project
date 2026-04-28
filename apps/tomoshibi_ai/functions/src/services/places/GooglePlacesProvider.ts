import { readEnv } from "../../utils/env";
import type { NormalizedPlace, PlaceDetailsContext, PlaceSearchContext } from "../../types/place";
import type { PlaceProvider } from "./PlaceProvider";

type GooglePlace = {
  id?: string;
  name?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
  formattedAddress?: string;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
  };
  websiteUri?: string;
  googleMapsUri?: string;
  photos?: {
    name?: string;
  }[];
};

type GoogleNearbySearchResponse = {
  places?: GooglePlace[];
};

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

const interestToGoogleTypes: Record<string, string[]> = {
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

export class GooglePlacesProvider implements PlaceProvider {
  constructor(private readonly apiKey = readEnv("GOOGLE_PLACES_API_KEY")) {}

  async searchNearby(context: PlaceSearchContext): Promise<NormalizedPlace[]> {
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

    const payload = JSON.parse(responseText) as GoogleNearbySearchResponse;
    return (payload.places ?? []).flatMap((place) => normalizeGooglePlace(place));
  }

  async getDetails(context: PlaceDetailsContext): Promise<NormalizedPlace | null> {
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

    const [place] = normalizeGooglePlace(JSON.parse(responseText) as GooglePlace);
    return place ?? null;
  }
}

function normalizeGooglePlace(place: GooglePlace): NormalizedPlace[] {
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

function parsePlaceIdFromResourceName(resourceName: string | undefined): string | undefined {
  return resourceName?.startsWith("places/") ? resourceName.slice("places/".length) : undefined;
}

function clampRadius(radiusMeters: number): number {
  return Math.min(Math.max(radiusMeters, 1), 50000);
}

function googleIncludedTypes(interests: string[] | undefined): string[] {
  const mapped = new Set<string>();
  (interests ?? []).forEach((interest) => {
    (interestToGoogleTypes[interest] ?? []).forEach((type) => mapped.add(type));
  });

  return [...mapped].slice(0, 10);
}
