"use client";

import { useEffect, useRef, useState } from "react";
import {
  completeJourney,
  createGuideSession,
  getActiveGuideSession,
  getAvailableCharacters,
  getCharacterCustomization,
  getUserCompanionState,
  listGuideSessionMessages,
  listJourneyMemories,
  respondToCompanion,
  saveUserFeedback,
  suggestGuideRoute,
  TOMOSHIBI_AI_DEFAULT_CHARACTER_ID,
  TOMOSHIBI_AI_DEFAULT_USER_ID,
  updateCharacterCustomization,
} from "@/lib/tomoshibi-ai-api";
import type {
  Character,
  CharacterPart,
  CharacterPartCategory,
  CharacterPartSelection,
  CompanionGuideOutput,
  GetCharacterCustomizationOutput,
  GeoPointInput,
  GuideSessionMessage,
  JourneyMemory,
  Mobility,
  Relationship,
  RespondToCompanionOutput,
  SaveUserFeedbackInput,
  RoutePlan,
  UserCharacterCustomization,
} from "@/lib/tomoshibi-ai-types";

// ═══════════════════════════════════════════════════════════
// SVG コンポーネント
// ═══════════════════════════════════════════════════════════

function FlameSvg({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fg-outer" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFEEB0" />
          <stop offset="45%" stopColor="#F5902A" />
          <stop offset="100%" stopColor="#C84010" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fg-inner" cx="50%" cy="65%" r="45%">
          <stop offset="0%" stopColor="#FFFBE0" />
          <stop offset="100%" stopColor="#F5902A" />
        </radialGradient>
      </defs>
      <path d="M24 3C24 3 37 16 39 28C41 38 35 46 31 48C30 42 28 37 24 34C20 37 18 42 17 48C13 46 7 38 9 28C11 16 24 3 24 3Z" fill="url(#fg-outer)" />
      <path d="M24 16C24 16 30 24 31 32C32 38 28 42 26 44C25.5 40 25 37 24 35C23 37 22.5 40 22 44C20 42 16 38 17 32C18 24 24 16 24 16Z" fill="url(#fg-inner)" opacity="0.9" />
      <ellipse cx="24" cy="38" rx="4" ry="5" fill="#FFFEF0" opacity="0.65" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? c : "none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// 型定義
// ═══════════════════════════════════════════════════════════

type Tab = "home" | "map" | "conversation" | "record" | "settings";

type SuggestionData = {
  id: string;
  title: string;
  place: string;
  region: string;
  quote: string;
  highlightWords: string[];
  walkTime: string;
  distance: string;
  rating: string;
  category: string;
  categoryEmoji: string;
  storyText: string;
  tags: string[];
};

type Message = {
  id: string;
  type: "companion" | "user" | "suggestion";
  text?: string;
  suggestion?: SuggestionData;
  actions?: RespondToCompanionOutput["nextActions"];
};

type CompanionActionButton = NonNullable<RespondToCompanionOutput["nextActions"]>[number];

type CharacterCustomizationState = {
  customization: UserCharacterCustomization;
  availableParts: CharacterPart[];
  defaultAppearance?: GetCharacterCustomizationOutput["defaultAppearance"];
};

type GuideAreaMode = "nearby" | "iki";
type GuideOriginMode = "current" | "manual";

type GuidePreferenceState = {
  areaMode: GuideAreaMode;
  originMode: GuideOriginMode;
  manualOrigin: GeoPointInput;
  availableMinutes: number;
  mobility: Mobility;
  interests: string[];
  mood: string;
};

const GUIDE_AREA_OPTIONS: { value: GuideAreaMode; label: string }[] = [
  { value: "nearby", label: "現在地周辺" },
  { value: "iki", label: "壱岐" },
];

const GUIDE_ORIGIN_PRESETS: { id: string; label: string; origin: GeoPointInput; areaMode?: GuideAreaMode }[] = [
  { id: "tokyo_station", label: "東京駅", origin: { lat: 35.681236, lng: 139.767125, label: "東京駅" }, areaMode: "nearby" },
  { id: "iki_center", label: "壱岐中心", origin: { lat: 33.749, lng: 129.69, label: "壱岐" }, areaMode: "iki" },
  { id: "gonoura", label: "郷ノ浦", origin: { lat: 33.7459, lng: 129.6896, label: "郷ノ浦" }, areaMode: "iki" },
  { id: "ashibe", label: "芦辺", origin: { lat: 33.8002, lng: 129.7364, label: "芦辺" }, areaMode: "iki" },
];

const GUIDE_MINUTE_OPTIONS = [20, 30, 45, 60];

const GUIDE_MOBILITY_OPTIONS: { value: Mobility; label: string }[] = [
  { value: "walk", label: "徒歩" },
  { value: "bike", label: "自転車" },
  { value: "car", label: "車" },
  { value: "public_transport", label: "公共交通" },
];

const GUIDE_INTEREST_OPTIONS = [
  { value: "cafe", label: "カフェ" },
  { value: "quiet", label: "静か" },
  { value: "history", label: "歴史" },
  { value: "shrine", label: "神社" },
  { value: "scenic", label: "景色" },
  { value: "sea", label: "海" },
  { value: "local_story", label: "土地の話" },
];

const DEFAULT_GUIDE_PREFERENCES: GuidePreferenceState = {
  areaMode: "nearby",
  originMode: "current",
  manualOrigin: GUIDE_ORIGIN_PRESETS[0].origin,
  availableMinutes: 30,
  mobility: "walk",
  interests: ["cafe", "quiet"],
  mood: "少し外に出たい",
};

type GoogleMapInstance = {
  setCenter(center: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleMapBoundsInstance): void;
};

type GoogleMapBoundsInstance = {
  extend(latLng: { lat: number; lng: number }): void;
};

type GoogleMapMarkerInstance = {
  setMap(map: GoogleMapInstance | null): void;
};

type GoogleMapsWindow = Window & {
  __tomoshibiMasterMvpGoogleMapsLoaded?: () => void;
  google?: {
    maps?: {
      Map?: new (
        mapElement: HTMLElement,
        options: {
          center: { lat: number; lng: number };
          zoom: number;
          disableDefaultUI?: boolean;
          clickableIcons?: boolean;
          gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
          keyboardShortcuts?: boolean;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
          zoomControl?: boolean;
          styles?: Array<Record<string, unknown>>;
        },
      ) => GoogleMapInstance;
      Marker?: new (options: {
        map: GoogleMapInstance;
        position: { lat: number; lng: number };
        title?: string;
        icon?: {
          path: string;
          fillColor: string;
          fillOpacity: number;
          strokeColor: string;
          strokeWeight: number;
          scale: number;
          anchor?: { x: number; y: number };
        };
      }) => GoogleMapMarkerInstance;
      LatLngBounds?: new () => GoogleMapBoundsInstance;
      Point?: new (x: number, y: number) => { x: number; y: number };
      SymbolPath?: { CIRCLE: string };
    };
  };
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MASTER_MVP_MAP_SCRIPT_ID = "tomoshibi-master-mvp-google-maps-script";
const MASTER_MVP_MAP_CALLBACK = "__tomoshibiMasterMvpGoogleMapsLoaded";
const DEFAULT_MAP_CENTER = { lat: 35.681236, lng: 139.767125 };
const DEFAULT_MAP_ZOOM = 12;

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing"));
  }

  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.Map) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(MASTER_MVP_MAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.remove();
    }

    mapsWindow.__tomoshibiMasterMvpGoogleMapsLoaded = () => {
      resolve();
    };

    const script = document.createElement("script");
    script.id = MASTER_MVP_MAP_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja&region=JP&loading=async&callback=${MASTER_MVP_MAP_CALLBACK}`;
    script.async = true;
    script.defer = true;
    script.addEventListener(
      "error",
      () => {
        googleMapsScriptPromise = null;
        delete mapsWindow.__tomoshibiMasterMvpGoogleMapsLoaded;
        reject(new Error("Failed to load Google Maps script"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function routePlanToSuggestion(route: RoutePlan, companion?: CompanionGuideOutput | null): SuggestionData {
  const firstPlace = route.places[0]?.place;
  const routeSummary = companion?.routeSummaries.find((summary) => summary.routeId === route.id);
  const tags = route.tags.length > 0 ? route.tags : firstPlace?.tomoshibiTags ?? firstPlace?.types ?? [];
  const primaryTag = tags[0] ?? "外出";

  return {
    id: route.id,
    title: route.title,
    place: firstPlace?.name ?? "現在地周辺",
    region: firstPlace?.address ?? "現在地から",
    quote: routeSummary?.companionComment ?? routeSummary?.whyRecommended ?? route.concept,
    highlightWords: [],
    walkTime: `${route.estimatedMinutes}分`,
    distance: route.totalDistanceMeters ? `${(route.totalDistanceMeters / 1000).toFixed(1)}km` : `${route.places.length}箇所`,
    rating: typeof firstPlace?.rating === "number" ? firstPlace.rating.toFixed(1) : `${Math.round(route.score)}`,
    category: primaryTag,
    categoryEmoji: "📍",
    storyText:
      routeSummary?.whyRecommended ??
      firstPlace?.localStory?.short ??
      `${route.concept} ${route.places.map((item) => item.place.name).join("、")}をめぐる候補です。`,
    tags: tags.slice(0, 5),
  };
}

function routePlanToActions(route: RoutePlan): CompanionActionButton[] {
  const firstPlace = route.places[0]?.place;
  const payload = firstPlace ? { routeId: route.id, placeId: firstPlace.providerPlaceId } : { routeId: route.id };
  return [
    { label: "もっと知る", action: "tell_more", payload },
    { label: "保存", action: "save_place", payload },
    { label: "行った", action: "visited", payload },
  ];
}

function guideSessionMessageToMessage(message: GuideSessionMessage): Message {
  return {
    id: message.id,
    type: message.role === "user" ? "user" : "companion",
    text: message.content,
  };
}

function isCompanionActionType(value: string): value is NonNullable<Parameters<typeof respondToCompanion>[0]["action"]>["type"] {
  return [
    "tell_more",
    "change_mood",
    "skip_place",
    "save_place",
    "arrived",
    "visited",
    "liked",
    "not_interested",
    "next_suggestion",
  ].includes(value);
}

function feedbackTypeForUiAction(action: string): SaveUserFeedbackInput["type"] | null {
  if (action === "save_place" || action === "save_route") return "saved";
  if (action === "visited") return "visited";
  if (action === "arrived") return "arrived";
  if (action === "liked") return "liked";
  if (action === "not_interested") return "not_interested";
  if (action === "skip_place") return "skipped";
  if (action === "start_route") return "route_selected";
  return null;
}

function feedbackMessageForAction(action: string): string {
  if (action === "save_place" || action === "save_route") return "保存しました。次の提案にも反映します。";
  if (action === "visited") return "行った記録を残しました。今日のおしまいで思い出にまとめます。";
  if (action === "arrived") return "到着を記録しました。";
  if (action === "liked") return "気に入った記録を残しました。";
  if (action === "not_interested") return "興味なしとして記録しました。";
  if (action === "skip_place") return "この候補はスキップしました。";
  if (action === "start_route") return "このルートを選びました。";
  return "操作を記録しました。";
}

function companionActionKey(messageId: string, action: CompanionActionButton, index: number): string {
  const payload = action.payload ?? {};
  const placeId = typeof payload.placeId === "string" ? payload.placeId : "";
  const routeId = typeof payload.routeId === "string" ? payload.routeId : "";
  return `${messageId}-${index}-${action.action}-${action.label}-${routeId}-${placeId}`;
}

function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("このブラウザでは現在地を取得できません。"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.code === error.PERMISSION_DENIED ? "位置情報の許可が必要です。" : "現在地を取得できませんでした。"));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );
  });
}

async function resolveGuideOrigin(preferences: GuidePreferenceState): Promise<GeoPointInput> {
  if (preferences.originMode === "manual") {
    validateManualOrigin(preferences.manualOrigin);
    return preferences.manualOrigin;
  }

  try {
    return await getBrowserLocation();
  } catch (error) {
    validateManualOrigin(preferences.manualOrigin);
    return {
      ...preferences.manualOrigin,
      label:
        preferences.manualOrigin.label ??
        (error instanceof Error ? `手動地点（${error.message}）` : "手動地点"),
    };
  }
}

function validateManualOrigin(origin: GeoPointInput): void {
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    throw new Error("現在地を取得できませんでした。地点指定の緯度・経度を確認してください。");
  }
}

function getTimeGreeting(): { line1: string; line2: string } {
  const h = new Date().getHours();
  if (h < 6)  return { line1: "こんな夜中に、起きてたの？", line2: "静かな時間だね。何か話そう。" };
  if (h < 11) return { line1: "おはよう。今日も一緒に冒険しよ？", line2: "朝の空気、外で吸ってみない？" };
  if (h < 14) return { line1: "お昼だよ。どこか行きたい気分じゃない？", line2: "いい場所、知ってるよ。" };
  if (h < 17) return { line1: "午後の光、外で感じてみない？", line2: "今日の空、特別な気がする。" };
  if (h < 20) return { line1: "夕方の光、今日は特別きれいな気がする。", line2: "どこかに寄って帰ろうか。" };
  return { line1: "今夜はどんな話、聞かせてくれる？", line2: "ゆっくり話そう。" };
}

// ═══════════════════════════════════════════════════════════
// ハイライトテキスト
// ═══════════════════════════════════════════════════════════

function HighlightedText({ text, words }: { text: string; words: string[] }) {
  if (words.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        words.includes(part) ? (
          <span key={i} className="text-[#E8722A] font-semibold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const CHARACTER_PART_CATEGORIES: CharacterPartCategory[] = [
  "faceShape",
  "eyes",
  "eyebrows",
  "mouth",
  "hair",
  "outfit",
  "accessory",
  "colorTheme",
];

const CHARACTER_PART_LABELS: Record<CharacterPartCategory, string> = {
  faceShape: "輪郭",
  eyes: "目",
  eyebrows: "眉",
  mouth: "口元",
  hair: "髪型",
  outfit: "服装",
  accessory: "アクセサリ",
  colorTheme: "テーマカラー",
};

function formatJourneyDate(isoString?: string): string {
  if (!isoString) return "記録未設定";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "記録未設定";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function groupPartsByCategory(parts: CharacterPart[]): Record<CharacterPartCategory, CharacterPart[]> {
  return CHARACTER_PART_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = parts.filter((part) => part.category === category);
      return acc;
    },
    {} as Record<CharacterPartCategory, CharacterPart[]>,
  );
}

// ═══════════════════════════════════════════════════════════
// 外出提案詳細オーバーレイ
// ═══════════════════════════════════════════════════════════

function SuggestionDetailOverlay({
  suggestion,
  companionName,
  onClose,
  onGo,
}: {
  suggestion: SuggestionData;
  companionName: string;
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto"
      style={{ animation: "fade-in 0.2s ease-out" }}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* スライドアップパネル */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#F5F0E8] rounded-t-3xl overflow-hidden flex flex-col"
        style={{ height: "92dvh", animation: "slide-up 0.38s cubic-bezier(0.16,1,0.3,1)" }}
      >

        {/* ── ヒーロービジュアル ── */}
        <div className="relative flex-shrink-0" style={{ height: "42%" }}>
          {/* 背景（ダーク・ミステリアス） */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0603] via-[#1A0F06] to-[#2A1C10]" />

          {/* 炎グロー演出 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-[#E8722A] opacity-15 blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flame-animate opacity-40">
              <FlameSvg size={72} />
            </div>
          </div>

          {/* 上部ボタン行 */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5 pb-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:opacity-70"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={onClose}
              className="text-white/70 text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full active:opacity-70"
            >
              あとで
            </button>
          </div>

          {/* スポット情報オーバーレイ（下部） */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-[#140E09] to-transparent pt-10">
            <span className="bg-[#E8722A] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              {suggestion.categoryEmoji} {suggestion.category}
            </span>
            <h2 className="text-white text-xl font-bold font-headline mt-2">{suggestion.title}</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">{suggestion.place} · {suggestion.region}</p>
          </div>
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-8 flex flex-col gap-5">

            {/* コンパニオンのことば */}
            <div className="bg-white rounded-2xl px-4 py-4 border border-[#D4C9B8] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                  <FlameSvg size={16} />
                </div>
                <span className="text-[#9C8B78] text-[10px] font-semibold tracking-wider uppercase">{companionName}のことば</span>
              </div>
              <p className="text-[#2A1C10] text-sm leading-relaxed italic">
                「<HighlightedText text={suggestion.quote} words={suggestion.highlightWords} />」
              </p>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center gap-3">
              {[
                { icon: "🚶", label: suggestion.walkTime },
                { icon: "📍", label: suggestion.distance },
                { icon: "⭐", label: suggestion.rating },
              ].map((item) => (
                <div key={item.label} className="flex-1 bg-white rounded-xl border border-[#D4C9B8] px-3 py-2.5 flex flex-col items-center gap-0.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[#2A1C10] text-xs font-semibold">{item.label}</span>
                </div>
              ))}
            </div>

            {/* 物語の導入テキスト */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[#D4C9B8]" />
                <span className="text-[#9C8B78] text-[10px] font-semibold tracking-wider uppercase">物語の導入</span>
                <div className="h-px flex-1 bg-[#D4C9B8]" />
              </div>
              <p className="text-[#3A2A18] text-sm leading-[1.9] tracking-wide">
                {suggestion.storyText}
              </p>
            </div>

            {/* タグ */}
            <div className="flex flex-wrap gap-2">
              {suggestion.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white border border-[#D4C9B8] text-[#9C8B78] text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── アクションボタン ── */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 bg-[#F5F0E8] border-t border-[#D4C9B8]">
          <button
            onClick={onGo}
            className="w-full bg-[#E8722A] text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-[#E8722A]/25 active:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <div className="flame-animate"><FlameSvg size={20} /></div>
            行く
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 text-[#9C8B78] text-sm py-2 active:opacity-70"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 提案カード（会話・ホーム共通）
// ═══════════════════════════════════════════════════════════

function SuggestionCard({
  suggestion,
  onTap,
  compact = false,
}: {
  suggestion: SuggestionData;
  onTap: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-[#D4C9B8] shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
      onClick={onTap}
    >
      <div
        className={`bg-gradient-to-br from-[#1A0F06] via-[#2A1C10] to-[#4A2A10] flex items-center justify-center relative overflow-hidden ${compact ? "h-28" : "h-44"}`}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full bg-[#E8722A] opacity-20 blur-2xl" />
        <div className="flame-animate opacity-60">
          <FlameSvg size={compact ? 38 : 56} />
        </div>
        <span className="absolute top-3 left-3 bg-[#E8722A] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
          {suggestion.categoryEmoji} {suggestion.category}
        </span>
        <span className="absolute bottom-2 right-3 text-white/25 text-[9px]">スポット画像</span>
      </div>
      <div className="px-4 py-3">
        <h3 className={`text-[#2A1C10] font-bold font-headline ${compact ? "text-sm" : "text-base"} mb-1`}>
          {suggestion.title}
        </h3>
        <p className="text-[#9C8B78] text-xs leading-relaxed mb-2.5 line-clamp-2 italic">
          「{suggestion.quote}」
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#9C8B78]">
            <span>🚶 {suggestion.walkTime}</span>
            <span>📍 {suggestion.place}</span>
          </div>
          <button
            className="bg-[#E8722A] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full active:opacity-80"
            onClick={(e) => { e.stopPropagation(); onTap(); }}
          >
            詳しく見る →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ホーム画面
// ═══════════════════════════════════════════════════════════

function HomeScreen({
  companionName,
  companionDescription,
  relationship,
  routeSuggestions = [],
  journeys = [],
  characters = [],
  selectedCharacterId,
  guidePreferences,
  integrationStatus,
  integrationError,
  onOpenChat,
  onSuggestionTap,
  onStartGuide,
  onSelectCharacter,
  onGuidePreferenceChange,
}: {
  companionName: string;
  companionDescription: string;
  relationship: Relationship | null;
  routeSuggestions: SuggestionData[];
  journeys: JourneyMemory[];
  characters: Character[];
  selectedCharacterId: string;
  guidePreferences: GuidePreferenceState;
  integrationStatus: "idle" | "loading" | "ready" | "error";
  integrationError: string | null;
  onOpenChat: () => void;
  onSuggestionTap: (s: SuggestionData) => void;
  onStartGuide: () => void;
  onSelectCharacter: (characterId: string) => void;
  onGuidePreferenceChange: (preferences: GuidePreferenceState) => void;
}) {
  const [greeting] = useState(() => getTimeGreeting());
  const primarySuggestion = routeSuggestions[0] ?? null;
  const setGuidePreference = <TKey extends keyof GuidePreferenceState>(
    key: TKey,
    value: GuidePreferenceState[TKey],
  ) => {
    onGuidePreferenceChange({ ...guidePreferences, [key]: value });
  };
  const toggleInterest = (interest: string) => {
    const interests = guidePreferences.interests.includes(interest)
      ? guidePreferences.interests.filter((item) => item !== interest)
      : [...guidePreferences.interests, interest];
    onGuidePreferenceChange({ ...guidePreferences, interests });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ヒーロー */}
      <div className="bg-[#140E09] px-5 pt-4 pb-7 flex flex-col items-center relative overflow-hidden flex-shrink-0">
        <div className="w-full flex items-center justify-between mb-7">
          <span className="text-[#E8722A] font-bold text-base tracking-[0.18em] font-headline">TOMOSHIBI</span>
          <button className="w-9 h-9 rounded-full border border-[#3A2A18] flex items-center justify-center active:opacity-70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8B78" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
        <div className="glow-animate absolute top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#E8722A] opacity-[0.08] blur-3xl pointer-events-none" />
        <div className="relative mb-4 fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-24 h-24 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center shadow-xl">
            <div className="flame-animate"><FlameSvg size={52} /></div>
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#E8722A] border-2 border-[#140E09]" />
        </div>
        <div className="fade-in-up text-center mb-5" style={{ animationDelay: "0.2s" }}>
          <p className="text-[#9C8B78] text-[10px] tracking-[0.2em] uppercase mb-1">あなたのコンパニオン</p>
          <h2 className="text-white text-xl font-bold font-headline">{companionName}</h2>
          <p className="text-[#9C8B78] text-[11px] mt-1 max-w-64 line-clamp-2">{companionDescription}</p>
        </div>
        {characters.length > 0 && (
          <div className="fade-in-up mb-4 flex w-full gap-2 overflow-x-auto" style={{ animationDelay: "0.25s" }}>
            {characters.map((character) => (
              <button
                key={character.id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  selectedCharacterId === character.id
                    ? "border-[#E8722A] bg-[#E8722A] text-white"
                    : "border-[#3A2A18] bg-[#2A1C10] text-[#D4C9B8]"
                }`}
                type="button"
                onClick={() => onSelectCharacter(character.id)}
              >
                {character.name}
              </button>
            ))}
          </div>
        )}
        <button onClick={onOpenChat} className="fade-in-up w-full active:opacity-80" style={{ animationDelay: "0.3s" }}>
          <div className="bg-[#2A1C10] rounded-2xl rounded-tl-sm px-5 py-4 border border-[#3A2A18] text-left">
            <p className="text-white text-sm leading-relaxed">{greeting.line1}</p>
            <p className="text-[#9C8B78] text-xs mt-1">{greeting.line2}</p>
            <p className="text-[#E8722A] text-[10px] mt-2 font-medium">
              {relationship ? `Lv.${relationship.relationshipLevel} · ${relationship.totalSessions}回の外出` : "話しかける →"}
            </p>
          </div>
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 flex flex-col gap-5">
        <section className="fade-in-up rounded-2xl border border-[#D4C9B8] bg-white px-4 py-4 shadow-sm" style={{ animationDelay: "0.35s" }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9C8B78]">GUIDE MODE</p>
              <h3 className="text-sm font-bold text-[#2A1C10] font-headline">外出条件</h3>
            </div>
            <span className="rounded-full bg-[#F5F0E8] px-2.5 py-1 text-[10px] font-bold text-[#9C8B78]">
              {guidePreferences.areaMode === "iki" ? "壱岐モード" : "日常散歩"}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            {GUIDE_AREA_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  guidePreferences.areaMode === option.value
                    ? "border-[#E8722A] bg-[#E8722A] text-white"
                    : "border-[#D4C9B8] bg-[#F9F6F0] text-[#2A1C10]"
                }`}
                onClick={() => {
                  const nextInterests =
                    option.value === "iki"
                      ? ["history", "shrine", "scenic", "local_story", "sea"]
                      : ["cafe", "quiet"];
                  const nextPreset =
                    option.value === "iki"
                      ? GUIDE_ORIGIN_PRESETS.find((preset) => preset.id === "iki_center") ?? GUIDE_ORIGIN_PRESETS[0]
                      : GUIDE_ORIGIN_PRESETS[0];
                  onGuidePreferenceChange({
                    ...guidePreferences,
                    areaMode: option.value,
                    originMode: option.value === "iki" ? "manual" : guidePreferences.originMode,
                    manualOrigin: option.value === "iki" ? nextPreset.origin : guidePreferences.manualOrigin,
                    interests: nextInterests,
                  });
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            {(
              [
                { value: "current" as GuideOriginMode, label: "現在地を使う" },
                { value: "manual" as GuideOriginMode, label: "地点を指定" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  guidePreferences.originMode === option.value
                    ? "border-[#2A1C10] bg-[#2A1C10] text-white"
                    : "border-[#D4C9B8] bg-[#F9F6F0] text-[#2A1C10]"
                }`}
                onClick={() => setGuidePreference("originMode", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {guidePreferences.originMode === "manual" && (
            <div className="mb-3 rounded-xl border border-[#D4C9B8] bg-[#F9F6F0] px-3 py-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {GUIDE_ORIGIN_PRESETS.filter((preset) => !preset.areaMode || preset.areaMode === guidePreferences.areaMode).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      guidePreferences.manualOrigin.label === preset.origin.label
                        ? "border-[#E8722A] bg-[#E8722A]/10 text-[#E8722A]"
                        : "border-[#D4C9B8] bg-white text-[#9C8B78]"
                    }`}
                    onClick={() => setGuidePreference("manualOrigin", preset.origin)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border border-[#D4C9B8] bg-white px-2 py-2 text-xs text-[#2A1C10] outline-none"
                  inputMode="decimal"
                  value={String(guidePreferences.manualOrigin.lat)}
                  onChange={(event) =>
                    setGuidePreference("manualOrigin", {
                      ...guidePreferences.manualOrigin,
                      lat: Number(event.target.value),
                    })
                  }
                  placeholder="緯度"
                />
                <input
                  className="rounded-lg border border-[#D4C9B8] bg-white px-2 py-2 text-xs text-[#2A1C10] outline-none"
                  inputMode="decimal"
                  value={String(guidePreferences.manualOrigin.lng)}
                  onChange={(event) =>
                    setGuidePreference("manualOrigin", {
                      ...guidePreferences.manualOrigin,
                      lng: Number(event.target.value),
                    })
                  }
                  placeholder="経度"
                />
              </div>
              <input
                className="mt-2 w-full rounded-lg border border-[#D4C9B8] bg-white px-2 py-2 text-xs text-[#2A1C10] outline-none placeholder:text-[#9C8B78]"
                value={guidePreferences.manualOrigin.label ?? ""}
                onChange={(event) =>
                  setGuidePreference("manualOrigin", {
                    ...guidePreferences.manualOrigin,
                    label: event.target.value,
                  })
                }
                placeholder="地点名"
              />
            </div>
          )}

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {GUIDE_MINUTE_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  guidePreferences.availableMinutes === minutes
                    ? "border-[#E8722A] bg-[#E8722A] text-white"
                    : "border-[#D4C9B8] bg-white text-[#9C8B78]"
                }`}
                onClick={() => setGuidePreference("availableMinutes", minutes)}
              >
                {minutes}分
              </button>
            ))}
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {GUIDE_MOBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  guidePreferences.mobility === option.value
                    ? "border-[#2A1C10] bg-[#2A1C10] text-white"
                    : "border-[#D4C9B8] bg-white text-[#9C8B78]"
                }`}
                onClick={() => setGuidePreference("mobility", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {GUIDE_INTEREST_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  guidePreferences.interests.includes(option.value)
                    ? "border-[#E8722A] bg-[#E8722A]/10 text-[#E8722A]"
                    : "border-[#D4C9B8] bg-white text-[#9C8B78]"
                }`}
                onClick={() => toggleInterest(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <input
            className="w-full rounded-xl border border-[#D4C9B8] bg-[#F9F6F0] px-3 py-2 text-xs text-[#2A1C10] outline-none placeholder:text-[#9C8B78]"
            value={guidePreferences.mood}
            onChange={(event) => setGuidePreference("mood", event.target.value)}
            placeholder="今の気分"
          />
        </section>

        <section className="fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase">✦ {companionName}からの提案</p>
            <button
              className="rounded-full bg-[#E8722A] px-3 py-1.5 text-[10px] font-bold text-white active:opacity-80 disabled:bg-[#D4C9B8]"
              disabled={integrationStatus === "loading"}
              type="button"
              onClick={onStartGuide}
            >
              {integrationStatus === "loading" ? "検索中" : "現在地で探す"}
            </button>
          </div>
          {integrationError && (
            <p className="mb-2 rounded-xl border border-[#E8722A]/20 bg-[#E8722A]/10 px-3 py-2 text-xs text-[#9C5A28]">
              {integrationError}
            </p>
          )}
          {primarySuggestion ? (
            <SuggestionCard suggestion={primarySuggestion} onTap={() => onSuggestionTap(primarySuggestion)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D4C9B8] bg-white/70 px-4 py-5 text-sm leading-relaxed text-[#9C8B78]">
              {integrationStatus === "loading"
                ? "現在地と相棒の状態から候補を探しています。"
                : "まだ候補はありません。現在地で探すと、バックエンドから提案を取得します。"}
            </div>
          )}
          {routeSuggestions.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {routeSuggestions.slice(1, 4).map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="shrink-0 rounded-xl border border-[#D4C9B8] bg-white px-3 py-2 text-left shadow-sm"
                  type="button"
                  onClick={() => onSuggestionTap(suggestion)}
                >
                  <span className="block max-w-36 truncate text-xs font-bold text-[#2A1C10]">{suggestion.title}</span>
                  <span className="text-[10px] text-[#9C8B78]">{suggestion.walkTime} · {suggestion.place}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-2">✦ 最近の思い出</p>
          {journeys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D4C9B8] bg-white/70 px-4 py-5 text-sm leading-relaxed text-[#9C8B78]">
              外出を完了すると、ここに {companionName} との記録が追加されます。
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {journeys.slice(0, 3).map((journey) => (
                <div key={journey.id} className="bg-white/70 rounded-2xl border border-[#D4C9B8] px-4 py-3 flex items-start gap-3 w-full text-left">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F0E8] border border-[#D4C9B8] flex items-center justify-center flex-shrink-0 text-xl">🔥</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2A1C10] text-sm font-medium">{journey.title}</p>
                    <p className="text-[#9C8B78] text-xs">{formatJourneyDate(journey.createdAt)} · {journey.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 会話画面
// ═══════════════════════════════════════════════════════════

function ConversationScreen({
  companionName,
  messages,
  hasActiveSession,
  isSending,
  onSendToCompanion,
  onCompleteJourney,
  onSuggestionTap,
  onRunAction,
}: {
  companionName: string;
  messages: Message[];
  hasActiveSession: boolean;
  isSending: boolean;
  onSendToCompanion: (message: string) => Promise<RespondToCompanionOutput | null>;
  onCompleteJourney: () => Promise<void>;
  onSuggestionTap: (s: SuggestionData) => void;
  onRunAction: (action: NonNullable<Message["actions"]>[number]) => void;
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const nextInput = inputText.trim();
    setInputText("");
    void onSendToCompanion(nextInput);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
          <div className="flame-animate"><FlameSvg size={22} /></div>
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-sm font-headline">{companionName}</h2>
          <p className="text-[#E8722A] text-[10px]">● オンライン</p>
        </div>
        <button
          onClick={() => void onCompleteJourney()}
          className="text-[#E8722A] text-xs border border-[#E8722A]/40 bg-[#E8722A]/10 px-3 py-1.5 rounded-full active:opacity-70 font-medium"
        >
          今日のおしまい
        </button>
      </div>

      {/* メッセージ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {!hasActiveSession && (
          <div className="rounded-2xl border border-dashed border-[#D4C9B8] bg-white/80 px-4 py-5 text-sm leading-relaxed text-[#9C8B78]">
            ホームで「現在地で探す」を押すと、相棒との外出会話が始まります。
          </div>
        )}
        {messages.map((msg) => {
          if (msg.type === "user") {
            return (
              <div key={msg.id} className="flex justify-end fade-in-up">
                <div className="bg-[#E8722A] text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm max-w-[75%] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }
          if (msg.type === "suggestion" && msg.suggestion) {
            return (
              <div key={msg.id} className="flex items-end gap-2 fade-in-up">
                <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                  <FlameSvg size={18} />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <SuggestionCard
                    suggestion={msg.suggestion}
                    onTap={() => onSuggestionTap(msg.suggestion!)}
                    compact
                  />
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.actions.map((action, index) => (
                        <button
                          key={companionActionKey(msg.id, action, index)}
                          className="rounded-full border border-[#D4C9B8] bg-white px-2.5 py-1 text-[10px] font-bold text-[#9C8B78]"
                          type="button"
                          onClick={() => onRunAction(action)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex items-end gap-2 fade-in-up">
              <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                <FlameSvg size={18} />
              </div>
              <div className="bg-white border border-[#D4C9B8] text-[#2A1C10] text-sm px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] leading-relaxed shadow-sm">
                {msg.text}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.slice(0, 3).map((action, index) => (
                      <button
                        key={companionActionKey(msg.id, action, index)}
                        className="rounded-full border border-[#D4C9B8] bg-[#F5F0E8] px-2.5 py-1 text-[10px] font-bold text-[#9C8B78]"
                        type="button"
                        onClick={() => onRunAction(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-end gap-2 fade-in-up">
            <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
              <FlameSvg size={18} />
            </div>
            <div className="bg-white border border-[#D4C9B8] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9C8B78]"
                  style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力 */}
      <div className="px-4 py-3 bg-[#F5F0E8] border-t border-[#D4C9B8] flex-shrink-0">
        <div className="bg-white border border-[#D4C9B8] rounded-2xl shadow-sm flex items-center gap-2 px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-[#2A1C10] flex items-center justify-center flex-shrink-0">
            <FlameSvg size={16} />
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`${companionName}に話しかける…`}
            className="flex-1 text-sm text-[#2A1C10] placeholder-[#9C8B78] bg-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!hasActiveSession || !inputText.trim() || isSending}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${inputText.trim() ? "bg-[#E8722A]" : "bg-[#D4C9B8]"}`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 記録画面
// ═══════════════════════════════════════════════════════════

function RecordScreen({
  companionName,
  journeys,
  relationship,
}: {
  companionName: string;
  journeys: JourneyMemory[];
  relationship: Relationship | null;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-lg font-headline">記録</h1>
          <span className="text-[#9C8B78] text-xs">{journeys.length}回の外出</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-4 rounded-3xl bg-[#140E09] p-5 text-white">
          <p className="text-[10px] tracking-[0.18em] text-[#9C8B78]">COMPANION STATE</p>
          <h2 className="mt-1 text-lg font-bold font-headline">{companionName}</h2>
          <p className="mt-2 text-sm text-[#D4C9B8]">
            {relationship
              ? `関係性Lv.${relationship.relationshipLevel} / 外出${relationship.totalSessions}回 / 訪問地点${relationship.totalVisitedPlaces}件`
              : "まだ関係性データはありません。外出を重ねると状態が更新されます。"}
          </p>
        </div>

        {journeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D4C9B8] bg-white px-4 py-5 text-sm leading-relaxed text-[#9C8B78]">
            まだ記録はありません。会話から外出を完了すると、ここにバックエンド由来の記録が表示されます。
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {journeys.map((journey) => (
              <div key={journey.id} className="rounded-2xl border border-[#D4C9B8] bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9C8B78]">{formatJourneyDate(journey.createdAt)}</p>
                    <h3 className="text-base font-bold text-[#2A1C10] font-headline">{journey.title}</h3>
                  </div>
                  <span className="rounded-full bg-[#F5F0E8] px-2.5 py-1 text-[10px] font-bold text-[#9C8B78]">Journey</span>
                </div>
                <p className="text-sm leading-relaxed text-[#3A2A18]">{journey.summary}</p>
                <div className="mt-3 rounded-xl border border-[#F5F0E8] bg-[#F9F6F0] px-3 py-3 text-xs leading-relaxed text-[#3A2A18]">
                  「{journey.companionMessage}」
                </div>
                {journey.visitedPlaces.length > 0 && (
                  <p className="mt-3 text-xs text-[#9C8B78]">
                    訪問: {journey.visitedPlaces.map((place) => place.name).join("、")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {journey.learnedPreferences && journey.learnedPreferences.length > 0 ? (
                    journey.learnedPreferences.map((preference) => (
                      <span key={preference} className="rounded-full border border-[#D4C9B8] bg-white px-2.5 py-1 text-[10px] font-bold text-[#9C8B78]">
                        {preference}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#9C8B78]">学習済みの好みはまだありません。</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 設定画面
// ═══════════════════════════════════════════════════════════

function SettingsScreen({
  companionName,
  characters,
  selectedCharacterId,
  relationship,
  customizationState,
  status,
  error,
  onSelectCharacter,
  onSaveCustomization,
}: {
  companionName: string;
  characters: Character[];
  selectedCharacterId: string;
  relationship: Relationship | null;
  customizationState: CharacterCustomizationState | null;
  status: "idle" | "loading" | "saving" | "error";
  error: string | null;
  onSelectCharacter: (characterId: string) => void;
  onSaveCustomization: (selectedParts: CharacterPartSelection) => Promise<void>;
}) {
  const [draftParts, setDraftParts] = useState<CharacterPartSelection>(
    () => customizationState?.customization.selectedParts ?? {},
  );

  const groupedParts = customizationState ? groupPartsByCategory(customizationState.availableParts) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex-shrink-0">
        <h1 className="text-white font-bold text-lg font-headline">設定</h1>
        <p className="mt-1 text-xs text-[#9C8B78]">{companionName} の状態と見た目をバックエンド経由で管理します。</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {characters.map((character) => (
            <button
              key={character.id}
              type="button"
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                selectedCharacterId === character.id
                  ? "border-[#E8722A] bg-[#E8722A] text-white"
                  : "border-[#D4C9B8] bg-white text-[#2A1C10]"
              }`}
              onClick={() => onSelectCharacter(character.id)}
            >
              {character.name}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-[#D4C9B8] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9C8B78]">RELATIONSHIP</p>
          <p className="mt-2 text-sm font-semibold text-[#2A1C10]">
            {relationship
              ? `Lv.${relationship.relationshipLevel} / 外出${relationship.totalSessions}回 / 訪問${relationship.totalVisitedPlaces}件`
              : "関係性データはまだありません。"}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-[#E8722A]/20 bg-[#E8722A]/10 px-3 py-2 text-xs text-[#9C5A28]">
            {error}
          </p>
        )}

        {status === "loading" && (
          <div className="rounded-2xl border border-dashed border-[#D4C9B8] bg-white px-4 py-5 text-sm text-[#9C8B78]">
            カスタマイズ情報を取得しています。
          </div>
        )}

        {status !== "loading" && customizationState && groupedParts && (
          <div className="flex flex-col gap-4">
            {CHARACTER_PART_CATEGORIES.map((category) => {
              const parts = groupedParts[category];
              if (parts.length === 0) return null;
              return (
                <section key={category} className="rounded-2xl border border-[#D4C9B8] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#2A1C10]">{CHARACTER_PART_LABELS[category]}</h3>
                    <span className="text-[10px] text-[#9C8B78]">{parts.length}件</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parts.map((part) => (
                      <button
                        key={part.id}
                        type="button"
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                          draftParts[category] === part.id
                            ? "border-[#E8722A] bg-[#E8722A] text-white"
                            : "border-[#D4C9B8] bg-[#F9F6F0] text-[#2A1C10]"
                        }`}
                        onClick={() => setDraftParts((prev) => ({ ...prev, [category]: part.id }))}
                      >
                        {part.name}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            <button
              type="button"
              className="rounded-2xl bg-[#E8722A] px-4 py-3 text-sm font-bold text-white disabled:bg-[#D4C9B8]"
              disabled={status === "saving"}
              onClick={() => void onSaveCustomization(draftParts)}
            >
              {status === "saving" ? "保存中" : "見た目を保存"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MapScreen({ routes = [] }: { routes?: RoutePlan[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRefs = useRef<GoogleMapMarkerInstance[]>([]);
  const routeMarkerRefs = useRef<GoogleMapMarkerInstance[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing-key" | "error">(
    GOOGLE_MAPS_API_KEY ? "loading" : "missing-key",
  );
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "ready" | "unavailable" | "denied">(
    "idle",
  );

  useEffect(() => {
    let disposed = false;

    if (!GOOGLE_MAPS_API_KEY) {
      return;
    }

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (disposed || !mapContainerRef.current) return;

        const mapsApi = (window as GoogleMapsWindow).google?.maps;
        const MapCtor = mapsApi?.Map;
        if (!MapCtor) {
          setStatus("error");
          return;
        }

        mapRef.current = new MapCtor(mapContainerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          keyboardShortcuts: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#A9D6E8" }] },
            { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#F0E7D6" }] },
          ],
        });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      disposed = true;
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      routeMarkerRefs.current.forEach((marker) => marker.setMap(null));
      routeMarkerRefs.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;

    const mapsApi = (window as GoogleMapsWindow).google?.maps;
    const MarkerCtor = mapsApi?.Marker;
    if (!MarkerCtor || !("geolocation" in navigator)) {
      window.setTimeout(() => setLocationStatus("unavailable"), 0);
      return;
    }

    let disposed = false;
    window.setTimeout(() => {
      if (!disposed) setLocationStatus("requesting");
    }, 0);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (disposed || !mapRef.current) return;

        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const icon =
          mapsApi?.SymbolPath?.CIRCLE && mapsApi.Point
            ? {
                path: mapsApi.SymbolPath.CIRCLE,
                fillColor: "#E8722A",
                fillOpacity: 0.95,
                strokeColor: "#FFFFFF",
                strokeWeight: 3,
                scale: 10,
                anchor: new mapsApi.Point(0, 0),
              }
            : undefined;

        markerRefs.current.forEach((marker) => marker.setMap(null));
        markerRefs.current = [
          new MarkerCtor({
            map: mapRef.current,
            position: currentLocation,
            title: "現在地",
            icon,
          }),
        ];
        mapRef.current.setCenter(currentLocation);
        mapRef.current.setZoom(15);
        setLocationStatus("ready");
      },
      (error) => {
        if (disposed) return;
        setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    );

    return () => {
      disposed = true;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || routes.length === 0) return;
    const mapsApi = (window as GoogleMapsWindow).google?.maps;
    const MarkerCtor = mapsApi?.Marker;
    const LatLngBoundsCtor = mapsApi?.LatLngBounds;
    if (!MarkerCtor) return;

    routeMarkerRefs.current.forEach((marker) => marker.setMap(null));
    routeMarkerRefs.current = [];

    const routePlaces = routes.flatMap((route) => route.places.map((item) => item.place));
    routeMarkerRefs.current = routePlaces.map(
      (place) =>
        new MarkerCtor({
          map: mapRef.current as GoogleMapInstance,
          position: { lat: place.lat, lng: place.lng },
          title: place.name,
        }),
    );

    if (LatLngBoundsCtor && routePlaces.length > 0) {
      const bounds = new LatLngBoundsCtor();
      routePlaces.forEach((place) => bounds.extend({ lat: place.lat, lng: place.lng }));
      mapRef.current.fitBounds(bounds);
    }
  }, [routes, status]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <p className="text-[#E8722A] text-[10px] font-bold tracking-[0.18em] font-headline">MAP</p>
          <h1 className="text-white font-bold text-lg font-headline">地図</h1>
        </div>
        <span className="rounded-full border border-[#3A2A18] bg-[#2A1C10] px-3 py-1 text-[11px] font-semibold text-[#D4C9B8]">
          現在地
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden bg-[#D4C9B8]">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F0E8]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flame-animate">
                <FlameSvg size={42} />
              </div>
              <p className="text-sm font-semibold text-[#2A1C10]">地図を読み込み中</p>
            </div>
          </div>
        )}

        {status === "missing-key" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F0E8] px-8 text-center">
            <div>
              <h3 className="mb-2 text-base font-bold text-[#2A1C10] font-headline">Google Maps API key が未設定です</h3>
              <p className="text-sm leading-relaxed text-[#9C8B78]">
                apps/tomoshibi-master-mvp/.env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください。
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F0E8] px-8 text-center">
            <div>
              <h3 className="mb-2 text-base font-bold text-[#2A1C10] font-headline">地図を表示できませんでした</h3>
              <p className="text-sm leading-relaxed text-[#9C8B78]">Google Maps JavaScript API の読み込みを確認してください。</p>
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
            <div className="explore-sheet-surface is-open pointer-events-auto rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#9C8B78]">AROUND YOU</p>
                  <h2 className="text-sm font-bold text-[#2A1C10] font-headline">
                    {routes.length > 0 ? `${routes.length}件の提案` : "現在地"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#E8722A]/10 px-2.5 py-1 text-[10px] font-bold text-[#E8722A]">
                  Google Maps
                </span>
              </div>

              <p className="text-xs leading-relaxed text-[#9C8B78]">
                {locationStatus === "requesting" && "現在地を取得しています。"}
                {locationStatus === "ready" && "現在地を中心に表示しています。"}
                {locationStatus === "denied" && "ブラウザの位置情報許可が必要です。"}
                {locationStatus === "unavailable" && "現在地を取得できませんでした。"}
                {locationStatus === "idle" && "地図を準備しています。"}
                {routes.length > 0 && ` ${routes[0].title} などを表示しています。`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NavButton
// ═══════════════════════════════════════════════════════════

function NavButton({ label, active, onClick, children }: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 flex-1 py-2 active:opacity-70 transition-opacity">
      {children}
      <span className={`text-[10px] font-medium ${active ? "text-[#E8722A]" : "text-[#9C8B78]"}`}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// メインコンポーネント
// ═══════════════════════════════════════════════════════════

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionData | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(TOMOSHIBI_AI_DEFAULT_CHARACTER_ID);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [journeys, setJourneys] = useState<JourneyMemory[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [companionGuide, setCompanionGuide] = useState<CompanionGuideOutput | null>(null);
  const [apiMessages, setApiMessages] = useState<Message[]>([]);
  const [visitedPlaceIds, setVisitedPlaceIds] = useState<string[]>([]);
  const [guidePreferences, setGuidePreferences] = useState<GuidePreferenceState>(DEFAULT_GUIDE_PREFERENCES);
  const [customizationState, setCustomizationState] = useState<CharacterCustomizationState | null>(null);
  const [customizationStatus, setCustomizationStatus] = useState<"idle" | "loading" | "saving" | "error">("idle");
  const [customizationError, setCustomizationError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [integrationError, setIntegrationError] = useState<string | null>(null);

  const companionName = selectedCharacter?.name ?? (integrationStatus === "loading" ? "読み込み中" : "キャラクター未選択");
  const companionDescription =
    selectedCharacter?.description ?? (integrationStatus === "loading" ? "キャラクター情報を取得しています。" : "キャラクターを選択してください。");
  const routeSuggestions = routes.map((route) => routePlanToSuggestion(route, companionGuide));

  const handleSuggestionTap = (s: SuggestionData) => setActiveSuggestion(s);
  const handleCloseDetail = () => setActiveSuggestion(null);
  const handleGo = () => {
    setActiveSuggestion(null);
    setActiveTab("map");
  };

  useEffect(() => {
    let disposed = false;
    setIntegrationStatus("loading");
    getAvailableCharacters(TOMOSHIBI_AI_DEFAULT_USER_ID)
      .then((result) => {
        if (disposed) return;
        const nextCharacters = result.characters.map((item) => item.character);
        setCharacters(nextCharacters);
        const nextSelected =
          nextCharacters.find((character) => character.id === TOMOSHIBI_AI_DEFAULT_CHARACTER_ID) ?? nextCharacters[0] ?? null;
        setSelectedCharacter(nextSelected);
        if (nextSelected) {
          setSelectedCharacterId(nextSelected.id);
        }
        setIntegrationError(nextCharacters.length === 0 ? "キャラクターがまだ登録されていません。seedを確認してください。" : null);
        setIntegrationStatus("idle");
      })
      .catch((error) => {
        if (disposed) return;
        setIntegrationStatus("error");
        setIntegrationError(error instanceof Error ? error.message : "キャラクター一覧を取得できませんでした。");
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCharacterId) return;
    let disposed = false;
    getUserCompanionState({ userId: TOMOSHIBI_AI_DEFAULT_USER_ID, characterId: selectedCharacterId })
      .then((result) => {
        if (disposed) return;
        setSelectedCharacter(result.character);
        setRelationship(result.relationship);
      })
      .catch(() => {
        if (disposed) return;
        setRelationship(null);
      });

    return () => {
      disposed = true;
    };
  }, [selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId) return;
    let disposed = false;

    getActiveGuideSession({
      userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
      characterId: selectedCharacterId,
    })
      .then(async (result) => {
        if (disposed || !result.session) return;
        setActiveSessionId(result.session.id);
        if (result.latestSuggestion) {
          setRoutes(result.latestSuggestion.routes);
          setCompanionGuide(result.latestSuggestion.companion);
        }

        const messageResult = await listGuideSessionMessages({
          userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
          sessionId: result.session.id,
          limit: 50,
        });
        if (disposed) return;
        const persistedMessages = messageResult.messages.map(guideSessionMessageToMessage);
        const restoredMessages: Message[] =
          persistedMessages.length > 0
            ? [...persistedMessages]
            : result.latestSuggestion
              ? [
                  {
                    id: `restored-guide-${result.session.id}`,
                    type: "companion",
                    text: result.latestSuggestion.companion.openingMessage,
                    actions: result.latestSuggestion.companion.nextActions,
                  },
                ]
              : [];

        if (result.latestSuggestion) {
          restoredMessages.push(
            ...result.latestSuggestion.routes.slice(0, 2).map((route) => ({
              id: `restored-suggestion-${route.id}`,
              type: "suggestion" as const,
              suggestion: routePlanToSuggestion(route, result.latestSuggestion?.companion),
              actions: routePlanToActions(route),
            })),
          );
        }
        setApiMessages(restoredMessages);
      })
      .catch(() => {
        if (disposed) return;
        setActiveSessionId(null);
      });

    return () => {
      disposed = true;
    };
  }, [selectedCharacterId]);

  const refreshJourneyMemories = async (characterId = selectedCharacterId) => {
    const result = await listJourneyMemories({
      userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
      characterId,
      limit: 20,
    });
    setJourneys(result.memories);
  };

  useEffect(() => {
    if (!selectedCharacterId) return;
    let disposed = false;

    listJourneyMemories({
      userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
      characterId: selectedCharacterId,
      limit: 20,
    })
      .then((result) => {
        if (!disposed) setJourneys(result.memories);
      })
      .catch(() => {
        if (!disposed) setJourneys([]);
      });

    return () => {
      disposed = true;
    };
  }, [selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId) return;
    let disposed = false;
    setCustomizationStatus("loading");
    setCustomizationError(null);

    getCharacterCustomization({ userId: TOMOSHIBI_AI_DEFAULT_USER_ID, characterId: selectedCharacterId })
      .then((result) => {
        if (disposed) return;
        setCustomizationState({
          customization: result.customization,
          availableParts: result.availableParts,
          defaultAppearance: result.defaultAppearance,
        });
        setCustomizationStatus("idle");
      })
      .catch((error) => {
        if (disposed) return;
        setCustomizationState(null);
        setCustomizationStatus("error");
        setCustomizationError(error instanceof Error ? error.message : "カスタマイズ情報を取得できませんでした。");
      });

    return () => {
      disposed = true;
    };
  }, [selectedCharacterId]);

  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setSelectedCharacter(characters.find((character) => character.id === characterId) ?? null);
    setActiveSessionId(null);
    setRoutes([]);
    setCompanionGuide(null);
    setApiMessages([]);
    setJourneys([]);
    setVisitedPlaceIds([]);
    setActiveSuggestion(null);
    setCustomizationError(null);
  };

  const handleStartGuide = async () => {
    setIntegrationStatus("loading");
    setIntegrationError(null);

    try {
      const origin = await resolveGuideOrigin(guidePreferences);
      const created = await createGuideSession({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        characterId: selectedCharacterId,
        mode: "daily_walk",
        origin,
        areaId: guidePreferences.areaMode === "iki" ? "iki" : undefined,
        context: {
          availableMinutes: guidePreferences.availableMinutes,
          mobility: guidePreferences.mobility,
          mood: guidePreferences.mood.trim() || undefined,
          interests: guidePreferences.interests.length > 0 ? guidePreferences.interests : undefined,
          companionType: "solo",
        },
      });

      setActiveSessionId(created.sessionId);
      setVisitedPlaceIds([]);
      setApiMessages([{ id: `session-${created.sessionId}`, type: "companion", text: created.message }]);

      const suggested = await suggestGuideRoute({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        sessionId: created.sessionId,
      });
      setRoutes(suggested.routes);
      setCompanionGuide(suggested.companion);
      setApiMessages((prev) => [
        ...prev,
        {
          id: `guide-${created.sessionId}`,
          type: "companion",
          text: suggested.companion.openingMessage,
          actions: suggested.companion.nextActions,
        },
        ...suggested.routes.slice(0, 2).map((route) => ({
          id: `suggestion-${route.id}`,
          type: "suggestion" as const,
          suggestion: routePlanToSuggestion(route, suggested.companion),
          actions: routePlanToActions(route),
        })),
      ]);
      setIntegrationStatus("ready");
      setActiveTab("conversation");
    } catch (error) {
      setIntegrationStatus("error");
      setIntegrationError(error instanceof Error ? error.message : "TOMOSHIBI AIバックエンドへ接続できませんでした。");
    }
  };

  const handleSendToCompanion = async (message: string): Promise<RespondToCompanionOutput | null> => {
    if (!activeSessionId) {
      const noSessionResponse = { message: "先にホームから「現在地で探す」を押して、外出セッションを始めてください。" };
      setApiMessages((prev) => [...prev, { id: `no-session-${Date.now()}`, type: "companion", text: noSessionResponse.message }]);
      return noSessionResponse;
    }

    const userMessage: Message = { id: `user-${Date.now()}`, type: "user", text: message };
    setApiMessages((prev) => [...prev, userMessage]);
    setIsSendingMessage(true);

    try {
      const response = await respondToCompanion({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        sessionId: activeSessionId,
        message,
      });
      setApiMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          type: "companion",
          text: response.message,
          actions: response.nextActions,
        },
      ]);
      return response;
    } catch (error) {
      const failure = error instanceof Error ? error.message : "返答を取得できませんでした。";
      setApiMessages((prev) => [...prev, { id: `reply-error-${Date.now()}`, type: "companion", text: failure }]);
      return { message: failure };
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleRunCompanionAction = async (action: NonNullable<Message["actions"]>[number]) => {
    if (!activeSessionId) return;

    const payload = action.payload ?? {};
    const placeId = typeof payload.placeId === "string" ? payload.placeId : undefined;
    const routeId = typeof payload.routeId === "string" ? payload.routeId : undefined;
    const feedbackType = feedbackTypeForUiAction(action.action);

    if (feedbackType) {
      setIsSendingMessage(true);
      try {
        await saveUserFeedback({
          userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
          sessionId: activeSessionId,
          characterId: selectedCharacterId,
          placeId,
          routeId,
          type: feedbackType,
          metadata: payload,
        });
        if (feedbackType === "visited" && placeId) {
          setVisitedPlaceIds((prev) => (prev.includes(placeId) ? prev : [...prev, placeId]));
        }
        setApiMessages((prev) => [
          ...prev,
          {
            id: `feedback-${Date.now()}`,
            type: "companion",
            text: feedbackMessageForAction(action.action),
          },
        ]);
        if (action.action === "start_route") {
          setActiveTab("map");
        }
      } catch (error) {
        setApiMessages((prev) => [
          ...prev,
          {
            id: `feedback-error-${Date.now()}`,
            type: "companion",
            text: error instanceof Error ? error.message : "操作を記録できませんでした。",
          },
        ]);
      } finally {
        setIsSendingMessage(false);
      }
      return;
    }

    const actionType = isCompanionActionType(action.action) ? action.action : "tell_more";

    setIsSendingMessage(true);
    try {
      const response = await respondToCompanion({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        sessionId: activeSessionId,
        action: {
          type: actionType,
          placeId,
          routeId,
          payload,
        },
      });
      setApiMessages((prev) => [
        ...prev,
        {
          id: `action-${Date.now()}`,
          type: "companion",
          text: response.message,
          actions: response.nextActions,
        },
      ]);
    } catch (error) {
      setApiMessages((prev) => [
        ...prev,
        {
          id: `action-error-${Date.now()}`,
          type: "companion",
          text: error instanceof Error ? error.message : "アクションを送信できませんでした。",
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCompleteJourney = async () => {
    if (!activeSessionId) {
      setApiMessages((prev) => [
        ...prev,
        { id: `no-session-${Date.now()}`, type: "companion", text: "まだ外出セッションが始まっていません。" },
      ]);
      return;
    }

    const fallbackVisited = visitedPlaceIds.length > 0
      ? visitedPlaceIds
      : routes.flatMap((route) => route.places.slice(0, 1).map((item) => item.place.providerPlaceId));

    try {
      const completed = await completeJourney({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        sessionId: activeSessionId,
        visitedPlaceIds: fallbackVisited,
        userComment: "Master MVPフロントから完了",
      });
      setApiMessages((prev) => [
        ...prev,
        { id: completed.journeyId, type: "companion", text: completed.companionMessage },
      ]);
      await refreshJourneyMemories();
      setActiveTab("record");
    } catch (error) {
      setApiMessages((prev) => [
        ...prev,
        {
          id: `complete-error-${Date.now()}`,
          type: "companion",
          text: error instanceof Error ? error.message : "外出完了に失敗しました。",
        },
      ]);
    }
  };

  const handleSaveCustomization = async (selectedParts: CharacterPartSelection) => {
    setCustomizationStatus("saving");
    setCustomizationError(null);
    try {
      const result = await updateCharacterCustomization({
        userId: TOMOSHIBI_AI_DEFAULT_USER_ID,
        characterId: selectedCharacterId,
        selectedParts,
      });
      setCustomizationState((prev) =>
        prev
          ? {
              ...prev,
              customization: result.customization,
            }
          : null,
      );
      setCustomizationStatus("idle");
    } catch (error) {
      setCustomizationStatus("error");
      setCustomizationError(error instanceof Error ? error.message : "カスタマイズを保存できませんでした。");
    }
  };

  return (
    <>
      <style>{`
        @keyframes typing-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>

      <div className="h-full bg-[#140E09] flex flex-col max-w-md mx-auto overflow-hidden">
        {/* iOS ノッチ・Dynamic Island セーフエリア */}
        <div className="flex-shrink-0" style={{ height: "env(safe-area-inset-top, 0px)" }} />

        {/* コンテンツ — relative + overflow-hidden で高さを完全固定 */}
        <div className="flex-1 relative overflow-hidden bg-[#F5F0E8]">
          {activeTab === "home" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <HomeScreen
                companionName={companionName}
                companionDescription={companionDescription}
                relationship={relationship}
                routeSuggestions={routeSuggestions}
                journeys={journeys}
                characters={characters}
                selectedCharacterId={selectedCharacterId}
                guidePreferences={guidePreferences}
                integrationStatus={integrationStatus}
                integrationError={integrationError}
                onOpenChat={() => setActiveTab("conversation")}
                onSuggestionTap={handleSuggestionTap}
                onStartGuide={() => void handleStartGuide()}
                onSelectCharacter={handleSelectCharacter}
                onGuidePreferenceChange={setGuidePreferences}
              />
            </div>
          )}
          {activeTab === "conversation" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <ConversationScreen
                companionName={companionName}
                messages={apiMessages}
                hasActiveSession={Boolean(activeSessionId)}
                isSending={isSendingMessage}
                onSendToCompanion={handleSendToCompanion}
                onCompleteJourney={handleCompleteJourney}
                onSuggestionTap={handleSuggestionTap}
                onRunAction={handleRunCompanionAction}
              />
            </div>
          )}
          {activeTab === "record" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <RecordScreen companionName={companionName} journeys={journeys} relationship={relationship} />
            </div>
          )}
          {activeTab === "map" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <MapScreen routes={routes} />
            </div>
          )}
          {activeTab === "settings" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <SettingsScreen
                key={`${selectedCharacterId}-${customizationState?.customization.lastUpdatedAt ?? "none"}`}
                companionName={companionName}
                characters={characters}
                selectedCharacterId={selectedCharacterId}
                relationship={relationship}
                customizationState={customizationState}
                status={customizationStatus}
                error={customizationError}
                onSelectCharacter={handleSelectCharacter}
                onSaveCustomization={handleSaveCustomization}
              />
            </div>
          )}
        </div>

        {/* ボトムナビ */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-[#D4C9B8]">
        <div className="flex items-center h-[60px] px-2">
          <NavButton label="ホーム" active={activeTab === "home"} onClick={() => setActiveTab("home")}>
            <HomeIcon active={activeTab === "home"} />
          </NavButton>
          <NavButton label="地図" active={activeTab === "map"} onClick={() => setActiveTab("map")}>
            <MapIcon active={activeTab === "map"} />
          </NavButton>
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setActiveTab("conversation")}
              className={`w-[58px] h-[58px] rounded-full shadow-lg flex flex-col items-center justify-center gap-0.5 -translate-y-3 active:scale-95 transition-all ${
                activeTab === "conversation" ? "bg-[#2A1C10] shadow-[#140E09]/40" : "bg-[#E8722A] shadow-[#E8722A]/30"
              }`}
            >
              <div className="flame-animate"><FlameSvg size={22} /></div>
              <span className="text-white text-[9px] font-bold tracking-wide">会話</span>
            </button>
          </div>
          <NavButton label="記録" active={activeTab === "record"} onClick={() => setActiveTab("record")}>
            <BookIcon active={activeTab === "record"} />
          </NavButton>
          <NavButton label="設定" active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
            <SettingsIcon active={activeTab === "settings"} />
          </NavButton>
        </div>
        {/* iOS ホームバー セーフエリア */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>

        {/* 外出提案詳細オーバーレイ */}
        {activeSuggestion && (
          <SuggestionDetailOverlay
            suggestion={activeSuggestion}
            companionName={companionName}
            onClose={handleCloseDetail}
            onGo={handleGo}
          />
        )}
      </div>
    </>
  );
}
