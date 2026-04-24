import { httpsCallable } from "firebase/functions";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseClientApp, getFirebaseClientFirestore, getFirebaseClientFunctions } from "@/lib/firebase";

export type SpotAdminRecord = Record<string, unknown> & {
  id: string;
  nameJa?: string;
  shortName?: string;
  thumbnailUrl?: string | null;
  heroImageUrl?: string | null;
  location?: {
    lat?: number;
    lng?: number;
  };
};

type UpdateSpotCallablePayload = {
  id: string;
  patch: Record<string, unknown>;
};

type CreateSpotCallablePayload = Record<string, unknown>;

type CreateSpotCallableResponse = {
  ok: boolean;
  spot?: SpotAdminRecord;
};

type UpdateSpotCallableResponse = {
  ok: boolean;
  spot?: SpotAdminRecord;
};

type DeleteSpotCallablePayload = {
  id: string;
};

type DeleteSpotCallableResponse = {
  ok: boolean;
  id?: string;
};

type UploadSpotImageCallablePayload = {
  spotId: string;
  kind: "thumbnail" | "hero";
  fileName: string;
  contentType: string;
  fileBase64: string;
};

type UploadSpotImageCallableResponse = {
  ok: boolean;
  objectPath?: string;
  downloadUrl?: string;
};

type NewSpotDefaultsParams = {
  lat: number;
  lng: number;
};

function normalizeOptionalUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildNewSpotDraft(params: NewSpotDefaultsParams): Record<string, unknown> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = normalizeSlug(`new-spot-${suffix}`);
  const name = "新規スポット";

  return {
    id: slug,
    slug,
    nameJa: name,
    nameEn: null,
    shortName: name,
    status: "published",
    primaryCategory: "see",
    secondaryCategories: [],
    tags: [],
    location: {
      lat: params.lat,
      lng: params.lng,
      geohash: null,
      addressJa: "未設定",
      areaName: null,
      stationAreaType: "none",
    },
    nearestStations: [],
    descriptionShort: "未設定",
    descriptionLong: "未設定",
    heroImageUrl: null,
    galleryImageUrls: [],
    thumbnailUrl: null,
    websiteUrl: null,
    instagramUrl: null,
    phoneNumber: null,
    operatorName: null,
    business: {
      isAlwaysOpen: false,
      openingHoursText: null,
      regularHolidaysText: null,
      reservationRequired: false,
      lastEntryTime: null,
      estimatedStayMinutesMin: 30,
      estimatedStayMinutesMax: 60,
    },
    pricing: {
      priceType: "unknown",
      priceLabel: null,
      priceMinYen: null,
      priceMaxYen: null,
    },
    access: {
      supportedTransports: ["walk"],
      parkingAvailable: false,
      bikeParkingAvailable: false,
      busStopNearby: false,
      requiresFirstStop: false,
      requiredFirstStopReason: null,
    },
    plannerAttributes: {
      themes: [],
      moodTags: [],
      weatherSuitability: {
        sunny: "ok",
        cloudy: "ok",
        rainy: "bad",
        windy: "ok",
      },
      timeOfDaySuitability: ["daytime"],
      visitPace: ["normal_stop"],
      withWho: ["solo"],
      physicalLoad: "low",
      indoorOutdoor: "outdoor",
      rainFallbackCandidate: false,
      photoSpotScore: 3,
      scenicScore: 3,
      foodScore: 1,
      shoppingScore: 1,
      experienceScore: 1,
      stationStopoverScore: 2,
      priorityScore: 50,
    },
    aiContext: {
      plannerSummary: "未設定",
      whyVisit: [],
      bestFor: [],
      avoidIf: [],
      sampleUseCases: [],
    },
    relatedSpotIds: [],
    campaignCompatible: false,
    couponCompatible: false,
    storyCompatible: false,
    source: "manual",
    lastReviewedAt: null,
  };
}

function isNetworkLikeFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof (error as { code?: unknown })?.code === "string" ? String((error as { code?: string }).code).toLowerCase() : "";
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("cors") ||
    message.includes("err_failed") ||
    code.includes("unavailable")
  );
}

function isPermissionDeniedFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof (error as { code?: unknown })?.code === "string" ? String((error as { code?: string }).code).toLowerCase() : "";
  return (
    code.includes("permission-denied") ||
    code.includes("permission_denied") ||
    message.includes("permission_denied") ||
    message.includes("permission-denied")
  );
}

function isLocalhostRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function hasFunctionsEmulatorConfig(): boolean {
  const host = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST?.trim();
  const port = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT?.trim();
  return Boolean(host && port);
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    if (isNetworkLikeFailure(error)) {
      return "管理APIに接続できませんでした。Functions Emulator を起動するか、Callable Functions をデプロイしてください。";
    }
    if (isPermissionDeniedFailure(error)) {
      if (error.message.includes("運営アカウント")) {
        return error.message;
      }
      return "権限エラーが発生しました。運営アカウントでログインしているか確認してください。";
    }
    return error.message;
  }
  if (isNetworkLikeFailure(error)) {
    return "管理APIに接続できませんでした。Functions Emulator を起動するか、Callable Functions をデプロイしてください。";
  }
  if (isPermissionDeniedFailure(error)) {
    return "権限エラーが発生しました。運営アカウントでログインしているか確認してください。";
  }
  return "スポット情報の処理に失敗しました。";
}

function getUpdateSpotCallable() {
  const functions = getFirebaseClientFunctions();
  if (!functions) {
    throw new Error("Firebase Functions が設定されていません。");
  }
  return httpsCallable<UpdateSpotCallablePayload, UpdateSpotCallableResponse>(functions, "updateSpotCallable");
}

function getCreateSpotCallable() {
  const functions = getFirebaseClientFunctions();
  if (!functions) {
    throw new Error("Firebase Functions が設定されていません。");
  }
  return httpsCallable<CreateSpotCallablePayload, CreateSpotCallableResponse>(functions, "createSpotCallable");
}

function getDeleteSpotCallable() {
  const functions = getFirebaseClientFunctions();
  if (!functions) {
    throw new Error("Firebase Functions が設定されていません。");
  }
  return httpsCallable<DeleteSpotCallablePayload, DeleteSpotCallableResponse>(functions, "deleteSpotCallable");
}

function getUploadSpotImageCallable() {
  const functions = getFirebaseClientFunctions();
  if (!functions) {
    throw new Error("Firebase Functions が設定されていません。");
  }
  return httpsCallable<UploadSpotImageCallablePayload, UploadSpotImageCallableResponse>(functions, "uploadSpotImageCallable");
}

export async function getSpotRecordById(spotId: string): Promise<SpotAdminRecord> {
  const firestore = getFirebaseClientFirestore();
  if (!firestore) {
    throw new Error("Firebase Firestore が設定されていません。");
  }

  const reference = doc(firestore, "spots", spotId);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) {
    throw new Error("対象スポットが見つかりませんでした。");
  }

  const data = snapshot.data() as Record<string, unknown>;
  return {
    id: snapshot.id,
    ...data,
  };
}

