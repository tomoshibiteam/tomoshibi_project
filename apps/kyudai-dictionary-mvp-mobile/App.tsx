import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { createElement, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { signInAnonymously } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseClientAuth, getFirebaseClientDb, getFirebaseMissingEnvKeys } from "./src/lib/firebase";

const palette = {
  background: "#f9f9f7",
  onBackground: "#2d3432",
  onSurfaceVariant: "#5a605e",
  surfaceLow: "#f2f4f2",
  surfaceHigh: "#e5e9e6",
  surfaceLowest: "#ffffff",
  secondaryContainer: "#d6e4f7",
  tertiaryContainer: "#f5ce53",
  primaryContainer: "#e2e2e7",
  onSecondaryContainer: "#455363",
  onTertiaryContainer: "#584500",
  onPrimaryContainer: "#505256",
  primary: "#2d3432",
  outlineVariant: "#adb3b0",
  darkButton: "#1a1c20",
  onDarkButton: "#f7f7fd",
  tertiary: "#745c00",
  secondaryText: "#536070",
  error: "#9f403d",
};

const heroImage =
  "https://lh3.googleusercontent.com/aida/ADBb0uhxai5hbeKu_CyFAeSLCKP_Bl443z6LMiMlWZGAOeldUMx-pd7w2vg3pl6pU8jmXdd0fwpiXZGCzJsfEU3LjVhHa7CqfjUZ2AAXj7mtGikcQCY5zIchCthsBOytZtJwAc141EcYSw5rGS6r8aWk3eeka1Nqsh7GCmHIZDgu6Xknl1Hxydl7GDSagYVh2yIhL3qcs3tumIgy8FswEwt6yQuF1T9PMZKhrZX2lNttAMgGSGS2LZSuI--77YM";

const landingHeroImage = require("./assets/kyudai-night.jpg");
const tomoshibiLogo = require("./assets/tomoshibi-logo.png");

const readyImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCTscJo3wP0gqtPkDjft9qMPLzCFlIbdtD1dW_HjaS7BoQb2Lf2ba_7RgHd5QRuAkeuaISCabokQooMWh3KLQYelcom-My07WmNHwt9dG_Wh0mcM57sf1UKIdJgpBg2cKHgBV1PGsJTz6IxPGuGz0SShKtyi1jrg4N0-V5DVtoCWqXXwBSfxmhpwM78YcAULyAoIOnDjYH2yvhUENk4XxsaeQGo6li9QNGIrCTVz3d7XFcM2Ny7Rqd2hL9_IptyU9La72QiXp0PbNQ";

const spotArrivalBgImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9njCw7nXk5DUmoznlabXuCOMK4uNHGAQ5-tOAyEMczuwsyiiHLkLOjsZzbtPAen9op_YKDuAEJnZrara6rOpVmCh1ABrbfJJZhaqxQVxFuIBGWfW_FyakA4MpB8LEI1LVPD2eEZIu9-qogDJnl939KUOoiscx-vRWfPDYYtGbkAMfM0LhOxG3rdNk-6-cr8_tlmnNKQK_HRisYgPLnUkImELEYbsfpzALMmWHI8jo_Yul0oRwgfhPH7k2CXWDSYwZ7Td8bOjVAmw";

const spotArrivalCharacterImage = require("./assets/characters/ar-character.png");

const epilogueBgImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdDV4U9QpH_B0Ri9yn4ltTPOKZm0h2xFfMUpXnR7k7CZn7akV58MDWdkhhH5m0fwgJ1dxpMZmkw1vlXJ2GiUs2kxB2_16VpwatTfiIa4TdNmmGB-HbkwC-6DcvCE25-m9PURAIsId0jq7sbHmCkgf3dCtAQ84CAGLXR2DuN-ey8-FWwtxhT1OkAGpwPuGHsIlaJJjoD85ghgeJYa-WNG8HczVxugyGwtawbrsb5rv1HLBYvq5cofr1X8VSuQHijSEh6u2M0RjUT8c";

const mapCenterRegion = {
  latitude: 33.5968,
  longitude: 130.2188,
  latitudeDelta: 0.0102,
  longitudeDelta: 0.0102,
};

const currentLocation = {
  latitude: 33.59495,
  longitude: 130.2218,
};

type Coordinate = { latitude: number; longitude: number };
type Spot = {
  id: string;
  name: string;
  coordinate: Coordinate;
  scenarioTexts: string[];
};

const spotCatalog: Spot[] = [
  {
    id: "big-orange",
    name: "Big Orange",
    coordinate: { latitude: 33.59895, longitude: 130.2169 },
    scenarioTexts: [
      "ここはBig Orange。今日の物語が開く最初の場所です。",
      "ただの建物ではなく、これから始まる日々の交差点として、この場所を覚えておきましょう。",
    ],
  },
  {
    id: "center-zone",
    name: "Center Zone",
    coordinate: { latitude: 33.5978, longitude: 130.2204 },
    scenarioTexts: [
      "ここでは、学びと日常がすれ違いながら重なっていきます。",
      "流れの中にある小さな変化を感じながら、次の景色へ進みましょう。",
    ],
  },
  {
    id: "central-library",
    name: "中央図書館",
    coordinate: { latitude: 33.5961, longitude: 130.2184 },
    scenarioTexts: [
      "知の入口に立ちました。ここには多くの選択肢が静かに並んでいます。",
      "静かな時間が、あなたの物語の奥行きを少しずつ深くしてくれます。",
    ],
  },
  {
    id: "innovation-plaza",
    name: "Innovation Plaza",
    coordinate: { latitude: 33.59735, longitude: 130.2192 },
    scenarioTexts: [
      "ここはInnovation Plaza。学びのアイデアが実験へ変わる結節点です。",
      "新しい視点を持つ人たちが行き交う場所として、今日の物語にも変化を与えています。",
    ],
  },
  {
    id: "research-commons",
    name: "Research Commons",
    coordinate: { latitude: 33.59645, longitude: 130.2171 },
    scenarioTexts: [
      "Research Commonsでは、分野を越えた対話が静かに進んでいます。",
      "慣れた景色の中にも、見方を変えると新しい物語の入口が見えてきます。",
    ],
  },
  {
    id: "west-gate",
    name: "West Gate",
    coordinate: { latitude: 33.5952, longitude: 130.2159 },
    scenarioTexts: [
      "ここが今日の終点です。歩いた景色が、ひとつの記憶として結ばれます。",
      "ここまでの道のりが、明日からのキャンパス生活を静かに照らしていくはずです。",
    ],
  },
];

const spotCatalogMap = spotCatalog.reduce<Record<string, Spot>>((acc, spot) => {
  acc[spot.id] = spot;
  return acc;
}, {});

const START_SPOT_ID: Spot["id"] = "big-orange";
const GOAL_SPOT_ID: Spot["id"] = "west-gate";

const GOOGLE_MAPS_WEB_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ??
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ??
  "";

const createRouteCoordinates = (origin: Coordinate, destination: Coordinate): Coordinate[] => {
  const midOne: Coordinate = {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.4,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.4,
  };
  const midTwo: Coordinate = {
    latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.72,
    longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.72,
  };
  return [origin, midOne, midTwo, destination];
};

const createRegionFromCoordinates = (coordinates: Coordinate[]) => {
  if (coordinates.length === 0) return mapCenterRegion;

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const coordinate of coordinates) {
    minLat = Math.min(minLat, coordinate.latitude);
    maxLat = Math.max(maxLat, coordinate.latitude);
    minLng = Math.min(minLng, coordinate.longitude);
    maxLng = Math.max(maxLng, coordinate.longitude);
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * 1.42, 0.0082);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.42, 0.0082);

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

const decodeGooglePolyline = (encoded: string): Coordinate[] => {
  const coordinates: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
};

const fetchWalkingDirectionsCoordinates = async (
  origin: Coordinate,
  destination: Coordinate,
  waypoints: Coordinate[] = [],
): Promise<Coordinate[] | null> => {
  if (!GOOGLE_MAPS_WEB_API_KEY) return null;

  const params = new URLSearchParams({
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    mode: "walking",
    language: "ja",
    region: "jp",
    key: GOOGLE_MAPS_WEB_API_KEY,
  });

  if (waypoints.length > 0) {
    params.set(
      "waypoints",
      waypoints.map((point) => `${point.latitude},${point.longitude}`).join("|"),
    );
  }

  const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
  if (!response.ok) return null;

  const json = await response.json();
  if (json?.status !== "OK") return null;

  const encoded = json?.routes?.[0]?.overview_polyline?.points;
  if (typeof encoded !== "string" || !encoded) return null;

  const decoded = decodeGooglePolyline(encoded);
  return decoded.length > 1 ? decoded : null;
};

let googleMapsJsLoader: Promise<void> | null = null;

const loadGoogleMapsJs = async () => {
  if (Platform.OS !== "web") return;
  if (!GOOGLE_MAPS_WEB_API_KEY) {
    throw new Error("GOOGLE_MAPS_WEB_API_KEY is missing");
  }

  if ((globalThis as any)?.google?.maps) {
    return;
  }

  if (!googleMapsJsLoader) {
    googleMapsJsLoader = new Promise<void>((resolve, reject) => {
      const scriptId = "kyudai-google-maps-js";
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existingScript) {
        if ((globalThis as any)?.google?.maps) {
          resolve();
          return;
        }
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Google Maps script load failed")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_WEB_API_KEY}&language=ja&region=JP`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error("Google Maps script load failed")), { once: true });
      document.head.appendChild(script);
    });
  }

  await googleMapsJsLoader;
};

type AppScreen =
  | "landing"
  | "setup"
  | "preparing"
  | "ready"
  | "prologue"
  | "map"
  | "spotArrival"
  | "epilogue"
  | "feedback";

const previewNavigationScreenOrder: AppScreen[] = [
  "landing",
  "setup",
  "preparing",
  "ready",
  "prologue",
  "map",
  "spotArrival",
  "epilogue",
  "feedback",
];
type UserType = "新入生" | "在学生" | "保護者" | "教職員" | "その他";
type Familiarity =
  | "はじめて来た"
  | "まだあまり慣れていない"
  | "何度か来たことがある"
  | "よく来ている";
type Duration = "15〜20分" | "20〜30分" | "30〜45分";
type FeedbackReuseIntent = "again" | "neutral" | "unlikely";

const userTypeOptions: UserType[] = ["新入生", "在学生", "保護者", "教職員", "その他"];
const familiarityOptions: Familiarity[] = [
  "はじめて来た",
  "まだあまり慣れていない",
  "何度か来たことがある",
  "よく来ている",
];
const durationOptions: Duration[] = ["15〜20分", "20〜30分", "30〜45分"];

type ExplorationStyle = "地図で事前確認" | "歩いて自分で発見" | "人に聞く" | "アプリで調べる";
type ExperienceExpectation = "場所を覚えたい" | "物語を楽しみたい" | "新しい発見が欲しい" | "話すきっかけが欲しい";

const explorationStyleOptions: ExplorationStyle[] = [
  "地図で事前確認",
  "歩いて自分で発見",
  "人に聞く",
  "アプリで調べる",
];

const experienceExpectationOptions: ExperienceExpectation[] = [
  "場所を覚えたい",
  "物語を楽しみたい",
  "新しい発見が欲しい",
  "話すきっかけが欲しい",
];

const durationSpotCountMap: Record<Duration, number> = {
  "15〜20分": 4,
  "20〜30分": 5,
  "30〜45分": 6,
};
const familiarityMiddleSpotPriority: Record<Familiarity, Spot["id"][]> = {
  はじめて来た: ["center-zone", "central-library", "innovation-plaza", "research-commons"],
  まだあまり慣れていない: ["center-zone", "innovation-plaza", "central-library", "research-commons"],
  何度か来たことがある: ["innovation-plaza", "central-library", "research-commons", "center-zone"],
  よく来ている: ["research-commons", "innovation-plaza", "central-library", "center-zone"],
};

const buildExperienceSpots = (selectedFamiliarity: Familiarity, selectedDuration: Duration): Spot[] => {
  const startSpot = spotCatalogMap[START_SPOT_ID] ?? spotCatalog[0];
  const goalSpot = spotCatalogMap[GOAL_SPOT_ID] ?? spotCatalog[spotCatalog.length - 1] ?? startSpot;

  const targetCount = Math.max(2, Math.min(durationSpotCountMap[selectedDuration], spotCatalog.length));
  const middleTargetCount = Math.max(0, targetCount - 2);
  const familiarityPriority = familiarityMiddleSpotPriority[selectedFamiliarity];
  const fallbackMiddleIds = spotCatalog
    .map((spot) => spot.id)
    .filter((spotId) => spotId !== startSpot.id && spotId !== goalSpot.id);
  const middleIds = Array.from(new Set([...familiarityPriority, ...fallbackMiddleIds]))
    .filter((spotId) => spotId !== startSpot.id && spotId !== goalSpot.id)
    .slice(0, middleTargetCount);
  const middleSpots = middleIds
    .map((spotId) => spotCatalogMap[spotId])
    .filter((spot): spot is Spot => Boolean(spot));

  const resolved = [startSpot, ...middleSpots, goalSpot];
  return resolved.slice(0, targetCount);
};

const fiveScale = [1, 2, 3, 4, 5] as const;
const EXPERIENCE_SESSION_COLLECTION = "kyudaiMvpSessions";
const EXPERIENCE_SESSION_STORAGE_KEY = "kyudaiMvpExperienceSessionId";
const EXPERIENCE_STARTED_AT_STORAGE_KEY = "kyudaiMvpExperienceStartedAt";
const FLOW_DRAFT_STORAGE_KEY = "kyudaiMvpFlowDraft";

