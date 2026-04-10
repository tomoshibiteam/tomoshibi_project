"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";

type SaveIntent = "draft" | "complete";
type ProjectStatus = "draft" | "previewable";
type ExistingProjectDoc = {
  slug?: unknown;
  createdAt?: unknown;
  consolePath?: unknown;
  ownerUid?: unknown;
  ownerEmail?: unknown;
  ownerName?: unknown;
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

function resolveIntent(rawIntent: string): SaveIntent {
  return rawIntent === "complete" ? "complete" : "draft";
}

function resolveStatus(intent: SaveIntent): ProjectStatus {
  return intent === "complete" ? "previewable" : "draft";
}

function toDescription(summary: string, challenges: string, background: string): string {
  if (summary) {
    return summary;
  }
  if (challenges) {
    return challenges;
  }
  if (background) {
    return background;
  }
  return "説明が未設定です。";
}

function toSlugBase(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "project";
}

function buildProjectId(name: string): string {
  const base = toSlugBase(name);
  return `${base}-${Date.now().toString(36)}`;
}

function readDraftIdFromReferer(referer: string | null): string {
  if (!referer) {
    return "";
  }

  try {
    const refererUrl = new URL(referer);
    return refererUrl.searchParams.get("draft")?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function saveNewProjectAction(formData: FormData): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) {
    throw new Error("Firebase Admin is not configured.");
  }

  const currentUser = await getRequestAuthUser();
  if (!currentUser) {
    throw new Error("ログイン情報を確認できないため保存できません。再ログインしてください。");
  }

  const intent = resolveIntent(readText(formData, "intent"));
  const status = resolveStatus(intent);

  const projectName = readText(formData, "projectName") || "名称未設定プロジェクト";
  const projectArea = readText(formData, "projectArea");
  const projectSummary = readText(formData, "projectSummary");
  const projectBackground = readText(formData, "projectBackground");
  const projectChallenges = readText(formData, "projectChallenges");
  const projectTypes = readAllText(formData, "projectTypes");
  const desiredChanges = parseListText(readText(formData, "desiredChangesText"));
  const priorityFocus = readAllText(formData, "priorityFocus");
  const targetSegments = parseListText(readText(formData, "targetSegmentsText"));
  const targetKnowledge = readText(formData, "targetKnowledge");
  const usageScenes = parseListText(readText(formData, "usageScenesText"));
  const transportModes = readAllText(formData, "transportModes");
  const returnConstraint = readText(formData, "returnConstraint");
  const requiredPerspectives = parseListText(readText(formData, "requiredPerspectives"));
  const avoidExpressions = readText(formData, "avoidExpressions");
  const projectConstraints = readText(formData, "projectConstraints");
  const validationGoals = readText(formData, "validationGoals");
  const validationOptions = readAllText(formData, "validationOptions");
  const projectStakeholders = parseListText(readText(formData, "projectStakeholders"));
  const refererDraftId = readDraftIdFromReferer((await headers()).get("referer"));
  const existingProjectId = readText(formData, "projectId") || refererDraftId;
  const goalMetrics = [1, 2, 3]
    .map((index) => ({
      variable: readText(formData, `goalVariable${index}`),
      indicator: readText(formData, `goalIndicator${index}`),
    }))
    .filter((item) => item.variable || item.indicator);
  const kpiDirections = goalMetrics
    .map((item) => [item.variable, item.indicator].filter(Boolean).join(" / "))
    .filter((item) => item.length > 0);

  const initialSeriesCount = 1;

  const projectId = existingProjectId || buildProjectId(projectName);
  const now = new Date();
  const projectRef = db.collection("projects").doc(projectId);
  let createdAt: unknown = now;
  let slug = projectId;
  let consolePath = status === "previewable" ? `/projects/${projectId}` : "#";
  let ownerUid = currentUser.uid;
  let ownerEmail = currentUser.email;
  let ownerName = currentUser.name;

  if (existingProjectId) {
    const currentSnapshot = await projectRef.get();
    if (currentSnapshot.exists) {
      const currentData = currentSnapshot.data() as ExistingProjectDoc;
      const existingOwnerUid = typeof currentData.ownerUid === "string" ? currentData.ownerUid.trim() : "";
      if (existingOwnerUid && existingOwnerUid !== currentUser.uid) {
        throw new Error("他のアカウントが所有するプロジェクトは更新できません。");
      }

      createdAt = currentData.createdAt ?? now;
      const existingSlug = currentData.slug;
      if (typeof existingSlug === "string" && existingSlug.trim().length > 0) {
        slug = existingSlug;
      }
      const existingConsolePath = currentData.consolePath;
      if (typeof existingConsolePath === "string" && existingConsolePath.trim().length > 0) {
        consolePath = existingConsolePath;
      }

      if (existingOwnerUid) {
        ownerUid = existingOwnerUid;
      }

      const existingOwnerEmail =
        typeof currentData.ownerEmail === "string" ? currentData.ownerEmail.trim() : "";
      if (existingOwnerEmail) {
        ownerEmail = existingOwnerEmail;
      }

      const existingOwnerName =
        typeof currentData.ownerName === "string" ? currentData.ownerName.trim() : "";
      if (existingOwnerName) {
        ownerName = existingOwnerName;
      }
    }
  }

  if (status === "previewable") {
    consolePath = `/projects/${projectId}`;
  }

  await projectRef.set({
    slug,
    consolePath,
    name: projectName,
    description: toDescription(projectSummary, projectChallenges, projectBackground),
    status,
    seriesCount: 0,
    spotCount: 0,
    updatedAt: now,
    createdAt,
    ownerUid,
    ownerEmail,
    ownerName,
    metadata: {
      startPlace: projectArea,
      summary: projectSummary,
      background: projectBackground,
      challenges: projectChallenges,
      projectTypes,
      desiredChanges,
      priorityFocus,
      targetSegments,
      targetKnowledge,
      usageScenes,
      transportModes,
      returnConstraint,
      requiredPerspectives,
      avoidExpressions,
      constraints: projectConstraints,
      validationGoals,
      validationOptions,
      goalMetrics,
      kpiDirections,
      stakeholders: projectStakeholders,
      initialSeriesCount,
      saveIntent: intent,
    },
  });

  revalidatePath("/");
  redirect("/");
}
