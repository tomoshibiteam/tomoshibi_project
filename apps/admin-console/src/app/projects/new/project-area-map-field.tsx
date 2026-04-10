"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "../../_components/material-icon";

const DEFAULT_REGION = "福島県 三島町・金山町";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAPS_SCRIPT_ID = "google-maps-places-script";
const DEFAULT_MAP_CENTER = { lat: 37.4708, lng: 139.5988 };
const DEFAULT_MAP_ZOOM = 12;
const PROJECT_TYPE_OPTIONS = [
  "実証",
  "学内回遊",
  "観光PoC",
  "常設導線",
  "新歓向け",
  "再訪促進",
];

type LatLngLike = {
  lat?: () => number;
  lng?: () => number;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      event?: {
        clearInstanceListeners(instance: unknown): void;
      };
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
      ) => {
        setCenter(center: { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
      };
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
      places?: {
        Autocomplete?: new (
          inputField: HTMLInputElement,
          options: {
            componentRestrictions?: { country: string };
            fields?: string[];
            types?: string[];
          },
        ) => {
          addListener(
            eventName: "place_changed",
            callback: () => void,
          ): {
            remove?: () => void;
          };
          getPlace(): {
            formatted_address?: string;
            name?: string;
            geometry?: {
              location?: LatLngLike;
            };
          };
        };
      };
    };
  };
};

let mapsPlacesScriptPromise: Promise<void> | null = null;

