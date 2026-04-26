import { StatusBar } from "expo-status-bar";
import { scenario, type Quiz as ScenarioQuiz } from "./src/data/scenario";
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
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
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

const epilogueBgImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdDV4U9QpH_B0Ri9yn4ltTPOKZm0h2xFfMUpXnR7k7CZn7akV58MDWdkhhH5m0fwgJ1dxpMZmkw1vlXJ2GiUs2kxB2_16VpwatTfiIa4TdNmmGB-HbkwC-6DcvCE25-m9PURAIsId0jq7sbHmCkgf3dCtAQ84CAGLXR2DuN-ey8-FWwtxhT1OkAGpwPuGHsIlaJJjoD85ghgeJYa-WNG8HczVxugyGwtawbrsb5rv1HLBYvq5cofr1X8VSuQHijSEh6u2M0RjUT8c";

const mapCenterRegion = {
  latitude: 33.5968,
  longitude: 130.2238,
  latitudeDelta: 0.0072,
  longitudeDelta: 0.0072,
};

const currentLocation = {
  latitude: 33.5968,
  longitude: 130.2238,
};

type Coordinate = { latitude: number; longitude: number };
type Spot = {
  id: string;
  name: string;
  coordinate: Coordinate;
  scenarioTexts: string[];
  aoyagiNote: string;
  aoyagiNoteAfter?: string;
  nextHint?: string;
  quiz: ScenarioQuiz;
};

// スポット座標マップ（v5 シナリオIDに対応する実座標）
const spotCoordinateMap: Record<string, Coordinate> = {
  "yamakawa":    { latitude: 33.597637, longitude: 130.224077 },
  "oumei":       { latitude: 33.596980, longitude: 130.223490 },
  "koukousha":   { latitude: 33.596218, longitude: 130.222679 },
  "teiteisha":   { latitude: 33.595916, longitude: 130.222815 },
  "chikashoku":  { latitude: 33.596661, longitude: 130.222576 },
  "bigsky":      { latitude: 33.598089, longitude: 130.227848 },
  "foucault":    { latitude: 33.596040, longitude: 130.218541 },
};

// scenario.ts のスポット定義から spotCatalog を生成する
const spotCatalog: Spot[] = scenario.spots.map((scenarioSpot) => ({
  id: scenarioSpot.id,
  name: scenarioSpot.name,
  coordinate: spotCoordinateMap[scenarioSpot.id] ?? { latitude: 33.5968, longitude: 130.2188 },
  scenarioTexts: scenarioSpot.story
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0),
  aoyagiNote: scenarioSpot.aoyagiNote,
  aoyagiNoteAfter: scenarioSpot.aoyagiNoteAfter,
  nextHint: scenarioSpot.nextHint,
  quiz: scenarioSpot.quiz,
}));

const spotCatalogMap = spotCatalog.reduce<Record<string, Spot>>((acc, spot) => {
  acc[spot.id] = spot;
  return acc;
}, {});

const START_SPOT_ID: Spot["id"] = scenario.spots[0]?.id ?? "yamakawa";
const GOAL_SPOT_ID: Spot["id"] = scenario.spots[scenario.spots.length - 1]?.id ?? "foucault";
const FIXED_CENTER_ZONE_ROUTE_IDS: Spot["id"][] = scenario.spots.map((s) => s.id);

type StoryArcPhase = "起" | "承" | "転" | "結";
type StoryArcMeta = {
  phase: StoryArcPhase;
  beat: string;
  mapLead: string;
  trivia: string;
};

const storyArcMetaMap: Record<string, StoryArcMeta> = {
  "yamakawa": {
    phase: "起",
    beat: "百年前の贈り物",
    mapLead: "センターゾーンの広場に、初代総長の銅像があります。",
    trivia: "山川健次郎は会津藩士出身で、東京帝大・九大両方の総長を務めた人物です。",
  },
  "oumei": {
    phase: "承",
    beat: "3000年前の詩の名前",
    mapLead: "センター2号館4階に、鳥の鳴き声が宿る広場があります。",
    trivia: "「嚶鳴」は詩経に由来し、仲間と切磋琢磨する姿を表します。",
  },
  "koukousha": {
    phase: "承",
    beat: "学生が選んだ1500年前の詩",
    mapLead: "センターゾーン西側の木造建物で、名前の由来を探ります。",
    trivia: "「皎皎舎」の名は学生公募で決定。書棚2万冊の自学ゾーンとカフェが共存します。",
  },
  "teiteisha": {
    phase: "承",
    beat: "百年越しの畳の記憶",
    mapLead: "皎皎舎の隣に、旧制高校から続く畳の伝統が息づいています。",
    trivia: "旧制福岡高校（1921年創立）→六本松→伊都キャンパスと引き継がれた場所です。",
  },
  "chikashoku": {
    phase: "転",
    beat: "地の底の隠れ家",
    mapLead: "センターゾーンの半地下に、外からは気づきにくい食堂があります。",
    trivia: "センターゾーン最多の座席数。テラス席から崖山の景色が見えます。",
  },
  "bigsky": {
    phase: "転",
    beat: "まだ形のなかった空への想像",
    mapLead: "中央図書館の屋上に、空が大きく見える食堂があります。",
    trivia: "公募で選ばれた名前。まだ完成していない食堂を想像して贈られた言葉です。",
  },
  "foucault": {
    phase: "結",
    beat: "振り子が教えてくれること",
    mapLead: "ウエスト2号館のアトリウムで、地球の自転を目で見ることができます。",
    trivia: "1851年にフーコーがパリで行った実験の再現。振り子は地球が回っていることを示します。",
  },
};
const fallbackStoryArcMeta: StoryArcMeta = {
  phase: "承",
  beat: "探索中",
  mapLead: "次の視点へ進みます。",
  trivia: "周囲の導線や人の流れを観測し、現在地の意味を掴んでください。",
};

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

  if (Platform.OS === "web") {
    return [origin, ...waypoints, destination];
  }

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

const fetchRouteDirectionsForSpots = async (spots: Spot[]): Promise<Coordinate[] | null> => {
  if (spots.length < 2) return null;
  const origin = spots[0]?.coordinate;
  const destination = spots[spots.length - 1]?.coordinate;
  if (!origin || !destination) return null;
  const waypoints = spots.slice(1, -1).map((spot) => spot.coordinate);
  return fetchWalkingDirectionsCoordinates(origin, destination, waypoints);
};

let googleMapsJsLoader: Promise<void> | null = null;
const googleMapsScriptId = "kyudai-google-maps-js";
const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const hasGoogleMapsCoreConstructors = (maps: any) =>
  Boolean(
    maps &&
      typeof maps.Map === "function" &&
      typeof maps.Polyline === "function" &&
      typeof maps.LatLngBounds === "function" &&
      maps.event &&
      typeof maps.event.addListenerOnce === "function",
  );

const removeGoogleMapsScript = () => {
  if (typeof document === "undefined") return;
  const existingScript = document.getElementById(googleMapsScriptId);
  if (existingScript?.parentNode) {
    existingScript.parentNode.removeChild(existingScript);
  }
};

const loadGoogleMapsJs = async ({ forceReload = false }: { forceReload?: boolean } = {}) => {
  if (Platform.OS !== "web") return;
  if (!GOOGLE_MAPS_WEB_API_KEY) {
    throw new Error("GOOGLE_MAPS_WEB_API_KEY is missing");
  }

  if (forceReload) {
    removeGoogleMapsScript();
    googleMapsJsLoader = null;
  }

  if (!googleMapsJsLoader) {
    googleMapsJsLoader = new Promise<void>((resolve, reject) => {
      const fail = (reason: string) => reject(new Error(reason));
      const resolveWhenGoogleMapsAvailable = () => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          clearInterval(pollTimer);
          clearTimeout(timeoutTimer);
          resolve();
        };
        const pollTimer = setInterval(() => {
          const maps = (globalThis as any)?.google?.maps;
          if (maps) done();
        }, 80);
        const timeoutTimer = setTimeout(() => {
          if (settled) return;
          settled = true;
          clearInterval(pollTimer);
          fail("Google Maps script load timeout");
        }, 12000);
      };

      const existingScript = document.getElementById(googleMapsScriptId) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("error", () => fail("Google Maps script load failed"), {
          once: true,
        });
        resolveWhenGoogleMapsAvailable();
        return;
      }

      const script = document.createElement("script");
      script.id = googleMapsScriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_WEB_API_KEY}&language=ja&region=JP&v=weekly`;
      script.async = true;
      script.defer = true;
      script.addEventListener("error", () => fail("Google Maps script load failed"), { once: true });
      document.head.appendChild(script);
      resolveWhenGoogleMapsAvailable();
    });
  }

  await googleMapsJsLoader;
};

const resolveGoogleMapsConstructors = async (): Promise<any | null> => {
  const maps = (globalThis as any)?.google?.maps;
  if (!maps) return null;
  if (hasGoogleMapsCoreConstructors(maps)) return maps;

  if (typeof maps.importLibrary === "function") {
    try {
      const mapsLib = await maps.importLibrary("maps");
      if (mapsLib && typeof maps.Map !== "function" && typeof mapsLib.Map === "function") {
        maps.Map = mapsLib.Map;
      }
      if (mapsLib && typeof maps.Polyline !== "function" && typeof mapsLib.Polyline === "function") {
        maps.Polyline = mapsLib.Polyline;
      }
      if (mapsLib && typeof maps.LatLngBounds !== "function" && typeof mapsLib.LatLngBounds === "function") {
        maps.LatLngBounds = mapsLib.LatLngBounds;
      }
    } catch {
      return null;
    }
  }

  return hasGoogleMapsCoreConstructors(maps) ? maps : null;
};

const ensureGoogleMapsConstructors = async () => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await loadGoogleMapsJs({ forceReload: attempt > 0 });

      const deadline = Date.now() + 6000;
      while (Date.now() < deadline) {
        const maps = await resolveGoogleMapsConstructors();
        if (maps) return maps;
        await waitMs(90);
      }

      lastError = new Error("Google Maps constructors are unavailable");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Google Maps script initialization failed");
    }

    await waitMs(180 * (attempt + 1));
  }

  throw lastError ?? new Error("Google Maps constructors are unavailable");
};

const waitForHostToHaveSize = async (host: HTMLElement, timeoutMs = 2600) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const rect = host.getBoundingClientRect();
    if (rect.width > 10 && rect.height > 10) return true;
    await waitMs(80);
  }
  return false;
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
  "15〜20分": 7,
  "20〜30分": 7,
  "30〜45分": 7,
};
// scenario.spots の中間スポット（最初と最後を除く）を familiarity に関係なく全使用
const _scenarioMiddleIds = scenario.spots.slice(1, -1).map((s) => s.id);
const familiarityMiddleSpotPriority: Record<Familiarity, Spot["id"][]> = {
  はじめて来た:          _scenarioMiddleIds,
  まだあまり慣れていない: _scenarioMiddleIds,
  何度か来たことがある:   _scenarioMiddleIds,
  よく来ている:          _scenarioMiddleIds,
};

const buildExperienceSpots = (selectedFamiliarity: Familiarity, selectedDuration: Duration): Spot[] => {
  const startSpot = spotCatalogMap[START_SPOT_ID] ?? spotCatalog[0];
  const goalSpot = spotCatalogMap[GOAL_SPOT_ID] ?? spotCatalog[spotCatalog.length - 1] ?? startSpot;

  const targetCount = Math.max(2, Math.min(durationSpotCountMap[selectedDuration], spotCatalog.length));
  const middleTargetCount = Math.max(0, targetCount - 2);
  const familiarityPriority = familiarityMiddleSpotPriority[selectedFamiliarity];
  const fallbackMiddleIds = FIXED_CENTER_ZONE_ROUTE_IDS.filter(
    (spotId) => spotId !== startSpot.id && spotId !== goalSpot.id,
  );
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
  `yu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const getFirebaseErrorCode = (error: unknown): string => {
  if (typeof error === "object" && error && "code" in error) {
    const raw = String((error as { code: unknown }).code ?? "");
    return raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
  }
  return "";
};

const getFirebaseAuthErrorMessage = (error: unknown): string => {
  const code = getFirebaseErrorCode(error);
  if (code === "popup-closed-by-user") return "";
  if (code === "popup-blocked") {
    return "ポップアップがブロックされました。ブラウザのポップアップ許可後に再試行してください。";
  }
  if (code === "unauthorized-domain") {
    return "Firebase Authentication の承認済みドメイン設定に現在のドメインが含まれていません。";
  }
  if (code === "operation-not-allowed") {
    return "Firebase AuthenticationでGoogleログインが有効化されていません。";
  }
  if (code === "network-request-failed") {
    return "ネットワーク接続に失敗しました。通信環境を確認して再試行してください。";
  }
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return "Googleログインに失敗しました。";
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
  savedScreen?: AppScreen;
};

type ProgramFlowConfig = {
  step1?: {
    normalizeUserType?: string;
    normalizeFamiliarity?: string;
    normalizeDuration?: string;
  };
  step2?: {
    spotCountRule?: string;
    mobilityConstraintRule?: string;
  };
  step3?: {
    candidateSelectionRule?: string;
    routeOrderingRule?: string;
    spotDbLinkPolicy?: string;
    candidateSpotPoolIds?: string;
  };
  step5?: {
    narrativeContainerSpec?: string;
    slotInjectionPolicy?: string;
  };
  step6?: {
    worldSetting?: string;
    characterProfile?: string;
    characterRole?: string;
    storyArcFor4Spots?: string;
    storyArcFor5Spots?: string;
    storyArcFor6Spots?: string;
    conversationFlow?: string;
  };
  step7?: {
    validationRuleSet?: string;
    fallbackPolicy?: string;
  };
  step8?: {
    finalizeFormat?: string;
    persistAndDispatch?: string;
  };
};

type AIPromptConfig = {
  step4RouteOptimization?: string;
  step6InsertionGeneration?: string;
  step7MinimalRepair?: string;
};

type QuestGenerationConfig = {
  program?: ProgramFlowConfig;
  aiPrompts?: AIPromptConfig;
};

type AdminWorldConfigPayload = {
  title?: string;
  description?: string;
  audience?: string;
  tone?: string;
  styleRules?: string;
  outputLanguage?: string;
  routeDesign?: string;
  fixedTextPolicy?: string;
  requiredKeywords?: string[];
  blockedKeywords?: string[];
  landingTopTag?: string;
  landingHeroPanelTitle?: string;
  landingHeroPanelBody?: string;
  landingEyebrow?: string;
  landingHeroTitleLine1?: string;
  landingHeroTitleLine2?: string;
  landingHeroDescription?: string;
  landingJourneyTitle?: string;
  landingJourneyCaption?: string;
  landingFeaturesTitle?: string;
  landingFeaturesCaption?: string;
  landingStartButton?: string;
  setupTitle?: string;
  setupSubtitle?: string;
  setupUserTypeLabel?: string;
  setupFamiliarityLabel?: string;
  setupExplorationLabel?: string;
  setupExpectationLabel?: string;
  setupDurationLabel?: string;
  setupDurationHintShort?: string;
  setupDurationHintLong?: string;
  setupResearchNote?: string;
  setupStartButton?: string;
  preparingTitle?: string;
  preparingBody?: string;
  preparingStatusDone?: string;
  preparingStatusProgress?: string;
  preparingStatusPending?: string;
  preparingSkipButton?: string;
  preparingFooter?: string;
  readyChapterLabel?: string;
  readyHeroLead?: string;
  readySummaryTitle?: string;
  readySummaryText?: string;
  readyGeneratedStoryLabel?: string;
  readyStartButton?: string;
  readyTransitionTitle?: string;
  readyTransitionBody?: string;
  spotMapInfoLine1?: string;
  spotMapInfoLine2?: string;
  spotMapArrivedLabel?: string;
  spotMapRestartLabel?: string;
  spotSpeakerBadge?: string;
  spotNextButton?: string;
  spotBackToMapButton?: string;
  spotFinishButton?: string;
  spotNarratives?: string[];
  prologueBody?: string;
  prologueCta?: string;
  epilogueBody?: string;
  epilogueCta?: string;
  feedbackHeroTitleLine1?: string;
  feedbackHeroTitleLine2?: string;
  feedbackHeroSubtitleLine1?: string;
  feedbackHeroSubtitleLine2?: string;
  feedbackQuestionOverall?: string;
  feedbackQuestionGuidance?: string;
  feedbackQuestionCampus?: string;
  feedbackQuestionVisitIntent?: string;
  feedbackQuestionExpectation?: string;
  feedbackQuestionReuse?: string;
  feedbackQuestionComment?: string;
  feedbackCommentNote?: string;
  feedbackSubmitButton?: string;
  feedbackThanks?: string;
  questGenerationConfig?: QuestGenerationConfig;
};

type GeneratedQuestSpot = {
  id: string;
  name?: string;
  overview?: string;
  rationale?: string;
  scenarioTexts: string[];
  lat?: number;
  lng?: number;
};

type GeneratedQuestPayload = {
  generatedStoryName?: string;
  storyTone?: string;
  readyHeroLead?: string;
  readySummaryTitle?: string;
  readySummaryText?: string;
  prologueBody?: string;
  epilogueBody?: string;
  spots: GeneratedQuestSpot[];
};

type GeneratedQuestStep = {
  id: string;
  label: string;
  status: "completed" | "fallback";
  detail: string;
};



