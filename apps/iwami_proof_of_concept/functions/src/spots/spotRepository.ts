import { FieldValue, type DocumentData, type Firestore, type Query } from "firebase-admin/firestore";
import type { SpotListFilters, SpotRecord, SpotSearchFilters } from "./spotTypes";

export const SPOTS_COLLECTION = "spots";
const DEFAULT_LIST_LIMIT = 100;

type TimestampFactory = () => unknown;

export type SaveSpotParams = {
  db: Firestore;
  spot: Omit<SpotRecord, "createdAt" | "updatedAt">;
  mode?: "create" | "update" | "upsert";
  timestampFactory?: TimestampFactory;
};

function applyBaseFilters(query: Query<DocumentData>, filters: SpotListFilters): Query<DocumentData> {
  let nextQuery = query;

  if (filters.status) {
    nextQuery = nextQuery.where("status", "==", filters.status);
  }
  if (filters.primaryCategory) {
    nextQuery = nextQuery.where("primaryCategory", "==", filters.primaryCategory);
  }
  if (filters.areaName) {
    nextQuery = nextQuery.where("location.areaName", "==", filters.areaName);
  }
  if (filters.stationAreaType) {
    nextQuery = nextQuery.where("location.stationAreaType", "==", filters.stationAreaType);
  }
  if (filters.storyCompatible !== undefined) {
    nextQuery = nextQuery.where("storyCompatible", "==", filters.storyCompatible);
  }
  if (filters.couponCompatible !== undefined) {
    nextQuery = nextQuery.where("couponCompatible", "==", filters.couponCompatible);
  }
  if (filters.campaignCompatible !== undefined) {
    nextQuery = nextQuery.where("campaignCompatible", "==", filters.campaignCompatible);
  }

  if (filters.supportedTransports && filters.supportedTransports.length > 0) {
    if (filters.supportedTransports.length === 1) {
      nextQuery = nextQuery.where("access.supportedTransports", "array-contains", filters.supportedTransports[0]);
    } else {
      nextQuery = nextQuery.where("access.supportedTransports", "array-contains-any", filters.supportedTransports);
    }
  }

  return nextQuery.limit(filters.limit ?? DEFAULT_LIST_LIMIT);
}

export async function saveSpot(params: SaveSpotParams): Promise<string> {
  const timestampFactory = params.timestampFactory ?? (() => FieldValue.serverTimestamp());
  const mode = params.mode ?? "upsert";
  const docRef = params.db.collection(SPOTS_COLLECTION).doc(params.spot.id);

  if (mode === "create") {
    await docRef.create({
      ...params.spot,
      createdAt: timestampFactory(),
      updatedAt: timestampFactory(),
    });
    return docRef.id;
  }

  if (mode === "update") {
    await docRef.set(
      {
        ...params.spot,
        updatedAt: timestampFactory(),
      },
      { merge: true },
    );
    return docRef.id;
  }

  await docRef.set(
    {
      ...params.spot,
      createdAt: timestampFactory(),
      updatedAt: timestampFactory(),
    },
    { merge: true },
  );
  return docRef.id;
}

export async function getSpotDocById(params: { db: Firestore; spotId: string }): Promise<SpotRecord | null> {
  const snapshot = await params.db.collection(SPOTS_COLLECTION).doc(params.spotId).get();
  if (!snapshot.exists) return null;

  return snapshot.data() as SpotRecord;
}

export async function deleteSpotDocById(params: { db: Firestore; spotId: string }): Promise<void> {
  await params.db.collection(SPOTS_COLLECTION).doc(params.spotId).delete();
}

export async function listSpotsWithFilters(params: {
  db: Firestore;
  filters: SpotListFilters;
}): Promise<SpotRecord[]> {
  const baseQuery = params.db.collection(SPOTS_COLLECTION);
  const query = applyBaseFilters(baseQuery, params.filters);
  const snapshot = await query.get();

  return snapshot.docs.map((doc) => doc.data() as SpotRecord);
}

function normalizeSearchQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export async function searchSpotsWithFilters(params: {
  db: Firestore;
  filters: SpotSearchFilters;
}): Promise<SpotRecord[]> {
  const { query, ...listFilters } = params.filters;
  const candidates = await listSpotsWithFilters({
    db: params.db,
    filters: listFilters,
  });

  const queryTokens = normalizeSearchQuery(query);
  if (queryTokens.length === 0) return [];

  return candidates.filter((spot) => {
    const text = spot.searchText.toLowerCase();
    return queryTokens.every((token) => text.includes(token));
  });
}
