import Link from "next/link";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";
import { HeaderAuthControls } from "../../_components/header-auth-controls";
import { MaterialIcon } from "../../_components/material-icon";
import { ProjectDetailMapPreview } from "./project-detail-map-preview";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

type ProjectStatus = "draft" | "previewable" | "published";

type GoalMetric = {
  variable: string;
  indicator: string;
};

type LatestSimulation = {
  scenario: string;
  successRate: number;
  issue: string;
  executedAt: Date | null;
};

type SpotMapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type ProjectDetail = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  area: string;
  summary: string;
  background: string;
  challenges: string;
  projectTypes: string[];
  desiredChanges: string[];
  targetSegments: string[];
  usageScenes: string[];
  requiredPerspectives: string[];
  validationOptions: string[];
  validationGoals: string;
  goalMetrics: GoalMetric[];
  kpiDirections: string[];
  transportModes: string[];
  returnConstraint: string;
  stakeholders: string[];
  seriesCount: number;
  spotCount: number;
  seriesSpotDbCount: number;
  episodeDbCount: number;
  projectSpotMarkers: SpotMapPoint[];
  seriesSpotMarkers: SpotMapPoint[];
  episodeSpotMarkers: SpotMapPoint[];
  updatedAt: Date | null;
  latestSimulation: LatestSimulation | null;
};

type ProjectLoadResult =
  | { ok: true; project: ProjectDetail }
  | { ok: false; reason: "no-db" | "unauthorized" | "not-found" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function asGoalMetrics(value: unknown): GoalMetric[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }
      const variable = asString(item.variable);
      const indicator = asString(item.indicator);
      if (!variable && !indicator) {
        return null;
      }
      return { variable, indicator };
    })
    .filter((item): item is GoalMetric => item !== null)
    .slice(0, 3);
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function asArrayLength(value: unknown): number | null {
  return Array.isArray(value) ? value.length : null;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is Record<string, unknown> => isRecord(item));
}

function flattenRecordArrays(values: unknown[]): Record<string, unknown>[] {
  return values.flatMap((value) => asRecordArray(value));
}

function sumCountsFromRecords(
  records: Record<string, unknown>[],
  numericKeys: string[],
  arrayKeys: string[],
): number {
  return records.reduce((total, record) => {
    for (const key of numericKeys) {
      const numericValue = asNumber(record[key]);
      if (numericValue !== null) {
        return total + numericValue;
      }
    }

    for (const key of arrayKeys) {
      const arrayLength = asArrayLength(record[key]);
      if (arrayLength !== null) {
        return total + arrayLength;
      }
    }

    return total;
  }, 0);
}

function extractLatLng(record: Record<string, unknown>): { lat: number; lng: number } | null {
  const latLngKeys: Array<[string, string]> = [
    ["lat", "lng"],
    ["latitude", "longitude"],
  ];

  for (const [latKey, lngKey] of latLngKeys) {
    const lat = toNumber(record[latKey]);
    const lng = toNumber(record[lngKey]);
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
  }

  const nestedCandidates = [
    record.location,
    record.coordinate,
    record.coordinates,
    record.position,
    record.geo,
    record.latLng,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate) && candidate.length >= 2) {
      const lat = toNumber(candidate[0]);
      const lng = toNumber(candidate[1]);
      if (lat !== null && lng !== null) {
        return { lat, lng };
      }
      continue;
    }

    if (!isRecord(candidate)) {
      continue;
    }

    for (const [latKey, lngKey] of latLngKeys) {
      const lat = toNumber(candidate[latKey]);
      const lng = toNumber(candidate[lngKey]);
      if (lat !== null && lng !== null) {
        return { lat, lng };
      }
    }
  }

  return null;
}

function collectSpotMapPoints(
  records: Record<string, unknown>[],
  prefix: string,
): SpotMapPoint[] {
  return records
    .map((record, index) => {
      const latLng = extractLatLng(record);
      if (!latLng) {
        return null;
      }

      const id =
        asString(record.id ?? record.spotId ?? record.slug ?? record.uid) ||
        `${prefix}-${index + 1}`;
      const name =
        asString(record.name ?? record.title ?? record.spotName ?? record.label) ||
        `スポット ${index + 1}`;

      return {
        id: `${prefix}-${id}`,
        name,
        lat: latLng.lat,
        lng: latLng.lng,
      };
    })
    .filter((item): item is SpotMapPoint => item !== null);
}