export async function createSpotRecord(params: { lat: number; lng: number }): Promise<SpotAdminRecord> {
  const callable = getCreateSpotCallable();
  const payload = buildNewSpotDraft({
    lat: params.lat,
    lng: params.lng,
  });

  try {
    const result = await callable(payload);
    if (!result.data?.ok || !result.data?.spot) {
      throw new Error("新規スポットの作成に失敗しました。");
    }
    return result.data.spot;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

async function updateSpotRecordByCallable(params: {
  spotId: string;
  patch: Record<string, unknown>;
}): Promise<SpotAdminRecord> {
  const callable = getUpdateSpotCallable();
  const payload: UpdateSpotCallablePayload = {
    id: params.spotId,
    patch: params.patch,
  };
  try {
    const result = await callable(payload);
    if (!result.data?.ok || !result.data?.spot) {
      throw new Error("スポット情報の保存に失敗しました。");
    }
    return result.data.spot;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

async function updateSpotRecordByFirestore(params: {
  spotId: string;
  patch: Record<string, unknown>;
}): Promise<SpotAdminRecord> {
  const firestore = getFirebaseClientFirestore();
  if (!firestore) {
    throw new Error("Firebase Firestore が設定されていません。");
  }
  const reference = doc(firestore, "spots", params.spotId);

  await setDoc(
    reference,
    {
      ...params.patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) {
    throw new Error("保存後のスポット情報が見つかりませんでした。");
  }

  const data = snapshot.data() as Record<string, unknown>;
  return {
    id: snapshot.id,
    ...data,
  };
}

export async function updateSpotRecord(params: {
  spotId: string;
  patch: Record<string, unknown>;
}): Promise<SpotAdminRecord> {
  if (isLocalhostRuntime()) {
    try {
      return await updateSpotRecordByFirestore(params);
    } catch (error) {
      if (!isPermissionDeniedFailure(error)) {
        throw error;
      }
      if (!hasFunctionsEmulatorConfig()) {
        throw new Error(extractErrorMessage(error));
      }
      return updateSpotRecordByCallable(params);
    }
  }

  try {
    return await updateSpotRecordByCallable(params);
  } catch (error) {
    if (!isNetworkLikeFailure(error)) {
      throw error;
    }
    return updateSpotRecordByFirestore(params);
  }
}

async function deleteSpotRecordByCallable(params: { spotId: string }): Promise<void> {
  const callable = getDeleteSpotCallable();
  const payload: DeleteSpotCallablePayload = { id: params.spotId };
  try {
    const result = await callable(payload);
    if (!result.data?.ok) {
      throw new Error("スポット情報の削除に失敗しました。");
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

async function deleteSpotRecordByFirestore(params: { spotId: string }): Promise<void> {
  const firestore = getFirebaseClientFirestore();
  if (!firestore) {
    throw new Error("Firebase Firestore が設定されていません。");
  }
  const reference = doc(firestore, "spots", params.spotId);
  await deleteDoc(reference);
}

export async function deleteSpotRecord(params: { spotId: string }): Promise<void> {
  if (isLocalhostRuntime()) {
    try {
      await deleteSpotRecordByFirestore(params);
      return;
    } catch (error) {
      if (!isPermissionDeniedFailure(error)) {
        throw error;
      }
      if (!hasFunctionsEmulatorConfig()) {
        throw new Error(extractErrorMessage(error));
      }
      await deleteSpotRecordByCallable(params);
      return;
    }
  }

  try {
    await deleteSpotRecordByCallable(params);
    return;
  } catch (error) {
    if (!isNetworkLikeFailure(error)) {
      throw error;
    }
    await deleteSpotRecordByFirestore(params);
  }
}

export async function updateSpotImageUrls(params: {
  spotId: string;
  thumbnailUrl: string;
  heroImageUrl: string;
}): Promise<void> {
  await updateSpotRecord({
    spotId: params.spotId,
    patch: {
      thumbnailUrl: normalizeOptionalUrl(params.thumbnailUrl),
      heroImageUrl: normalizeOptionalUrl(params.heroImageUrl),
    },
  });
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
}

async function uploadSpotImageFileByCallable(params: {
  spotId: string;
  kind: "thumbnail" | "hero";
  file: File;
}): Promise<string> {
  const callable = getUploadSpotImageCallable();
  const fileBase64 = await fileToBase64(params.file);
  const payload: UploadSpotImageCallablePayload = {
    spotId: params.spotId,
    kind: params.kind,
    fileName: params.file.name,
    contentType: params.file.type || "application/octet-stream",
    fileBase64,
  };

  try {
    const response = await callable(payload);
    if (!response.data?.ok || !response.data.downloadUrl) {
      throw new Error("画像アップロードに失敗しました。");
    }
    return response.data.downloadUrl;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function uploadSpotImageFile(params: {
  spotId: string;
  kind: "thumbnail" | "hero";
  file: File;
}): Promise<string> {
  const firebaseApp = getFirebaseClientApp();
  if (!firebaseApp) {
    throw new Error("Firebase App が設定されていません。");
  }

  try {
    return await uploadSpotImageFileByCallable(params);
  } catch (callableError) {
    throw new Error(
      callableError instanceof Error && callableError.message
        ? callableError.message
        : "画像アップロードに失敗しました。uploadSpotImageCallable のデプロイ状況を確認してください。",
    );
  }
}