const emitPreviewDebugLog = (event: string, payload?: Record<string, unknown>) => {
  if (Platform.OS !== "web") return;
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  window.parent.postMessage(
    {
      source: "kyudai-dictionary-mvp-mobile",
      type: "tomoshibi-mobile:debug-log",
      payload: {
        event,
        emittedAt: new Date().toISOString(),
        ...(payload ? { data: payload } : {}),
      },
    },
    "*",
  );
};

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const normalizeTextList = (value: unknown, maxItems: number): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.slice(0, maxItems).map((item) => (typeof item === "string" ? item.trim() : ""));
};

const normalizeQuestGenerationConfig = (value: unknown): QuestGenerationConfig | undefined => {
  const root = asRecord(value);
  if (!root) return undefined;

  const rawProgram = asRecord(root.program);
  const rawPrompts = asRecord(root.aiPrompts);
  const rawStep1 = asRecord(rawProgram?.step1);
  const rawStep2 = asRecord(rawProgram?.step2);
  const rawStep3 = asRecord(rawProgram?.step3);
  const rawStep5 = asRecord(rawProgram?.step5);
  const rawStep6 = asRecord(rawProgram?.step6);
  const rawStep7 = asRecord(rawProgram?.step7);
  const rawStep8 = asRecord(rawProgram?.step8);

  return {
    program: {
      step1: rawStep1
        ? {
            normalizeUserType: normalizeText(rawStep1.normalizeUserType),
            normalizeFamiliarity: normalizeText(rawStep1.normalizeFamiliarity),
            normalizeDuration: normalizeText(rawStep1.normalizeDuration),
          }
        : undefined,
      step2: rawStep2
        ? {
            spotCountRule: normalizeText(rawStep2.spotCountRule),
            mobilityConstraintRule: normalizeText(rawStep2.mobilityConstraintRule),
          }
        : undefined,
      step3: rawStep3
        ? {
            candidateSelectionRule: normalizeText(rawStep3.candidateSelectionRule),
            routeOrderingRule: normalizeText(rawStep3.routeOrderingRule),
            spotDbLinkPolicy: normalizeText(rawStep3.spotDbLinkPolicy),
            candidateSpotPoolIds: normalizeText(rawStep3.candidateSpotPoolIds),
          }
        : undefined,
      step5: rawStep5
        ? {
            narrativeContainerSpec: normalizeText(rawStep5.narrativeContainerSpec),
            slotInjectionPolicy: normalizeText(rawStep5.slotInjectionPolicy),
          }
        : undefined,
      step6: rawStep6
        ? {
            worldSetting: normalizeText(rawStep6.worldSetting),
            characterProfile: normalizeText(rawStep6.characterProfile),
            characterRole: normalizeText(rawStep6.characterRole),
            storyArcFor4Spots: normalizeText(rawStep6.storyArcFor4Spots),
            storyArcFor5Spots: normalizeText(rawStep6.storyArcFor5Spots),
            storyArcFor6Spots: normalizeText(rawStep6.storyArcFor6Spots),
            conversationFlow: normalizeText(rawStep6.conversationFlow),
          }
        : undefined,
      step7: rawStep7
        ? {
            validationRuleSet: normalizeText(rawStep7.validationRuleSet),
            fallbackPolicy: normalizeText(rawStep7.fallbackPolicy),
          }
        : undefined,
      step8: rawStep8
        ? {
            finalizeFormat: normalizeText(rawStep8.finalizeFormat),
            persistAndDispatch: normalizeText(rawStep8.persistAndDispatch),
          }
        : undefined,
    },
    aiPrompts: {
      step4RouteOptimization: normalizeText(rawPrompts?.step4RouteOptimization),
      step6InsertionGeneration: normalizeText(rawPrompts?.step6InsertionGeneration),
      step7MinimalRepair: normalizeText(rawPrompts?.step7MinimalRepair),
    },
  };
};

const parseAdminWorldConfigPayload = (value: unknown): AdminWorldConfigPayload | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  return {
    title: normalizeText(raw.title),
    description: normalizeText(raw.description),
    audience: normalizeText(raw.audience),
    tone: normalizeText(raw.tone),
    styleRules: normalizeText(raw.styleRules),
    outputLanguage: normalizeText(raw.outputLanguage),
    routeDesign: normalizeText(raw.routeDesign),
    fixedTextPolicy: normalizeText(raw.fixedTextPolicy),
    requiredKeywords: Array.isArray(raw.requiredKeywords)
      ? raw.requiredKeywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : undefined,
    blockedKeywords: Array.isArray(raw.blockedKeywords)
      ? raw.blockedKeywords.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : undefined,
    landingTopTag: normalizeText(raw.landingTopTag),
    landingHeroPanelTitle: normalizeText(raw.landingHeroPanelTitle),
    landingHeroPanelBody: normalizeText(raw.landingHeroPanelBody),
    landingEyebrow: normalizeText(raw.landingEyebrow),
    landingHeroTitleLine1: normalizeText(raw.landingHeroTitleLine1),
    landingHeroTitleLine2: normalizeText(raw.landingHeroTitleLine2),
    landingHeroDescription: normalizeText(raw.landingHeroDescription),
    landingJourneyTitle: normalizeText(raw.landingJourneyTitle),
    landingJourneyCaption: normalizeText(raw.landingJourneyCaption),
    landingFeaturesTitle: normalizeText(raw.landingFeaturesTitle),
    landingFeaturesCaption: normalizeText(raw.landingFeaturesCaption),
    landingStartButton: normalizeText(raw.landingStartButton),
    setupTitle: normalizeText(raw.setupTitle),
    setupSubtitle: normalizeText(raw.setupSubtitle),
    setupUserTypeLabel: normalizeText(raw.setupUserTypeLabel),
    setupFamiliarityLabel: normalizeText(raw.setupFamiliarityLabel),
    setupExplorationLabel: normalizeText(raw.setupExplorationLabel),
    setupExpectationLabel: normalizeText(raw.setupExpectationLabel),
    setupDurationLabel: normalizeText(raw.setupDurationLabel),
    setupDurationHintShort: normalizeText(raw.setupDurationHintShort),
    setupDurationHintLong: normalizeText(raw.setupDurationHintLong),
    setupResearchNote: normalizeText(raw.setupResearchNote),
    setupStartButton: normalizeText(raw.setupStartButton),
    preparingTitle: normalizeText(raw.preparingTitle),
    preparingBody: normalizeText(raw.preparingBody),
    preparingStatusDone: normalizeText(raw.preparingStatusDone),
    preparingStatusProgress: normalizeText(raw.preparingStatusProgress),
    preparingStatusPending: normalizeText(raw.preparingStatusPending),
    preparingSkipButton: normalizeText(raw.preparingSkipButton),
    preparingFooter: normalizeText(raw.preparingFooter),
    readyChapterLabel: normalizeText(raw.readyChapterLabel),
    readyHeroLead: normalizeText(raw.readyHeroLead),
    readySummaryTitle: normalizeText(raw.readySummaryTitle),
    readySummaryText: normalizeText(raw.readySummaryText),
    readyGeneratedStoryLabel: normalizeText(raw.readyGeneratedStoryLabel),
    readyStartButton: normalizeText(raw.readyStartButton),
    readyTransitionTitle: normalizeText(raw.readyTransitionTitle),
    readyTransitionBody: normalizeText(raw.readyTransitionBody),
    spotMapInfoLine1: normalizeText(raw.spotMapInfoLine1),
    spotMapInfoLine2: normalizeText(raw.spotMapInfoLine2),
    spotMapArrivedLabel: normalizeText(raw.spotMapArrivedLabel),
    spotMapRestartLabel: normalizeText(raw.spotMapRestartLabel),
    spotSpeakerBadge: normalizeText(raw.spotSpeakerBadge),
    spotNextButton: normalizeText(raw.spotNextButton),
    spotBackToMapButton: normalizeText(raw.spotBackToMapButton),
    spotFinishButton: normalizeText(raw.spotFinishButton),
    spotNarratives: normalizeTextList(raw.spotNarratives, 6),
    prologueBody: normalizeText(raw.prologueBody),
    prologueCta: normalizeText(raw.prologueCta),
    epilogueBody: normalizeText(raw.epilogueBody),
    epilogueCta: normalizeText(raw.epilogueCta),
    feedbackHeroTitleLine1: normalizeText(raw.feedbackHeroTitleLine1),
    feedbackHeroTitleLine2: normalizeText(raw.feedbackHeroTitleLine2),
    feedbackHeroSubtitleLine1: normalizeText(raw.feedbackHeroSubtitleLine1),
    feedbackHeroSubtitleLine2: normalizeText(raw.feedbackHeroSubtitleLine2),
    feedbackQuestionOverall: normalizeText(raw.feedbackQuestionOverall),
    feedbackQuestionGuidance: normalizeText(raw.feedbackQuestionGuidance),
    feedbackQuestionCampus: normalizeText(raw.feedbackQuestionCampus),
    feedbackQuestionVisitIntent: normalizeText(raw.feedbackQuestionVisitIntent),
    feedbackQuestionExpectation: normalizeText(raw.feedbackQuestionExpectation),
    feedbackQuestionReuse: normalizeText(raw.feedbackQuestionReuse),
    feedbackQuestionComment: normalizeText(raw.feedbackQuestionComment),
    feedbackCommentNote: normalizeText(raw.feedbackCommentNote),
    feedbackSubmitButton: normalizeText(raw.feedbackSubmitButton),
    feedbackThanks: normalizeText(raw.feedbackThanks),
    questGenerationConfig: normalizeQuestGenerationConfig(raw.questGenerationConfig),
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
    body: "入力条件をもとに、Center Zone起点の6スポットを起承転結に沿って構成します。",
    icon: "sparkles-outline",
    badge: "STEP 1",
  },
  {
    id: "journey-walk",
    title: "ルートを順番にたどる",
    body: "地図と到着演出を使い、6地点の導線を無理なく確認しながら進めます。",
    icon: "book-outline",
    badge: "STEP 2",
  },
  {
    id: "journey-story",
    title: "豆知識が物語に変わる",
    body: "各スポットの具体情報を短いシナリオへ変換し、最後にWest Gateで全体を接続します。",
    icon: "map-outline",
    badge: "STEP 3",
  },
];

const readyStoryToneMap: Record<Familiarity, string> = {
  はじめて来た: "起承転結の案内編",
  まだあまり慣れていない: "観測と発見の実地編",
  何度か来たことがある: "再解釈の深掘り編",
  よく来ている: "知の接続を磨く編",
};

const readyDurationLabelMap: Record<Duration, string> = {
  "15〜20分": "要点を速く巡る",
  "20〜30分": "6地点を標準速度で巡る",
  "30〜45分": "6地点を深く味わう",
};

// 各スポットの説明文（Ready画面EXPLORATION PATH用）
const readySpotOverviewMap: Record<string, string> = {
  "yamakawa":   "毎日何百人も素通りしているのに、誰も立ち止まらない胸像。この人物の正体を知ったとき、旅が始まる。",
  "oumei":      "コンセントのある開放的な広場。「嚶鳴（おうめい）」── 読めないその名前に、3000年前の詩が隠されていた。",
  "koukousha":  "書籍2万点とカフェを持つ書店。「月の光が包む場所」という名前は、公募で選ばれた。",
  "teiteisha":  "51畳の畳空間。「学生が集まって語り合う場」が100年かけて引き継がれた歴史がある。",
  "chikashoku": "外からは気づかない半地下の食堂。鶏天親子丼と鶏天定食が青柳のおすすめ。",
  "bigsky":     "「空が大きく見える場所になるから」── この名前は、ある学生が完成前の食堂を想像して贈った言葉だ。",
  "foucault":   "地球の自転を目で確かめられる振り子の前で、ノートの最後のページを開く。すべてがつながる。",
};

const defaultPrologueNarrationText = scenario.prologue;
const defaultEpilogueNarrationText = scenario.epilogue;
const narrationPageMaxChars = 170;

const splitNarrationIntoPages = (raw: string, maxChars = narrationPageMaxChars): string[] => {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [""];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  const pages: string[] = [];
  let currentPage = "";

  const pushPage = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) pages.push(trimmed);
  };

  const splitLongParagraph = (paragraph: string): string => {
    let remaining = paragraph.trim();
    while (remaining.length > maxChars) {
      const windowText = remaining.slice(0, maxChars);
      const breakAt = Math.max(windowText.lastIndexOf("。"), windowText.lastIndexOf("、"), windowText.lastIndexOf(" "));
      const cutIndex = breakAt >= Math.floor(maxChars * 0.55) ? breakAt + 1 : maxChars;
      pushPage(remaining.slice(0, cutIndex));
      remaining = remaining.slice(cutIndex).trim();
    }
    return remaining;
  };

  for (const paragraph of paragraphs) {
    let nextParagraph = paragraph;
    if (nextParagraph.length > maxChars) {
      if (currentPage) {
        pushPage(currentPage);
        currentPage = "";
      }
      nextParagraph = splitLongParagraph(nextParagraph);
    }

    if (!nextParagraph) continue;
    const candidate = currentPage ? `${currentPage}\n\n${nextParagraph}` : nextParagraph;
    if (candidate.length <= maxChars) {
      currentPage = candidate;
    } else {
      pushPage(currentPage);
      currentPage = nextParagraph;
    }
  }

  if (currentPage) pushPage(currentPage);
  return pages.length > 0 ? pages : [normalized];
};

const spotTypingIntervalMs = 52;
const spotTypingStep = 1;

