"use client";

import { useEffect, useRef, useState } from "react";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAPS_SCRIPT_ID = "iwami-google-maps-script";

const IWAMI_CENTER = { lat: 33.7506, lng: 129.718 };
const IWAMI_ZOOM = 15;
const IWAMI_INITIAL_ZOOM = 11.7;
const PIN_FOCUS_ZOOM = 17;
const PIN_ENTER_DURATION_MS = 220;
const PIN_EXIT_DURATION_MS = 170;
const PIN_ENTER_STAGGER_MS = 14;
const PIN_ENTER_STAGGER_MAX_MS = 84;
const PIN_ENTER_OFFSET_PX = 7;
const PIN_EXIT_OFFSET_PX = 10;
const PIN_FOCUS_ANIMATION_MS = 680;
const MAP_MIN_ZOOM = 6;
const MAP_MAX_ZOOM = 20;
const MAP_GESTURE_HANDLING = "greedy" as const;
const SPOT_DRAG_START_THRESHOLD_PX = 2;
const DRAG_GUARD_TIMEOUT_MS = 15000;
const MAP_TOUCH_ACTION_DEFAULT = "pan-x pan-y pinch-zoom";
const PIN_WHEEL_ZOOM_STEP_IN = 0.12;
const PIN_WHEEL_ZOOM_STEP_OUT = 0.14;
const PIN_WHEEL_ZOOM_DELTA_SCALE_MIN = 0.7;
const PIN_WHEEL_ZOOM_DELTA_SCALE_MAX = 1.5;

const PIN_WIDTH = 68;
const PIN_HEIGHT = 96;
const PIN_ANCHOR_X = PIN_WIDTH / 2;
const PIN_ANCHOR_Y = 75;
const PIN_TRANSFORM_ORIGIN_Y = PIN_ANCHOR_Y - 6;
const SPOT_PIN_CIRCLE_SIZE = 60;
const SPOT_PIN_CIRCLE_TOP = 4;
const SPOT_PIN_CIRCLE_LEFT = Math.round((PIN_WIDTH - SPOT_PIN_CIRCLE_SIZE) / 2);
const SPOT_PIN_IMAGE_INSET = 2;
const SPOT_PIN_TAIL_SIZE = 14;
const SPOT_PIN_TAIL_TOP = SPOT_PIN_CIRCLE_TOP + SPOT_PIN_CIRCLE_SIZE - 4;
const SPOT_PIN_SHADOW_TOP = SPOT_PIN_TAIL_TOP + 18;

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type MapPinCategory = "see" | "eat" | "shop" | "stay" | "experience";

export type MapPin = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  category?: MapPinCategory;
  imageUrl?: string | null;
};

export type MapPinPositionChange = {
  id: string;
  lat: number;
  lng: number;
};

type GoogleMapStyleRule = {
  featureType?: string;
  elementType?: string;
  stylers: Array<{ color?: string; visibility?: "on" | "off" | "simplified" }>;
};

type GoogleMapListener = {
  remove: () => void;
};

type GooglePoint = {
  x: number;
  y: number;
};

type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

type GoogleLatLngAccessor = {
  lat: () => number;
  lng: () => number;
};

type GoogleProjection = {
  fromLatLngToDivPixel: (latLng: GoogleLatLng | LatLngLiteral) => GooglePoint | null;
  fromLatLngToContainerPixel?: (latLng: GoogleLatLng | LatLngLiteral) => GooglePoint | null;
  fromContainerPixelToLatLng?: (pixel: GooglePoint) => GoogleLatLng | null;
  fromDivPixelToLatLng?: (pixel: GooglePoint) => GoogleLatLng | null;
};

type GoogleMapPanes = {
  floatPane?: HTMLElement;
  overlayMouseTarget?: HTMLElement;
  overlayLayer?: HTMLElement;
};

type GoogleOverlayView = {
  onAdd: () => void;
  draw: () => void;
  onRemove: () => void;
  setMap: (map: GoogleMapInstance | null) => void;
  getProjection: () => GoogleProjection | null;
  getPanes: () => GoogleMapPanes | null;
};

type GoogleOverlayViewConstructor = new () => GoogleOverlayView;

type GoogleLatLngConstructor = new (lat: number, lng: number) => GoogleLatLng;

type GoogleMapConstructor = new (
  mapElement: HTMLElement,
  options: {
    center: LatLngLiteral;
    zoom: number;
    mapTypeId?: string;
    backgroundColor?: string;
    disableDefaultUI?: boolean;
    clickableIcons?: boolean;
    gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
    keyboardShortcuts?: boolean;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    isFractionalZoomEnabled?: boolean;
    renderingType?: "RASTER" | "VECTOR";
    styles?: GoogleMapStyleRule[];
  },
) => GoogleMapInstance;

type GoogleMapBounds = {
  getNorthEast: () => GoogleLatLngAccessor;
  getSouthWest: () => GoogleLatLngAccessor;
};

type GoogleLatLngBounds = {
  extend: (latLng: LatLngLiteral) => void;
};

type GoogleLatLngBoundsConstructor = new () => GoogleLatLngBounds;

type GoogleMapInstance = {
  panTo?: (latLng: LatLngLiteral) => void;
  setCenter?: (latLng: LatLngLiteral) => void;
  setZoom?: (zoom: number) => void;
  setOptions?: (options: { gestureHandling?: "cooperative" | "greedy" | "none" | "auto" }) => void;
  getZoom?: () => number;
  getCenter?: () => GoogleLatLngAccessor | undefined;
  getDiv?: () => HTMLElement;
  moveCamera?: (camera: { center?: LatLngLiteral; zoom?: number }) => void;
  fitBounds?: (
    bounds: GoogleLatLngBounds,
    padding?: number | { top: number; right: number; bottom: number; left: number },
  ) => void;
  getBounds?: () => GoogleMapBounds | undefined;
  addListener?: (eventName: string, handler: () => void) => GoogleMapListener;
};

type GooglePolyline = {
  setMap: (map: GoogleMapInstance | null) => void;
};

type GooglePolylineConstructor = new (options: {
  path: LatLngLiteral[];
  geodesic?: boolean;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  clickable?: boolean;
  zIndex?: number;
}) => GooglePolyline;

type GoogleMapsApi = {
  Map?: GoogleMapConstructor;
  OverlayView?: GoogleOverlayViewConstructor;
  LatLng?: GoogleLatLngConstructor;
  LatLngBounds?: GoogleLatLngBoundsConstructor;
  Polyline?: GooglePolylineConstructor;
  importLibrary?: (libraryName: "maps") => Promise<{ Map: GoogleMapConstructor }>;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: GoogleMapsApi;
  };
};

const CATEGORY_ACCENT: Record<MapPinCategory, string> = {
  see: "#1d4ed8",
  eat: "#b45309",
  shop: "#9333ea",
  stay: "#0b4f6c",
  experience: "#0f766e",
};

let mapsScriptPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing"));
  }

  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.Map && mapsWindow.google?.maps?.OverlayView && mapsWindow.google?.maps?.LatLng) {
    return Promise.resolve();
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    const mapsWindow = window as GoogleMapsWindow;

    const waitForMapConstructor = (retryCount = 0) => {
      const mapsApi = mapsWindow.google?.maps;
      if (mapsApi?.Map && mapsApi?.OverlayView && mapsApi?.LatLng) {
        resolve();
        return;
      }

      if (retryCount >= 120) {
        mapsScriptPromise = null;
        reject(new Error("Google Maps constructor was not ready in time"));
        return;
      }

      window.setTimeout(() => waitForMapConstructor(retryCount + 1), 50);
    };

    if (existingScript) {
      waitForMapConstructor();
      existingScript.addEventListener(
        "load",
        () => waitForMapConstructor(),
        { once: true },
      );
      existingScript.addEventListener(
        "error",
        () => {
          mapsScriptPromise = null;
          reject(new Error("Failed to load Google Maps script"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja&region=JP&v=weekly&libraries=maps&loading=async`;
    script.async = true;
    script.defer = true;
    script.addEventListener(
      "load",
      () => waitForMapConstructor(),
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        mapsScriptPromise = null;
        reject(new Error("Failed to load Google Maps script"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

const resolveMapsApi = async (): Promise<GoogleMapsApi | null> => {
  const mapsWindow = window as GoogleMapsWindow;
  const mapsApi = mapsWindow.google?.maps;
  if (!mapsApi) return null;
  if (mapsApi.Map && mapsApi.OverlayView && mapsApi.LatLng) return mapsApi;

  if (mapsApi.importLibrary) {
    try {
      await mapsApi.importLibrary("maps");
      if (mapsApi.Map && mapsApi.OverlayView && mapsApi.LatLng) {
        return mapsApi;
      }
      return null;
    } catch (error) {
      console.warn("Failed to load maps library", error);
      return null;
    }
  }

  return null;
};

function resolvePinAccentColor(category?: MapPinCategory): string {
  if (!category) return "#111827";
  return CATEGORY_ACCENT[category];
}

function buildMissingImageDataUrl(): string {
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
  <rect width='96' height='96' fill='#e5e7eb'/>
  <rect x='14' y='16' width='68' height='52' rx='10' fill='#ffffff' stroke='#cbd5e1' stroke-width='3'/>
  <circle cx='34' cy='34' r='7' fill='#9ca3af'/>
  <path d='M24 60l14-16 10 10 8-8 16 14' fill='none' stroke='#94a3b8' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/>
  <text x='50%' y='84%' text-anchor='middle' fill='#6b7280' font-size='13' font-family='sans-serif' font-weight='700'>NO IMAGE</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function resolvePinPhotoUrl(pin: MapPin): string | null {
  const fromData = pin.imageUrl?.trim();
  if (fromData) return fromData;
  return null;
}

function computeStableIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

type RenderSpotEntity = {
  key: string;
  kind: "spot";
  pin: MapPin;
  lat: number;
  lng: number;
};

type RenderClusterEntity = {
  key: string;
  kind: "cluster";
  lat: number;
  lng: number;
  count: number;
  members: MapPin[];
};

type RenderEntity = RenderSpotEntity | RenderClusterEntity;

function resolveClusterRepresentativePin(cluster: RenderClusterEntity): MapPin | null {
  if (cluster.members.length === 0) return null;

  const sortedMembers = cluster.members.slice().sort((a, b) => a.id.localeCompare(b.id));
  const membersWithImage = sortedMembers.filter((member) => Boolean(resolvePinPhotoUrl(member)));
  const candidates = membersWithImage.length > 0 ? membersWithImage : sortedMembers;
  const index = computeStableIndex(cluster.key, candidates.length);
  return candidates[index] ?? candidates[0] ?? null;
}

type MarkerDomNode = {
  key: string;
  kind: "spot" | "cluster";
  spot: MapPin | null;
  cluster: RenderClusterEntity | null;
  root: HTMLDivElement;
  button: HTMLButtonElement;
  content: HTMLSpanElement;
  frame: HTMLSpanElement;
  tail: HTMLSpanElement;
  shadow: HTMLSpanElement;
  label: HTMLSpanElement;
  imageEl: HTMLImageElement | null;
  imageSignature: string | null;
  anchorX: number;
  anchorY: number;
  isExiting: boolean;
  removeTimerId: number | null;
  enterRafId: number | null;
  lastX: number | null;
  lastY: number | null;
};

type WorldPoint = {
  x: number;
  y: number;
};

const CLUSTER_ZOOM_STEP = 0.5;
const CLUSTER_DISABLE_ZOOM = 16.8;
const CLUSTER_RADIUS_MIN_PX = 46;
const CLUSTER_RADIUS_MAX_PX = 112;
const CLUSTER_RADIUS_ZOOM_LOW = 8;
const CLUSTER_RADIUS_ZOOM_HIGH = 15.5;
const CLUSTER_CLICK_ZOOM_DELTA = 1.8;
const CLUSTER_ZOOM_HYSTERESIS = CLUSTER_ZOOM_STEP * 0.36;
const MISSING_IMAGE_DATA_URL = buildMissingImageDataUrl();

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function quantizeClusterZoom(zoom: number): number {
  return Math.round(zoom / CLUSTER_ZOOM_STEP) * CLUSTER_ZOOM_STEP;
}

function resolveClusterZoomBucket(params: { zoom: number; previousBucket: number | null }): number {
  const { zoom, previousBucket } = params;
  const quantized = quantizeClusterZoom(zoom);
  if (previousBucket == null) return quantized;
  if (Math.abs(zoom - previousBucket) < CLUSTER_ZOOM_HYSTERESIS) {
    return previousBucket;
  }
  return quantized;
}

function computeClusterRadiusPx(zoomBucket: number): number {
  const t = clampNumber(
    (zoomBucket - CLUSTER_RADIUS_ZOOM_LOW) / (CLUSTER_RADIUS_ZOOM_HIGH - CLUSTER_RADIUS_ZOOM_LOW),
    0,
    1,
  );
  return CLUSTER_RADIUS_MAX_PX + (CLUSTER_RADIUS_MIN_PX - CLUSTER_RADIUS_MAX_PX) * t;
}

function projectLatLngToWorld(point: LatLngLiteral, zoom: number): WorldPoint {
  const scale = 256 * 2 ** zoom;
  const clampedLat = clampNumber(point.lat, -85.05112878, 85.05112878);
  const x = ((point.lng + 180) / 360) * scale;
  const sinLat = Math.sin((clampedLat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function normalizeWrappedWorldDelta(delta: number, worldSize: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(worldSize) || worldSize <= 0) return delta;
  const half = worldSize / 2;
  return ((delta + half) % worldSize + worldSize) % worldSize - half;
}

function unprojectWorldToLatLng(world: WorldPoint, zoom: number): LatLngLiteral {
  const scale = 256 * 2 ** zoom;
  const lng = (world.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * world.y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

function buildRenderEntitiesForZoom(params: {
  pins: MapPin[];
  zoomBucket: number;
  disableClustering: boolean;
}): RenderEntity[] {
  const { pins, zoomBucket, disableClustering } = params;
  if (pins.length === 0) return [];

  const spotEntities = pins
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map<RenderSpotEntity>((pin) => ({
      key: `spot:${pin.id}`,
      kind: "spot",
      pin,
      lat: pin.lat,
      lng: pin.lng,
    }));

  if (disableClustering || pins.length <= 1 || zoomBucket >= CLUSTER_DISABLE_ZOOM) {
    return spotEntities;
  }

  const clusterRadiusPx = computeClusterRadiusPx(zoomBucket);
  const clusterRadiusSq = clusterRadiusPx * clusterRadiusPx;

  type MutableCluster = {
    seedCellX: number;
    seedCellY: number;
    sumWorldX: number;
    sumWorldY: number;
    count: number;
    members: MapPin[];
  };

  const clusters: MutableCluster[] = [];
  const clusterGrid = new Map<string, MutableCluster[]>();
  const sortedPins = pins.slice().sort((a, b) => a.id.localeCompare(b.id));

  for (const pin of sortedPins) {
    const world = projectLatLngToWorld({ lat: pin.lat, lng: pin.lng }, zoomBucket);
    const cellX = Math.floor(world.x / clusterRadiusPx);
    const cellY = Math.floor(world.y / clusterRadiusPx);

    let bestCluster: MutableCluster | null = null;
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const bucket = clusterGrid.get(`${cellX + offsetX}:${cellY + offsetY}`);
        if (!bucket) continue;
        for (const candidate of bucket) {
          const centerX = candidate.sumWorldX / candidate.count;
          const centerY = candidate.sumWorldY / candidate.count;
          const dx = world.x - centerX;
          const dy = world.y - centerY;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq <= clusterRadiusSq && distanceSq < bestDistanceSq) {
            bestDistanceSq = distanceSq;
            bestCluster = candidate;
          }
        }
      }
    }

    if (!bestCluster) {
      const created: MutableCluster = {
        seedCellX: cellX,
        seedCellY: cellY,
        sumWorldX: world.x,
        sumWorldY: world.y,
        count: 1,
        members: [pin],
      };
      clusters.push(created);
      const key = `${cellX}:${cellY}`;
      const existing = clusterGrid.get(key);
      if (existing) {
        existing.push(created);
      } else {
        clusterGrid.set(key, [created]);
      }
      continue;
    }

    bestCluster.sumWorldX += world.x;
    bestCluster.sumWorldY += world.y;
    bestCluster.count += 1;
    bestCluster.members.push(pin);
  }

  const entities: RenderEntity[] = [];
  for (const cluster of clusters) {
    if (cluster.count <= 1) {
      const member = cluster.members[0];
      entities.push({
        key: `spot:${member.id}`,
        kind: "spot",
        pin: member,
        lat: member.lat,
        lng: member.lng,
      });
      continue;
    }

    const centroid = {
      x: cluster.sumWorldX / cluster.count,
      y: cluster.sumWorldY / cluster.count,
    };
    const center = unprojectWorldToLatLng(centroid, zoomBucket);
    const anchorSpotId = cluster.members[0]?.id ?? "cluster";

    entities.push({
      key: `cluster:${zoomBucket.toFixed(1)}:${cluster.seedCellX}:${cluster.seedCellY}:${anchorSpotId}`,
      kind: "cluster",
      lat: center.lat,
      lng: center.lng,
      count: cluster.count,
      members: cluster.members.slice(),
    });
  }

  return entities.sort((a, b) => a.key.localeCompare(b.key));
}

class PhotoPinOverlayController {
  private readonly map: GoogleMapInstance;
  private readonly mapsApi: GoogleMapsApi;
  private readonly overlay: GoogleOverlayView;
  private readonly prefersReducedMotion: boolean;
  private enablePinEditing: boolean;
  private disableClustering: boolean;
  private readonly onSpotClick: ((pin: MapPin) => void) | null;
  private readonly onSpotPositionChange: ((nextPosition: MapPinPositionChange) => void) | null;
  private readonly markerNodes = new Map<string, MarkerDomNode>();
  private readonly listeners: GoogleMapListener[] = [];
  private root: HTMLDivElement | null = null;
  private pins: MapPin[] = [];
  private renderEntities: RenderEntity[] = [];
  private pinsRevision = 0;
  private entitiesRevision = -1;
  private entitiesZoomBucket: number | null = null;
  private selectedPinId: string | null = null;
  private externalSelectedSpotId: string | null = null;
  private hoveredPinId: string | null = null;
  private rafId: number | null = null;
  private focusRafId: number | null = null;
  private suppressMapClickUntil = 0;
  private suppressSpotClickUntil = 0;
  private draggingNodeKey: string | null = null;
  private dragPointerId: number | null = null;
  private dragPointerDeltaX = 0;
  private dragPointerDeltaY = 0;
  private dragStartClientX = 0;
  private dragStartClientY = 0;
  private dragMoved = false;
  private draggingSpotId: string | null = null;
  private dragListenersAttached = false;
  private dragGuardTimerId: number | null = null;
  private mapDivInteractionListenersAttached = false;
  private mapGestureLockedByDrag = false;
  private queuedPinsWhileDragging: MapPin[] | null = null;

  constructor(params: {
    map: GoogleMapInstance;
    mapsApi: GoogleMapsApi;
    pins: MapPin[];
    enablePinEditing?: boolean;
    disableClustering?: boolean;
    onSpotClick?: (pin: MapPin) => void;
    onSpotPositionChange?: (nextPosition: MapPinPositionChange) => void;
  }) {
    this.map = params.map;
    this.mapsApi = params.mapsApi;
    this.pins = params.pins;
    this.enablePinEditing = Boolean(params.enablePinEditing);
    this.disableClustering = Boolean(params.disableClustering);
    this.onSpotClick = params.onSpotClick ?? null;
    this.onSpotPositionChange = params.onSpotPositionChange ?? null;
    this.prefersReducedMotion =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    if (!this.mapsApi.OverlayView) {
      throw new Error("Google OverlayView is not available");
    }

    this.overlay = new this.mapsApi.OverlayView();
    this.overlay.onAdd = () => {
      const panes = this.overlay.getPanes();
      if (!panes) return;

      const container = document.createElement("div");
      container.className = "iwami-photo-pin-layer";
      container.style.position = "absolute";
      container.style.inset = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";
      container.style.userSelect = "none";

      const paneTarget = panes.floatPane ?? panes.overlayMouseTarget ?? panes.overlayLayer;
      if (!paneTarget) return;
      const mapDiv = typeof this.map.getDiv === "function" ? this.map.getDiv() : null;
      if (mapDiv && window.getComputedStyle(mapDiv).position === "static") {
        mapDiv.style.position = "relative";
      }
      const containerHost = mapDiv ?? paneTarget;
      container.style.zIndex = "20";
      containerHost.appendChild(container);
      this.root = container;

      this.requestDraw();
    };

    this.overlay.draw = () => {
      this.drawNow();
    };

    this.overlay.onRemove = () => {
      this.cancelAnimation();
      this.cancelFocusAnimation();
      this.stopDraggingSpot();
      this.removeAllMarkerNodes();
      if (this.root?.parentNode) {
        this.root.parentNode.removeChild(this.root);
      }
      this.root = null;
    };

    this.overlay.setMap(this.map);
    this.attachMapDivInteractionListeners();

    if (typeof this.map.addListener === "function") {
      this.listeners.push(this.map.addListener("click", this.handleMapClick));
      this.listeners.push(this.map.addListener("dragstart", this.handleMapInteractionStart));
    }

    window.addEventListener("resize", this.requestDraw, { passive: true });
    window.addEventListener("blur", this.handleWindowBlur, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibilityChange, { passive: true });
  }

  setPins(nextPins: MapPin[]): void {
    if (this.draggingNodeKey) {
      this.queuedPinsWhileDragging = nextPins;
      return;
    }
    this.pins = nextPins;
    this.pinsRevision += 1;
    this.requestDraw();
  }

  setEditingEnabled(nextEnabled: boolean): void {
    const normalized = Boolean(nextEnabled);
    if (this.enablePinEditing === normalized) return;
    this.enablePinEditing = normalized;
    this.updateSpotNodeTouchAction();
    if (!normalized) {
      this.stopDraggingSpot();
    }
  }

  setDisableClustering(nextEnabled: boolean): void {
    const normalized = Boolean(nextEnabled);
    if (this.disableClustering === normalized) return;
    this.disableClustering = normalized;
    this.requestDraw();
  }

  setExternalSelectedSpotId(nextSpotId: string | null): void {
    const normalized = nextSpotId?.trim() ?? null;
    if (this.externalSelectedSpotId === normalized) return;
    this.externalSelectedSpotId = normalized;
    this.refreshMarkerStates();
    this.requestDraw();
  }

  destroy(): void {
    this.cancelAnimation();
    this.cancelFocusAnimation();
    this.stopDraggingSpot();
    this.detachMapDivInteractionListeners();
    this.listeners.forEach((listener) => listener.remove());
    this.listeners.length = 0;
    window.removeEventListener("resize", this.requestDraw);
    window.removeEventListener("blur", this.handleWindowBlur);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.overlay.setMap(null);
    this.removeAllMarkerNodes();
    this.root = null;
  }

  private attachMapDivInteractionListeners(): void {
    if (this.mapDivInteractionListenersAttached) return;
    const mapDiv = typeof this.map.getDiv === "function" ? this.map.getDiv() : null;
    if (!mapDiv) return;
    mapDiv.addEventListener("pointerdown", this.handleMapInteractionStart, { passive: true });
    mapDiv.addEventListener("touchstart", this.handleMapInteractionStart, { passive: true });
    this.mapDivInteractionListenersAttached = true;
  }

  private detachMapDivInteractionListeners(): void {
    if (!this.mapDivInteractionListenersAttached) return;
    const mapDiv = typeof this.map.getDiv === "function" ? this.map.getDiv() : null;
    if (mapDiv) {
      mapDiv.removeEventListener("pointerdown", this.handleMapInteractionStart);
      mapDiv.removeEventListener("touchstart", this.handleMapInteractionStart);
    }
    this.mapDivInteractionListenersAttached = false;
  }

  private updateSpotNodeTouchAction(): void {
    const nextTouchAction = this.enablePinEditing ? "none" : MAP_TOUCH_ACTION_DEFAULT;
    for (const node of this.markerNodes.values()) {
      if (node.kind !== "spot") continue;
      node.button.style.touchAction = nextTouchAction;
    }
  }

  private handlePinWheelZoom(event: WheelEvent): void {
    if (this.draggingNodeKey) return;
    if (typeof this.map.getZoom !== "function") return;
    const currentZoom = this.map.getZoom();
    if (typeof currentZoom !== "number" || !Number.isFinite(currentZoom)) return;

    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!Number.isFinite(dominantDelta) || Math.abs(dominantDelta) < 0.01) return;

    const deltaScale = clampNumber(
      Math.abs(dominantDelta) / 16,
      PIN_WHEEL_ZOOM_DELTA_SCALE_MIN,
      PIN_WHEEL_ZOOM_DELTA_SCALE_MAX,
    );
    const zoomStep = (dominantDelta < 0 ? PIN_WHEEL_ZOOM_STEP_IN : -PIN_WHEEL_ZOOM_STEP_OUT) * deltaScale;
    const nextZoom = this.clampZoom(currentZoom + zoomStep);
    if (Math.abs(nextZoom - currentZoom) < 0.0001) return;

    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
    this.cancelFocusAnimation();
    const currentCenter = this.readCurrentCenter(IWAMI_CENTER);
    const pointerPixel = this.projectClientToMapPixel({
      clientX: event.clientX,
      clientY: event.clientY,
    });
    const mapRect = this.getMapViewportRect();
    const viewportWidth = mapRect?.width ?? 0;
    const viewportHeight = mapRect?.height ?? 0;

    let nextCenter = currentCenter;
    if (pointerPixel && viewportWidth > 0 && viewportHeight > 0) {
      const dx = pointerPixel.x - viewportWidth / 2;
      const dy = pointerPixel.y - viewportHeight / 2;

      const centerWorldBefore = projectLatLngToWorld(currentCenter, currentZoom);
      const anchorWorldBefore = {
        x: centerWorldBefore.x + dx,
        y: centerWorldBefore.y + dy,
      };
      const anchorLatLng = unprojectWorldToLatLng(anchorWorldBefore, currentZoom);

      const anchorWorldAfter = projectLatLngToWorld(anchorLatLng, nextZoom);
      const centerWorldAfter = {
        x: anchorWorldAfter.x - dx,
        y: anchorWorldAfter.y - dy,
      };
      const computedCenter = unprojectWorldToLatLng(centerWorldAfter, nextZoom);
      nextCenter = {
        lat: clampNumber(computedCenter.lat, -85.05112878, 85.05112878),
        lng: ((computedCenter.lng + 540) % 360) - 180,
      };
    }

    this.applyCamera(nextCenter, nextZoom);
    this.requestDraw();
  }

  private cancelAnimation(): void {
    if (this.rafId != null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private cancelFocusAnimation(): void {
    if (this.focusRafId != null) {
      window.cancelAnimationFrame(this.focusRafId);
      this.focusRafId = null;
    }
  }

  private readonly requestDraw = () => {
    if (this.rafId != null) return;
    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.drawNow();
    });
  };

  private readonly handleMapClick = () => {
    if (Date.now() < this.suppressMapClickUntil) return;
    this.stopDraggingSpot();
    this.clearSelection();
  };

  private attachGlobalDragListeners(): void {
    if (this.dragListenersAttached) return;
    window.addEventListener("pointermove", this.handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", this.handleWindowPointerEnd, { passive: true });
    window.addEventListener("pointercancel", this.handleWindowPointerEnd, { passive: true });
    this.dragListenersAttached = true;
  }

  private detachGlobalDragListeners(): void {
    if (!this.dragListenersAttached) return;
    window.removeEventListener("pointermove", this.handleWindowPointerMove);
    window.removeEventListener("pointerup", this.handleWindowPointerEnd);
    window.removeEventListener("pointercancel", this.handleWindowPointerEnd);
    this.dragListenersAttached = false;
  }

  private readonly handleWindowPointerMove = (event: PointerEvent) => {
    if (!this.draggingNodeKey) return;
    event.preventDefault();
    this.continueDraggingSpot(event);
  };

  private readonly handleWindowPointerEnd = (event: PointerEvent) => {
    if (!this.draggingNodeKey) return;
    const currentNode = this.markerNodes.get(this.draggingNodeKey);
    if (!currentNode) {
      this.stopDraggingSpot();
      return;
    }
    this.endDraggingSpot({ node: currentNode, event });
  };

  private getMapViewportRect(): DOMRect | null {
    const mapDiv = typeof this.map.getDiv === "function" ? this.map.getDiv() : null;
    if (mapDiv) {
      return mapDiv.getBoundingClientRect();
    }
    if (this.root) {
      return this.root.getBoundingClientRect();
    }
    return null;
  }

  private projectClientToMapPixel(params: { clientX: number; clientY: number }): GooglePoint | null {
    const rect = this.getMapViewportRect();
    if (!rect) return null;
    const x = params.clientX - rect.left;
    const y = params.clientY - rect.top;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  private updateSpotPosition(params: { spotId: string; lat: number; lng: number }): void {
    const { spotId, lat, lng } = params;
    let didUpdate = false;
    this.pins = this.pins.map((pin) => {
      if (pin.id !== spotId) return pin;
      didUpdate = true;
      return {
        ...pin,
        lat,
        lng,
      };
    });
    if (!didUpdate) return;

    this.pinsRevision += 1;
    this.onSpotPositionChange?.({ id: spotId, lat, lng });
    this.requestDraw();
  }

  private stopDraggingSpot(): void {
    this.detachGlobalDragListeners();
    if (this.dragGuardTimerId != null) {
      window.clearTimeout(this.dragGuardTimerId);
      this.dragGuardTimerId = null;
    }
    this.draggingNodeKey = null;
    this.dragPointerId = null;
    this.dragMoved = false;
    this.draggingSpotId = null;
    if (this.mapGestureLockedByDrag && typeof this.map.setOptions === "function") {
      this.map.setOptions({ gestureHandling: MAP_GESTURE_HANDLING });
      this.mapGestureLockedByDrag = false;
    }
    if (this.queuedPinsWhileDragging) {
      this.pins = this.queuedPinsWhileDragging;
      this.queuedPinsWhileDragging = null;
      this.pinsRevision += 1;
      this.requestDraw();
    }
  }

  private startDraggingSpot(params: {
    node: MarkerDomNode;
    event: PointerEvent;
  }): void {
    if (!this.enablePinEditing) return;
    if (!this.root || !params.node.spot) return;

    const anchorX = params.node.lastX;
    const anchorY = params.node.lastY;
    if (anchorX == null || anchorY == null) return;

    const pointerPixel = this.projectClientToMapPixel({
      clientX: params.event.clientX,
      clientY: params.event.clientY,
    });
    if (!pointerPixel) return;

    this.draggingNodeKey = params.node.key;
    this.dragPointerId = params.event.pointerId;
    this.dragStartClientX = params.event.clientX;
    this.dragStartClientY = params.event.clientY;
    this.dragPointerDeltaX = pointerPixel.x - anchorX;
    this.dragPointerDeltaY = pointerPixel.y - anchorY;
    this.dragMoved = false;
    this.draggingSpotId = params.node.spot.id;
    this.cancelFocusAnimation();
    this.clearNodeAnimationHandles(params.node);
    params.node.isExiting = false;
    params.node.button.disabled = false;
    params.node.root.style.pointerEvents = "auto";
    params.node.content.style.transition = "none";
    params.node.content.style.opacity = "1";
    params.node.content.style.transform = "translate3d(0,0,0) scale(1)";
    this.suppressMapClickUntil = Date.now() + 260;
    this.attachGlobalDragListeners();
    this.dragGuardTimerId = window.setTimeout(() => {
      this.stopDraggingSpot();
    }, DRAG_GUARD_TIMEOUT_MS);
    if (typeof this.map.setOptions === "function") {
      this.map.setOptions({ gestureHandling: "none" });
      this.mapGestureLockedByDrag = true;
    }

    try {
      params.node.button.setPointerCapture(params.event.pointerId);
    } catch {
      // Fallback to window-level pointer listeners on browsers that do not support pointer capture.
    }
  }

  private continueDraggingSpot(event: PointerEvent): void {
    if (!this.enablePinEditing) return;
    if (!this.draggingNodeKey || this.dragPointerId !== event.pointerId) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (!this.mapsApi.LatLng) return;
    const projection = this.overlay.getProjection();
    const hasContainerProjection = typeof projection?.fromContainerPixelToLatLng === "function";
    const hasDivProjection = typeof projection?.fromDivPixelToLatLng === "function";
    if (!projection || (!hasContainerProjection && !hasDivProjection)) return;

    const pointerPixel = this.projectClientToMapPixel({
      clientX: event.clientX,
      clientY: event.clientY,
    });
    if (!pointerPixel) return;

    const distance = Math.hypot(event.clientX - this.dragStartClientX, event.clientY - this.dragStartClientY);
    if (distance >= SPOT_DRAG_START_THRESHOLD_PX) {
      this.dragMoved = true;
    }

    const anchorPixel: GooglePoint = {
      x: pointerPixel.x - this.dragPointerDeltaX,
      y: pointerPixel.y - this.dragPointerDeltaY,
    };
    const draggingNode = this.markerNodes.get(this.draggingNodeKey);
    if (draggingNode) {
      draggingNode.lastX = anchorPixel.x;
      draggingNode.lastY = anchorPixel.y;
      draggingNode.root.style.visibility = "visible";
      const dragTranslateX = anchorPixel.x - draggingNode.anchorX;
      const dragTranslateY = anchorPixel.y - draggingNode.anchorY;
      draggingNode.root.style.transform = `translate3d(${dragTranslateX}px, ${dragTranslateY}px, 0)`;
    }
    const latLng = projection.fromContainerPixelToLatLng
      ? projection.fromContainerPixelToLatLng(anchorPixel)
      : projection.fromDivPixelToLatLng
        ? projection.fromDivPixelToLatLng(anchorPixel)
        : null;
    const lat = latLng?.lat();
    const lng = latLng?.lng();
    if (typeof lat !== "number" || !Number.isFinite(lat) || typeof lng !== "number" || !Number.isFinite(lng)) {
      return;
    }

    if (!this.draggingSpotId) return;
    this.updateSpotPosition({
      spotId: this.draggingSpotId,
      lat,
      lng,
    });
  }

  private endDraggingSpot(params: {
    node: MarkerDomNode;
    event: PointerEvent;
  }): void {
    const isDraggingThisNode = this.draggingNodeKey === params.node.key && this.dragPointerId === params.event.pointerId;
    if (!isDraggingThisNode) return;

    if (
      typeof params.node.button.hasPointerCapture === "function" &&
      typeof params.node.button.releasePointerCapture === "function" &&
      params.node.button.hasPointerCapture(params.event.pointerId)
    ) {
      params.node.button.releasePointerCapture(params.event.pointerId);
    }

    if (this.dragMoved) {
      this.suppressSpotClickUntil = Date.now() + 320;
      this.suppressMapClickUntil = Date.now() + 320;
      this.clearSelection();
    }
    this.stopDraggingSpot();
  }

  private clampZoom(nextZoom: number): number {
    return clampNumber(nextZoom, MAP_MIN_ZOOM, MAP_MAX_ZOOM);
  }

  private readCurrentCenter(fallback: LatLngLiteral): LatLngLiteral {
    if (typeof this.map.getCenter === "function") {
      const center = this.map.getCenter();
      const lat = center?.lat();
      const lng = center?.lng();
      if (typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
    return fallback;
  }

  private applyCamera(center: LatLngLiteral, zoom: number): void {
    const clampedZoom = this.clampZoom(zoom);
    if (typeof this.map.moveCamera === "function") {
      this.map.moveCamera({ center, zoom: clampedZoom });
      return;
    }
    if (typeof this.map.setCenter === "function") {
      this.map.setCenter(center);
    }
    if (typeof this.map.setZoom === "function") {
      this.map.setZoom(clampedZoom);
    }
  }

  private easeInOutCubic(t: number): number {
    if (t < 0.5) return 4 * t * t * t;
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private animateCameraTo(params: { targetCenter: LatLngLiteral; targetZoom: number; durationMs: number }): void {
    const { targetCenter, targetZoom, durationMs } = params;
    const currentZoom = typeof this.map.getZoom === "function" ? this.map.getZoom() : undefined;
    const startZoom = typeof currentZoom === "number" && Number.isFinite(currentZoom) ? currentZoom : IWAMI_ZOOM;
    const clampedTargetZoom = this.clampZoom(targetZoom);
    const startCenter = this.readCurrentCenter(targetCenter);

    const zoomDelta = Math.abs(clampedTargetZoom - startZoom);
    const centerDelta = Math.abs(targetCenter.lat - startCenter.lat) + Math.abs(targetCenter.lng - startCenter.lng);
    if (zoomDelta < 0.01 && centerDelta < 0.000001) {
      return;
    }

    this.cancelFocusAnimation();
    if (this.prefersReducedMotion) {
      this.applyCamera(targetCenter, clampedTargetZoom);
      return;
    }

    const startedAt = performance.now();
    const step = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = this.easeInOutCubic(progress);

      const lat = startCenter.lat + (targetCenter.lat - startCenter.lat) * eased;
      const lng = startCenter.lng + (targetCenter.lng - startCenter.lng) * eased;
      const zoom = startZoom + (clampedTargetZoom - startZoom) * eased;
      this.applyCamera({ lat, lng }, zoom);

      if (progress >= 1) {
        this.applyCamera(targetCenter, clampedTargetZoom);
        this.focusRafId = null;
        return;
      }

      this.focusRafId = window.requestAnimationFrame(step);
    };

    this.focusRafId = window.requestAnimationFrame(step);
  }

  private focusPin(pin: MapPin): void {
    const targetCenter = { lat: pin.lat, lng: pin.lng };
    const currentZoom = typeof this.map.getZoom === "function" ? this.map.getZoom() : undefined;
    const startZoom = typeof currentZoom === "number" && Number.isFinite(currentZoom) ? currentZoom : IWAMI_ZOOM;
    const targetZoom = Math.max(startZoom, PIN_FOCUS_ZOOM);
    this.animateCameraTo({
      targetCenter,
      targetZoom,
      durationMs: PIN_FOCUS_ANIMATION_MS,
    });
  }

  private focusCluster(cluster: RenderClusterEntity): void {
    if (cluster.members.length === 0) return;
    this.cancelFocusAnimation();

    const currentZoom = typeof this.map.getZoom === "function" ? this.map.getZoom() : undefined;
    const startZoom = typeof currentZoom === "number" && Number.isFinite(currentZoom) ? currentZoom : IWAMI_ZOOM;
    this.animateCameraTo({
      targetCenter: { lat: cluster.lat, lng: cluster.lng },
      targetZoom: Math.min(startZoom + CLUSTER_CLICK_ZOOM_DELTA, PIN_FOCUS_ZOOM),
      durationMs: PIN_FOCUS_ANIMATION_MS,
    });
  }

  private clearSelection(): void {
    if (!this.selectedPinId) return;
    this.cancelFocusAnimation();
    this.selectedPinId = null;
    this.refreshMarkerStates();
    this.requestDraw();
  }

  private readonly handleMapInteractionStart = () => {
    this.cancelFocusAnimation();
  };

  private readonly handleWindowBlur = () => {
    this.stopDraggingSpot();
    this.cancelFocusAnimation();
  };

  private readonly handleVisibilityChange = () => {
    if (document.visibilityState !== "visible") {
      this.stopDraggingSpot();
      this.cancelFocusAnimation();
    }
  };

  private selectSpot(entityKey: string, pin: MapPin): void {
    this.selectedPinId = entityKey;
    this.refreshMarkerStates();
    this.requestDraw();
    this.onSpotClick?.(pin);
    this.focusPin(pin);
  }

  private ensureRenderEntities(currentZoom: number): void {
    const zoomBucket = resolveClusterZoomBucket({
      zoom: currentZoom,
      previousBucket: this.entitiesZoomBucket,
    });
    if (this.entitiesRevision === this.pinsRevision && this.entitiesZoomBucket === zoomBucket) {
      return;
    }

    this.renderEntities = buildRenderEntitiesForZoom({
      pins: this.pins,
      zoomBucket,
      disableClustering: this.enablePinEditing || this.disableClustering,
    });
    this.entitiesRevision = this.pinsRevision;
    this.entitiesZoomBucket = zoomBucket;
    this.syncMarkers();
  }

  private syncMarkers(): void {
    if (!this.root) return;

    const nextEntityMap = new Map(this.renderEntities.map((entity) => [entity.key, entity]));
    const nextIds = new Set(nextEntityMap.keys());
    let enterIndex = 0;

    for (const [id, node] of this.markerNodes.entries()) {
      const nextEntity = nextEntityMap.get(id);
      if (!nextEntity) {
        if (this.draggingNodeKey === id) {
          continue;
        }
        this.startExitAnimation(node);
        continue;
      }

      this.updateNodeData(node, nextEntity);
      if (node.isExiting) {
        this.startEnterAnimation(node);
      }
    }

    for (const entity of this.renderEntities) {
      const existing = this.markerNodes.get(entity.key);
      if (existing) continue;

      const nextNode = entity.kind === "spot" ? this.createSpotNode(entity) : this.createClusterNode(entity);
      this.markerNodes.set(entity.key, nextNode);
      this.root.appendChild(nextNode.root);

      const delayMs = this.prefersReducedMotion
        ? 0
        : Math.min(PIN_ENTER_STAGGER_MAX_MS, enterIndex * PIN_ENTER_STAGGER_MS);
      this.startEnterAnimation(nextNode, delayMs);
      enterIndex += 1;
    }

    if (this.selectedPinId && !nextIds.has(this.selectedPinId)) {
      this.selectedPinId = null;
    }
    if (this.hoveredPinId && !nextIds.has(this.hoveredPinId)) {
      this.hoveredPinId = null;
    }
    this.refreshMarkerStates();
  }

  private clearNodeAnimationHandles(node: MarkerDomNode): void {
    if (node.removeTimerId != null) {
      window.clearTimeout(node.removeTimerId);
      node.removeTimerId = null;
    }
    if (node.enterRafId != null) {
      window.cancelAnimationFrame(node.enterRafId);
      node.enterRafId = null;
    }
  }

  private startEnterAnimation(node: MarkerDomNode, delayMs = 0): void {
    this.clearNodeAnimationHandles(node);
    node.isExiting = false;
    node.button.disabled = false;
    node.root.style.pointerEvents = "auto";

    if (this.prefersReducedMotion) {
      node.content.style.transition = "none";
      node.content.style.transitionDelay = "0ms";
      node.content.style.opacity = "1";
      node.content.style.transform = "translate3d(0,0,0) scale(1)";
      return;
    }

    node.content.style.transition =
      `opacity ${PIN_ENTER_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1),` +
      ` transform ${PIN_ENTER_DURATION_MS + 50}ms cubic-bezier(0.22,1,0.36,1)`;
    node.content.style.transitionDelay = `${Math.max(0, delayMs)}ms`;
    node.content.style.opacity = "0";
    node.content.style.transform = `translate3d(0,${PIN_ENTER_OFFSET_PX}px,0) scale(0.9)`;

    node.enterRafId = window.requestAnimationFrame(() => {
      node.enterRafId = null;
      node.content.style.opacity = "1";
      node.content.style.transform = "translate3d(0,0,0) scale(1)";
    });
  }

  private finalizeNodeRemoval(markerKey: string): void {
    const node = this.markerNodes.get(markerKey);
    if (!node || !node.isExiting) return;
    this.clearNodeAnimationHandles(node);
    node.root.remove();
    this.markerNodes.delete(markerKey);
  }

  private startExitAnimation(node: MarkerDomNode): void {
    if (this.draggingNodeKey === node.key) return;
    if (node.isExiting) return;
    node.isExiting = true;
    node.button.disabled = true;
    node.root.style.pointerEvents = "none";
    this.clearNodeAnimationHandles(node);

    if (this.prefersReducedMotion) {
      this.finalizeNodeRemoval(node.key);
      return;
    }

    node.content.style.transition =
      `opacity ${PIN_EXIT_DURATION_MS}ms cubic-bezier(0.4,0,1,1),` +
      ` transform ${PIN_EXIT_DURATION_MS}ms cubic-bezier(0.4,0,1,1)`;
    node.content.style.transitionDelay = "0ms";
    node.content.style.opacity = "0";
    node.content.style.transform = `translate3d(0,${PIN_EXIT_OFFSET_PX}px,0) scale(0.88)`;

    node.removeTimerId = window.setTimeout(() => {
      this.finalizeNodeRemoval(node.key);
    }, PIN_EXIT_DURATION_MS + 40);
  }

  private createBaseNode(params: { key: string; kind: "spot" | "cluster"; width: number; height: number }): {
    root: HTMLDivElement;
    button: HTMLButtonElement;
    content: HTMLSpanElement;
  } {
    const root = document.createElement("div");
    root.className = "iwami-photo-pin";
    root.style.width = `${params.width}px`;
    root.style.height = `${params.height}px`;
    root.style.position = "absolute";
    root.style.left = "0";
    root.style.top = "0";
    root.style.display = "block";
    root.style.pointerEvents = "auto";
    root.style.transform = "translate3d(0,0,0)";
    root.style.willChange = "transform";

    const button = document.createElement("button");
    button.type = "button";
    button.className = params.kind === "spot" ? "iwami-photo-pin__button" : "iwami-cluster-pin__button";
    button.style.position = "relative";
    button.style.width = "100%";
    button.style.height = "100%";
    button.style.margin = "0";
    button.style.padding = "0";
    button.style.border = "0";
    button.style.background = "transparent";
    button.style.pointerEvents = "auto";
    button.style.cursor = "pointer";
    button.style.touchAction = params.kind === "spot" && this.enablePinEditing ? "none" : MAP_TOUCH_ACTION_DEFAULT;
    button.style.setProperty("-webkit-tap-highlight-color", "transparent");
    button.addEventListener("wheel", (event) => {
      this.handlePinWheelZoom(event);
    }, { passive: false });

    const content = document.createElement("span");
    content.className = "iwami-photo-pin__content";
    content.style.position = "absolute";
    content.style.inset = "0";
    content.style.opacity = "1";
    content.style.transform = "translate3d(0,0,0) scale(1)";
    content.style.transformOrigin = `50% ${PIN_TRANSFORM_ORIGIN_Y}px`;
    content.style.willChange = "opacity,transform";
    content.style.transition =
      `opacity ${PIN_ENTER_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1),` +
      ` transform ${PIN_ENTER_DURATION_MS + 50}ms cubic-bezier(0.22,1,0.36,1)`;

    button.appendChild(content);
    root.appendChild(button);
    return { root, button, content };
  }

  private createSpotNode(entity: RenderSpotEntity): MarkerDomNode {
    const { root, button, content } = this.createBaseNode({
      key: entity.key,
      kind: "spot",
      width: PIN_WIDTH,
      height: PIN_HEIGHT,
    });
    button.setAttribute("aria-label", entity.pin.label);

    const frame = document.createElement("span");
    frame.className = "iwami-photo-pin__frame";
    frame.style.position = "absolute";
    frame.style.left = `${SPOT_PIN_CIRCLE_LEFT}px`;
    frame.style.top = `${SPOT_PIN_CIRCLE_TOP}px`;
    frame.style.width = `${SPOT_PIN_CIRCLE_SIZE}px`;
    frame.style.height = `${SPOT_PIN_CIRCLE_SIZE}px`;
    frame.style.zIndex = "30";
    frame.style.borderRadius = "999px";
    frame.style.border = "2px solid rgba(255,255,255,0.96)";
    frame.style.background = "linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(246,248,252,0.94) 100%)";
    frame.style.boxShadow =
      "0 12px 18px rgba(12,20,33,0.2),0 2px 6px rgba(12,20,33,0.14),inset 0 1px 0 rgba(255,255,255,0.95)";
    frame.style.transform = "translate3d(0,0,0)";
    frame.style.transition = "transform 160ms ease,box-shadow 160ms ease,border-color 160ms ease";

    const imageWrap = document.createElement("span");
    imageWrap.className = "iwami-photo-pin__image-wrap";
    imageWrap.style.position = "absolute";
    imageWrap.style.inset = `${SPOT_PIN_IMAGE_INSET}px`;
    imageWrap.style.borderRadius = "999px";
    imageWrap.style.overflow = "hidden";
    imageWrap.style.background = "#e5e7eb";

    const image = document.createElement("img");
    image.className = "iwami-photo-pin__image";
    image.alt = entity.pin.label;
    image.decoding = "async";
    image.loading = "lazy";
    image.draggable = false;
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.borderRadius = "999px";
    image.style.objectFit = "cover";
    image.style.userSelect = "none";
    image.style.pointerEvents = "none";
    image.addEventListener("error", () => {
      image.src = MISSING_IMAGE_DATA_URL;
    });

    const tail = document.createElement("span");
    tail.className = "iwami-photo-pin__tail";
    tail.style.position = "absolute";
    tail.style.left = `calc(50% - ${SPOT_PIN_TAIL_SIZE / 2}px)`;
    tail.style.top = `${SPOT_PIN_TAIL_TOP}px`;
    tail.style.width = `${SPOT_PIN_TAIL_SIZE}px`;
    tail.style.height = `${SPOT_PIN_TAIL_SIZE}px`;
    tail.style.zIndex = "10";
    tail.style.borderRadius = "3px";
    tail.style.transform = "rotate(45deg)";
    tail.style.borderRight = "2px solid rgba(255,255,255,0.96)";
    tail.style.borderBottom = "2px solid rgba(255,255,255,0.96)";
    tail.style.background = "linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(245,247,250,0.94) 100%)";
    tail.style.boxShadow = "3px 4px 8px rgba(12,20,33,0.16)";
    tail.style.transition = "transform 160ms ease";

    const shadow = document.createElement("span");
    shadow.className = "iwami-photo-pin__shadow";
    shadow.style.position = "absolute";
    shadow.style.left = "calc(50% - 10px)";
    shadow.style.top = `${SPOT_PIN_SHADOW_TOP}px`;
    shadow.style.width = "20px";
    shadow.style.height = "8px";
    shadow.style.zIndex = "0";
    shadow.style.borderRadius = "999px";
    shadow.style.background = "radial-gradient(ellipse at center,rgba(12,20,33,0.2) 0%,rgba(12,20,33,0) 72%)";
    shadow.style.filter = "blur(0.6px)";
    shadow.style.transition = "opacity 160ms ease,transform 160ms ease";

    const label = document.createElement("span");
    label.className = "iwami-photo-pin__label";
    label.style.position = "absolute";
    label.style.left = "50%";
    label.style.top = "-3px";
    label.style.zIndex = "40";
    label.style.transform = "translateX(-50%) translateY(-100%)";
    label.style.borderRadius = "999px";
    label.style.border = "1px solid rgba(255,255,255,0.92)";
    label.style.background = "rgba(255,255,255,0.94)";
    label.style.padding = "4px 9px";
    label.style.color = "#111827";
    label.style.fontSize = "11px";
    label.style.lineHeight = "1";
    label.style.fontWeight = "700";
    label.style.letterSpacing = "0.01em";
    label.style.whiteSpace = "nowrap";
    label.style.boxShadow = "0 6px 14px rgba(12,20,33,0.15)";
    label.style.opacity = "1";
    label.style.transition = "opacity 140ms ease";
    label.style.pointerEvents = "none";

    imageWrap.appendChild(image);
    frame.appendChild(imageWrap);

    content.appendChild(frame);
    content.appendChild(tail);
    content.appendChild(shadow);
    content.appendChild(label);

    const node: MarkerDomNode = {
      key: entity.key,
      kind: "spot",
      spot: entity.pin,
      cluster: null,
      root,
      button,
      content,
      frame,
      tail,
      shadow,
      label,
      imageEl: image,
      imageSignature: null,
      anchorX: PIN_ANCHOR_X,
      anchorY: PIN_ANCHOR_Y,
      isExiting: false,
      removeTimerId: null,
      enterRafId: null,
      lastX: null,
      lastY: null,
    };

    const setHovered = (value: boolean) => {
      if (value) {
        this.hoveredPinId = node.key;
      } else if (this.hoveredPinId === node.key) {
        this.hoveredPinId = null;
      }
      this.refreshMarkerStates();
      this.requestDraw();
    };

    button.addEventListener("mouseenter", () => setHovered(true));
    button.addEventListener("mouseleave", () => setHovered(false));
    button.addEventListener("focus", () => setHovered(true));
    button.addEventListener("blur", () => setHovered(false));
    button.addEventListener("pointerdown", (event) => {
      if (!this.enablePinEditing) return;
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      this.startDraggingSpot({ node, event });
    });
    button.addEventListener("pointermove", (event) => {
      if (!this.enablePinEditing) return;
      this.continueDraggingSpot(event);
    });
    button.addEventListener("pointerup", (event) => {
      if (!this.enablePinEditing) return;
      this.endDraggingSpot({ node, event });
    });
    button.addEventListener("pointercancel", (event) => {
      if (!this.enablePinEditing) return;
      this.endDraggingSpot({ node, event });
    });
    button.addEventListener("click", (event) => {
      if (Date.now() < this.suppressSpotClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
      this.suppressMapClickUntil = Date.now() + 250;
      const currentSpot = node.spot;
      if (!currentSpot) return;
      this.selectSpot(node.key, currentSpot);
    });

    this.updateNodeData(node, entity);
    this.applySpotVisualState(node, false, false);
    return node;
  }

  private createClusterNode(entity: RenderClusterEntity): MarkerDomNode {
    const size = entity.count >= 100 ? 76 : entity.count >= 30 ? 72 : 68;
    const width = size + 24;
    const height = size + 34;
    const anchorX = width / 2;
    const anchorY = size + 12;
    const frameLeft = (width - size) / 2;

    const { root, button, content } = this.createBaseNode({
      key: entity.key,
      kind: "cluster",
      width,
      height,
    });
    button.setAttribute("aria-label", `スポット${entity.count}件`);

    const frame = document.createElement("span");
    frame.className = "iwami-cluster-pin__frame";
    frame.style.position = "absolute";
    frame.style.left = `${frameLeft}px`;
    frame.style.top = "4px";
    frame.style.width = `${size}px`;
    frame.style.height = `${size}px`;
    frame.style.zIndex = "20";
    frame.style.borderRadius = "999px";
    frame.style.border = "2px solid rgba(255,255,255,0.96)";
    frame.style.background = "linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(241,245,249,0.92) 100%)";
    frame.style.boxShadow =
      "0 12px 22px rgba(12,20,33,0.24),0 2px 8px rgba(12,20,33,0.14),inset 0 1px 0 rgba(255,255,255,0.95)";
    frame.style.transition = "transform 160ms ease,box-shadow 160ms ease,border-color 160ms ease";

    const imageWrap = document.createElement("span");
    imageWrap.className = "iwami-cluster-pin__image-wrap";
    imageWrap.style.position = "absolute";
    imageWrap.style.inset = "3px";
    imageWrap.style.borderRadius = "999px";
    imageWrap.style.overflow = "hidden";
    imageWrap.style.background = "#e5e7eb";

    const image = document.createElement("img");
    image.className = "iwami-cluster-pin__image";
    image.decoding = "async";
    image.loading = "lazy";
    image.draggable = false;
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.userSelect = "none";
    image.style.pointerEvents = "none";
    image.addEventListener("error", () => {
      image.src = MISSING_IMAGE_DATA_URL;
    });

    const imageShade = document.createElement("span");
    imageShade.className = "iwami-cluster-pin__image-shade";
    imageShade.style.position = "absolute";
    imageShade.style.inset = "0";
    imageShade.style.pointerEvents = "none";
    imageShade.style.background =
      "linear-gradient(180deg,rgba(15,23,42,0.12) 0%,rgba(15,23,42,0.02) 45%,rgba(15,23,42,0.18) 100%)";

    const label = document.createElement("span");
    label.className = "iwami-cluster-pin__label";
    label.style.position = "absolute";
    label.style.right = "-6px";
    label.style.top = "-6px";
    label.style.zIndex = "35";
    label.style.display = "inline-flex";
    label.style.alignItems = "center";
    label.style.justifyContent = "center";
    label.style.minWidth = entity.count >= 100 ? "28px" : "24px";
    label.style.height = entity.count >= 100 ? "28px" : "24px";
    label.style.padding = entity.count >= 100 ? "0 7px" : "0 6px";
    label.style.borderRadius = "999px";
    label.style.border = "1px solid rgba(255,255,255,0.94)";
    label.style.background = "rgba(15,23,42,0.92)";
    label.style.color = "#f8fafc";
    label.style.fontSize = entity.count >= 100 ? "11px" : "12px";
    label.style.lineHeight = "1";
    label.style.fontWeight = "800";
    label.style.letterSpacing = "0.01em";
    label.style.boxShadow = "0 6px 12px rgba(2,6,23,0.26)";
    label.style.pointerEvents = "none";
    label.style.whiteSpace = "nowrap";

    const tail = document.createElement("span");
    tail.className = "iwami-cluster-pin__tail";
    tail.style.position = "absolute";
    tail.style.left = "calc(50% - 6px)";
    tail.style.top = `${size + 2}px`;
    tail.style.width = "12px";
    tail.style.height = "12px";
    tail.style.zIndex = "10";
    tail.style.borderRadius = "3px";
    tail.style.transform = "rotate(45deg)";
    tail.style.borderRight = "2px solid rgba(255,255,255,0.94)";
    tail.style.borderBottom = "2px solid rgba(255,255,255,0.94)";
    tail.style.background = "linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(241,245,249,0.92) 100%)";
    tail.style.boxShadow = "2px 3px 8px rgba(12,20,33,0.18)";
    tail.style.transition = "transform 160ms ease";

    const shadow = document.createElement("span");
    shadow.className = "iwami-cluster-pin__shadow";
    shadow.style.position = "absolute";
    shadow.style.left = "calc(50% - 11px)";
    shadow.style.top = `${size + 19}px`;
    shadow.style.width = "22px";
    shadow.style.height = "8px";
    shadow.style.zIndex = "0";
    shadow.style.borderRadius = "999px";
    shadow.style.background = "radial-gradient(ellipse at center,rgba(12,20,33,0.22) 0%,rgba(12,20,33,0) 74%)";
    shadow.style.filter = "blur(0.6px)";
    shadow.style.transition = "opacity 160ms ease,transform 160ms ease";

    imageWrap.appendChild(image);
    imageWrap.appendChild(imageShade);
    frame.appendChild(imageWrap);
    frame.appendChild(label);
    content.appendChild(frame);
    content.appendChild(tail);
    content.appendChild(shadow);

    const node: MarkerDomNode = {
      key: entity.key,
      kind: "cluster",
      spot: null,
      cluster: entity,
      root,
      button,
      content,
      frame,
      tail,
      shadow,
      label,
      imageEl: image,
      imageSignature: null,
      anchorX,
      anchorY,
      isExiting: false,
      removeTimerId: null,
      enterRafId: null,
      lastX: null,
      lastY: null,
    };

    const setHovered = (value: boolean) => {
      if (value) {
        this.hoveredPinId = node.key;
      } else if (this.hoveredPinId === node.key) {
        this.hoveredPinId = null;
      }
      this.refreshMarkerStates();
      this.requestDraw();
    };

    button.addEventListener("mouseenter", () => setHovered(true));
    button.addEventListener("mouseleave", () => setHovered(false));
    button.addEventListener("focus", () => setHovered(true));
    button.addEventListener("blur", () => setHovered(false));
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.suppressMapClickUntil = Date.now() + 250;
      this.clearSelection();
      const currentCluster = node.cluster;
      if (!currentCluster) return;
      this.focusCluster(currentCluster);
    });

    this.updateNodeData(node, entity);
    this.applyClusterVisualState(node, false, false);
    return node;
  }

  private updateNodeData(node: MarkerDomNode, entity: RenderEntity): void {
    if (entity.kind === "spot") {
      node.spot = entity.pin;
      node.cluster = null;
      node.button.setAttribute("aria-label", entity.pin.label);
      node.label.textContent = entity.pin.label;
      const accent = resolvePinAccentColor(entity.pin.category);
      node.root.style.setProperty("--pin-accent", accent);
      const resolvedImage = resolvePinPhotoUrl(entity.pin) ?? MISSING_IMAGE_DATA_URL;
      if (node.imageEl && node.imageSignature !== resolvedImage) {
        node.imageEl.src = resolvedImage;
        node.imageEl.alt = entity.pin.label;
        node.imageSignature = resolvedImage;
      }
      return;
    }

    node.cluster = entity;
    node.spot = null;
    node.button.setAttribute("aria-label", `スポット${entity.count}件`);
    node.label.textContent = `${entity.count}`;
    const representativePin = resolveClusterRepresentativePin(entity);
    const representativeImage = representativePin ? resolvePinPhotoUrl(representativePin) : null;
    const resolvedImage = representativeImage ?? MISSING_IMAGE_DATA_URL;
    if (node.imageEl && node.imageSignature !== resolvedImage) {
      node.imageEl.src = resolvedImage;
      node.imageEl.alt = representativePin ? representativePin.label : `スポット${entity.count}件`;
      node.imageSignature = resolvedImage;
    }
  }

  private applySpotVisualState(node: MarkerDomNode, isHovered: boolean, isSelected: boolean): void {
    if (!node.spot) return;

    const accent = resolvePinAccentColor(node.spot.category);
    const glow = `0 0 0 3px color-mix(in srgb, ${accent} 28%, rgba(255,255,255,0) 72%)`;

    if (isSelected) {
      node.frame.style.borderColor = `color-mix(in srgb, ${accent} 35%, #ffffff 65%)`;
      node.frame.style.boxShadow =
        `0 16px 24px rgba(12,20,33,0.24),0 4px 10px rgba(12,20,33,0.16),${glow},inset 0 1px 0 rgba(255,255,255,0.98)`;
      node.frame.style.transform = "translate3d(0,-2px,0) scale(1.06)";
      node.tail.style.transform = "rotate(45deg) translateY(-1px)";
      node.shadow.style.opacity = "0.86";
      node.shadow.style.transform = "scale(1.06)";
      node.label.style.opacity = "1";
      return;
    }

    node.frame.style.borderColor = "rgba(255,255,255,0.96)";
    node.frame.style.boxShadow =
      "0 12px 18px rgba(12,20,33,0.2),0 2px 6px rgba(12,20,33,0.14),inset 0 1px 0 rgba(255,255,255,0.95)";
    node.frame.style.transform = isHovered ? "translate3d(0,-1px,0) scale(1.03)" : "translate3d(0,0,0)";
    node.tail.style.transform = "rotate(45deg)";
    node.shadow.style.opacity = isHovered ? "0.86" : "1";
    node.shadow.style.transform = isHovered ? "scale(1.05)" : "scale(1)";
    node.label.style.opacity = "1";
  }

  private applyClusterVisualState(node: MarkerDomNode, isHovered: boolean, isSelected: boolean): void {
    const glow = "0 0 0 3px rgba(17,24,39,0.13)";
    if (isSelected) {
      node.frame.style.borderColor = "rgba(17,24,39,0.4)";
      node.frame.style.boxShadow =
        `0 18px 28px rgba(12,20,33,0.28),0 4px 12px rgba(12,20,33,0.18),${glow},inset 0 1px 0 rgba(255,255,255,0.98)`;
      node.frame.style.transform = "translate3d(0,-1px,0) scale(1.05)";
      node.tail.style.transform = "rotate(45deg) translateY(-1px)";
      node.shadow.style.opacity = "0.92";
      node.shadow.style.transform = "scale(1.08)";
      return;
    }

    node.frame.style.borderColor = "rgba(255,255,255,0.95)";
    node.frame.style.boxShadow = isHovered
      ? `0 16px 26px rgba(12,20,33,0.25),0 4px 12px rgba(12,20,33,0.16),${glow},inset 0 1px 0 rgba(255,255,255,0.96)`
      : "0 12px 22px rgba(12,20,33,0.24),0 2px 8px rgba(12,20,33,0.14),inset 0 1px 0 rgba(255,255,255,0.95)";
    node.frame.style.transform = isHovered ? "translate3d(0,-1px,0) scale(1.03)" : "translate3d(0,0,0)";
    node.tail.style.transform = isHovered ? "rotate(45deg) translateY(-1px)" : "rotate(45deg)";
    node.shadow.style.opacity = isHovered ? "0.9" : "1";
    node.shadow.style.transform = isHovered ? "scale(1.06)" : "scale(1)";
  }

  private refreshMarkerStates(): void {
    for (const [id, node] of this.markerNodes.entries()) {
      const isHovered = id === this.hoveredPinId;
      const includesExternallySelectedSpot =
        Boolean(this.externalSelectedSpotId) &&
        (node.kind === "spot"
          ? node.spot?.id === this.externalSelectedSpotId
          : (node.cluster?.members ?? []).some((member) => member.id === this.externalSelectedSpotId));
      const isSelected = id === this.selectedPinId || includesExternallySelectedSpot;
      if (node.kind === "spot") {
        this.applySpotVisualState(node, isHovered, isSelected);
      } else {
        this.applyClusterVisualState(node, isHovered, isSelected);
      }
    }
  }

  private removeAllMarkerNodes(): void {
    for (const node of this.markerNodes.values()) {
      this.clearNodeAnimationHandles(node);
      node.root.remove();
    }
    this.markerNodes.clear();
  }

  private drawNow(): void {
    if (!this.root || !this.mapsApi.LatLng) return;

    const projection = this.overlay.getProjection();
    if (!projection) return;

    const currentZoom = typeof this.map.getZoom === "function" ? this.map.getZoom() : undefined;
    const zoomValue = typeof currentZoom === "number" && Number.isFinite(currentZoom) ? currentZoom : IWAMI_ZOOM;
    this.ensureRenderEntities(zoomValue);
    const mapDiv = typeof this.map.getDiv === "function" ? this.map.getDiv() : null;
    const viewportWidth = mapDiv?.clientWidth ?? this.root.clientWidth;
    const viewportHeight = mapDiv?.clientHeight ?? this.root.clientHeight;
    const hasViewport = viewportWidth > 0 && viewportHeight > 0;
    for (const [id, node] of this.markerNodes.entries()) {
      const lat = node.kind === "spot" ? node.spot?.lat : node.cluster?.lat;
      const lng = node.kind === "spot" ? node.spot?.lng : node.cluster?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") {
        node.root.style.visibility = "hidden";
        continue;
      }

      const latLng = new this.mapsApi.LatLng(lat, lng);
      const point = projection.fromLatLngToContainerPixel
        ? projection.fromLatLngToContainerPixel(latLng)
        : projection.fromLatLngToDivPixel(latLng);
      const hasProjectedPoint =
        Boolean(point) &&
        Number.isFinite(point?.x) &&
        Number.isFinite(point?.y);

      let x = hasProjectedPoint ? (point as GooglePoint).x : node.lastX;
      let y = hasProjectedPoint ? (point as GooglePoint).y : node.lastY;

      if ((x == null || y == null) && hasViewport) {
        const center = this.readCurrentCenter(IWAMI_CENTER);
        const worldSize = 256 * 2 ** zoomValue;
        const targetWorld = projectLatLngToWorld({ lat, lng }, zoomValue);
        const centerWorld = projectLatLngToWorld(center, zoomValue);
        const deltaX = normalizeWrappedWorldDelta(targetWorld.x - centerWorld.x, worldSize);
        const deltaY = targetWorld.y - centerWorld.y;
        x = viewportWidth / 2 + deltaX;
        y = viewportHeight / 2 + deltaY;
      }

      if (x == null || y == null) {
        node.root.style.visibility = "hidden";
        continue;
      }

      node.lastX = x;
      node.lastY = y;
      if (node.root.style.visibility !== "visible") {
        node.root.style.visibility = "visible";
      }

      const translateX = x - node.anchorX;
      const translateY = y - node.anchorY;
      const transformValue = `translate3d(${translateX}px, ${translateY}px, 0)`;
      if (node.root.style.transform !== transformValue) {
        node.root.style.transform = transformValue;
      }

      const isSelected = id === this.selectedPinId;
      const includesExternallySelectedSpot =
        Boolean(this.externalSelectedSpotId) &&
        (node.kind === "spot"
          ? node.spot?.id === this.externalSelectedSpotId
          : (node.cluster?.members ?? []).some((member) => member.id === this.externalSelectedSpotId));
      const isEffectivelySelected = isSelected || includesExternallySelectedSpot;
      const isHovered = id === this.hoveredPinId;
      const yOrder = Math.round(y * 10);
      let zIndex = 1000 + yOrder;
      if (node.kind === "cluster") zIndex += 8000;
      if (node.isExiting) zIndex -= 12000;
      if (isHovered) zIndex += 20000;
      if (isEffectivelySelected) zIndex += 40000;
      const zIndexValue = `${zIndex}`;
      if (node.root.style.zIndex !== zIndexValue) {
        node.root.style.zIndex = zIndexValue;
      }
    }
  }
}

type GoogleMapBackgroundProps = {
  className?: string;
  cameraTarget?: { center: LatLngLiteral; zoom?: number } | null;
  focusCenter?: LatLngLiteral | null;
  pins?: MapPin[];
  enablePinEditing?: boolean;
  disableClustering?: boolean;
  selectedSpotId?: string | null;
  routePath?: LatLngLiteral[];
  routeColor?: string;
  onSpotClick?: (pin: MapPin) => void;
  onSpotPositionChange?: (nextPosition: MapPinPositionChange) => void;
  onViewportCenterChange?: (center: LatLngLiteral) => void;
};

export function GoogleMapBackground({
  className,
  cameraTarget = null,
  focusCenter = null,
  pins = [],
  enablePinEditing = false,
  disableClustering = false,
  selectedSpotId = null,
  routePath = [],
  routeColor = "#1d4ed8",
  onSpotClick,
  onSpotPositionChange,
  onViewportCenterChange,
}: GoogleMapBackgroundProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const mapsApiRef = useRef<GoogleMapsApi | null>(null);
  const overlayControllerRef = useRef<PhotoPinOverlayController | null>(null);
  const routeHaloPolylineRef = useRef<GooglePolyline | null>(null);
  const routeMainPolylineRef = useRef<GooglePolyline | null>(null);
  const latestPinsRef = useRef<MapPin[]>(pins);
  const spotClickRef = useRef<typeof onSpotClick>(onSpotClick);
  const spotPositionChangeRef = useRef<typeof onSpotPositionChange>(onSpotPositionChange);
  const viewportCenterChangeRef = useRef<typeof onViewportCenterChange>(onViewportCenterChange);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    latestPinsRef.current = pins;
  }, [pins]);

  useEffect(() => {
    spotClickRef.current = onSpotClick;
  }, [onSpotClick]);

  useEffect(() => {
    spotPositionChangeRef.current = onSpotPositionChange;
  }, [onSpotPositionChange]);

  useEffect(() => {
    viewportCenterChangeRef.current = onViewportCenterChange;
  }, [onViewportCenterChange]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!MAPS_API_KEY) return;

    let disposed = false;
    let centerListener: GoogleMapListener | null = null;

    void loadGoogleMapsScript(MAPS_API_KEY)
      .then(async () => {
        if (disposed || !mapContainerRef.current) return;

        const mapsApi = await resolveMapsApi();
        if (!mapsApi?.Map || !mapsApi.OverlayView || !mapsApi.LatLng) {
          setMapReady(false);
          return;
        }

        mapsApiRef.current = mapsApi;

        mapRef.current = new mapsApi.Map(mapContainerRef.current, {
          center: IWAMI_CENTER,
          zoom: IWAMI_INITIAL_ZOOM,
          mapTypeId: "roadmap",
          backgroundColor: "#ffffff",
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: MAP_GESTURE_HANDLING,
          keyboardShortcuts: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          isFractionalZoomEnabled: true,
        });

        overlayControllerRef.current = new PhotoPinOverlayController({
          map: mapRef.current,
          mapsApi,
          pins: latestPinsRef.current,
          enablePinEditing: false,
          disableClustering: false,
          onSpotClick: (pin) => spotClickRef.current?.(pin),
          onSpotPositionChange: (nextPosition) => spotPositionChangeRef.current?.(nextPosition),
        });

        const emitViewportCenter = () => {
          const centerAccessor = mapRef.current?.getCenter?.();
          const lat = centerAccessor?.lat?.();
          const lng = centerAccessor?.lng?.();
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          viewportCenterChangeRef.current?.({
            lat: lat as number,
            lng: lng as number,
          });
        };

        centerListener = typeof mapRef.current.addListener === "function" ? mapRef.current.addListener("idle", emitViewportCenter) : null;

        emitViewportCenter();

        setMapReady(true);
      })
      .catch((error: unknown) => {
        console.warn("Failed to initialize Google Maps", error);
        setMapReady(false);
      });

    return () => {
      disposed = true;
      centerListener?.remove();
      routeHaloPolylineRef.current?.setMap(null);
      routeHaloPolylineRef.current = null;
      routeMainPolylineRef.current?.setMap(null);
      routeMainPolylineRef.current = null;
      overlayControllerRef.current?.destroy();
      overlayControllerRef.current = null;
      mapRef.current = null;
      mapsApiRef.current = null;
    };
  }, []);

  useEffect(() => {
    overlayControllerRef.current?.setEditingEnabled(enablePinEditing);
  }, [enablePinEditing]);

  useEffect(() => {
    overlayControllerRef.current?.setDisableClustering(disableClustering);
  }, [disableClustering]);

  useEffect(() => {
    overlayControllerRef.current?.setExternalSelectedSpotId(selectedSpotId);
  }, [selectedSpotId]);

  useEffect(() => {
    if (!mapReady) return;
    overlayControllerRef.current?.setPins(pins);
  }, [mapReady, pins]);

  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    const mapsApi = mapsApiRef.current;
    if (!map || !mapsApi) return;

    routeHaloPolylineRef.current?.setMap(null);
    routeHaloPolylineRef.current = null;
    routeMainPolylineRef.current?.setMap(null);
    routeMainPolylineRef.current = null;

    if (!mapsApi.Polyline || routePath.length < 2) return;

    const halo = new mapsApi.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: "#ffffff",
      strokeOpacity: 0.9,
      strokeWeight: 9,
      clickable: false,
      zIndex: 6,
    });
    halo.setMap(map);
    routeHaloPolylineRef.current = halo;

    const main = new mapsApi.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: routeColor,
      strokeOpacity: 0.95,
      strokeWeight: 5,
      clickable: false,
      zIndex: 7,
    });
    main.setMap(map);
    routeMainPolylineRef.current = main;

    if (mapsApi.LatLngBounds && typeof map.fitBounds === "function") {
      const bounds = new mapsApi.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { top: 120, right: 56, bottom: 260, left: 56 });
    }
  }, [mapReady, routeColor, routePath]);

  useEffect(() => {
    if (!cameraTarget || !mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    if (typeof map.panTo === "function") {
      map.panTo(cameraTarget.center);
    } else if (typeof map.setCenter === "function") {
      map.setCenter(cameraTarget.center);
    }

    if (typeof cameraTarget.zoom === "number" && Number.isFinite(cameraTarget.zoom) && typeof map.setZoom === "function") {
      map.setZoom(clampNumber(cameraTarget.zoom, MAP_MIN_ZOOM, MAP_MAX_ZOOM));
    }
  }, [cameraTarget, mapReady]);

  useEffect(() => {
    if (!focusCenter || !mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    if (typeof map.panTo === "function") {
      map.panTo(focusCenter);
    } else if (typeof map.setCenter === "function") {
      map.setCenter(focusCenter);
    }

    if (typeof map.setZoom === "function") {
      map.setZoom(16);
    }
  }, [focusCenter, mapReady]);

  return (
    <div className={className} aria-label="Google map of Iwami town">
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 transition-opacity duration-200 ${mapReady ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
