export type CharacterTone = "friendly" | "calm" | "energetic" | "mysterious" | "gentle" | "curious";

export type CharacterCapabilities = {
  canSuggestFood: true;
  canSuggestCafe: true;
  canSuggestHistory: true;
  canSuggestNature: true;
  canSuggestWorkSpot: true;
  canSuggestActivity: true;
  canGuideAreaMode: true;
};

export type Character = {
  id: string;
  name: string;
  description: string;
  persona: {
    personality: string[];
    tone: CharacterTone;
    firstPerson: string;
    userCallNameDefault: string;
    catchphrases?: string[];
    backstory?: string;
  };
  expressionStyle?: {
    emotionalDistance: "close" | "balanced" | "polite";
    humorLevel: "low" | "medium" | "high";
    encouragementStyle: "soft" | "cheerful" | "thoughtful" | "matter_of_fact";
    explanationStyle: "simple" | "reflective" | "conversational";
  };
  capabilities?: CharacterCapabilities;
  defaultAppearanceId?: string;
  guideStyle?: {
    detailLevel: "short" | "normal" | "deep";
    historyLevel: "low" | "medium" | "high";
    emotionalDistance: "close" | "balanced" | "polite";
    humorLevel: "low" | "medium" | "high";
  };
  createdAt: string;
  updatedAt: string;
};

export type CharacterPartCategory = "faceShape" | "eyes" | "eyebrows" | "mouth" | "hair" | "outfit" | "accessory" | "colorTheme";

export type CharacterPartSelection = Partial<Record<CharacterPartCategory, string>>;

export type CharacterAppearance = {
  id: string;
  characterId: string;
  displayName: string;
  baseStyle: "mii_like" | "duolingo_like" | "flat_avatar";
  previewImageUrl?: string;
  parts: CharacterPartSelection;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CharacterPart = {
  id: string;
  category: CharacterPartCategory;
  name: string;
  assetUrl?: string;
  rarity?: "free" | "standard" | "limited" | "area_limited" | "paid";
  areaId?: string;
  unlockCondition?: {
    type: "free" | "relationship_level" | "journey_completed" | "area_visit" | "purchase";
    value?: string | number;
  };
  createdAt: string;
  updatedAt: string;
};

export type UserCharacterCustomization = {
  id: string;
  userId: string;
  characterId: string;
  appearanceName?: string;
  selectedParts: CharacterPartSelection;
  unlockedPartIds: string[];
  lastUpdatedAt: string;
  createdAt: string;
};