const generateExperienceSessionId = () =>
  `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const getFirebaseErrorCode = (error: unknown): string => {
  if (typeof error === "object" && error && "code" in error) {
    const raw = String((error as { code: unknown }).code ?? "");
    return raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
  }
  return "";
};

type PersistedFlowDraft = {
  selectedUserType?: string;
  selectedFamiliarity?: string;
  selectedDuration?: string;
  selectedExplorationStyle?: string;
  selectedExperienceExpectation?: string;
  experienceSessionId?: string | null;
  experienceStartedAtIso?: string | null;
  currentSpotIndex?: number;
  isExperienceCompleted?: boolean;
  feedbackOverallRating?: number | null;
  feedbackGuidanceScore?: number | null;
  feedbackCampusScore?: number | null;
  feedbackVisitIntentScore?: number | null;
  feedbackExpectationScore?: number | null;
  feedbackReuseIntent?: string | null;
  feedbackComment?: string;
};

type AdminWorldConfigPayload = {
  title?: string;
  description?: string;
  tone?: string;
  styleRules?: string;
  requiredKeywords?: string[];
  blockedKeywords?: string[];
  prologueBody?: string;
  prologueCta?: string;
  epilogueBody?: string;
  epilogueCta?: string;
};

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const parseAdminWorldConfigPayload = (value: unknown): AdminWorldConfigPayload | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  return {
    title: normalizeText(raw.title),
    description: normalizeText(raw.description),
    tone: normalizeText(raw.tone),
    styleRules: normalizeText(raw.styleRules),
    requiredKeywords: Array.isArray(raw.requiredKeywords)
      ? raw.requiredKeywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : undefined,
    blockedKeywords: Array.isArray(raw.blockedKeywords)
      ? raw.blockedKeywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : undefined,
    prologueBody: normalizeText(raw.prologueBody),
    prologueCta: normalizeText(raw.prologueCta),
    epilogueBody: normalizeText(raw.epilogueBody),
    epilogueCta: normalizeText(raw.epilogueCta),
  };
};

const screenPathMap: Record<AppScreen, string> = {
  landing: "/",
  setup: "/setup",
  preparing: "/preparing",
  ready: "/ready",
  prologue: "/prologue",
  map: "/map",
  spotArrival: "/spot-arrival",
  epilogue: "/epilogue",
  feedback: "/feedback",
};

const normalizePath = (path: string): string => {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

const pathScreenMap = Object.entries(screenPathMap).reduce(
  (acc, [screen, path]) => {
    acc[normalizePath(path)] = screen as AppScreen;
    return acc;
  },
  {} as Record<string, AppScreen>,
);

const getScreenFromCurrentPath = (): AppScreen => {
  if (Platform.OS !== "web") return "landing";

  const currentPath = normalizePath(window.location.pathname);
  return pathScreenMap[currentPath] ?? "landing";
};

const isUserType = (value: unknown): value is UserType =>
  typeof value === "string" && userTypeOptions.includes(value as UserType);

const isFamiliarity = (value: unknown): value is Familiarity =>
  typeof value === "string" && familiarityOptions.includes(value as Familiarity);

const isDuration = (value: unknown): value is Duration =>
  typeof value === "string" && durationOptions.includes(value as Duration);

const isExplorationStyle = (value: unknown): value is ExplorationStyle =>
  typeof value === "string" && explorationStyleOptions.includes(value as ExplorationStyle);

const isExperienceExpectation = (value: unknown): value is ExperienceExpectation =>
  typeof value === "string" && experienceExpectationOptions.includes(value as ExperienceExpectation);

const isFeedbackReuseIntent = (value: unknown): value is FeedbackReuseIntent =>
  value === "again" || value === "neutral" || value === "unlikely";

const clampSpotIndex = (value: unknown, spotsLength = spotCatalog.length): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const normalized = Math.floor(value);
  return Math.max(0, Math.min(Math.max(0, spotsLength - 1), normalized));
};

const parseFiveScale = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.floor(value);
  return Math.max(1, Math.min(5, normalized));
};

const readPersistedFlowDraft = (): PersistedFlowDraft | null => {
  if (Platform.OS !== "web") return null;
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(FLOW_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PersistedFlowDraft;
  } catch {
    return null;
  }
};

type FeatureCard = {
  id: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

const featureCards: FeatureCard[] = [
  {
    id: "feature-story",
    title: "キャンパスを、物語で知る",
    body: "移動なしで、九大の各スポットをあなた専用の物語とともに体験できます。",
    icon: "book-outline",
    iconBg: palette.secondaryContainer,
    iconColor: palette.onSecondaryContainer,
  },
  {
    id: "feature-explore",
    title: "各スポットに、意味が生まれる",
    body: "伊都キャンパスの場所や風景を、物語を通じて新しい視点で知ることができます。",
    icon: "compass-outline",
    iconBg: palette.tertiaryContainer,
    iconColor: palette.onTertiaryContainer,
  },
  {
    id: "feature-step",
    title: "九大生活の第一歩",
    body: "実証実験として、伊都キャンパスの空気を物語とともに体感する体験を提供します。",
    icon: "sparkles-outline",
    iconBg: palette.primaryContainer,
    iconColor: palette.onPrimaryContainer,
  },
];

type JourneyStep = {
  id: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string;
};

type ReadyInputItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

type ReadyTip = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const journeySteps: JourneyStep[] = [
  {
    id: "journey-ready",
    title: "あなた専用のシナリオを生成",
    body: "立場やキャンパスの慣れ具合をもとに、あなたにぴったりの語り口とスポット順を自動で用意します。",
    icon: "sparkles-outline",
    badge: "STEP 1",
  },
  {
    id: "journey-walk",
    title: "各スポットの物語を順番に体験",
    body: "移動は不要。ボタンを進めるだけで、伊都キャンパスの各スポットを物語とともに巡れます。",
    icon: "book-outline",
    badge: "STEP 2",
  },
  {
    id: "journey-story",
    title: "スポットごとに物語と解説が展開",
    body: "各スポットで、その場所ならではの背景や文脈を短いシナリオで体感できます。",
    icon: "map-outline",
    badge: "STEP 3",
  },
];

const readyStoryToneMap: Record<Familiarity, string> = {
  はじめて来た: "はじまりの章",
  まだあまり慣れていない: "案内の章",
  何度か来たことがある: "再発見の章",
  よく来ている: "深掘りの章",
};

const readyDurationLabelMap: Record<Duration, string> = {
  "15〜20分": "短時間で集中",
  "20〜30分": "バランス良く巡る",
  "30〜45分": "じっくり体験",
};

const readySpotOverviewMap: Record<Spot["id"], string> = {
  "big-orange": "全ての物語が始まる場所。インフォメーションと建築があなたを迎えます。",
  "center-zone": "学生たちの活気あふれる学びの心臓部。講義棟が立ち並ぶエリアです。",
  "central-library": "静寂と知性が同居する空間。広大な知識のアーカイブが広がります。",
  "innovation-plaza": "学際的な挑戦が交差する実践拠点。新しい発想の入口として機能します。",
  "research-commons": "研究者と学生の対話が生まれる空間。高度な学びの気配を感じられるエリアです。",
  "west-gate": "キャンパスの広がりを感じる西の玄関口。ここから次の旅路へ。",
};

const defaultPrologueNarrationText =
  "あなたが今日歩くこの場所には、\nまだ気づいていない物語が眠っています。\nいつもの景色を、少し違う目線で辿ってみましょう。";
const defaultEpilogueNarrationText =
  "歩いた景色も、立ち止まった場所も、\n今日の伊都キャンパスの記憶として残っていきます。\n最後に、今回の体験について教えてください。";
const spotTypingIntervalMs = 52;
const spotTypingStep = 1;

export default function App() {
  const useMockMapBackground = true;
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.max(0, Math.min(width - 32, 520)), [width]);
  const heroHeight = contentWidth;
  const landingHeroTitleFontSize = useMemo(() => {
    const responsive = Math.floor(contentWidth / 9.2);
    return Math.max(12, Math.min(42, responsive));
  }, [contentWidth]);
  const landingHeroTitleLineHeight = Math.round(landingHeroTitleFontSize * 1.15);
  const setupTitleFontSize = useMemo(() => {
    const responsive = Math.floor(contentWidth / 11.5);
    return Math.max(16, Math.min(44, responsive));
  }, [contentWidth]);
  const setupTitleLineHeight = Math.round(setupTitleFontSize * 1.16);
  const preparingTitleFontSize = useMemo(() => {
    const responsive = contentWidth * 0.085;
    return Math.max(22, Math.min(30, responsive));
  }, [contentWidth]);
  const preparingTitleLineHeight = Math.round(preparingTitleFontSize * 1.25);
  const feedbackHeroTitleFontSize = useMemo(() => {
    const responsive = Math.floor(contentWidth / 8.9);
    return Math.max(24, Math.min(42, responsive));
  }, [contentWidth]);
  const feedbackHeroTitleLineHeight = Math.round(feedbackHeroTitleFontSize * 1.22);
  const hasSyncedInitialWebPathRef = useRef(false);
  const mapRef = useRef<MapView | null>(null);
  const mapWebHostRef = useRef<any>(null);
  const mapWebInstanceRef = useRef<any>(null);
  const mapWebCurrentLocationMarkerRef = useRef<any>(null);
  const mapWebSpotMarkersRef = useRef<any[]>([]);
  const mapWebActiveRoutePolylineRef = useRef<any>(null);
  const mapWebWholeRoutePolylineRef = useRef<any>(null);
  const firebaseMissingConfigWarnedRef = useRef(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const persistedFlowDraft = useMemo(() => readPersistedFlowDraft(), []);

  const [screen, setScreen] = useState<AppScreen>(() => getScreenFromCurrentPath());
  const [experienceSessionId, setExperienceSessionId] = useState<string | null>(() => {
    if (persistedFlowDraft?.experienceSessionId && typeof persistedFlowDraft.experienceSessionId === "string") {
      return persistedFlowDraft.experienceSessionId;
    }
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
    return window.sessionStorage.getItem(EXPERIENCE_SESSION_STORAGE_KEY) ?? null;
  });
  const [experienceStartedAtIso, setExperienceStartedAtIso] = useState<string | null>(() => {
    if (persistedFlowDraft?.experienceStartedAtIso && typeof persistedFlowDraft.experienceStartedAtIso === "string") {
      return persistedFlowDraft.experienceStartedAtIso;
    }
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
    return window.sessionStorage.getItem(EXPERIENCE_STARTED_AT_STORAGE_KEY) ?? null;
  });
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(() =>
    isUserType(persistedFlowDraft?.selectedUserType) ? persistedFlowDraft.selectedUserType : "新入生",
  );
  const [isUserTypeMenuOpen, setIsUserTypeMenuOpen] = useState(false);
  const [selectedFamiliarity, setSelectedFamiliarity] = useState<Familiarity>(() =>
    isFamiliarity(persistedFlowDraft?.selectedFamiliarity)
      ? persistedFlowDraft.selectedFamiliarity
      : "まだあまり慣れていない",
  );
  const [selectedDuration, setSelectedDuration] = useState<Duration>(() =>
    isDuration(persistedFlowDraft?.selectedDuration) ? persistedFlowDraft.selectedDuration : "20〜30分",
  );
  const [selectedExplorationStyle, setSelectedExplorationStyle] = useState<ExplorationStyle>(
    isExplorationStyle(persistedFlowDraft?.selectedExplorationStyle)
      ? persistedFlowDraft.selectedExplorationStyle
      : "地図で事前確認",
  );
  const [selectedExperienceExpectation, setSelectedExperienceExpectation] = useState<ExperienceExpectation>(
    isExperienceExpectation(persistedFlowDraft?.selectedExperienceExpectation)
      ? persistedFlowDraft.selectedExperienceExpectation
      : "場所を覚えたい",
  );
  const spots = useMemo(
    () => buildExperienceSpots(selectedFamiliarity, selectedDuration),
    [selectedDuration, selectedFamiliarity],
  );
  const [landingBottomBarHeight, setLandingBottomBarHeight] = useState(0);
  const [readyBottomBarHeight, setReadyBottomBarHeight] = useState(0);
  const [setupBottomBarHeight, setSetupBottomBarHeight] = useState(0);
  const [feedbackOverallRating, setFeedbackOverallRating] = useState<number | null>(() =>
    parseFiveScale(persistedFlowDraft?.feedbackOverallRating),
  );
  const [feedbackGuidanceScore, setFeedbackGuidanceScore] = useState<number | null>(() =>
    parseFiveScale(persistedFlowDraft?.feedbackGuidanceScore),
  );
  const [feedbackCampusScore, setFeedbackCampusScore] = useState<number | null>(() =>
    parseFiveScale(persistedFlowDraft?.feedbackCampusScore),
  );
  const [feedbackVisitIntentScore, setFeedbackVisitIntentScore] = useState<number | null>(() =>
    parseFiveScale(persistedFlowDraft?.feedbackVisitIntentScore),
  );
  const [feedbackExpectationScore, setFeedbackExpectationScore] = useState<number | null>(() =>
    parseFiveScale(persistedFlowDraft?.feedbackExpectationScore),
  );
  const [feedbackReuseIntent, setFeedbackReuseIntent] = useState<FeedbackReuseIntent | null>(() =>
    isFeedbackReuseIntent(persistedFlowDraft?.feedbackReuseIntent) ? persistedFlowDraft.feedbackReuseIntent : null,
  );
  const [feedbackComment, setFeedbackComment] = useState(
    typeof persistedFlowDraft?.feedbackComment === "string" ? persistedFlowDraft.feedbackComment : "",
  );
  const [adminWorldConfig, setAdminWorldConfig] = useState<AdminWorldConfigPayload | null>(null);
  const [liveCurrentLocation, setLiveCurrentLocation] = useState<Coordinate | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [webMapError, setWebMapError] = useState<string | null>(null);
  const [wholeRouteDirectionsCoordinates, setWholeRouteDirectionsCoordinates] = useState<Coordinate[] | null>(null);
  const [activeRouteDirectionsCoordinates, setActiveRouteDirectionsCoordinates] = useState<Coordinate[] | null>(null);
  const [currentSpotIndex, setCurrentSpotIndex] = useState(() =>
    clampSpotIndex(persistedFlowDraft?.currentSpotIndex, spotCatalog.length),
  );
  const [isExperienceCompleted, setIsExperienceCompleted] = useState(
    persistedFlowDraft?.isExperienceCompleted === true,
  );
  const [isReadyTransitioning, setIsReadyTransitioning] = useState(false);
  const [isMapScenarioTransitioning, setIsMapScenarioTransitioning] = useState(false);
  const [flowTransitionTitle, setFlowTransitionTitle] = useState("移動中");
  const [flowTransitionBody, setFlowTransitionBody] = useState("画面を切り替えています");
  const [isPrologueTypingDone, setIsPrologueTypingDone] = useState(false);
  const [isEpilogueTypingDone, setIsEpilogueTypingDone] = useState(false);
  const [spotScenarioSegmentIndex, setSpotScenarioSegmentIndex] = useState(0);
  const [spotTypedCharCount, setSpotTypedCharCount] = useState(0);
  const [isSpotTypingDone, setIsSpotTypingDone] = useState(true);
  const landingHeroAnim = useRef(new Animated.Value(screen === "landing" ? 0 : 1)).current;
  const landingCardsAnim = useRef(new Animated.Value(screen === "landing" ? 0 : 1)).current;
  const setupHeroAnim = useRef(new Animated.Value(screen === "setup" ? 0 : 1)).current;
  const setupCardsAnim = useRef(new Animated.Value(screen === "setup" ? 0 : 1)).current;
  const readyHeroAnim = useRef(new Animated.Value(screen === "ready" ? 0 : 1)).current;
  const readyCardsAnim = useRef(new Animated.Value(screen === "ready" ? 0 : 1)).current;
  const readyTransitionOverlayAnim = useRef(new Animated.Value(0)).current;
  const readyTransitionPulseAnim = useRef(new Animated.Value(0)).current;
  const readyTransitionProgressAnim = useRef(new Animated.Value(0)).current;
  const mapScenarioTransitionOverlayAnim = useRef(new Animated.Value(0)).current;
  const mapScenarioTransitionPulseAnim = useRef(new Animated.Value(0)).current;
  const prologueEntryAnim = useRef(new Animated.Value(screen === "prologue" ? 1 : 0)).current;
  const prologueTypingAnim = useRef(new Animated.Value(0)).current;
  const epilogueEntryAnim = useRef(new Animated.Value(screen === "epilogue" ? 1 : 0)).current;
  const epilogueTypingAnim = useRef(new Animated.Value(0)).current;
  const preparingPulseAnim = useRef(new Animated.Value(0)).current;
  const preparingRotateAnim = useRef(new Animated.Value(0)).current;
  const preparingBarAnimA = useRef(new Animated.Value(0)).current;
  const preparingBarAnimB = useRef(new Animated.Value(0)).current;
  const preparingBarAnimC = useRef(new Animated.Value(0)).current;
  const preparingStatusAnim = useRef(new Animated.Value(0)).current;
  const preparingProgressAnim = useRef(new Animated.Value(0)).current;

  const safeCurrentSpotIndex = clampSpotIndex(currentSpotIndex, spots.length);
  const currentSpot = spots[safeCurrentSpotIndex] ?? spots[0] ?? spotCatalog[0];
  const spotScenarioTexts = currentSpot.scenarioTexts;
  const currentSpotScenarioText =
    spotScenarioTexts[Math.min(spotScenarioSegmentIndex, Math.max(spotScenarioTexts.length - 1, 0))] ?? "";
  const spotScenarioChars = useMemo(() => Array.from(currentSpotScenarioText), [currentSpotScenarioText]);
  const hasNextScenarioInSpot = spotScenarioSegmentIndex < spotScenarioTexts.length - 1;
  const spotNextButtonLabel = !isSpotTypingDone
    ? "次へ"
    : hasNextScenarioInSpot
      ? "次へ"
      : safeCurrentSpotIndex >= spots.length - 1
        ? "エピローグへ"
        : "マップに戻る";
  const goalSpot = spots[spots.length - 1];
  const fallbackOrigin = useMemo<Coordinate>(() => {
    if (safeCurrentSpotIndex === 0) return currentLocation;
    return spots[safeCurrentSpotIndex - 1].coordinate;
  }, [safeCurrentSpotIndex, spots]);
  const routeOrigin = liveCurrentLocation ?? fallbackOrigin;
  const activeCurrentLocation = routeOrigin;
  const activeTargetIndex = isExperienceCompleted ? -1 : safeCurrentSpotIndex;
  const allSpotCoordinates = useMemo(() => spots.map((spot) => spot.coordinate), []);
  const mapFitCoordinates = useMemo(() => [routeOrigin, ...allSpotCoordinates], [routeOrigin, allSpotCoordinates]);
  const mapInitialRegion = useMemo(() => createRegionFromCoordinates(mapFitCoordinates), [mapFitCoordinates]);
  const webFallbackGoogleEmbedUrl = useMemo(() => {
    const query = `${mapInitialRegion.latitude},${mapInitialRegion.longitude}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=ja&output=embed`;
  }, [mapInitialRegion.latitude, mapInitialRegion.longitude]);
  const activeRouteCoordinates = useMemo(
    () => createRouteCoordinates(routeOrigin, currentSpot.coordinate),
    [routeOrigin, currentSpot.coordinate],
  );
  const futureRouteCoordinates = useMemo(
    () => spots.slice(Math.min(safeCurrentSpotIndex, spots.length - 1)).map((spot) => spot.coordinate),
    [safeCurrentSpotIndex, spots],
  );
  const renderedWholeRouteCoordinates =
    wholeRouteDirectionsCoordinates && wholeRouteDirectionsCoordinates.length > 1
      ? wholeRouteDirectionsCoordinates
      : futureRouteCoordinates;
  const renderedActiveRouteCoordinates =
    activeRouteDirectionsCoordinates && activeRouteDirectionsCoordinates.length > 1
      ? activeRouteDirectionsCoordinates
      : activeRouteCoordinates;
  const mockMapProjection = useMemo(() => {
    const coordinates = [routeOrigin, ...spots.map((spot) => spot.coordinate)];
    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach((coordinate) => {
      minLat = Math.min(minLat, coordinate.latitude);
      maxLat = Math.max(maxLat, coordinate.latitude);
      minLng = Math.min(minLng, coordinate.longitude);
      maxLng = Math.max(maxLng, coordinate.longitude);
    });

    const latSpan = Math.max(maxLat - minLat, 0.0014);
    const lngSpan = Math.max(maxLng - minLng, 0.0014);
    const latPad = latSpan * 0.22;
    const lngPad = lngSpan * 0.22;
    const paddedMinLat = minLat - latPad;
    const paddedMaxLat = maxLat + latPad;
    const paddedMinLng = minLng - lngPad;
    const paddedMaxLng = maxLng + lngPad;
    const safeLatSpan = Math.max(paddedMaxLat - paddedMinLat, 0.0018);
    const safeLngSpan = Math.max(paddedMaxLng - paddedMinLng, 0.0018);

    const toPoint = (coordinate: Coordinate) => {
      const rawX = (coordinate.longitude - paddedMinLng) / safeLngSpan;
      const rawY = (coordinate.latitude - paddedMinLat) / safeLatSpan;
      const x = Math.max(0.08, Math.min(0.92, rawX));
      const y = Math.max(0.08, Math.min(0.92, 1 - rawY));
      return { x, y };
    };

    const interpolateDots = (from: { x: number; y: number }, to: { x: number; y: number }, steps: number) =>
      Array.from({ length: steps + 1 }, (_, index) => {
        const ratio = index / steps;
        return {
          x: from.x + (to.x - from.x) * ratio,
          y: from.y + (to.y - from.y) * ratio,
        };
      });

    const spotPoints = spots.map((spot) => ({
      spot,
      point: toPoint(spot.coordinate),
    }));
    const currentPoint = toPoint(routeOrigin);

    const wholeRouteDots: Array<{ x: number; y: number }> = [];
    const futureRouteStartIndex = activeTargetIndex >= 0 ? activeTargetIndex : spotPoints.length - 1;
    for (let index = Math.max(1, futureRouteStartIndex + 1); index < spotPoints.length; index += 1) {
      const segmentDots = interpolateDots(spotPoints[index - 1].point, spotPoints[index].point, 18);
      wholeRouteDots.push(...(index === Math.max(1, futureRouteStartIndex + 1) ? segmentDots : segmentDots.slice(1)));
    }

    const activeTargetPoint = spotPoints[Math.max(0, Math.min(activeTargetIndex, spotPoints.length - 1))]?.point ?? currentPoint;
    const activeRouteDots = activeTargetIndex >= 0 ? interpolateDots(currentPoint, activeTargetPoint, 120) : [];

    return {
      spotPoints,
      currentPoint,
      wholeRouteDots,
      activeRouteDots,
    };
  }, [activeTargetIndex, routeOrigin]);
  const readyStoryLead = "伊都キャンパス探索ルート";
  const readyStoryTone = readyStoryToneMap[selectedFamiliarity];
  const effectiveReadyStoryLead = adminWorldConfig?.title || readyStoryLead;
  const effectivePrologueNarrationText =
    adminWorldConfig?.prologueBody || adminWorldConfig?.description || defaultPrologueNarrationText;
  const effectivePrologueCtaText = adminWorldConfig?.prologueCta || "最初の場所へ向かう";
  const effectiveEpilogueNarrationText = adminWorldConfig?.epilogueBody || defaultEpilogueNarrationText;
  const effectiveEpilogueCtaText = adminWorldConfig?.epilogueCta || "体験を振り返る";
  const prologueNarrationChars = useMemo(
    () => Array.from(effectivePrologueNarrationText),
    [effectivePrologueNarrationText],
  );
  const epilogueNarrationChars = useMemo(
    () => Array.from(effectiveEpilogueNarrationText),
    [effectiveEpilogueNarrationText],
  );
  const readySectionWidth = useMemo(() => Math.max(0, Math.min(width - 32, 896)), [width]);
  const readyHeroTitleFontSize = useMemo(() => (readySectionWidth >= 768 ? 56 : 36), [readySectionWidth]);
  const readyHeroTitleLineHeight = useMemo(() => (readySectionWidth >= 768 ? 64 : 44), [readySectionWidth]);
  const readyHintGap = 12;
  const readyHintColumns = readySectionWidth >= 760 ? 3 : 1;
  const readyHintCardWidth =
    readyHintColumns === 3
      ? (readySectionWidth - readyHintGap * (readyHintColumns - 1)) / readyHintColumns
      : readySectionWidth;
  const readyStoryTagline = useMemo(
    () => `${spots[0]?.name ?? "最初のスポット"}から${spots[spots.length - 1]?.name ?? "最後のスポット"}まで、${readyDurationLabelMap[selectedDuration]}の${selectedDuration}体験`,
    [selectedDuration, spots],
  );
  const readyStorySynopsis = useMemo(() => {
    if (adminWorldConfig?.description) return adminWorldConfig.description;

    const familiarityView: Record<Familiarity, string> = {
      はじめて来た: "初めて訪れる視点でも迷わないように",
      まだあまり慣れていない: "まだ掴みきれていない導線を補いながら",
      何度か来たことがある: "知っている景色に新しい意味を重ねながら",
      よく来ている: "慣れた導線を深く読み解きながら",
    };
    return `${familiarityView[selectedFamiliarity]}伊都キャンパスを巡る物語です。各スポットで短いシナリオを受け取りながら、場所の背景と日常の使い方を自然に理解できる構成になっています。`;
  }, [adminWorldConfig?.description, selectedFamiliarity]);
  const readyFamiliarityChipLabel = useMemo(() => {
    const familiarityLabelMap: Record<Familiarity, string> = {
      はじめて来た: "はじめて",
      まだあまり慣れていない: "まだ慣れていない",
      何度か来たことがある: "何度か来た",
      よく来ている: "よく来ている",
    };
    return familiarityLabelMap[selectedFamiliarity];
  }, [selectedFamiliarity]);
  const readyDurationChipLabel = selectedDuration.replace("〜", "-");
  const readyInputItems = useMemo<ReadyInputItem[]>(
    () => [
      {
        id: "ready-user",
        icon: "school-outline",
        label: "対象ユーザー",
        value: selectedUserType,
      },
      {
        id: "ready-familiarity",
        icon: "sparkles-outline",
        label: "慣れの度合い",
        value: readyFamiliarityChipLabel,
      },
      {
        id: "ready-duration",
        icon: "time-outline",
        label: "想定時間",
        value: readyDurationChipLabel,
      },
    ],
    [readyDurationChipLabel, readyFamiliarityChipLabel, selectedUserType],
  );
  const readyTips = useMemo<ReadyTip[]>(
    () => [
      {
        id: "ready-tip-a",
        icon: "map-outline",
        title: "地図で確認",
        body: "アプリのナビゲーション機能を使って、迷わずにスポットへ辿り着けます。",
      },
      {
        id: "ready-tip-b",
        icon: "book-outline",
        title: "現地で読む",
        body: "スポットに到着すると、その場所にまつわる隠された物語が解放されます。",
      },
      {
        id: "ready-tip-c",
        icon: "create-outline",
        title: "記録する",
        body: "感じたこと、見つけた景色をあなたの手帳にメモして残しましょう。",
      },
    ],
    [],
  );

  useEffect(() => {
    setCurrentSpotIndex((prev) => clampSpotIndex(prev, spots.length));
  }, [spots.length]);

  const landingHeroAnimatedStyle = {
    opacity: landingHeroAnim,
    transform: [
      {
        translateY: landingHeroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  };
  const landingCardsAnimatedStyle = {
    opacity: landingCardsAnim,
    transform: [
      {
        translateY: landingCardsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [32, 0],
        }),
      },
    ],
  };
  const setupHeroAnimatedStyle = {
    opacity: setupHeroAnim,
    transform: [
      {
        translateY: setupHeroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };
  const setupCardsAnimatedStyle = {
    opacity: setupCardsAnim,
    transform: [
      {
        translateY: setupCardsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
    ],
  };
  const readyHeroAnimatedStyle = {
    opacity: readyHeroAnim,
    transform: [
      {
        translateY: readyHeroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };
  const readyCardsAnimatedStyle = {
    opacity: readyCardsAnim,
    transform: [
      {
        translateY: readyCardsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };
  const readyTransitionOverlayAnimatedStyle = {
    opacity: readyTransitionOverlayAnim,
  };
  const readyTransitionPanelAnimatedStyle = {
    opacity: readyTransitionOverlayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: readyTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [36, 0],
        }),
      },
      {
        scale: readyTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
    ],
  };
  const readyTransitionGlowAnimatedStyle = {
    opacity: readyTransitionPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.22, 0.72],
    }),
    transform: [
      {
        scale: readyTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1.16],
        }),
      },
    ],
  };
  const readyTransitionProgressAnimatedStyle = {
    width: readyTransitionProgressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["10%", "100%"],
    }),
  };
  const mapScenarioTransitionOverlayAnimatedStyle = {
    opacity: mapScenarioTransitionOverlayAnim.interpolate({
      inputRange: [0, 0.32, 1],
      outputRange: [0, 0.72, 1],
    }),
  };
  const mapScenarioTransitionGlowAnimatedStyle = {
    opacity: mapScenarioTransitionPulseAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.18, 0.46, 0.86],
    }),
    transform: [
      {
        scale: mapScenarioTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.38, 1.65],
        }),
      },
    ],
  };
  const mapScenarioTransitionPanelAnimatedStyle = {
    opacity: mapScenarioTransitionPulseAnim.interpolate({
      inputRange: [0, 0.36, 1],
      outputRange: [0, 0.68, 1],
    }),
    transform: [
      {
        translateY: mapScenarioTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
      {
        scale: mapScenarioTransitionPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
    ],
  };
  const prologueContentAnimatedStyle = {
    opacity: prologueEntryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: prologueEntryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
      {
        scale: prologueEntryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1.02, 1],
        }),
      },
    ],
  };
  const prologueTypingDuration = Math.max(4200, prologueNarrationChars.length * 88);
  const prologueCtaAnimatedStyle = {
    opacity: prologueTypingAnim.interpolate({
      inputRange: [prologueNarrationChars.length * 0.72, prologueNarrationChars.length],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: prologueTypingAnim.interpolate({
          inputRange: [prologueNarrationChars.length * 0.7, prologueNarrationChars.length],
          outputRange: [34, 0],
          extrapolate: "clamp",
        }),
      },
    ],
  };
  const epilogueContentAnimatedStyle = {
    opacity: epilogueEntryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: epilogueEntryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
      {
        scale: epilogueEntryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1.02, 1],
        }),
      },
    ],
  };
  const epilogueTypingDuration = Math.max(4200, epilogueNarrationChars.length * 88);
  const epilogueCtaAnimatedStyle = {
    opacity: epilogueTypingAnim.interpolate({
      inputRange: [epilogueNarrationChars.length * 0.72, epilogueNarrationChars.length],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: epilogueTypingAnim.interpolate({
          inputRange: [epilogueNarrationChars.length * 0.7, epilogueNarrationChars.length],
          outputRange: [34, 0],
          extrapolate: "clamp",
        }),
      },
    ],
  };
  const preparingGlowAnimatedStyle = {
    opacity: preparingPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.86],
    }),
    transform: [
      {
        scale: preparingPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.1],
        }),
      },
    ],
  };
  const preparingOuterRingAnimatedStyle = {
    transform: [
      {
        rotate: preparingRotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };
  const preparingInnerRingAnimatedStyle = {
    transform: [
      {
        rotate: preparingRotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-360deg"],
        }),
      },
    ],
  };
  const preparingCoreDotAnimatedStyle = {
    transform: [
      {
        scale: preparingPulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.18],
        }),
      },
    ],
    opacity: preparingPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    }),
  };
  const preparingBarAAnimatedStyle = {
    transform: [
      {
        scaleY: preparingBarAnimA.interpolate({
          inputRange: [0, 1],
          outputRange: [0.75, 1.22],
        }),
      },
    ],
    opacity: preparingBarAnimA.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  };
  const preparingBarBAnimatedStyle = {
    transform: [
      {
        scaleY: preparingBarAnimB.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.3],
        }),
      },
    ],
    opacity: preparingBarAnimB.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  };
  const preparingBarCAnimatedStyle = {
    transform: [
      {
        scaleY: preparingBarAnimC.interpolate({
          inputRange: [0, 1],
          outputRange: [0.76, 1.2],
        }),
      },
    ],
    opacity: preparingBarAnimC.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  };
  const preparingStatusCoreAnimatedStyle = {
    transform: [
      {
        scale: preparingStatusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.15],
        }),
      },
    ],
    opacity: preparingStatusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 1],
    }),
  };
  const preparingProgressAnimatedStyle = {
    width: preparingProgressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["42%", "84%"],
    }),
    opacity: preparingProgressAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.55, 1, 0.7],
    }),
  };

  const centerNativeMapTo = (coords: Coordinate) => {
    if (Platform.OS === "web") return;
    mapRef.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      700,
    );
  };

  const fetchCurrentLocation = async (): Promise<Coordinate> => {
    if (Platform.OS === "web") {
      const webGeolocation = typeof navigator !== "undefined" ? navigator.geolocation : undefined;
      if (!webGeolocation) {
        throw new Error("このブラウザでは位置情報が利用できません。");
      }

      return new Promise<Coordinate>((resolve, reject) => {
        webGeolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              reject(new Error("位置情報の利用が許可されていません。"));
              return;
            }
            reject(new Error("現在地の取得に失敗しました。"));
          },
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0,
          },
        );
      });
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      throw new Error("位置情報の利用が許可されていません。");
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const ensureFirebaseUser = async (): Promise<string | null> => {
    const auth = getFirebaseClientAuth();
    if (!auth) return null;

    if (auth.currentUser?.uid) {
      if (firebaseUid !== auth.currentUser.uid) {
        setFirebaseUid(auth.currentUser.uid);
      }
      return auth.currentUser.uid;
    }

    try {
      const credential = await signInAnonymously(auth);
      const uid = credential.user.uid;
      setFirebaseUid(uid);
      return uid;
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      if (code === "operation-not-allowed") {
        console.warn("[kyudai-mvp] Firebase anonymous auth is disabled.");
      } else {
        console.error("[kyudai-mvp] Failed to sign in anonymously", error);
      }
      return null;
    }
  };

  const persistSessionDocument = async (
    sessionId: string,
    payload: Record<string, unknown>,
    contextLabel: string,
  ): Promise<boolean> => {
    const db = getFirebaseClientDb();
    if (!db) {
      if (!firebaseMissingConfigWarnedRef.current) {
        const missingKeys = getFirebaseMissingEnvKeys();
        console.warn(
          "[kyudai-mvp] Firebase config is missing. Session/feedback will stay local only.",
          missingKeys,
        );
        firebaseMissingConfigWarnedRef.current = true;
      }
      return false;
    }

    const uid = await ensureFirebaseUser();
    const candidateRefs = [];
    if (uid) {
      candidateRefs.push(doc(db, "users", uid, EXPERIENCE_SESSION_COLLECTION, sessionId));
    }
    candidateRefs.push(doc(db, EXPERIENCE_SESSION_COLLECTION, sessionId));

    let lastError: unknown = null;

    for (const targetRef of candidateRefs) {
      try {
        await setDoc(
          targetRef,
          {
            sessionId,
            uid: uid ?? null,
            platform: Platform.OS,
            updatedAt: serverTimestamp(),
            ...payload,
          },
          { merge: true },
        );
        return true;
      } catch (error) {
        lastError = error;
        const code = getFirebaseErrorCode(error);
        if (code === "permission-denied") {
          continue;
        }
        break;
      }
    }

    console.error(`[kyudai-mvp] Failed to persist ${contextLabel}`, lastError);
    return false;
  };

  const ensureExperienceSession = (): string => {
    const sessionId = experienceSessionId ?? generateExperienceSessionId();

    if (!experienceSessionId) {
      setExperienceSessionId(sessionId);
    }

    if (!experienceStartedAtIso) {
      setExperienceStartedAtIso(new Date().toISOString());
    }

    return sessionId;
  };

  const handleSetupCreateExperiencePress = () => {
    ensureExperienceSession();
    setFeedbackOverallRating(null);
    setFeedbackGuidanceScore(null);
    setFeedbackCampusScore(null);
    setFeedbackReuseIntent(null);
    setFeedbackComment("");
    setScreen("preparing");
  };

  const handleReadyStartPress = () => {
    if (isReadyTransitioning) return;
    if (!experienceSessionId) {
      ensureExperienceSession();
    }

    setIsReadyTransitioning(true);
    readyTransitionOverlayAnim.stopAnimation();
    readyTransitionPulseAnim.stopAnimation();
    readyTransitionProgressAnim.stopAnimation();

    readyTransitionOverlayAnim.setValue(0);
    readyTransitionPulseAnim.setValue(0);
    readyTransitionProgressAnim.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(readyTransitionOverlayAnim, {
          toValue: 1,
          duration: 560,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(readyTransitionPulseAnim, {
          toValue: 0.58,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(readyTransitionProgressAnim, {
          toValue: 0.46,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(readyTransitionPulseAnim, {
          toValue: 1,
          duration: 940,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(readyTransitionProgressAnim, {
          toValue: 1,
          duration: 940,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(280),
    ]).start(({ finished }) => {
      if (!finished) {
        setIsReadyTransitioning(false);
        return;
      }

      setScreen("prologue");

      Animated.sequence([
        Animated.delay(220),
        Animated.timing(readyTransitionOverlayAnim, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsReadyTransitioning(false);
        readyTransitionPulseAnim.setValue(0);
        readyTransitionProgressAnim.setValue(0);
      });
    });
  };

  const handlePrologueNarrationPress = () => {
    if (screen !== "prologue") return;
    if (isPrologueTypingDone) return;
    prologueEntryAnim.stopAnimation();
    prologueTypingAnim.stopAnimation();
    prologueEntryAnim.setValue(1);
    prologueTypingAnim.setValue(prologueNarrationChars.length);
    setIsPrologueTypingDone(true);
  };

  const handleEpilogueNarrationPress = () => {
    if (screen !== "epilogue") return;
    if (isEpilogueTypingDone) return;
    epilogueEntryAnim.stopAnimation();
    epilogueTypingAnim.stopAnimation();
    epilogueEntryAnim.setValue(1);
    epilogueTypingAnim.setValue(epilogueNarrationChars.length);
    setIsEpilogueTypingDone(true);
  };

  const handleLocatePress = async () => {
    if (isLocating) return;
    setIsLocating(true);

    try {
      const coords = await fetchCurrentLocation();
      setLiveCurrentLocation(coords);
      centerNativeMapTo(coords);
    } catch {
      // no-op: keep map card text stable even when location fetch fails
    } finally {
      setIsLocating(false);
    }
  };

  const runFlowTransition = ({
    title,
    body,
    toScreen,
    onNavigate,
  }: {
    title: string;
    body: string;
    toScreen: AppScreen;
    onNavigate?: () => void;
  }) => {
    if (isMapScenarioTransitioning) return;

    setFlowTransitionTitle(title);
    setFlowTransitionBody(body);
    setIsMapScenarioTransitioning(true);
    mapScenarioTransitionOverlayAnim.stopAnimation();
    mapScenarioTransitionPulseAnim.stopAnimation();
    mapScenarioTransitionOverlayAnim.setValue(0);
    mapScenarioTransitionPulseAnim.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(mapScenarioTransitionOverlayAnim, {
          toValue: 0.76,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(mapScenarioTransitionPulseAnim, {
          toValue: 0.56,
          duration: 440,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(mapScenarioTransitionOverlayAnim, {
          toValue: 1,
          duration: 560,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(mapScenarioTransitionPulseAnim, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(260),
    ]).start(({ finished }) => {
      if (!finished) {
        setIsMapScenarioTransitioning(false);
        mapScenarioTransitionOverlayAnim.setValue(0);
        mapScenarioTransitionPulseAnim.setValue(0);
        return;
      }

      onNavigate?.();
      setScreen(toScreen);

      Animated.sequence([
        Animated.delay(140),
        Animated.parallel([
          Animated.timing(mapScenarioTransitionOverlayAnim, {
            toValue: 0,
            duration: 520,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(mapScenarioTransitionPulseAnim, {
            toValue: 0,
            duration: 560,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setIsMapScenarioTransitioning(false);
        mapScenarioTransitionOverlayAnim.setValue(0);
        mapScenarioTransitionPulseAnim.setValue(0);
      });
    });
  };

  const handleSpotArrivedPress = () => {
    runFlowTransition({
      title: "到着しました",
      body: "シナリオを開いています",
      toScreen: "spotArrival",
      onNavigate: () => {
        if (isExperienceCompleted) {
          setCurrentSpotIndex(0);
          setIsExperienceCompleted(false);
        }
      },
    });
  };

  const handleSpotScenarioNextPress = () => {
    if (!isSpotTypingDone) {
      setSpotTypedCharCount(spotScenarioChars.length);
      setIsSpotTypingDone(true);
      return;
    }

    if (hasNextScenarioInSpot) {
      setSpotScenarioSegmentIndex((prev) => Math.min(prev + 1, spotScenarioTexts.length - 1));
      return;
    }

    if (safeCurrentSpotIndex >= spots.length - 1) {
      runFlowTransition({
        title: "物語を結んでいます",
        body: "エピローグへ進みます",
        toScreen: "epilogue",
        onNavigate: () => setIsExperienceCompleted(true),
      });
      return;
    }
    runFlowTransition({
      title: "次のルートを準備中",
      body: "マップへ戻ります",
      toScreen: "map",
      onNavigate: () => setCurrentSpotIndex((prev) => clampSpotIndex(prev + 1, spots.length)),
    });
  };

  const handleSpotScenarioTextPress = () => {
    if (screen !== "spotArrival") return;
    if (isSpotTypingDone) return;
    setSpotTypedCharCount(spotScenarioChars.length);
    setIsSpotTypingDone(true);
  };

  const renderFlowTransitionOverlay = () => (
    <Animated.View pointerEvents="auto" style={[styles.mapScenarioTransitionOverlay, mapScenarioTransitionOverlayAnimatedStyle]}>
      <Animated.View style={[styles.mapScenarioTransitionGlow, mapScenarioTransitionGlowAnimatedStyle]} />
      <Animated.View style={[styles.mapScenarioTransitionPanel, mapScenarioTransitionPanelAnimatedStyle]}>
        <View style={styles.mapScenarioTransitionIconWrap}>
          <Ionicons name="sparkles" size={27} color={palette.tertiaryContainer} />
        </View>
        <Text style={styles.mapScenarioTransitionTitle}>{flowTransitionTitle}</Text>
        <Text style={styles.mapScenarioTransitionBody}>{flowTransitionBody}</Text>
      </Animated.View>
    </Animated.View>
  );

  const handleFeedbackSubmit = async () => {
    if (isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);

    try {
      const sessionId = ensureExperienceSession();
      await persistSessionDocument(
        sessionId,
        {
          status: "completed",
          completedAt: serverTimestamp(),
          startedAtClient: experienceStartedAtIso ?? new Date().toISOString(),
          setup: {
            userType: selectedUserType,
            familiarity: selectedFamiliarity,
            duration: selectedDuration,
            explorationStyle: selectedExplorationStyle,
            experienceExpectation: selectedExperienceExpectation,
          },
          feedback: {
            overallRating: feedbackOverallRating,
            guidanceScore: feedbackGuidanceScore,
            campusScore: feedbackCampusScore,
            visitIntentScore: feedbackVisitIntentScore,
            expectationScore: feedbackExpectationScore,
            reuseIntent: feedbackReuseIntent,
            comment: feedbackComment.trim(),
            submittedAt: new Date().toISOString(),
          },
        },
        "feedback",
      );
    } catch (error) {
      console.error("[kyudai-mvp] Failed to persist feedback", error);
    } finally {
      setCurrentSpotIndex(0);
      setIsExperienceCompleted(false);
      setLiveCurrentLocation(null);
      setExperienceSessionId(null);
      setExperienceStartedAtIso(null);
      setFeedbackOverallRating(null);
      setFeedbackGuidanceScore(null);
      setFeedbackCampusScore(null);
      setFeedbackVisitIntentScore(null);
      setFeedbackExpectationScore(null);
      setFeedbackReuseIntent(null);
      setFeedbackComment("");
      setIsSubmittingFeedback(false);
      setScreen("landing");
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    if (experienceSessionId) {
      window.sessionStorage.setItem(EXPERIENCE_SESSION_STORAGE_KEY, experienceSessionId);
      return;
    }

    window.sessionStorage.removeItem(EXPERIENCE_SESSION_STORAGE_KEY);
  }, [experienceSessionId]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    if (experienceStartedAtIso) {
      window.sessionStorage.setItem(EXPERIENCE_STARTED_AT_STORAGE_KEY, experienceStartedAtIso);
      return;
    }

    window.sessionStorage.removeItem(EXPERIENCE_STARTED_AT_STORAGE_KEY);
  }, [experienceStartedAtIso]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    const draft: PersistedFlowDraft = {
      selectedUserType,
      selectedFamiliarity,
      selectedDuration,
      selectedExplorationStyle,
      selectedExperienceExpectation,
      experienceSessionId,
      experienceStartedAtIso,
      currentSpotIndex: safeCurrentSpotIndex,
      isExperienceCompleted,
      feedbackOverallRating,
      feedbackGuidanceScore,
      feedbackCampusScore,
      feedbackVisitIntentScore,
      feedbackExpectationScore,
      feedbackReuseIntent,
      feedbackComment,
    };

    window.localStorage.setItem(FLOW_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    selectedUserType,
    selectedFamiliarity,
    selectedDuration,
    selectedExplorationStyle,
    selectedExperienceExpectation,
    experienceSessionId,
    experienceStartedAtIso,
    safeCurrentSpotIndex,
    isExperienceCompleted,
    feedbackOverallRating,
    feedbackGuidanceScore,
    feedbackCampusScore,
    feedbackVisitIntentScore,
    feedbackExpectationScore,
    feedbackReuseIntent,
    feedbackComment,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handlePopState = () => {
      const nextScreen = getScreenFromCurrentPath();
      setScreen(nextScreen);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      const message = data as {
        source?: unknown;
        type?: unknown;
        payload?: unknown;
      };

      if (message.source !== "tomoshibi-admin-console") return;

      if (message.type === "tomoshibi-world-config:update") {
        const parsed = parseAdminWorldConfigPayload(message.payload);
        if (!parsed) return;
        setAdminWorldConfig(parsed);
        return;
      }

      if (message.type === "tomoshibi-navigation:step") {
        if (!message.payload || typeof message.payload !== "object") return;
        const payload = message.payload as { direction?: unknown };
        if (payload.direction !== "back" && payload.direction !== "forward") return;

        setScreen((current) => {
          const currentIndex = previewNavigationScreenOrder.indexOf(current);
          if (currentIndex === -1) return current;
          const nextIndex =
            payload.direction === "forward"
              ? Math.min(previewNavigationScreenOrder.length - 1, currentIndex + 1)
              : Math.max(0, currentIndex - 1);
          return previewNavigationScreenOrder[nextIndex] ?? current;
        });
        return;
      }

      if (message.type === "tomoshibi-navigation:set-screen") {
        if (!message.payload || typeof message.payload !== "object") return;
        const payload = message.payload as { screen?: unknown };
        if (typeof payload.screen !== "string") return;
        if (!previewNavigationScreenOrder.includes(payload.screen as AppScreen)) return;
        setScreen(payload.screen as AppScreen);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    window.parent.postMessage(
      {
        source: "kyudai-dictionary-mvp-mobile",
        type: "tomoshibi-mobile:state",
        payload: {
          screen,
          worldConfig: adminWorldConfig,
        },
      },
      "*",
    );
  }, [adminWorldConfig, screen]);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const prevHtml = {
      height: html.style.height,
      width: html.style.width,
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
    };
    const prevBody = {
      margin: body.style.margin,
      padding: body.style.padding,
      height: body.style.height,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
    };
    const prevRoot = root
      ? {
          height: root.style.height,
          width: root.style.width,
          overflow: root.style.overflow,
        }
      : null;

    html.style.height = "100%";
    html.style.width = "100%";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    body.style.margin = "0";
    body.style.padding = "0";
    body.style.height = "100%";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    if (root) {
      root.style.height = "100%";
      root.style.width = "100%";
      root.style.overflow = "hidden";
    }

    return () => {
      html.style.height = prevHtml.height;
      html.style.width = prevHtml.width;
      html.style.overflow = prevHtml.overflow;
      html.style.overscrollBehavior = prevHtml.overscrollBehavior;

      body.style.margin = prevBody.margin;
      body.style.padding = prevBody.padding;
      body.style.height = prevBody.height;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      body.style.overscrollBehavior = prevBody.overscrollBehavior;

      if (root && prevRoot) {
        root.style.height = prevRoot.height;
        root.style.width = prevRoot.width;
        root.style.overflow = prevRoot.overflow;
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const targetPath = screenPathMap[screen];
    const currentPath = normalizePath(window.location.pathname);
    if (currentPath === targetPath) {
      if (!hasSyncedInitialWebPathRef.current) {
        hasSyncedInitialWebPathRef.current = true;
      }
      return;
    }

    if (!hasSyncedInitialWebPathRef.current) {
      window.history.replaceState(null, "", targetPath);
      hasSyncedInitialWebPathRef.current = true;
      return;
    }

    window.history.pushState(null, "", targetPath);
  }, [screen]);

  useEffect(() => {
    if (screen !== "spotArrival") return;
    if (cameraPermission?.granted) return;
    void requestCameraPermission();
  }, [screen, cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    if (screen !== "spotArrival") return;
    setSpotScenarioSegmentIndex(0);
  }, [screen, currentSpot.id]);

  useEffect(() => {
    if (screen !== "spotArrival") return;

    setSpotTypedCharCount(0);
    setIsSpotTypingDone(false);

    if (spotScenarioChars.length === 0) {
      setIsSpotTypingDone(true);
      return;
    }

    let typedCount = 0;
    const interval = setInterval(() => {
      typedCount = Math.min(spotScenarioChars.length, typedCount + spotTypingStep);
      setSpotTypedCharCount(typedCount);

      if (typedCount >= spotScenarioChars.length) {
        setIsSpotTypingDone(true);
        clearInterval(interval);
      }
    }, spotTypingIntervalMs);

    return () => clearInterval(interval);
  }, [screen, currentSpot.id, spotScenarioSegmentIndex, spotScenarioChars.length]);

  useEffect(() => {
    if (screen === "setup") return;
    setIsUserTypeMenuOpen(false);
  }, [screen]);

  useEffect(() => {
    if (screen !== "setup") return;
    setupHeroAnim.setValue(0);
    setupCardsAnim.setValue(0);
    Animated.parallel([
      Animated.timing(setupHeroAnim, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(setupCardsAnim, {
        toValue: 1,
        duration: 560,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [screen, setupCardsAnim, setupHeroAnim]);

  useEffect(() => {
    if (screen !== "landing") return;
    landingHeroAnim.setValue(0);
    landingCardsAnim.setValue(0);
    Animated.parallel([
      Animated.timing(landingHeroAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(landingCardsAnim, {
        toValue: 1,
        duration: 620,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [screen, landingCardsAnim, landingHeroAnim]);

  useEffect(() => {
    if (screen !== "ready") return;
    readyHeroAnim.setValue(0);
    readyCardsAnim.setValue(0);
    Animated.parallel([
      Animated.timing(readyHeroAnim, {
        toValue: 1,
        duration: 440,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(readyCardsAnim, {
        toValue: 1,
        duration: 580,
        delay: 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [screen, readyCardsAnim, readyHeroAnim]);

  useEffect(() => {
    if (screen !== "prologue") return;
    setIsPrologueTypingDone(false);
    prologueEntryAnim.stopAnimation();
    prologueTypingAnim.stopAnimation();
    prologueEntryAnim.setValue(0);
    prologueTypingAnim.setValue(0);
    const prologueEntryTiming = Animated.timing(prologueEntryAnim, {
      toValue: 1,
      duration: 1280,
      easing: Easing.out(Easing.sin),
      useNativeDriver: true,
    });
    const prologueTypingTiming = Animated.timing(prologueTypingAnim, {
      toValue: prologueNarrationChars.length,
      duration: prologueTypingDuration,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    prologueEntryTiming.start();
    prologueTypingTiming.start(({ finished }) => {
      if (finished) setIsPrologueTypingDone(true);
    });
    return () => {
      prologueEntryTiming.stop();
      prologueTypingTiming.stop();
    };
  }, [screen, prologueEntryAnim, prologueTypingAnim, prologueTypingDuration]);

  useEffect(() => {
    if (screen !== "epilogue") return;
    setIsEpilogueTypingDone(false);
    epilogueEntryAnim.stopAnimation();
    epilogueTypingAnim.stopAnimation();
    epilogueEntryAnim.setValue(0);
    epilogueTypingAnim.setValue(0);
    const epilogueEntryTiming = Animated.timing(epilogueEntryAnim, {
      toValue: 1,
      duration: 1280,
      easing: Easing.out(Easing.sin),
      useNativeDriver: true,
    });
    const epilogueTypingTiming = Animated.timing(epilogueTypingAnim, {
      toValue: epilogueNarrationChars.length,
      duration: epilogueTypingDuration,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    epilogueEntryTiming.start();
    epilogueTypingTiming.start(({ finished }) => {
      if (finished) setIsEpilogueTypingDone(true);
    });
    return () => {
      epilogueEntryTiming.stop();
      epilogueTypingTiming.stop();
    };
  }, [screen, epilogueEntryAnim, epilogueTypingAnim, epilogueTypingDuration]);

  useEffect(() => {
    if (screen === "ready" || screen === "prologue") return;
    if (!isReadyTransitioning) return;
    setIsReadyTransitioning(false);
    readyTransitionOverlayAnim.setValue(0);
    readyTransitionPulseAnim.setValue(0);
    readyTransitionProgressAnim.setValue(0);
  }, [
    screen,
    isReadyTransitioning,
    readyTransitionOverlayAnim,
    readyTransitionPulseAnim,
    readyTransitionProgressAnim,
  ]);

  useEffect(() => {
    if (screen !== "preparing") return;

    preparingPulseAnim.setValue(0);
    preparingRotateAnim.setValue(0);
    preparingBarAnimA.setValue(0);
    preparingBarAnimB.setValue(0);
    preparingBarAnimC.setValue(0);
    preparingStatusAnim.setValue(0);
    preparingProgressAnim.setValue(0);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(preparingPulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(preparingPulseAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotateLoop = Animated.loop(
      Animated.timing(preparingRotateAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const barPulse = (anim: Animated.Value) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

    const barsLoop = Animated.loop(Animated.stagger(150, [barPulse(preparingBarAnimA), barPulse(preparingBarAnimB), barPulse(preparingBarAnimC)]));

    const statusLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(preparingStatusAnim, {
          toValue: 1,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(preparingStatusAnim, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(preparingProgressAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(preparingProgressAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );

    pulseLoop.start();
    rotateLoop.start();
    barsLoop.start();
    statusLoop.start();
    progressLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
      barsLoop.stop();
      statusLoop.stop();
      progressLoop.stop();
    };
  }, [
    screen,
    preparingBarAnimA,
    preparingBarAnimB,
    preparingBarAnimC,
    preparingProgressAnim,
    preparingPulseAnim,
    preparingRotateAnim,
    preparingStatusAnim,
  ]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (screen !== "map") return;
    if (useMockMapBackground) return;

    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(mapFitCoordinates, {
        edgePadding: {
          top: 84,
          right: 84,
          bottom: 330,
          left: 84,
        },
        animated: true,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [screen, mapFitCoordinates, useMockMapBackground]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (screen !== "map") return;
    if (useMockMapBackground) return;

    let cancelled = false;

    const loadDirections = async () => {
      try {
        const futureWaypoints = spots.slice(safeCurrentSpotIndex + 1, -1).map((spot) => spot.coordinate);
        const [wholeRoute, activeRoute] = await Promise.all([
          safeCurrentSpotIndex >= spots.length - 1
            ? Promise.resolve<Coordinate[] | null>(null)
            : fetchWalkingDirectionsCoordinates(currentSpot.coordinate, goalSpot.coordinate, futureWaypoints),
          fetchWalkingDirectionsCoordinates(routeOrigin, currentSpot.coordinate),
        ]);

        if (cancelled) return;

        setWholeRouteDirectionsCoordinates(wholeRoute);
        setActiveRouteDirectionsCoordinates(activeRoute);
      } catch {
        if (cancelled) return;
        setWholeRouteDirectionsCoordinates(null);
        setActiveRouteDirectionsCoordinates(null);
      }
    };

    void loadDirections();

    return () => {
      cancelled = true;
    };
  }, [
    screen,
    routeOrigin.latitude,
    routeOrigin.longitude,
    currentSpot.id,
    currentSpot.coordinate.latitude,
    currentSpot.coordinate.longitude,
    goalSpot.coordinate,
    safeCurrentSpotIndex,
    useMockMapBackground,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (screen !== "map") return;
    if (useMockMapBackground) return;

    let cancelled = false;
    const previousAuthFailureHandler = (globalThis as any).gm_authFailure;
    (globalThis as any).gm_authFailure = () => {
      if (cancelled) return;
      setWebMapError("Google Maps課金設定エラーのため、代替マップで表示します。");
    };

    const renderWebMap = async () => {
      setWebMapError(null);
      if (!GOOGLE_MAPS_WEB_API_KEY) {
        setWebMapError("Google Maps APIキーが設定されていないため、マップを表示できません。");
        return;
      }

      try {
        await loadGoogleMapsJs();
        if (cancelled) return;

        const googleMaps = (globalThis as any)?.google?.maps;
        if (!googleMaps) {
          setWebMapError("Google Mapsの読み込みに失敗しました。");
          return;
        }

        if (!mapWebHostRef.current) return;

        if (!mapWebInstanceRef.current) {
          mapWebInstanceRef.current = new googleMaps.Map(mapWebHostRef.current, {
            center: {
              lat: mapInitialRegion.latitude,
              lng: mapInitialRegion.longitude,
            },
            zoom: 16,
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            gestureHandling: "greedy",
            styles: [
              { featureType: "poi", stylers: [{ saturation: -100 }, { lightness: 16 }] },
              { featureType: "transit", stylers: [{ saturation: -100 }] },
              { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            ],
          });
        }

        const map = mapWebInstanceRef.current;

        if (mapWebCurrentLocationMarkerRef.current) {
          mapWebCurrentLocationMarkerRef.current.setMap(null);
          mapWebCurrentLocationMarkerRef.current = null;
        }

        mapWebSpotMarkersRef.current.forEach((marker) => marker.setMap(null));
        mapWebSpotMarkersRef.current = [];

        if (mapWebActiveRoutePolylineRef.current) {
          mapWebActiveRoutePolylineRef.current.setMap(null);
          mapWebActiveRoutePolylineRef.current = null;
        }
        if (mapWebWholeRoutePolylineRef.current) {
          mapWebWholeRoutePolylineRef.current.setMap(null);
          mapWebWholeRoutePolylineRef.current = null;
        }

        const toLatLngLiteral = (coordinate: Coordinate) => ({ lat: coordinate.latitude, lng: coordinate.longitude });
        const directionsService = new googleMaps.DirectionsService();

        const resolveWalkingPath = async (
          origin: Coordinate,
          destination: Coordinate,
          waypoints: Coordinate[] = [],
        ): Promise<Array<{ lat: number; lng: number }>> => {
          try {
            const result = await directionsService.route({
              origin: toLatLngLiteral(origin),
              destination: toLatLngLiteral(destination),
              waypoints: waypoints.map((point) => ({ location: toLatLngLiteral(point) })),
              travelMode: googleMaps.TravelMode.WALKING,
              provideRouteAlternatives: false,
            });
            const overviewPath = result?.routes?.[0]?.overview_path;
            if (Array.isArray(overviewPath) && overviewPath.length > 1) {
              return overviewPath.map((point: any) => ({ lat: point.lat(), lng: point.lng() }));
            }
          } catch {
            // Fallback to straight line when Directions request fails.
          }

          return [toLatLngLiteral(origin), ...waypoints.map(toLatLngLiteral), toLatLngLiteral(destination)];
        };

        const futureWaypoints = spots.slice(safeCurrentSpotIndex + 1, -1).map((spot) => spot.coordinate);
        const wholePath =
          safeCurrentSpotIndex >= spots.length - 1
            ? [toLatLngLiteral(currentSpot.coordinate)]
            : await resolveWalkingPath(currentSpot.coordinate, goalSpot.coordinate, futureWaypoints);
        const activePath = await resolveWalkingPath(routeOrigin, currentSpot.coordinate);

        if (wholePath.length > 1) {
          mapWebWholeRoutePolylineRef.current = new googleMaps.Polyline({
            map,
            path: wholePath,
            geodesic: true,
            strokeColor: "#8f999f",
            strokeOpacity: 0,
            strokeWeight: 3,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  scale: 3,
                },
                offset: "0",
                repeat: "12px",
              },
            ],
          });
        }

        mapWebActiveRoutePolylineRef.current = new googleMaps.Polyline({
          map,
          path: activePath,
          geodesic: true,
          strokeColor: "#f5ce53",
          strokeOpacity: 0.95,
          strokeWeight: 4,
        });

        mapWebCurrentLocationMarkerRef.current = new googleMaps.Marker({
          map,
          position: { lat: activeCurrentLocation.latitude, lng: activeCurrentLocation.longitude },
          title: "現在地",
          zIndex: 40,
          icon: {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#475464",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });

        mapWebSpotMarkersRef.current = spots.map((spot, index) => {
          const isActiveTarget = index === activeTargetIndex;
          const isStart = index === 0;
          const isGoal = index === spots.length - 1;
          const markerTitlePrefix = isStart ? "START: " : isGoal ? "GOAL: " : "";
          const labelText = isStart ? "S" : isGoal ? "G" : `${index + 1}`;
          const fillColor = isStart ? "#475464" : isGoal ? "#745c00" : "#8f979d";
          const labelColor = isStart || isGoal ? "#f9f9f7" : "#f9f9f7";
          const baseStrokeColor = isStart ? "#33414f" : isGoal ? "#4e3c00" : "#6f777d";

          return new googleMaps.Marker({
            map,
            position: { lat: spot.coordinate.latitude, lng: spot.coordinate.longitude },
            title: `${markerTitlePrefix}${spot.name}`,
            zIndex: isActiveTarget ? 50 : 20,
            label: {
              text: labelText,
              color: labelColor,
              fontSize: "11px",
              fontWeight: "700",
            },
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: isActiveTarget ? 11 : 9,
              fillColor,
              fillOpacity: isActiveTarget ? 1 : 0.88,
              strokeColor: isActiveTarget ? "#f5ce53" : baseStrokeColor,
              strokeWeight: isActiveTarget ? 3 : 1.6,
            },
          });
        });

        const bounds = new googleMaps.LatLngBounds();
        mapFitCoordinates.forEach((coordinate) => {
          bounds.extend({ lat: coordinate.latitude, lng: coordinate.longitude });
        });
        map.fitBounds(bounds);
        googleMaps.event.addListenerOnce(map, "idle", () => {
          if (cancelled) return;
          map.panBy(0, -130);
        });

        setWebMapError(null);
      } catch (error) {
        console.error("Google Maps web render error:", error);
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("BillingNotEnabled")) {
          setWebMapError("Google Maps課金設定エラーのため、代替マップで表示します。");
        } else {
          setWebMapError("Googleマップを表示できませんでした。");
        }
      }
    };

    void renderWebMap();

    return () => {
      cancelled = true;
      (globalThis as any).gm_authFailure = previousAuthFailureHandler;
    };
  }, [
    screen,
    mapInitialRegion.latitude,
    mapInitialRegion.longitude,
    mapFitCoordinates,
    allSpotCoordinates,
    activeRouteCoordinates,
    activeCurrentLocation.latitude,
    activeCurrentLocation.longitude,
    activeTargetIndex,
    safeCurrentSpotIndex,
    useMockMapBackground,
  ]);

  if (screen === "preparing") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.preparingTopBar}>
          <View style={styles.preparingBrandRow}>
            <Ionicons name="sparkles-outline" size={18} color="#1a1c20" />
            <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.preparingMain}>
          <View style={styles.preparingLoaderContainer}>
            <Animated.View style={[styles.preparingGlow, preparingGlowAnimatedStyle]} />
            <View style={styles.preparingLoaderWrap}>
              <Animated.View style={[styles.preparingCircleOuter, preparingOuterRingAnimatedStyle]} />
              <Animated.View style={[styles.preparingCircleInner, preparingInnerRingAnimatedStyle]} />

              <View style={styles.preparingCenterWrap}>
                <Animated.View style={[styles.preparingCoreDot, preparingCoreDotAnimatedStyle]}>
                  <View style={styles.preparingCoreDotRing} />
                  <View style={styles.preparingCoreDotIconWrap}>
                    <Ionicons name="sparkles" size={21} color={palette.tertiary} style={styles.preparingCoreDotIcon} />
                  </View>
                </Animated.View>
                <View style={styles.preparingBars}>
                  <Animated.View style={[styles.preparingBar, styles.preparingBarShort, preparingBarAAnimatedStyle]} />
                  <Animated.View style={[styles.preparingBar, styles.preparingBarTall, preparingBarBAnimatedStyle]} />
                  <Animated.View style={[styles.preparingBar, styles.preparingBarMid, preparingBarCAnimatedStyle]} />
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.preparingTextSection, { width: Math.min(contentWidth, 360) }]}>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={[styles.preparingTitle, { fontSize: preparingTitleFontSize, lineHeight: preparingTitleLineHeight }]}
            >
              {"あなたにあった\n体験を整えています"}
            </Text>
            <Text style={styles.preparingBody}>
              伊都キャンパスの空気や流れに合わせて、{"\n"}
              これから歩く物語を準備しています。
            </Text>
          </View>

          <View style={[styles.preparingStatusWrap, { width: Math.min(contentWidth, 300) }]}>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={21} color={palette.tertiaryContainer} />
              <Text style={styles.statusDoneText}>条件を整理しています</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusInProgressCircle}>
                <Animated.View style={[styles.statusInProgressCore, preparingStatusCoreAnimatedStyle]} />
              </View>
              <Text style={styles.statusProgressText}>体験の流れを整えています</Text>
            </View>

            <View style={[styles.statusRow, styles.statusPendingRow]}>
              <View style={styles.statusPendingCircle} />
              <Text style={styles.statusPendingText}>最初の場所を準備しています</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, preparingProgressAnimatedStyle]} />
            </View>
          </View>
        </View>

        <View style={styles.preparingFooter}>
          <Pressable style={({ pressed }) => [styles.preparingSkipButton, pressed && styles.pressed]} onPress={() => setScreen("ready")}>
            <Text style={styles.preparingSkipButtonText}>次へ</Text>
          </Pressable>
          <Text style={styles.preparingFooterText}>まもなく始まります</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "ready") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <View style={styles.readyTopBar}>
          <View style={styles.readyTopInner}>
            <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.readyScrollContent,
            { paddingBottom: readyBottomBarHeight > 0 ? readyBottomBarHeight + 28 : 180 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.readyHeroSection,
              Platform.OS === "web" ? ({ clipPath: "polygon(0 0, 100% 0, 100% 90%, 0% 100%)" } as any) : null,
              readyHeroAnimatedStyle,
            ]}
          >
            <Image source={{ uri: readyImage }} style={styles.readyHeroImage} resizeMode="cover" />
            <View style={styles.readyHeroUniformShade} />
            <View style={styles.readyHeroTextWrap}>
              <Text style={styles.readyChapterLabel}>CHAPTER 01</Text>
              <Text style={[styles.readyHeroLead, { fontSize: readyHeroTitleFontSize, lineHeight: readyHeroTitleLineHeight }]}>
                {effectiveReadyStoryLead}
              </Text>
              <Text style={[styles.readyHeroTone, { fontSize: readyHeroTitleFontSize, lineHeight: readyHeroTitleLineHeight }]}>
                {readyStoryTone}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.readySummarySection, { width: readySectionWidth }, readyCardsAnimatedStyle]}>
            <View style={styles.readySummaryTitleRow}>
              <View style={styles.readySummaryAccent} />
              <Text style={styles.readySummaryTitle}>体験の準備が整いました</Text>
            </View>
            <Text style={styles.readySummaryText}>{readyStorySynopsis}</Text>
            <View style={styles.readyGeneratedStoryCard}>
              <Text style={styles.readyGeneratedStoryLabel}>生成された物語名</Text>
              <Text style={styles.readyGeneratedStoryText}>
                {effectiveReadyStoryLead}
                {" "}
                {readyStoryTone}
              </Text>
              <Text style={styles.readyGeneratedStorySubtext}>{readyStoryTagline}</Text>
            </View>
            <View style={styles.readyChipRow}>
              {readyInputItems.map((item) => (
                <View key={item.id} style={styles.readyChip}>
                  <Ionicons name={item.icon} size={14} color={palette.tertiary} />
                  <Text style={styles.readyChipText}>{item.value}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.readyTimelineSection, { width: readySectionWidth }, readyCardsAnimatedStyle]}>
            <View style={styles.readySectionHeadingBlock}>
              <Text style={styles.readySectionHeading}>EXPLORATION PATH</Text>
            </View>
            <View style={styles.readyTimelineWrap}>
              <View style={styles.readyTimelineLine} />
              {spots.map((spot, index) => (
                <View
                  key={spot.id}
                  style={[
                    styles.readyTimelineItem,
                    index === spots.length - 1 ? styles.readyTimelineItemLast : null,
                  ]}
                >
                  <View style={[styles.readyTimelineDot, index === 0 ? styles.readyTimelineDotActive : null]} />
                  <View style={styles.readyTimelineCard}>
                    <Text style={styles.readyTimelineIndex}>{String(index + 1).padStart(2, "0")}</Text>
                    <Text style={styles.readyTimelineName}>{spot.name}</Text>
                    <Text style={styles.readyTimelineDesc}>{readySpotOverviewMap[spot.id]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.readyHintsSection, { width: readySectionWidth }, readyCardsAnimatedStyle]}>
            <Text style={styles.readySectionHeading}>HINTS FOR THE JOURNEY</Text>
            <View style={styles.readyHintGrid}>
              {readyTips.map((tip) => (
                <View key={tip.id} style={[styles.readyHintCard, { width: readyHintCardWidth }]}>
                  <Ionicons name={tip.icon} size={30} color={palette.tertiary} />
                  <Text style={styles.readyHintTitle}>{tip.title}</Text>
                  <Text style={styles.readyHintBody}>{tip.body}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.readyBottomBar,
            Platform.OS === "web" ? ({ position: "fixed", zIndex: 80 } as any) : null,
          ]}
          onLayout={({ nativeEvent }) => {
            const measuredHeight = Math.ceil(nativeEvent.layout.height);
            setReadyBottomBarHeight((prev) => (prev === measuredHeight ? prev : measuredHeight));
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.readyMainCtaButton,
              { width: Math.min(width - 32, 512) },
              (pressed || isReadyTransitioning) && styles.pressed,
              isReadyTransitioning ? styles.readyMainCtaButtonDisabled : null,
            ]}
            onPress={handleReadyStartPress}
            disabled={isReadyTransitioning}
          >
            <Text style={styles.readyMainCtaText}>
              {isReadyTransitioning ? "物語を開いています" : "物語を始める"}
            </Text>
            <Ionicons name="arrow-forward" size={22} color={palette.onDarkButton} />
          </Pressable>
        </View>

        {isReadyTransitioning ? (
          <Animated.View pointerEvents="auto" style={[styles.readyTransitionOverlay, readyTransitionOverlayAnimatedStyle]}>
            <Animated.View style={[styles.readyTransitionPanel, readyTransitionPanelAnimatedStyle]}>
              <Animated.View style={[styles.readyTransitionGlow, readyTransitionGlowAnimatedStyle]} />
              <View style={styles.readyTransitionIconWrap}>
                <Ionicons name="sparkles" size={26} color={palette.tertiaryContainer} />
              </View>
              <Text style={styles.readyTransitionTitle}>プロローグへ移動中</Text>
              <Text style={styles.readyTransitionBody}>物語の扉をひらいています</Text>
              <View style={styles.readyTransitionTrack}>
                <Animated.View style={[styles.readyTransitionFill, readyTransitionProgressAnimatedStyle]} />
              </View>
            </Animated.View>
          </Animated.View>
        ) : null}
      </SafeAreaView>
    );
  }

  if (screen === "prologue") {
    return (
      <SafeAreaView style={styles.prologueSafeArea}>
        <StatusBar style="light" />

        <View style={styles.prologueBackgroundWrap}>
          <Image source={{ uri: heroImage }} style={styles.prologueBackgroundImage} resizeMode="cover" />
          <View style={styles.prologueDarkOverlay} />
        </View>

        <View style={styles.prologueGrainOverlay} />
        <Pressable
          style={({ pressed }) => [styles.gameplayBackButton, pressed && styles.pressed]}
          onPress={() => setScreen("ready")}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.prologueContent}>
          <View style={styles.prologueBottomGradient} />

          <Animated.View style={[styles.prologueCenterStack, prologueContentAnimatedStyle]}>
            <Pressable style={styles.prologueNarrationPressArea} onPress={handlePrologueNarrationPress}>
              <View style={styles.prologueTextWrap}>
                <Text style={styles.prologueTypewriterText}>
                  {prologueNarrationChars.map((char, index) => {
                    if (char === "\n") {
                      return (
                        <Text key={`prologue-break-${index}`} style={styles.prologueTypewriterChar}>
                          {"\n"}
                        </Text>
                      );
                    }

                    return (
                      <Animated.Text
                        key={`prologue-char-${index}`}
                        style={[
                          styles.prologueTypewriterChar,
                          {
                            opacity: prologueTypingAnim.interpolate({
                              inputRange: [index - 0.72, index, index + 0.92],
                              outputRange: [0, 0.2, 1],
                              extrapolate: "clamp",
                            }),
                          },
                        ]}
                      >
                        {char}
                      </Animated.Text>
                    );
                  })}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.prologueCtaWrap, prologueCtaAnimatedStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.prologueCtaButton,
                !isPrologueTypingDone || isMapScenarioTransitioning ? styles.storyNarrationCtaDisabled : null,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                runFlowTransition({
                  title: "ルートを表示しています",
                  body: "最初のスポットへ向かいましょう",
                  toScreen: "map",
                })
              }
              disabled={!isPrologueTypingDone || isMapScenarioTransitioning}
            >
              <Text style={styles.prologueCtaText}>{effectivePrologueCtaText}</Text>
              <Ionicons name="arrow-forward" size={30} color="#2d3432" />
            </Pressable>
          </Animated.View>
        </View>

        {isReadyTransitioning ? (
          <Animated.View pointerEvents="none" style={[styles.readyTransitionOverlay, readyTransitionOverlayAnimatedStyle]}>
            <Animated.View style={[styles.readyTransitionPanel, readyTransitionPanelAnimatedStyle]}>
              <Animated.View style={[styles.readyTransitionGlow, readyTransitionGlowAnimatedStyle]} />
              <View style={styles.readyTransitionIconWrap}>
                <Ionicons name="sparkles" size={26} color={palette.tertiaryContainer} />
              </View>
              <Text style={styles.readyTransitionTitle}>プロローグへ移動中</Text>
              <Text style={styles.readyTransitionBody}>物語の扉をひらいています</Text>
              <View style={styles.readyTransitionTrack}>
                <Animated.View style={[styles.readyTransitionFill, readyTransitionProgressAnimatedStyle]} />
              </View>
            </Animated.View>
          </Animated.View>
        ) : null}

        {isMapScenarioTransitioning ? renderFlowTransitionOverlay() : null}
      </SafeAreaView>
    );
  }

  if (screen === "map") {
    return (
      <SafeAreaView style={styles.mapSafeArea}>
        <StatusBar style="dark" />

        <View style={styles.mapScreen}>
          <Pressable
            style={({ pressed }) => [styles.gameplayBackButton, pressed && styles.pressed]}
            onPress={() => setScreen("prologue")}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>

          {useMockMapBackground ? (
            <View style={styles.mapMockCanvas}>
              <View style={styles.mapMockToneA} />
              <View style={styles.mapMockToneB} />
              <View style={styles.mapMockToneC} />

              {mockMapProjection.wholeRouteDots.map((dot, index) => (
                <View
                  key={`whole-dot-${index}`}
                  style={[
                    styles.mapMockWholeRouteDot,
                    { left: `${dot.x * 100}%`, top: `${dot.y * 100}%` },
                  ]}
                />
              ))}
              {mockMapProjection.activeRouteDots.map((dot, index) => (
                <View
                  key={`active-dot-${index}`}
                  style={[
                    styles.mapMockActiveRouteDot,
                    { left: `${dot.x * 100}%`, top: `${dot.y * 100}%` },
                  ]}
                />
              ))}

              <View
                style={[
                  styles.mapMockCurrentAnchor,
                  {
                    left: `${mockMapProjection.currentPoint.x * 100}%`,
                    top: `${mockMapProjection.currentPoint.y * 100}%`,
                  },
                ]}
              >
                <View style={styles.mapCurrentPinMarker}>
                  <View style={styles.mapCurrentPinHalo} />
                  <View style={styles.mapCurrentPinOuter} />
                  <View style={styles.mapCurrentPinCore} />
                </View>
              </View>

              {mockMapProjection.spotPoints.map(({ spot, point }, index) => {
                const isActiveTarget = index === activeTargetIndex;
                const isStart = index === 0;
                const isGoal = index === spots.length - 1;
                const markerLabel = isStart ? "S" : isGoal ? "G" : `${index + 1}`;
                return (
                  <View
                    key={`mock-spot-${spot.id}`}
                    style={[
                      styles.mapMockSpotAnchor,
                      { left: `${point.x * 100}%`, top: `${point.y * 100}%` },
                    ]}
                  >
                    <View style={styles.mapSpotMarkerWrap}>
                      <View
                        style={[
                          styles.mapSpotPin,
                          isStart ? styles.mapSpotPinStart : isGoal ? styles.mapSpotPinGoal : styles.mapSpotPinMuted,
                          isActiveTarget ? styles.mapSpotPinActiveTargetRing : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.mapSpotPinText,
                            isStart || isGoal
                              ? styles.mapSpotPinTextRole
                              : isActiveTarget
                                ? styles.mapSpotPinTextActive
                                : styles.mapSpotPinTextMuted,
                          ]}
                        >
                          {markerLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : Platform.OS === "web" ? (
            <>
              {createElement("div", {
                ref: mapWebHostRef,
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                },
              })}
              {webMapError ? (
                <>
                  {createElement("iframe", {
                    src: webFallbackGoogleEmbedUrl,
                    loading: "eager",
                    allowFullScreen: true,
                    referrerPolicy: "no-referrer-when-downgrade",
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    },
                  })}
                  <View style={styles.mapWebFallback}>
                    <Text style={styles.mapWebFallbackText}>{webMapError}</Text>
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <MapView
              ref={mapRef}
              key={`map-${currentSpot.id}-${liveCurrentLocation?.latitude ?? "na"}-${liveCurrentLocation?.longitude ?? "na"}`}
              style={styles.mapCanvas}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={mapInitialRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={false}
              showsTraffic={false}
              showsScale={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Polyline
                coordinates={renderedWholeRouteCoordinates}
                strokeColor="rgba(143,153,159,0.68)"
                strokeWidth={3}
                lineDashPattern={[8, 8]}
              />
              <Polyline
                coordinates={renderedActiveRouteCoordinates}
                strokeColor="#f5ce53"
                strokeWidth={4}
              />

              <Marker coordinate={activeCurrentLocation} title="現在地">
                <View style={styles.mapCurrentPinMarker}>
                  <View style={styles.mapCurrentPinHalo} />
                  <View style={styles.mapCurrentPinOuter} />
                  <View style={styles.mapCurrentPinCore} />
                </View>
              </Marker>

              {spots.map((spot, index) => {
                const isActiveTarget = index === activeTargetIndex;
                const isStart = index === 0;
                const isGoal = index === spots.length - 1;
                const markerLabel = isStart ? "S" : isGoal ? "G" : `${index + 1}`;
                return (
                  <Marker
                    key={`spot-${spot.id}`}
                    coordinate={spot.coordinate}
                    title={`${isStart ? "START: " : isGoal ? "GOAL: " : ""}${spot.name}`}
                  >
                    <View style={styles.mapSpotMarkerWrap}>
                      <View
                        style={[
                          styles.mapSpotPin,
                          isStart ? styles.mapSpotPinStart : isGoal ? styles.mapSpotPinGoal : styles.mapSpotPinMuted,
                          isActiveTarget ? styles.mapSpotPinActiveTargetRing : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.mapSpotPinText,
                            isStart || isGoal
                              ? styles.mapSpotPinTextRole
                              : isActiveTarget
                                ? styles.mapSpotPinTextActive
                                : styles.mapSpotPinTextMuted,
                          ]}
                        >
                          {markerLabel}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          )}

          <View style={styles.mapBottomCardWrap}>
            <View style={styles.mapUtilityWrap}>
              <Pressable
                style={({ pressed }) => [styles.mapUtilityButton, pressed && styles.pressed]}
                onPress={handleLocatePress}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={palette.primary} />
                ) : (
                  <Ionicons name="locate-outline" size={21} color={palette.primary} />
                )}
              </Pressable>
            </View>

            <View style={styles.mapBottomCard}>
              <View style={styles.mapCardMain}>
                <View style={styles.mapCardHeaderRow}>
                  <Text style={styles.mapCardTitle}>{currentSpot.name}</Text>
                </View>

                <View style={styles.mapCardInfoRow}>
                  <Ionicons name="information-circle" size={22} color={palette.tertiaryContainer} />
                  <Text style={styles.mapCardInfoText}>
                    次の目的地に向かいましょう。{"\n"}
                    到着したら物語が始まります。
                  </Text>
                </View>
              </View>

              <View style={styles.mapCardCtaWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.mapCardEnabledCta,
                    (pressed || isMapScenarioTransitioning) && styles.pressed,
                    isMapScenarioTransitioning ? styles.mapCardEnabledCtaDisabled : null,
                  ]}
                  onPress={handleSpotArrivedPress}
                  disabled={isMapScenarioTransitioning}
                >
                  <Ionicons name="book-outline" size={18} color={palette.onBackground} />
                  <Text style={styles.mapCardEnabledCtaText}>
                    {isExperienceCompleted ? "最初のスポットから始める" : "このスポットに到着した"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {isMapScenarioTransitioning ? (
            renderFlowTransitionOverlay()
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "spotArrival") {
    return (
      <SafeAreaView style={styles.spotSafeArea}>
        <StatusBar style="light" />

        <View style={styles.spotScreen}>
          {cameraPermission?.granted ? (
            <CameraView style={styles.spotBackgroundImage} facing="back" />
          ) : (
            <Image source={{ uri: spotArrivalBgImage }} style={styles.spotBackgroundImage} resizeMode="cover" />
          )}
          <View style={styles.spotBackgroundOverlay} />

          <View style={styles.spotTopBar}>
            <Pressable
              style={({ pressed }) => [styles.spotCloseButton, pressed && styles.pressed]}
              onPress={() => setScreen("map")}
            >
              <Ionicons name="close" size={22} color={palette.primary} />
            </Pressable>
          </View>

          {!cameraPermission?.granted ? (
            <View style={styles.spotCameraHintWrap}>
              <Text style={styles.spotCameraHintText}>AR表示のためカメラの許可が必要です</Text>
            </View>
          ) : null}

          <View style={styles.spotMain}>
            <View style={styles.spotCharacterStage}>
              <Image source={spotArrivalCharacterImage} style={styles.spotCharacterImage} resizeMode="contain" />
            </View>

            <View style={styles.spotBottomSheet}>
              <View style={styles.spotSpeakerBadge}>
                <Text style={styles.spotSpeakerBadgeText}>案内役</Text>
              </View>

              <Pressable style={styles.spotScenarioPressArea} onPress={handleSpotScenarioTextPress}>
                <Text style={styles.spotScenarioText}>
                  {spotScenarioChars.slice(0, spotTypedCharCount).join("")}
                  {!isSpotTypingDone ? <Text style={styles.spotScenarioCursor}>|</Text> : null}
                </Text>
              </Pressable>

              <View style={styles.spotNextButtonWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.spotNextButton,
                    isMapScenarioTransitioning ? styles.mapCardEnabledCtaDisabled : null,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSpotScenarioNextPress}
                  accessibilityRole="button"
                  accessibilityLabel={spotNextButtonLabel}
                  disabled={isMapScenarioTransitioning}
                >
                  <Text style={styles.spotNextButtonText}>{spotNextButtonLabel}</Text>
                  <Ionicons name="arrow-forward" size={22} color={palette.onDarkButton} />
                </Pressable>
              </View>
            </View>
          </View>

          {isMapScenarioTransitioning ? renderFlowTransitionOverlay() : null}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "epilogue") {
    return (
      <SafeAreaView style={styles.prologueSafeArea}>
        <StatusBar style="light" />

        <View style={styles.prologueBackgroundWrap}>
          <Image source={{ uri: epilogueBgImage }} style={styles.prologueBackgroundImage} resizeMode="cover" />
          <View style={styles.prologueDarkOverlay} />
        </View>

        <View style={styles.prologueGrainOverlay} />
        <Pressable
          style={({ pressed }) => [styles.gameplayBackButton, pressed && styles.pressed]}
          onPress={() => setScreen("map")}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>

        <View style={styles.prologueContent}>
          <View style={styles.prologueBottomGradient} />

          <Animated.View style={[styles.prologueCenterStack, epilogueContentAnimatedStyle]}>
            <Pressable style={styles.prologueNarrationPressArea} onPress={handleEpilogueNarrationPress}>
              <View style={styles.prologueTextWrap}>
                <Text style={styles.prologueTypewriterText}>
                  {epilogueNarrationChars.map((char, index) => {
                    if (char === "\n") {
                      return (
                        <Text key={`epilogue-break-${index}`} style={styles.prologueTypewriterChar}>
                          {"\n"}
                        </Text>
                      );
                    }

                    return (
                      <Animated.Text
                        key={`epilogue-char-${index}`}
                        style={[
                          styles.prologueTypewriterChar,
                          {
                            opacity: epilogueTypingAnim.interpolate({
                              inputRange: [index - 0.72, index, index + 0.92],
                              outputRange: [0, 0.2, 1],
                              extrapolate: "clamp",
                            }),
                          },
                        ]}
                      >
                        {char}
                      </Animated.Text>
                    );
                  })}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.prologueCtaWrap, epilogueCtaAnimatedStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.prologueCtaButton,
                !isEpilogueTypingDone ? styles.storyNarrationCtaDisabled : null,
                pressed && styles.pressed,
              ]}
              onPress={() => setScreen("feedback")}
              disabled={!isEpilogueTypingDone}
            >
              <Text style={styles.prologueCtaText}>{effectiveEpilogueCtaText}</Text>
              <Ionicons name="arrow-forward" size={30} color="#2d3432" />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "feedback") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.feedbackTopBar}>
          <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.feedbackScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.feedbackMain, { width: contentWidth }]}>
            <View style={styles.feedbackHero}>
              <Text
                style={[
                  styles.feedbackHeroTitle,
                  {
                    fontSize: feedbackHeroTitleFontSize,
                    lineHeight: feedbackHeroTitleLineHeight,
                  },
                ]}
                numberOfLines={2}
              >
                体験を終えて{"\n"}どう感じましたか？
              </Text>
              <Text style={styles.feedbackHeroSubtitle}>
                最後に、今回の体験について教えてください。{"\n"}
                今後の改善に活かします。
              </Text>
            </View>

            <View style={styles.feedbackSectionStack}>

              {/* Q1: 全体満足度 */}
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackLabel}>体験全体の満足度を教えてください</Text>
                <View style={styles.feedbackStarRow}>
                  {fiveScale.map((value) => {
                    const selected = feedbackOverallRating !== null && value <= feedbackOverallRating;
                    return (
                      <Pressable
                        key={`overall-star-${value}`}
                        onPress={() => setFeedbackOverallRating(value)}
                        style={({ pressed }) => [styles.feedbackStarButton, pressed && styles.pressed]}
                      >
                        <Ionicons
                          name={selected ? "star" : "star-outline"}
                          size={44}
                          color={selected ? palette.tertiaryContainer : palette.surfaceHigh}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Q2・Q3: ユーザビリティ・場所への関心 */}
              <View style={styles.feedbackCard}>
                <View style={styles.feedbackScaleGroup}>
                  <Text style={styles.feedbackLabel}>体験の内容はわかりやすかったですか？</Text>
                  <View style={styles.feedbackScaleRow}>
                    {fiveScale.map((value) => {
                      const selected = value === feedbackGuidanceScore;
                      return (
                        <Pressable
                          key={`guidance-scale-${value}`}
                          onPress={() => setFeedbackGuidanceScore(value)}
                          style={({ pressed }) => [
                            styles.feedbackScaleButton,
                            selected ? styles.feedbackScaleButtonSelected : styles.feedbackScaleButtonIdle,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={selected ? styles.feedbackScaleButtonTextSelected : styles.feedbackScaleButtonTextIdle}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.feedbackScaleHintRow}>
                    <Text style={styles.feedbackScaleHint}>そう思わない</Text>
                    <Text style={styles.feedbackScaleHint}>非常にそう思う</Text>
                  </View>
                </View>

                <View style={styles.feedbackScaleGroup}>
                  <Text style={styles.feedbackLabel}>物語を通じて、伊都キャンパスへの興味が高まりましたか？</Text>
                  <View style={styles.feedbackScaleRow}>
                    {fiveScale.map((value) => {
                      const selected = value === feedbackCampusScore;
                      return (
                        <Pressable
                          key={`campus-scale-${value}`}
                          onPress={() => setFeedbackCampusScore(value)}
                          style={({ pressed }) => [
                            styles.feedbackScaleButton,
                            selected ? styles.feedbackScaleButtonSelected : styles.feedbackScaleButtonIdle,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={selected ? styles.feedbackScaleButtonTextSelected : styles.feedbackScaleButtonTextIdle}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.feedbackScaleHintRow}>
                    <Text style={styles.feedbackScaleHint}>そう思わない</Text>
                    <Text style={styles.feedbackScaleHint}>強くそう思う</Text>
                  </View>
                </View>
              </View>

              {/* Q4・Q5: 行動意図・期待確認 */}
              <View style={styles.feedbackCard}>
                <View style={styles.feedbackScaleGroup}>
                  <Text style={styles.feedbackLabel}>体験後、実際にこのスポットを訪れてみたいと思いますか？</Text>
                  <View style={styles.feedbackScaleRow}>
                    {fiveScale.map((value) => {
                      const selected = value === feedbackVisitIntentScore;
                      return (
                        <Pressable
                          key={`visit-scale-${value}`}
                          onPress={() => setFeedbackVisitIntentScore(value)}
                          style={({ pressed }) => [
                            styles.feedbackScaleButton,
                            selected ? styles.feedbackScaleButtonSelected : styles.feedbackScaleButtonIdle,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={selected ? styles.feedbackScaleButtonTextSelected : styles.feedbackScaleButtonTextIdle}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.feedbackScaleHintRow}>
                    <Text style={styles.feedbackScaleHint}>そう思わない</Text>
                    <Text style={styles.feedbackScaleHint}>強くそう思う</Text>
                  </View>
                </View>

                <View style={styles.feedbackScaleGroup}>
                  <Text style={styles.feedbackLabel}>この体験は、始める前の期待通りでしたか？</Text>
                  <View style={styles.feedbackScaleRow}>
                    {fiveScale.map((value) => {
                      const selected = value === feedbackExpectationScore;
                      return (
                        <Pressable
                          key={`expectation-scale-${value}`}
                          onPress={() => setFeedbackExpectationScore(value)}
                          style={({ pressed }) => [
                            styles.feedbackScaleButton,
                            selected ? styles.feedbackScaleButtonSelected : styles.feedbackScaleButtonIdle,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={selected ? styles.feedbackScaleButtonTextSelected : styles.feedbackScaleButtonTextIdle}>
                            {value}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.feedbackScaleHintRow}>
                    <Text style={styles.feedbackScaleHint}>期待を下回った</Text>
                    <Text style={styles.feedbackScaleHint}>期待を上回った</Text>
                  </View>
                </View>
              </View>

              {/* Q6: 継続利用意向 */}
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackLabel}>また体験したいと思いますか？</Text>
                <View style={styles.feedbackIntentRow}>
                  <Pressable
                    onPress={() => setFeedbackReuseIntent("again")}
                    style={({ pressed }) => [
                      styles.feedbackIntentChip,
                      feedbackReuseIntent === "again" ? styles.feedbackIntentChipSelected : styles.feedbackIntentChipIdle,
                      pressed && styles.pressed,
                    ]}
                  >
                    {feedbackReuseIntent === "again" ? <View style={styles.feedbackIntentDot} /> : null}
                    <Text style={feedbackReuseIntent === "again" ? styles.feedbackIntentChipTextSelected : styles.feedbackIntentChipTextIdle}>
                      ぜひ使いたい
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFeedbackReuseIntent("neutral")}
                    style={({ pressed }) => [
                      styles.feedbackIntentChip,
                      feedbackReuseIntent === "neutral" ? styles.feedbackIntentChipSelected : styles.feedbackIntentChipIdle,
                      pressed && styles.pressed,
                    ]}
                  >
                    {feedbackReuseIntent === "neutral" ? <View style={styles.feedbackIntentDot} /> : null}
                    <Text style={feedbackReuseIntent === "neutral" ? styles.feedbackIntentChipTextSelected : styles.feedbackIntentChipTextIdle}>
                      どちらでもない
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFeedbackReuseIntent("unlikely")}
                    style={({ pressed }) => [
                      styles.feedbackIntentChip,
                      feedbackReuseIntent === "unlikely" ? styles.feedbackIntentChipSelected : styles.feedbackIntentChipIdle,
                      pressed && styles.pressed,
                    ]}
                  >
                    {feedbackReuseIntent === "unlikely" ? <View style={styles.feedbackIntentDot} /> : null}
                    <Text style={feedbackReuseIntent === "unlikely" ? styles.feedbackIntentChipTextSelected : styles.feedbackIntentChipTextIdle}>
                      あまり思わない
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Q7: 自由意見 */}
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackLabel}>自由意見</Text>
                <Text style={styles.setupResearchNote}>※ 印象に残ったこと・改善してほしいこと・その他なんでも</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                  placeholder="体験してみての感想を自由に教えてください"
                  placeholderTextColor={palette.outlineVariant}
                  style={styles.feedbackTextInput}
                  textAlignVertical="top"
                />
              </View>

            </View>

            <View style={styles.feedbackSubmitWrap}>
              <Pressable
                style={({ pressed }) => [
                  styles.feedbackSubmitButton,
                  isSubmittingFeedback && styles.feedbackSubmitButtonDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={handleFeedbackSubmit}
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? (
                  <ActivityIndicator size="small" color={palette.onDarkButton} />
                ) : (
                  <Text style={styles.feedbackSubmitText}>送信して終了する</Text>
                )}
              </Pressable>
              <Text style={styles.feedbackThanks}>Thank you for your voice</Text>
            </View>
          </View>

          <View style={styles.feedbackFooter}>
            <View style={[styles.feedbackFooterInner, { width: contentWidth }]}>
              <Text style={styles.feedbackFooterCopy}>© 2026 TOMOSHIBI. All rights reserved.</Text>
              <View style={styles.feedbackFooterLinkRow}>
                <Pressable onPress={() => setShowPrivacyModal(true)}>
                  <Text style={styles.feedbackFooterLink}>Privacy</Text>
                </Pressable>
                <Pressable onPress={() => setShowTermsModal(true)}>
                  <Text style={styles.feedbackFooterLink}>Terms</Text>
                </Pressable>
                <Text style={styles.feedbackFooterLink}>Support</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "setup") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.setupTopBar}>
          <Pressable onPress={() => setScreen("landing")} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={palette.onBackground} />
          </Pressable>
          <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
          <View style={styles.setupTopSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.setupScrollContent,
            { paddingBottom: setupBottomBarHeight > 0 ? setupBottomBarHeight : 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.setupMain, { width: contentWidth }, setupHeroAnimatedStyle]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.64}
              style={[styles.setupTitle, { fontSize: setupTitleFontSize, lineHeight: setupTitleLineHeight }]}
            >
              体験の準備をしましょう
            </Text>
            <Text style={styles.setupSubtitle}>
              いくつか教えてください。あなたに合った流れで、伊都キャンパスの体験を始めます。
            </Text>
          </Animated.View>

          <Animated.View style={[styles.setupFormSection, { width: contentWidth }, setupCardsAnimatedStyle]}>
            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>あなたについて教えてください</Text>
              <View style={styles.userTypeSelectWrap}>
                <Pressable
                  onPress={() => setIsUserTypeMenuOpen((prev) => !prev)}
                  style={({ pressed }) => [styles.userTypeSelectField, pressed && styles.pressed]}
                >
                  <Text style={styles.userTypeSelectValue}>{selectedUserType}</Text>
                  <Ionicons
                    name={isUserTypeMenuOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={palette.onSurfaceVariant}
                  />
                </Pressable>

                {isUserTypeMenuOpen ? (
                  <View style={styles.userTypeSelectMenu}>
                    {userTypeOptions.map((option) => {
                      const selected = selectedUserType === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => {
                            setSelectedUserType(option);
                            setIsUserTypeMenuOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.userTypeSelectOption,
                            selected ? styles.userTypeSelectOptionSelected : null,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={selected ? styles.userTypeSelectOptionTextSelected : styles.userTypeSelectOptionText}>
                            {option}
                          </Text>
                          {selected ? <Ionicons name="checkmark" size={16} color={palette.onSecondaryContainer} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>伊都キャンパスはどれくらい慣れていますか？</Text>
              <View style={styles.stackButtons}>
                {familiarityOptions.map((option) => {
                  const selected = selectedFamiliarity === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelectedFamiliarity(option)}
                      style={({ pressed }) => [
                        styles.familiarityButton,
                        selected ? styles.familiaritySelected : styles.familiarityIdle,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={selected ? styles.familiarityTextSelected : styles.familiarityTextIdle}>{option}</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={selected ? palette.onSecondaryContainer : palette.secondaryContainer}
                        style={{ opacity: selected ? 1 : 0.25 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>新しい場所に来たとき、どうしますか？</Text>
              <Text style={styles.setupResearchNote}>※ 研究データとして活用します</Text>
              <View style={styles.stackButtons}>
                {explorationStyleOptions.map((option) => {
                  const selected = selectedExplorationStyle === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelectedExplorationStyle(option)}
                      style={({ pressed }) => [
                        styles.familiarityButton,
                        selected ? styles.familiaritySelected : styles.familiarityIdle,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={selected ? styles.familiarityTextSelected : styles.familiarityTextIdle}>{option}</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={selected ? palette.onSecondaryContainer : palette.secondaryContainer}
                        style={{ opacity: selected ? 1 : 0.25 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>この体験に何を期待しますか？</Text>
              <Text style={styles.setupResearchNote}>※ 研究データとして活用します</Text>
              <View style={styles.stackButtons}>
                {experienceExpectationOptions.map((option) => {
                  const selected = selectedExperienceExpectation === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelectedExperienceExpectation(option)}
                      style={({ pressed }) => [
                        styles.familiarityButton,
                        selected ? styles.familiaritySelected : styles.familiarityIdle,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={selected ? styles.familiarityTextSelected : styles.familiarityTextIdle}>{option}</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={selected ? palette.onSecondaryContainer : palette.secondaryContainer}
                        style={{ opacity: selected ? 1 : 0.25 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>どれくらいで回りたいですか？</Text>
              <View style={styles.durationScaleTextRow}>
                <Text style={styles.durationHint}>短い時間</Text>
                <Text style={styles.durationHint}>じっくり</Text>
              </View>
              <View style={styles.durationRow}>
                {durationOptions.map((option) => {
                  const selected = selectedDuration === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelectedDuration(option)}
                      style={({ pressed }) => [
                        styles.durationButton,
                        selected ? styles.durationSelected : styles.durationIdle,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={selected ? styles.durationTextSelected : styles.durationTextIdle}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.setupBottomBar,
            Platform.OS === "web" ? ({ position: "fixed", zIndex: 70 } as any) : null,
          ]}
          onLayout={({ nativeEvent }) => {
            const measuredHeight = Math.ceil(nativeEvent.layout.height);
            setSetupBottomBarHeight((prev) => (prev === measuredHeight ? prev : measuredHeight));
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              { width: contentWidth },
              pressed && styles.pressed,
            ]}
            onPress={handleSetupCreateExperiencePress}
          >
            <Text style={styles.startButtonText}>体験をつくる</Text>
            <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* プライバシーポリシー モーダル */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>プライバシーポリシー</Text>
            <Pressable onPress={() => setShowPrivacyModal(false)} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={24} color={palette.onBackground} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>1. はじめに</Text>
            <Text style={styles.modalBody}>本サービス「TOMOSHIBI」（以下「本サービス」）は、九州大学の学生が卒業研究の一環として開発・運営する実証実験アプリです。本ポリシーは、本サービスの利用を通じて収集する情報の取り扱いについて説明します。</Text>

            <Text style={styles.modalSectionTitle}>2. 収集する情報</Text>
            <Text style={styles.modalBody}>本サービスでは以下の情報を収集します。{"\n\n"}・あなたの立場（新入生・在学生など）{"\n"}・伊都キャンパスへの慣れ具合{"\n"}・探索スタイルの傾向{"\n"}・本体験への期待{"\n"}・希望する体験時間{"\n"}・体験後のフィードバック（評価・コメント）{"\n"}・匿名ユーザーID（自動生成）{"\n\n"}氏名・メールアドレス・電話番号・位置情報など、個人を特定できる情報は一切収集しません。</Text>

            <Text style={styles.modalSectionTitle}>3. 利用目的</Text>
            <Text style={styles.modalBody}>収集した情報は以下の目的にのみ使用します。{"\n\n"}・卒業論文・研究発表における統計的分析{"\n"}・本サービスおよび将来的なプロダクトの改善{"\n\n"}個人を特定する形での公表は行いません。</Text>

            <Text style={styles.modalSectionTitle}>4. データの管理</Text>
            <Text style={styles.modalBody}>収集したデータは Google LLC が提供する Firebase（Firestore）に保管されます。データは暗号化されて管理され、不正アクセスへの対策が講じられています。</Text>

            <Text style={styles.modalSectionTitle}>5. 第三者への提供</Text>
            <Text style={styles.modalBody}>収集した情報を、研究目的以外で第三者に提供・販売することはありません。研究論文での公表は統計的な形式に限り、個人の回答を特定できる形では行いません。</Text>

            <Text style={styles.modalSectionTitle}>6. データの保持期間</Text>
            <Text style={styles.modalBody}>収集したデータは、実証実験終了後 1 年間保持した後、適切に削除します。</Text>

            <Text style={styles.modalSectionTitle}>7. 匿名性について</Text>
            <Text style={styles.modalBody}>本サービスは Firebase の匿名認証を使用しています。アカウント登録や個人情報の入力は不要で、ユーザーはランダムに生成された匿名IDで管理されます。</Text>

            <Text style={styles.modalSectionTitle}>8. ポリシーの変更</Text>
            <Text style={styles.modalBody}>本ポリシーは予告なく変更されることがあります。変更後のポリシーは本アプリ内に掲載した時点で効力を生じます。</Text>

            <Text style={styles.modalUpdated}>最終更新日：2026年4月</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 利用規約 モーダル */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>利用規約</Text>
            <Pressable onPress={() => setShowTermsModal(false)} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={24} color={palette.onBackground} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>1. 本サービスについて</Text>
            <Text style={styles.modalBody}>本サービス「TOMOSHIBI」は、九州大学 伊都キャンパスを舞台に、物語体験を通じてキャンパスを紹介する実証実験アプリです。本サービスは卒業研究を兼ねた研究目的で運営されています。</Text>

            <Text style={styles.modalSectionTitle}>2. 参加への同意</Text>
            <Text style={styles.modalBody}>本サービスの利用は任意です。体験を開始することで、以下の事項に同意したものとみなします。{"\n\n"}・収集したデータが卒業論文・研究発表に統計的に利用されること{"\n"}・匿名の状態でデータが保管・分析されること{"\n"}・参加はいつでも中止できること</Text>

            <Text style={styles.modalSectionTitle}>3. 利用条件</Text>
            <Text style={styles.modalBody}>本サービスは九州大学 伊都キャンパスでの実証実験を目的として提供されます。本来の目的の範囲内でご利用ください。</Text>

            <Text style={styles.modalSectionTitle}>4. 禁止事項</Text>
            <Text style={styles.modalBody}>以下の行為を禁止します。{"\n\n"}・虚偽の情報を意図的に入力すること{"\n"}・本サービスへの不正アクセスや改ざん{"\n"}・商業目的での利用{"\n"}・他の利用者の体験を妨害する行為</Text>

            <Text style={styles.modalSectionTitle}>5. 知的財産権</Text>
            <Text style={styles.modalBody}>本サービスのコンテンツ（テキスト・デザイン・物語など）に関する知的財産権は運営者に帰属します。無断での複製・転用を禁じます。</Text>

            <Text style={styles.modalSectionTitle}>6. 免責事項</Text>
            <Text style={styles.modalBody}>本サービスは実証実験版であり、予告なく内容の変更・機能の追加または削除・サービスの一時停止・終了を行う場合があります。これにより生じた損害について、運営者は責任を負いません。</Text>

            <Text style={styles.modalSectionTitle}>7. 準拠法</Text>
            <Text style={styles.modalBody}>本規約は日本法に準拠し、解釈されます。</Text>

            <Text style={styles.modalUpdated}>最終更新日：2026年4月</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <StatusBar style="dark" />
      <View style={styles.landingAmbientLayer} pointerEvents="none">
        <View style={styles.landingAmbientOrbPrimary} />
        <View style={styles.landingAmbientOrbSecondary} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: landingBottomBarHeight > 0 ? landingBottomBarHeight + 16 : 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { width: contentWidth }]}>
          <View style={styles.brandRow}>
            <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
          </View>
        </View>

        <Animated.View style={[styles.main, { width: contentWidth }, landingHeroAnimatedStyle]}>
          <View style={[styles.heroWrap, { height: heroHeight }]}>
            <Image source={landingHeroImage} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroTopTag}>
              <Ionicons name="walk-outline" size={15} color="#fdfdfd" />
              <Text style={styles.heroTopTagText}>伊都キャンパス探索ナビ</Text>
            </View>
            <View style={styles.heroBottomPanel}>
              <Text style={styles.heroBottomTitle}>九大を、物語で知る。</Text>
              <Text style={styles.heroBottomBody}>その場で体感する、伊都キャンパス紹介体験</Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>九州大学 伊都キャンパス ｜ 実証実験</Text>
            <View style={styles.heroTitleBlock}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                style={[
                  styles.heroTitle,
                  { fontSize: landingHeroTitleFontSize, lineHeight: landingHeroTitleLineHeight },
                ]}
              >
                はじめての伊都を、
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                style={[
                  styles.heroTitle,
                  { fontSize: landingHeroTitleFontSize, lineHeight: landingHeroTitleLineHeight },
                ]}
              >
                物語で知る
              </Text>
            </View>
            <Text style={styles.heroBody}>
              これは九大伊都キャンパスを舞台にした実証実験です。移動は不要 — その場にいながら、物語を通じて伊都キャンパスの各スポットを体験できます。
            </Text>
          </View>

          <View style={styles.startArea}>
          </View>
        </Animated.View>

        <Animated.View style={[styles.landingJourneySection, { width: contentWidth }, landingCardsAnimatedStyle]}>
          <View style={styles.landingSectionHeader}>
            <Text style={styles.landingSectionTitle}>体験の流れ</Text>
            <Text style={styles.landingSectionCaption}>移動なしで進める、3ステップの物語体験</Text>
          </View>

          <View style={styles.journeyStack}>
            {journeySteps.map((step) => (
              <View key={step.id} style={styles.journeyCard}>
                <View style={styles.journeyCardHead}>
                  <Text style={styles.journeyBadge}>{step.badge}</Text>
                  <View style={styles.journeyIconWrap}>
                    <Ionicons name={step.icon} size={18} color="#455363" />
                  </View>
                </View>
                <Text style={styles.journeyTitle}>{step.title}</Text>
                <Text style={styles.journeyBody}>{step.body}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.features, { width: contentWidth }, landingCardsAnimatedStyle]}>
          <View style={styles.landingSectionHeader}>
            <Text style={styles.landingSectionTitle}>この体験でできること</Text>
            <Text style={styles.landingSectionCaption}>歩くだけで終わらない、九大の楽しみ方</Text>
          </View>

          <View style={styles.featureStack}>
            {featureCards.map((card) => (
              <View key={card.id} style={styles.featureCard}>
                <View style={[styles.featureIconCircle, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={22} color={card.iconColor} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{card.title}</Text>
                  <Text style={styles.featureBody}>{card.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footerWrap}>
          <View style={[styles.footerInner, { width: contentWidth }]}>
            <View style={styles.footerLinks}>
              <Pressable onPress={() => setShowPrivacyModal(true)} style={({ pressed }) => [styles.footerLinkPressable, pressed && styles.pressed]}>
                <Text style={styles.footerLink}>Privacy</Text>
              </Pressable>
              <Pressable onPress={() => setShowTermsModal(true)} style={({ pressed }) => [styles.footerLinkPressable, pressed && styles.pressed]}>
                <Text style={styles.footerLink}>Terms</Text>
              </Pressable>
            </View>
            <Text style={styles.footerCopy}>© 2026 TOMOSHIBI.</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.landingBottomBar,
          Platform.OS === "web" ? ({ position: "fixed", zIndex: 70 } as any) : null,
        ]}
        onLayout={({ nativeEvent }) => {
          const measuredHeight = Math.ceil(nativeEvent.layout.height);
          setLandingBottomBarHeight((prev) => (prev === measuredHeight ? prev : measuredHeight));
        }}
      >
        <Pressable
          style={({ pressed }) => [styles.startButton, { width: contentWidth }, pressed && styles.pressed]}
          onPress={() => setScreen("setup")}
        >
          <Text style={styles.startButtonText}>冒険をはじめる</Text>
          <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
    backgroundColor: palette.background,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 44,
    position: "relative",
  },
  landingAmbientLayer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  landingAmbientOrbPrimary: {
    position: "absolute",
    top: -120,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(93,94,99,0.09)",
  },
  landingAmbientOrbSecondary: {
    position: "absolute",
    top: 170,
    left: -130,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(245,206,83,0.12)",
  },
  header: {
    paddingTop: 14,
    paddingBottom: 20,
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: palette.onBackground,
  },
  brandLogo: {
    height: 26,
    width: 130,
  },
  main: {
    paddingHorizontal: 0,
    marginBottom: 18,
  },
  heroWrap: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === "web" ? ({ objectPosition: "center bottom" } as object) : {}),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,10,14,0.24)",
  },
  heroTopTag: {
    position: "absolute",
    top: 18,
    left: 18,
    borderRadius: 999,
    backgroundColor: "rgba(8,10,14,0.48)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  heroTopTagText: {
    color: "#fdfdfd",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroBottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "rgba(8,10,14,0.48)",
  },
  heroBottomTitle: {
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroBottomBody: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  heroContent: {
    marginBottom: 18,
    gap: 12,
  },
  heroEyebrow: {
    color: "#455363",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  heroTitleBlock: {
    gap: 2,
  },
  heroTitle: {
    fontWeight: "800",
    letterSpacing: -0.7,
    color: palette.onBackground,
    maxWidth: "100%",
  },
  heroBody: {
    fontSize: 17,
    lineHeight: 29,
    color: palette.onSurfaceVariant,
    fontWeight: "500",
  },
  conditions: {
    gap: 10,
    marginBottom: 18,
  },
  pill: {
    borderRadius: 999,
    backgroundColor: palette.surfaceLow,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pillText: {
    fontSize: 14,
    color: palette.onSurfaceVariant,
    fontWeight: "500",
    flexShrink: 1,
  },
  startArea: {
    marginBottom: 18,
  },
  landingBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: "rgba(249,249,247,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(173,179,176,0.25)",
    alignItems: "center",
  },
  startButton: {
    borderRadius: 22,
    backgroundColor: palette.darkButton,
    minHeight: 74,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    shadowColor: "#1a1c20",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonLabelGroup: {
    gap: 4,
  },
  startButtonText: {
    color: palette.onDarkButton,
    fontSize: 21,
    fontWeight: "800",
  },
  startButtonCaption: {
    color: "rgba(247,247,253,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  landingOutlineToggle: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  landingOutlineToggleText: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "600",
  },
  landingJourneySection: {
    marginBottom: 22,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.28)",
  },
  landingSectionHeader: {
    marginBottom: 12,
    gap: 4,
  },
  landingSectionTitle: {
    color: palette.onBackground,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  landingSectionCaption: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  journeyStack: {
    gap: 10,
  },
  journeyCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.22)",
    gap: 8,
  },
  journeyCardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  journeyBadge: {
    color: "#465163",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  journeyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(214,228,247,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  journeyTitle: {
    color: palette.onBackground,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  journeyBody: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  landingCollapsedHint: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(242,244,242,0.55)",
  },
  landingCollapsedHintText: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "600",
  },
  features: {
    marginBottom: 22,
  },
  featureStack: {
    gap: 14,
  },
  featureCard: {
    borderRadius: 24,
    backgroundColor: palette.surfaceLowest,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureTextWrap: {
    gap: 8,
  },
  featureTitle: {
    color: palette.onBackground,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  featureBody: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 22,
  },
  landingPilotPanel: {
    borderRadius: 24,
    backgroundColor: "rgba(214,228,247,0.54)",
    borderWidth: 1,
    borderColor: "rgba(69,83,99,0.18)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 28,
  },
  landingPilotPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  landingPilotPanelTitle: {
    color: "#33414f",
    fontSize: 16,
    fontWeight: "700",
  },
  landingPilotMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  landingPilotMetricCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 68,
    borderWidth: 1,
    borderColor: "rgba(69,83,99,0.14)",
  },
  landingPilotMetricValue: {
    color: "#33414f",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 2,
    textAlign: "center",
  },
  landingPilotMetricLabel: {
    color: "#5a605e",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  footerWrap: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(173,179,176,0.3)",
    paddingTop: 26,
    paddingBottom: 10,
    alignItems: "center",
  },
  footerInner: {
    alignItems: "center",
    gap: 14,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  footerLinkPressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  footerLink: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  footerCopy: {
    color: "#767c79",
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "500",
  },

  setupTopBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 68,
    zIndex: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(249,249,247,0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  setupBrandStack: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  setupBrand: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: palette.primary,
  },
  setupHeaderBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(214,228,247,0.7)",
    borderWidth: 1,
    borderColor: "rgba(69,83,99,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  setupHeaderBadgeText: {
    color: "#465163",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  setupTopSpacer: {
    width: 40,
    height: 40,
  },
  setupScrollContent: {
    alignItems: "center",
    paddingTop: 98,
  },
  setupMain: {
    paddingHorizontal: 0,
    marginBottom: 22,
    gap: 12,
  },
  setupHeroSection: {
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.24)",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  setupProgressHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  setupProgressTag: {
    color: "#465163",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  setupProgressMeta: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "600",
  },
  setupProgressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(173,179,176,0.34)",
    overflow: "hidden",
    marginBottom: 12,
  },
  setupProgressFill: {
    width: "36%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#536070",
  },
  setupTitle: {
    fontWeight: "800",
    letterSpacing: -0.8,
    color: palette.onBackground,
    maxWidth: "100%",
  },
  setupSubtitle: {
    fontSize: 18,
    lineHeight: 31,
    color: palette.secondaryText,
    fontWeight: "500",
    opacity: 0.92,
  },
  setupFormSection: {
    gap: 34,
    marginBottom: 20,
  },
  setupBlock: {
    gap: 12,
  },
  setupLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  setupLabel: {
    fontSize: 13,
    letterSpacing: 0.8,
    color: palette.onSurfaceVariant,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  setupResearchNote: {
    fontSize: 11,
    color: palette.onSurfaceVariant,
    marginTop: -6,
    marginBottom: 8,
    opacity: 0.7,
  },
  userTypeSelectWrap: {
    gap: 8,
  },
  userTypeSelectField: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: palette.surfaceLowest,
    borderColor: "rgba(173,179,176,0.24)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userTypeSelectValue: {
    color: palette.onBackground,
    fontSize: 15,
    fontWeight: "600",
  },
  userTypeSelectMenu: {
    gap: 8,
  },
  userTypeSelectOption: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.24)",
    backgroundColor: palette.surfaceLow,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userTypeSelectOptionSelected: {
    backgroundColor: palette.secondaryContainer,
    borderColor: "rgba(69,83,99,0.3)",
  },
  userTypeSelectOptionText: {
    color: palette.onBackground,
    fontSize: 14,
    fontWeight: "500",
  },
  userTypeSelectOptionTextSelected: {
    color: palette.onSecondaryContainer,
    fontSize: 14,
    fontWeight: "700",
  },
  stackButtons: {
    gap: 10,
  },
  familiarityButton: {
    borderRadius: 20,
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  familiaritySelected: {
    backgroundColor: palette.secondaryContainer,
    borderColor: "rgba(69,83,99,0.3)",
  },
  familiarityIdle: {
    backgroundColor: palette.surfaceLowest,
    borderColor: "rgba(173,179,176,0.24)",
  },
  familiarityTextSelected: {
    color: palette.onSecondaryContainer,
    fontSize: 14,
    fontWeight: "700",
  },
  familiarityTextIdle: {
    color: palette.onBackground,
    fontSize: 14,
    fontWeight: "500",
  },
  durationScaleTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  durationHint: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "500",
  },
  durationRow: {
    flexDirection: "row",
    gap: 10,
  },
  durationButton: {
    flex: 1,
    borderRadius: 20,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  durationSelected: {
    backgroundColor: palette.secondaryContainer,
    borderColor: "rgba(69,83,99,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  durationIdle: {
    backgroundColor: palette.surfaceLow,
    borderColor: "rgba(173,179,176,0.22)",
  },
  durationTextSelected: {
    color: palette.onSecondaryContainer,
    fontSize: 14,
    fontWeight: "700",
  },
  durationTextIdle: {
    color: palette.onBackground,
    fontSize: 14,
    fontWeight: "500",
  },
  setupBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 26,
    backgroundColor: "rgba(249,249,247,0.96)",
    alignItems: "center",
  },
  preparingTopBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 64,
    zIndex: 40,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249,249,247,0.85)",
  },
  preparingTopSpacer: {
    flex: 1,
    minHeight: 34,
  },
  preparingBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  preparingBrand: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#1a1c20",
    textTransform: "uppercase",
  },
  preparingSkipButton: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(90,96,94,0.25)",
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 92,
  },
  preparingSkipButtonText: {
    color: "#3e4846",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  preparingMain: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 60,
    position: "relative",
  },
  preparingLoaderContainer: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 42,
  },
  preparingGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(245,206,83,0.26)",
    pointerEvents: "none",
  },
  preparingLoaderWrap: {
    width: 192,
    height: 192,
    alignItems: "center",
    justifyContent: "center",
  },
  preparingCircleOuter: {
    position: "absolute",
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 1,
    borderColor: "rgba(83,96,112,0.13)",
  },
  preparingCircleInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(83,96,112,0.07)",
  },
  preparingCenterWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  preparingCoreDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245,206,83,0.18)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "rgba(245,206,83,0.9)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 6,
  },
  preparingCoreDotRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(245,206,83,0.72)",
  },
  preparingCoreDotIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: 1 }],
  },
  preparingCoreDotIcon: {
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 21,
  },
  preparingBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 34,
  },
  preparingBar: {
    width: 2,
    borderRadius: 999,
    backgroundColor: "rgba(83,96,112,0.32)",
  },
  preparingBarShort: {
    height: 16,
  },
  preparingBarTall: {
    height: 32,
    backgroundColor: "rgba(83,96,112,0.48)",
  },
  preparingBarMid: {
    height: 24,
  },
  preparingTextSection: {
    alignItems: "center",
    marginBottom: 34,
  },
  preparingTitle: {
    fontWeight: "700",
    color: palette.onBackground,
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  preparingBody: {
    fontSize: 14,
    lineHeight: 27,
    color: palette.onSurfaceVariant,
    textAlign: "center",
  },
  preparingStatusWrap: {
    gap: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDoneText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.onBackground,
    fontWeight: "500",
  },
  statusInProgressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(83,96,112,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusInProgressCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475464",
  },
  statusProgressText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.onBackground,
    fontWeight: "700",
  },
  statusPendingRow: {
    opacity: 0.4,
  },
  statusPendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  statusPendingText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.onSurfaceVariant,
    fontWeight: "500",
  },
  progressTrack: {
    marginTop: 12,
    height: 2,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#dee4e0",
  },
  progressFill: {
    width: "66.666%",
    height: "100%",
    backgroundColor: "#475464",
  },
  preparingFooter: {
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: "center",
    gap: 12,
  },
  preparingFooterText: {
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: "rgba(90,96,94,0.65)",
    fontWeight: "500",
  },
  readyTopBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 90,
    height: 80,
    paddingHorizontal: 32,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  readyTopInner: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  readyBrand: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#ffffff",
  },
  readyScrollContent: {
    alignItems: "center",
    paddingTop: 0,
  },
  readyHeroSection: {
    width: "100%",
    height: 530,
    overflow: "hidden",
    marginBottom: 44,
    backgroundColor: "transparent",
  },
  readyHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  readyHeroUniformShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  readyHeroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  readyHeroBottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%",
    backgroundColor: "transparent",
  },
  readyHeroTextWrap: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 62,
    gap: 6,
  },
  readyChapterLabel: {
    color: palette.tertiaryContainer,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 6,
  },
  readyHeroLead: {
    color: "#ffffff",
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  readyHeroTone: {
    color: palette.tertiaryContainer,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  readySummarySection: {
    marginBottom: 52,
    gap: 18,
  },
  readySummaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  readySummaryAccent: {
    width: 6,
    height: 34,
    borderRadius: 999,
    backgroundColor: palette.tertiary,
  },
  readySummaryTitle: {
    color: palette.onBackground,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  readySummaryText: {
    color: palette.onSurfaceVariant,
    fontSize: 18,
    lineHeight: 32,
    fontWeight: "400",
  },
  readyGeneratedStoryCard: {
    borderRadius: 16,
    backgroundColor: palette.surfaceLowest,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  readyGeneratedStoryLabel: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  readyGeneratedStoryText: {
    color: palette.onBackground,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  readyGeneratedStorySubtext: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "500",
  },
  readyChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  readyChip: {
    borderRadius: 999,
    backgroundColor: "rgba(229,233,230,0.7)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.16)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readyChipText: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  readyTimelineSection: {
    marginBottom: 52,
  },
  readySectionHeadingBlock: {
    paddingBottom: 14,
    marginBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceHigh,
  },
  readySectionHeading: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3.3,
    textTransform: "uppercase",
  },
  readyTimelineWrap: {
    position: "relative",
    paddingLeft: 64,
  },
  readyTimelineLine: {
    position: "absolute",
    left: 22,
    top: 12,
    bottom: 16,
    width: 2,
    backgroundColor: "rgba(173,179,176,0.34)",
  },
  readyTimelineItem: {
    position: "relative",
    paddingBottom: 18,
  },
  readyTimelineItemLast: {
    paddingBottom: 0,
  },
  readyTimelineDot: {
    position: "absolute",
    left: -47,
    top: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dee4e0",
    borderWidth: 4,
    borderColor: "rgba(236,239,236,0.92)",
  },
  readyTimelineDotActive: {
    backgroundColor: palette.tertiary,
  },
  readyTimelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.12)",
    backgroundColor: palette.surfaceLowest,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  readyTimelineIndex: {
    color: palette.tertiary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.9,
    marginBottom: 6,
  },
  readyTimelineName: {
    color: palette.onBackground,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  readyTimelineDesc: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
  },
  readyHintsSection: {
    marginBottom: 44,
  },
  readyHintGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  readyHintCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.15)",
    backgroundColor: palette.surfaceLow,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "flex-start",
    gap: 12,
  },
  readyHintTitle: {
    color: palette.onBackground,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  readyHintBody: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "400",
  },
  readyBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    zIndex: 80,
  },
  readyMainCtaButton: {
    minHeight: 76,
    borderRadius: 999,
    backgroundColor: palette.darkButton,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    shadowColor: "#745c00",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 9,
  },
  readyMainCtaText: {
    color: palette.onDarkButton,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  readyMainCtaButtonDisabled: {
    opacity: 0.9,
  },
  readyTransitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    backgroundColor: "rgba(0,0,0,0.86)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  readyTransitionPanel: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(17,18,20,0.74)",
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  readyTransitionGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(245,206,83,0.22)",
    top: -70,
  },
  readyTransitionIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(245,206,83,0.16)",
    borderWidth: 1,
    borderColor: "rgba(245,206,83,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  readyTransitionTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  readyTransitionBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  readyTransitionTrack: {
    width: "100%",
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  readyTransitionFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.tertiaryContainer,
  },
  feedbackTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 78,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249,249,247,0.85)",
  },
  feedbackTopBrand: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#1A1C20",
  },
  feedbackScrollContent: {
    alignItems: "center",
    paddingTop: 104,
    paddingBottom: 0,
  },
  feedbackMain: {
    alignItems: "stretch",
    paddingBottom: 52,
  },
  feedbackHero: {
    alignItems: "center",
    marginBottom: 28,
  },
  feedbackHeroTitle: {
    color: palette.onBackground,
    fontSize: 36,
    lineHeight: 46,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  feedbackHeroSubtitle: {
    color: palette.onSurfaceVariant,
    fontSize: 17,
    lineHeight: 30,
    textAlign: "center",
  },
  feedbackSectionStack: {
    gap: 18,
  },
  feedbackCard: {
    backgroundColor: palette.surfaceLowest,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.onSurfaceVariant,
    marginBottom: 16,
  },
  feedbackStarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackStarButton: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackScaleGroup: {
    marginBottom: 24,
  },
  feedbackScaleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackScaleButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  feedbackScaleButtonSelected: {
    backgroundColor: palette.secondaryContainer,
    borderColor: palette.secondaryContainer,
  },
  feedbackScaleButtonIdle: {
    backgroundColor: palette.surfaceLow,
    borderColor: "transparent",
  },
  feedbackScaleButtonTextSelected: {
    color: palette.onSecondaryContainer,
    fontWeight: "700",
    fontSize: 15,
  },
  feedbackScaleButtonTextIdle: {
    color: palette.onBackground,
    fontWeight: "500",
    fontSize: 15,
  },
  feedbackScaleHintRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackScaleHint: {
    color: palette.outlineVariant,
    fontSize: 11,
    fontWeight: "600",
  },
  feedbackIntentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  feedbackIntentChip: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackIntentChipSelected: {
    backgroundColor: palette.secondaryContainer,
  },
  feedbackIntentChipIdle: {
    backgroundColor: palette.surfaceHigh,
  },
  feedbackIntentDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: palette.tertiaryContainer,
  },
  feedbackIntentChipTextSelected: {
    color: palette.onSecondaryContainer,
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackIntentChipTextIdle: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    fontWeight: "500",
  },
  feedbackTextInput: {
    minHeight: 96,
    borderBottomWidth: 2,
    borderBottomColor: "#dee4e0",
    color: palette.onBackground,
    fontSize: 15,
    lineHeight: 24,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
  feedbackSubmitWrap: {
    marginTop: 32,
    alignItems: "center",
  },
  feedbackSubmitButton: {
    width: "100%",
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(93,94,99,0.35)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  feedbackSubmitButtonDisabled: {
    opacity: 0.8,
  },
  feedbackSubmitText: {
    color: palette.onDarkButton,
    fontSize: 20,
    fontWeight: "700",
  },
  feedbackThanks: {
    marginTop: 18,
    color: palette.outlineVariant,
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 2.3,
    textTransform: "uppercase",
  },
  feedbackFooter: {
    width: "100%",
    backgroundColor: "#F2F4F2",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  feedbackFooterInner: {
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
  },
  feedbackFooterCopy: {
    color: "#5D5E63",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.3,
    textAlign: "center",
  },
  feedbackFooterLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  feedbackFooterLink: {
    color: "#5D5E63",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  prologueSafeArea: {
    flex: 1,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  prologueBackgroundWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  prologueBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  prologueDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  prologueGrainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
    pointerEvents: "none",
  },
  prologueContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  gameplayBackButton: {
    position: "absolute",
    top: 22,
    left: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  prologueBottomGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
    pointerEvents: "none",
  },
  prologueCenterStack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  prologueBottomPanel: {
    width: "100%",
    paddingTop: 80,
    paddingHorizontal: 22,
    paddingBottom: 34,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  prologueTextWrap: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    justifyContent: "center",
  },
  prologueNarrationPressArea: {
    width: "100%",
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  prologueTypewriterText: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 34,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.18,
  },
  prologueTypewriterChar: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 34,
    fontWeight: "400",
    letterSpacing: 0.18,
  },
  prologueCtaWrap: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 34,
    alignItems: "center",
  },
  prologueCtaButton: {
    width: "100%",
    minHeight: 84,
    borderRadius: 42,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  prologueCtaText: {
    color: "#2d3432",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  storyNarrationCtaDisabled: {
    opacity: 0.5,
  },
  mapSafeArea: {
    flex: 1,
    backgroundColor: "#f2f4f2",
    overflow: "hidden",
  },
  mapScreen: {
    flex: 1,
    backgroundColor: "#f2f4f2",
    position: "relative",
    overflow: "hidden",
  },
  mapBackButton: {
    position: "absolute",
    top: 18,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMockCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#eef2ef",
    overflow: "hidden",
  },
  mapMockToneA: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(220,228,224,0.86)",
    top: -120,
    right: -120,
  },
  mapMockToneB: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(213,223,218,0.74)",
    bottom: 120,
    left: -140,
  },
  mapMockToneC: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(229,236,232,0.94)",
    bottom: -90,
    right: -80,
  },
  mapMockWholeRouteDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(103,114,122,0.48)",
    transform: [{ translateX: -2.5 }, { translateY: -2.5 }],
  },
  mapMockActiveRouteDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(116,92,0,0.95)",
    transform: [{ translateX: -3.5 }, { translateY: -3.5 }],
  },
  mapMockCurrentAnchor: {
    position: "absolute",
    zIndex: 22,
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  mapMockSpotAnchor: {
    position: "absolute",
    zIndex: 24,
    transform: [{ translateX: -15 }, { translateY: -48 }],
  },
  mapWebFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#e7ece9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  mapWebFallbackText: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  mapCurrentPinMarker: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  mapCurrentPinHalo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(71,84,100,0.15)",
    position: "absolute",
  },
  mapCurrentPinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapCurrentPinCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#475464",
    position: "absolute",
  },
  mapDestinationPinWrap: {
    width: 48,
    height: 54,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  mapDestinationPinCore: {
    position: "absolute",
    top: 13,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  mapSpotMarkerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapSpotPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  mapSpotPinStart: {
    backgroundColor: "#475464",
    borderColor: "#33414f",
  },
  mapSpotPinGoal: {
    backgroundColor: "#745c00",
    borderColor: "#4e3c00",
  },
  mapSpotPinMuted: {
    backgroundColor: "rgba(143,151,157,0.88)",
    borderColor: "#6f777d",
  },
  mapSpotPinActiveTargetRing: {
    borderWidth: 3,
    borderColor: "#f5ce53",
    shadowColor: "#f5ce53",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
    elevation: 5,
  },
  mapSpotPinText: {
    fontSize: 12,
    fontWeight: "700",
  },
  mapSpotPinTextRole: {
    color: "#f9f9f7",
  },
  mapSpotPinTextActive: {
    color: "#f9f9f7",
  },
  mapSpotPinTextMuted: {
    color: "#f9f9f7",
  },
  mapRouteLegend: {
    position: "absolute",
    top: 108,
    left: 16,
    backgroundColor: palette.surfaceLowest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  mapRouteLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  mapRouteLegendDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  mapRouteLegendDotStart: {
    backgroundColor: "#475464",
  },
  mapRouteLegendDotGoal: {
    backgroundColor: "#5d5e63",
  },
  mapRouteLegendText: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.onSurfaceVariant,
  },
  mapNextTargetTag: {
    position: "absolute",
    top: 108,
    right: 16,
    backgroundColor: "#1a1c20",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 124,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  mapNextTargetLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "rgba(247,247,253,0.72)",
    marginBottom: 3,
  },
  mapNextTargetName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f7f7fd",
  },
  mapUtilityWrap: {
    position: "absolute",
    right: 4,
    top: -64,
    zIndex: 36,
  },
  mapUtilityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
  },
  mapBottomCardWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 30,
  },
  mapBottomCard: {
    minHeight: 188,
    borderRadius: 20,
    backgroundColor: palette.surfaceLowest,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  mapCardMain: {
    gap: 12,
  },
  mapCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  mapCardTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: palette.onBackground,
    flexShrink: 1,
  },
  mapCardMetaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  mapCardMetaText: {
    color: palette.onSurfaceVariant,
    fontSize: 13,
    fontWeight: "700",
  },
  mapCardInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingRight: 4,
  },
  mapCardInfoText: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    maxWidth: 280,
  },
  mapProgressBlock: {
    gap: 4,
  },
  mapProgressHeadline: {
    color: "#33414f",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  mapProgressSubline: {
    color: "#5a605e",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  mapProgressTrack: {
    marginTop: 4,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(173,179,176,0.35)",
    overflow: "hidden",
  },
  mapProgressFill: {
    height: "100%",
    backgroundColor: "#536070",
    borderRadius: 999,
  },
  mapLocationMessage: {
    color: "#475464",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  mapLocationMessageError: {
    color: palette.error,
  },
  mapCardCtaWrap: {
    paddingTop: 8,
  },
  mapCardEnabledCta: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.25)",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  mapCardEnabledCtaText: {
    color: palette.onBackground,
    fontSize: 16,
    fontWeight: "700",
  },
  mapCardEnabledCtaDisabled: {
    opacity: 0.86,
  },
  mapScenarioTransitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    backgroundColor: "rgba(8,10,14,0.82)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mapScenarioTransitionGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(245,206,83,0.24)",
  },
  mapScenarioTransitionPanel: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(17,18,20,0.62)",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  mapScenarioTransitionIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(245,206,83,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,206,83,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  mapScenarioTransitionTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  mapScenarioTransitionBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  spotSafeArea: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  spotScreen: {
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
  },
  spotBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  spotBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  spotTopBar: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 18,
    alignItems: "flex-start",
  },
  spotCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(249,249,247,0.82)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  spotCameraHintWrap: {
    position: "absolute",
    top: 26,
    right: 18,
    zIndex: 50,
    backgroundColor: "rgba(12,15,14,0.55)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  spotCameraHintText: {
    color: "rgba(247,247,253,0.92)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  spotMain: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 12,
  },
  spotCharacterStage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 154,
    height: "56%",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    pointerEvents: "none",
    zIndex: 2,
  },
  spotCharacterImage: {
    width: "72%",
    minWidth: 240,
    maxWidth: 460,
    height: "100%",
    maxHeight: 640,
    transform: [{ translateY: 10 }],
  },
  spotBottomSheet: {
    position: "relative",
    zIndex: 18,
    backgroundColor: "rgba(62,48,34,0.62)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(245,226,188,0.18)",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    shadowColor: "#120d07",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  spotSpeakerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,206,83,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,239,204,0.32)",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 14,
  },
  spotSpeakerBadgeText: {
    color: "rgba(255,244,217,0.96)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  spotScenarioText: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 20,
    lineHeight: 36,
    fontWeight: "500",
    letterSpacing: -0.2,
    marginBottom: 20,
  },
  spotScenarioPressArea: {
    minHeight: 112,
    justifyContent: "center",
  },
  spotScenarioCursor: {
    color: "rgba(255,245,214,0.96)",
    fontSize: 20,
    lineHeight: 36,
    fontWeight: "600",
  },
  spotNextButtonWrap: {
    alignItems: "flex-end",
    paddingTop: 4,
  },
  spotNextButton: {
    backgroundColor: "rgba(18,13,8,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,232,196,0.2)",
    borderRadius: 14,
    minHeight: 58,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  spotNextButtonText: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  epilogueSafeArea: {
    flex: 1,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  epilogueBackgroundWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  epilogueBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  epilogueBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  epilogueTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  epilogueBrand: {
    color: "rgba(245,245,245,0.96)",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 5.5,
  },
  epilogueMain: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 15,
  },
  epilogueGlowWrap: {
    marginBottom: 22,
    shadowColor: "rgba(245,206,83,0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 6,
  },
  epilogueGlowIcon: {
    textShadowColor: "rgba(245,206,83,0.6)",
    textShadowRadius: 10,
  },
  epilogueTitle: {
    color: "#ffffff",
    fontSize: 34,
    lineHeight: 44,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: 18,
    maxWidth: 420,
  },
  epilogueBody: {
    color: "rgba(235,235,235,0.95)",
    fontSize: 17,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "400",
    maxWidth: 430,
  },
  epilogueBottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "36%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 14,
  },
  epilogueFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 16,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 12,
  },
  epilogueCtaButton: {
    width: "100%",
    maxWidth: 360,
    minHeight: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.onBackground,
    shadowColor: "#1a1c20",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  epilogueCtaText: {
    color: palette.onDarkButton,
    fontSize: 22,
    fontWeight: "700",
  },
  epilogueSubtext: {
    color: "rgba(190,190,190,0.92)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.onBackground,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 48,
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.onBackground,
    marginTop: 20,
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 14,
    color: palette.onSurfaceVariant,
    lineHeight: 22,
  },
  modalUpdated: {
    fontSize: 12,
    color: palette.onSurfaceVariant,
    marginTop: 32,
    opacity: 0.6,
  },
});
