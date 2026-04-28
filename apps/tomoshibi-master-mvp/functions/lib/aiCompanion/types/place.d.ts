export type PlaceProviderName = "google_places" | "hotpepper" | "rakuten" | "veltra" | "own_db" | "mock";
export type NormalizedPlace = {
    provider: PlaceProviderName;
    providerPlaceId: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    types: string[];
    rating?: number;
    userRatingCount?: number;
    openNow?: boolean;
    photoRefs?: string[];
    websiteUri?: string;
    googleMapsUri?: string;
    tomoshibiTags?: string[];
    localStory?: {
        short: string;
        long?: string;
        source?: string;
    };
    partnerLinkIds?: string[];
};
export type PlaceSearchContext = {
    origin: {
        lat: number;
        lng: number;
    };
    radiusMeters: number;
    languageCode?: string;
    includedTypes?: string[];
};
export type PlaceDetailsContext = {
    provider?: PlaceProviderName;
    providerPlaceId: string;
    languageCode?: string;
};
export type PlaceCacheDocument = NormalizedPlace & {
    id: string;
    cachedAt: string;
    updatedAt: string;
};
export type AreaMode = {
    id: string;
    name: string;
    description: string;
    centerLat: number;
    centerLng: number;
    defaultRadiusMeters: number;
    featuredTags: string[];
    createdAt: string;
    updatedAt: string;
};
export type PlaceAnnotation = {
    id: string;
    providerPlaceId?: string;
    areaId: string;
    name: string;
    tomoshibiTags: string[];
    localStory?: {
        short: string;
        long?: string;
        source?: string;
    };
    recommendedFor?: string[];
    partner?: {
        isPartner: boolean;
        linkIds?: string[];
        notes?: string;
    };
    createdAt: string;
    updatedAt: string;
};
