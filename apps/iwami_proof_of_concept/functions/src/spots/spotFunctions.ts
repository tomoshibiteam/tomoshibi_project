import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { randomUUID } from "node:crypto";
import { SpotNotFoundError, SpotValidationError } from "./spotErrors";
import { createSpot, deleteSpot, getSpotById, listSpots, listSpotsByCategory, searchSpots, updateSpot } from "./spotService";
import { SPOT_PRIMARY_CATEGORY_VALUES } from "./spotConstants";
import { getFirebaseAdminStorageBucket } from "../firebase-admin";

const SPOT_ADMIN_EMAIL = "tomoshibi.team@gmail.com";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

type SpotImageKind = "thumbnail" | "hero";
const SPOT_IMAGE_KIND_VALUES: SpotImageKind[] = ["thumbnail", "hero"];
const IMAGE_MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function resolveImageExtension(contentType: string, fileName?: string): string {
  const fromName = fileName?.split(".").pop()?.trim().toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }
  return IMAGE_MIME_EXTENSION_MAP[contentType] ?? "jpg";
}

function resolveStorageDownloadUrl(params: { bucketName: string; objectPath: string; token: string }): string {
  const encodedObjectPath = encodeURIComponent(params.objectPath);
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST?.trim();

  if (emulatorHost) {
    const hostWithProtocol = /^https?:\/\//i.test(emulatorHost) ? emulatorHost : `http://${emulatorHost}`;
    return `${hostWithProtocol}/v0/b/${params.bucketName}/o/${encodedObjectPath}?alt=media&token=${params.token}`;
  }

  return `https://firebasestorage.googleapis.com/v0/b/${params.bucketName}/o/${encodedObjectPath}?alt=media&token=${params.token}`;
}

function parseBase64Image(input: string): Buffer {
  if (!input || typeof input !== "string") {
    throw new SpotValidationError("fileBase64 is required", [{ path: "fileBase64", message: "fileBase64 is required" }]);
  }
  const normalized = input.trim();
  const buffer = Buffer.from(normalized, "base64");
  if (buffer.length === 0) {
    throw new SpotValidationError("fileBase64 is empty", [{ path: "fileBase64", message: "fileBase64 is empty" }]);
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new SpotValidationError("file is too large", [{ path: "fileBase64", message: "file is too large (max 8MB)" }]);
  }
  return buffer;
}

function assertSpotAdmin(request: { auth?: { token?: { email?: unknown } } }): void {
  const authEmail = typeof request.auth?.token?.email === "string" ? request.auth.token.email.trim().toLowerCase() : "";
  if (authEmail !== SPOT_ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "この操作は運営アカウントのみ実行できます。");
  }
}

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }
  if (error instanceof SpotValidationError) {
    return new HttpsError("invalid-argument", error.message, {
      code: error.code,
      details: error.details,
    });
  }
  if (error instanceof SpotNotFoundError) {
    return new HttpsError("not-found", error.message, {
      code: error.code,
    });
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return new HttpsError("internal", `Spot operation failed: ${error.message}`);
  }
  return new HttpsError("internal", "Spot operation failed");
}

export const createSpotCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    assertSpotAdmin(request);
    const spot = await createSpot({ rawInput: request.data });
    return { ok: true, spot };
  } catch (error) {
    logger.error("createSpotCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const updateSpotCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    assertSpotAdmin(request);
    const data = (request.data ?? {}) as { id?: string; patch?: unknown };
    if (!data.id) {
      throw new SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
    }
    const spot = await updateSpot({
      spotId: data.id,
      patch: data.patch ?? {},
    });
    return { ok: true, spot };
  } catch (error) {
    logger.error("updateSpotCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const getSpotByIdCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    const data = (request.data ?? {}) as { id?: string };
    if (!data.id) {
      throw new SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
    }

    const spot = await getSpotById({ spotId: data.id });
    if (!spot) {
      throw new SpotNotFoundError(data.id);
    }

    return { ok: true, spot };
  } catch (error) {
    logger.error("getSpotByIdCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const deleteSpotCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    assertSpotAdmin(request);
    const data = (request.data ?? {}) as { id?: string };
    if (!data.id) {
      throw new SpotValidationError("id is required", [{ path: "id", message: "id is required" }]);
    }
    await deleteSpot({ spotId: data.id });
    return { ok: true, id: data.id };
  } catch (error) {
    logger.error("deleteSpotCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const uploadSpotImageCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    assertSpotAdmin(request);
    const data = (request.data ?? {}) as {
      spotId?: string;
      kind?: SpotImageKind;
      fileName?: string;
      contentType?: string;
      fileBase64?: string;
    };

    if (!data.spotId) {
      throw new SpotValidationError("spotId is required", [{ path: "spotId", message: "spotId is required" }]);
    }
    if (!data.kind || !SPOT_IMAGE_KIND_VALUES.includes(data.kind)) {
      throw new SpotValidationError("kind is invalid", [{ path: "kind", message: "kind is invalid" }]);
    }
    const contentType = typeof data.contentType === "string" ? data.contentType.trim().toLowerCase() : "";
    if (!contentType.startsWith("image/")) {
      throw new SpotValidationError("contentType must be image/*", [
        { path: "contentType", message: "contentType must be image/*" },
      ]);
    }

    const buffer = parseBase64Image(data.fileBase64 ?? "");
    const safeSpotId = sanitizePathSegment(data.spotId);
    const extension = resolveImageExtension(contentType, data.fileName);
    const objectPath = `spots/${safeSpotId}/${data.kind}-${Date.now()}.${extension}`;
    const token = randomUUID();
    const bucket = getFirebaseAdminStorageBucket();
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
  } catch (error) {
    logger.error("uploadSpotImageCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const listSpotsCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    const spots = await listSpots({
      filters: (request.data ?? {}) as Record<string, unknown>,
    });

    return {
      ok: true,
      count: spots.length,
      spots,
    };
  } catch (error) {
    logger.error("listSpotsCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const listSpotsByCategoryCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    const data = (request.data ?? {}) as {
      category?: (typeof SPOT_PRIMARY_CATEGORY_VALUES)[number];
      filters?: Record<string, unknown>;
    };

    if (!data.category || !SPOT_PRIMARY_CATEGORY_VALUES.includes(data.category)) {
      throw new SpotValidationError("category is required", [{ path: "category", message: "category is required" }]);
    }

    const spots = await listSpotsByCategory({
      category: data.category,
      filters: (data.filters ?? {}) as Record<string, unknown>,
    });

    return {
      ok: true,
      count: spots.length,
      spots,
    };
  } catch (error) {
    logger.error("listSpotsByCategoryCallable failed", { error });
    throw toHttpsError(error);
  }
});

export const searchSpotsCallable = onCall({ region: "asia-northeast1" }, async (request) => {
  try {
    const data = (request.data ?? {}) as Record<string, unknown>;
    const spots = await searchSpots({
      filters: data as never,
    });

    return {
      ok: true,
      count: spots.length,
      spots,
    };
  } catch (error) {
    logger.error("searchSpotsCallable failed", { error });
    throw toHttpsError(error);
  }
});