function buildMapEmbedSrc(region: string): string {
  const q = encodeURIComponent(region);
  if (GOOGLE_MAPS_API_KEY) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${q}&zoom=12&language=ja`;
  }

  return `https://www.google.com/maps?q=${q}&hl=ja&z=12&output=embed`;
}

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.places?.Autocomplete) {
    return Promise.resolve();
  }

  if (mapsPlacesScriptPromise) {
    return mapsPlacesScriptPromise;
  }

  mapsPlacesScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps Places script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ja&region=JP`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Google Maps Places script.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return mapsPlacesScriptPromise;
}

type ProjectAreaMapFieldProps = {
  initialProjectName?: string;
  initialProjectSummary?: string;
  initialProjectArea?: string;
  initialProjectTypes?: string[];
};

export function ProjectAreaMapField({
  initialProjectName = "",
  initialProjectSummary = "",
  initialProjectArea = "",
  initialProjectTypes = [],
}: ProjectAreaMapFieldProps) {
  const [region, setRegion] = useState(initialProjectArea);
  const projectAreaInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<
    | {
        setCenter(center: { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
      }
    | null
  >(null);
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
  const trimmedRegion = region.trim();
  const effectiveRegion = trimmedRegion || DEFAULT_REGION;
  const hasInitialProjectTypes = initialProjectTypes.length > 0;

  useEffect(() => {
    setRegion(initialProjectArea);
  }, [initialProjectArea]);

  const mapSrc = useMemo(() => {
    return buildMapEmbedSrc(effectiveRegion);
  }, [effectiveRegion]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !projectAreaInputRef.current || !mapContainerRef.current) {
      return;
    }

    let isDisposed = false;
    let autocompleteInstance:
      | {
          addListener(
            eventName: "place_changed",
            callback: () => void,
          ): {
            remove?: () => void;
          };
          getPlace(): {
            formatted_address?: string;
            name?: string;
            geometry?: {
              location?: LatLngLike;
            };
          };
        }
      | undefined;
    let placeChangedListener:
      | {
          remove?: () => void;
        }
      | undefined;

    loadGooglePlacesScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (isDisposed || !projectAreaInputRef.current) {
          return;
        }

        const mapsWindow = window as GoogleMapsWindow;
        const MapCtor = mapsWindow.google?.maps?.Map;
        const GeocoderCtor = mapsWindow.google?.maps?.Geocoder;
        const AutocompleteCtor = mapsWindow.google?.maps?.places?.Autocomplete;
        if (MapCtor) {
          mapInstanceRef.current = new MapCtor(mapContainerRef.current!, {
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_MAP_ZOOM,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "cooperative",
            keyboardShortcuts: false,
          });
        }
        if (GeocoderCtor) {
          geocoderRef.current = new GeocoderCtor();
        }

        if (!AutocompleteCtor) {
          return;
        }

        autocompleteInstance = new AutocompleteCtor(projectAreaInputRef.current, {
          componentRestrictions: { country: "jp" },
          fields: ["formatted_address", "name", "geometry"],
          types: ["(regions)"],
        });

        placeChangedListener = autocompleteInstance.addListener("place_changed", () => {
          const selectedPlace = autocompleteInstance?.getPlace();
          const selectedRegion =
            selectedPlace?.formatted_address || selectedPlace?.name || projectAreaInputRef.current?.value || "";
          setRegion(selectedRegion);

          const location = selectedPlace?.geometry?.location;
          const lat = typeof location?.lat === "function" ? location.lat() : null;
          const lng = typeof location?.lng === "function" ? location.lng() : null;
          if (
            typeof lat === "number" &&
            Number.isFinite(lat) &&
            typeof lng === "number" &&
            Number.isFinite(lng)
          ) {
            mapInstanceRef.current?.setCenter({ lat, lng });
            mapInstanceRef.current?.setZoom(DEFAULT_MAP_ZOOM);
          }
        });
      })
      .catch(() => {
        // Script load failure should not block basic text input and map preview.
      });

    return () => {
      isDisposed = true;
      placeChangedListener?.remove?.();

      const mapsWindow = window as GoogleMapsWindow;
      if (autocompleteInstance && mapsWindow.google?.maps?.event?.clearInstanceListeners) {
        mapsWindow.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
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
          mapInstanceRef.current?.setCenter({ lat, lng });
          mapInstanceRef.current?.setZoom(DEFAULT_MAP_ZOOM);
        }
      });
    }, 250);

    return () => {
      window.clearTimeout(geocodeTimer);
    };
  }, [effectiveRegion]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
            htmlFor="project-name"
          >
            プロジェクト名
          </label>
          <input
            id="project-name"
            name="projectName"
            className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
            defaultValue={initialProjectName}
            placeholder="例：奥会津 伝統工芸デジタルアーカイブ"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
            htmlFor="project-summary"
          >
            一言サマリー
          </label>
          <textarea
            id="project-summary"
            name="projectSummary"
            className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
            defaultValue={initialProjectSummary}
            placeholder="例：初来訪の新入生がキャンパスを自然に歩き回りたくなる体験を設計する"
            rows={2}
          />
          <p className="text-[10px] font-medium text-charcoal/50">
            1〜2文で、このプロジェクトの狙いを端的に記述します。
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
            htmlFor="project-area"
          >
            起点となる場所
          </label>
          <input
            id="project-area"
            name="projectArea"
            ref={projectAreaInputRef}
            autoComplete="off"
            className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
            onChange={(event) => setRegion(event.target.value)}
            placeholder="例：岩美駅、中央図書館前"
            type="text"
            value={region}
          />
          <p className="text-[10px] font-medium text-charcoal/50">
            地名やスポット名を入力すると、右側の地図プレビューが更新されます。
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
            プロジェクト種別
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPE_OPTIONS.map((option, index) => (
              <label className="cursor-pointer" key={option}>
                <input
                  className="peer sr-only"
                  defaultChecked={hasInitialProjectTypes ? initialProjectTypes.includes(option) : index === 0}
                  name="projectTypes"
                  type="checkbox"
                  value={option}
                />
                <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-[11px] font-bold text-charcoal/70 transition-colors peer-checked:border-terracotta/40 peer-checked:bg-terracotta/10 peer-checked:text-terracotta">
                  {option}
                </span>
              </label>
            ))}
          </div>
          <p className="text-[10px] font-medium text-charcoal/50">複数選択できます。</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-paper/50">
        <div className="flex items-center border-b border-charcoal/10 px-4 py-2.5">
          <div className="flex items-center gap-2 text-charcoal/70">
            <MaterialIcon className="text-sm text-terracotta" name="map" />
            <span className="text-[11px] font-bold">Google Maps プレビュー</span>
          </div>
        </div>

        <div className="relative h-[320px] lg:h-[440px]">
          {GOOGLE_MAPS_API_KEY ? (
            <div className="h-full w-full" ref={mapContainerRef} />
          ) : (
            <iframe
              allowFullScreen
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title="対象地域マップ"
            />
          )}
        </div>
      </div>
    </div>
  );
}