export default function App() {
  const useMockMapBackground =
    Platform.OS !== "web" &&
    (process.env.EXPO_PUBLIC_USE_MOCK_MAP_BACKGROUND ?? "").trim().toLowerCase() === "true";
  const { width, height } = useWindowDimensions();
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
  const mapWebBoundHostRef = useRef<any>(null);
  const mapWebCurrentLocationMarkerRef = useRef<any>(null);
  const mapWebSpotMarkersRef = useRef<any[]>([]);
  const mapWebActiveRoutePolylineRef = useRef<any>(null);
  const mapWebWholeRoutePolylineRef = useRef<any>(null);
  const readyMapRef = useRef<MapView | null>(null);
  const readyWebMapHostRef = useRef<any>(null);
  const readyWebMapInstanceRef = useRef<any>(null);
  const readyWebBoundHostRef = useRef<any>(null);
  const readyWebSpotMarkersRef = useRef<any[]>([]);
  const readyWebRoutePolylineRef = useRef<any>(null);
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
  const [isFirebaseSignedIn, setIsFirebaseSignedIn] = useState(false);
  const [firebaseAvatarUrl, setFirebaseAvatarUrl] = useState<string | null>(null);
  const [firebaseDisplayName, setFirebaseDisplayName] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFeedbackThankyou, setShowFeedbackThankyou] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHomeConfirmModal, setShowHomeConfirmModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(() =>
    isUserType(persistedFlowDraft?.selectedUserType) ? persistedFlowDraft.selectedUserType : "新入生",
  );
  const [isUserTypeAnswered, setIsUserTypeAnswered] = useState(false);
  const [isUserTypeMenuOpen, setIsUserTypeMenuOpen] = useState(false);
  const [selectedFamiliarity, setSelectedFamiliarity] = useState<Familiarity>(() =>
    isFamiliarity(persistedFlowDraft?.selectedFamiliarity)
      ? persistedFlowDraft.selectedFamiliarity
      : "まだあまり慣れていない",
  );
  const [isFamiliarityAnswered, setIsFamiliarityAnswered] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(() =>
    isDuration(persistedFlowDraft?.selectedDuration) ? persistedFlowDraft.selectedDuration : "20〜30分",
  );
  const [isDurationAnswered, setIsDurationAnswered] = useState(false);
  const [selectedExplorationStyle, setSelectedExplorationStyle] = useState<ExplorationStyle>(
    isExplorationStyle(persistedFlowDraft?.selectedExplorationStyle)
      ? persistedFlowDraft.selectedExplorationStyle
      : "地図で事前確認",
  );
  const [isExplorationStyleAnswered, setIsExplorationStyleAnswered] = useState(false);
  const [selectedExperienceExpectation, setSelectedExperienceExpectation] = useState<ExperienceExpectation>(
    isExperienceExpectation(persistedFlowDraft?.selectedExperienceExpectation)
      ? persistedFlowDraft.selectedExperienceExpectation
      : "場所を覚えたい",
  );
  const [isExperienceExpectationAnswered, setIsExperienceExpectationAnswered] = useState(false);
  const [adminWorldConfig, setAdminWorldConfig] = useState<AdminWorldConfigPayload | null>(null);
  const [generatedQuest, setGeneratedQuest] = useState<GeneratedQuestPayload | null>(null);
  const [generatedQuestSteps, setGeneratedQuestSteps] = useState<GeneratedQuestStep[]>([]);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [isLandingGoogleSigningIn, setIsLandingGoogleSigningIn] = useState(false);
  const [landingAuthError, setLandingAuthError] = useState<string | null>(null);
  const [isHeaderAuthMenuOpen, setIsHeaderAuthMenuOpen] = useState(false);
  const [headerAuthMenuError, setHeaderAuthMenuError] = useState<string | null>(null);
  const [isHeaderAuthSigningOut, setIsHeaderAuthSigningOut] = useState(false);
  const [preparingVisibleStep, setPreparingVisibleStep] = useState(0);

  const baseSpots = useMemo(
    () => buildExperienceSpots(selectedFamiliarity, selectedDuration),
    [selectedDuration, selectedFamiliarity],
  );
  const generatedRouteSpots = useMemo(() => {
    const seen = new Set<string>();
    const resolved: Spot[] = [];
    for (const generatedSpot of generatedQuest?.spots ?? []) {
      const id = normalizeText(generatedSpot?.id);
      if (!id || seen.has(id)) continue;

      const catalogSpot = spotCatalogMap[id];
      const latitude = normalizeFiniteNumber(generatedSpot?.lat) ?? catalogSpot?.coordinate.latitude;
      const longitude = normalizeFiniteNumber(generatedSpot?.lng) ?? catalogSpot?.coordinate.longitude;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      const generatedScenarioTexts = (generatedSpot?.scenarioTexts ?? [])
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .slice(0, 3);
      const fallbackScenarioTexts =
        catalogSpot?.scenarioTexts ??
        [`${normalizeText(generatedSpot?.name) ?? id}に到着しました。周囲の導線と見どころを観測しましょう。`];

      resolved.push({
        id,
        name: normalizeText(generatedSpot?.name) ?? catalogSpot?.name ?? id,
        coordinate: {
          latitude,
          longitude,
        },
        scenarioTexts: generatedScenarioTexts.length > 0 ? generatedScenarioTexts : fallbackScenarioTexts,
        aoyagiNote: catalogSpot?.aoyagiNote ?? '',
        aoyagiNoteAfter: catalogSpot?.aoyagiNoteAfter,
        nextHint: catalogSpot?.nextHint,
        quiz: catalogSpot?.quiz ?? { question: '', options: [], correctLabel: 'A' as const, explanation: '' },
      });
      seen.add(id);
    }
    return resolved;
  }, [generatedQuest?.spots]);
  const generatedSpotOverviewMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const spot of generatedQuest?.spots ?? []) {
      if (!spot?.id) continue;
      const overview = normalizeText(spot.overview);
      if (!overview) continue;
      map[spot.id] = overview;
    }
    return map;
  }, [generatedQuest?.spots]);

  const spots = useMemo(() => {
    const routeSpots = generatedRouteSpots.length > 0 ? generatedRouteSpots : baseSpots;
    const adminSpotNarratives = adminWorldConfig?.spotNarratives ?? [];
    return routeSpots.map((spot, index) => {
      const overrideNarrative = adminSpotNarratives[index]?.trim();
      return {
        ...spot,
        scenarioTexts: overrideNarrative ? [overrideNarrative] : spot.scenarioTexts,
      };
    });
  }, [adminWorldConfig?.spotNarratives, baseSpots, generatedRouteSpots]);
  const [landingBottomBarHeight, setLandingBottomBarHeight] = useState(0);
  const [readyBottomBarHeight, setReadyBottomBarHeight] = useState(0);
  const [setupBottomBarHeight, setSetupBottomBarHeight] = useState(0);
  const [prologueCtaHeight, setPrologueCtaHeight] = useState(130);
  const [epilogueCtaHeight, setEpilogueCtaHeight] = useState(130);
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
  const [liveCurrentLocation, setLiveCurrentLocation] = useState<Coordinate | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [webMapError, setWebMapError] = useState<string | null>(null);
  const webMapErrorRef = useRef<string | null>(null);
  const [readyWebMapError, setReadyWebMapError] = useState<string | null>(null);
  const readyWebMapErrorRef = useRef<string | null>(null);
  const [wholeRouteDirectionsCoordinates, setWholeRouteDirectionsCoordinates] = useState<Coordinate[] | null>(null);
  const [activeRouteDirectionsCoordinates, setActiveRouteDirectionsCoordinates] = useState<Coordinate[] | null>(null);
  const [readyRouteDirectionsCoordinates, setReadyRouteDirectionsCoordinates] = useState<Coordinate[] | null>(null);
  const [readySelectedSpotIndex, setReadySelectedSpotIndex] = useState(() =>
    clampSpotIndex(persistedFlowDraft?.currentSpotIndex, spotCatalog.length),
  );
  const [mapFocusSpotIndex, setMapFocusSpotIndex] = useState<number | null>(null);
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
  const [prologuePageIndex, setProloguePageIndex] = useState(0);
  const [prologueShowNote, setPrologueShowNote] = useState(false);
  const [epiloguePageIndex, setEpiloguePageIndex] = useState(0);
  const [spotScenarioSegmentIndex, setSpotScenarioSegmentIndex] = useState(0);
  const [spotTypedCharCount, setSpotTypedCharCount] = useState(0);
  const [isSpotTypingDone, setIsSpotTypingDone] = useState(true);
  const [spotPhase, setSpotPhase] = useState<'note' | 'story' | 'noteAfter' | 'quiz' | 'quizResult' | 'nextHintStory'>('note');
  const [quizSelectedLabel, setQuizSelectedLabel] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
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
  const prologueSkipEnabledAtRef = useRef(0);
  const epilogueSkipEnabledAtRef = useRef(0);
  const preparingPulseAnim = useRef(new Animated.Value(0)).current;
  const preparingRotateAnim = useRef(new Animated.Value(0)).current;
  const preparingBarAnimA = useRef(new Animated.Value(0)).current;
  const preparingBarAnimB = useRef(new Animated.Value(0)).current;
  const preparingBarAnimC = useRef(new Animated.Value(0)).current;
  const preparingStatusAnim = useRef(new Animated.Value(0)).current;
  const preparingProgressAnim = useRef(new Animated.Value(0)).current;

  const safeCurrentSpotIndex = clampSpotIndex(currentSpotIndex, spots.length);
  const currentSpot = spots[safeCurrentSpotIndex] ?? spots[0] ?? spotCatalog[0];
  const currentStoryArcMeta = storyArcMetaMap[currentSpot.id] ?? fallbackStoryArcMeta;
  const spotScenarioTexts = currentSpot.scenarioTexts;
  const currentSpotScenarioText =
    spotScenarioTexts[Math.min(spotScenarioSegmentIndex, Math.max(spotScenarioTexts.length - 1, 0))] ?? "";
  const spotScenarioChars = useMemo(() => Array.from(currentSpotScenarioText), [currentSpotScenarioText]);
  const hasNextScenarioInSpot = spotScenarioSegmentIndex < spotScenarioTexts.length - 1;
  const spotNextButtonLabel = !isSpotTypingDone
    ? adminWorldConfig?.spotNextButton || "次へ"
    : hasNextScenarioInSpot
      ? adminWorldConfig?.spotNextButton || "次へ"
      : currentSpot.aoyagiNoteAfter
        ? "続きを読む"
        : "クイズに挑戦";
  const nextSpot = safeCurrentSpotIndex < spots.length - 1 ? spots[safeCurrentSpotIndex + 1] : null;
  const goalSpot = spots[spots.length - 1];
  const fallbackOrigin = useMemo<Coordinate>(() => {
    if (safeCurrentSpotIndex === 0) return currentLocation;
    return spots[safeCurrentSpotIndex - 1].coordinate;
  }, [safeCurrentSpotIndex, spots]);
  const routeOrigin = liveCurrentLocation ?? fallbackOrigin;
  const activeCurrentLocation = routeOrigin;
  const activeTargetIndex = isExperienceCompleted ? -1 : safeCurrentSpotIndex;
  const allSpotCoordinates = useMemo(() => spots.map((spot) => spot.coordinate), [spots]);
  const safeReadySelectedSpotIndex = clampSpotIndex(readySelectedSpotIndex, spots.length);
  const readySelectedSpot = spots[safeReadySelectedSpotIndex] ?? spots[0] ?? spotCatalog[0];
  const readyMapRegion = useMemo(() => createRegionFromCoordinates(allSpotCoordinates), [allSpotCoordinates]);
  const readyRouteCoordinates =
    readyRouteDirectionsCoordinates && readyRouteDirectionsCoordinates.length > 1
      ? readyRouteDirectionsCoordinates
      : allSpotCoordinates;
  const mapFitCoordinates = useMemo(() => [routeOrigin, ...allSpotCoordinates], [routeOrigin, allSpotCoordinates]);
  const mapInitialRegion = useMemo(() => createRegionFromCoordinates(mapFitCoordinates), [mapFitCoordinates]);
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
  }, [activeTargetIndex, routeOrigin, spots]);
  const effectiveLandingTopTag = adminWorldConfig?.landingTopTag || "伊都キャンパス探索ナビ";
  const effectiveLandingHeroPanelTitle = adminWorldConfig?.landingHeroPanelTitle || "九大を、物語で知る。";
  const effectiveLandingHeroPanelBody = adminWorldConfig?.landingHeroPanelBody || "青柳の残したノート";
  const effectiveLandingEyebrow = adminWorldConfig?.landingEyebrow || "九州大学 伊都キャンパス ｜ 実証実験";
  const effectiveLandingHeroTitleLine1 = adminWorldConfig?.landingHeroTitleLine1 || "はじめての伊都を、";
  const effectiveLandingHeroTitleLine2 = adminWorldConfig?.landingHeroTitleLine2 || "物語で知る";
  const effectiveLandingHeroDescription =
    adminWorldConfig?.landingHeroDescription ||
    "これは九大伊都キャンパスを舞台にした実証実験です。移動は不要 — その場にいながら、物語を通じて伊都キャンパスの各スポットを体験できます。";
  const effectiveLandingJourneyTitle = adminWorldConfig?.landingJourneyTitle || "体験の流れ";
  const effectiveLandingJourneyCaption = adminWorldConfig?.landingJourneyCaption || "移動なしで進める、3ステップの物語体験";
  const effectiveLandingFeaturesTitle = adminWorldConfig?.landingFeaturesTitle || "この体験でできること";
  const effectiveLandingFeaturesCaption = adminWorldConfig?.landingFeaturesCaption || "歩くだけで終わらない、九大の楽しみ方";
  const effectiveLandingGoogleStartButton = "Googleログインして冒険を始める";
  const effectiveLandingGuestStartButton = "ログインせずに冒険を始める";

  const effectiveSetupTitle = adminWorldConfig?.setupTitle || "体験の準備をしましょう";
  const effectiveSetupSubtitle =
    adminWorldConfig?.setupSubtitle ||
    "いくつか教えてください。あなたに合った流れで、伊都キャンパスの体験を始めます。";
  const effectiveSetupUserTypeLabel = adminWorldConfig?.setupUserTypeLabel || "あなたについて教えてください";
  const effectiveSetupFamiliarityLabel = adminWorldConfig?.setupFamiliarityLabel || "伊都キャンパスはどれくらい慣れていますか？";
  const effectiveSetupExplorationLabel = adminWorldConfig?.setupExplorationLabel || "新しい場所に来たとき、どうしますか？";
  const effectiveSetupExpectationLabel = adminWorldConfig?.setupExpectationLabel || "この体験に何を期待しますか？";
  const effectiveSetupDurationLabel = adminWorldConfig?.setupDurationLabel || "どれくらいで回りたいですか？";
  const effectiveSetupDurationHintShort = adminWorldConfig?.setupDurationHintShort || "短い時間";
  const effectiveSetupDurationHintLong = adminWorldConfig?.setupDurationHintLong || "じっくり";
  const effectiveSetupResearchNote = adminWorldConfig?.setupResearchNote || "※ 研究データとして活用します";
  const effectiveSetupStartButton = adminWorldConfig?.setupStartButton || "体験をつくる";
  const isSetupFormComplete =
    isUserTypeAnswered &&
    isFamiliarityAnswered &&
    isExplorationStyleAnswered &&
    isExperienceExpectationAnswered &&
    isDurationAnswered;

  const effectivePreparingTitle = adminWorldConfig?.preparingTitle || "あなたにあった\n体験を整えています";
  const latestGenerationStepLabel =
    generatedQuestSteps.length > 0 ? generatedQuestSteps[generatedQuestSteps.length - 1]?.label : undefined;
  const effectivePreparingBody = isGeneratingQuest
    ? `${adminWorldConfig?.preparingBody || "伊都キャンパスの空気や流れに合わせて、\nこれから歩く物語を準備しています。"}\n現在: ${latestGenerationStepLabel ?? "条件を整理しています"}`
    : adminWorldConfig?.preparingBody || "伊都キャンパスの空気や流れに合わせて、\nこれから歩く物語を準備しています。";
  // ステップ演出テキスト（preparingVisibleStep 0→1→2 で段階的に進む）
  const preparingStepLabels: [string, string, string] = [
    adminWorldConfig?.preparingStatusDone || "条件を整理しています",
    adminWorldConfig?.preparingStatusProgress || "最初の場所を準備しています",
    adminWorldConfig?.preparingStatusPending || "体験の流れを整えています",
  ];
  const effectivePreparingStatusDone =
    preparingVisibleStep >= 1
      ? preparingStepLabels[0]
      : generatedQuest
        ? "あなたにあった体験を整えています"
        : preparingStepLabels[0];
  const effectivePreparingStatusProgress =
    preparingVisibleStep >= 2
      ? preparingStepLabels[1]
      : isGeneratingQuest
        ? latestGenerationStepLabel
          ? `${latestGenerationStepLabel}を処理中です`
          : preparingStepLabels[1]
        : adminWorldConfig?.preparingStatusProgress || "体験の流れを整えています";
  const effectivePreparingStatusPending =
    preparingVisibleStep >= 2
      ? preparingStepLabels[2]
      : adminWorldConfig?.preparingStatusPending || "最初の場所を準備しています";
  const effectivePreparingSkipButton = adminWorldConfig?.preparingSkipButton || "次へ";
  const effectivePreparingFooter = adminWorldConfig?.preparingFooter || "まもなく始まります";

  const readyStoryBrand = "TOMOSHIBI · 伊都キャンパス · CHAPTER 01";
  const readyStoryLeadDefault = "名前を解く旅";
  const generatedStoryName = normalizeText(generatedQuest?.generatedStoryName);
  // ヒーロー3行目は常に固定サブタイトル
  const readyStoryTone = "── 青柳の残したノート";
  // 1行目: ブランドラベル（小さいテキスト）
  const effectiveReadyChapterLabel = adminWorldConfig?.readyChapterLabel || readyStoryBrand;
  // 2行目: メインタイトル
  const effectiveReadyStoryLead =
    normalizeText(generatedQuest?.readyHeroLead) || adminWorldConfig?.readyHeroLead || adminWorldConfig?.title || readyStoryLeadDefault;
  const effectiveReadySummaryTitle =
    normalizeText(generatedQuest?.readySummaryTitle) || adminWorldConfig?.readySummaryTitle || "青柳の残したノート · はじめに";
  const effectiveReadyGeneratedStoryLabel = adminWorldConfig?.readyGeneratedStoryLabel || "STORY PREMISE";
  const effectiveReadyStartButton = adminWorldConfig?.readyStartButton || "物語を始める";
  const effectiveReadyTransitionTitle = adminWorldConfig?.readyTransitionTitle || "プロローグへ移動中";
  const effectiveReadyTransitionBody = adminWorldConfig?.readyTransitionBody || "物語の扉をひらいています";

  const effectivePrologueNarrationText = defaultPrologueNarrationText;
  const effectivePrologueCtaText = adminWorldConfig?.prologueCta || "最初の場所へ向かう";
  const effectiveEpilogueNarrationText = defaultEpilogueNarrationText;
  const effectiveEpilogueCtaText = adminWorldConfig?.epilogueCta || "体験を振り返る";
  const prologueNarrationPages = useMemo(
    () => splitNarrationIntoPages(effectivePrologueNarrationText),
    [effectivePrologueNarrationText],
  );
  const epilogueNarrationPages = useMemo(
    () => splitNarrationIntoPages(effectiveEpilogueNarrationText),
    [effectiveEpilogueNarrationText],
  );
  const prologueLastPageIndex = Math.max(prologueNarrationPages.length - 1, 0);
  const epilogueLastPageIndex = Math.max(epilogueNarrationPages.length - 1, 0);
  const safeProloguePageIndex = Math.min(prologuePageIndex, prologueLastPageIndex);
  const safeEpiloguePageIndex = Math.min(epiloguePageIndex, epilogueLastPageIndex);
  const currentPrologueNarrationText = prologueNarrationPages[safeProloguePageIndex] ?? "";
  const currentEpilogueNarrationText = epilogueNarrationPages[safeEpiloguePageIndex] ?? "";
  const hasNextProloguePage = safeProloguePageIndex < prologueLastPageIndex;
  const hasNextEpiloguePage = safeEpiloguePageIndex < epilogueLastPageIndex;
  const prologueCtaLabel = hasNextProloguePage ? "次のページへ" : prologueShowNote ? effectivePrologueCtaText : "ノートを開く";
  const epilogueCtaLabel = hasNextEpiloguePage ? "次のページへ" : effectiveEpilogueCtaText;

  const effectiveSpotMapInfoLine1 = adminWorldConfig?.spotMapInfoLine1 || currentStoryArcMeta.mapLead;
  const effectiveSpotMapInfoLine2 = adminWorldConfig?.spotMapInfoLine2 || currentStoryArcMeta.trivia;
  const effectiveSpotMapArrivedLabel = adminWorldConfig?.spotMapArrivedLabel || "このスポットに到着した";
  const effectiveSpotMapRestartLabel = adminWorldConfig?.spotMapRestartLabel || "最初のスポットから始める";
  const effectiveSpotSpeakerBadge = adminWorldConfig?.spotSpeakerBadge || "案内役";

  const effectiveFeedbackHeroTitleLine1 = adminWorldConfig?.feedbackHeroTitleLine1 || "体験を終えて";
  const effectiveFeedbackHeroTitleLine2 = adminWorldConfig?.feedbackHeroTitleLine2 || "どう感じましたか？";
  const effectiveFeedbackHeroSubtitleLine1 =
    adminWorldConfig?.feedbackHeroSubtitleLine1 || "最後に、今回の体験について教えてください。";
  const effectiveFeedbackHeroSubtitleLine2 = adminWorldConfig?.feedbackHeroSubtitleLine2 || "今後の改善に活かします。";
  const effectiveFeedbackQuestionOverall =
    adminWorldConfig?.feedbackQuestionOverall || "体験全体の満足度を教えてください";
  const effectiveFeedbackQuestionGuidance =
    adminWorldConfig?.feedbackQuestionGuidance || "体験の内容はわかりやすかったですか？";
  const effectiveFeedbackQuestionCampus =
    adminWorldConfig?.feedbackQuestionCampus || "物語を通じて、伊都キャンパスへの興味が高まりましたか？";
  const effectiveFeedbackQuestionVisitIntent =
    adminWorldConfig?.feedbackQuestionVisitIntent || "体験後、実際にこのスポットを訪れてみたいと思いますか？";
  const effectiveFeedbackQuestionExpectation =
    adminWorldConfig?.feedbackQuestionExpectation || "この体験は、始める前の期待通りでしたか？";
  const effectiveFeedbackQuestionReuse =
    adminWorldConfig?.feedbackQuestionReuse || "また体験したいと思いますか？";
  const effectiveFeedbackQuestionComment = adminWorldConfig?.feedbackQuestionComment || "自由意見";
  const effectiveFeedbackCommentNote =
    adminWorldConfig?.feedbackCommentNote || "※ 印象に残ったこと・改善してほしいこと・その他なんでも";
  const effectiveFeedbackSubmitButton = adminWorldConfig?.feedbackSubmitButton || "送信して終了する";
  const canSubmitFeedback =
    feedbackOverallRating !== null &&
    feedbackGuidanceScore !== null &&
    feedbackCampusScore !== null &&
    feedbackVisitIntentScore !== null &&
    feedbackExpectationScore !== null &&
    feedbackReuseIntent !== null;
  const effectiveFeedbackThanks = adminWorldConfig?.feedbackThanks || "Thank you for your voice";

  const prologueNarrationChars = useMemo(() => Array.from(currentPrologueNarrationText), [currentPrologueNarrationText]);
  const epilogueNarrationChars = useMemo(() => Array.from(currentEpilogueNarrationText), [currentEpilogueNarrationText]);
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
    () => `虫食いだらけの手紙。各スポットのクイズを解くたびに断片が一つずつ現れ、最後のフーコーの振り子で手紙の全文が解読される。`,
    [],
  );
  const readyStorySynopsis = useMemo(() => {
    const generatedSummaryText = normalizeText(generatedQuest?.readySummaryText);
    if (generatedSummaryText) return generatedSummaryText;
    if (adminWorldConfig?.readySummaryText) return adminWorldConfig.readySummaryText;
    if (adminWorldConfig?.description) return adminWorldConfig.description;

    return `このキャンパスの施設には、やたらと読めない名前がついている。気になって調べたら、全部に理由があった。7つの場所を順番に巡ってみてください。── 青柳`;
  }, [adminWorldConfig?.description, adminWorldConfig?.readySummaryText, generatedQuest?.readySummaryText]);
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
  useEffect(() => {
    if (screen !== "ready") return;
    console.groupCollapsed("[kyudai-mvp] ready.render.binding");
    console.info("generatedQuest.raw", generatedQuest);
    console.info("effective.ready", {
      generatedStoryName,
      effectiveReadyStoryLead,
      effectiveReadySummaryTitle,
      readyStorySynopsis,
      readyStoryTone,
      selectedUserType,
      selectedFamiliarity,
      selectedDuration,
    });
    console.groupEnd();
  }, [
    screen,
    generatedQuest,
    generatedStoryName,
    effectiveReadyStoryLead,
    effectiveReadySummaryTitle,
    readyStorySynopsis,
    readyStoryTone,
    selectedUserType,
    selectedFamiliarity,
    selectedDuration,
  ]);
  const readyInputItems = useMemo<ReadyInputItem[]>(
    () => [
      {
        id: "ready-user",
        icon: "school-outline",
        label: "対象",
        value: "新入生",
      },
      {
        id: "ready-familiarity",
        icon: "time-outline",
        label: "所要時間",
        value: "15〜20分",
      },
      {
        id: "ready-duration",
        icon: "location-outline",
        label: "スポット",
        value: "7地点",
      },
    ],
    [],
  );
  const readyTips = useMemo<ReadyTip[]>(
    () => [
      {
        id: "ready-tip-a",
        icon: "book-outline",
        title: "青柳の残したノートを読む",
        body: "各スポットに青柳の書き込みがある。読むと次の場所への手がかりがわかる。",
      },
      {
        id: "ready-tip-b",
        icon: "ear-outline",
        title: "名前に耳を澄ます",
        body: "プレートの文字に注目。読めない名前には、必ず理由がある。",
      },
      {
        id: "ready-tip-c",
        icon: "lock-closed-outline",
        title: "最後のページは7箇所目で",
        body: "青柳の残したノートの最後は封がされている。フーコーの振り子の前でだけ開ける約束。",
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

  const runQuestGeneration = async ({ moveToReady = true }: { moveToReady?: boolean } = {}) => {
    // APIを呼ばずにscenario.tsのデータをそのまま使う
    setReadySelectedSpotIndex(0);
    setCurrentSpotIndex(0);
    setIsExperienceCompleted(false);
    setSpotScenarioSegmentIndex(0);
    setSpotTypedCharCount(0);
    setIsSpotTypingDone(true);

    if (moveToReady) {
      setScreen("ready");
    }
    return true;
  };

  const handleSetupCreateExperiencePress = async () => {
    if (isGeneratingQuest) return;
    if (!isSetupFormComplete) return;
    ensureExperienceSession();
    setFeedbackOverallRating(null);
    setFeedbackGuidanceScore(null);
    setFeedbackCampusScore(null);
    setFeedbackVisitIntentScore(null);
    setFeedbackExpectationScore(null);
    setFeedbackReuseIntent(null);
    setFeedbackComment("");

    // Preparing 画面に遷移してステップ演出をリセット
    setPreparingVisibleStep(0);
    setScreen("preparing");

    // ステップ演出: 1500ms後にステップ2、3000ms後にステップ3へ
    const step2Timer = setTimeout(() => setPreparingVisibleStep(1), 1500);
    const step3Timer = setTimeout(() => setPreparingVisibleStep(2), 3000);

    // API完了と最低4500ms表示を並列待機
    const minDisplayPromise = new Promise<void>((resolve) => setTimeout(resolve, 4500));
    await Promise.all([runQuestGeneration({ moveToReady: false }), minDisplayPromise]);

    clearTimeout(step2Timer);
    clearTimeout(step3Timer);

    setScreen("ready");
  };

  const handleLandingStartWithoutLoginPress = () => {
    if (isLandingGoogleSigningIn) return;
    setLandingAuthError(null);
    setScreen("setup");
  };

  const runGoogleSignInFlow = async (): Promise<{ ok: boolean; errorMessage?: string }> => {
    const auth = getFirebaseClientAuth();
    if (!auth) {
      const missingKeys = getFirebaseMissingEnvKeys();
      const missing = missingKeys.length > 0 ? ` (${missingKeys.join(", ")})` : "";
      return { ok: false, errorMessage: `Firebase設定が不足しています${missing}` };
    }

    if (auth.currentUser?.uid && !auth.currentUser.isAnonymous) {
      setFirebaseUid(auth.currentUser.uid);
      return { ok: true };
    }

    if (Platform.OS !== "web") {
      return { ok: false, errorMessage: "GoogleログインはWeb版でのみ利用できます。" };
    }

    setIsLandingGoogleSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      setFirebaseUid(result.user.uid);
      return { ok: true };
    } catch (error) {
      const message = getFirebaseAuthErrorMessage(error);
      return message ? { ok: false, errorMessage: message } : { ok: false };
    } finally {
      setIsLandingGoogleSigningIn(false);
    }
  };

  const handleLandingGoogleSignInPress = async () => {
    if (isLandingGoogleSigningIn) return;
    setLandingAuthError(null);
    const result = await runGoogleSignInFlow();
    if (!result.ok) {
      if (result.errorMessage) setLandingAuthError(result.errorMessage);
      return;
    }
    setHeaderAuthMenuError(null);
    setIsHeaderAuthMenuOpen(false);
    setScreen("setup");
  };

  const handleHeaderGoogleSignInPress = async () => {
    if (isLandingGoogleSigningIn || isFirebaseSignedIn) return;
    setHeaderAuthMenuError(null);
    const result = await runGoogleSignInFlow();
    if (!result.ok) {
      if (result.errorMessage) setHeaderAuthMenuError(result.errorMessage);
      return;
    }
    setLandingAuthError(null);
    setIsHeaderAuthMenuOpen(false);
  };

  const handleHeaderSignOutPress = async () => {
    if (isHeaderAuthSigningOut || isLandingGoogleSigningIn || !isFirebaseSignedIn) return;
    setHeaderAuthMenuError(null);
    const auth = getFirebaseClientAuth();
    if (!auth) {
      const missingKeys = getFirebaseMissingEnvKeys();
      const missing = missingKeys.length > 0 ? ` (${missingKeys.join(", ")})` : "";
      setHeaderAuthMenuError(`Firebase設定が不足しています${missing}`);
      return;
    }

    setIsHeaderAuthSigningOut(true);
    try {
      await signOut(auth);
      setLandingAuthError(null);
      setIsHeaderAuthMenuOpen(false);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0 ? error.message : "ログアウトに失敗しました。";
      setHeaderAuthMenuError(message);
    } finally {
      setIsHeaderAuthSigningOut(false);
    }
  };

  const handleReadyStartPress = async () => {
    if (isReadyTransitioning) return;
    if (isGeneratingQuest) return;
    if (!generatedQuest) {
      setScreen("preparing");
      const generated = await runQuestGeneration({ moveToReady: true });
      if (!generated) return;
    }
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

  useEffect(() => {
    if (screen !== "ready") return;
    if (generatedQuest) return;
    if (isGeneratingQuest) return;

    void runQuestGeneration({ moveToReady: false });
  }, [generatedQuest, isGeneratingQuest, runQuestGeneration, screen]);

  const handlePrologueNarrationPress = () => {
    if (screen !== "prologue") return;
    if (isPrologueTypingDone) {
      if (hasNextProloguePage) {
        setProloguePageIndex((prev) => Math.min(prev + 1, prologueLastPageIndex));
      }
      return;
    }
    if (Date.now() < prologueSkipEnabledAtRef.current) return;
    prologueEntryAnim.stopAnimation();
    prologueTypingAnim.stopAnimation();
    prologueEntryAnim.setValue(1);
    prologueTypingAnim.setValue(prologueNarrationChars.length);
    setIsPrologueTypingDone(true);
  };

  const handleEpilogueNarrationPress = () => {
    if (screen !== "epilogue") return;
    if (isEpilogueTypingDone) {
      if (hasNextEpiloguePage) {
        setEpiloguePageIndex((prev) => Math.min(prev + 1, epilogueLastPageIndex));
      }
      return;
    }
    if (Date.now() < epilogueSkipEnabledAtRef.current) return;
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

    // 物語終了 → noteAfterがあれば表示、なければクイズへ
    if (currentSpot.aoyagiNoteAfter) {
      setSpotPhase('noteAfter');
    } else {
      setSpotPhase('quiz');
      setQuizSelectedLabel(null);
    }
  };

  const handleQuizSelect = (label: 'A' | 'B' | 'C' | 'D') => {
    if (quizSelectedLabel !== null) return;
    setQuizSelectedLabel(label);
    if (label === currentSpot.quiz.correctLabel) {
      setQuizCorrectCount((prev) => prev + 1);
    }
    setSpotPhase('quizResult');
  };

  const handleQuizContinue = () => {
    if (safeCurrentSpotIndex >= spots.length - 1) {
      runFlowTransition({
        title: "物語を結んでいます",
        body: "エピローグへ進みます",
        toScreen: "epilogue",
        onNavigate: () => setIsExperienceCompleted(true),
      });
      return;
    }
    setSpotPhase('nextHintStory');
  };

  const handleNextHintStoryContinue = () => {
    if (safeCurrentSpotIndex >= spots.length - 1) return;
    runFlowTransition({
      title: "次のルートを準備中",
      body: "マップへ戻ります",
      toScreen: "map",
      onNavigate: () => setCurrentSpotIndex((prev) => clampSpotIndex(prev + 1, spots.length)),
    });
  };

  const handleSpotScenarioTextPress = () => {
    if (screen !== "spotArrival" || spotPhase !== 'story') return;
    if (!isSpotTypingDone) {
      setSpotTypedCharCount(spotScenarioChars.length);
      setIsSpotTypingDone(true);
      return;
    }
    handleSpotScenarioNextPress();
  };

  const renderFlowTransitionOverlay = () => (
    <Animated.View style={[styles.mapScenarioTransitionOverlay, { pointerEvents: "auto" }, mapScenarioTransitionOverlayAnimatedStyle]}>
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
      setIsSubmittingFeedback(false);
      setShowFeedbackThankyou(true);
    }
  };

  const handleFeedbackThankyouClose = () => {
    setShowFeedbackThankyou(false);
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
    setGeneratedQuest(null);
    setGeneratedQuestSteps([]);
    setIsGeneratingQuest(false);
    setScreen("landing");
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
      savedScreen: screen,
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
          simulationInputs: {
            userType: selectedUserType,
            familiarity: selectedFamiliarity,
            duration: selectedDuration,
            explorationStyle: selectedExplorationStyle,
            experienceExpectation: selectedExperienceExpectation,
          },
        },
      },
      "*",
    );
  }, [
    adminWorldConfig,
    screen,
    selectedUserType,
    selectedFamiliarity,
    selectedDuration,
    selectedExplorationStyle,
    selectedExperienceExpectation,
  ]);

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
    if (screen === "landing") return;
    setLandingAuthError(null);
  }, [screen]);

  useEffect(() => {
    setIsHeaderAuthMenuOpen(false);
    setHeaderAuthMenuError(null);
  }, [screen]);

  useEffect(() => {
    const auth = getFirebaseClientAuth();
    if (!auth) {
      setFirebaseUid(null);
      setIsFirebaseSignedIn(false);
      setFirebaseAvatarUrl(null);
      setFirebaseDisplayName(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        setFirebaseUid(null);
        setIsFirebaseSignedIn(false);
        setFirebaseAvatarUrl(null);
        setFirebaseDisplayName(null);
        return;
      }

      setFirebaseUid(nextUser.uid);
      setIsFirebaseSignedIn(!nextUser.isAnonymous);
      setFirebaseAvatarUrl(nextUser.photoURL ?? null);
      setFirebaseDisplayName(nextUser.displayName ?? null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (screen !== "spotArrival") return;
    if (cameraPermission?.granted) return;
    void requestCameraPermission();
  }, [screen, cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    if (screen !== "spotArrival") return;
    setSpotScenarioSegmentIndex(0);
    setSpotPhase(currentSpot.aoyagiNote ? 'note' : 'story');
    setQuizSelectedLabel(null);
  }, [screen, currentSpot.id, currentSpot.aoyagiNote]);

  useEffect(() => {
    if (screen !== "spotArrival" || spotPhase !== 'story') return;

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
  }, [screen, currentSpot.id, spotScenarioSegmentIndex, spotScenarioChars.length, spotPhase]);

  useEffect(() => {
    if (screen === "setup") return;
    setIsUserTypeMenuOpen(false);
  }, [screen]);

  useEffect(() => {
    webMapErrorRef.current = webMapError;
  }, [webMapError]);

  useEffect(() => {
    readyWebMapErrorRef.current = readyWebMapError;
  }, [readyWebMapError]);

  useEffect(() => {
    if (screen !== "setup") return;
    setIsUserTypeAnswered(false);
    setIsFamiliarityAnswered(false);
    setIsExplorationStyleAnswered(false);
    setIsExperienceExpectationAnswered(false);
    setIsDurationAnswered(false);
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
    setProloguePageIndex(0);
    setPrologueShowNote(false);
  }, [screen, prologueNarrationPages.length]);

  useEffect(() => {
    if (screen !== "epilogue") return;
    setEpiloguePageIndex(0);
  }, [screen, epilogueNarrationPages.length]);

  useEffect(() => {
    if (screen !== "prologue") return;
    // Ignore touch carry-over from the transition CTA so narration doesn't auto-skip.
    prologueSkipEnabledAtRef.current = Date.now() + (safeProloguePageIndex === 0 ? 700 : 220);
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
  }, [
    screen,
    safeProloguePageIndex,
    prologueEntryAnim,
    prologueTypingAnim,
    prologueTypingDuration,
  ]);

  useEffect(() => {
    if (screen !== "epilogue") return;
    // Ignore touch carry-over from the transition CTA so narration doesn't auto-skip.
    epilogueSkipEnabledAtRef.current = Date.now() + (safeEpiloguePageIndex === 0 ? 700 : 220);
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
  }, [
    screen,
    safeEpiloguePageIndex,
    epilogueEntryAnim,
    epilogueTypingAnim,
    epilogueTypingDuration,
  ]);

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
    setReadySelectedSpotIndex((prev) => clampSpotIndex(prev, spots.length));
  }, [spots.length]);

  useEffect(() => {
    if (!GOOGLE_MAPS_WEB_API_KEY || spots.length < 2) {
      setReadyRouteDirectionsCoordinates(null);
      return;
    }

    let cancelled = false;
    const loadRoutePreview = async () => {
      try {
        const route = await fetchRouteDirectionsForSpots(spots);
        if (cancelled) return;
        setReadyRouteDirectionsCoordinates(route);
      } catch {
        if (!cancelled) {
          setReadyRouteDirectionsCoordinates(null);
        }
      }
    };

    void loadRoutePreview();
    return () => {
      cancelled = true;
    };
  }, [spots]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (screen !== "ready") return;
    if (useMockMapBackground) return;

    const target = spots[safeReadySelectedSpotIndex]?.coordinate;
    if (!target) return;

    const timer = setTimeout(() => {
      readyMapRef.current?.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: Math.max(0.006, readyMapRegion.latitudeDelta * 0.52),
          longitudeDelta: Math.max(0.006, readyMapRegion.longitudeDelta * 0.52),
        },
        520,
      );
    }, 70);

    return () => clearTimeout(timer);
  }, [
    readyMapRegion.latitudeDelta,
    readyMapRegion.longitudeDelta,
    safeReadySelectedSpotIndex,
    screen,
    spots,
    useMockMapBackground,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (screen === "ready" && !useMockMapBackground) return;

    readyWebSpotMarkersRef.current.forEach((marker) => marker.setMap(null));
    readyWebSpotMarkersRef.current = [];
    if (readyWebRoutePolylineRef.current) {
      readyWebRoutePolylineRef.current.setMap(null);
      readyWebRoutePolylineRef.current = null;
    }
    readyWebMapInstanceRef.current = null;
    readyWebBoundHostRef.current = null;
  }, [screen, useMockMapBackground]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (screen !== "ready") return;
    if (useMockMapBackground) return;

    let cancelled = false;
    let isRendering = false;
    const previousAuthFailureHandler = (globalThis as any).gm_authFailure;
    (globalThis as any).gm_authFailure = () => {
      if (cancelled) return;
      setReadyWebMapError("Google Maps課金設定エラーです。Google Cloud設定を確認してください。");
    };

    const renderReadyWebMap = async () => {
      if (cancelled || isRendering) return;
      isRendering = true;
      setReadyWebMapError(null);

      if (!GOOGLE_MAPS_WEB_API_KEY) {
        setReadyWebMapError("Google Maps APIキーが設定されていません。");
        isRendering = false;
        return;
      }

      try {
        const googleMaps = await ensureGoogleMapsConstructors();
        if (cancelled) return;

        const host = readyWebMapHostRef.current;
        if (!host) {
          setReadyWebMapError("Googleマップを初期化しています。");
          return;
        }
        const hostHasSize = await waitForHostToHaveSize(host);
        if (!hostHasSize) {
          setReadyWebMapError("Googleマップ描画領域を初期化しています。");
          return;
        }

        const shouldRecreateMap =
          !readyWebMapInstanceRef.current || readyWebBoundHostRef.current !== host;

        if (shouldRecreateMap) {
          readyWebSpotMarkersRef.current.forEach((marker) => marker.setMap(null));
          readyWebSpotMarkersRef.current = [];
          if (readyWebRoutePolylineRef.current) {
            readyWebRoutePolylineRef.current.setMap(null);
            readyWebRoutePolylineRef.current = null;
          }

          readyWebMapInstanceRef.current = new googleMaps.Map(host, {
            center: {
              lat: readyMapRegion.latitude,
              lng: readyMapRegion.longitude,
            },
            zoom: 16,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "none",
            styles: [
              { featureType: "poi", stylers: [{ saturation: -100 }, { lightness: 16 }] },
              { featureType: "transit", stylers: [{ saturation: -100 }] },
              { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            ],
          });
          readyWebBoundHostRef.current = host;
        }

        const map = readyWebMapInstanceRef.current;
        if (!map) {
          setReadyWebMapError("Googleマップを表示できませんでした。");
          return;
        }

        if (googleMaps.event?.trigger) {
          googleMaps.event.trigger(map, "resize");
        }

        readyWebSpotMarkersRef.current.forEach((marker) => marker.setMap(null));
        readyWebSpotMarkersRef.current = [];

        if (readyWebRoutePolylineRef.current) {
          readyWebRoutePolylineRef.current.setMap(null);
          readyWebRoutePolylineRef.current = null;
        }

        if (readyRouteCoordinates.length > 1) {
          readyWebRoutePolylineRef.current = new googleMaps.Polyline({
            map,
            path: readyRouteCoordinates.map((coordinate) => ({
              lat: coordinate.latitude,
              lng: coordinate.longitude,
            })),
            geodesic: true,
            strokeColor: "#f5ce53",
            strokeOpacity: 0.95,
            strokeWeight: 4,
          });
        }

        readyWebSpotMarkersRef.current = spots.map((spot, index) => {
          const isSelected = index === safeReadySelectedSpotIndex;
          const isStart = index === 0;
          const isGoal = index === spots.length - 1;
          const markerLabel = isStart ? "S" : isGoal ? "G" : `${index + 1}`;

          const marker = new googleMaps.Marker({
            map,
            position: { lat: spot.coordinate.latitude, lng: spot.coordinate.longitude },
            title: spot.name,
            zIndex: isSelected ? 50 : 20,
            label: {
              text: markerLabel,
              color: "#f9f9f7",
              fontSize: "11px",
              fontWeight: "700",
            },
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: isSelected ? 11 : 9,
              fillColor: isStart ? "#475464" : isGoal ? "#745c00" : "#8f979d",
              fillOpacity: isSelected ? 1 : 0.88,
              strokeColor: isSelected ? "#f5ce53" : isStart ? "#33414f" : isGoal ? "#4e3c00" : "#6f777d",
              strokeWeight: isSelected ? 3 : 1.6,
            },
          });
          marker.addListener("click", () => {
            if (cancelled) return;
            setReadySelectedSpotIndex(index);
          });
          return marker;
        });

        const target = spots[safeReadySelectedSpotIndex]?.coordinate;
        if (allSpotCoordinates.length > 1) {
          const bounds = new googleMaps.LatLngBounds();
          allSpotCoordinates.forEach((coordinate) => {
            bounds.extend({ lat: coordinate.latitude, lng: coordinate.longitude });
          });
          map.fitBounds(bounds, 52);
          if (target) {
            map.panTo({ lat: target.latitude, lng: target.longitude });
          }
        } else if (target) {
          map.setCenter({ lat: target.latitude, lng: target.longitude });
          map.setZoom(16);
        }

        const mapReady = await new Promise<boolean>((resolve) => {
          let settled = false;
          let timeoutId: ReturnType<typeof setTimeout> | null = null;
          const settle = (ready: boolean) => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve(ready);
          };

          const idleListener = googleMaps.event.addListenerOnce(map, "idle", () => settle(true));
          const tilesListener = googleMaps.event.addListenerOnce(map, "tilesloaded", () => settle(true));
          timeoutId = setTimeout(() => {
            googleMaps.event.removeListener(idleListener);
            googleMaps.event.removeListener(tilesListener);
            settle(false);
          }, 1800);
        });

        if (cancelled) return;

        if (!mapReady) {
          setReadyWebMapError("Googleマップ描画を再試行しています。");
        } else {
          setReadyWebMapError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("BillingNotEnabled")) {
          setReadyWebMapError("Google Maps課金設定エラーです。Google Cloud設定を確認してください。");
        } else {
          setReadyWebMapError("Googleマップの初期化に失敗しました。再試行してください。");
        }
      } finally {
        isRendering = false;
      }
    };

    void renderReadyWebMap();
    const retryTimer = setInterval(() => {
      if (cancelled) return;
      if (!readyWebMapInstanceRef.current || readyWebMapErrorRef.current) {
        void renderReadyWebMap();
      }
    }, 1800);

    return () => {
      cancelled = true;
      clearInterval(retryTimer);
      (globalThis as any).gm_authFailure = previousAuthFailureHandler;
    };
  }, [
    allSpotCoordinates,
    readyMapRegion.latitude,
    readyMapRegion.longitude,
    readyRouteCoordinates,
    safeReadySelectedSpotIndex,
    screen,
    spots,
    useMockMapBackground,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (screen === "map" && !useMockMapBackground) return;

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
    mapWebInstanceRef.current = null;
    mapWebBoundHostRef.current = null;
  }, [screen, useMockMapBackground]);

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
    let isRendering = false;
    const previousAuthFailureHandler = (globalThis as any).gm_authFailure;
    (globalThis as any).gm_authFailure = () => {
      if (cancelled) return;
      setWebMapError("Google Maps課金設定エラーです。Google Cloud設定を確認してください。");
    };

    const renderWebMap = async () => {
      if (cancelled || isRendering) return;
      isRendering = true;
      setWebMapError(null);
      if (!GOOGLE_MAPS_WEB_API_KEY) {
        setWebMapError("Google Maps APIキーが設定されていません。");
        isRendering = false;
        return;
      }

      try {
        const googleMaps = await ensureGoogleMapsConstructors();
        if (cancelled) return;

        const host = mapWebHostRef.current;
        if (!host) {
          setWebMapError("Googleマップを初期化しています。");
          return;
        }
        const hostHasSize = await waitForHostToHaveSize(host);
        if (!hostHasSize) {
          setWebMapError("Googleマップ描画領域を初期化しています。");
          return;
        }

        const shouldRecreateMap = !mapWebInstanceRef.current || mapWebBoundHostRef.current !== host;
        if (shouldRecreateMap) {
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

          mapWebInstanceRef.current = new googleMaps.Map(host, {
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
          mapWebBoundHostRef.current = host;
        }

        const map = mapWebInstanceRef.current;
        if (!map) {
          setWebMapError("Googleマップを表示できませんでした。");
          return;
        }

        if (googleMaps.event?.trigger) {
          googleMaps.event.trigger(map, "resize");
        }

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

        const resolveWalkingPath = (
          origin: Coordinate,
          destination: Coordinate,
          waypoints: Coordinate[] = [],
        ): Array<{ lat: number; lng: number }> => {
          return [toLatLngLiteral(origin), ...waypoints.map(toLatLngLiteral), toLatLngLiteral(destination)];
        };

        const futureWaypoints = spots.slice(safeCurrentSpotIndex + 1, -1).map((spot) => spot.coordinate);
        const wholePath =
          safeCurrentSpotIndex >= spots.length - 1
            ? [toLatLngLiteral(currentSpot.coordinate)]
            : resolveWalkingPath(currentSpot.coordinate, goalSpot.coordinate, futureWaypoints);
        const activePath = resolveWalkingPath(routeOrigin, currentSpot.coordinate);

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
        map.panBy(0, -130);

        const mapReady = await new Promise<boolean>((resolve) => {
          let settled = false;
          let timeoutId: ReturnType<typeof setTimeout> | null = null;
          const settle = (ready: boolean) => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve(ready);
          };

          const idleListener = googleMaps.event.addListenerOnce(map, "idle", () => settle(true));
          const tilesListener = googleMaps.event.addListenerOnce(map, "tilesloaded", () => settle(true));
          timeoutId = setTimeout(() => {
            googleMaps.event.removeListener(idleListener);
            googleMaps.event.removeListener(tilesListener);
            settle(false);
          }, 1800);
        });

        if (cancelled) return;

        if (!mapReady) {
          setWebMapError("Googleマップ描画を再試行しています。");
        } else {
          setWebMapError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("BillingNotEnabled")) {
          setWebMapError("Google Maps課金設定エラーです。Google Cloud設定を確認してください。");
        } else {
          setWebMapError("Googleマップの初期化に失敗しました。再試行してください。");
        }
      } finally {
        isRendering = false;
      }
    };

    void renderWebMap();
    const retryTimer = setInterval(() => {
      if (cancelled) return;
      if (!mapWebInstanceRef.current || webMapErrorRef.current) {
        void renderWebMap();
      }
    }, 1800);

    return () => {
      cancelled = true;
      clearInterval(retryTimer);
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

  const resumableScreens: AppScreen[] = ["prologue", "map", "spotArrival", "epilogue"];

  const handleHomeButtonPress = () => {
    setShowHomeConfirmModal(true);
  };

  const handleHomeConfirm = () => {
    setShowHomeConfirmModal(false);
    setScreen("landing");
  };

  const handleHomeCancel = () => {
    setShowHomeConfirmModal(false);
  };

  const resumeDraft = useMemo((): PersistedFlowDraft | null => {
    if (Platform.OS !== "web" || typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(FLOW_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const draft = parsed as PersistedFlowDraft;
      const hasProgress =
        (typeof draft.currentSpotIndex === "number" && draft.currentSpotIndex > 0) ||
        (draft.savedScreen != null && resumableScreens.includes(draft.savedScreen));
      return hasProgress ? draft : null;
    } catch {
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const renderHeaderAuthBadge = () => {
    const accessibleLabel = isFirebaseSignedIn
      ? `ログイン中: ${firebaseDisplayName ?? "Googleユーザー"}`
      : "ゲストで利用中";
    const isHeaderAuthActionBusy = isLandingGoogleSigningIn || isHeaderAuthSigningOut;
    const headerAuthButtonLabel = isHeaderAuthActionBusy
      ? isFirebaseSignedIn
        ? "ログアウト中..."
        : "Googleログイン中..."
      : isFirebaseSignedIn
        ? "ログアウト"
        : "Googleでログイン";

    return (
      <View style={styles.headerAuthMenuAnchor}>
        <Pressable
          accessibilityLabel={accessibleLabel}
          accessibilityRole="button"
          onPress={() => {
            setHeaderAuthMenuError(null);
            setIsHeaderAuthMenuOpen((prev) => !prev);
          }}
          style={({ pressed }) => [styles.headerAuthBadge, pressed && styles.pressed]}
        >
          {isFirebaseSignedIn && firebaseAvatarUrl ? (
            <Image source={{ uri: firebaseAvatarUrl }} style={styles.headerAuthBadgeAvatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={26} color={palette.onBackground} />
          )}
          <View
            style={[
              styles.headerAuthBadgeStatusDot,
              isFirebaseSignedIn ? styles.headerAuthBadgeStatusDotSignedIn : styles.headerAuthBadgeStatusDotGuest,
            ]}
          />
        </Pressable>

        {isHeaderAuthMenuOpen ? (
          <View style={styles.headerAuthMenuPanel}>
            <Text style={styles.headerAuthMenuStatusText}>{accessibleLabel}</Text>
            <Pressable
              onPress={isFirebaseSignedIn ? handleHeaderSignOutPress : handleHeaderGoogleSignInPress}
              disabled={isHeaderAuthActionBusy}
              style={({ pressed }) => [
                styles.headerAuthMenuButton,
                isHeaderAuthActionBusy ? styles.headerAuthMenuButtonDisabled : null,
                pressed && !isHeaderAuthActionBusy ? styles.pressed : null,
              ]}
            >
              {isHeaderAuthActionBusy ? (
                <ActivityIndicator size="small" color={palette.onDarkButton} />
              ) : isFirebaseSignedIn ? (
                <Ionicons
                  name="log-out-outline"
                  size={16}
                  color={palette.onDarkButton}
                />
              ) : (
                <Ionicons
                  name="logo-google"
                  size={16}
                  color={palette.onDarkButton}
                />
              )}
              <Text
                style={[
                  styles.headerAuthMenuButtonText,
                  isHeaderAuthActionBusy ? styles.headerAuthMenuButtonTextDisabled : null,
                ]}
              >
                {headerAuthButtonLabel}
              </Text>
            </Pressable>
            {headerAuthMenuError ? (
              <Text style={styles.headerAuthMenuErrorText}>{headerAuthMenuError}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

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
              {effectivePreparingTitle}
            </Text>
            <Text style={styles.preparingBody}>{effectivePreparingBody}</Text>
          </View>

          <View style={[styles.preparingStatusWrap, { width: Math.min(contentWidth, 300) }]}>
            <View style={styles.statusRow}>
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={palette.tertiaryContainer}
              />
              <Text style={styles.statusDoneText}>{effectivePreparingStatusDone}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusInProgressCircle}>
                <Animated.View style={[styles.statusInProgressCore, preparingStatusCoreAnimatedStyle]} />
              </View>
              <Text style={styles.statusProgressText}>{effectivePreparingStatusProgress}</Text>
            </View>

            <View style={[styles.statusRow, styles.statusPendingRow]}>
              <View style={styles.statusPendingCircle} />
              <Text style={styles.statusPendingText}>{effectivePreparingStatusPending}</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, preparingProgressAnimatedStyle]} />
            </View>

            {generatedQuestSteps.length > 0 ? (
              <Text style={styles.preparingStepSummary}>
                最終更新: {generatedQuestSteps[generatedQuestSteps.length - 1]?.label}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.preparingFooter}>
          <Text style={styles.preparingFooterText}>
            {effectivePreparingFooter}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "ready") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.readyTopBar}>
          <View style={[styles.topBarInner, { width: contentWidth }]}>
            <View style={styles.headerSideSpacer} />
            <View style={styles.brandRow}>
              <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
            </View>
            {renderHeaderAuthBadge()}
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
              <Text style={styles.readyChapterLabel}>{effectiveReadyChapterLabel}</Text>
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
              <Text style={styles.readySummaryTitle}>{effectiveReadySummaryTitle}</Text>
            </View>
            <Text style={styles.readySummaryText}>{readyStorySynopsis}</Text>
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

            <View style={styles.readyMapPreviewCard}>
              <View style={styles.readyMapPreviewHeader}>
                <Text style={styles.readyMapPreviewTitle}>ROUTE MAP (API)</Text>
                <Text style={styles.readyMapPreviewMeta}>
                  {`${String(safeReadySelectedSpotIndex + 1).padStart(2, "0")} ${readySelectedSpot.name}`}
                </Text>
              </View>
              <View style={styles.readyMapPreviewCanvas}>
                {useMockMapBackground ? (
                  <View style={styles.readyMapPreviewMock}>
                    <Text style={styles.readyMapPreviewMockText}>マッププレビューは省略表示中です</Text>
                  </View>
                ) : Platform.OS === "web" ? (
                  <>
                    {createElement("div", {
                      ref: readyWebMapHostRef,
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
                    {readyWebMapError ? (
                      <View style={styles.readyMapPreviewFallbackBadge}>
                        <Text style={styles.readyMapPreviewFallbackBadgeText}>{readyWebMapError}</Text>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <MapView
                    ref={readyMapRef}
                    key={`ready-map-${spots.map((spot) => spot.id).join("-")}`}
                    style={styles.readyMapPreviewMap}
                    provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                    initialRegion={readyMapRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    showsCompass={false}
                    showsScale={false}
                  >
                    {readyRouteCoordinates.length > 1 ? (
                      <Polyline
                        coordinates={readyRouteCoordinates}
                        strokeColor="#f5ce53"
                        strokeWidth={4}
                      />
                    ) : null}
                    {spots.map((spot, index) => {
                      const isSelected = index === safeReadySelectedSpotIndex;
                      const isStart = index === 0;
                      const isGoal = index === spots.length - 1;
                      const markerLabel = isStart ? "S" : isGoal ? "G" : `${index + 1}`;
                      return (
                        <Marker
                          key={`ready-spot-${spot.id}`}
                          coordinate={spot.coordinate}
                          title={spot.name}
                          onPress={() => setReadySelectedSpotIndex(index)}
                        >
                          <View style={styles.mapSpotMarkerWrap}>
                            <View
                              style={[
                                styles.mapSpotPin,
                                isStart ? styles.mapSpotPinStart : isGoal ? styles.mapSpotPinGoal : styles.mapSpotPinMuted,
                                isSelected ? styles.mapSpotPinActiveTargetRing : null,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.mapSpotPinText,
                                  isStart || isGoal
                                    ? styles.mapSpotPinTextRole
                                    : isSelected
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

                <View pointerEvents="none" style={styles.readyMapCenterPinWrap}>
                  <View style={styles.readyMapCenterPinHalo} />
                  <Ionicons name="location" size={30} color="#f5ce53" />
                  <View style={styles.readyMapCenterPinCore} />
                </View>
              </View>
              <Text style={styles.readyMapPreviewHint}>下のスポットカードを選ぶと、地図中心ピンへフォーカスします。</Text>
            </View>

            <View style={styles.readyTimelineWrap}>
              <View style={styles.readyTimelineLine} />
              {spots.map((spot, index) => (
                <Pressable
                  key={spot.id}
                  onPress={() => {
                    setMapFocusSpotIndex(index);
                    setScreen("map");
                  }}
                  style={({ pressed }) => [
                    styles.readyTimelineItem,
                    index === spots.length - 1 ? styles.readyTimelineItemLast : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View
                    style={[
                      styles.readyTimelineDot,
                      index === safeReadySelectedSpotIndex ? styles.readyTimelineDotActive : null,
                    ]}
                  />
                  <View
                    style={[
                      styles.readyTimelineCard,
                      index === safeReadySelectedSpotIndex ? styles.readyTimelineCardActive : null,
                    ]}
                  >
                    <View style={styles.readyTimelineMetaRow}>
                      <Text style={styles.readyTimelineIndex}>{String(index + 1).padStart(2, "0")}</Text>
                      <View style={styles.readyTimelineBeatTag}>
                        <Text style={styles.readyTimelineBeatTagText}>
                          {(storyArcMetaMap[spot.id] ?? fallbackStoryArcMeta).phase}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.readyTimelineName}>{spot.name}</Text>
                    <Text style={styles.readyTimelineBeat}>
                      {(storyArcMetaMap[spot.id] ?? fallbackStoryArcMeta).beat}
                    </Text>
                    <Text style={styles.readyTimelineDesc}>{generatedSpotOverviewMap[spot.id] || readySpotOverviewMap[spot.id]}</Text>
                    <View style={styles.readyTimelineMapHint}>
                      <Ionicons name="map-outline" size={12} color={palette.onSurfaceVariant} />
                      <Text style={styles.readyTimelineMapHintText}>マップで確認</Text>
                    </View>
                  </View>
                </Pressable>
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

          <Animated.View style={[{ width: readySectionWidth, alignItems: "center", paddingTop: 32, paddingBottom: 8, gap: 8 }, readyCardsAnimatedStyle]}>
            <Text style={[styles.footerCopy, { textAlign: "center", textTransform: "none", letterSpacing: 0.4, fontSize: 12, color: palette.onSurfaceVariant }]}>
              TOMOSHIBI — 見過ごしていた景色に、あなただけの物語が宿る。
            </Text>
            <Text style={[styles.footerCopy, { textAlign: "center", textTransform: "none", letterSpacing: 0.2, fontSize: 10, color: palette.outlineVariant }]}>
              ※ 登場人物「青柳」はフィクションです
            </Text>
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
              {isReadyTransitioning ? "物語を開いています" : effectiveReadyStartButton}
            </Text>
            <Ionicons name="arrow-forward" size={22} color={palette.onDarkButton} />
          </Pressable>
        </View>

        {isReadyTransitioning ? (
          <Animated.View style={[styles.readyTransitionOverlay, { pointerEvents: "auto" }, readyTransitionOverlayAnimatedStyle]}>
            <Animated.View style={[styles.readyTransitionPanel, readyTransitionPanelAnimatedStyle]}>
              <Animated.View style={[styles.readyTransitionGlow, readyTransitionGlowAnimatedStyle]} />
              <View style={styles.readyTransitionIconWrap}>
                <Ionicons name="sparkles" size={26} color={palette.tertiaryContainer} />
              </View>
              <Text style={styles.readyTransitionTitle}>{effectiveReadyTransitionTitle}</Text>
              <Text style={styles.readyTransitionBody}>{effectiveReadyTransitionBody}</Text>
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

        <View style={styles.gameHomeButtonWrap}>
          <Pressable
            style={({ pressed }) => [styles.gameHomeButton, pressed && styles.pressed]}
            onPress={handleHomeButtonPress}
            accessibilityLabel="ホームに戻る"
            accessibilityRole="button"
          >
            <Text style={styles.gameHomeButtonText}>🏠 ホーム</Text>
          </Pressable>
        </View>

        <View style={styles.prologueBackgroundWrap}>
          <Image source={{ uri: heroImage }} style={styles.prologueBackgroundImage} resizeMode="cover" />
          <View style={styles.prologueDarkOverlay} />
        </View>

        <View style={styles.prologueGrainOverlay} />

        <View style={styles.prologueContent}>
          <View style={styles.prologueBottomGradient} />

          <Animated.View style={[styles.prologueCenterStack, prologueContentAnimatedStyle, { paddingBottom: prologueCtaHeight }]}>
            {prologueShowNote ? (
              /* ── 青柳の残したノート 表紙ページ ── */
              <View style={styles.prologueNoteWrap}>
                <ScrollView
                  style={{ maxHeight: height - prologueCtaHeight - 140 }}
                  contentContainerStyle={{ paddingBottom: 4 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.aoyagiNoteCard}>
                    <View style={styles.aoyagiNoteHeaderRow}>
                      <Text style={styles.aoyagiNoteHeaderIcon}>📓</Text>
                      <Text style={styles.aoyagiNoteHeaderText}>青柳の残したノート</Text>
                      <Text style={styles.aoyagiNotePageLabel}>はじめに</Text>
                    </View>
                    <View style={styles.aoyagiNoteDivider} />
                    <Text style={styles.aoyagiNoteBody}>{scenario.prologueNote}</Text>
                  </View>
                </ScrollView>
              </View>
            ) : (
              <Pressable style={styles.prologueNarrationPressArea} onPress={handlePrologueNarrationPress}>
                <View style={styles.prologueTextWrap}>
                  {prologueNarrationPages.length > 1 ? (
                    <Text style={styles.storyNarrationPageIndicator}>
                      {safeProloguePageIndex + 1} / {prologueNarrationPages.length}
                    </Text>
                  ) : null}
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
            )}
          </Animated.View>

          <Animated.View
            style={[styles.prologueCtaWrap, prologueCtaAnimatedStyle]}
            onLayout={({ nativeEvent }) => {
              const h = Math.ceil(nativeEvent.layout.height) + 34 + 16;
              setPrologueCtaHeight((prev) => (prev === h ? prev : h));
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.prologueCtaButton,
                !isPrologueTypingDone || (!hasNextProloguePage && isMapScenarioTransitioning)
                  ? styles.storyNarrationCtaDisabled
                  : null,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                if (!isPrologueTypingDone) return;
                if (hasNextProloguePage) {
                  setProloguePageIndex((prev) => Math.min(prev + 1, prologueLastPageIndex));
                  return;
                }
                if (!prologueShowNote) {
                  setPrologueShowNote(true);
                  return;
                }
                runFlowTransition({
                  title: "ルートを表示しています",
                  body: "最初のスポットへ向かいましょう",
                  toScreen: "map",
                });
              }}
              disabled={!isPrologueTypingDone || (prologueShowNote && !hasNextProloguePage && isMapScenarioTransitioning)}
            >
              <Text style={styles.prologueCtaText}>{prologueCtaLabel}</Text>
              <Ionicons name="arrow-forward" size={30} color="#2d3432" />
            </Pressable>
          </Animated.View>
        </View>

        {isReadyTransitioning ? (
          <Animated.View style={[styles.readyTransitionOverlay, { pointerEvents: "none" }, readyTransitionOverlayAnimatedStyle]}>
            <Animated.View style={[styles.readyTransitionPanel, readyTransitionPanelAnimatedStyle]}>
              <Animated.View style={[styles.readyTransitionGlow, readyTransitionGlowAnimatedStyle]} />
              <View style={styles.readyTransitionIconWrap}>
                <Ionicons name="sparkles" size={26} color={palette.tertiaryContainer} />
              </View>
              <Text style={styles.readyTransitionTitle}>{effectiveReadyTransitionTitle}</Text>
              <Text style={styles.readyTransitionBody}>{effectiveReadyTransitionBody}</Text>
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
    // Ready画面からフォーカスされたスポット（nullの場合は現在のターゲットスポットを使用）
    const mapDisplaySpot = mapFocusSpotIndex !== null ? (spots[mapFocusSpotIndex] ?? currentSpot) : currentSpot;
    const mapDisplayStoryArcMeta = storyArcMetaMap[mapDisplaySpot.id] ?? fallbackStoryArcMeta;
    const mapDisplaySpotMapInfoLine1 = adminWorldConfig?.spotMapInfoLine1 || mapDisplayStoryArcMeta.mapLead;
    const mapDisplaySpotMapInfoLine2 = adminWorldConfig?.spotMapInfoLine2 || mapDisplayStoryArcMeta.trivia;
    return (
      <SafeAreaView style={styles.mapSafeArea}>
        <StatusBar style="dark" />

        <View style={styles.mapScreen}>
          <View style={styles.gameHomeButtonWrapDark}>
            <Pressable
              style={({ pressed }) => [styles.gameHomeButtonDark, pressed && styles.pressed]}
              onPress={handleHomeButtonPress}
              accessibilityLabel="ホームに戻る"
              accessibilityRole="button"
            >
              <Text style={styles.gameHomeButtonDarkText}>🏠 ホーム</Text>
            </Pressable>
          </View>

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
                const isFocused = mapFocusSpotIndex !== null ? index === mapFocusSpotIndex : index === activeTargetIndex;
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
                          isFocused ? styles.mapSpotPinActiveTargetRing : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.mapSpotPinText,
                            isStart || isGoal
                              ? styles.mapSpotPinTextRole
                              : isFocused
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
                <View style={styles.mapWebFallback}>
                  <Text style={styles.mapWebFallbackText}>{webMapError}</Text>
                </View>
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
                const isFocused = mapFocusSpotIndex !== null ? index === mapFocusSpotIndex : index === activeTargetIndex;
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
                          isFocused ? styles.mapSpotPinActiveTargetRing : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.mapSpotPinText,
                            isStart || isGoal
                              ? styles.mapSpotPinTextRole
                              : isFocused
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
                  <Text style={styles.mapCardTitle}>{mapDisplaySpot.name}</Text>
                  <View style={styles.mapCardMetaWrap}>
                    <View style={styles.mapCardBeatChip}>
                      <Text style={styles.mapCardBeatChipText}>
                        {`${mapDisplayStoryArcMeta.phase}｜${mapDisplayStoryArcMeta.beat}`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mapCardInfoRow}>
                  <Ionicons name="information-circle" size={22} color={palette.tertiaryContainer} />
                  <Text style={styles.mapCardInfoText}>{`${mapDisplaySpotMapInfoLine1}\n${mapDisplaySpotMapInfoLine2}`}</Text>
                </View>
              </View>

              <View style={styles.mapCardCtaWrap}>
                {mapFocusSpotIndex !== null ? (
                  <Pressable
                    style={({ pressed }) => [styles.mapCardEnabledCta, pressed && styles.pressed]}
                    onPress={() => {
                      setMapFocusSpotIndex(null);
                      setScreen("ready");
                    }}
                  >
                    <Ionicons name="arrow-back" size={18} color={palette.onBackground} />
                    <Text style={styles.mapCardEnabledCtaText}>Ready画面に戻る</Text>
                  </Pressable>
                ) : (
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
                      {isExperienceCompleted ? effectiveSpotMapRestartLabel : effectiveSpotMapArrivedLabel}
                    </Text>
                  </Pressable>
                )}
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
    const isQuizCorrect = quizSelectedLabel !== null && quizSelectedLabel === currentSpot.quiz.correctLabel;
    const spotNumber = safeCurrentSpotIndex + 1;
    const totalSpots = spots.length;
    const isSpotQuizPhase =
      spotPhase === 'quiz' || spotPhase === 'quizResult' || spotPhase === 'nextHintStory';
    const quizSelectedOption =
      quizSelectedLabel !== null
        ? currentSpot.quiz.options.find((opt) => opt.label === quizSelectedLabel) ?? null
        : null;
    const quizCorrectOption = currentSpot.quiz.options.find((opt) => opt.label === currentSpot.quiz.correctLabel) ?? null;
    const nextHintScenarioText =
      (currentSpot.nextHint ?? "").trim() ||
      (nextSpot ? `${nextSpot.name}へ向かいます。マップで次の目的地を確認してください。` : "次のシーンへ進みます。");

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
            <View style={styles.spotProgressChip}>
              <Text style={styles.spotProgressChipText}>{`${spotNumber} / ${totalSpots}`}</Text>
            </View>
          </View>
          <View style={styles.gameHomeButtonWrap}>
            <Pressable
              style={({ pressed }) => [styles.gameHomeButton, pressed && styles.pressed]}
              onPress={handleHomeButtonPress}
              accessibilityLabel="ホームに戻る"
              accessibilityRole="button"
            >
              <Text style={styles.gameHomeButtonText}>🏠 ホーム</Text>
            </Pressable>
          </View>

          <View style={styles.spotMain}>
            <View style={[styles.spotBottomSheet, isSpotQuizPhase ? styles.spotBottomSheetQuiz : null]}>
              {/* ヘッダーバッジ行 */}
              <View style={styles.spotSpeakerRow}>
                <View style={styles.spotSpeakerBadge}>
                  <Text style={styles.spotSpeakerBadgeText}>{currentSpot.name}</Text>
                </View>
                <View style={styles.spotStoryBeatBadge}>
                  <Text style={styles.spotStoryBeatBadgeText}>
                    {`${currentStoryArcMeta.phase}｜${currentStoryArcMeta.beat}`}
                  </Text>
                </View>
              </View>

              {/* ─── フェーズ: note ─── */}
              {spotPhase === 'note' ? (
                <>
                  <ScrollView style={[styles.spotNoteScroll, { maxHeight: Math.min(height * 0.3, 240) }]} showsVerticalScrollIndicator={false}>
                    <View style={styles.aoyagiNoteCard}>
                      <View style={styles.aoyagiNoteHeaderRow}>
                        <Text style={styles.aoyagiNoteHeaderIcon}>📓</Text>
                        <Text style={styles.aoyagiNoteHeaderText}>青柳の残したノート</Text>
                        <Text style={styles.aoyagiNotePageLabel}>{`p.${spotNumber} / ${totalSpots}`}</Text>
                      </View>
                      <View style={styles.aoyagiNoteDivider} />
                      <Text style={styles.aoyagiNoteBody}>{currentSpot.aoyagiNote}</Text>
                    </View>
                  </ScrollView>
                  <View style={styles.spotNextButtonWrap}>
                    <Pressable
                      style={({ pressed }) => [styles.spotNoteButton, pressed && styles.pressed]}
                      onPress={() => setSpotPhase('story')}
                    >
                      <Text style={styles.spotNoteButtonText}>物語を読む</Text>
                      <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ─── フェーズ: story ─── */}
              {spotPhase === 'story' ? (
                <>
                  {spotScenarioTexts.length > 1 ? (
                    <Text style={styles.spotScenarioProgress}>
                      {`${spotScenarioSegmentIndex + 1} / ${spotScenarioTexts.length}`}
                    </Text>
                  ) : null}

                  <Pressable style={styles.spotScenarioPressArea} onPress={handleSpotScenarioTextPress}>
                    <Text style={styles.spotScenarioText}>
                      {spotScenarioChars.slice(0, spotTypedCharCount).join("")}
                      {!isSpotTypingDone ? <Text style={styles.spotScenarioCursor}>|</Text> : null}
                    </Text>
                    {isSpotTypingDone && hasNextScenarioInSpot ? (
                      <Text style={styles.spotScenarioTapHint}>タップして次の段落へ</Text>
                    ) : null}
                  </Pressable>

                  <View style={styles.spotNextButtonWrap}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.spotNextButton,
                        isMapScenarioTransitioning ? styles.mapCardEnabledCtaDisabled : null,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleSpotScenarioNextPress}
                      disabled={isMapScenarioTransitioning}
                    >
                      <Text style={styles.spotNextButtonText}>{spotNextButtonLabel}</Text>
                      <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ─── フェーズ: noteAfter ─── */}
              {spotPhase === 'noteAfter' ? (
                <>
                  <ScrollView style={[styles.spotNoteScroll, { maxHeight: Math.min(height * 0.3, 240) }]} showsVerticalScrollIndicator={false}>
                    <View style={styles.aoyagiNoteCard}>
                      <View style={styles.aoyagiNoteHeaderRow}>
                        <Text style={styles.aoyagiNoteHeaderIcon}>📓</Text>
                        <Text style={styles.aoyagiNoteHeaderText}>青柳の残したノート</Text>
                        <Text style={styles.aoyagiNotePageLabel}>{`p.${spotNumber} / ${totalSpots}`}</Text>
                      </View>
                      <View style={styles.aoyagiNoteDivider} />
                      <Text style={styles.aoyagiNoteBody}>{currentSpot.aoyagiNoteAfter}</Text>
                    </View>
                  </ScrollView>
                  <View style={styles.spotNextButtonWrap}>
                    <Pressable
                      style={({ pressed }) => [styles.spotNoteButton, pressed && styles.pressed]}
                      onPress={() => { setSpotPhase('quiz'); setQuizSelectedLabel(null); }}
                    >
                      <Text style={styles.spotNoteButtonText}>クイズに挑戦</Text>
                      <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ─── フェーズ: quiz ─── */}
              {spotPhase === 'quiz' ? (
                <View style={styles.quizPhaseBody}>
                  <View style={styles.quizLeadWrap}>
                    <View style={styles.quizHeaderRow}>
                      <View style={styles.quizBadge}>
                        <Text style={styles.quizBadgeText}>QUIZ</Text>
                      </View>
                      <Text style={styles.quizQuestionMeta}>{`問題 ${spotNumber}`}</Text>
                    </View>
                    <Text style={styles.quizPromptText}>最も適切な選択肢を1つ選んでください</Text>
                    <Text style={styles.quizQuestion}>{currentSpot.quiz.question}</Text>
                  </View>
                  <View style={styles.quizOptionsWrap}>
                    {currentSpot.quiz.options.map((opt) => (
                      <Pressable
                        key={opt.label}
                        style={({ pressed }) => [styles.quizOption, pressed && styles.quizOptionPressed]}
                        onPress={() => handleQuizSelect(opt.label)}
                      >
                        <View style={styles.quizOptionContent}>
                          <View style={styles.quizOptionLabelBadge}>
                            <Text style={styles.quizOptionLabelText}>{opt.label}</Text>
                          </View>
                          <Text style={styles.quizOptionText}>{opt.text}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,245,220,0.72)" />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* ─── フェーズ: quizResult ─── */}
              {spotPhase === 'quizResult' ? (
                <>
                  <View style={styles.quizResultBody}>
                    <View style={styles.quizResultHeaderRow}>
                      <View style={[styles.quizResultBadge, isQuizCorrect ? styles.quizResultBadgeCorrect : styles.quizResultBadgeWrong]}>
                        <Text style={styles.quizResultBadgeText}>
                          {isQuizCorrect ? '✓  正解！' : '✗  不正解'}
                        </Text>
                      </View>
                      <Text style={styles.quizScoreText}>{`${quizCorrectCount} / ${spotNumber} 正解`}</Text>
                    </View>

                    {quizSelectedOption ? (
                      <View style={styles.quizResultSummaryWrap}>
                        <Text style={styles.quizResultSummaryText}>
                          {`あなたの回答: ${quizSelectedOption.label}. ${quizSelectedOption.text}`}
                        </Text>
                        {!isQuizCorrect && quizCorrectOption ? (
                          <Text style={[styles.quizResultSummaryText, styles.quizResultSummaryCorrectText]}>
                            {`正解: ${quizCorrectOption.label}. ${quizCorrectOption.text}`}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}

                    <View style={styles.quizResultOptionsWrap}>
                      {currentSpot.quiz.options.map((opt) => {
                        const isSelected = opt.label === quizSelectedLabel;
                        const isCorrectOpt = opt.label === currentSpot.quiz.correctLabel;
                        return (
                          <View
                            key={opt.label}
                            style={[
                              styles.quizResultOption,
                              isCorrectOpt ? styles.quizResultOptionCorrect : null,
                              isSelected && !isCorrectOpt ? styles.quizResultOptionWrong : null,
                            ]}
                          >
                            <View style={styles.quizResultOptionContent}>
                              <View style={[styles.quizOptionLabelBadge, isCorrectOpt ? styles.quizOptionLabelBadgeCorrect : null]}>
                                <Text style={styles.quizOptionLabelText}>{opt.label}</Text>
                              </View>
                              <Text style={[styles.quizOptionText, isCorrectOpt ? styles.quizResultOptionTextCorrect : null]}>{opt.text}</Text>
                            </View>
                            {isCorrectOpt ? (
                              <Ionicons name="checkmark-circle" size={18} color="#81C784" />
                            ) : isSelected ? (
                              <Ionicons name="close-circle" size={18} color="#E57373" />
                            ) : (
                              <View style={styles.quizResultOptionIconPlaceholder} />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.quizResultInfoWrap}>
                      <View style={styles.quizExplanationCard}>
                        <Text style={styles.quizExplanationLabel}>解説</Text>
                        <Text style={styles.quizExplanation}>{currentSpot.quiz.explanation}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.spotNextButtonWrap, styles.quizResultNextButtonWrap]}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.spotNextButton,
                        isMapScenarioTransitioning ? styles.mapCardEnabledCtaDisabled : null,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleQuizContinue}
                      disabled={isMapScenarioTransitioning}
                    >
                      <Text style={styles.spotNextButtonText}>
                        {safeCurrentSpotIndex >= spots.length - 1 ? 'エピローグへ' : '次のスポットへ'}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ─── フェーズ: nextHintStory ─── */}
              {spotPhase === 'nextHintStory' ? (
                <>
                  <View style={styles.spotBridgeStoryWrap}>
                    <Text style={styles.spotBridgeStoryLabel}>次のスポットへ</Text>
                    <View style={styles.spotBridgeStoryCard}>
                      <Text style={styles.spotBridgeStoryText}>{nextHintScenarioText}</Text>
                    </View>
                  </View>

                  <View style={styles.spotNextButtonWrap}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.spotNextButton,
                        isMapScenarioTransitioning ? styles.mapCardEnabledCtaDisabled : null,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleNextHintStoryContinue}
                      disabled={isMapScenarioTransitioning}
                    >
                      <Text style={styles.spotNextButtonText}>次のスポットへ</Text>
                      <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
                    </Pressable>
                  </View>
                </>
              ) : null}
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

        <View style={styles.gameHomeButtonWrap}>
          <Pressable
            style={({ pressed }) => [styles.gameHomeButton, pressed && styles.pressed]}
            onPress={handleHomeButtonPress}
            accessibilityLabel="ホームに戻る"
            accessibilityRole="button"
          >
            <Text style={styles.gameHomeButtonText}>🏠 ホーム</Text>
          </Pressable>
        </View>

        <View style={styles.prologueBackgroundWrap}>
          <Image source={{ uri: epilogueBgImage }} style={styles.prologueBackgroundImage} resizeMode="cover" />
          <View style={styles.prologueDarkOverlay} />
        </View>

        <View style={styles.prologueGrainOverlay} />

        <View style={styles.prologueContent}>
          <View style={styles.prologueBottomGradient} />

          <Animated.View style={[styles.prologueCenterStack, epilogueContentAnimatedStyle, { paddingBottom: epilogueCtaHeight }]}>
            <Pressable style={styles.prologueNarrationPressArea} onPress={handleEpilogueNarrationPress}>
              <View style={styles.prologueTextWrap}>
                {epilogueNarrationPages.length > 1 ? (
                  <Text style={styles.storyNarrationPageIndicator}>
                    {safeEpiloguePageIndex + 1} / {epilogueNarrationPages.length}
                  </Text>
                ) : null}
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

          <Animated.View
            style={[styles.prologueCtaWrap, epilogueCtaAnimatedStyle]}
            onLayout={({ nativeEvent }) => {
              const h = Math.ceil(nativeEvent.layout.height) + 34 + 16;
              setEpilogueCtaHeight((prev) => (prev === h ? prev : h));
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.prologueCtaButton,
                !isEpilogueTypingDone ? styles.storyNarrationCtaDisabled : null,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                if (!isEpilogueTypingDone) return;
                if (hasNextEpiloguePage) {
                  setEpiloguePageIndex((prev) => Math.min(prev + 1, epilogueLastPageIndex));
                  return;
                }
                setScreen("feedback");
              }}
              disabled={!isEpilogueTypingDone}
            >
              <Text style={styles.prologueCtaText}>{epilogueCtaLabel}</Text>
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
                {effectiveFeedbackHeroTitleLine1}
                {"\n"}
                {effectiveFeedbackHeroTitleLine2}
              </Text>
              <Text style={styles.feedbackHeroSubtitle}>{`${effectiveFeedbackHeroSubtitleLine1}\n${effectiveFeedbackHeroSubtitleLine2}`}</Text>
            </View>

            <View style={styles.feedbackSectionStack}>

              {/* Q1: 全体満足度 */}
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionOverall}</Text>
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
                  <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionGuidance}</Text>
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
                  <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionCampus}</Text>
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
                  <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionVisitIntent}</Text>
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
                  <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionExpectation}</Text>
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
                <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionReuse}</Text>
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
                <Text style={styles.feedbackLabel}>{effectiveFeedbackQuestionComment}</Text>
                <Text style={styles.setupResearchNote}>{effectiveFeedbackCommentNote}</Text>
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
                  (!canSubmitFeedback || isSubmittingFeedback) && styles.feedbackSubmitButtonDisabled,
                  pressed && canSubmitFeedback && !isSubmittingFeedback && styles.pressed,
                ]}
                onPress={handleFeedbackSubmit}
                disabled={!canSubmitFeedback || isSubmittingFeedback}
              >
                {isSubmittingFeedback ? (
                  <ActivityIndicator size="small" color={palette.onDarkButton} />
                ) : (
                  <Text style={styles.feedbackSubmitText}>{effectiveFeedbackSubmitButton}</Text>
                )}
              </Pressable>
              <Text style={styles.feedbackThanks}>{effectiveFeedbackThanks}</Text>
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

        {/* ── 送信完了ThankYouモーダル ── */}
        <Modal
          visible={showFeedbackThankyou}
          transparent
          animationType="fade"
          onRequestClose={handleFeedbackThankyouClose}
        >
          <View style={styles.feedbackThankyouOverlay}>
            <View style={styles.feedbackThankyouPanel}>
              <View style={styles.feedbackThankyouIconWrap}>
                <Ionicons name="checkmark-circle" size={56} color={palette.tertiaryContainer} />
              </View>
              <Text style={styles.feedbackThankyouTitle}>体験ありがとうございました！</Text>
              <Text style={styles.feedbackThankyouBody}>
                {"フィードバックを送信しました。\nあなたの回答は研究に役立てられます。"}
              </Text>
              <Text style={styles.feedbackThankyouSub}>── 青柳の残したノートはここで閉じられる</Text>
              <Pressable
                style={({ pressed }) => [styles.feedbackThankyouButton, pressed && styles.pressed]}
                onPress={handleFeedbackThankyouClose}
              >
                <Text style={styles.feedbackThankyouButtonText}>トップに戻る</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  if (screen === "setup") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.setupTopBar}>
          <View style={[styles.topBarInner, { width: contentWidth }]}>
            <View style={styles.headerSideSpacer} />
            <View style={styles.brandRow}>
              <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
            </View>
            {renderHeaderAuthBadge()}
          </View>
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
              {effectiveSetupTitle}
            </Text>
            <Text style={styles.setupSubtitle}>{effectiveSetupSubtitle}</Text>
          </Animated.View>

          <Animated.View style={[styles.setupFormSection, { width: contentWidth }, setupCardsAnimatedStyle]}>
            <View style={styles.setupBlock}>
              <Text style={styles.setupLabel}>{effectiveSetupUserTypeLabel}</Text>
              <View style={styles.userTypeSelectWrap}>
                <Pressable
                  onPress={() => setIsUserTypeMenuOpen((prev) => !prev)}
                  style={({ pressed }) => [styles.userTypeSelectField, pressed && styles.pressed]}
                >
                  <Text style={isUserTypeAnswered ? styles.userTypeSelectValue : styles.userTypeSelectPlaceholder}>
                    {isUserTypeAnswered ? selectedUserType : "選択してください"}
                  </Text>
                  <Ionicons
                    name={isUserTypeMenuOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={palette.onSurfaceVariant}
                  />
                </Pressable>

                {isUserTypeMenuOpen ? (
                  <View style={styles.userTypeSelectMenu}>
                    {userTypeOptions.map((option) => {
                      const selected = isUserTypeAnswered && selectedUserType === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => {
                            setSelectedUserType(option);
                            setIsUserTypeAnswered(true);
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
              <Text style={styles.setupLabel}>{effectiveSetupFamiliarityLabel}</Text>
              <View style={styles.stackButtons}>
                {familiarityOptions.map((option) => {
                  const selected = isFamiliarityAnswered && selectedFamiliarity === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSelectedFamiliarity(option);
                        setIsFamiliarityAnswered(true);
                      }}
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
              <Text style={styles.setupLabel}>{effectiveSetupExplorationLabel}</Text>
              <Text style={styles.setupResearchNote}>{effectiveSetupResearchNote}</Text>
              <View style={styles.stackButtons}>
                {explorationStyleOptions.map((option) => {
                  const selected = isExplorationStyleAnswered && selectedExplorationStyle === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSelectedExplorationStyle(option);
                        setIsExplorationStyleAnswered(true);
                      }}
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
              <Text style={styles.setupLabel}>{effectiveSetupExpectationLabel}</Text>
              <Text style={styles.setupResearchNote}>{effectiveSetupResearchNote}</Text>
              <View style={styles.stackButtons}>
                {experienceExpectationOptions.map((option) => {
                  const selected =
                    isExperienceExpectationAnswered && selectedExperienceExpectation === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSelectedExperienceExpectation(option);
                        setIsExperienceExpectationAnswered(true);
                      }}
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
              <Text style={styles.setupLabel}>{effectiveSetupDurationLabel}</Text>
              <View style={styles.durationScaleTextRow}>
                <Text style={styles.durationHint}>{effectiveSetupDurationHintShort}</Text>
                <Text style={styles.durationHint}>{effectiveSetupDurationHintLong}</Text>
              </View>
              <View style={styles.durationRow}>
                {durationOptions.map((option) => {
                  const selected = isDurationAnswered && selectedDuration === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSelectedDuration(option);
                        setIsDurationAnswered(true);
                      }}
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
              !isSetupFormComplete || isGeneratingQuest ? styles.startButtonDisabled : null,
              pressed && isSetupFormComplete && !isGeneratingQuest ? styles.pressed : null,
            ]}
            onPress={handleSetupCreateExperiencePress}
            disabled={!isSetupFormComplete || isGeneratingQuest}
          >
            <Text style={styles.startButtonText}>{effectiveSetupStartButton}</Text>
            <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ホーム確認モーダル */}
      <Modal
        visible={showHomeConfirmModal}
        animationType="fade"
        transparent
        onRequestClose={handleHomeCancel}
      >
        <View style={styles.homeConfirmOverlay}>
          <View style={styles.homeConfirmDialog}>
            <Text style={styles.homeConfirmTitle}>ホームに戻りますか？</Text>
            <Text style={styles.homeConfirmBody}>
              進捗は自動保存されています。{"\n"}ホームに戻っても続きから再開できます。
            </Text>
            <View style={styles.homeConfirmActions}>
              <Pressable
                style={({ pressed }) => [styles.homeConfirmCancelButton, pressed && styles.pressed]}
                onPress={handleHomeCancel}
              >
                <Text style={styles.homeConfirmCancelText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.homeConfirmOkButton, pressed && styles.pressed]}
                onPress={handleHomeConfirm}
              >
                <Text style={styles.homeConfirmOkText}>ホームへ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
      <View style={styles.landingAmbientLayer}>
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
        <View style={styles.header}>
          <View style={[styles.headerInner, { width: contentWidth }]}>
            <View style={styles.headerSideSpacer} />
            <View style={styles.brandRow}>
              <Image source={tomoshibiLogo} style={styles.brandLogo} resizeMode="contain" />
            </View>
            {renderHeaderAuthBadge()}
          </View>
        </View>

        <Animated.View style={[styles.main, { width: contentWidth }, landingHeroAnimatedStyle]}>
          <View style={[styles.heroWrap, { height: heroHeight }]}>
            <Image source={landingHeroImage} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroTopTag}>
              <Ionicons name="walk-outline" size={15} color="#fdfdfd" />
              <Text style={styles.heroTopTagText}>{effectiveLandingTopTag}</Text>
            </View>
            <View style={styles.heroBottomPanel}>
              <Text style={styles.heroBottomTitle}>{effectiveLandingHeroPanelTitle}</Text>
              <Text style={styles.heroBottomBody}>{effectiveLandingHeroPanelBody}</Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>{effectiveLandingEyebrow}</Text>
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
                {effectiveLandingHeroTitleLine1}
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
                {effectiveLandingHeroTitleLine2}
              </Text>
            </View>
            <Text style={styles.heroBody}>{effectiveLandingHeroDescription}</Text>
          </View>

          <View style={styles.startArea}>
          </View>
        </Animated.View>

        <Animated.View style={[styles.landingJourneySection, { width: contentWidth }, landingCardsAnimatedStyle]}>
          <View style={styles.landingSectionHeader}>
            <Text style={styles.landingSectionTitle}>{effectiveLandingJourneyTitle}</Text>
            <Text style={styles.landingSectionCaption}>{effectiveLandingJourneyCaption}</Text>
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
            <Text style={styles.landingSectionTitle}>{effectiveLandingFeaturesTitle}</Text>
            <Text style={styles.landingSectionCaption}>{effectiveLandingFeaturesCaption}</Text>
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
        <View style={[styles.landingAuthActions, { width: contentWidth }]}>
          {resumeDraft != null ? (
            <Pressable
              style={({ pressed }) => [styles.landingResumeButton, pressed && styles.pressed]}
              onPress={() => {
                const targetScreen = resumeDraft.savedScreen ?? "map";
                setScreen(resumableScreens.includes(targetScreen) ? targetScreen : "map");
              }}
            >
              <Text style={styles.landingResumeButtonText}>
                {`📖 続きから始める（スポット ${(resumeDraft.currentSpotIndex ?? 0) + 1}/6）`}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={palette.onDarkButton} />
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.landingAuthPrimaryButton,
              pressed && !isLandingGoogleSigningIn ? styles.pressed : null,
              isLandingGoogleSigningIn ? styles.startButtonDisabled : null,
            ]}
            onPress={handleLandingGoogleSignInPress}
            disabled={isLandingGoogleSigningIn}
          >
            <View style={styles.startButtonLabelGroup}>
              <Text style={styles.landingAuthPrimaryButtonText}>
                {isLandingGoogleSigningIn ? "Googleログイン中..." : effectiveLandingGoogleStartButton}
              </Text>
            </View>
            {isLandingGoogleSigningIn ? (
              <ActivityIndicator color={palette.onDarkButton} />
            ) : (
              <Ionicons name="logo-google" size={20} color={palette.onDarkButton} />
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.landingAuthSecondaryButton, pressed && styles.pressed]}
            onPress={handleLandingStartWithoutLoginPress}
            disabled={isLandingGoogleSigningIn}
          >
            <Text style={styles.landingAuthSecondaryButtonText}>{effectiveLandingGuestStartButton}</Text>
            <Ionicons name="arrow-forward" size={20} color={palette.onBackground} />
          </Pressable>
        </View>
        {landingAuthError ? <Text style={styles.landingAuthErrorText}>{landingAuthError}</Text> : null}
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
    paddingTop: 6,
    paddingBottom: 10,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#f8f1e6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,102,78,0.18)",
    shadowColor: "#2f271a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 18,
    zIndex: 220,
    position: "relative",
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46,
  },
  topBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  headerSideSpacer: {
    width: 42,
    height: 42,
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
    height: 30,
    width: 148,
  },
  main: {
    paddingHorizontal: 0,
    marginTop: 32,
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
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "rgba(249,249,247,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(173,179,176,0.25)",
    alignItems: "center",
  },
  landingAuthActions: {
    gap: 10,
  },
  landingAuthPrimaryButton: {
    borderRadius: 22,
    backgroundColor: palette.darkButton,
    minHeight: 60,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    shadowColor: "#1a1c20",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  landingAuthPrimaryButtonText: {
    color: palette.onDarkButton,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    flexShrink: 1,
  },
  landingAuthSecondaryButton: {
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.5)",
  },
  landingAuthSecondaryButtonText: {
    color: palette.onBackground,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    flexShrink: 1,
  },
  landingAuthErrorText: {
    marginTop: 8,
    maxWidth: 900,
    color: palette.error,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  headerAuthBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,250,242,0.96)",
    borderWidth: 1,
    borderColor: "rgba(140,122,96,0.32)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a3b28",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerAuthBadgeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAuthBadgeStatusDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fffaf2",
  },
  headerAuthBadgeStatusDotSignedIn: {
    backgroundColor: "#2eb67d",
  },
  headerAuthBadgeStatusDotGuest: {
    backgroundColor: "#8d949a",
  },
  headerAuthMenuAnchor: {
    position: "relative",
    alignItems: "flex-end",
    zIndex: 260,
  },
  headerAuthMenuPanel: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 236,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "rgba(255,250,242,0.98)",
    borderWidth: 1,
    borderColor: "rgba(140,122,96,0.34)",
    gap: 8,
    shadowColor: "#2f271a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 30,
    zIndex: 1200,
  },
  headerAuthMenuStatusText: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  headerAuthMenuButton: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: palette.darkButton,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerAuthMenuButtonDisabled: {
    backgroundColor: "rgba(158,166,171,0.52)",
  },
  headerAuthMenuButtonText: {
    color: palette.onDarkButton,
    fontSize: 13,
    fontWeight: "700",
  },
  headerAuthMenuButtonTextDisabled: {
    color: "#5f666c",
  },
  headerAuthMenuErrorText: {
    color: palette.error,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
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
  startButtonDisabled: {
    backgroundColor: "#9ea6ab",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
    height: 66,
    zIndex: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f1e6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,102,78,0.18)",
    shadowColor: "#2f271a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 18,
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
  userTypeSelectPlaceholder: {
    color: palette.onSurfaceVariant,
    fontSize: 15,
    fontWeight: "500",
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
  preparingSkipButtonDisabled: {
    opacity: 0.58,
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
  preparingStepSummary: {
    marginTop: 4,
    color: palette.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.3,
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
  preparingFallbackLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  preparingFallbackLinkText: {
    fontSize: 11,
    color: palette.secondaryText,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(83,96,112,0.6)",
    fontWeight: "600",
  },
  readyTopBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 220,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f1e6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(120,102,78,0.18)",
    shadowColor: "#2f271a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 18,
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
  readyMapPreviewCard: {
    marginBottom: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.18)",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  readyMapPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  readyMapPreviewTitle: {
    color: "#7f8a87",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  readyMapPreviewMeta: {
    color: palette.onBackground,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  readyMapPreviewCanvas: {
    height: 228,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#e7ece9",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.24)",
  },
  readyMapPreviewMap: {
    width: "100%",
    height: "100%",
  },
  readyMapPreviewMock: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7ece9",
  },
  readyMapPreviewMockText: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  readyMapPreviewFallbackBadge: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(173,179,176,0.34)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readyMapPreviewFallbackBadgeText: {
    color: palette.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  readyMapCenterPinWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -15 }, { translateY: -34 }],
  },
  readyMapCenterPinHalo: {
    position: "absolute",
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245,206,83,0.26)",
  },
  readyMapCenterPinCore: {
    position: "absolute",
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  readyMapPreviewHint: {
    marginTop: 10,
    color: palette.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
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
  readyTimelineCardActive: {
    borderColor: "rgba(245,206,83,0.72)",
    backgroundColor: "#fffdf6",
  },
  readyTimelineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 10,
  },
  readyTimelineIndex: {
    color: palette.tertiary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.9,
  },
  readyTimelineBeatTag: {
    borderRadius: 999,
    backgroundColor: "rgba(245,206,83,0.16)",
    borderWidth: 1,
    borderColor: "rgba(245,206,83,0.52)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readyTimelineBeatTagText: {
    color: "#745c00",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  readyTimelineName: {
    color: palette.onBackground,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  readyTimelineBeat: {
    color: "#33414f",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  readyTimelineDesc: {
    color: palette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
  },
  readyTimelineMapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  readyTimelineMapHintText: {
    color: palette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
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
    paddingBottom: 48,
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
  feedbackThankyouOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  feedbackThankyouPanel: {
    backgroundColor: palette.surfaceLowest,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 36,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    gap: 0,
  },
  feedbackThankyouIconWrap: {
    marginBottom: 20,
  },
  feedbackThankyouTitle: {
    color: palette.onBackground,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  feedbackThankyouBody: {
    color: palette.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 16,
  },
  feedbackThankyouSub: {
    color: palette.outlineVariant,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 28,
  },
  feedbackThankyouButton: {
    backgroundColor: palette.darkButton,
    borderRadius: 100,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  feedbackThankyouButtonText: {
    color: palette.onDarkButton,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 48,
  },
  prologueBottomGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
    pointerEvents: "none",
  },
  prologueCenterStack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
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
    justifyContent: "flex-start",
  },
  storyNarrationPageIndicator: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  prologueNarrationPressArea: {
    width: "100%",
    minHeight: 240,
    alignItems: "center",
    justifyContent: "flex-start",
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
  mapCardBeatChip: {
    borderRadius: 999,
    backgroundColor: "rgba(245,206,83,0.16)",
    borderWidth: 1,
    borderColor: "rgba(245,206,83,0.52)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapCardBeatChipText: {
    color: "#5b4700",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
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
  spotBottomSheetQuiz: {
    flex: 1,
    marginTop: 96,
    paddingTop: 18,
    paddingBottom: 20,
  },
  spotSpeakerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,206,83,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,239,204,0.32)",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 0,
  },
  spotSpeakerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  spotSpeakerBadgeText: {
    color: "rgba(255,244,217,0.96)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  spotStoryBeatBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(27,18,10,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,232,196,0.26)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  spotStoryBeatBadgeText: {
    color: "rgba(255,238,205,0.95)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  spotTriviaText: {
    color: "rgba(255,231,188,0.9)",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    marginBottom: 8,
  },
  spotScenarioProgress: {
    color: "rgba(255,232,180,0.6)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  spotScenarioText: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 17,
    lineHeight: 31,
    fontWeight: "500",
    letterSpacing: -0.1,
    textAlign: "left",
    marginBottom: 8,
  },
  spotScenarioPressArea: {
    minHeight: 120,
    maxHeight: 220,
    justifyContent: "flex-start",
    paddingVertical: 8,
    overflow: "hidden",
  },
  spotScenarioCursor: {
    color: "rgba(255,245,214,0.96)",
    fontSize: 17,
    lineHeight: 31,
    fontWeight: "600",
  },
  spotScenarioTapHint: {
    color: "rgba(255,232,180,0.55)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginTop: 6,
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

  // ── SpotArrival: ノートスクロールエリア ──
  spotNoteScroll: {
    marginBottom: 4,
  },

  // ── SpotArrival: 進捗チップ ──
  spotProgressChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  spotProgressChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primary,
    letterSpacing: 0.5,
  },

  // ── 青柳ノートカード ──
  aoyagiNoteCard: {
    backgroundColor: "#FAF6E4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8DFB0",
    padding: 16,
    marginBottom: 4,
    shadowColor: "#B8A96A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  aoyagiNoteHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  aoyagiNoteHeaderIcon: {
    fontSize: 18,
  },
  aoyagiNoteHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5C4A12",
    letterSpacing: 0.5,
    flex: 1,
  },
  aoyagiNotePageLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B6914",
    letterSpacing: 0.3,
    opacity: 0.75,
  },
  aoyagiNoteDivider: {
    height: 1,
    backgroundColor: "#D4C880",
    marginBottom: 12,
    opacity: 0.6,
  },
  aoyagiNoteBody: {
    fontSize: 14,
    lineHeight: 24,
    color: "#3D2E08",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },

  // ── プロローグ ノートラッパー ──
  prologueNoteWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    width: "100%",
  },

  // ── ノートから物語へ遷移ボタン ──
  spotNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5C4A12",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  spotNoteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.8,
  },

  // ── クイズ: ヘッダー ──
  quizHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  quizPhaseBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  quizLeadWrap: {
    gap: 4,
  },
  quizBadge: {
    backgroundColor: palette.tertiaryContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  quizBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.onTertiaryContainer,
    letterSpacing: 2,
  },
  quizQuestionMeta: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,245,220,0.72)",
    letterSpacing: 0.5,
  },
  quizPromptText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,245,220,0.68)",
    letterSpacing: 0.3,
  },
  quizQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,245,220,0.95)",
    lineHeight: 24,
    marginBottom: 10,
  },

  // ── クイズ: 選択肢 ──
  quizOptionsWrap: {
    gap: 8,
    marginBottom: 2,
  },
  quizOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "rgba(255,245,220,0.10)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,245,220,0.20)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  quizOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  quizOptionPressed: {
    backgroundColor: "rgba(255,245,220,0.20)",
    transform: [{ scale: 0.98 }],
  },
  quizOptionLabelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245,206,83,0.80)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quizOptionLabelBadgeCorrect: {
    backgroundColor: "#4CAF50",
  },
  quizOptionLabelText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3D2E08",
  },
  quizOptionText: {
    fontSize: 13,
    color: "rgba(255,245,220,0.92)",
    lineHeight: 20,
    flex: 1,
  },

  // ── クイズ結果: ヘッダー ──
  quizResultBody: {
    flex: 1,
    gap: 8,
    justifyContent: "space-between",
  },
  quizResultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  quizResultBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  quizResultBadgeCorrect: {
    backgroundColor: "#388E3C",
  },
  quizResultBadgeWrong: {
    backgroundColor: "#C62828",
  },
  quizResultBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  quizScoreText: {
    fontSize: 13,
    color: "rgba(255,245,220,0.70)",
    fontWeight: "600",
  },
  quizResultSummaryWrap: {
    gap: 2,
    marginBottom: 2,
  },
  quizResultSummaryText: {
    color: "rgba(255,245,220,0.84)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  quizResultSummaryCorrectText: {
    color: "#A5D6A7",
  },

  // ── クイズ結果: 選択肢ハイライト ──
  quizResultOptionsWrap: {
    gap: 6,
    marginBottom: 2,
  },
  quizResultOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,245,220,0.07)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,245,220,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  quizResultOptionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
  quizResultOptionIconPlaceholder: {
    width: 18,
    height: 18,
  },
  quizResultOptionCorrect: {
    backgroundColor: "rgba(76,175,80,0.20)",
    borderColor: "rgba(76,175,80,0.50)",
  },
  quizResultOptionWrong: {
    backgroundColor: "rgba(198,40,40,0.15)",
    borderColor: "rgba(198,40,40,0.40)",
  },
  quizResultOptionTextCorrect: {
    fontWeight: "700",
    color: "#A5D6A7",
  },

  // ── クイズ解説 ──
  quizResultInfoWrap: {
    gap: 6,
  },
  quizExplanationCard: {
    backgroundColor: "rgba(255,245,220,0.08)",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(245,206,83,0.60)",
    gap: 2,
  },
  quizExplanationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(245,206,83,0.86)",
    letterSpacing: 0.5,
  },
  quizExplanation: {
    fontSize: 12,
    lineHeight: 19,
    color: "rgba(255,245,220,0.80)",
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    marginBottom: 0,
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },

  // ── クイズ後の遷移シナリオ ──
  spotBridgeStoryWrap: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  spotBridgeStoryLabel: {
    color: "rgba(245,206,83,0.86)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  spotBridgeStoryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,232,196,0.2)",
    backgroundColor: "rgba(18,13,8,0.42)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  spotBridgeStoryText: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  quizResultNextButtonWrap: {
    paddingTop: 8,
  },

  // ── ゲーム進行中ホームボタン（暗背景用） ──
  gameHomeButtonWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
  },
  gameHomeButton: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  gameHomeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.2,
  },

  // ── ゲーム進行中ホームボタン（明背景用：Map画面） ──
  gameHomeButtonWrapDark: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
  },
  gameHomeButtonDark: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  gameHomeButtonDarkText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.onBackground,
    letterSpacing: 0.2,
  },

  // ── ホーム確認モーダル ──
  homeConfirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  homeConfirmDialog: {
    backgroundColor: palette.surfaceLowest,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  homeConfirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.onBackground,
    marginBottom: 10,
    textAlign: "center",
  },
  homeConfirmBody: {
    fontSize: 14,
    color: palette.onSurfaceVariant,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  homeConfirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  homeConfirmCancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  homeConfirmCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.onSurfaceVariant,
  },
  homeConfirmOkButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: palette.darkButton,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  homeConfirmOkText: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.onDarkButton,
  },

  // ── Landing: 続きから始めるボタン ──
  landingResumeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.tertiary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  landingResumeButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: palette.onDarkButton,
    letterSpacing: -0.1,
  },
});