function uniqueSpotMapPoints(points: SpotMapPoint[]): SpotMapPoint[] {
  const seen = new Set<string>();
  const result: SpotMapPoint[] = [];

  for (const point of points) {
    const key = `${point.lat.toFixed(6)}:${point.lng.toFixed(6)}:${point.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(point);
  }

  return result;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (isRecord(value) && typeof value.toDate === "function") {
    const date = value.toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function asLatestSimulation(value: unknown): LatestSimulation | null {
  if (!isRecord(value)) {
    return null;
  }

  const scenario = asString(
    value.scenario ??
      value.scenarioLabel ??
      value.conditionSet ??
      value.title,
  );
  const rawSuccessRate = asNumber(
    value.successRate ?? value.passRate ?? value.feasibilityRate,
  );
  const successRate =
    rawSuccessRate === null
      ? 0
      : Math.max(0, Math.min(100, Math.round(rawSuccessRate)));
  const issue = asString(value.issue ?? value.problem ?? value.challenge);
  const executedAt = toDate(value.executedAt ?? value.updatedAt ?? value.createdAt);

  if (!scenario && !issue && rawSuccessRate === null) {
    return null;
  }

  return {
    scenario: scenario || "シナリオ名未設定",
    successRate,
    issue: issue || "課題メモ未設定",
    executedAt,
  };
}

function normalizeStatus(value: unknown): ProjectStatus {
  const raw = asString(value).toLowerCase();

  if (["published", "public", "live", "公開", "公開中"].includes(raw)) {
    return "published";
  }

  if (["previewable", "preview", "review", "プレビュー可能", "設計中"].includes(raw)) {
    return "previewable";
  }

  return "draft";
}

function toStatusLabel(status: ProjectStatus): string {
  if (status === "published") {
    return "公開中";
  }
  if (status === "previewable") {
    return "作成完了";
  }
  return "下書き中";
}

function toStatusClass(status: ProjectStatus): string {
  if (status === "published") {
    return "border-sage/20 bg-sage/10 text-sage";
  }
  if (status === "previewable") {
    return "border-ochre/20 bg-ochre/10 text-ochre";
  }
  return "border-terracotta/20 bg-terracotta/10 text-terracotta";
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

function formatDateTime(date: Date | null): string {
  if (!date) {
    return "更新日時未設定";
  }

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadProject(projectId: string): Promise<ProjectLoadResult> {
  const viewer = await getRequestAuthUser();
  if (!viewer) {
    return {
      ok: false,
      reason: "unauthorized",
    };
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return {
      ok: false,
      reason: "no-db",
    };
  }

  try {
    const snapshot = await db.collection("projects").doc(projectId).get();
    if (!snapshot.exists) {
      return {
        ok: false,
        reason: "not-found",
      };
    }

    const data = snapshot.data() as Record<string, unknown>;
    const ownerUid = asString(data.ownerUid);
    if (!ownerUid || ownerUid !== viewer.uid) {
      return {
        ok: false,
        reason: "unauthorized",
      };
    }

    const metadata = isRecord(data.metadata) ? data.metadata : {};
    const goalMetrics = asGoalMetrics(metadata.goalMetrics);
    const latestSimulation = asLatestSimulation(
      metadata.latestSimulation ??
        metadata.latestPreview ??
        metadata.simulationResult ??
        metadata.previewResult,
    );

    const seriesCount = asNumber(data.seriesCount) ?? asArrayLength(data.series) ?? 0;
    const spotCount = asNumber(data.spotCount) ?? asArrayLength(data.spots) ?? 0;
    const seriesRecords = asRecordArray(data.series);
    const metadataSpotRecords = flattenRecordArrays([
      metadata.spots,
      metadata.spotDb,
      metadata.spotRecords,
      metadata.projectSpots,
      metadata.projectSpotDb,
      metadata.projectSpotRecords,
    ]);
    const projectSpotRecords = flattenRecordArrays([
      data.spots,
      data.spotDb,
      data.spotRecords,
      data.projectSpots,
      data.projectSpotDb,
      metadataSpotRecords,
    ]);

    const seriesSpotRecords = uniqueSpotMapPoints(
      collectSpotMapPoints(
        [
          ...flattenRecordArrays([
            data.seriesSpots,
            data.seriesSpotDb,
            data.seriesSpotRecords,
            metadata.seriesSpots,
            metadata.seriesSpotDb,
            metadata.seriesSpotRecords,
          ]),
          ...seriesRecords.flatMap((series) =>
            flattenRecordArrays([
              series.spots,
              series.spotDb,
              series.spotRecords,
              series.linkedSpots,
            ]),
          ),
        ],
        "series",
      ),
    );

    const topLevelEpisodeRecords = flattenRecordArrays([
      data.episodes,
      data.episodeDb,
      data.episodeRecords,
    ]);
    const seriesEpisodeRecords = seriesRecords.flatMap((series) =>
      flattenRecordArrays([series.episodes, series.episodeDb, series.episodeRecords]),
    );
    const episodeSpotRecords = flattenRecordArrays([
      metadata.episodeSpots,
      metadata.episodeSpotDb,
      metadata.episodeSpotRecords,
      data.episodeSpots,
      data.episodeSpotDb,
      data.episodeSpotRecords,
      ...topLevelEpisodeRecords.flatMap((episode) =>
        flattenRecordArrays([episode.spots, episode.spotDb, episode.spotRecords]),
      ),
      ...seriesEpisodeRecords.flatMap((episode) =>
        flattenRecordArrays([episode.spots, episode.spotDb, episode.spotRecords]),
      ),
    ]);
    const projectSpotMarkers = uniqueSpotMapPoints(
      collectSpotMapPoints(projectSpotRecords, "project"),
    );
    const episodeSpotMarkers = uniqueSpotMapPoints(
      collectSpotMapPoints(episodeSpotRecords, "episode"),
    );

    const inferredSeriesSpotDbCount = sumCountsFromRecords(
      seriesRecords,
      ["spotDbCount", "spotCount", "spotsCount"],
      ["spots", "spotIds", "spotRefs", "linkedSpots"],
    );
    const seriesSpotDbCount =
      asNumber(metadata.seriesSpotDbCount ?? metadata.seriesSpotCount) ??
      (inferredSeriesSpotDbCount > 0 ? inferredSeriesSpotDbCount : spotCount);

    const inferredEpisodeDbCount = sumCountsFromRecords(
      seriesRecords,
      ["episodeDbCount", "episodeCount", "episodesCount"],
      ["episodes", "episodeIds", "episodeRefs", "linkedEpisodes"],
    );
    const episodeDbCount =
      asNumber(metadata.episodeDbCount ?? metadata.episodeCount ?? metadata.episodesCount) ??
      asNumber(data.episodeDbCount ?? data.episodeCount ?? data.episodesCount) ??
      asArrayLength(data.episodes) ??
      inferredEpisodeDbCount;

    const project: ProjectDetail = {
      id: snapshot.id,
      name: asString(data.name) || snapshot.id,
      description: asString(data.description) || "説明が未設定です。",
      status: normalizeStatus(data.status),
      area: asString(metadata.startPlace),
      summary: asString(metadata.summary),
      background: asString(metadata.background),
      challenges: asString(metadata.challenges),
      projectTypes: asStringArray(metadata.projectTypes),
      desiredChanges: asStringArray(metadata.desiredChanges),
      targetSegments: asStringArray(metadata.targetSegments),
      usageScenes: asStringArray(metadata.usageScenes),
      requiredPerspectives: asStringArray(metadata.requiredPerspectives),
      validationOptions: asStringArray(metadata.validationOptions),
      validationGoals: asString(metadata.validationGoals),
      goalMetrics,
      kpiDirections: asStringArray(metadata.kpiDirections),
      transportModes: asStringArray(metadata.transportModes),
      returnConstraint: asString(metadata.returnConstraint),
      stakeholders: asStringArray(metadata.stakeholders),
      seriesCount,
      spotCount,
      seriesSpotDbCount,
      episodeDbCount,
      projectSpotMarkers,
      seriesSpotMarkers: seriesSpotRecords,
      episodeSpotMarkers,
      updatedAt: toDate(data.updatedAt),
      latestSimulation,
    };

    return {
      ok: true,
      project,
    };
  } catch (error) {
    console.error("Failed to load project detail", error);
    return {
      ok: false,
      reason: "error",
    };
  }
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-8 py-10">
      <div className="ui-card p-6">
        <h1 className="font-headline text-xl font-extrabold text-charcoal">{title}</h1>
        <p className="mt-3 text-sm font-medium text-charcoal/70">{body}</p>
        <Link
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-terracotta hover:underline"
          href="/"
        >
          <MaterialIcon className="text-sm" name="arrow_back" />
          制作ホームへ戻る
        </Link>
      </div>
    </main>
  );
}

function PillList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2 py-0.5 text-[10px] font-bold text-charcoal/40">
        {emptyLabel}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded border border-charcoal/10 bg-white px-2 py-0.5 text-[10px] font-bold text-charcoal/60"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const result = await loadProject(projectId);

  if (!result.ok) {
    if (result.reason === "no-db") {
      return (
        <EmptyState
          title="Firebase Admin が未設定です"
          body="プロジェクト詳細を表示するために Firebase Admin の設定が必要です。"
        />
      );
    }

    if (result.reason === "not-found") {
      return (
        <EmptyState
          title="プロジェクトが見つかりません"
          body={`指定されたプロジェクト（${projectId}）は存在しないか削除されています。`}
        />
      );
    }

    if (result.reason === "unauthorized") {
      return (
        <EmptyState
          title="このプロジェクトにはアクセスできません"
          body="ログインアカウントに紐づくプロジェクトのみ表示できます。"
        />
      );
    }

    return (
      <EmptyState
        title="プロジェクトの読み込みに失敗しました"
        body="しばらくしてから再試行してください。"
      />
    );
  }

  const project = result.project;

  const projectName = project.name;
  const objectiveText = project.summary || project.description;
  const targetScenes = unique([...project.usageScenes, ...project.targetSegments]).slice(0, 6);
  const verificationPoints = unique([
    ...project.requiredPerspectives,
    ...project.validationOptions,
  ]).slice(0, 6);

  const successMetrics = unique([
    ...project.goalMetrics.map((metric) => {
      const label = [metric.variable, metric.indicator].filter(Boolean).join(" / ");
      return label;
    }),
    ...project.kpiDirections,
  ]).slice(0, 3);

  const hasSimulationResult = project.latestSimulation !== null;

  const hasIwamiToolRoutes = project.id === "iwami-station-poc";
  const editHref = `/projects/new?draft=${encodeURIComponent(project.id)}`;
  const seriesAddHref = `/projects/${encodeURIComponent(project.id)}/series/new`;
  const spotDbHref = hasIwamiToolRoutes ? "/projects/iwami-station-poc/spots" : "#spotdb-summary";
  const seriesDetailHref = hasIwamiToolRoutes ? "/projects/iwami-station-poc/series-detail" : editHref;
  const spotManagementHref = hasIwamiToolRoutes ? "/projects/iwami-station-poc/spots" : editHref;

  return (
    <>
      <aside className="fixed top-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-charcoal/10 bg-white/50 p-4">
        <div className="mb-2 flex items-center gap-3 px-2 py-6">
          <div className="sketch-border flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm">
            <MaterialIcon className="text-[20px]" name="auto_awesome" />
          </div>
          <div>
            <h1 className="font-headline text-lg leading-tight font-bold tracking-tight text-charcoal">
              TOMOSHIBI
              <br />
              <span className="text-sm font-medium">Studio</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="/"
          >
            <MaterialIcon className="text-[20px]" name="home" />
            <span className="text-sm font-medium">制作ホーム</span>
          </Link>

          <div className="nav-group-label">コンテンツ管理</div>

          <Link
            className="sidebar-item-active flex items-center gap-3 px-4 py-2.5 transition-all"
            href={`/projects/${encodeURIComponent(project.id)}`}
          >
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </Link>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#spotdb-summary"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </a>
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#connected-series"
            >
              <MaterialIcon className="text-[18px]" name="auto_stories" />
              <span className="text-sm">シリーズ</span>
            </a>
          </div>

          <div className="nav-group-label">検証・運用</div>

          {hasSimulationResult ? (
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#latest-preview"
            >
              <MaterialIcon className="text-[20px]" name="visibility" />
              <span className="text-sm font-medium">AIプレビュー</span>
            </a>
          ) : null}
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="terminal" />
            <span className="text-sm font-medium">実行ログ</span>
          </a>

          <div className="nav-group-label">設定</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="settings" />
            <span className="text-sm font-medium">設定</span>
          </a>
        </nav>

        <div className="mt-auto border-t border-charcoal/10 pt-4">
          <a
            className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-charcoal/50 transition-colors hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-sm" name="help_outline" />
            <span>サポート</span>
          </a>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <MaterialIcon className="text-terracotta" name="hub" />
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">
              実務ハブ: {projectName}
            </h2>
            <div
              className={`rounded border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${toStatusClass(project.status)}`}
            >
              {toStatusLabel(project.status)}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <input
                className="w-64 rounded-full border-none bg-charcoal/5 py-1.5 pr-4 pl-10 text-sm placeholder-charcoal/30 focus:ring-1 focus:ring-terracotta"
                placeholder="コンテンツを検索..."
                type="text"
              />
              <MaterialIcon
                className="absolute top-1/2 left-3 -translate-y-1/2 text-lg text-charcoal/40"
                name="search"
              />
            </div>
            <HeaderAuthControls />
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-8">
          <div className="ui-card border-b-4 border-b-terracotta p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-sage/20 bg-sage/15 px-3 py-1 text-xs font-bold text-sage">
                    {project.area || "対象地域未設定"}
                  </span>
                  <span className="rounded-full border border-charcoal/10 bg-charcoal/5 px-3 py-1 text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">
                    PJ ID: {project.id}
                  </span>
                </div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-charcoal">
                  {projectName}
                </h1>
                <p className="leading-relaxed font-medium text-charcoal/70">
                  {project.description}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto">
                <Link
                  className="sketch-border flex items-center justify-center gap-3 rounded-lg bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110"
                  href={spotDbHref}
                >
                  <MaterialIcon name="map" />
                  案件全体のスポットDBへ
                </Link>
                <div className="flex gap-2">
                  <Link
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-charcoal/20 bg-white px-4 py-2 text-xs font-bold text-charcoal transition-all hover:bg-charcoal/5"
                    href={editHref}
                    prefetch={false}
                  >
                    <MaterialIcon className="text-[18px]" name="settings" />
                    プロジェクト設定
                  </Link>
                  <button className="flex items-center justify-center rounded-lg border border-ochre/20 bg-ochre/10 px-4 py-2 text-xs font-bold text-ochre transition-all hover:bg-ochre/20">
                    <MaterialIcon name="share" />
                  </button>
                </div>
              </div>
            </div>

            <details className="mt-6 rounded-xl border border-charcoal/10 bg-paper/40 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="font-headline flex items-center gap-2 text-base font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="flag" />
                  案件目的と検証観点
                </span>
                <span className="rounded border border-charcoal/10 bg-white px-2 py-1 text-[10px] font-bold text-charcoal/60">
                  詳細を開く
                </span>
              </summary>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-charcoal/5 bg-paper/50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                    <span className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      案件の目的
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed font-bold text-charcoal">
                    {objectiveText || "目的が未設定です。"}
                  </p>
                  <div className="pt-2">
                    <span className="mb-2 block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      想定シーン
                    </span>
                    <PillList items={targetScenes} emptyLabel="想定シーン未設定" />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-charcoal/5 bg-paper/50 p-5">
                  <div className="flex items-center gap-2 text-sage">
                    <MaterialIcon className="text-sm" name="check_circle" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase">
                      検証ポイント
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {(verificationPoints.length > 0
                      ? verificationPoints
                      : ["検証観点がまだ登録されていません。"]
                    ).map((point) => (
                      <li key={point} className="flex items-start gap-2 text-[11px] font-bold text-charcoal">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sage" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-charcoal/5 pt-2">
                    <span className="mb-1 block text-[10px] font-extrabold tracking-widest text-ochre uppercase">
                      成功指標
                    </span>
                    {successMetrics.length > 0 ? (
                      <ul className="space-y-1">
                        {successMetrics.map((metric) => (
                          <li
                            key={metric}
                            className="text-sm leading-relaxed font-bold text-charcoal"
                          >
                            {metric}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-bold text-charcoal/40">成功指標未設定</p>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="ui-card p-6 md:col-span-8" id="connected-series">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline flex items-center gap-2 text-xl font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="subscriptions" />
                    紐づくシリーズ
                    <span className="ml-2 rounded-full bg-charcoal/5 px-2.5 py-0.5 text-xs font-bold text-charcoal/40">
                      {project.seriesCount}件
                    </span>
                  </h3>
                </div>
                <Link
                  className="sketch-border flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110"
                  href={seriesAddHref}
                  prefetch={false}
                >
                  <MaterialIcon className="text-[18px]" name="add" />
                  シリーズを追加
                </Link>
              </div>

              {project.seriesCount === 0 ? (
                <div className="rounded-xl border border-charcoal/10 bg-paper/40 p-6">
                  <p className="text-sm font-bold text-charcoal">まだシリーズは作成されていません。</p>
                  <p className="mt-1 text-xs font-medium text-charcoal/60">
                    シリーズ作成後に、ここへ一覧を表示します。
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-charcoal/10 bg-paper/40 p-6">
                  <p className="text-sm font-bold text-charcoal">
                    登録済みシリーズ: {project.seriesCount}件
                  </p>
                  <p className="mt-1 text-xs font-medium text-charcoal/60">
                    シリーズ詳細一覧の表示は現在バックエンド連携中です。
                  </p>
                  <div className="mt-4">
                    <Link
                      className="inline-flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-terracotta/20 hover:bg-terracotta/5 hover:text-terracotta"
                      href={seriesDetailHref}
                      prefetch={false}
                    >
                      <MaterialIcon className="text-[16px]" name="edit" />
                      シリーズ編集
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="ui-card p-6 md:col-span-4">
              <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                <MaterialIcon className="text-terracotta" name="analytics" />
                プロジェクト件数サマリー
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-charcoal/10 bg-paper/50 p-5">
                  <span className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                    シリーズ数
                  </span>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-extrabold text-charcoal">{project.seriesCount}</span>
                    <span className="text-xs font-bold text-charcoal/50">件</span>
                  </div>
                </div>
                <div className="rounded-xl border border-charcoal/10 bg-paper/50 p-5">
                  <span className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                    スポット数
                  </span>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-extrabold text-charcoal">{project.spotCount}</span>
                    <span className="text-xs font-bold text-charcoal/50">件</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ui-card p-6 md:col-span-12" id="spotdb-summary">
              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h3 className="font-headline flex items-center gap-2 text-lg font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="map" />
                    起点マップ / スポットDBサマリー
                  </h3>
                  <p className="mt-1 text-xs font-medium text-charcoal/60">
                    {project.area || "対象地域未設定"}
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-terracotta/20 hover:bg-terracotta/5 hover:text-terracotta"
                  href={spotManagementHref}
                  prefetch={false}
                >
                  <MaterialIcon className="text-[16px]" name="database" />
                  スポット管理へ
                </Link>
              </div>

              <div className="mt-4">
                <ProjectDetailMapPreview
                  area={project.area}
                  projectMarkers={project.projectSpotMarkers}
                  seriesMarkers={project.seriesSpotMarkers}
                  episodeMarkers={project.episodeSpotMarkers}
                />
              </div>

            </div>

            {hasSimulationResult ? (
              <div
                className="sketch-border relative flex flex-col justify-between overflow-hidden rounded-xl bg-charcoal p-6 text-white md:col-span-6"
                id="latest-preview"
              >
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <MaterialIcon className="text-[120px]" name="analytics" />
                </div>

                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="font-headline text-[10px] font-extrabold tracking-widest text-white/40 uppercase">
                      最新シミュレーション結果
                    </h3>
                    <span className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/60">
                      {formatDateTime(project.latestSimulation?.executedAt ?? project.updatedAt)}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-extrabold text-white/40">検証シナリオ</span>
                        <span className="text-sm font-bold">{project.latestSimulation?.scenario}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-extrabold text-white/40">成立率</span>
                        <span className="text-3xl font-extrabold text-ochre">
                          {project.latestSimulation?.successRate ?? 0}%
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <span className="mb-2 block text-[10px] font-extrabold tracking-widest text-red-400 uppercase">
                        発生している課題
                      </span>
                      <p className="text-sm leading-relaxed font-bold text-red-100">
                        {project.latestSimulation?.issue || "課題メモ未設定"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link
                    className="flex flex-1 items-center justify-center rounded-lg border border-white/10 bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20"
                    href={editHref}
                    prefetch={false}
                  >
                    詳細を編集
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="ml-64 flex items-center justify-between border-t border-charcoal/10 px-8 py-10 text-[10px] font-bold tracking-widest text-charcoal/40 italic uppercase">
        <div>
          © 2024 TOMOSHIBI Studio. <span className="hand-drawn-underline">Illuminated by Local Stories.</span>
        </div>
        <div className="flex gap-6 opacity-30">
          <MaterialIcon className="text-sm" name="temple_shinto" />
          <MaterialIcon className="text-sm" name="waves" />
          <MaterialIcon className="text-sm" name="landscape" />
        </div>
      </footer>
    </>
  );
}
