"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { GoogleMapBackground } from "@/components/google-map-background";
import { SpotAdminSidebar } from "@/components/spot-admin-sidebar";
import { getFirebaseClientAuth, getFirebaseMissingEnvKeys } from "@/lib/firebase";
import {
  createPlanRequest,
  getPlanRequestStatus,
  type CreatePlanRequestPayload,
  type PlanGenerationResult,
  type PlanTimelineItem,
  type PlanTraceItem,
} from "@/lib/plan-request-api";
import { createSpotRecord, type SpotAdminRecord } from "@/lib/spots-admin-api";
import { subscribePublishedSpots, type SpotMapPin } from "@/lib/spots-api";

type IconName =
  | "auto_awesome"
  | "my_location"
  | "visibility"
  | "restaurant"
  | "shopping_bag"
  | "hotel"
  | "sailing"
  | "compass"
  | "close"
  | "arrow_back"
  | "expand_more"
  | "edit"
  | "add_circle"
  | "directions_walk"
  | "pedal_bike"
  | "directions_car"
  | "directions_bus"
  | "schedule"
  | "landscape"
  | "history_edu"
  | "person_circle"
  | "logout";

type AppIconProps = {
  name: IconName;
  className?: string;
  filled?: boolean;
};

type PlannerView = "input" | "generating" | "result" | "failed";
type TravelStyle = "day" | "stay";
type DeparturePoint = "iwami_station" | "current_location";
type Duration = "2h" | "4h" | "custom";
type MainTransport = "walk" | "rental_cycle" | "car" | "bus";
type ReturnTransportOption = "train" | "car";
type ReturnStationId = "iwami_station" | "higashihama_station" | "oiwa_station";
type IslandId = "iki" | "tsushima" | "goto" | "shodoshima" | "other";
type LatLngLiteral = { lat: number; lng: number };
type MapCameraTarget = { center: LatLngLiteral; zoom?: number };

type NavItem = {
  id: SpotMapPin["primaryCategory"];
  icon: Extract<IconName, "visibility" | "restaurant" | "shopping_bag" | "hotel" | "sailing">;
  label: string;
  tint: string;
};

type ExploreFeatureBanner = {
  id: string;
  kind: "image" | "placeholder";
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
  detailView?: "iwami_story";
  placeholderLabel?: string;
};

type IslandOption = {
  id: IslandId;
  label: string;
  center: LatLngLiteral;
  zoom: number;
  spotSlugPrefixes: string[];
};

const navItems: NavItem[] = [
  { id: "see", icon: "visibility", label: "観る", tint: "#6b7280" },
  { id: "eat", icon: "restaurant", label: "食べる", tint: "#6b7280" },
  { id: "shop", icon: "shopping_bag", label: "買う", tint: "#6b7280" },
  { id: "stay", icon: "hotel", label: "泊まる", tint: "#6b7280" },
  { id: "experience", icon: "sailing", label: "体験", tint: "#6b7280" },
];

const exploreNavItem = {
  id: "explore",
  icon: "compass" as const,
  label: "コンテンツ",
};

const exploreFeatureBanners: ExploreFeatureBanner[] = [
  {
    id: "story-main-visual",
    kind: "image",
    imageSrc: "/explore-banners/iwami-blue-sea-banner.png",
    imageAlt: "岩見物語旅",
    detailView: "iwami_story",
  },
  {
    id: "coming-soon",
    kind: "placeholder",
    placeholderLabel: "画像を設定予定",
  },
];

const islandOptions: ReadonlyArray<IslandOption> = [
  {
    id: "iki",
    label: "壱岐島",
    center: { lat: 33.7506, lng: 129.718 },
    zoom: 11.7,
    spotSlugPrefixes: ["iki-"],
  },
  {
    id: "tsushima",
    label: "対馬",
    center: { lat: 34.3824, lng: 129.3302 },
    zoom: 9.8,
    spotSlugPrefixes: ["tsushima-", "tsu-"],
  },
  {
    id: "goto",
    label: "五島列島",
    center: { lat: 32.7128, lng: 128.7422 },
    zoom: 9.7,
    spotSlugPrefixes: ["goto-"],
  },
  {
    id: "shodoshima",
    label: "小豆島",
    center: { lat: 34.4802, lng: 134.2772 },
    zoom: 10.9,
    spotSlugPrefixes: ["shodoshima-"],
  },
  {
    id: "other",
    label: "その他",
    center: { lat: 35.0, lng: 134.0 },
    zoom: 8.4,
    spotSlugPrefixes: ["other-"],
  },
];

const generationMessages = [
  "条件を整理しています",
  "出発地と滞在時間をもとに候補を絞っています",
  "移動手段に合わせて回りやすい順番を調整しています",
  "やりたいことに合わせて景色・食・体験を組み合わせています",
  "帰り方に合わせて無理のないルートを整えています",
  "3つのルート候補を作成しています",
] as const;

const generationStageToProgressIndex: Record<string, number> = {
  queued: 0,
  intent_parsing: 1,
  candidate_selection: 2,
  route_planning: 3,
  ai_refinement: 4,
  validating: 5,
  completed: 5,
  failed: 5,
};

const defaultSuggestions = ["浦富海岸", "岩井温泉", "道の駅きなんせ岩美", "東浜エリア", "岩美駅周辺"];

const departureOptions: ReadonlyArray<{ value: DeparturePoint; label: string }> = [
  { value: "iwami_station", label: "岩美駅" },
  { value: "current_location", label: "現在地" },
];

const returnTransportOptions: ReadonlyArray<{ value: ReturnTransportOption; label: string }> = [
  { value: "train", label: "電車" },
  { value: "car", label: "車" },
];

const returnStationOptions: ReadonlyArray<{ value: ReturnStationId; label: string }> = [
  { value: "iwami_station", label: "岩美駅" },
  { value: "higashihama_station", label: "東浜駅" },
  { value: "oiwa_station", label: "大岩駅" },
];

const SPOT_ADMIN_EMAIL = "tomoshibi.team@gmail.com";
const IWAMI_DEFAULT_CENTER: LatLngLiteral = { lat: 33.7506, lng: 129.718 };
const STATION_NODE_COORDINATES: Record<ReturnStationId, LatLngLiteral> = {
  iwami_station: { lat: 33.7506, lng: 129.718 },
  higashihama_station: { lat: 33.7506, lng: 129.718 },
  oiwa_station: { lat: 33.7506, lng: 129.718 },
};

function normalizeSpotLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_\-]/g, "");
}

function planStyleLabel(value: "scenic" | "food" | "balanced"): string {
  if (value === "scenic") return "景観重視";
  if (value === "food") return "食重視";
  return "バランス";
}

function planStyleRouteColor(value: "scenic" | "food" | "balanced"): string {
  if (value === "scenic") return "#1d4ed8";
  if (value === "food") return "#b45309";
  return "#0f172a";
}

const AppIcon = ({ name, className, filled = false }: AppIconProps) => {
  const common = {
    className,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "auto_awesome":
      return (
        <svg {...common} fill={filled ? "currentColor" : "none"}>
          <path d="M12 3l1.55 3.94L17.5 8.5l-3.95 1.56L12 14l-1.55-3.94L6.5 8.5l3.95-1.56L12 3z" />
          <path d="M19 13l.78 1.97L21.75 15l-1.97.78L19 17.75l-.78-1.97L16.25 15l1.97-.78L19 13z" />
          <path d="M5 14l.58 1.48L7.05 16l-1.47.58L5 18.05l-.58-1.47L2.95 16l1.47-.52L5 14z" />
        </svg>
      );
    case "my_location":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
        </svg>
      );
    case "visibility":
      return (
        <svg {...common} fill="none">
          <path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      );
    case "restaurant":
      return (
        <svg {...common} fill="none">
          <path d="M5 3v6M8 3v6M6.5 9v12" />
          <path d="M14 3v18M14 3c2.6 2 2.6 8 0 10" />
        </svg>
      );
    case "shopping_bag":
      return (
        <svg {...common} fill="none">
          <path d="M6.5 8h11l-1.1 12h-8.8L6.5 8z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
      );
    case "hotel":
      return (
        <svg {...common} fill="none">
          <path d="M4 18v-7.5a1.5 1.5 0 0 1 1.5-1.5h13a1.5 1.5 0 0 1 1.5 1.5V18" />
          <path d="M4 13h16" />
          <path d="M7 11.5h2.5" />
          <path d="M4 18h16" />
        </svg>
      );
    case "sailing":
      return (
        <svg {...common} fill="none">
          <path d="M12 3v11" />
          <path d="M12 4.5l6 4.5h-6z" fill={filled ? "currentColor" : "none"} />
          <path d="M4 14h16l-2 5H6l-2-5z" />
          <path d="M3 20c1.2.8 2.3 1.2 3.5 1.2 1.5 0 2.3-.5 3.4-1.2 1.1-.8 2-1.2 3.1-1.2s2 .4 3.1 1.2c1.1.7 1.9 1.2 3.4 1.2 1.2 0 2.3-.4 3.5-1.2" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 6.5 16 10l-2.7 7-5.3 2.2L9.8 12 12 6.5z" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" strokeWidth={0} />
        </svg>
      );
    case "close":
      return (
        <svg {...common} fill="none">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "arrow_back":
      return (
        <svg {...common} fill="none">
          <path d="M19 12H6" />
          <path d="m12 6-6 6 6 6" />
        </svg>
      );
    case "expand_more":
      return (
        <svg {...common} fill="none">
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} fill="none">
          <path d="m3 21 3.8-.8L19 8l-3-3L3.8 17.2 3 21z" />
          <path d="m14.5 6.5 3 3" />
        </svg>
      );
    case "add_circle":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "directions_walk":
      return (
        <svg {...common} fill="none">
          <circle cx="13" cy="4" r="2" />
          <path d="m12 8 2 3-1 3 2 6M8 20l3-6-1-4-3 3" />
        </svg>
      );
    case "pedal_bike":
      return (
        <svg {...common} fill="none">
          <circle cx="6" cy="17" r="3" />
          <circle cx="18" cy="17" r="3" />
          <path d="M10 17h4l-3-7h4l2 3" />
        </svg>
      );
    case "directions_car":
      return (
        <svg {...common} fill="none">
          <path d="M4 15v3h1a2 2 0 1 0 4 0h6a2 2 0 1 0 4 0h1v-3l-1.3-4a2 2 0 0 0-1.9-1.4H7.2a2 2 0 0 0-1.9 1.4L4 15z" />
          <circle cx="7" cy="18" r="1" />
          <circle cx="17" cy="18" r="1" />
        </svg>
      );
    case "directions_bus":
      return (
        <svg {...common} fill="none">
          <rect x="5" y="4" width="14" height="12" rx="2" />
          <path d="M5 10h14" />
          <circle cx="8" cy="17" r="1.5" />
          <circle cx="16" cy="17" r="1.5" />
        </svg>
      );
    case "person_circle":
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="9" r="3" />
          <path d="M6.8 18.3c1.4-2.2 3.2-3.3 5.2-3.3s3.8 1.1 5.2 3.3" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common} fill="none">
          <path d="M14 7V5a2 2 0 0 0-2-2H6.8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2H12a2 2 0 0 0 2-2v-2" />
          <path d="M10 12h10" />
          <path d="m17 8 3 4-3 4" />
        </svg>
      );
    default:
      return null;
  }
};

const transportButton = (active: boolean) =>
  `flex flex-col items-center justify-center aspect-square rounded-[1.25rem] border p-4 transition-all duration-200 ${
    active
      ? "border-[#9ca3af] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,245,249,0.92)_100%)] text-[#111827] shadow-[0_10px_22px_rgba(17,24,39,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]"
      : "border-[#d1d5db] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,247,250,0.92)_100%)] text-[#374151] shadow-[0_6px_14px_rgba(17,24,39,0.08),inset_0_1px_0_rgba(255,255,255,0.94)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(17,24,39,0.12),inset_0_1px_0_rgba(255,255,255,0.97)]"
  }`;

const chipButton = (active: boolean) =>
  `rounded-full px-5 py-2.5 text-[0.875rem] transition-all duration-200 ${
    active
      ? "border border-[#9ca3af] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,246,250,0.92)_100%)] text-[#111827] font-semibold shadow-[0_8px_18px_rgba(17,24,39,0.1),inset_0_1px_0_rgba(255,255,255,0.95)]"
      : "border border-[#d1d5db] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,247,250,0.92)_100%)] text-[#374151] font-medium shadow-[0_4px_10px_rgba(17,24,39,0.08),inset_0_1px_0_rgba(255,255,255,0.94)] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(17,24,39,0.12),inset_0_1px_0_rgba(255,255,255,0.97)]"
  }`;

const panelCardClass =
  "relative overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,250,251,0.95)_100%)] p-6 sm:p-8";

const panelFieldClass =
  "w-full rounded-2xl border border-[#d1d5db] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)] px-4 py-3.5 text-[0.9375rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_14px_rgba(17,24,39,0.08)] outline-none ring-[#111827]/20 transition-all hover:bg-[linear-gradient(180deg,#ffffff_0%,#f3f4f6_100%)] focus:ring focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_20px_rgba(17,24,39,0.12)]";

