"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";

type SaveIntent = "draft" | "complete";
type SeriesStatus = "draft" | "previewable";

type ExistingProjectDoc = {
  ownerUid?: unknown;
  series?: unknown;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function readAllText(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
}

function parseListText(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const splitByLine = trimmed
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const rawItems =
    splitByLine.length > 1
      ? splitByLine
      : trimmed
          .split(/[、,]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

  return rawItems
    .map((item) => item.replace(/^[\-*・●○■□▶︎→\d０-９]+[.)．]?\s*/u, "").trim())
    .filter((item) => item.length > 0);
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    if (!item || seen.has(item)) {
      continue;
    }
    seen.add(item);
    result.push(item);
  }

  return result;
}

function resolveIntent(rawIntent: string): SaveIntent {
  return rawIntent === "complete" ? "complete" : "draft";
}

function resolveStatus(intent: SaveIntent): SeriesStatus {
  return intent === "complete" ? "previewable" : "draft";
}

function clampScore(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, parsed));
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is Record<string, unknown> => isRecord(item));
}

function toSlugBase(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "series";
}

function buildSeriesId(name: string): string {
  const base = toSlugBase(name);
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveNewSeriesAction(formData: FormData): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) {
    throw new Error("Firebase Admin is not configured.");
  }

  const currentUser = await getRequestAuthUser();
  if (!currentUser) {
    throw new Error("ログイン情報を確認できないため保存できません。再ログインしてください。");
  }

  const projectId = readText(formData, "projectId");
  if (!projectId) {
    throw new Error("プロジェクトIDが指定されていないため保存できません。");
  }

  const projectRef = db.collection("projects").doc(projectId);
  const snapshot = await projectRef.get();
  if (!snapshot.exists) {
    throw new Error("対象プロジェクトが見つかりません。");
  }

  const currentData = snapshot.data() as ExistingProjectDoc;
  const ownerUid = asString(currentData.ownerUid);
  if (!ownerUid || ownerUid !== currentUser.uid) {
    throw new Error("このプロジェクトを更新する権限がありません。");
  }

  const intent = resolveIntent(readText(formData, "intent"));
  const status = resolveStatus(intent);

  const seriesName = readText(formData, "seriesName") || "名称未設定シリーズ";
  const seriesOneLine = readText(formData, "seriesOneLine");
  const seriesRole = readText(formData, "seriesRole");
  const participantGoal = readText(formData, "participantGoal");
  const participantRole = readText(formData, "participantRole");
  const guideRole = readText(formData, "guideRole");
  const continuousPurpose = readText(formData, "continuousPurpose");
  const episodeCompletionUnit = readText(formData, "episodeCompletionUnit");
  const seriesTones = readAllText(formData, "seriesTones").slice(0, 3);
  const seriesTopics = unique([
    ...readAllText(formData, "seriesTopics"),
    ...parseListText(readText(formData, "seriesTopicsText")),
  ]);
  const expressionModes = readAllText(formData, "expressionModes").slice(0, 3);
  const modeRule = readText(formData, "modeRule");
  const requiredPoints = parseListText(readText(formData, "requiredPointsText"));
  const avoidRules = parseListText(readText(formData, "avoidRulesText"));
  const factDirectionScore = clampScore(readText(formData, "factDirectionScore"), 30);
  const factDirectionNote = readText(formData, "factDirectionNote");
  const continuity = readText(formData, "continuityText");
  const revisitChange = readText(formData, "revisitChangeText");

  const existingSeriesRecords = asRecordArray(currentData.series);
  const requestedSeriesId = readText(formData, "seriesId");
  const existingIndex = existingSeriesRecords.findIndex(
    (series) => asString(series.id) === requestedSeriesId,
  );
  const existingSeries = existingIndex >= 0 ? existingSeriesRecords[existingIndex] : null;

  const seriesId = existingSeries ? requestedSeriesId : buildSeriesId(seriesName);
  const now = new Date();
  const existingMetadata =
    existingSeries && isRecord(existingSeries.metadata) ? existingSeries.metadata : {};
  const nextMetadata: Record<string, unknown> = { ...existingMetadata };
  delete nextMetadata.areaScope;
  delete nextMetadata.worldAcrossArea;
  delete nextMetadata.spotDbPolicy;
  delete nextMetadata.initialEpisodeCount;
  delete nextMetadata.initialEpisodeTopics;

  const nextSeriesRecord: Record<string, unknown> = {
    ...(existingSeries ?? {}),
    id: seriesId,
    name: seriesName,
    description: seriesOneLine || seriesRole || "説明が未設定です。",
    status,
    updatedAt: now,
    createdAt: existingSeries?.createdAt ?? now,
    metadata: {
      ...nextMetadata,
      oneLine: seriesOneLine,
      role: seriesRole,
      participantGoal,
      participantRole,
      guideRole,
      continuousPurpose,
      episodeCompletionUnit,
      tones: seriesTones,
      topics: seriesTopics,
      expressionModes,
      modeRule,
      requiredPoints,
      avoidRules,
      factDirectionScore,
      factDirectionNote,
      continuity,
      revisitChange,
      saveIntent: intent,
    },
  };

  const nextSeriesRecords = [...existingSeriesRecords];
  if (existingIndex >= 0) {
    nextSeriesRecords[existingIndex] = nextSeriesRecord;
  } else {
    nextSeriesRecords.push(nextSeriesRecord);
  }

  await projectRef.set(
    {
      series: nextSeriesRecords,
      seriesCount: nextSeriesRecords.length,
      updatedAt: now,
    },
    { merge: true },
  );

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/series/new`);

  if (intent === "draft") {
    redirect(`/projects/${encodeURIComponent(projectId)}/series/new?draft=${encodeURIComponent(seriesId)}`);
  }

  if (projectId === "iwami-station-poc") {
    redirect("/projects/iwami-station-poc/series-detail");
  }

  redirect(`/projects/${encodeURIComponent(projectId)}`);
}
