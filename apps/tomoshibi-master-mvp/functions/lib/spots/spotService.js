"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpot = createSpot;
exports.updateSpot = updateSpot;
exports.getSpotById = getSpotById;
exports.deleteSpot = deleteSpot;
exports.listSpots = listSpots;
exports.listSpotsByCategory = listSpotsByCategory;
exports.searchSpots = searchSpots;
const firebase_admin_1 = require("../firebase-admin");
const spotRepository_1 = require("./spotRepository");
const spotErrors_1 = require("./spotErrors");
const spotSchema_1 = require("./spotSchema");
const spotModel_1 = require("./spotModel");
function ensureObject(value, path) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new spotErrors_1.SpotValidationError(`${path} must be an object`, [
            {
                path,
                message: `${path} must be an object`,
            },
        ]);
    }
    return value;
}
function deepMerge(base, patch) {
    const next = { ...base };
    for (const [key, patchValue] of Object.entries(patch)) {
        if (patchValue === undefined)
            continue;
        const baseValue = next[key];
        const isMergeableObject = typeof patchValue === "object" && patchValue != null && !Array.isArray(patchValue) && typeof baseValue === "object" && baseValue != null && !Array.isArray(baseValue);
        if (isMergeableObject) {
            next[key] = deepMerge(baseValue, patchValue);
            continue;
        }
        next[key] = patchValue;
    }
    return next;
}
function stripSpotMeta(spot) {
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = spot;
    return rest;
}
async function createSpot(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    const validated = (0, spotModel_1.validateSpotInput)(params.rawInput);
    const normalized = (0, spotModel_1.normalizeSpotData)(validated);
    await (0, spotRepository_1.saveSpot)({
        db,
        spot: normalized,
        mode: "create",
    });
    const saved = await (0, spotRepository_1.getSpotDocById)({ db, spotId: normalized.id });
    if (!saved) {
        throw new spotErrors_1.SpotNotFoundError(normalized.id);
    }
    return saved;
}
async function updateSpot(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    const existing = await (0, spotRepository_1.getSpotDocById)({ db, spotId: params.spotId });
    if (!existing) {
        throw new spotErrors_1.SpotNotFoundError(params.spotId);
    }
    const patchObject = ensureObject(params.patch, "patch");
    const merged = deepMerge(stripSpotMeta(existing), patchObject);
    const withIdentity = {
        ...merged,
        id: params.spotId,
        slug: params.spotId,
    };
    const parsed = spotSchema_1.spotWriteInputSchema.safeParse(withIdentity);
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new spotErrors_1.SpotValidationError(first?.message ?? "Invalid patch", [
            {
                path: first?.path.join(".") || "patch",
                message: first?.message ?? "Invalid patch",
            },
        ]);
    }
    const normalized = (0, spotModel_1.normalizeSpotData)(parsed.data);
    await (0, spotRepository_1.saveSpot)({
        db,
        spot: normalized,
        mode: "update",
    });
    const saved = await (0, spotRepository_1.getSpotDocById)({ db, spotId: params.spotId });
    if (!saved) {
        throw new spotErrors_1.SpotNotFoundError(params.spotId);
    }
    return saved;
}
async function getSpotById(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    return (0, spotRepository_1.getSpotDocById)({ db, spotId: params.spotId });
}
async function deleteSpot(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    const existing = await (0, spotRepository_1.getSpotDocById)({ db, spotId: params.spotId });
    if (!existing) {
        throw new spotErrors_1.SpotNotFoundError(params.spotId);
    }
    await (0, spotRepository_1.deleteSpotDocById)({ db, spotId: params.spotId });
}
async function listSpots(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    const parsedFilters = spotSchema_1.spotListFiltersSchema.parse(params.filters ?? {});
    return (0, spotRepository_1.listSpotsWithFilters)({
        db,
        filters: {
            status: parsedFilters.status ?? "published",
            ...parsedFilters,
        },
    });
}
async function listSpotsByCategory(params) {
    const merged = {
        ...(params.filters ?? {}),
        primaryCategory: params.category,
    };
    return listSpots({
        db: params.db,
        filters: merged,
    });
}
async function searchSpots(params) {
    const db = params.db ?? (0, firebase_admin_1.getFirebaseAdminDb)();
    const parsed = spotSchema_1.spotSearchFiltersSchema.parse(params.filters);
    return (0, spotRepository_1.searchSpotsWithFilters)({
        db,
        filters: {
            status: parsed.status ?? "published",
            ...parsed,
        },
    });
}
//# sourceMappingURL=spotService.js.map