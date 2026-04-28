export type {
  CompleteJourneyInput,
  CompleteJourneyOutput,
  CreateGuideSessionInput,
  CreateGuideSessionOutput,
  GetActiveGuideSessionOutput,
  GetAvailableCharactersOutput,
  GetCharacterCustomizationOutput,
  GetJourneyMemoryOutput,
  GetUserCompanionStateOutput,
  ListGuideSessionMessagesOutput,
  ListJourneyMemoriesOutput,
  RespondToCompanionInput,
  RespondToCompanionOutput,
  SaveUserFeedbackInput,
  SaveUserFeedbackOutput,
  SuggestGuideRouteInput,
  SuggestGuideRouteOutput,
  UpdateCharacterCustomizationInput,
  UpdateCharacterCustomizationOutput,
} from "../../functions/src/aiCompanion/types/api";
export type {
  Character,
  CharacterAppearance,
  CharacterPart,
  CharacterPartCategory,
  CharacterPartSelection,
  CharacterTone,
  UserCharacterCustomization,
} from "../../functions/src/aiCompanion/types/character";
export type { FeedbackEventType } from "../../functions/src/aiCompanion/types/events";
export type {
  CompanionGuideOutput,
  CompanionType,
  GeoPointInput,
  GuideMode,
  GuideSession,
  Mobility,
} from "../../functions/src/aiCompanion/types/guide";
export type { JourneyMemory } from "../../functions/src/aiCompanion/types/memory";
export type { GuideSessionMessage } from "../../functions/src/aiCompanion/types/message";
export type { NormalizedPlace } from "../../functions/src/aiCompanion/types/place";
export type { Relationship } from "../../functions/src/aiCompanion/types/relationship";
export type { RoutePlan } from "../../functions/src/aiCompanion/types/route";

export type TomoshibiAiError = {
  error: {
    code: string;
    message: string;
  };
};
