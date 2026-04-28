import type { Character, CharacterAppearance, CharacterPart, CharacterPartSelection, UserCharacterCustomization } from "./character";
import type { FeedbackEventType } from "./events";
import type { CompanionGuideOutput, CompanionType, GeoPointInput, GuideMode, GuideSession, Mobility } from "./guide";
import type { JourneyMemory } from "./memory";
import type { GuideSessionMessage } from "./message";
import type { Relationship } from "./relationship";
import type { RoutePlan } from "./route";
import type { User } from "./user";

export type CreateGuideSessionInput = {
  userId: string;
  characterId: string;
  mode: GuideMode;
  origin: GeoPointInput;
  areaId?: string;
  context: {
    availableMinutes: number;
    mobility: Mobility;
    mood?: string;
    interests?: string[];
    companionType?: CompanionType;
  };
};

export type CreateGuideSessionOutput = {
  sessionId: string;
  message: string;
};

export type SuggestGuideRouteInput = {
  userId: string;
  sessionId: string;
};

export type SuggestGuideRouteOutput = {
  sessionId: string;
  routes: RoutePlan[];
  companion: CompanionGuideOutput;
};

export type RespondToCompanionInput = {
  userId: string;
  sessionId: string;
  message?: string;
  action?: {
    type:
      | "tell_more"
      | "change_mood"
      | "skip_place"
      | "save_place"
      | "arrived"
      | "visited"
      | "liked"
      | "not_interested"
      | "next_suggestion";
    placeId?: string;
    routeId?: string;
    payload?: Record<string, unknown>;
  };
};

export type RespondToCompanionOutput = {
  message: string;
  nextActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
};

export type CompleteJourneyInput = {
  userId: string;
  sessionId: string;
  visitedPlaceIds: string[];
  userComment?: string;
};

export type CompleteJourneyOutput = {
  journeyId: string;
  title: string;
  summary: string;
  companionMessage: string;
  learnedPreferences: string[];
};

export type ListJourneyMemoriesInput = {
  userId: string;
  characterId: string;
  limit?: number;
};

export type ListJourneyMemoriesOutput = {
  memories: JourneyMemory[];
};

export type GetJourneyMemoryInput = {
  userId: string;
  journeyId: string;
  characterId?: string;
};

export type GetJourneyMemoryOutput = {
  memory: JourneyMemory;
};

export type GetActiveGuideSessionInput = {
  userId: string;
  characterId: string;
};

export type GetActiveGuideSessionOutput = {
  session: GuideSession | null;
  latestSuggestion?: {
    routes: RoutePlan[];
    companion: CompanionGuideOutput;
  } | null;
};

export type ListGuideSessionMessagesInput = {
  userId: string;
  sessionId: string;
  limit?: number;
};

export type ListGuideSessionMessagesOutput = {
  messages: GuideSessionMessage[];
};

export type TrackOutboundClickInput = {
  userId: string;
  sessionId: string;
  placeId?: string;
  partnerLinkId?: string;
  url: string;
  source: "place_card" | "companion_message" | "route_detail" | "journey_recap";
};

export type TrackOutboundClickOutput = {
  redirectUrl: string;
};

export type SaveUserFeedbackInput = {
  userId: string;
  sessionId: string;
  characterId?: string;
  placeId?: string;
  routeId?: string;
  type: FeedbackEventType;
  metadata?: Record<string, unknown>;
};

export type SaveUserFeedbackOutput = {
  feedbackEventId: string;
};

export type GetUserCompanionStateInput = {
  userId: string;
  characterId: string;
};

export type GetUserCompanionStateOutput = {
  user: User;
  character: Character;
  relationship: Relationship | null;
  customization?: UserCharacterCustomization | null;
  defaultAppearance?: CharacterAppearance | null;
};

export type GetAvailableCharactersInput = {
  userId?: string;
};

export type GetAvailableCharactersOutput = {
  characters: {
    character: Character;
    defaultAppearance?: CharacterAppearance | null;
    previewMessage: string;
  }[];
};

export type GetCharacterCustomizationInput = {
  userId: string;
  characterId: string;
};

export type GetCharacterCustomizationOutput = {
  customization: UserCharacterCustomization;
  availableParts: CharacterPart[];
  defaultAppearance?: CharacterAppearance | null;
};

export type UpdateCharacterCustomizationInput = {
  userId: string;
  characterId: string;
  appearanceName?: string;
  selectedParts: CharacterPartSelection;
};

export type UpdateCharacterCustomizationOutput = {
  customization: UserCharacterCustomization;
};
