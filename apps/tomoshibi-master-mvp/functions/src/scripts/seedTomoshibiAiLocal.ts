import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Character, CharacterAppearance, CharacterPart } from "../aiCompanion/types/character";
import type { AreaMode, PlaceAnnotation } from "../aiCompanion/types/place";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required. Run with seed:tomoshibi-ai:emulator while Firestore Emulator is running.");
}

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "tomoshibi-950e2",
  });
}

const db = getFirestore();
const now = new Date().toISOString();

const characterCapabilities = {
  canSuggestFood: true,
  canSuggestCafe: true,
  canSuggestHistory: true,
  canSuggestNature: true,
  canSuggestWorkSpot: true,
  canSuggestActivity: true,
  canGuideAreaMode: true,
} as const;

const characters: Character[] = [
  {
    id: "tomoshibi",
    name: "トモシビ",
    description: "街歩きや外出に寄り添う相棒AI。",
    persona: {
      personality: ["穏やか", "押し付けない", "少し好奇心がある"],
      tone: "calm",
      firstPerson: "私",
      userCallNameDefault: "あなた",
      catchphrases: ["今日は無理せず歩こう"],
    },
    expressionStyle: {
      emotionalDistance: "balanced",
      humorLevel: "low",
      encouragementStyle: "thoughtful",
      explanationStyle: "conversational",
    },
    capabilities: characterCapabilities,
    defaultAppearanceId: "tomoshibi_default",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "akari",
    name: "アカリ",
    description: "少し明るく、外に出るきっかけをやさしく作る相棒AI。",
    persona: {
      personality: ["明るい", "やさしい", "好奇心がある"],
      tone: "friendly",
      firstPerson: "わたし",
      userCallNameDefault: "きみ",
      catchphrases: ["ちょっとだけ寄り道してみよ"],
    },
    expressionStyle: {
      emotionalDistance: "balanced",
      humorLevel: "medium",
      encouragementStyle: "cheerful",
      explanationStyle: "conversational",
    },
    capabilities: characterCapabilities,
    defaultAppearanceId: "akari_default",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "shion",
    name: "シオン",
    description: "静かに観察しながら、落ち着いた外出を一緒に考える相棒AI。",
    persona: {
      personality: ["静か", "観察上手", "丁寧"],
      tone: "gentle",
      firstPerson: "僕",
      userCallNameDefault: "あなた",
      catchphrases: ["急がなくていいと思う"],
    },
    expressionStyle: {
      emotionalDistance: "polite",
      humorLevel: "low",
      encouragementStyle: "soft",
      explanationStyle: "reflective",
    },
    capabilities: characterCapabilities,
    defaultAppearanceId: "shion_default",
    createdAt: now,
    updatedAt: now,
  },
];

const appearances: CharacterAppearance[] = [
  {
    id: "tomoshibi_default",
    characterId: "tomoshibi",
    displayName: "灯りの標準スタイル",
    baseStyle: "flat_avatar",
    parts: {
      faceShape: "face_round",
      eyes: "eyes_calm",
      mouth: "mouth_soft",
      hair: "hair_short_warm",
      outfit: "outfit_daily_coat",
      colorTheme: "theme_amber",
    },
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "akari_default",
    characterId: "akari",
    displayName: "明るい標準スタイル",
    baseStyle: "flat_avatar",
    parts: {
      faceShape: "face_round",
      eyes: "eyes_bright",
      mouth: "mouth_smile",
      hair: "hair_bob_light",
      outfit: "outfit_daily_parka",
      colorTheme: "theme_sunrise",
    },
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "shion_default",
    characterId: "shion",
    displayName: "静かな標準スタイル",
    baseStyle: "flat_avatar",
    parts: {
      faceShape: "face_soft",
      eyes: "eyes_calm",
      mouth: "mouth_neutral",
      hair: "hair_short_dark",
      outfit: "outfit_cardigan",
      colorTheme: "theme_mist",
    },
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
];

const characterParts: CharacterPart[] = [
  { id: "face_round", category: "faceShape", name: "やわらかい丸顔", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "face_soft", category: "faceShape", name: "おだやかな輪郭", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "eyes_calm", category: "eyes", name: "落ち着いた目", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "eyes_bright", category: "eyes", name: "明るい目", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "mouth_soft", category: "mouth", name: "やさしい口元", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "mouth_smile", category: "mouth", name: "小さな笑顔", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "mouth_neutral", category: "mouth", name: "静かな口元", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "hair_short_warm", category: "hair", name: "短めの暖色ヘア", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "hair_bob_light", category: "hair", name: "軽いボブ", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "hair_short_dark", category: "hair", name: "短めの暗色ヘア", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "outfit_daily_coat", category: "outfit", name: "日常のコート", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "outfit_daily_parka", category: "outfit", name: "軽いパーカー", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "outfit_cardigan", category: "outfit", name: "静かなカーディガン", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "theme_amber", category: "colorTheme", name: "灯りの琥珀", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "theme_sunrise", category: "colorTheme", name: "朝の光", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "theme_mist", category: "colorTheme", name: "薄い霧", rarity: "free", unlockCondition: { type: "free" }, createdAt: now, updatedAt: now },
  { id: "accessory_iki_shell", category: "accessory", name: "壱岐の小さな貝飾り", rarity: "area_limited", areaId: "iki", unlockCondition: { type: "area_visit", value: "iki" }, createdAt: now, updatedAt: now },
];

const areaMode: AreaMode = {
  id: "iki",
  name: "壱岐",
  description: "壱岐の自然、歴史、港町の空気を重ねた地域モード。",
  centerLat: 33.749,
  centerLng: 129.691,
  defaultRadiusMeters: 5000,
  featuredTags: ["history", "shrine", "scenic", "local_story", "sea"],
  createdAt: now,
  updatedAt: now,
};

const annotations: PlaceAnnotation[] = [
  {
    id: "iki_mock_quiet_park",
    areaId: areaMode.id,
    providerPlaceId: "mock-quiet-park",
    name: "静かな小さな公園",
    tomoshibiTags: ["quiet", "nature", "local_story"],
    localStory: {
      short: "地元の人が少し足を止めるような、静かな時間に合う場所として扱います。",
      source: "tomoshibi_seed",
    },
    recommendedFor: ["落ち着きたい", "軽く歩きたい"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "iki_mock_cafe",
    areaId: areaMode.id,
    providerPlaceId: "mock-cafe",
    name: "路地裏のカフェ",
    tomoshibiTags: ["cafe", "relax", "local_story"],
    localStory: {
      short: "歩き疲れたときに、次の行き先を考える休憩地点として扱います。",
      source: "tomoshibi_seed",
    },
    recommendedFor: ["カフェに行きたい", "落ち着きたい"],
    partner: {
      isPartner: false,
    },
    createdAt: now,
    updatedAt: now,
  },
];

async function main(): Promise<void> {
  await Promise.all(characters.map((character) => db.collection("characters").doc(character.id).set(character, { merge: true })));
  await Promise.all(appearances.map((appearance) => db.collection("characterAppearances").doc(appearance.id).set(appearance, { merge: true })));
  await Promise.all(characterParts.map((part) => db.collection("characterParts").doc(part.id).set(part, { merge: true })));
  await db.collection("areaModes").doc(areaMode.id).set(areaMode);
  await Promise.all(annotations.map((annotation) => db.collection("placeAnnotations").doc(annotation.id).set(annotation, { merge: true })));

  console.log(`Seeded TOMOSHIBI AI data: characters=${characters.length}, appearances=${appearances.length}, parts=${characterParts.length}, areaMode=${areaMode.id}, annotations=${annotations.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
