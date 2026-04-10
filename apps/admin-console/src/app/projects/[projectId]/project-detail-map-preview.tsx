"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "../../_components/material-icon";

const DEFAULT_REGION = "福島県 三島町・金山町";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAPS_SCRIPT_ID = "google-maps-core-script";
const DEFAULT_MAP_CENTER = { lat: 37.4708, lng: 139.5988 };
const DEFAULT_MAP_ZOOM = 12;
const SINGLE_MARKER_ZOOM = 13;

type LatLngLike = {
  lat?: () => number;
  lng?: () => number;
};

type SpotMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type MapFilter = "all" | "series" | "episode";

type GoogleMapInstance = {
  setCenter(center: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  fitBounds?(bounds: GoogleMapBoundsInstance): void;
};

type GoogleMapBoundsInstance = {
  extend(latLng: { lat: number; lng: number }): void;
};

type GoogleMapMarkerInstance = {
  setMap(map: GoogleMapInstance | null): void;
};

type GoogleMapsWindow = Window & {
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
        },
      ) => GoogleMapInstance;
      Geocoder?: new () => {
        geocode(
          request: { address: string; region?: string },
          callback: (
            results:
              | Array<{
                  geometry?: {
                    location?: LatLngLike;
                  };
                }>
              | null,
            status: string,
          ) => void,
        ): void;
      };
      Marker?: new (options: {
        map: GoogleMapInstance;
        position: { lat: number; lng: number };
        title?: string;
      }) => GoogleMapMarkerInstance;
      LatLngBounds?: new () => GoogleMapBoundsInstance;
    };
  };
};

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.Map) {
    return Promise.resolve();
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja&region=JP`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Google Maps script.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

function buildMapEmbedSrc(region: string): string {
  const q = encodeURIComponent(region.trim() || DEFAULT_REGION);
  return `https://www.google.com/maps?q=${q}&hl=ja&z=12&output=embed`;
}

