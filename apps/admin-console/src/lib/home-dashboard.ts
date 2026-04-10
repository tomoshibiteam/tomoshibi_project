import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "./firebase-admin";

export type ProjectStatus = "published" | "previewable" | "draft";

export type HomeProject = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  seriesCount: number;
  spotCount: number;
  updatedAtLabel: string;
  path: string;
};

export type HomeDashboardSource =
  | "firebase"
  | "firebase-empty"
  | "mock-config"
  | "mock-bootstrap"
  | "mock-error";

export type HomeDashboardData = {
  projects: HomeProject[];
  statusCounts: Record<ProjectStatus, number>;
  source: HomeDashboardSource;
};

type ProjectDoc = {
  name?: unknown;
  description?: unknown;
  slug?: unknown;
  consolePath?: unknown;
  status?: unknown;
  seriesCount?: unknown;
  spotCount?: unknown;
  series?: unknown;
  spots?: unknown;
  updatedAt?: unknown;
};

const FALLBACK_STATUS_COUNTS: Record<ProjectStatus, number> = {
  published: 2,
  previewable: 4,
  draft: 8,
};

const FALLBACK_PROJECTS: HomeProject[] = [
  {
    id: "iwami-station-poc",
    name: "岩美駅PoC",
    description: "鳥取県岩美町周辺でのデジタルスタンプラリーと地域回遊施策。",
    status: "draft",
    seriesCount: 4,
    spotCount: 12,
    updatedAtLabel: "2時間前更新",
    path: "/projects/iwami-station-poc",
  },
  {
    id: "kyushu-campus-guide",
    name: "九州大学新歓ガイダンス",
    description: "キャンパス内の歴史的スポットを巡るAR体験型ガイダンス。",
    status: "previewable",
    seriesCount: 2,
    spotCount: 8,
    updatedAtLabel: "昨日更新",
    path: "#",
  },
];

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function asArrayLength(value: unknown): number | null {
  return Array.isArray(value) ? value.length : null;
}

function normalizeStatus(value: unknown): ProjectStatus {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (
    raw === "published" ||
    raw === "public" ||
    raw === "live" ||
    raw === "公開" ||
    raw === "公開中"
  ) {
    return "published";
  }

  if (
    raw === "previewable" ||
    raw === "preview" ||
    raw === "review" ||
    raw === "設計中" ||
    raw === "プレビュー可能"
  ) {
    return "previewable";
  }

  return "draft";
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

function formatUpdatedAtLabel(date: Date | null): string {
  if (!date) {
    return "更新日未設定";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60_000) {
    return "たった今更新";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes}分前更新`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}時間前更新`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "昨日更新";
  }
  if (diffDays < 7) {
    return `${diffDays}日前更新`;
  }

  return `${date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })} 更新`;
}

function toConsolePath(slug: string, consolePath: string | null): string {
  if (consolePath) {
    return consolePath;
  }

  if (slug === "iwami-station-poc") {
    return "/projects/iwami-station-poc";
  }

  return "#";
}

function countByStatus(projects: HomeProject[]): Record<ProjectStatus, number> {
  return projects.reduce<Record<ProjectStatus, number>>(
    (acc, project) => {
      acc[project.status] += 1;
      return acc;
    },
    {
      published: 0,
      previewable: 0,
      draft: 0,
    },
  );
}

function emptyStatusCounts(): Record<ProjectStatus, number> {
  return {
    published: 0,
    previewable: 0,
    draft: 0,
  };
}

function fallbackData(source: "mock-config" | "mock-bootstrap" | "mock-error"): HomeDashboardData {
  return {
    projects: FALLBACK_PROJECTS,
    statusCounts: FALLBACK_STATUS_COUNTS,
    source,
  };
}

const BOOTSTRAP_RETRY_INTERVAL_MS = 60_000;
let nextBootstrapRetryAt = 0;

function normalizeFirestoreErrorCode(error: unknown): number | null {
  const rawCode = (error as { code?: unknown } | null)?.code;
  if (typeof rawCode === "number") {
    return rawCode;
  }
  if (typeof rawCode === "string") {
    const parsed = Number.parseInt(rawCode, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function isFirestoreBootstrapError(error: unknown): boolean {
  const code = normalizeFirestoreErrorCode(error);
  if (code === 5 || code === 7) {
    return true;
  }

  const message = String((error as { message?: unknown } | null)?.message ?? "")
    .toLowerCase();
  const details = String((error as { details?: unknown } | null)?.details ?? "")
    .toLowerCase();
  const reasonText = `${message} ${details}`;

  return (
    reasonText.includes("not_found") ||
    reasonText.includes("permission_denied") ||
    reasonText.includes("service_disabled") ||
    reasonText.includes("database") && reasonText.includes("does not exist")
  );
}

export async function getHomeDashboardData(viewerUid: string | null): Promise<HomeDashboardData> {
  if (!viewerUid) {
    return {
      projects: [],
      statusCounts: emptyStatusCounts(),
      source: "firebase-empty",
    };
  }

  if (Date.now() < nextBootstrapRetryAt) {
    return fallbackData("mock-bootstrap");
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return fallbackData("mock-config");
  }

  try {
    const snapshot = await db.collection("projects").where("ownerUid", "==", viewerUid).limit(50).get();

    if (snapshot.empty) {
      return {
        projects: [],
        statusCounts: emptyStatusCounts(),
        source: "firebase-empty",
      };
    }

    const projects = snapshot.docs
      .map((doc) => {
        const data = doc.data() as ProjectDoc;
        const slug = asString(data.slug) ?? doc.id;
        const updatedAt = toDate(data.updatedAt);

        const seriesCount =
          asNumber(data.seriesCount) ??
          asArrayLength(data.series) ??
          0;

        const spotCount =
          asNumber(data.spotCount) ??
          asArrayLength(data.spots) ??
          0;

        return {
          id: doc.id,
          name: asString(data.name) ?? slug,
          description: asString(data.description) ?? "説明が未設定です。",
          status: normalizeStatus(data.status),
          seriesCount,
          spotCount,
          updatedAt,
          updatedAtLabel: formatUpdatedAtLabel(updatedAt),
          path: toConsolePath(slug, asString(data.consolePath)),
        };
      })
      .sort((a, b) => {
        const timeA = a.updatedAt?.getTime() ?? 0;
        const timeB = b.updatedAt?.getTime() ?? 0;
        return timeB - timeA;
      })
      .map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        seriesCount: project.seriesCount,
        spotCount: project.spotCount,
        updatedAtLabel: project.updatedAtLabel,
        path: project.path,
      }));

    if (projects.length === 0) {
      return {
        projects: [],
        statusCounts: emptyStatusCounts(),
        source: "firebase-empty",
      };
    }

    return {
      projects,
      statusCounts: countByStatus(projects),
      source: "firebase",
    };
  } catch (error) {
    if (isFirestoreBootstrapError(error)) {
      nextBootstrapRetryAt = Date.now() + BOOTSTRAP_RETRY_INTERVAL_MS;
      return fallbackData("mock-bootstrap");
    }
    console.error("Failed to load home dashboard from Firestore", error);
    return fallbackData("mock-error");
  }
}
