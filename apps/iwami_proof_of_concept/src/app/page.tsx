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
type LatLngLiteral = { lat: number; lng: number };

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

const generationMessages = [
  "条件を整理しています",
  "出発地と滞在時間をもとに候補を絞っています",
  "移動手段に合わせて回りやすい順番を調整しています",
  "やりたいことに合わせて景色・食・体験を組み合わせています",
  "帰り方に合わせて無理のないルートを整えています",
  "3つのプランを作成しています",
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
const IWAMI_DEFAULT_CENTER: LatLngLiteral = { lat: 35.5748, lng: 134.3324 };
const STATION_NODE_COORDINATES: Record<ReturnStationId, LatLngLiteral> = {
  iwami_station: { lat: 35.574278, lng: 134.335478 },
  higashihama_station: { lat: 35.599471, lng: 134.362225 },
  oiwa_station: { lat: 35.56683, lng: 134.3084892 },
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
  const [isDraggingPlanResultSheet, setIsDraggingPlanResultSheet] = useState(false);
  const [planResultSheetDragOffset, setPlanResultSheetDragOffset] = useState(0);
  const headerAuthMenuRef = useRef<HTMLDivElement | null>(null);
  const departureDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnTransportDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnStationDropdownRef = useRef<HTMLDivElement | null>(null);
  const exploreSheetDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
  const planResultSheetDragRef = useRef<{ pointerId: number; startY: number } | null>(null);
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
    setIsPlannerOpen(true);
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
          setIsPlannerOpen(false);
          setIsPlanResultSheetOpen(true);
          setPlannerView("result");
          return;
        }

        if (response.status === "failed") {
          console.error(`[AI Plan][${planRequestId}] generation failed`, response.error ?? {});
          setPlanGenerationError(response.error?.message ?? "プラン生成に失敗しました。");
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

  const visibleSpots = useMemo(() => {
    if (activeTab && navItems.some((item) => item.id === activeTab)) {
      return spots.filter((spot) => spot.primaryCategory === activeTab);
    }
    return spots;
  }, [activeTab, spots]);
  const isExploreSheetOpen = activeTab === exploreNavItem.id;

  const spotLookup = useMemo(() => {
    const byKey = new Map<string, SpotMapPin>();
    for (const spot of spots) {
      byKey.set(spot.id, spot);
      byKey.set(spot.slug, spot);
      byKey.set(normalizeSpotLookupKey(spot.id), spot);
      byKey.set(normalizeSpotLookupKey(spot.slug), spot);
      byKey.set(normalizeSpotLookupKey(spot.shortName), spot);
      byKey.set(normalizeSpotLookupKey(spot.nameJa), spot);
    }
    return byKey;
  }, [spots]);

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

  const handleExploreSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isExploreSheetOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    exploreSheetDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    setIsDraggingExploreSheet(true);
    setExploreSheetDragOffset(0);
    event.preventDefault();
  };

  const handlePlanResultSheetDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isPlanResultSheetOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    planResultSheetDragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    setIsDraggingPlanResultSheet(true);
    setPlanResultSheetDragOffset(0);
    event.preventDefault();
  };

  useEffect(() => {
    if (!isDraggingExploreSheet) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = exploreSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, Math.min(320, event.clientY - drag.startY));
      setExploreSheetDragOffset(delta);
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = exploreSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, event.clientY - drag.startY);
      const shouldClose = delta > 120;
      exploreSheetDragRef.current = null;
      setIsDraggingExploreSheet(false);
      setExploreSheetDragOffset(0);
      if (shouldClose) {
        setActiveTab((prev) => (prev === exploreNavItem.id ? null : prev));
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
    if (!isDraggingPlanResultSheet) return;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = planResultSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, Math.min(320, event.clientY - drag.startY));
      setPlanResultSheetDragOffset(delta);
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = planResultSheetDragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const delta = Math.max(0, event.clientY - drag.startY);
      const shouldClose = delta > 120;
      planResultSheetDragRef.current = null;
      setIsDraggingPlanResultSheet(false);
      setPlanResultSheetDragOffset(0);
      if (shouldClose) {
        setIsPlanResultSheetOpen(false);
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
      (isPlanResultSheetOpen ? spots : visibleSpots).map((spot) => ({
        id: spot.id,
        label: spot.shortName,
        lat: pendingSpotPositions[spot.id]?.lat ?? spot.lat,
        lng: pendingSpotPositions[spot.id]?.lng ?? spot.lng,
        category: spot.primaryCategory,
        imageUrl: spot.imageUrl,
      })),
    [isPlanResultSheetOpen, pendingSpotPositions, spots, visibleSpots],
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
    if (isSubmittingPlanRequest || !isPlanFormValid) return;

    const payload = buildPlanRequestPayload();
    if (!payload) {
      setPlanSubmitError("入力内容を確認してください。");
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
      setPlanSubmitError(response.message || "プラン作成のリクエスト送信に失敗しました。");
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

      <div className="absolute top-6 left-6 z-40">
        <button
          type="button"
          onClick={openPlanner}
          aria-label="AI旅行計画を開く"
          className="group relative flex h-12 overflow-hidden rounded-full border border-[#e5e7eb] bg-white/88 px-4 shadow-[0_14px_30px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/96 hover:shadow-[0_18px_34px_rgba(17,24,39,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] active:translate-y-0"
        >
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.45)_50%,rgba(229,231,235,0.6)_100%)]" />
          <span className="relative flex items-center">
            <span className="font-label text-sm font-semibold tracking-[0.01em] text-[#111827]">AIで旅プランを作る</span>
          </span>
        </button>
      </div>
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

      <div ref={headerAuthMenuRef} className="absolute top-6 right-6 z-50">
        <button
          type="button"
          aria-label={accessibleLabel}
          onClick={() => {
            setHeaderAuthMenuError(null);
            setIsHeaderAuthMenuOpen((prev) => !prev);
          }}
          className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white/88 shadow-[0_16px_30px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/96 active:translate-y-0"
        >
          <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />
          {isFirebaseSignedIn && firebaseAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firebaseAvatarUrl} alt="User profile" className="relative h-8 w-8 rounded-full object-cover" />
          ) : (
            <AppIcon name="person_circle" className="relative h-[26px] w-[26px] text-[#111827]" />
          )}
        </button>

        {isHeaderAuthMenuOpen ? (
          <div className="absolute top-14 right-0 w-[236px] rounded-2xl border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,250,251,0.94)_100%)] p-3 backdrop-blur-2xl shadow-[0_20px_38px_rgba(17,24,39,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]">
            <p className="text-xs leading-[17px] font-semibold text-[#374151]">{accessibleLabel}</p>
            {isSpotAdmin ? (
              <button
                type="button"
                onClick={() => {
                  void handleCreateSpotFromCenter();
                }}
                disabled={isCreatingSpot}
                className={`mt-2 flex min-h-[36px] w-full items-center justify-center rounded-xl border px-3 text-[12px] font-semibold transition-colors ${
                  isCreatingSpot
                    ? "cursor-wait border-[#d1d5db] bg-[#f3f4f6] text-[#9ca3af]"
                    : "border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb]"
                }`}
              >
                {isCreatingSpot ? "スポット追加中..." : "スポット追加"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={isFirebaseSignedIn ? handleHeaderSignOutPress : handleHeaderGoogleSignInPress}
              disabled={isHeaderAuthActionBusy}
              className={`mt-2 flex min-h-[38px] w-full items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-bold transition-colors ${
                isHeaderAuthActionBusy
                  ? "cursor-not-allowed border-[#d7dae0] bg-[#e6e8ee] text-[#707881]"
                  : "border-[#111827] bg-[#111827] text-white hover:bg-[#1f2937]"
              }`}
            >
              {isHeaderAuthActionBusy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isFirebaseSignedIn ? (
                <AppIcon name="logout" className="h-4 w-4" />
              ) : (
                <span className="font-semibold text-[12px]">G</span>
              )}
              <span>{headerAuthButtonLabel}</span>
            </button>
            {headerAuthMenuError ? (
              <p className="mt-2 text-[11px] leading-4 font-semibold text-[#ba1a1a]">{headerAuthMenuError}</p>
            ) : null}
          </div>
        ) : null}
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

      <div className="absolute right-6 bottom-32 z-40">
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
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[86vh] bg-[radial-gradient(120%_120%_at_50%_100%,rgba(15,23,42,0.24)_0%,rgba(15,23,42,0.1)_42%,rgba(15,23,42,0)_76%)] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExploreSheetOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {!isPlanResultSheetOpen ? (
        <nav
          className={`fixed inset-x-0 bottom-0 z-50 pointer-events-none transition-[padding,transform] duration-[720ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isExploreSheetOpen ? "translate-y-0 px-0" : "translate-y-[6px] px-2"
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
              : "mb-3 h-[88px] max-w-[700px] rounded-[2.15rem] px-3 pt-3 pb-4 translate-y-0"
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
            <div className="flex items-center justify-between">
              <div className="relative min-w-0 flex-1 pr-2">
                <span className="pointer-events-none absolute top-1/2 right-1.5 z-10 -translate-y-1/2 text-[12px] text-[#9ca3af]">›</span>
                <div className="flex gap-1 overflow-x-auto pr-5">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`group active:scale-95 relative flex min-w-[66px] shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2.5 transition-all duration-200 ease-out ${
                          isActive
                            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(243,244,246,0.94)_100%)] text-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_6px_14px_rgba(17,24,39,0.14)]"
                            : "text-[#6b7280] hover:bg-white/50 hover:text-[#111827]"
                        }`}
                        style={{ color: isActive ? "#111827" : item.tint }}
                      >
                        <AppIcon
                          name={item.icon}
                          className={`mb-1 h-5 w-5 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                          filled={isActive}
                        />
                        <span className="font-label text-[10px] font-semibold tracking-wider">{item.label}</span>
                        {isActive ? <span className="mt-1 h-1 w-1 rounded-full bg-[#111827]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === exploreNavItem.id ? null : exploreNavItem.id)}
                className={`group active:scale-95 relative ml-1 flex min-h-[58px] min-w-[78px] flex-col items-center justify-center rounded-2xl px-3.5 py-2.5 transition-colors duration-200 ${
                  activeTab === exploreNavItem.id
                    ? "bg-[#e9eef5] text-[#111827]"
                    : "bg-[#f4f6f9] text-[#4b5563] hover:bg-[#eef2f7] hover:text-[#111827]"
                }`}
                aria-label={exploreNavItem.label}
                aria-expanded={isExploreSheetOpen}
              >
                <span
                  className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full ${
                    activeTab === exploreNavItem.id ? "bg-white/85" : "bg-white/72"
                  }`}
                >
                  <AppIcon
                    name={exploreNavItem.icon}
                    className="h-4.5 w-4.5"
                    filled={activeTab === exploreNavItem.id}
                  />
                </span>
                <span className="font-label text-[10px] font-semibold tracking-[0.08em]">{exploreNavItem.label}</span>
              </button>
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
                <h3 className="font-headline text-[15px] font-bold tracking-[0.02em] text-[#111827]">AI旅プラン候補</h3>
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

      <div
        className={`fixed inset-0 z-[80] transition-colors duration-300 ${
          isPlannerOpen ? "pointer-events-auto bg-[#05162b59]" : "pointer-events-none bg-transparent"
        }`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePlanner();
        }}
      >
        <aside
          className={`absolute inset-y-0 left-0 h-full w-full max-w-[850px] overflow-hidden border-r border-[#e5e7eb] bg-[radial-gradient(130%_110%_at_0%_0%,#ffffff_0%,#f8fafc_52%,#f3f4f6_100%)] transform-gpu transition-transform duration-300 ease-out will-change-transform ${
            isPlannerOpen ? "translate-x-0 shadow-[20px_0_48px_rgba(5,24,52,0.28)]" : "-translate-x-full"
          }`}
        >
          {plannerView === "input" ? (
            <div className="relative flex h-full flex-col bg-transparent text-[#181c20]">
              <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(249,250,251,0.92)_100%)] px-6 backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={closePlanner}
                  className={panelIconButtonClass}
                >
                  <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/80" />
                  <AppIcon name="arrow_back" className="relative h-5 w-5" />
                </button>
                <div className="h-9 w-9" aria-hidden />
              </header>

              <div className="flex-1 overflow-y-auto pb-32">
                <main className="mx-auto max-w-3xl space-y-6 px-5 py-6">
                  <section className={`${panelCardClass} relative z-20 overflow-visible`}>
                    <h1 className="font-headline text-[1.35rem] font-bold tracking-tight text-[#111827]">AIで旅プランを作る</h1>
                    <p className="mt-3 text-[0.9375rem] leading-7 text-[#404850]">
                      出発地や滞在時間、移動手段、やりたいことに合わせて、岩美町での回り方を提案します。
                      <br className="hidden sm:block" />
                      海・駅周辺・食・体験を組み合わせたプランを、AIが複数つくります。
                    </p>
                  </section>

                  <section className={panelCardClass}>
                    <h2 className="font-headline mb-2 flex items-center gap-3 text-[1.125rem] font-semibold text-[#111827]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[0.875rem] font-bold text-white shadow-sm">
                        1
                      </span>
                      出発と滞在の条件
                    </h2>
                    <p className="mb-7 text-[0.8125rem] leading-6 text-[#5f6873]">
                      どこから出発して、どれくらい回るかをもとに、無理のないプランを組み立てます。
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
                          レンタサイクルを選ぶと、貸出場所を含めてプランを提案します。
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
                      景色・食・体験を組み合わせて、あなたに合うプランを提案します。
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

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#f9fafb] via-[#f9fafbf2] to-transparent px-5 pb-8 pt-10 backdrop-blur-sm">
                <div className="pointer-events-auto mx-auto max-w-3xl">
                  <button
                    type="button"
                    onClick={handleSubmitPlanRequest}
                    disabled={!isPlanFormValid || isSubmittingPlanRequest}
                    className={`flex w-full items-center justify-center gap-2.5 rounded-full border px-6 py-4 text-[1.0625rem] font-bold transition-all duration-200 ${
                      isPlanFormValid && !isSubmittingPlanRequest
                        ? "border-[#111827] bg-[#111827] text-white shadow-[0_8px_20px_rgba(17,24,39,0.26)] hover:bg-[#1f2937] hover:shadow-[0_12px_24px_rgba(17,24,39,0.34)] active:scale-[0.98]"
                        : "cursor-not-allowed border-[#d7dae0] bg-[#e6e8ee] text-[#707881] shadow-none"
                    }`}
                  >
                    {isSubmittingPlanRequest ? "送信中..." : "AIでプランをつくる"}
                  </button>
                  {planSubmitError ? <p className="mt-2 text-center text-xs text-[#b42318]">{planSubmitError}</p> : null}
                  {!isPlanFormValid ? (
                    <p className="mt-2 text-center text-xs text-[#707881]">
                      必須項目を入力すると、AIでプランをつくれます。
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex h-full flex-col bg-transparent text-[#181c20]">
              <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(249,250,251,0.92)_100%)] px-6 backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => setPlannerView("input")}
                  className={panelIconButtonClass}
                >
                  <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/80" />
                  <AppIcon name="arrow_back" className="relative h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={closePlanner}
                  className={panelIconButtonClass}
                >
                  <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/80" />
                  <AppIcon name="close" className="relative h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
                {plannerView === "generating" ? (
                  <section className={panelCardClass}>
                    <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
                      <div className="relative h-24 w-24">
                        <span className="absolute inset-0 rounded-full bg-[#e5e7eb] opacity-55 blur-[2px]" />
                        <span className="absolute inset-1 animate-ping rounded-full border border-[#9ca3af]" />
                        <span className="absolute inset-2 rounded-full border border-[#374151]" />
                        <span className="absolute inset-[14px] animate-spin rounded-full border-4 border-[#d1d5db] border-t-[#111827]" />
                        <span className="absolute inset-0 flex items-center justify-center text-[#111827]">
                          <AppIcon name="auto_awesome" filled className="h-8 w-8" />
                        </span>
                      </div>

                      <h3 className="font-headline mt-5 text-2xl font-bold text-[#111827]">AIが旅プランを作成中です</h3>
                      <p className="mt-2 text-sm leading-7 text-[#404850]">岩美町で回りやすい順番を考えています。</p>
                    </div>

                    <div className="mt-6 space-y-2">
                      {generationMessages.map((message, index) => {
                        const done = index <= progressIndex;
                        return (
                          <div
                            key={message}
                            className={`rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
                              done
                                ? "bg-[linear-gradient(180deg,#ffffff_0%,#f3f4f6_100%)] text-[#111827]"
                                : "bg-[#f1f4f9] text-[#707881]"
                            }`}
                          >
                            <span
                              className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                              style={{ backgroundColor: done ? "#111827" : "#bfc7d1" }}
                            />
                            <span className="align-middle">{message}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f5f7fa_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
                      <p className="text-[11px] font-semibold tracking-wide text-[#111827]">補足</p>
                      <div className="mt-2 space-y-1.5 text-xs leading-6 text-[#404850]">
                        {generationNotes.length > 0 ? (
                          generationNotes.map((note) => <p key={note}>・{note}</p>)
                        ) : (
                          <p>・入力条件をもとに、景色・食・体験のバランスを見ながらプランをまとめています。</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#404850]">
                        <span>生成進捗</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e0e2e8]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#6b7280_0%,#111827_100%)] transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[#707881]">まもなく3つのプランが表示されます。</p>
                      {planRequestId ? (
                        <p className="mt-1 text-[11px] text-[#8b95a1]">受付ID: {planRequestId}</p>
                      ) : null}
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
                    <h3 className="font-headline text-2xl font-bold text-[#111827]">プラン生成に失敗しました</h3>
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
        </aside>
      </div>
    </main>
  );
}