function dedupeSpotMapPoints(points: SpotMapPoint[]): SpotMapPoint[] {
  const seen = new Set<string>();
  const deduped: SpotMapPoint[] = [];

  for (const point of points) {
    const key = `${point.lat.toFixed(6)}:${point.lng.toFixed(6)}:${point.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(point);
  }

  return deduped;
}

type ProjectDetailMapPreviewProps = {
  area: string;
  projectMarkers: SpotMapPoint[];
  seriesMarkers: SpotMapPoint[];
  episodeMarkers: SpotMapPoint[];
};

export function ProjectDetailMapPreview({
  area,
  projectMarkers,
  seriesMarkers,
  episodeMarkers,
}: ProjectDetailMapPreviewProps) {
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const geocoderRef = useRef<
    | {
        geocode(
          request: { address: string; region?: string },
          callback: (
            results:
              | Array<{
                  geometry?: {
                    location?: LatLngLike;
                  };
                }>
              | null,
            status: string,
          ) => void,
        ): void;
      }
    | null
  >(null);
  const markerInstancesRef = useRef<GoogleMapMarkerInstance[]>([]);
  const geocodedCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  const effectiveRegion = useMemo(() => area.trim() || DEFAULT_REGION, [area]);
  const fallbackEmbedSrc = useMemo(() => buildMapEmbedSrc(effectiveRegion), [effectiveRegion]);
  const allMarkers = useMemo(
    () => dedupeSpotMapPoints([...projectMarkers, ...seriesMarkers, ...episodeMarkers]),
    [projectMarkers, seriesMarkers, episodeMarkers],
  );

  const activeMarkers = useMemo(() => {
    if (activeFilter === "series") {
      return seriesMarkers;
    }
    if (activeFilter === "episode") {
      return episodeMarkers;
    }
    return allMarkers;
  }, [activeFilter, allMarkers, episodeMarkers, seriesMarkers]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapContainerRef.current) {
      return;
    }

    let isDisposed = false;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (isDisposed || !mapContainerRef.current) {
          return;
        }

        const mapsWindow = window as GoogleMapsWindow;
        const MapCtor = mapsWindow.google?.maps?.Map;
        const GeocoderCtor = mapsWindow.google?.maps?.Geocoder;

        if (MapCtor) {
          mapInstanceRef.current = new MapCtor(mapContainerRef.current, {
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_MAP_ZOOM,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "cooperative",
            keyboardShortcuts: false,
          });
          setMapReady(true);
        }

        if (GeocoderCtor) {
          geocoderRef.current = new GeocoderCtor();
        }
      })
      .catch(() => {
        // Fallback iframe is shown when map script cannot be loaded.
      });

    return () => {
      isDisposed = true;
      markerInstancesRef.current.forEach((marker) => marker.setMap(null));
      markerInstancesRef.current = [];
      mapInstanceRef.current = null;
      geocoderRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      return;
    }

    if (!mapInstanceRef.current || !geocoderRef.current) {
      return;
    }

    const geocodeTimer = window.setTimeout(() => {
      geocoderRef.current?.geocode({ address: effectiveRegion, region: "JP" }, (results, status) => {
        if (status !== "OK" || !results?.length) {
          return;
        }

        const location = results[0]?.geometry?.location;
        const lat = typeof location?.lat === "function" ? location.lat() : null;
        const lng = typeof location?.lng === "function" ? location.lng() : null;

        if (
          typeof lat === "number" &&
          Number.isFinite(lat) &&
          typeof lng === "number" &&
          Number.isFinite(lng)
        ) {
          geocodedCenterRef.current = { lat, lng };
          mapInstanceRef.current?.setCenter({ lat, lng });
          mapInstanceRef.current?.setZoom(DEFAULT_MAP_ZOOM);
        }
      });
    }, 250);

    return () => {
      window.clearTimeout(geocodeTimer);
    };
  }, [effectiveRegion, mapReady]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const mapsWindow = window as GoogleMapsWindow;
    const MarkerCtor = mapsWindow.google?.maps?.Marker;
    const LatLngBoundsCtor = mapsWindow.google?.maps?.LatLngBounds;
    const normalizedMarkers = dedupeSpotMapPoints(activeMarkers);

    markerInstancesRef.current.forEach((marker) => marker.setMap(null));
    markerInstancesRef.current = [];

    if (!MarkerCtor) {
      return;
    }

    markerInstancesRef.current = normalizedMarkers.map(
      (point) =>
        new MarkerCtor({
          map,
          position: { lat: point.lat, lng: point.lng },
          title: point.name,
        }),
    );

    if (normalizedMarkers.length === 0) {
      const center = geocodedCenterRef.current ?? DEFAULT_MAP_CENTER;
      map.setCenter(center);
      map.setZoom(DEFAULT_MAP_ZOOM);
      return;
    }

    if (normalizedMarkers.length === 1) {
      map.setCenter({
        lat: normalizedMarkers[0].lat,
        lng: normalizedMarkers[0].lng,
      });
      map.setZoom(SINGLE_MARKER_ZOOM);
      return;
    }

    if (LatLngBoundsCtor && typeof map.fitBounds === "function") {
      const bounds = new LatLngBoundsCtor();
      normalizedMarkers.forEach((point) => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });
      map.fitBounds(bounds);
    }
  }, [activeMarkers, mapReady]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
            activeFilter === "all"
              ? "border-terracotta/20 bg-terracotta text-white shadow-sm"
              : "border-charcoal/15 bg-white text-charcoal/65 hover:border-terracotta/20 hover:text-terracotta"
          }`}
          onClick={() => setActiveFilter("all")}
          type="button"
        >
          <MaterialIcon className="text-sm" name="language" />
          全体
        </button>
        <button
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
            activeFilter === "series"
              ? "border-terracotta/20 bg-terracotta text-white shadow-sm"
              : "border-charcoal/15 bg-white text-charcoal/65 hover:border-terracotta/20 hover:text-terracotta"
          }`}
          onClick={() => setActiveFilter("series")}
          type="button"
        >
          <MaterialIcon className="text-sm" name="subscriptions" />
          シリーズ
        </button>
        <button
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
            activeFilter === "episode"
              ? "border-terracotta/20 bg-terracotta text-white shadow-sm"
              : "border-charcoal/15 bg-white text-charcoal/65 hover:border-terracotta/20 hover:text-terracotta"
          }`}
          onClick={() => setActiveFilter("episode")}
          type="button"
        >
          <MaterialIcon className="text-sm" name="movie" />
          エピソード
        </button>
      </div>

      <div className="h-[420px] overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/5">
        {GOOGLE_MAPS_API_KEY ? (
          <div className="h-full w-full" ref={mapContainerRef} />
        ) : (
          <iframe
            allowFullScreen
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={fallbackEmbedSrc}
            title="プロジェクト起点のGoogleマッププレビュー"
          />
        )}
      </div>
    </div>
  );
}
