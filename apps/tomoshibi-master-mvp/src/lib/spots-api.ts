import { collection, onSnapshot, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseClientFirestore, getFirebaseClientFunctions } from "@/lib/firebase";

export type SpotPrimaryCategory = "see" | "eat" | "shop" | "stay" | "experience";

export type SpotMapPin = {
  id: string;
  slug: string;
  nameJa: string;
  shortName: string;
  primaryCategory: SpotPrimaryCategory;
  lat: number;
  lng: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  heroImageUrl: string | null;
};

type ListSpotsCallablePayload = {
  status?: "published";
};

type ListSpotsCallableResponse = {
  ok: boolean;
  spots?: Array<Record<string, unknown>>;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizePrimaryCategory(value: unknown): SpotPrimaryCategory {
  if (value === "see" || value === "eat" || value === "shop" || value === "stay" || value === "experience") {
    return value;
  }
  return "see";
}

function toSpotMapPin(data: Record<string, unknown>): SpotMapPin | null {
  const id = typeof data.id === "string" && data.id.trim().length > 0 ? data.id.trim() : null;
  const slug = typeof data.slug === "string" && data.slug.trim().length > 0 ? data.slug.trim() : id;
  const nameJa = typeof data.nameJa === "string" && data.nameJa.trim().length > 0 ? data.nameJa.trim() : null;
  const shortName =
    typeof data.shortName === "string" && data.shortName.trim().length > 0
      ? data.shortName.trim()
      : nameJa;

  const primaryCategory = normalizePrimaryCategory(data.primaryCategory);
  if (!id || !slug || !nameJa || !shortName) return null;

  const location = data.location as Record<string, unknown> | undefined;
  if (!location) return null;

  const lat = toFiniteNumber(location.lat);
  const lng = toFiniteNumber(location.lng);
  if (lat == null || lng == null) return null;

  const thumbnailUrl = typeof data.thumbnailUrl === "string" && data.thumbnailUrl.trim().length > 0 ? data.thumbnailUrl.trim() : null;
  const heroImageUrl = typeof data.heroImageUrl === "string" && data.heroImageUrl.trim().length > 0 ? data.heroImageUrl.trim() : null;

  return {
    id,
    slug,
    nameJa,
    shortName,
    primaryCategory,
    lat,
    lng,
    imageUrl: thumbnailUrl ?? heroImageUrl,
    thumbnailUrl,
    heroImageUrl,
  };
}

async function fetchPublishedSpotsByCallable(): Promise<SpotMapPin[]> {
  const functions = getFirebaseClientFunctions();
  if (!functions) return [];

  const callable = httpsCallable<ListSpotsCallablePayload, ListSpotsCallableResponse>(functions, "listSpotsCallable");
  const response = await callable({ status: "published" });
  const spots = Array.isArray(response.data?.spots) ? response.data.spots : [];

  return spots
    .map((spot) => toSpotMapPin(spot))
    .filter((spot): spot is SpotMapPin => Boolean(spot))
    .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));
}

export function subscribePublishedSpots(params: {
  onData: (spots: SpotMapPin[]) => void;
  onError?: (error: Error) => void;
}): () => void {
  const firestore = getFirebaseClientFirestore();
  if (!firestore) {
    params.onError?.(new Error("Firebase Firestore is not configured"));
    return () => {};
  }

  const spotsQuery = query(collection(firestore, "spots"), where("status", "==", "published"));
  let receivedFirstSnapshot = false;
  const fallbackTimer = window.setTimeout(() => {
    if (receivedFirstSnapshot) return;
    void fetchPublishedSpotsByCallable()
      .then((spots) => {
        receivedFirstSnapshot = true;
        params.onData(spots);
      })
      .catch((error) => {
        params.onError?.(error instanceof Error ? error : new Error("Failed to fetch spots by callable"));
      });
  }, 2500);

  const unsubscribe = onSnapshot(
    spotsQuery,
    (snapshot) => {
      receivedFirstSnapshot = true;
      window.clearTimeout(fallbackTimer);
      const spots = snapshot.docs
        .map((doc) => {
          const rawData = doc.data() as Record<string, unknown>;
          const mapped = toSpotMapPin(rawData);
          if (!mapped) return null;
          return {
            ...mapped,
            id: doc.id,
          };
        })
        .filter((spot): spot is SpotMapPin => Boolean(spot))
        .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));

      params.onData(spots);
    },
    (error) => {
      window.clearTimeout(fallbackTimer);
      void fetchPublishedSpotsByCallable()
        .then((spots) => {
          params.onData(spots);
        })
        .catch((fallbackError) => {
          params.onError?.(
            fallbackError instanceof Error ? fallbackError : error instanceof Error ? error : new Error("Failed to subscribe spots"),
          );
        });
    },
  );

  return () => {
    window.clearTimeout(fallbackTimer);
    unsubscribe();
  };
}
