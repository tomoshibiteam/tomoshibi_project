"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdminDb = getFirebaseAdminDb;
exports.getFirebaseAdminStorageBucket = getFirebaseAdminStorageBucket;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
function resolveProjectIdFromEnv() {
    const candidates = [
        process.env.FIREBASE_PROJECT_ID,
        process.env.GOOGLE_CLOUD_PROJECT,
        process.env.GCLOUD_PROJECT,
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ];
    for (const candidate of candidates) {
        const normalized = candidate?.trim();
        if (normalized)
            return normalized;
    }
    return null;
}
function normalizeStorageBucketName(rawValue) {
    const trimmed = rawValue?.trim();
    if (!trimmed)
        return null;
    let candidate = trimmed;
    if (candidate.startsWith("gs://")) {
        candidate = candidate.slice("gs://".length);
    }
    else if (/^https?:\/\//i.test(candidate)) {
        try {
            const url = new URL(candidate);
            if (url.hostname === "firebasestorage.googleapis.com") {
                const match = url.pathname.match(/\/v0\/b\/([^/]+)\/o/i);
                if (match?.[1]) {
                    candidate = decodeURIComponent(match[1]);
                }
                else {
                    candidate = url.pathname.replace(/^\/+/, "");
                }
            }
            else {
                candidate = url.hostname;
            }
        }
        catch {
            // Keep the original value and fall through to generic cleanup.
        }
    }
    candidate = candidate.replace(/^\/+|\/+$/g, "");
    if (candidate.includes("/")) {
        candidate = candidate.split("/")[0] ?? candidate;
    }
    if (!candidate)
        return null;
    const bucketNamePattern = /^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/;
    if (!bucketNamePattern.test(candidate))
        return null;
    return candidate;
}
function resolveStorageBucketNameFromFirebaseConfig() {
    const rawFirebaseConfig = process.env.FIREBASE_CONFIG?.trim();
    if (!rawFirebaseConfig || !rawFirebaseConfig.startsWith("{"))
        return null;
    try {
        const parsed = JSON.parse(rawFirebaseConfig);
        if (typeof parsed.storageBucket === "string") {
            return normalizeStorageBucketName(parsed.storageBucket);
        }
    }
    catch {
        // Ignore malformed FIREBASE_CONFIG in local/emulator setups.
    }
    return null;
}
function resolveStorageBucketNameFromProjectId(projectId) {
    if (!projectId)
        return null;
    const candidates = [`${projectId}.firebasestorage.app`, `${projectId}.appspot.com`];
    for (const candidate of candidates) {
        const normalized = normalizeStorageBucketName(candidate);
        if (normalized)
            return normalized;
    }
    return null;
}
function resolveStorageBucketName(projectId) {
    const candidates = [
        process.env.FIREBASE_STORAGE_BUCKET,
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        resolveStorageBucketNameFromFirebaseConfig(),
        resolveStorageBucketNameFromProjectId(projectId),
    ];
    for (const candidate of candidates) {
        const normalized = normalizeStorageBucketName(candidate);
        if (normalized)
            return normalized;
    }
    return null;
}
function getOrInitializeAdminApp() {
    const existingApps = (0, app_1.getApps)();
    if (existingApps.length > 0) {
        // In emulator reload cycles the first app can exist without a resolvable
        // default app name; reusing the first initialized app is the safest option.
        return existingApps[0];
    }
    const projectId = resolveProjectIdFromEnv();
    const storageBucket = resolveStorageBucketName(projectId);
    if (!projectId) {
        if (!storageBucket) {
            return (0, app_1.initializeApp)();
        }
        const options = { storageBucket };
        return (0, app_1.initializeApp)(options);
    }
    const options = {
        projectId,
        ...(storageBucket ? { storageBucket } : {}),
    };
    return (0, app_1.initializeApp)(options);
}
function getFirebaseAdminDb() {
    const app = getOrInitializeAdminApp();
    return (0, firestore_1.getFirestore)(app);
}
function getFirebaseAdminStorageBucket() {
    const app = getOrInitializeAdminApp();
    const projectId = typeof app.options.projectId === "string" ? app.options.projectId : resolveProjectIdFromEnv();
    const configuredBucket = resolveStorageBucketName(projectId);
    if (!configuredBucket) {
        throw new Error("Bucket name not specified or invalid.");
    }
    return (0, storage_1.getStorage)(app).bucket(configuredBucket);
}
//# sourceMappingURL=firebase-admin.js.map