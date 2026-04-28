export type GuideMode = "daily_walk" | "travel" | "trip_planning" | "area_guide";
export type GuideSessionStatus = "active" | "completed" | "abandoned";
export type Mobility = "walk" | "bike" | "car" | "public_transport";
export type CompanionType = "solo" | "couple" | "friends" | "family";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type GeoPointInput = {
  lat: number;
  lng: number;
  label?: string;
};

export type GuideSession = {
  id: string;
  userId: string;
  characterId: string;
  mode: GuideMode;
  status: GuideSessionStatus;
  origin: GeoPointInput;
  destination?: GeoPointInput;
  areaId?: string;
  context: {
    availableMinutes: number;
    mobility: Mobility;
    mood?: string;
    interests?: string[];
    companionType?: CompanionType;
    timeOfDay?: TimeOfDay;
  };
  createdAt: string;
  updatedAt: string;
};

export type CompanionGuideOutput = {
  openingMessage: string;
  routeSummaries: {
    routeId: string;
    companionComment: string;
    whyRecommended: string;
    suggestedAction: string;
  }[];
  nextActions: {
    label: string;
    action: "start_route" | "tell_more" | "change_mood" | "save_route";
    payload?: Record<string, unknown>;
  }[];
};
