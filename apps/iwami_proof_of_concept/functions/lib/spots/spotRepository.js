"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPOTS_COLLECTION = void 0;
exports.saveSpot = saveSpot;
exports.getSpotDocById = getSpotDocById;
exports.deleteSpotDocById = deleteSpotDocById;
exports.listSpotsWithFilters = listSpotsWithFilters;
exports.searchSpotsWithFilters = searchSpotsWithFilters;
const firestore_1 = require("firebase-admin/firestore");
exports.SPOTS_COLLECTION = "spots";
const DEFAULT_LIST_LIMIT = 100;
function applyBaseFilters(query, filters) {
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
        }
        else {
            nextQuery = nextQuery.where("access.supportedTransports", "array-contains-any", filters.supportedTransports);
        }
    }
    return nextQuery.limit(filters.limit ?? DEFAULT_LIST_LIMIT);
}
async function saveSpot(params) {
    const timestampFactory = params.timestampFactory ?? (() => firestore_1.FieldValue.serverTimestamp());
    const mode = params.mode ?? "upsert";
    const docRef = params.db.collection(exports.SPOTS_COLLECTION).doc(params.spot.id);
    if (mode === "create") {
        await docRef.create({
            ...params.spot,
            createdAt: timestampFactory(),
            updatedAt: timestampFactory(),
        });
        return docRef.id;
    }
    if (mode === "update") {
        await docRef.set({
            ...params.spot,
            updatedAt: timestampFactory(),
        }, { merge: true });
        return docRef.id;
    }
    await docRef.set({
        ...params.spot,
        createdAt: timestampFactory(),
        updatedAt: timestampFactory(),
    }, { merge: true });
    return docRef.id;
}
async function getSpotDocById(params) {
    const snapshot = await params.db.collection(exports.SPOTS_COLLECTION).doc(params.spotId).get();
    if (!snapshot.exists)
        return null;
    return snapshot.data();
}
async function deleteSpotDocById(params) {
    await params.db.collection(exports.SPOTS_COLLECTION).doc(params.spotId).delete();
}
async function listSpotsWithFilters(params) {
    const baseQuery = params.db.collection(exports.SPOTS_COLLECTION);
    const query = applyBaseFilters(baseQuery, params.filters);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
}
function normalizeSearchQuery(query) {
    return query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}
async function searchSpotsWithFilters(params) {
    const { query, ...listFilters } = params.filters;
    const candidates = await listSpotsWithFilters({
        db: params.db,
        filters: listFilters,
    });
    const queryTokens = normalizeSearchQuery(query);
    if (queryTokens.length === 0)
        return [];
    return candidates.filter((spot) => {
        const text = spot.searchText.toLowerCase();
        return queryTokens.every((token) => text.includes(token));
    });
}
//# sourceMappingURL=spotRepository.js.map