"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSpotsCallable = exports.listSpotsByCategoryCallable = exports.listSpotsCallable = exports.uploadSpotImageCallable = exports.deleteSpotCallable = exports.getSpotByIdCallable = exports.updateSpotCallable = exports.createSpotCallable = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const node_crypto_1 = require("node:crypto");
const spotErrors_1 = require("./spotErrors");
const spotService_1 = require("./spotService");
const spotConstants_1 = require("./spotConstants");
const firebase_admin_1 = require("../firebase-admin");
const SPOT_ADMIN_EMAIL = "tomoshibi.team@gmail.com";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const SPOT_IMAGE_KIND_VALUES = ["thumbnail", "hero"];
const IMAGE_MIME_EXTENSION_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
};
function sanitizePathSegment(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
function resolveImageExtension(contentType, fileName) {
    const fromName = fileName?.split(".").pop()?.trim().toLowerCase();
    if (fromName && /^[a-z0-9]+$/.test(fromName)) {
        return fromName;
    }
    return IMAGE_MIME_EXTENSION_MAP[contentType] ?? "jpg";
}
function resolveStorageDownloadUrl(params) {
    const encodedObjectPath = encodeURIComponent(params.objectPath);
    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST?.trim();
    if (emulatorHost) {
        const hostWithProtocol = /^https?:\/\//i.test(emulatorHost) ? emulatorHost : `http://${emulatorHost}`;
        return `${hostWithProtocol}/v0/b/${params.bucketName}/o/${encodedObjectPath}?alt=media&token=${params.token}`;
    }
    return `https://firebasestorage.googleapis.com/v0/b/${params.bucketName}/o/${encodedObjectPath}?alt=media&token=${params.token}`;
}
function parseBase64Image(input) {
    if (!input || typeof input !== "string") {
        throw new spotErrors_1.SpotValidationError("fileBase64 is required", [{ path: "fileBase64", message: "fileBase64 is required" }]);
    }
    const normalized = input.trim();
    const buffer = Buffer.from(normalized, "base64");
    if (buffer.length === 0) {
        throw new spotErrors_1.SpotValidationError("fileBase64 is empty", [{ path: "fileBase64", message: "fileBase64 is empty" }]);
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
        throw new spotErrors_1.SpotValidationError("file is too large", [{ path: "fileBase64", message: "file is too large (max 8MB)" }]);
    }
    return buffer;
}
function assertSpotAdmin(request) {
    const authEmail = typeof request.auth?.token?.email === "string" ? request.auth.token.email.trim().toLowerCase() : "";
    if (authEmail !== SPOT_ADMIN_EMAIL) {
        throw new https_1.HttpsError("permission-denied", "この操作は運営アカウントのみ実行できます。");
    }
}
function toHttpsError(error) {
    if (error instanceof https_1.HttpsError) {
        return error;
    }
    if (error instanceof spotErrors_1.SpotValidationError) {
        return new https_1.HttpsError("invalid-argument", error.message, {
            code: error.code,
            details: error.details,
        });
    }
    if (error instanceof spotErrors_1.SpotNotFoundError) {
        return new https_1.HttpsError("not-found", error.message, {
            code: error.code,
        });
    }
    if (error instanceof Error && error.message.trim().length > 0) {
        return new https_1.HttpsError("internal", `Spot operation failed: ${error.message}`);
    }
    return new https_1.HttpsError("internal", "Spot operation failed");
}
exports.createSpotCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        assertSpotAdmin(request);
        const spot = await (0, spotService_1.createSpot)({ rawInput: request.data });
        return { ok: true, spot };
    }
    catch (error) {
        firebase_functions_1.logger.error("createSpotCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.updateSpotCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        assertSpotAdmin(request);
        const data = (request.data ?? {});
        if (!data.id) {
            throw new spotErrors_1.SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
        }
        const spot = await (0, spotService_1.updateSpot)({
            spotId: data.id,
            patch: data.patch ?? {},
        });
        return { ok: true, spot };
    }
    catch (error) {
        firebase_functions_1.logger.error("updateSpotCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.getSpotByIdCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        const data = (request.data ?? {});
        if (!data.id) {
            throw new spotErrors_1.SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
        }
        const spot = await (0, spotService_1.getSpotById)({ spotId: data.id });
        if (!spot) {
            throw new spotErrors_1.SpotNotFoundError(data.id);
        }
        return { ok: true, spot };
    }
    catch (error) {
        firebase_functions_1.logger.error("getSpotByIdCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.deleteSpotCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        assertSpotAdmin(request);
        const data = (request.data ?? {});
        if (!data.id) {
            throw new spotErrors_1.SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
        }
        await (0, spotService_1.deleteSpot)({ spotId: data.id });
        return { ok: true, id: data.id };
    }
    catch (error) {
        firebase_functions_1.logger.error("deleteSpotCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.uploadSpotImageCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        assertSpotAdmin(request);
        const data = (request.data ?? {});
        if (!data.spotId) {
            throw new spotErrors_1.SpotValidationError("spotId is required", [{ path: "spotId", message: "spotId is required" }]);
        }
        if (!data.kind || !SPOT_IMAGE_KIND_VALUES.includes(data.kind)) {
            throw new spotErrors_1.SpotValidationError("kind is invalid", [{ path: "kind", message: "kind is invalid" }]);
        }
        const contentType = typeof data.contentType === "string" ? data.contentType.trim().toLowerCase() : "";
        if (!contentType.startsWith("image/")) {
            throw new spotErrors_1.SpotValidationError("contentType must be image/*", [
                { path: "contentType", message: "contentType must be image/*" },
            ]);
        }
        const buffer = parseBase64Image(data.fileBase64 ?? "");
        const safeSpotId = sanitizePathSegment(data.spotId);
        const extension = resolveImageExtension(contentType, data.fileName);
        const objectPath = `spots/${safeSpotId}/${data.kind}-${Date.now()}.${extension}`;
        const token = (0, node_crypto_1.randomUUID)();
        const bucket = (0, firebase_admin_1.getFirebaseAdminStorageBucket)();
        const file = bucket.file(objectPath);
        await file.save(buffer, {
            resumable: false,
            contentType,
            metadata: {
                cacheControl: "public,max-age=31536000",
                metadata: {
                    firebaseStorageDownloadTokens: token,
                },
            },
        });
        const downloadUrl = resolveStorageDownloadUrl({
            bucketName: bucket.name,
            objectPath,
            token,
        });
        return {
            ok: true,
            objectPath,
            downloadUrl,
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("uploadSpotImageCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.listSpotsCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        const spots = await (0, spotService_1.listSpots)({
            filters: (request.data ?? {}),
        });
        return {
            ok: true,
            count: spots.length,
            spots,
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("listSpotsCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.listSpotsByCategoryCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        const data = (request.data ?? {});
        if (!data.category || !spotConstants_1.SPOT_PRIMARY_CATEGORY_VALUES.includes(data.category)) {
            throw new spotErrors_1.SpotValidationError("category is required", [{ path: "category", message: "category is required" }]);
        }
        const spots = await (0, spotService_1.listSpotsByCategory)({
            category: data.category,
            filters: (data.filters ?? {}),
        });
        return {
            ok: true,
            count: spots.length,
            spots,
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("listSpotsByCategoryCallable failed", { error });
        throw toHttpsError(error);
    }
});
exports.searchSpotsCallable = (0, https_1.onCall)({ region: "asia-northeast1" }, async (request) => {
    try {
        const data = (request.data ?? {});
        const spots = await (0, spotService_1.searchSpots)({
            filters: data,
        });
        return {
            ok: true,
            count: spots.length,
            spots,
        };
    }
    catch (error) {
        firebase_functions_1.logger.error("searchSpotsCallable failed", { error });
        throw toHttpsError(error);
    }
});
//# sourceMappingURL=spotFunctions.js.map