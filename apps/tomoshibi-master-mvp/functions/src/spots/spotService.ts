import type { Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "../firebase-admin";
import { deleteSpotDocById, getSpotDocById, listSpotsWithFilters, saveSpot, searchSpotsWithFilters } from "./spotRepository";
import { SpotNotFoundError, SpotValidationError } from "./spotErrors";
import { spotListFiltersSchema, spotSearchFiltersSchema, spotWriteInputSchema } from "./spotSchema";
import { normalizeSpotData, validateSpotInput } from "./spotModel";
import type { SpotListFilters, SpotPrimaryCategory, SpotRecord, SpotSearchFilters } from "./spotTypes";

function ensureObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SpotValidationError(`${path} must be an object`, [
      {
        path,
        message: `${path} must be an object`,
      },
    ]);
  }
  return value as Record<string, unknown>;
}

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const next: Record<string, unknown> = { ...base };

  for (const [key, patchValue] of Object.entries(patch)) {
    if (patchValue === undefined) continue;

    const baseValue = next[key];
    const isMergeableObject =
      typeof patchValue === "object" && patchValue != null && !Array.isArray(patchValue) && typeof baseValue === "object" && baseValue != null && !Array.isArray(baseValue);

    if (isMergeableObject) {
      next[key] = deepMerge(baseValue as Record<string, unknown>, patchValue as Record<string, unknown>);
      continue;
    }

    next[key] = patchValue;
  }

  return next as T;
}

function stripSpotMeta(spot: SpotRecord): Record<string, unknown> {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = spot;
  return rest;
}

export async function createSpot(params: { db?: Firestore; rawInput: unknown }): Promise<SpotRecord> {
  const db = params.db ?? getFirebaseAdminDb();
  const validated = validateSpotInput(params.rawInput);
  const normalized = normalizeSpotData(validated);

  await saveSpot({
    db,
    spot: normalized,
    mode: "create",
  });

  const saved = await getSpotDocById({ db, spotId: normalized.id });
  if (!saved) {
    throw new SpotNotFoundError(normalized.id);
  }
  return saved;
}

export async function updateSpot(params: { db?: Firestore; spotId: string; patch: unknown }): Promise<SpotRecord> {
  const db = params.db ?? getFirebaseAdminDb();
  const existing = await getSpotDocById({ db, spotId: params.spotId });
  if (!existing) {
    throw new SpotNotFoundError(params.spotId);
  }

  const patchObject = ensureObject(params.patch, "patch");
  const merged = deepMerge(stripSpotMeta(existing), patchObject);
  const withIdentity = {
    ...merged,
    id: params.spotId,
    slug: params.spotId,
  };

  const parsed = spotWriteInputSchema.safeParse(withIdentity);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new SpotValidationError(first?.message ?? "Invalid patch", [
      {
        path: first?.path.join(".") || "patch",
        message: first?.message ?? "Invalid patch",
      },
    ]);
  }

  const normalized = normalizeSpotData(parsed.data);
  await saveSpot({
    db,
    spot: normalized,
    mode: "update",
  });

  const saved = await getSpotDocById({ db, spotId: params.spotId });
  if (!saved) {
    throw new SpotNotFoundError(params.spotId);
  }

  return saved;
}

export async function getSpotById(params: { db?: Firestore; spotId: string }): Promise<SpotRecord | null> {
  const db = params.db ?? getFirebaseAdminDb();
  return getSpotDocById({ db, spotId: params.spotId });
}

export async function deleteSpot(params: { db?: Firestore; spotId: string }): Promise<void> {
  const db = params.db ?? getFirebaseAdminDb();
  const existing = await getSpotDocById({ db, spotId: params.spotId });
  if (!existing) {
    throw new SpotNotFoundError(params.spotId);
  }
  await deleteSpotDocById({ db, spotId: params.spotId });
}

export async function listSpots(params: {
  db?: Firestore;
  filters?: SpotListFilters;
}): Promise<SpotRecord[]> {
  const db = params.db ?? getFirebaseAdminDb();
  const parsedFilters = spotListFiltersSchema.parse(params.filters ?? {});

  return listSpotsWithFilters({
    db,
    filters: {
      status: parsedFilters.status ?? "published",
      ...parsedFilters,
    },
  });
}

export async function listSpotsByCategory(params: {
  db?: Firestore;
  category: SpotPrimaryCategory;
  filters?: Omit<SpotListFilters, "primaryCategory">;
}): Promise<SpotRecord[]> {
  const merged = {
    ...(params.filters ?? {}),
    primaryCategory: params.category,
  };

  return listSpots({
    db: params.db,
    filters: merged,
  });
}

export async function searchSpots(params: {
  db?: Firestore;
  filters: SpotSearchFilters;
}): Promise<SpotRecord[]> {
  const db = params.db ?? getFirebaseAdminDb();
  const parsed = spotSearchFiltersSchema.parse(params.filters);

  return searchSpotsWithFilters({
    db,
    filters: {
      status: parsed.status ?? "published",
      ...parsed,
    },
  });
}
