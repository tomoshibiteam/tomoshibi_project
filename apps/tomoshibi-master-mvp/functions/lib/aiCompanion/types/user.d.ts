export type User = {
    id: string;
    displayName?: string;
    createdAt: string;
    updatedAt: string;
    preferenceSummary?: string;
    preferences?: {
        likedPlaceTypes?: string[];
        dislikedPlaceTypes?: string[];
        preferredPace?: "slow" | "normal" | "active";
        mobility?: "walk" | "bike" | "car" | "public_transport";
        guideDetailLevel?: "short" | "normal" | "deep";
        interests?: string[];
    };
};