const panelIconButtonClass =
  "group relative flex items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,247,250,0.9)_100%)] p-2 text-[#111827] shadow-[0_8px_18px_rgba(17,24,39,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.98)] active:translate-y-0";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<IslandId>("iki");
  const [isIslandSheetOpen, setIsIslandSheetOpen] = useState(false);
  const [mapCameraTarget, setMapCameraTarget] = useState<MapCameraTarget | null>(null);
  const [islandSwitchToastMessage, setIslandSwitchToastMessage] = useState<string | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [plannerView, setPlannerView] = useState<PlannerView>("input");
  const [progressIndex, setProgressIndex] = useState(0);

  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [departurePoint, setDeparturePoint] = useState<DeparturePoint | null>(null);
  const [departureTime, setDepartureTime] = useState("");
  const [returnTransport, setReturnTransport] = useState<ReturnTransportOption | null>(null);
  const [returnStationId, setReturnStationId] = useState<ReturnStationId | null>(null);
  const [stayPlace, setStayPlace] = useState("");
  const [duration, setDuration] = useState<Duration | null>(null);
  const [customDurationMinutes, setCustomDurationMinutes] = useState("");
  const [mainTransports, setMainTransports] = useState<MainTransport[]>([]);
  const [mustSpots, setMustSpots] = useState<string[]>([]);
  const [spotInput, setSpotInput] = useState("");
  const [requestText, setRequestText] = useState("");
  const [isHeaderAuthMenuOpen, setIsHeaderAuthMenuOpen] = useState(false);
  const [headerAuthMenuError, setHeaderAuthMenuError] = useState<string | null>(null);
  const [isHeaderGoogleSigningIn, setIsHeaderGoogleSigningIn] = useState(false);
  const [isHeaderAuthSigningOut, setIsHeaderAuthSigningOut] = useState(false);
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [isDepartureDropdownOpen, setIsDepartureDropdownOpen] = useState(false);
  const [isReturnTransportDropdownOpen, setIsReturnTransportDropdownOpen] = useState(false);
  const [isReturnStationDropdownOpen, setIsReturnStationDropdownOpen] = useState(false);
  const [isFirebaseSignedIn, setIsFirebaseSignedIn] = useState(false);
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);
  const [firebaseAvatarUrl, setFirebaseAvatarUrl] = useState<string | null>(null);
  const [firebaseDisplayName, setFirebaseDisplayName] = useState<string | null>(null);
  const [isSpotAdminSidebarOpen, setIsSpotAdminSidebarOpen] = useState(false);
  const [spotAdminTargetId, setSpotAdminTargetId] = useState<string | null>(null);
  const [pendingSpotPositions, setPendingSpotPositions] = useState<Record<string, LatLngLiteral>>({});
  const [isLocatingCurrentPosition, setIsLocatingCurrentPosition] = useState(false);
  const [mapFocusCenter, setMapFocusCenter] = useState<LatLngLiteral | null>(null);
  const [mapViewportCenter, setMapViewportCenter] = useState<LatLngLiteral | null>(null);
  const [currentLocationError, setCurrentLocationError] = useState<string | null>(null);
  const [spots, setSpots] = useState<SpotMapPin[]>([]);
  const [spotsLoadError, setSpotsLoadError] = useState<string | null>(null);
  const [isSubmittingPlanRequest, setIsSubmittingPlanRequest] = useState(false);
  const [planRequestId, setPlanRequestId] = useState<string | null>(null);
  const [planPollToken, setPlanPollToken] = useState<string | null>(null);
  const [planSubmitError, setPlanSubmitError] = useState<string | null>(null);
  const [planGenerationError, setPlanGenerationError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<PlanGenerationResult | null>(null);
  const [isPlanResultSheetOpen, setIsPlanResultSheetOpen] = useState(false);
  const [activePlanResultId, setActivePlanResultId] = useState<string | null>(null);
  const [selectedPlanResultSpotId, setSelectedPlanResultSpotId] = useState<string | null>(null);
  const [generationProgressPercent, setGenerationProgressPercent] = useState(0);
  const [planValidationErrors, setPlanValidationErrors] = useState<Record<string, string>>({});
  const [isDraggingExploreSheet, setIsDraggingExploreSheet] = useState(false);
  const [exploreSheetDragOffset, setExploreSheetDragOffset] = useState(0);
  const [exploreSheetView, setExploreSheetView] = useState<"list" | "iwami_story">("list");
  const [isPlannerSheetPresented, setIsPlannerSheetPresented] = useState(false);
  const [isDraggingPlannerSheet, setIsDraggingPlannerSheet] = useState(false);
  const [plannerSheetDragOffset, setPlannerSheetDragOffset] = useState(0);
  const [isDraggingPlanResultSheet, setIsDraggingPlanResultSheet] = useState(false);
  const [planResultSheetDragOffset, setPlanResultSheetDragOffset] = useState(0);
  const headerAuthMenuRef = useRef<HTMLDivElement | null>(null);
  const departureDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnTransportDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnStationDropdownRef = useRef<HTMLDivElement | null>(null);
  const exploreSheetDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
  const plannerSheetDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
  const planResultSheetDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
  const plannerCloseTimerRef = useRef<number | null>(null);
  const generationPreviewTimerRef = useRef<number | null>(null);
  const planTraceCursorRef = useRef(0);
  const planTraceRequestIdRef = useRef<string | null>(null);

  const flushPlanTraceToConsole = (params: { requestId: string; trace: PlanTraceItem[] }) => {
    if (planTraceRequestIdRef.current !== params.requestId) {
      planTraceRequestIdRef.current = params.requestId;
      planTraceCursorRef.current = 0;
    }

    const nextTrace = params.trace.slice(planTraceCursorRef.current);
    if (nextTrace.length === 0) return;

    for (const item of nextTrace) {
      const prefix = `[AI Plan][${params.requestId}]`;
      const message = `${prefix} ${item.at} [${item.stage}] ${item.message}`;
      if (item.stage === "failed") {
        console.error(message, item.metadata ?? {});
      } else {
        console.info(message, item.metadata ?? {});
      }
    }

    planTraceCursorRef.current = params.trace.length;
  };

  const openPlanner = () => {
    if (plannerCloseTimerRef.current !== null) {
      window.clearTimeout(plannerCloseTimerRef.current);
      plannerCloseTimerRef.current = null;
    }
    setIsIslandSheetOpen(false);
    setIsPlannerOpen(true);
    setIsPlannerSheetPresented(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsPlannerSheetPresented(true));
    });
    setIsPlanResultSheetOpen(false);
    setPlannerView("input");
    setProgressIndex(0);
    setPlanRequestId(null);
    setPlanPollToken(null);
    setPlanResult(null);
    setPlanGenerationError(null);
    setGenerationProgressPercent(0);
    setPlanSubmitError(null);
    setPlanValidationErrors({});
    setSelectedPlanResultSpotId(null);
    planTraceRequestIdRef.current = null;
    planTraceCursorRef.current = 0;
  };

  const closePlanner = () => {
    clearGenerationPreviewTimer();
    setIsPlannerSheetPresented(false);
    if (plannerCloseTimerRef.current !== null) {
      window.clearTimeout(plannerCloseTimerRef.current);
    }
    plannerCloseTimerRef.current = window.setTimeout(() => {
      plannerCloseTimerRef.current = null;
      setIsPlannerOpen(false);
      setPlannerView("input");
      setProgressIndex(0);
      setPlanRequestId(null);
      setPlanPollToken(null);
      setPlanResult(null);
      setPlanGenerationError(null);
      setGenerationProgressPercent(0);
      setPlanSubmitError(null);
      setPlanValidationErrors({});
      setSelectedPlanResultSpotId(null);
      planTraceRequestIdRef.current = null;
      planTraceCursorRef.current = 0;
    }, 780);
  };

  const handleLocateCurrentPosition = () => {
    if (isLocatingCurrentPosition) return;
    if (!navigator.geolocation) {
      setCurrentLocationError("この端末では現在地を取得できません。");
      return;
    }

    setIsLocatingCurrentPosition(true);
    setCurrentLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapFocusCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocatingCurrentPosition(false);
      },
      (error) => {
        let message = "現在地を取得できませんでした。";
        if (error.code === error.PERMISSION_DENIED) {
          message = "位置情報の利用が許可されていません。";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "現在地情報を取得できませんでした。";
        } else if (error.code === error.TIMEOUT) {
          message = "現在地の取得がタイムアウトしました。";
        }
        setCurrentLocationError(message);
        setIsLocatingCurrentPosition(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const toggleMainTransport = (transport: MainTransport) => {
    setMainTransports((prev) =>
      prev.includes(transport) ? prev.filter((item) => item !== transport) : [...prev, transport],
    );
  };

  const clearValidationErrors = (...paths: string[]) => {
    if (paths.length === 0) return;
    setPlanValidationErrors((prev) => {
      const next = { ...prev };
      for (const path of paths) {
        delete next[path];
      }
      return next;
    });
  };

  const getValidationError = (...paths: string[]): string | null => {
    for (const path of paths) {
      const message = planValidationErrors[path];
      if (message) return message;
    }
    return null;
  };

  const handleSelectTravelStyle = (style: TravelStyle) => {
    setTravelStyle(style);
    setIsDepartureDropdownOpen(false);
    setIsReturnTransportDropdownOpen(false);
    setIsReturnStationDropdownOpen(false);
    clearValidationErrors("lodgingName", "returnTransport", "returnStationId");
    if (style === "stay") {
      setReturnTransport("car");
      setReturnStationId(null);
    } else {
      setStayPlace("");
      setReturnTransport(null);
      setReturnStationId(null);
    }
  };

  const handleSelectIsland = (islandId: IslandId) => {
    const nextIsland = islandOptions.find((item) => item.id === islandId);
    if (!nextIsland) return;
    setSelectedIsland(nextIsland.id);
    setMapCameraTarget({
      center: nextIsland.center,
      zoom: nextIsland.zoom,
    });
    setMapFocusCenter(null);
    setSelectedPlanResultSpotId(null);
    setActiveTab(null);
    setExploreSheetView("list");
    setIsIslandSheetOpen(false);
    setIslandSwitchToastMessage(`${nextIsland.label}に切り替えました`);
  };

  useEffect(() => {
    if (!isPlannerOpen || plannerView !== "generating") return;
    if (!planRequestId || !planPollToken) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await getPlanRequestStatus({
          planRequestId,
          pollToken: planPollToken,
        });
        if (cancelled) return;

        if (!response.ok) {
          setPlanGenerationError(response.message || "生成状態の取得に失敗しました。");
          setPlannerView("failed");
          return;
        }

        flushPlanTraceToConsole({
          requestId: planRequestId,
          trace: response.trace,
        });

        setProgressIndex((prev) => {
          const next = generationStageToProgressIndex[response.generationStage] ?? prev;
          return Math.max(prev, Math.min(next, generationMessages.length - 1));
        });
        setGenerationProgressPercent(response.progressPercent);

        if (response.status === "completed" && response.result) {
          setPlanResult(response.result);
          setActivePlanResultId(response.result.plans[0]?.id ?? null);
          setSelectedPlanResultSpotId(null);
          setActiveTab(null);
          setIsPlannerSheetPresented(false);
          clearGenerationPreviewTimer();
          setIsPlannerOpen(false);
          setIsPlanResultSheetOpen(true);
          setPlannerView("result");
          return;
        }

        if (response.status === "failed") {
          console.error(`[AI Plan][${planRequestId}] generation failed`, response.error ?? {});
          setPlanGenerationError(response.error?.message ?? "ルート生成に失敗しました。");
          setPlannerView("failed");
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "生成状態の取得中にエラーが発生しました。";
        setPlanGenerationError(message);
        setPlannerView("failed");
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isPlannerOpen, plannerView, planPollToken, planRequestId]);

  useEffect(() => {
    const auth = getFirebaseClientAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser || nextUser.isAnonymous) {
        setIsFirebaseSignedIn(false);
        setFirebaseUserEmail(null);
        setFirebaseAvatarUrl(null);
        setFirebaseDisplayName(null);
        setIsSpotAdminSidebarOpen(false);
        setSpotAdminTargetId(null);
        return;
      }

      setIsFirebaseSignedIn(true);
      setFirebaseUserEmail(nextUser.email ?? null);
      setFirebaseAvatarUrl(nextUser.photoURL ?? null);
      setFirebaseDisplayName(nextUser.displayName ?? nextUser.email ?? null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isHeaderAuthMenuOpen) return;

    const closeMenuByOutsideClick = (event: MouseEvent) => {
      if (!headerAuthMenuRef.current) return;
      if (!headerAuthMenuRef.current.contains(event.target as Node)) {
        setIsHeaderAuthMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenuByOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeMenuByOutsideClick);
    };
  }, [isHeaderAuthMenuOpen]);

  useEffect(() => {
    if (!isDepartureDropdownOpen && !isReturnTransportDropdownOpen && !isReturnStationDropdownOpen) return;

    const closeDropdownByOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (departureDropdownRef.current?.contains(target)) return;
      if (returnTransportDropdownRef.current?.contains(target)) return;
      if (returnStationDropdownRef.current?.contains(target)) return;
      setIsDepartureDropdownOpen(false);
      setIsReturnTransportDropdownOpen(false);
      setIsReturnStationDropdownOpen(false);
    };

    document.addEventListener("mousedown", closeDropdownByOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeDropdownByOutsideClick);
    };
  }, [isDepartureDropdownOpen, isReturnTransportDropdownOpen, isReturnStationDropdownOpen]);

  useEffect(() => {
    if (!currentLocationError) return;
    const timer = window.setTimeout(() => setCurrentLocationError(null), 5000);
    return () => window.clearTimeout(timer);
  }, [currentLocationError]);

  useEffect(() => {
    if (!islandSwitchToastMessage) return;
    const timer = window.setTimeout(() => setIslandSwitchToastMessage(null), 1800);
    return () => window.clearTimeout(timer);
  }, [islandSwitchToastMessage]);

  useEffect(() => {
    const unsubscribe = subscribePublishedSpots({
      onData: (nextSpots) => {
        setSpots(nextSpots);
        setSpotsLoadError(null);
      },
      onError: (error) => {
        setSpotsLoadError(error.message);
      },
    });

    return unsubscribe;
  }, []);

  const progressPercent = Math.max(
    generationProgressPercent,
    ((progressIndex + 1) / generationMessages.length) * 100,
  );
  const selectedDepartureLabel = departureOptions.find((option) => option.value === departurePoint)?.label;
  const selectedReturnTransportLabel = returnTransportOptions.find((option) => option.value === returnTransport)?.label;
  const selectedReturnStationLabel = returnStationOptions.find((option) => option.value === returnStationId)?.label;

  const parsedCustomDurationMinutes = Number.parseInt(customDurationMinutes, 10);
  const hasValidCustomDurationMinutes = Number.isFinite(parsedCustomDurationMinutes) && parsedCustomDurationMinutes >= 1;

  const isPlanFormValid = (() => {
    const baseValid = Boolean(travelStyle && departurePoint && departureTime && duration && mainTransports.length > 0);
    if (!baseValid) return false;

    if (departurePoint === "current_location" && !mapFocusCenter) return false;
    if (duration === "custom" && !hasValidCustomDurationMinutes) return false;

    if (travelStyle === "day") {
      if (!returnTransport) return false;
      if (returnTransport === "train") return Boolean(returnStationId);
      return true;
    }

    return Boolean(stayPlace.trim());
  })();

  const generationNotes = useMemo(() => {
    const notes: string[] = [];
    if (mainTransports.includes("rental_cycle")) {
      notes.push("レンタサイクルを選択しているため、貸出場所も含めて調整しています。");
    }
    if (requestText.trim()) {
      notes.push(`「${requestText.trim()}」という要望を反映しています。`);
    }
    return notes.slice(0, 2);
  }, [mainTransports, requestText]);

  const clearGenerationPreviewTimer = () => {
    if (generationPreviewTimerRef.current === null) return;
    window.clearTimeout(generationPreviewTimerRef.current);
    generationPreviewTimerRef.current = null;
  };

  const selectedIslandOption = useMemo(
    () => islandOptions.find((island) => island.id === selectedIsland) ?? islandOptions[0],
    [selectedIsland],
  );

  const generationConditionChips = useMemo(() => {
    const transportLabels: Record<MainTransport, { label: string; icon: IconName }> = {
      walk: { label: "徒歩", icon: "directions_walk" },
      rental_cycle: { label: "レンタサイクル", icon: "pedal_bike" },
      car: { label: "車", icon: "directions_car" },
      bus: { label: "バス", icon: "directions_bus" },
    };
    const durationLabel =
      duration === "2h"
        ? "2時間"
        : duration === "4h"
          ? "4時間"
          : duration === "custom" && hasValidCustomDurationMinutes
            ? `${parsedCustomDurationMinutes}分`
            : null;
    const chips: Array<{ label: string; icon: IconName }> = [
      { label: selectedIslandOption.label, icon: "landscape" },
    ];

    if (durationLabel) chips.push({ label: durationLabel, icon: "schedule" });
    for (const transport of mainTransports.slice(0, 2)) {
      chips.push(transportLabels[transport]);
    }
    if (selectedReturnTransportLabel) {
      chips.push({ label: `帰りは${selectedReturnTransportLabel}`, icon: selectedReturnTransportLabel === "車" ? "directions_car" : "schedule" });
    }
    if (mustSpots[0]) {
      chips.push({ label: mustSpots[0], icon: "history_edu" });
    }

    return chips.slice(0, 5);
  }, [
    duration,
    hasValidCustomDurationMinutes,
    mainTransports,
    mustSpots,
    parsedCustomDurationMinutes,
    selectedIslandOption.label,
    selectedReturnTransportLabel,
  ]);

  const islandScopedSpots = useMemo(() => {
    const prefixes = selectedIslandOption.spotSlugPrefixes;
    if (prefixes.length === 0) return spots;
    return spots.filter((spot) =>
      prefixes.some((prefix) => spot.slug.startsWith(prefix) || spot.id.startsWith(prefix)),
    );
  }, [selectedIslandOption, spots]);

  const visibleSpots = useMemo(() => {
    if (activeTab && navItems.some((item) => item.id === activeTab)) {
      return islandScopedSpots.filter((spot) => spot.primaryCategory === activeTab);
    }
    return islandScopedSpots;
  }, [activeTab, islandScopedSpots]);
  const isExploreSheetOpen = activeTab === exploreNavItem.id;
  const isCategorySheetOpen = isExploreSheetOpen;
  const isAnyBottomSheetOpen = isCategorySheetOpen || isIslandSheetOpen;
  const showFloatingAiCta = !isAnyBottomSheetOpen && !isPlanResultSheetOpen && !isPlannerOpen;

  const spotLookup = useMemo(() => {
    const byKey = new Map<string, SpotMapPin>();
    for (const spot of islandScopedSpots) {
      byKey.set(spot.id, spot);
      byKey.set(spot.slug, spot);
      byKey.set(normalizeSpotLookupKey(spot.id), spot);
      byKey.set(normalizeSpotLookupKey(spot.slug), spot);
      byKey.set(normalizeSpotLookupKey(spot.shortName), spot);
      byKey.set(normalizeSpotLookupKey(spot.nameJa), spot);
    }
    return byKey;
  }, [islandScopedSpots]);

  const activePlanResult = useMemo(() => {
    const plans = planResult?.plans ?? [];
    if (plans.length === 0) return null;
    if (activePlanResultId) {
      const matched = plans.find((plan) => plan.id === activePlanResultId);
      if (matched) return matched;
    }
    return plans[0] ?? null;
  }, [activePlanResultId, planResult]);

  useEffect(() => {
    const plans = planResult?.plans ?? [];
    if (plans.length === 0) {
      setActivePlanResultId(null);
      return;
    }
    setActivePlanResultId((prev) => (prev && plans.some((plan) => plan.id === prev) ? prev : plans[0]?.id ?? null));
  }, [planResult]);

  const activePlanTimelineWithLocations = useMemo(() => {
    if (!activePlanResult) return [];
    return activePlanResult.timeline.map((item, index) => {
      const stationLocation =
        item.spotId === "iwami_station" || item.spotId === "higashihama_station" || item.spotId === "oiwa_station"
          ? STATION_NODE_COORDINATES[item.spotId]
          : null;
      const fallbackCurrentLocation =
        item.spotId === "current_location" ? (mapFocusCenter ?? mapViewportCenter ?? IWAMI_DEFAULT_CENTER) : null;

      const normalizedSpotId = normalizeSpotLookupKey(item.spotId);
      const normalizedSpotName = normalizeSpotLookupKey(item.spotName);
      const matchedSpot =
        spotLookup.get(item.spotId) ??
        spotLookup.get(normalizedSpotId) ??
        spotLookup.get(item.spotName) ??
        spotLookup.get(normalizedSpotName) ??
        null;

      const location = stationLocation ?? fallbackCurrentLocation ?? (matchedSpot ? { lat: matchedSpot.lat, lng: matchedSpot.lng } : null);
      const mapSpotId = matchedSpot?.id ?? (item.spotId in STATION_NODE_COORDINATES ? item.spotId : null);

      return {
        ...item,
        key: `${activePlanResult.id}-${index}-${item.spotId}-${item.arrivalAt}`,
        location,
        mapSpotId,
      };
    });
  }, [activePlanResult, mapFocusCenter, mapViewportCenter, spotLookup]);

  const activePlanRoutePath = useMemo(() => {
    const route: LatLngLiteral[] = [];
    for (const item of activePlanTimelineWithLocations) {
      if (!item.location) continue;
      const prev = route[route.length - 1];
      if (prev && Math.abs(prev.lat - item.location.lat) < 0.000001 && Math.abs(prev.lng - item.location.lng) < 0.000001) {
        continue;
      }
      route.push(item.location);
    }
    return route;
  }, [activePlanTimelineWithLocations]);

  const activePlanRouteColor = activePlanResult ? planStyleRouteColor(activePlanResult.planStyle) : "#1d4ed8";

  const activePlanMapSpots = useMemo(() => {
    if (!isPlanResultSheetOpen || !activePlanResult) return [];
    const byId = new Map(islandScopedSpots.map((spot) => [spot.id, spot]));
    const picked: SpotMapPin[] = [];
    const pickedIds = new Set<string>();

    for (const item of activePlanTimelineWithLocations) {
      if (!item.mapSpotId || pickedIds.has(item.mapSpotId)) continue;
      const spot = byId.get(item.mapSpotId);
      if (!spot) continue;
      picked.push(spot);
      pickedIds.add(spot.id);
    }

    return picked;
  }, [activePlanResult, activePlanTimelineWithLocations, islandScopedSpots, isPlanResultSheetOpen]);

  const buildPreviewPlanResult = (): PlanGenerationResult => {
    const sourceSpots = islandScopedSpots.length > 0 ? islandScopedSpots : visibleSpots;
    const fallbackSpots = sourceSpots.slice(0, 9);
    const durationMinutes =
      duration === "2h"
        ? 120
        : duration === "4h"
          ? 240
          : duration === "custom" && hasValidCustomDurationMinutes
            ? parsedCustomDurationMinutes
            : 180;
    const transportModes = mainTransports.length > 0 ? mainTransports : (["car"] as MainTransport[]);
    const startTime = departureTime || "10:00";
    const [startHour = 10, startMinute = 0] = startTime.split(":").map((value) => Number.parseInt(value, 10));
    const startMinutes = (Number.isFinite(startHour) ? startHour : 10) * 60 + (Number.isFinite(startMinute) ? startMinute : 0);
    const formatClock = (minutes: number) => {
      const normalized = ((minutes % 1440) + 1440) % 1440;
      const hour = Math.floor(normalized / 60).toString().padStart(2, "0");
      const minute = (normalized % 60).toString().padStart(2, "0");
      return `${hour}:${minute}`;
    };
    const planStyles: Array<PlanGenerationResult["plans"][number]["planStyle"]> = ["scenic", "food", "balanced"];
    const planTitles = ["景色を楽しむ", "島の味を楽しむ", "バランスよくめぐる"];
    const selectedRequestText = requestText.trim();

    return {
      summary: `${selectedIslandOption.label}での条件に合わせた旅ルートのプレビューです。`,
      generationNotes: [
        "現在はUI確認用に、入力条件と登録スポットからプレビュー候補を表示しています。",
        "本生成ではAIとルールベースで営業時間、移動時間、帰着条件を確認します。",
      ],
      warnings: [],
      plans: planStyles.map((planStyle, planIndex) => {
        const selectedSpots = fallbackSpots.slice(planIndex * 3, planIndex * 3 + 3);
        const timelineSpots = selectedSpots.length > 0 ? selectedSpots : fallbackSpots.slice(0, 3);
        const timeline: PlanTimelineItem[] = timelineSpots.map((spot, index) => {
          const arrivalMinutes = startMinutes + 20 + index * 55 + planIndex * 8;
          const stayMinutes = index === 0 ? 35 : index === 1 ? 45 : 30;
          return {
            spotId: spot.slug || spot.id,
            spotName: spot.shortName || spot.nameJa,
            arrivalAt: formatClock(arrivalMinutes),
            departureAt: formatClock(arrivalMinutes + stayMinutes),
            stayMinutes,
            transportFromPrev: index === 0 ? "none" : transportModes[0],
            travelMinutesFromPrev: index === 0 ? 0 : 15 + index * 5,
            note:
              index === 0
                ? "最初に立ち寄りやすいスポットとして配置しています。"
                : selectedRequestText
                  ? `「${selectedRequestText}」に合う立ち寄り先として組み込んでいます。`
                  : "移動しやすさと滞在時間のバランスを見て配置しています。",
          };
        });

        return {
          id: `preview-plan-${planIndex + 1}`,
          title: planTitles[planIndex],
          description: `${selectedIslandOption.label}を${planTitles[planIndex]}流れでめぐる候補です。`,
          planStyle,
          matchSummary: selectedRequestText
            ? `入力された「${selectedRequestText}」という希望をもとに、${planTitles[planIndex]}方向でまとめています。`
            : "入力条件をもとに、回りやすい順番で候補をまとめています。",
          reasonWhyRecommended: `候補${planIndex + 1}は、${planTitles[planIndex]}ことを重視したルートです。`,
          estimatedDurationMinutes: Math.min(durationMinutes, 180 + planIndex * 20),
          transportModes,
          waypoints: timeline.map((item) => ({ id: item.spotId, name: item.spotName })),
          timeline,
          constraintChecks: [
            { code: "preview", passed: true, message: "プレビュー表示用の候補です。" },
          ],
          tags: [selectedIslandOption.label, planTitles[planIndex]],
          couponCompatible: false,
          storyCompatible: true,
        };
      }),
    };
  };

  const showPlanPreviewResult = () => {
    const previewResult = buildPreviewPlanResult();
    setPlanResult(previewResult);
    setActivePlanResultId(previewResult.plans[0]?.id ?? null);
    setSelectedPlanResultSpotId(null);
    setActiveTab(null);
    setIsPlannerSheetPresented(false);
    setIsPlannerOpen(false);
    setIsPlanResultSheetOpen(true);
    setPlannerView("result");
  };

  const getSheetDragMaxOffset = () => {
    if (typeof window === "undefined") return 720;
    return Math.max(420, Math.floor(window.innerHeight * 0.9));
  };

  const getSheetCloseThreshold = () => {
    if (typeof window === "undefined") return 140;
    return Math.max(140, Math.floor(window.innerHeight * 0.16));
  };

  const handleExploreSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isExploreSheetOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    exploreSheetDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    setIsDraggingExploreSheet(true);
    setExploreSheetDragOffset(0);
    event.preventDefault();
  };

  const handlePlanResultSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPlanResultSheetOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    planResultSheetDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    setIsDraggingPlanResultSheet(true);
    setPlanResultSheetDragOffset(0);
    event.preventDefault();
  };

  const handlePlannerSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPlannerOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    plannerSheetDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    setIsDraggingPlannerSheet(true);
    setPlannerSheetDragOffset(0);
    event.preventDefault();
  };

  useEffect(() => {
    if (!isDraggingExploreSheet) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = exploreSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, Math.min(getSheetDragMaxOffset(), event.clientY - drag.startY));
      setExploreSheetDragOffset(delta);
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = exploreSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, event.clientY - drag.startY);
      const shouldClose = delta > getSheetCloseThreshold();
      exploreSheetDragRef.current = null;
      setIsDraggingExploreSheet(false);
      if (shouldClose) {
        setActiveTab((prev) => (prev === exploreNavItem.id ? null : prev));
        window.requestAnimationFrame(() => setExploreSheetDragOffset(0));
      } else {
        setExploreSheetDragOffset(0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [isDraggingExploreSheet]);

  useEffect(() => {
    if (!isDraggingPlannerSheet) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = plannerSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, Math.min(getSheetDragMaxOffset(), event.clientY - drag.startY));
      setPlannerSheetDragOffset(delta);
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = plannerSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, event.clientY - drag.startY);
      const shouldClose = delta > getSheetCloseThreshold();
      plannerSheetDragRef.current = null;
      setIsDraggingPlannerSheet(false);
      if (shouldClose) {
        closePlanner();
        window.requestAnimationFrame(() => setPlannerSheetDragOffset(0));
      } else {
        setPlannerSheetDragOffset(0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [isDraggingPlannerSheet]);

  useEffect(() => {
    if (!isDraggingPlanResultSheet) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = planResultSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, Math.min(getSheetDragMaxOffset(), event.clientY - drag.startY));
      setPlanResultSheetDragOffset(delta);
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = planResultSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, event.clientY - drag.startY);
      const shouldClose = delta > getSheetCloseThreshold();
      planResultSheetDragRef.current = null;
      setIsDraggingPlanResultSheet(false);
      if (shouldClose) {
        setIsPlanResultSheetOpen(false);
        window.requestAnimationFrame(() => setPlanResultSheetDragOffset(0));
      } else {
        setPlanResultSheetDragOffset(0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [isDraggingPlanResultSheet]);

  useEffect(() => {
    if (isExploreSheetOpen) return;
    setIsDraggingExploreSheet(false);
    setExploreSheetDragOffset(0);
    exploreSheetDragRef.current = null;
    setExploreSheetView("list");
  }, [isExploreSheetOpen]);

  useEffect(() => {
    if (isPlannerOpen) return;
    setIsPlannerSheetPresented(false);
    setIsDraggingPlannerSheet(false);
    setPlannerSheetDragOffset(0);
    plannerSheetDragRef.current = null;
  }, [isPlannerOpen]);

  useEffect(() => {
    return () => {
      if (plannerCloseTimerRef.current !== null) {
        window.clearTimeout(plannerCloseTimerRef.current);
      }
      clearGenerationPreviewTimer();
    };
  }, []);

  useEffect(() => {
    if (isPlanResultSheetOpen) return;
    setIsDraggingPlanResultSheet(false);
    setPlanResultSheetDragOffset(0);
    planResultSheetDragRef.current = null;
  }, [isPlanResultSheetOpen]);

  useEffect(() => {
    setSelectedPlanResultSpotId(null);
  }, [activePlanResultId]);

  const mapPins = useMemo(
    () =>
      (isPlanResultSheetOpen ? activePlanMapSpots : visibleSpots).map((spot) => ({
        id: spot.id,
        label: spot.shortName,
        lat: pendingSpotPositions[spot.id]?.lat ?? spot.lat,
        lng: pendingSpotPositions[spot.id]?.lng ?? spot.lng,
        category: spot.primaryCategory,
        imageUrl: spot.imageUrl,
      })),
    [activePlanMapSpots, isPlanResultSheetOpen, pendingSpotPositions, visibleSpots],
  );

  const removeSpot = (spot: string) => setMustSpots((prev) => prev.filter((value) => value !== spot));

  const addSpot = () => {
    const value = spotInput.trim();
    if (!value) return;
    setMustSpots((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setSpotInput("");
  };

  const buildPlanRequestPayload = (): CreatePlanRequestPayload | null => {
    if (!travelStyle || !departurePoint || !duration || mainTransports.length === 0) {
      return null;
    }

    if (!departureTime.trim()) {
      return null;
    }

    if (departurePoint === "current_location" && !mapFocusCenter) {
      return null;
    }

    if (duration === "custom" && !hasValidCustomDurationMinutes) {
      return null;
    }

    const isDayTrip = travelStyle === "day";
    const effectiveReturnTransport: ReturnTransportOption = isDayTrip ? (returnTransport ?? "car") : "car";
    const effectiveReturnStationId: ReturnStationId | null =
      effectiveReturnTransport === "train" ? returnStationId : null;

    if (effectiveReturnTransport === "train" && !effectiveReturnStationId) {
      return null;
    }

    const payload: CreatePlanRequestPayload = {
      tripStyle: travelStyle === "day" ? "day_trip" : "overnight",
      departureType: departurePoint,
      departureAt: departureTime,
      durationType: duration,
      returnTransport: effectiveReturnTransport,
      returnStationId: effectiveReturnStationId,
      lodgingName: travelStyle === "stay" ? (stayPlace.trim() || null) : null,
      localTransports: mainTransports,
      desiredSpots: mustSpots,
      tripPrompt: requestText.trim() || null,
    };

    if (departurePoint === "current_location" && mapFocusCenter) {
      payload.departureLocation = {
        lat: mapFocusCenter.lat,
        lng: mapFocusCenter.lng,
      };
    }

    if (duration === "custom") {
      payload.customDurationMinutes = parsedCustomDurationMinutes;
    }

    return payload;
  };

  const handleSubmitPlanRequest = async () => {
    if (isSubmittingPlanRequest) return;

    const payload = buildPlanRequestPayload();
    if (!payload) {
      setPlanSubmitError(null);
      setPlanValidationErrors({});
      setPlanResult(null);
      setPlanGenerationError(null);
      setGenerationProgressPercent(0);
      setProgressIndex(0);
      setPlannerView("generating");
      clearGenerationPreviewTimer();
      generationPreviewTimerRef.current = window.setTimeout(() => {
        generationPreviewTimerRef.current = null;
        showPlanPreviewResult();
      }, 3000);
      return;
    }

    setIsSubmittingPlanRequest(true);
    setPlanSubmitError(null);
    setPlanValidationErrors({});

    try {
      const response = await createPlanRequest(payload);
      if (response.ok) {
        setPlanRequestId(response.planRequestId);
        setPlanPollToken(response.pollToken);
        setPlanResult(null);
        setPlanGenerationError(null);
        setGenerationProgressPercent(0);
        setPlannerView("generating");
        setProgressIndex(0);
        planTraceRequestIdRef.current = response.planRequestId;
        planTraceCursorRef.current = 0;
        clearGenerationPreviewTimer();
        generationPreviewTimerRef.current = window.setTimeout(() => {
          generationPreviewTimerRef.current = null;
          showPlanPreviewResult();
        }, 3000);
        console.info(`[AI Plan][${response.planRequestId}] request accepted. polling started.`);
        return;
      }

      const nextFieldErrors = (response.details ?? []).reduce<Record<string, string>>((acc, detail) => {
        if (!acc[detail.path]) {
          acc[detail.path] = detail.message;
        }
        return acc;
      }, {});

      setPlanValidationErrors(nextFieldErrors);
      setPlanSubmitError(response.message || "ルート計画リクエストの送信に失敗しました。");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "通信エラーが発生しました。時間をおいて再度お試しください。";
      setPlanSubmitError(message);
    } finally {
      setIsSubmittingPlanRequest(false);
    }
  };

  const handleRetryPlanPolling = () => {
    if (!planRequestId || !planPollToken) {
      setPlannerView("input");
      return;
    }
    setPlanGenerationError(null);
    setPlannerView("generating");
  };

  const runGoogleSignInFlow = async (): Promise<{ ok: boolean; errorMessage?: string }> => {
    const auth = getFirebaseClientAuth();
    if (!auth) {
      const missingKeys = getFirebaseMissingEnvKeys();
      const missing = missingKeys.length > 0 ? ` (${missingKeys.join(", ")})` : "";
      return { ok: false, errorMessage: `Firebase設定が不足しています${missing}` };
    }

    if (auth.currentUser?.uid && !auth.currentUser.isAnonymous) {
      return { ok: true };
    }

    setIsHeaderGoogleSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Googleログインに失敗しました。";
      return { ok: false, errorMessage: message };
    } finally {
      setIsHeaderGoogleSigningIn(false);
    }
  };

  const handleHeaderGoogleSignInPress = async () => {
    if (isHeaderGoogleSigningIn || isFirebaseSignedIn) return;
    setHeaderAuthMenuError(null);
    const result = await runGoogleSignInFlow();
    if (!result.ok) {
      if (result.errorMessage) setHeaderAuthMenuError(result.errorMessage);
      return;
    }
    setIsHeaderAuthMenuOpen(false);
  };

  const handleHeaderSignOutPress = async () => {
    if (isHeaderAuthSigningOut || isHeaderGoogleSigningIn || !isFirebaseSignedIn) return;

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
      setIsSpotAdminSidebarOpen(false);
      setSpotAdminTargetId(null);
      setIsHeaderAuthMenuOpen(false);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0 ? error.message : "ログアウトに失敗しました。";
      setHeaderAuthMenuError(message);
    } finally {
      setIsHeaderAuthSigningOut(false);
    }
  };

  const normalizedFirebaseEmail = firebaseUserEmail?.trim().toLowerCase() ?? null;
  const isSpotAdmin = normalizedFirebaseEmail === SPOT_ADMIN_EMAIL;
  const adminEditingSpot = spotAdminTargetId ? spots.find((spot) => spot.id === spotAdminTargetId) ?? null : null;
  const adminEditingDraggedPosition = spotAdminTargetId ? pendingSpotPositions[spotAdminTargetId] ?? null : null;

  const handleMapSpotClick = (pin: { id: string }) => {
    if (!isSpotAdmin) return;
    setSpotAdminTargetId(pin.id);
    setIsSpotAdminSidebarOpen(true);
  };

  const handleMapSpotPositionChange = (nextPosition: { id: string; lat: number; lng: number }) => {
    if (!isSpotAdmin) return;
    setPendingSpotPositions((prev) => ({
      ...prev,
      [nextPosition.id]: {
        lat: nextPosition.lat,
        lng: nextPosition.lng,
      },
    }));
    if (spotAdminTargetId !== nextPosition.id) {
      setSpotAdminTargetId(nextPosition.id);
    }
    setIsSpotAdminSidebarOpen(true);
  };

  const handleSpotAdminSaved = (params: { spotId: string; spot: SpotAdminRecord }) => {
    const location = params.spot.location;
    const nextLat = typeof location?.lat === "number" && Number.isFinite(location.lat) ? location.lat : null;
    const nextLng = typeof location?.lng === "number" && Number.isFinite(location.lng) ? location.lng : null;
    if (nextLat == null || nextLng == null) return;
    setPendingSpotPositions((prev) => ({
      ...prev,
      [params.spotId]: {
        lat: nextLat,
        lng: nextLng,
      },
    }));
  };

  const handleSpotAdminDeleted = (params: { spotId: string }) => {
    setPendingSpotPositions((prev) => {
      const next = { ...prev };
      delete next[params.spotId];
      return next;
    });
    if (spotAdminTargetId === params.spotId) {
      setSpotAdminTargetId(null);
    }
    setIsSpotAdminSidebarOpen(false);
  };

  const handleCreateSpotFromCenter = async () => {
    if (!isSpotAdmin || isCreatingSpot) return;
    const center = mapViewportCenter ?? mapFocusCenter ?? IWAMI_DEFAULT_CENTER;

    setIsCreatingSpot(true);
    setHeaderAuthMenuError(null);

    try {
      const created = await createSpotRecord({
        lat: center.lat,
        lng: center.lng,
      });
      const createdSpotId = typeof created.id === "string" ? created.id : "";
      if (!createdSpotId) {
        throw new Error("新規スポットIDの取得に失敗しました。");
      }
      setPendingSpotPositions((prev) => ({
        ...prev,
        [createdSpotId]: {
          lat: center.lat,
          lng: center.lng,
        },
      }));
      setSpotAdminTargetId(createdSpotId);
      setIsSpotAdminSidebarOpen(true);
      setIsHeaderAuthMenuOpen(false);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "新規スポットの追加に失敗しました。";
      setHeaderAuthMenuError(message);
    } finally {
      setIsCreatingSpot(false);
    }
  };

  const accessibleLabel = isFirebaseSignedIn ? `ログイン中: ${firebaseDisplayName ?? "Googleユーザー"}` : "ゲストで利用中";
  const isHeaderAuthActionBusy = isHeaderGoogleSigningIn || isHeaderAuthSigningOut;
  const headerAuthButtonLabel = isHeaderAuthActionBusy
    ? isFirebaseSignedIn
      ? "ログアウト中..."
      : "Googleログイン中..."
    : isFirebaseSignedIn
      ? "ログアウト"
      : "Googleでログイン";

  return (
    <main
      className="font-body relative h-screen w-screen overflow-hidden bg-[#f8fafc] text-[#181c20]"
      style={{ minHeight: "max(884px, 100dvh)" }}
    >
      <GoogleMapBackground
        className="absolute inset-0"
        cameraTarget={mapCameraTarget}
        focusCenter={mapFocusCenter}
        pins={mapPins}
        enablePinEditing={isSpotAdmin && isSpotAdminSidebarOpen}
        disableClustering={isPlanResultSheetOpen}
        selectedSpotId={selectedPlanResultSpotId}
        routePath={isPlanResultSheetOpen ? activePlanRoutePath : []}
        routeColor={activePlanRouteColor}
        onSpotClick={handleMapSpotClick}
        onSpotPositionChange={handleMapSpotPositionChange}
        onViewportCenterChange={setMapViewportCenter}
      />
      <div className="pointer-events-none absolute inset-0 bg-transparent" />
      {spotsLoadError ? (
        <div className="pointer-events-none absolute top-20 left-6 z-40">
          <p className="rounded-xl border border-[#f2c3c3] bg-white/90 px-3 py-2 text-[11px] leading-4 font-medium text-[#b42318] shadow-sm backdrop-blur-sm">
            スポット読込エラー: {spotsLoadError}
          </p>
        </div>
      ) : null}

      {planResult && !isPlanResultSheetOpen && !isPlannerOpen ? (
        <div className="absolute top-20 left-6 z-40">
          <button
            type="button"
            onClick={() => setIsPlanResultSheetOpen(true)}
            className="group relative flex h-10 overflow-hidden rounded-full border border-[#d1d5db] bg-white/92 px-4 shadow-[0_12px_26px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="relative flex items-center">
              <span className="font-label text-xs font-semibold tracking-[0.01em] text-[#111827]">生成結果を表示</span>
            </span>
          </button>
        </div>
      ) : null}

      <div className="absolute top-6 right-6 z-50 flex items-start gap-2">
        <button
          type="button"
          onClick={() => {
            setHeaderAuthMenuError(null);
            setIsHeaderAuthMenuOpen(false);
            setActiveTab(null);
            setExploreSheetView("list");
            setIsIslandSheetOpen(true);
          }}
          aria-label="表示する島を選ぶ"
          className="group relative inline-flex h-10 items-center rounded-full border border-white/80 bg-white/76 px-4 text-[#111827] shadow-[0_8px_18px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0_10px_20px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.95)] active:translate-y-0"
        >
          <span className="font-label text-[13px] font-semibold tracking-[0.01em]">{selectedIslandOption.label}</span>
        </button>
      </div>

      <SpotAdminSidebar
        open={isSpotAdmin && isSpotAdminSidebarOpen && Boolean(spotAdminTargetId)}
        spotId={spotAdminTargetId}
        spotLabel={adminEditingSpot?.shortName}
        draggedPosition={adminEditingDraggedPosition}
        onClose={() => setIsSpotAdminSidebarOpen(false)}
        onSaved={handleSpotAdminSaved}
        onDeleted={handleSpotAdminDeleted}
      />

      <div className="absolute right-6 z-40" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 164px)" }}>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleLocateCurrentPosition}
            disabled={isLocatingCurrentPosition}
            aria-label="現在地を地図に表示"
            className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white/88 shadow-[0_16px_30px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/96 active:translate-y-0 ${
              isLocatingCurrentPosition ? "cursor-wait opacity-85" : ""
            }`}
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,244,246,0.86)_100%)]" />
            <span className="pointer-events-none absolute inset-[7px] rounded-full border border-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-white to-[#f3f4f6] text-[#111827] shadow-[0_4px_10px_rgba(17,24,39,0.14)]">
              <AppIcon
                name="my_location"
                className={`h-4.5 w-4.5 ${isLocatingCurrentPosition ? "animate-pulse" : ""}`}
              />
            </span>
          </button>
          {currentLocationError ? (
            <p className="max-w-[220px] rounded-xl border border-[#f2c3c3] bg-white/95 px-3 py-2 text-[11px] leading-5 text-[#b42318] shadow-sm backdrop-blur-sm">
              {currentLocationError}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 z-[48] flex justify-center px-3 transition-all duration-200 ease-out ${
          showFloatingAiCta ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 102px)" }}
      >
        <button
          type="button"
          onClick={openPlanner}
          aria-label="AIで旅ルートを作る"
          className="group relative inline-flex min-h-[48px] w-full max-w-[720px] items-center justify-center gap-2 overflow-hidden rounded-full border border-[#0b1220]/90 bg-[linear-gradient(180deg,#1f2937_0%,#0f172a_100%)] px-5 py-3 text-white shadow-[0_12px_24px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-220 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-0"
        >
          <AppIcon name="auto_awesome" className="h-4.5 w-4.5 text-white" filled />
          <span className="font-label text-[15px] font-bold tracking-[0.01em]">AIで旅ルートを作る</span>
        </button>
      </div>

      {islandSwitchToastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 z-[66] flex justify-center px-4" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 178px)" }}>
          <p className="rounded-full border border-white/80 bg-[#0f172a]/88 px-4 py-2 text-[12px] font-semibold tracking-[0.01em] text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] backdrop-blur-md">
            {islandSwitchToastMessage}
          </p>
        </div>
      ) : null}

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[86vh] bg-[radial-gradient(120%_120%_at_50%_100%,rgba(15,23,42,0.24)_0%,rgba(15,23,42,0.1)_42%,rgba(15,23,42,0)_76%)] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExploreSheetOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {!isPlanResultSheetOpen ? (
        <nav
          className={`fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-[padding,transform] duration-[720ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isExploreSheetOpen ? "translate-y-0 px-0" : "translate-y-[6px] px-3"
          }`}
          style={
            isExploreSheetOpen
              ? {
                  transform: `translateY(${exploreSheetDragOffset}px)`,
                  transitionDuration: isDraggingExploreSheet ? "0ms" : undefined,
                }
              : undefined
          }
        >
        <div
          className={`explore-sheet-surface pointer-events-auto relative mx-auto flex w-full flex-col overflow-hidden border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(249,250,251,0.9)_100%)] shadow-[0_22px_42px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl transition-[max-width,height,margin,border-radius,padding,transform,box-shadow] duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width,height,margin,border-radius,padding,transform,box-shadow] ${
            isExploreSheetOpen
              ? exploreSheetView === "iwami_story"
                ? "is-open mb-0 h-[78vh] min-h-[420px] max-h-[900px] max-w-[2000px] rounded-t-[2.1rem] rounded-b-none px-0 pt-1 pb-0 translate-y-0"
                : "is-open mb-0 h-[78vh] min-h-[420px] max-h-[900px] max-w-[2000px] rounded-t-[2.1rem] rounded-b-none px-3 pt-2 pb-4 translate-y-0"
              : "mb-3 h-[90px] max-w-[720px] rounded-[2rem] px-2.5 pt-2.5 pb-3 translate-y-0"
          }`}
        >
          {!(isExploreSheetOpen && exploreSheetView === "iwami_story") ? (
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          ) : null}
          {isExploreSheetOpen ? (
            <div
              className={
                exploreSheetView === "iwami_story"
                  ? "mx-auto mb-1 flex w-full items-center justify-center"
                  : "mx-auto mb-2 flex w-full items-center justify-center"
              }
            >
              <button
                type="button"
                onPointerDown={handleExploreSheetDragStart}
                className="touch-none pointer-events-auto flex h-7 w-20 items-center justify-center rounded-full"
                aria-label="下にドラッグして閉じる"
              >
                <span
                  className={`h-1.5 w-12 rounded-full transition-colors duration-200 ${
                    isDraggingExploreSheet ? "bg-[#9ca3af]" : "bg-[#d1d5db]"
                  }`}
                />
              </button>
            </div>
          ) : null}

          {isExploreSheetOpen ? (
            exploreSheetView === "iwami_story" ? (
              <div className="relative z-30 h-4 bg-white shadow-[inset_0_-1px_0_rgba(229,231,235,0.9)]" />
            ) : (
              <div className="relative z-30 flex items-center justify-center px-2 py-1.5">
                <h3 className="font-headline text-[15px] font-bold tracking-[0.02em] text-[#111827]">今楽しめるコンテンツ</h3>
              </div>
            )
          ) : (
            <div className="grid grid-cols-6 gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab((prev) => (prev === item.id ? null : item.id))}
                    className={`group active:scale-95 relative flex min-h-[60px] flex-col items-center justify-center rounded-2xl border px-2 py-2.5 transition-all duration-200 ease-out ${
                      isActive
                        ? "border-[#d8e0ea] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(243,244,246,0.94)_100%)] text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_6px_14px_rgba(17,24,39,0.14)]"
                        : "border-transparent text-[#6b7280] hover:border-[#e7ecf3] hover:bg-white/58 hover:text-[#111827]"
                    }`}
                    style={{ color: isActive ? "#111827" : item.tint }}
                  >
                    <AppIcon
                      name={item.icon}
                      className={`mb-1 h-5 w-5 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                      filled={isActive}
                    />
                    <span className="font-label text-[9.5px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap">{item.label}</span>
                    {isActive ? <span className="mt-1 h-1 w-1 rounded-full bg-[#111827]" /> : null}
                  </button>
                );
              })}

              <div className="relative">
                <span className="pointer-events-none absolute top-2.5 bottom-2.5 left-[-3px] w-px bg-[#cbd5e1]/85" />
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === exploreNavItem.id ? null : exploreNavItem.id)}
                  className={`group active:scale-95 relative flex min-h-[60px] w-full flex-col items-center justify-center rounded-2xl border px-2 py-2.5 transition-colors duration-200 ${
                    activeTab === exploreNavItem.id
                      ? "border-[#d8e0ea] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(243,244,246,0.94)_100%)] text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_6px_14px_rgba(17,24,39,0.14)]"
                      : "border-transparent text-[#4b5563] hover:border-[#e7ecf3] hover:bg-white/58 hover:text-[#111827]"
                  }`}
                  aria-label={exploreNavItem.label}
                  aria-expanded={isExploreSheetOpen}
                >
                  <AppIcon
                    name={exploreNavItem.icon}
                    className={`mb-1 h-5 w-5 transition-transform duration-200 ${activeTab === exploreNavItem.id ? "scale-105" : "group-hover:scale-105"}`}
                    filled={activeTab === exploreNavItem.id}
                  />
                  <span className="font-label text-[9.5px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap">{exploreNavItem.label}</span>
                  {activeTab === exploreNavItem.id ? <span className="mt-1 h-1 w-1 rounded-full bg-[#111827]" /> : null}
                </button>
              </div>
            </div>
          )}

          {!(isExploreSheetOpen && exploreSheetView === "iwami_story") ? (
            <div
              className={`mt-3 h-px w-full bg-[#e5e7eb] transition-opacity duration-500 ease-out ${
                isExploreSheetOpen ? "opacity-100 delay-150" : "opacity-0 delay-0"
              }`}
            />
          ) : null}
          <div
            className={`min-h-0 flex-1 overflow-hidden transition-[opacity,transform,filter] duration-[620ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
              isExploreSheetOpen ? "translate-y-0 opacity-100 blur-0 delay-120" : "translate-y-5 opacity-0 blur-[2px] delay-0"
            } ${
              isExploreSheetOpen && exploreSheetView === "iwami_story"
                ? "mt-0 rounded-none bg-transparent"
                : "mt-3 rounded-2xl bg-white/55"
            }`}
          >
            <div className={exploreSheetView === "iwami_story" ? "h-full overflow-y-auto" : "h-full overflow-y-auto p-3"}>
              {exploreSheetView === "list" ? (
                <div className="space-y-3 pb-2">
                  {exploreFeatureBanners.map((banner, index) => (
                    banner.kind === "image" ? (
                      banner.detailView ? (
                        <button
                          key={banner.id}
                          type="button"
                          onClick={() => setExploreSheetView(banner.detailView ?? "list")}
                          className={`group relative mx-auto block w-full max-w-[860px] overflow-hidden rounded-2xl border border-white/35 text-left shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-[transform,opacity,filter,box-shadow] duration-[560ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.26)] ${
                            isExploreSheetOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-[2px]"
                          }`}
                          style={{ transitionDelay: isExploreSheetOpen ? `${220 + index * 90}ms` : "0ms" }}
                        >
                          <img
                            src={banner.imageSrc}
                            alt={banner.imageAlt}
                            className="block aspect-[1734/907] w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ) : (
                        <a
                          key={banner.id}
                          href={banner.href}
                          className={`group relative mx-auto block w-full max-w-[860px] overflow-hidden rounded-2xl border border-white/35 shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-[transform,opacity,filter,box-shadow] duration-[560ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.26)] ${
                            isExploreSheetOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-[2px]"
                          }`}
                          style={{ transitionDelay: isExploreSheetOpen ? `${220 + index * 90}ms` : "0ms" }}
                        >
                          <img
                            src={banner.imageSrc}
                            alt={banner.imageAlt}
                            className="block aspect-[1734/907] w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      )
                    ) : (
                      <div
                        key={banner.id}
                        className={`relative mx-auto block w-full max-w-[860px] overflow-hidden rounded-2xl bg-[linear-gradient(160deg,rgba(247,249,252,0.98)_0%,rgba(239,244,250,0.96)_55%,rgba(231,238,247,0.94)_100%)] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition-[transform,opacity,filter,box-shadow] duration-[560ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
                          isExploreSheetOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-[2px]"
                        }`}
                        style={{ transitionDelay: isExploreSheetOpen ? `${220 + index * 90}ms` : "0ms" }}
                      >
                        <div className="flex aspect-[1734/907] w-full flex-col items-center justify-center gap-2 px-4 text-center">
                          <span className="rounded-full bg-white/72 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#556070]">
                            COMING SOON
                          </span>
                          <p className="text-[14px] font-semibold tracking-[0.01em] text-[#5f6b7d]">
                            近日追加予定
                          </p>
                          <p className="text-[12px] leading-5 text-[#7a8596]">
                            新しい特集バナーを順次公開します
                          </p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <section className="w-full pb-6">
                  <div className="w-full bg-[#0b1120]">
                    <img
                      src="/explore-banners/iwami-blue-sea-banner.png"
                      alt="岩見物語旅"
                      className="block h-auto w-full object-contain"
                    />
                  </div>

                  <div className="px-5 pt-6">
                    <p className="text-[11px] font-semibold tracking-[0.09em] text-[#64748b]">STORY CONTENT</p>
                    <p className="mt-2 text-[14px] leading-7 text-[#334155]">
                      岩美駅を起点に、海とまちの記憶をたどる周遊型の物語体験です。下の手順を順番に進めるだけで開始できます。
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full border border-[#cfd8ea] bg-[#f2f6ff] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.01em] text-[#1849a9]">
                      開始地点: 岩美駅
                    </div>
                  </div>

                  <div className="px-5 pt-7">
                    <h5 className="text-[15px] font-bold tracking-[0.01em] text-[#0f172a]">体験ステップ</h5>
                    <ol className="mt-4 space-y-4">
                      {[
                        "岩美駅に到着して、物語旅の開始案内を確認する",
                        "1つ目のチェックポイントへ移動して、ミッションを開始する",
                        "各スポットで条件を達成し、次の章を解放する",
                        "最終地点でエンディングを確認して体験完了",
                      ].map((step, index) => (
                        <li key={step} className="flex items-start gap-3 border-b border-[#e2e8f0] pb-4">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1f2937_0%,#0f172a_100%)] text-[12px] font-bold text-white">
                            {index + 1}
                          </span>
                          <p className="text-[13px] leading-6 text-[#334155]">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>
              )}
            </div>
          </div>
          {isExploreSheetOpen && exploreSheetView === "iwami_story" ? (
            <div className="relative z-30 shrink-0 border-t border-[#e5e7eb] bg-white/96 px-4 pt-3 pb-4 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setMapFocusCenter(STATION_NODE_COORDINATES.iwami_station);
                }}
                className="w-full rounded-full border border-[#111827] bg-[#111827] px-5 py-3 text-[14px] font-bold text-white shadow-[0_10px_20px_rgba(17,24,39,0.24)] transition-all duration-200 hover:bg-[#1f2937] active:scale-[0.99]"
              >
                岩美駅から物語を始める
              </button>
            </div>
          ) : null}
        </div>
        </nav>
      ) : null}

      <div
        className={`fixed inset-0 z-[59] transition-opacity duration-220 ${
          isIslandSheetOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isIslandSheetOpen}
      >
        <div
          className="absolute inset-0 bg-[#0f172a]/26 backdrop-blur-[1px]"
          onClick={() => setIsIslandSheetOpen(false)}
        />
      </div>
      <aside
        className={`pointer-events-none fixed top-0 right-0 bottom-0 z-[60] w-[clamp(280px,34vw,420px)] max-w-[88vw] transition-transform duration-260 ease-out ${
          isIslandSheetOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isIslandSheetOpen}
      >
        <div className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden border-l border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(249,250,251,0.94)_100%)] px-3 pt-4 pb-4 shadow-[-18px_0_34px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
          <div className="relative z-30 flex items-center justify-between px-1 py-1">
            <h3 className="font-headline text-[16px] font-bold tracking-[0.02em] text-[#111827]">島を選ぶ</h3>
            <button
              type="button"
              onClick={() => setIsIslandSheetOpen(false)}
              className="rounded-full border border-[#d1d5db] bg-white px-3 py-1 text-[12px] font-semibold text-[#374151]"
            >
              閉じる
            </button>
          </div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white/70 p-3">
            <div className="space-y-2">
              {islandOptions.map((island) => {
                const isSelected = island.id === selectedIsland;
                return (
                  <button
                    key={island.id}
                    type="button"
                    onClick={() => handleSelectIsland(island.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-[#111827] bg-[#111827] text-white shadow-[0_10px_20px_rgba(17,24,39,0.22)]"
                        : "border-[#d1d5db] bg-white text-[#111827] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AppIcon name="compass" className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#6b7280]"}`} />
                      <span className="text-[14px] font-semibold tracking-[0.01em]">{island.label}</span>
                    </div>
                    <span className={`text-[14px] font-bold ${isSelected ? "text-white" : "text-[#9ca3af]"}`}>{isSelected ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {isPlanResultSheetOpen && activePlanResult ? (
        <>
          <div
            className={`pointer-events-none fixed inset-x-0 bottom-0 z-[56] h-[82vh] bg-[radial-gradient(120%_120%_at_50%_100%,rgba(15,23,42,0.22)_0%,rgba(15,23,42,0.09)_42%,rgba(15,23,42,0)_76%)] transition-opacity duration-600 ${
              isPlanResultSheetOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <section
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[58] px-0"
            style={{
              transform: `translateY(${planResultSheetDragOffset}px)`,
              transitionDuration: isDraggingPlanResultSheet ? "0ms" : undefined,
            }}
          >
            <div className="explore-sheet-surface pointer-events-auto relative mx-auto flex h-[50vh] min-h-[320px] max-h-[620px] w-full max-w-[2000px] flex-col overflow-hidden rounded-t-[2.1rem] rounded-b-none border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(249,250,251,0.92)_100%)] px-3 pt-2 pb-3 shadow-[0_22px_42px_rgba(17,24,39,0.16),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-2xl">
              <div className="mx-auto mb-2 flex w-full items-center justify-center">
                <button
                  type="button"
                  onPointerDown={handlePlanResultSheetDragStart}
                  className="touch-none pointer-events-auto flex h-7 w-20 items-center justify-center rounded-full"
                  aria-label="下にドラッグして閉じる"
                >
                  <span
                    className={`h-1.5 w-12 rounded-full transition-colors duration-200 ${
                      isDraggingPlanResultSheet ? "bg-[#9ca3af]" : "bg-[#d1d5db]"
                    }`}
                  />
                </button>
              </div>
              <div className="relative z-30 flex items-center justify-between px-2 py-1">
                <h3 className="font-headline text-[15px] font-bold tracking-[0.02em] text-[#111827]">AI旅ルート候補</h3>
                <button
                  type="button"
                  onClick={() => setIsPlanResultSheetOpen(false)}
                  className="rounded-full border border-[#d1d5db] bg-white px-3 py-1 text-[12px] font-semibold text-[#374151]"
                >
                  閉じる
                </button>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-2">
                {(planResult?.plans ?? []).map((plan, index) => {
                  const selected = plan.id === activePlanResult.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setActivePlanResultId(plan.id);
                        setSelectedPlanResultSpotId(null);
                      }}
                      className={`min-w-[160px] rounded-2xl border px-3 py-2 text-left transition-all ${
                        selected
                          ? "border-[#111827] bg-[#111827] text-white shadow-[0_10px_18px_rgba(17,24,39,0.22)]"
                          : "border-[#d1d5db] bg-white text-[#1f2937] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <p className="text-[12px] font-bold tracking-[0.04em]">候補{index + 1}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1 rounded-2xl bg-white/70 p-3">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-[#64748b]">コース一覧</p>
                <div className="mt-2 space-y-1.5">
                  {(planResult?.plans ?? []).map((plan, index) => {
                    const selected = plan.id === activePlanResult.id;
                    return (
                      <p key={`course-name-${plan.id}`} className={`text-[12px] ${selected ? "font-semibold text-[#0f172a]" : "text-[#475569]"}`}>
                        候補{index + 1}: {plan.title}コース
                      </p>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 rounded-2xl bg-white/70 p-3">
                <p className="text-[13px] font-semibold text-[#0f172a]">{activePlanResult.reasonWhyRecommended}</p>
                <p className="mt-1 text-[12px] leading-6 text-[#475569]">{activePlanResult.matchSummary}</p>
                <p className="mt-2 text-[11px] font-medium text-[#64748b]">
                  想定所要時間: {activePlanResult.estimatedDurationMinutes}分
                </p>
              </div>
              <div className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white/60 p-3">
                <ol className="space-y-2">
                  {activePlanTimelineWithLocations.map((item, index) => {
                    const isLinked = Boolean(item.location);
                    const isSelected = selectedPlanResultSpotId != null && item.mapSpotId === selectedPlanResultSpotId;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          disabled={!isLinked}
                          onClick={() => {
                            if (!item.location) return;
                            setMapFocusCenter(item.location);
                            setSelectedPlanResultSpotId(item.mapSpotId);
                          }}
                          className={`w-full rounded-2xl border px-3 py-2.5 text-left transition-all ${
                            isSelected
                              ? "border-[#111827] bg-[#111827] text-white shadow-[0_8px_16px_rgba(17,24,39,0.22)]"
                              : isLinked
                                ? "border-[#d1d5db] bg-white text-[#111827] hover:bg-[#f8fafc]"
                                : "border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[13px] font-semibold">
                              {index + 1}. {item.spotName}
                            </p>
                            <p className={`text-[11px] font-medium ${isSelected ? "text-white/85" : "text-[#64748b]"}`}>
                              {item.arrivalAt} - {item.departureAt}
                            </p>
                          </div>
                          <p className={`mt-1 text-[11px] ${isSelected ? "text-white/80" : "text-[#64748b]"}`}>
                            移動: {item.transportFromPrev} / {item.travelMinutesFromPrev}分 / 滞在: {item.stayMinutes}分
                          </p>
                          <p className={`mt-1 text-[11px] leading-5 ${isSelected ? "text-white/90" : "text-[#475569]"}`}>
                            {item.note}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                {planResult?.warnings?.length ? (
                  <div className="mt-3 rounded-xl border border-[#f1d6a8] bg-[#fff7eb] p-3 text-[11px] leading-5 text-[#8a5a06]">
                    {planResult.warnings.slice(0, 2).map((warning) => (
                      <p key={warning}>・{warning}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {isPlannerOpen ? (
        <>
          <div
            className={`fixed inset-0 z-[79] bg-transparent transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isPlannerSheetPresented ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePlanner();
            }}
          />
          <section
            className={`pointer-events-none fixed inset-x-0 bottom-0 z-[80] transition-[padding,transform] duration-[720ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
              isPlannerSheetPresented ? "translate-y-0 px-0" : "translate-y-[6px] px-3"
            }`}
            style={{
              ...(isPlannerSheetPresented
                ? {
                    transform: `translateY(${plannerSheetDragOffset}px)`,
                    transitionDuration: isDraggingPlannerSheet ? "0ms" : undefined,
                  }
                : {}),
            }}
          >
            <div
              className={`explore-sheet-surface pointer-events-auto relative mx-auto flex w-full flex-col overflow-hidden border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(249,250,251,0.9)_100%)] shadow-[0_22px_42px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl transition-[max-width,height,margin,border-radius,padding,transform,box-shadow] duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width,height,margin,border-radius,padding,transform,box-shadow] ${
                isPlannerSheetPresented
                  ? "is-open mb-0 h-[78vh] min-h-[420px] max-h-[900px] max-w-[2000px] rounded-t-[2.1rem] rounded-b-none px-3 pt-2 pb-4 translate-y-0"
                  : "mb-3 h-[90px] max-w-[720px] rounded-[2rem] px-2.5 pt-2.5 pb-3 translate-y-0"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              <div className="mx-auto mb-2 flex w-full items-center justify-center">
                <button
                  type="button"
                  onPointerDown={handlePlannerSheetDragStart}
                  className="touch-none pointer-events-auto flex h-7 w-20 items-center justify-center rounded-full"
                  aria-label="下にドラッグして閉じる"
                >
                  <span
                    className={`h-1.5 w-12 rounded-full transition-colors duration-200 ${
                      isDraggingPlannerSheet ? "bg-[#9ca3af]" : "bg-[#d1d5db]"
                    }`}
                  />
                </button>
              </div>
              <div className={`relative z-30 flex items-center justify-center px-2 py-1.5 transition-opacity duration-500 ${isPlannerSheetPresented ? "opacity-100 delay-150" : "opacity-0 delay-0"}`}>
                <h3 className="font-headline text-[15px] font-bold tracking-[0.02em] text-[#111827]">AIで旅ルートを作る</h3>
              </div>
              <div
                className={`mt-3 h-px w-full bg-[#e5e7eb] transition-opacity duration-500 ease-out ${
                  isPlannerSheetPresented ? "opacity-100 delay-150" : "opacity-0 delay-0"
                }`}
              />
              <div
                className={`mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-white/55 transition-[opacity,transform,filter] duration-[620ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
                  isPlannerSheetPresented ? "translate-y-0 opacity-100 blur-0 delay-120" : "translate-y-5 opacity-0 blur-[2px] delay-0"
                }`}
              >
                <div className="h-full overflow-y-auto p-3">
          {plannerView === "input" ? (
            <div className="relative flex h-full min-h-0 flex-col bg-transparent text-[#181c20]">
              <div className="flex-1 overflow-y-auto pb-18">
                <main className="mx-auto max-w-3xl space-y-5">
                  <section className={panelCardClass}>
                    <h2 className="font-headline mb-2 flex items-center gap-3 text-[1.125rem] font-semibold text-[#111827]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[0.875rem] font-bold text-white shadow-sm">
                        1
                      </span>
                      出発と滞在の条件
                    </h2>
                    <p className="mb-7 text-[0.8125rem] leading-6 text-[#5f6873]">
                      どこから出発して、どれくらい回るかをもとに、無理のないルートを組み立てます。
                    </p>

                    <div className="space-y-7">
                      <div>
                        <label className="mb-3 block text-[0.875rem] font-semibold text-[#181c20]">日帰りですか？ 宿泊ですか？</label>
                        <div className="relative flex rounded-[1.25rem] border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(243,244,246,0.92)_100%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_12px_rgba(17,24,39,0.08)]">
                          <span className="pointer-events-none absolute top-2 bottom-2 left-1/2 z-20 w-px -translate-x-1/2 bg-[#d1d5db]" />
                          <button
                            type="button"
                            onClick={() => handleSelectTravelStyle("day")}
                            className={`relative z-10 flex-1 rounded-3xl px-4 py-2.5 text-sm font-medium transition-all ${
                              travelStyle === "day"
                                ? "bg-[linear-gradient(180deg,#374151_0%,#111827_100%)] text-white shadow-[0_8px_16px_rgba(17,24,39,0.22)]"
                                : "text-[#374151] hover:bg-white/65"
                            }`}
                          >
                            日帰り
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectTravelStyle("stay")}
                            className={`relative z-10 flex-1 rounded-3xl px-4 py-2.5 text-sm font-medium transition-all ${
                              travelStyle === "stay"
                                ? "bg-[linear-gradient(180deg,#374151_0%,#111827_100%)] text-white shadow-[0_8px_16px_rgba(17,24,39,0.22)]"
                                : "text-[#374151] hover:bg-white/65"
                            }`}
                          >
                            宿泊
                          </button>
                        </div>
                      </div>

                      {travelStyle ? (
                        <>
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                              <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">どこから出発しますか？</label>
                              <div ref={departureDropdownRef} className="relative">
                                <button
                                  type="button"
                                  aria-haspopup="listbox"
                                  aria-expanded={isDepartureDropdownOpen}
                                  onClick={() => {
                                    setIsDepartureDropdownOpen((prev) => !prev);
                                    setIsReturnTransportDropdownOpen(false);
                                    setIsReturnStationDropdownOpen(false);
                                  }}
                                  className={`${panelFieldClass} flex items-center justify-between gap-3 text-left ${
                                    departurePoint ? "text-[#111827]" : "text-[#6b7280]"
                                  }`}
                                >
                                  <span>{selectedDepartureLabel || "選択してください"}</span>
                                  <AppIcon
                                    name="expand_more"
                                    className={`h-5 w-5 text-[#6b7280] transition-transform ${isDepartureDropdownOpen ? "rotate-180" : ""}`}
                                  />
                                </button>
                                {isDepartureDropdownOpen ? (
                                  <div
                                    role="listbox"
                                    className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#d1d5db] bg-white shadow-[0_12px_24px_rgba(17,24,39,0.12)]"
                                  >
                                    {departureOptions.map((point) => (
                                      <button
                                        key={point.value}
                                        type="button"
                                        onClick={() => {
                                          setDeparturePoint(point.value);
                                          clearValidationErrors("departureType", "departureLocation");
                                          setIsDepartureDropdownOpen(false);
                                        }}
                                        className={`block w-full px-4 py-3 text-left text-[0.9375rem] transition-colors ${
                                          departurePoint === point.value
                                            ? "bg-[#f3f4f6] font-semibold text-[#111827]"
                                            : "text-[#374151] hover:bg-[#f9fafb]"
                                        }`}
                                      >
                                        {point.label}
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              {getValidationError("departureType", "departureLocation") ? (
                                <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">
                                  {getValidationError("departureType", "departureLocation")}
                                </p>
                              ) : null}
                            </div>
                            <div>
                              <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">いつ出発しますか？</label>
                              <input
                                type="time"
                                value={departureTime}
                                onChange={(event) => {
                                  setDepartureTime(event.target.value);
                                  clearValidationErrors("departureAt");
                                }}
                                className={panelFieldClass}
                              />
                              {getValidationError("departureAt") ? (
                                <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">{getValidationError("departureAt")}</p>
                              ) : null}
                            </div>
                          </div>

                          {departurePoint === "current_location" && !mapFocusCenter ? (
                            <p className="rounded-2xl border border-[#d7dae0] bg-[#f8fafc] px-4 py-3 text-[0.8125rem] leading-6 text-[#5f6873]">
                              出発地で「現在地」を使う場合は、地図右下の現在地ボタンで位置情報を取得してください。
                            </p>
                          ) : null}

                          <div>
                            <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">どれくらい回りますか？</label>
                            <p className="mb-3.5 text-[0.8125rem] leading-6 text-[#5f6873]">当日に観光できる目安時間を選んでください。</p>
                            <div className="flex flex-wrap gap-2.5">
                              <button
                                type="button"
                                className={chipButton(duration === "2h")}
                                onClick={() => {
                                  setDuration("2h");
                                  clearValidationErrors("customDurationMinutes");
                                }}
                              >
                                2時間
                              </button>
                              <button
                                type="button"
                                className={chipButton(duration === "4h")}
                                onClick={() => {
                                  setDuration("4h");
                                  clearValidationErrors("customDurationMinutes");
                                }}
                              >
                                4時間
                              </button>
                              <button
                                type="button"
                                className={chipButton(duration === "custom")}
                                onClick={() => setDuration("custom")}
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  カスタム
                                  <AppIcon name="edit" className="h-4.5 w-4.5" />
                                </span>
                              </button>
                            </div>
                            {duration === "custom" ? (
                              <div className="mt-3.5">
                                <label className="mb-2 block text-[0.8125rem] font-semibold text-[#4b5563]">
                                  カスタム時間（分）
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={customDurationMinutes}
                                  onChange={(event) => {
                                    setCustomDurationMinutes(event.target.value);
                                    clearValidationErrors("customDurationMinutes");
                                  }}
                                  placeholder="例：180"
                                  className={panelFieldClass}
                                />
                                {getValidationError("customDurationMinutes") ? (
                                  <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">
                                    {getValidationError("customDurationMinutes")}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="border-t border-[#e0e2e866] pt-6">
                            {travelStyle === "day" ? (
                              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">帰りは何で移動しますか？</label>
                                  <div
                                    ref={returnTransportDropdownRef}
                                    className={`relative ${isReturnTransportDropdownOpen ? "z-[140]" : "z-10"}`}
                                  >
                                    <button
                                      type="button"
                                      aria-haspopup="listbox"
                                      aria-expanded={isReturnTransportDropdownOpen}
                                      onClick={() => {
                                        setIsReturnTransportDropdownOpen((prev) => !prev);
                                        setIsDepartureDropdownOpen(false);
                                        setIsReturnStationDropdownOpen(false);
                                      }}
                                      className={`${panelFieldClass} flex items-center justify-between gap-3 text-left ${
                                        returnTransport ? "text-[#111827]" : "text-[#6b7280]"
                                      }`}
                                    >
                                      <span>{selectedReturnTransportLabel || "選択してください"}</span>
                                      <AppIcon
                                        name="expand_more"
                                        className={`h-5 w-5 text-[#6b7280] transition-transform ${isReturnTransportDropdownOpen ? "rotate-180" : ""}`}
                                      />
                                    </button>
                                    {isReturnTransportDropdownOpen ? (
                                      <div
                                        role="listbox"
                                        className="absolute z-[150] mt-2 w-full overflow-hidden rounded-2xl border border-[#d1d5db] bg-white shadow-[0_12px_24px_rgba(17,24,39,0.12)]"
                                      >
                                        {returnTransportOptions.map((transport) => (
                                          <button
                                            key={transport.value}
                                            type="button"
                                            onClick={() => {
                                              setReturnTransport(transport.value);
                                              clearValidationErrors("returnTransport");
                                              if (transport.value !== "train") {
                                                setReturnStationId(null);
                                              }
                                              setIsReturnTransportDropdownOpen(false);
                                            }}
                                            className={`block w-full px-4 py-3 text-left text-[0.9375rem] transition-colors ${
                                              returnTransport === transport.value
                                                ? "bg-[#f3f4f6] font-semibold text-[#111827]"
                                                : "text-[#374151] hover:bg-[#f9fafb]"
                                            }`}
                                          >
                                            {transport.label}
                                          </button>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                  {getValidationError("returnTransport") ? (
                                    <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">
                                      {getValidationError("returnTransport")}
                                    </p>
                                  ) : null}
                                  {returnTransport && returnTransport !== "train" ? (
                                    <p className="mt-2 text-[0.75rem] leading-5 text-[#6b7580]">電車を選んだ場合に設定できます。</p>
                                  ) : null}
                                </div>

                                {returnTransport === "train" ? (
                                  <div>
                                    <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">どこから帰りますか？</label>
                                    <div
                                      ref={returnStationDropdownRef}
                                      className={`relative ${isReturnStationDropdownOpen ? "z-[160]" : "z-10"}`}
                                    >
                                      <button
                                        type="button"
                                        aria-haspopup="listbox"
                                        aria-expanded={isReturnStationDropdownOpen}
                                        onClick={() => {
                                          setIsReturnStationDropdownOpen((prev) => !prev);
                                          setIsDepartureDropdownOpen(false);
                                          setIsReturnTransportDropdownOpen(false);
                                        }}
                                        className={`${panelFieldClass} flex items-center justify-between gap-3 text-left ${
                                          returnStationId ? "text-[#111827]" : "text-[#6b7280]"
                                        }`}
                                      >
                                        <span>{selectedReturnStationLabel || "選択してください"}</span>
                                        <AppIcon
                                          name="expand_more"
                                          className={`h-5 w-5 text-[#6b7280] transition-transform ${
                                            isReturnStationDropdownOpen ? "rotate-180" : ""
                                          }`}
                                        />
                                      </button>
                                      {isReturnStationDropdownOpen ? (
                                        <div
                                          role="listbox"
                                          className="absolute z-[170] mt-2 w-full overflow-hidden rounded-2xl border border-[#d1d5db] bg-white shadow-[0_12px_24px_rgba(17,24,39,0.12)]"
                                        >
                                          {returnStationOptions.map((station) => (
                                            <button
                                              key={station.value}
                                              type="button"
                                              onClick={() => {
                                                setReturnStationId(station.value);
                                                clearValidationErrors("returnStationId");
                                                setIsReturnStationDropdownOpen(false);
                                              }}
                                              className={`block w-full px-4 py-3 text-left text-[0.9375rem] transition-colors ${
                                                returnStationId === station.value
                                                  ? "bg-[#f3f4f6] font-semibold text-[#111827]"
                                                  : "text-[#374151] hover:bg-[#f9fafb]"
                                              }`}
                                            >
                                              {station.label}
                                            </button>
                                          ))}
                                        </div>
                                      ) : null}
                                    </div>
                                    {getValidationError("returnStationId") ? (
                                      <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">
                                        {getValidationError("returnStationId")}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-[0.8125rem] leading-6 text-[#5f6873]">
                                    帰りの場所は、電車を選んだときに入力できます。
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {travelStyle === "stay" ? (
                              <div>
                                <label className="mb-2.5 block text-[0.875rem] font-semibold text-[#181c20]">どこに宿泊しますか？</label>
                                <input
                                  type="text"
                                  value={stayPlace}
                                  onChange={(event) => {
                                    setStayPlace(event.target.value);
                                    clearValidationErrors("lodgingName");
                                  }}
                                  placeholder="例：◯◯旅館 / ◯◯ホテル"
                                  className={panelFieldClass}
                                />
                                {getValidationError("lodgingName") ? (
                                  <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">{getValidationError("lodgingName")}</p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <p className="rounded-2xl border border-[#d7dae0] bg-[#f1f4f9] px-4 py-3 text-sm text-[#5f6873]">
                          日帰りまたは宿泊を選ぶと、必要な入力欄が表示されます。
                        </p>
                      )}
                    </div>
                  </section>

                  <section className={panelCardClass}>
                    <h2 className="font-headline mb-2 flex items-center gap-3 text-[1.125rem] font-semibold text-[#111827]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[0.875rem] font-bold text-white shadow-sm">
                        2
                      </span>
                      現地での移動方法
                    </h2>
                    <p className="mb-7 text-[0.8125rem] leading-6 text-[#5f6873]">
                      現地での移動手段に合わせて、回りやすい順番と立ち寄り先を調整します。
                    </p>

                    <div>
                      <label className="mb-3.5 block text-[0.875rem] font-semibold text-[#181c20]">主な移動手段（複数選択可）</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          aria-pressed={mainTransports.includes("walk")}
                          className={transportButton(mainTransports.includes("walk"))}
                          onClick={() => {
                            toggleMainTransport("walk");
                            clearValidationErrors("localTransports");
                          }}
                        >
                          <AppIcon name="directions_walk" className="mb-2 h-8 w-8" />
                          <span className="text-[0.9375rem] font-semibold">徒歩</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={mainTransports.includes("rental_cycle")}
                          className={transportButton(mainTransports.includes("rental_cycle"))}
                          onClick={() => {
                            toggleMainTransport("rental_cycle");
                            clearValidationErrors("localTransports");
                          }}
                        >
                          <AppIcon name="pedal_bike" className="mb-2 h-8 w-8" />
                          <span className="text-center text-[0.9375rem] font-semibold leading-tight">レンタサイクル</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={mainTransports.includes("car")}
                          className={transportButton(mainTransports.includes("car"))}
                          onClick={() => {
                            toggleMainTransport("car");
                            clearValidationErrors("localTransports");
                          }}
                        >
                          <AppIcon name="directions_car" className="mb-2 h-8 w-8" />
                          <span className="text-[0.9375rem] font-semibold">車</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={mainTransports.includes("bus")}
                          className={transportButton(mainTransports.includes("bus"))}
                          onClick={() => {
                            toggleMainTransport("bus");
                            clearValidationErrors("localTransports");
                          }}
                        >
                          <AppIcon name="directions_bus" className="mb-2 h-8 w-8" />
                          <span className="text-[0.9375rem] font-semibold">バス</span>
                        </button>
                      </div>
                      {mainTransports.includes("rental_cycle") ? (
                        <p className="mt-3 text-[0.75rem] leading-5 text-[#6b7580]">
                          レンタサイクルを選ぶと、貸出場所を含めてルートを提案します。
                        </p>
                      ) : null}
                      {getValidationError("localTransports") ? (
                        <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">{getValidationError("localTransports")}</p>
                      ) : null}
                    </div>
                  </section>

                  <section className={panelCardClass}>
                    <h2 className="font-headline mb-2 flex items-center gap-3 text-[1.125rem] font-semibold text-[#111827]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[0.875rem] font-bold text-white shadow-sm">
                        3
                      </span>
                      行きたい場所と旅のイメージ
                    </h2>
                    <p className="mb-7 text-[0.8125rem] leading-6 text-[#5f6873]">
                      ざっくりした希望でも大丈夫です。
                      <br />
                      景色・食・体験を組み合わせて、あなたに合うルートを提案します。
                    </p>

                    <div className="space-y-8">
                      <div>
                        <label className="mb-3 block text-[0.875rem] font-semibold text-[#181c20]">行ってみたい場所（任意）</label>
                        <div className="mb-4 flex flex-wrap gap-2.5">
                          {mustSpots.map((spot) => (
                            <div
                              key={spot}
                              className="flex items-center gap-1.5 rounded-full border border-[#d1d5db] bg-[linear-gradient(180deg,#ffffff_0%,#f3f4f6_100%)] px-4 py-2 text-[0.875rem] font-medium text-[#1f2937] shadow-sm"
                            >
                              {spot}
                              <button
                                type="button"
                                onClick={() => removeSpot(spot)}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[#404850] transition-colors hover:bg-[#001f271a]"
                              >
                                <AppIcon name="close" className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mb-3 flex gap-2">
                          <input
                            type="text"
                            value={spotInput}
                            onChange={(event) => setSpotInput(event.target.value)}
                            placeholder="場所を入力"
                            className="h-11 flex-1 rounded-2xl border border-[#d1d5db] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)] px-4 text-[0.9375rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_14px_rgba(17,24,39,0.08)] outline-none ring-[#111827]/20 transition-all hover:bg-[linear-gradient(180deg,#ffffff_0%,#f3f4f6_100%)] focus:ring focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_10px_20px_rgba(17,24,39,0.12)]"
                          />
                          <button
                            type="button"
                            onClick={addSpot}
                            className="rounded-2xl border border-[#d1d5db] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,247,250,0.92)_100%)] px-4 text-sm font-semibold text-[#111827] shadow-[0_6px_12px_rgba(17,24,39,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(243,244,246,0.95)_100%)]"
                          >
                            場所を追加
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {defaultSuggestions
                            .filter((item) => !mustSpots.includes(item))
                            .slice(0, 3)
                            .map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => setMustSpots((prev) => [...prev, suggestion])}
                                className="rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 text-xs text-[#374151] transition-colors hover:bg-[#f3f4f6]"
                              >
                                {suggestion}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-[#d1d5db] bg-white p-4">
                        <label className="mb-2.5 block text-[0.9rem] font-semibold text-[#111827]">どんな旅にしたいですか？</label>
                        <p className="mb-3 text-[0.8125rem] leading-6 text-[#5f6873]">
                          ひとことでも大丈夫です。希望を自由に書いてください。
                        </p>
                        <textarea
                          value={requestText}
                          onChange={(event) => {
                            setRequestText(event.target.value);
                            clearValidationErrors("tripPrompt");
                          }}
                          placeholder={
                            "海の景色を見ながら海鮮も楽しみたい\n歩きすぎずにゆったり回りたい\n岩美駅周辺にも少し立ち寄りたい"
                          }
                          className="h-40 w-full resize-none rounded-[1.1rem] border border-[#d1d5db] bg-white p-4 text-[0.9375rem] outline-none ring-[#111827]/20 transition-colors placeholder:text-[#707881] hover:bg-[#fafafa] focus:ring"
                        />
                        {getValidationError("tripPrompt") ? (
                          <p className="mt-2 text-[0.75rem] leading-5 text-[#b42318]">{getValidationError("tripPrompt")}</p>
                        ) : null}
                      </div>
                    </div>
                  </section>
                </main>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#f9fafb] via-[#f9fafbf2] to-transparent px-4 pb-3 pt-3 backdrop-blur-sm">
                <div className="pointer-events-auto mx-auto max-w-3xl">
                  <button
	                    type="button"
	                    onClick={handleSubmitPlanRequest}
	                    disabled={isSubmittingPlanRequest}
	                    className={`flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border px-6 py-2.5 text-[0.9375rem] font-bold transition-all duration-200 ${
	                      !isSubmittingPlanRequest
	                        ? "border-[#111827] bg-[#111827] text-white shadow-[0_8px_20px_rgba(17,24,39,0.26)] hover:bg-[#1f2937] hover:shadow-[0_12px_24px_rgba(17,24,39,0.34)] active:scale-[0.98]"
	                        : "cursor-not-allowed border-[#d7dae0] bg-[#e6e8ee] text-[#707881] shadow-none"
                    }`}
                  >
                    {isSubmittingPlanRequest ? "送信中..." : "AIで旅ルートを作る"}
                  </button>
                  {planSubmitError ? <p className="mt-1.5 text-center text-[11px] text-[#b42318]">{planSubmitError}</p> : null}
	                  {!isPlanFormValid ? <p className="mt-1.5 text-center text-[11px] text-[#707881]">テスト中のため、未入力でもプレビューできます。</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex h-full min-h-0 flex-col bg-transparent text-[#181c20]">
              <div className="flex-1 overflow-y-auto">
                {plannerView === "generating" ? (
                  <section className="flex min-h-full flex-col justify-center rounded-[2rem] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(17,24,39,0.06),inset_0_1px_0_rgba(255,255,255,0.96)]">
                    <style jsx>{`
                      .planner-shimmer {
                        background: linear-gradient(90deg, #eff4f8 0%, #ffffff 50%, #eff4f8 100%);
                        background-size: 200% 100%;
                        animation: planner-shimmer 2s infinite;
                      }
	                      .planner-pulse-soft {
	                        animation: planner-pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	                      }
	                      .planner-route-glow {
	                        animation: planner-route-glow 2.4s ease-in-out infinite;
	                      }
	                      .planner-route-dash {
	                        stroke-dasharray: 7 8;
	                        animation: planner-route-dash 1.8s linear infinite;
	                      }
                      @keyframes planner-shimmer {
                        0% {
                          background-position: 200% 0;
                        }
                        100% {
                          background-position: -200% 0;
                        }
                      }
                      @keyframes planner-pulse-soft {
                        0%,
                        100% {
                          opacity: 1;
                          transform: scale(1);
                        }
	                        50% {
	                          opacity: 0.72;
	                          transform: scale(0.985);
	                        }
	                      }
	                      @keyframes planner-route-glow {
	                        0%,
	                        100% {
	                          box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
	                          transform: translateY(0);
	                        }
	                        50% {
	                          box-shadow: 0 14px 30px rgba(17, 24, 39, 0.18);
	                          transform: translateY(-2px);
	                        }
	                      }
	                      @keyframes planner-route-dash {
	                        0% {
	                          stroke-dashoffset: 0;
	                        }
	                        100% {
	                          stroke-dashoffset: -30;
	                        }
	                      }
	                    `}</style>

	                    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4">
	                      <div className="planner-route-glow relative mx-auto flex h-[86px] w-[186px] items-center justify-center rounded-[1.75rem] border border-[#e5e7eb] bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)]">
	                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 186 86" aria-hidden="true">
	                          <path
	                            d="M38 55 C62 20 88 72 112 37 C129 12 151 25 159 30"
	                            fill="none"
	                            stroke="#cbd5e1"
	                            strokeWidth="8"
	                            strokeLinecap="round"
	                          />
	                          <path
	                            className="planner-route-dash"
	                            d="M38 55 C62 20 88 72 112 37 C129 12 151 25 159 30"
	                            fill="none"
	                            stroke="#111827"
	                            strokeWidth="3"
	                            strokeLinecap="round"
	                          />
	                        </svg>
	                        <span className="absolute left-[25px] top-[45px] h-4 w-4 rounded-full border-2 border-white bg-[#111827] shadow-sm" />
	                        <span className="absolute left-[104px] top-[30px] h-4 w-4 rounded-full border-2 border-white bg-[#64748b] shadow-sm" />
	                        <span className="absolute right-[21px] top-[22px] flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#111827] text-white shadow-md">
	                          <AppIcon name="auto_awesome" filled className="h-3.5 w-3.5" />
	                        </span>
	                      </div>

	                      <div className="flex flex-col items-center gap-2 text-center">
	                        <p className="rounded-full bg-[#eff4f8] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#4b5563]">
	                          ROUTE BUILDING
	                        </p>
	                        <h3 className="font-headline text-[20px] leading-7 font-bold tracking-normal text-[#172033]">
	                          AIが旅の流れを組み立てています
	                        </h3>
	                        <p className="max-w-[300px] text-[14px] leading-5 text-[#43474c]">
	                          条件に合うスポットを選び、無理なく回れる3つのルート案に整えています。
	                        </p>
	                      </div>

                      <div className="flex flex-wrap justify-center gap-2 px-2">
                        {generationConditionChips.map((chip) => (
                          <span
                            key={`${chip.icon}-${chip.label}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#c4c6cd]/40 bg-[#eff4f8] px-3 py-1.5 text-[11px] leading-[14px] text-[#43474c]"
                          >
                            <AppIcon name={chip.icon} className="h-3.5 w-3.5" />
                            {chip.label}
                          </span>
                        ))}
                      </div>

	                      <div className="flex w-full flex-col gap-2.5">
	                        {[0, 1, 2].map((item) => (
	                          <div
	                            key={item}
	                            className="planner-shimmer planner-pulse-soft flex h-14 w-full items-center gap-3 rounded-2xl border border-[#c4c6cd]/25 bg-[#eff4f8] px-3.5 shadow-[0_4px_12px_rgba(17,24,39,0.05)]"
	                            style={{ animationDelay: `${item * 0.2}s` }}
	                          >
	                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e3e9ed] text-[12px] font-bold text-[#64748b]">
	                              {item + 1}
	                            </div>
	                            <div className="flex w-full flex-col gap-2">
	                              <div className={`h-3.5 rounded bg-[#e3e9ed] ${item === 0 ? "w-2/3" : item === 1 ? "w-3/4" : "w-[58%]"}`} />
	                              <div className={`h-2.5 rounded bg-[#e3e9ed] ${item === 0 ? "w-1/3" : item === 1 ? "w-1/2" : "w-[42%]"}`} />
	                            </div>
	                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sr-only" aria-live="polite">
                      {generationMessages[progressIndex] ?? "ルート候補を作成しています"}
                      {Math.round(progressPercent)}%
                    </div>
                  </section>
                ) : null}

                {plannerView === "result" ? (
                  <section className={panelCardClass}>
                    <h3 className="font-headline text-2xl font-bold text-[#111827]">生成結果を表示しました</h3>
                    <p className="mt-2 text-sm leading-7 text-[#404850]">
                      地図画面に戻り、下から表示されるボトムシートで3つの候補とルート詳細を確認できます。
                    </p>
                  </section>
                ) : null}

                {plannerView === "failed" ? (
                  <section className={panelCardClass}>
                    <h3 className="font-headline text-2xl font-bold text-[#111827]">ルート生成に失敗しました</h3>
                    <p className="mt-3 text-sm leading-7 text-[#b42318]">
                      {planGenerationError ?? "時間をおいて再度お試しください。"}
                    </p>
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={handleRetryPlanPolling}
                        className="rounded-full border border-[#111827] bg-[#111827] px-5 py-2 text-sm font-semibold text-white"
                      >
                        再取得する
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlannerView("input")}
                        className="rounded-full border border-[#d1d5db] bg-white px-5 py-2 text-sm font-semibold text-[#374151]"
                      >
                        条件を見直す
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          )}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
