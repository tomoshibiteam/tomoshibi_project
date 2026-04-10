import Link from "next/link";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";
import { HeaderAuthControls } from "../../../../_components/header-auth-controls";
import { MaterialIcon } from "../../../../_components/material-icon";
import { saveNewSeriesAction } from "./actions";
import { SeriesExternalAiPromptDrawer } from "./series-external-ai-prompt-drawer";

export const dynamic = "force-dynamic";

type NewSeriesPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?:
    | {
        draft?: string | string[];
      }
    | Promise<{
        draft?: string | string[];
      }>;
};

type ParentProjectContext = {
  name: string;
  area: string;
  target: string;
  purpose: string;
  kpi: string;
};

type SeriesDraftInitialValues = {
  id: string;
  name: string;
  oneLine: string;
  role: string;
  participantGoal: string;
  participantRole: string;
  guideRole: string;
  continuousPurpose: string;
  episodeCompletionUnit: string;
  tones: string[];
  topics: string[];
  expressionModes: string[];
  modeRule: string;
  requiredPoints: string[];
  avoidRules: string[];
  factDirectionScore: number;
  factDirectionNote: string;
  continuity: string;
  revisitChange: string;
};

type SeriesPageData = {
  parentProject: ParentProjectContext;
  draft: SeriesDraftInitialValues | null;
};

const SERIES_TONE_OPTIONS = [
  "落ち着いた発見型",
  "小さな謎解き型",
  "学術的・アカデミック",
  "情緒的・詩的",
  "活気ある交流型",
  "神秘的・ファンタジー",
];

const SERIES_TOPIC_OPTIONS = [
  "歴史・文化",
  "自然・景観",
  "食・グルメ",
  "建築・街並み",
  "産業・仕事",
  "暮らし・日常",
];

const EXPRESSION_MODE_OPTIONS = [
  "発見型",
  "調査型",
  "小さな謎解き型",
  "インタビュー形式",
  "独白形式",
];

const DEFAULT_TONES = ["落ち着いた発見型", "学術的・アカデミック"];
const DEFAULT_TOPICS = ["歴史・文化", "自然・景観", "食・グルメ"];
const DEFAULT_EXPRESSION_MODES = ["発見型", "調査型"];

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is Record<string, unknown> => isRecord(item));
}

function joinLines(values: string[]): string {
  return values.join("\n");
}

function toDraftInitialValues(record: Record<string, unknown>): SeriesDraftInitialValues | null {
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  const metadata = isRecord(record.metadata) ? record.metadata : {};
  const scoreValue =
    typeof metadata.factDirectionScore === "number"
      ? metadata.factDirectionScore
      : Number.parseFloat(asString(metadata.factDirectionScore));

  return {
    id,
    name: asString(record.name),
    oneLine: asString(metadata.oneLine),
    role: asString(metadata.role),
    participantGoal: asString(metadata.participantGoal),
    participantRole: asString(metadata.participantRole),
    guideRole: asString(metadata.guideRole),
    continuousPurpose: asString(metadata.continuousPurpose),
    episodeCompletionUnit: asString(metadata.episodeCompletionUnit),
    tones: asStringArray(metadata.tones),
    topics: asStringArray(metadata.topics),
    expressionModes: asStringArray(metadata.expressionModes),
    modeRule: asString(metadata.modeRule),
    requiredPoints: asStringArray(metadata.requiredPoints),
    avoidRules: asStringArray(metadata.avoidRules),
    factDirectionScore: Math.max(
      0,
      Math.min(100, Math.round(Number.isFinite(scoreValue) ? scoreValue : 30)),
    ),
    factDirectionNote: asString(metadata.factDirectionNote),
    continuity: asString(metadata.continuity),
    revisitChange: asString(metadata.revisitChange),
  };
}

async function loadSeriesPageData(
  projectId: string,
  draftId: string | null,
): Promise<SeriesPageData> {
  const fallbackParent: ParentProjectContext = {
    name: projectId,
    area: "対象エリア未設定",
    target: "想定対象未設定",
    purpose: "目的未設定",
    kpi: "重視KPI未設定",
  };

  const viewer = await getRequestAuthUser();
  if (!viewer) {
    return {
      parentProject: fallbackParent,
      draft: null,
    };
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return {
      parentProject: fallbackParent,
      draft: null,
    };
  }

  try {
    const snapshot = await db.collection("projects").doc(projectId).get();
    if (!snapshot.exists) {
      return {
        parentProject: fallbackParent,
        draft: null,
      };
    }

    const data = snapshot.data() as Record<string, unknown>;
    const ownerUid = asString(data.ownerUid);
    if (!ownerUid || ownerUid !== viewer.uid) {
      return {
        parentProject: fallbackParent,
        draft: null,
      };
    }

    const metadata = isRecord(data.metadata) ? data.metadata : {};
    const targetSegments = asStringArray(metadata.targetSegments);
    const purpose = asString(metadata.summary) || asString(data.description);
    const kpiDirections = asStringArray(metadata.kpiDirections);
    const firstGoalMetric =
      Array.isArray(metadata.goalMetrics) && metadata.goalMetrics.length > 0
        ? metadata.goalMetrics[0]
        : null;
    const firstGoalMetricLabel = isRecord(firstGoalMetric)
      ? [asString(firstGoalMetric.variable), asString(firstGoalMetric.indicator)]
          .filter(Boolean)
          .join(" / ")
      : "";

    const parentProject: ParentProjectContext = {
      name: asString(data.name) || fallbackParent.name,
      area: asString(metadata.startPlace) || fallbackParent.area,
      target: targetSegments.slice(0, 2).join("・") || fallbackParent.target,
      purpose: purpose || fallbackParent.purpose,
      kpi: kpiDirections[0] || firstGoalMetricLabel || fallbackParent.kpi,
    };

    let draft: SeriesDraftInitialValues | null = null;
    if (draftId) {
      const seriesRecords = asRecordArray(data.series);
      const matchedSeries = seriesRecords.find((series) => asString(series.id) === draftId);
      if (matchedSeries) {
        draft = toDraftInitialValues(matchedSeries);
      }
    }

    return {
      parentProject,
      draft,
    };
  } catch {
    return {
      parentProject: fallbackParent,
      draft: null,
    };
  }
}

export default async function NewSeriesPage({ params, searchParams }: NewSeriesPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  const rawDraftParam = Array.isArray(resolvedSearchParams?.draft)
    ? resolvedSearchParams.draft[0]
    : resolvedSearchParams?.draft;
  const draftParam = rawDraftParam?.trim() ?? "";

  const pageData = await loadSeriesPageData(projectId, draftParam || null);
  const parentProject = pageData.parentProject;
  const draftInitialValues = pageData.draft;
  const editingSeriesId = draftInitialValues?.id ?? "";
  const formRenderKey = editingSeriesId || "new-series";
  const draftLoadFailed = Boolean(draftParam) && !draftInitialValues;
  const projectContextBlock = [
    `- プロジェクト名: ${parentProject.name}`,
    `- 対象エリア: ${parentProject.area}`,
    `- 想定対象: ${parentProject.target}`,
    `- 目的: ${parentProject.purpose}`,
    `- 重視KPI: ${parentProject.kpi}`,
  ].join("\n");

  const projectHref = `/projects/${encodeURIComponent(projectId)}`;

  return (
    <>
      <aside className="fixed top-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-charcoal/10 bg-white/50 p-4">
        <div className="mb-2 flex items-center gap-3 px-2 py-6">
          <div className="sketch-border flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm">
            <MaterialIcon name="auto_awesome" />
          </div>
          <div>
            <h1 className="font-headline text-lg leading-tight font-bold tracking-tight text-charcoal">
              TOMOSHIBI
              <br />
              <span className="text-sm font-medium">スタジオ</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="/"
          >
            <MaterialIcon className="text-[20px]" name="home" />
            <span className="text-sm">制作ホーム</span>
          </Link>

          <div className="nav-group-label">コンテンツ管理</div>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href={projectHref}
          >
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </Link>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </a>
            <a className="sidebar-item-active flex items-center gap-3 px-4 py-2 transition-all" href="#">
              <MaterialIcon className="text-[18px]" name="auto_stories" />
              <span className="text-sm">シリーズ</span>
            </a>
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon className="text-[18px]" name="history_edu" />
              <span className="text-sm">エピソード</span>
            </a>
          </div>

          <div className="nav-group-label">検証・運用</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="visibility" />
            <span className="text-sm">AIプレビュー</span>
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="terminal" />
            <span className="text-sm">実行ログ</span>
          </a>

          <div className="nav-group-label">設定</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="settings" />
            <span className="text-sm">設定</span>
          </a>
        </nav>

        <div className="mt-auto space-y-1 border-t border-charcoal/10 pt-4">
          <a
            className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-charcoal/50 transition-colors hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-sm" name="help_outline" />
            <span>サポート</span>
          </a>
        </div>
      </aside>

      <main className="ml-64 min-h-screen pb-28">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link className="flex items-center text-charcoal/40 transition-colors hover:text-terracotta" href={projectHref}>
              <MaterialIcon className="text-sm" name="arrow_back" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal/40">
              <span>シリーズ</span>
              <MaterialIcon className="text-sm" name="chevron_right" />
            </div>
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">新規作成</h2>
            <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-ochre uppercase">
              下書き
            </span>
          </div>

          <HeaderAuthControls />
        </header>

        <form action={saveNewSeriesAction} key={formRenderKey}>
          <input name="projectId" type="hidden" value={projectId} />
          {editingSeriesId ? <input name="seriesId" type="hidden" value={editingSeriesId} /> : null}

          <div className="mx-auto max-w-7xl space-y-8 p-8">
            {draftLoadFailed ? (
              <section className="ui-card border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-700">
                  指定されたシリーズ下書きが見つからないか、アクセス権がありません。
                </p>
                <p className="mt-1 text-xs text-red-600">
                  URLの `draft` パラメータ（{draftParam}）を確認してください。
                </p>
              </section>
            ) : null}

            <section className="ui-card border-b-4 border-b-terracotta p-8">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-3xl space-y-3">
                  <div className="flex items-center gap-2 text-charcoal/40">
                    <MaterialIcon className="text-base" name="auto_stories" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase">Series Setup</span>
                  </div>
                  <h1 className="font-headline text-3xl font-extrabold tracking-tight text-charcoal">
                    {editingSeriesId ? "下書きシリーズを編集する" : "シリーズの基本設計を登録する"}
                  </h1>
                  <p className="text-sm leading-relaxed font-medium text-charcoal/70">
                    プロジェクト詳細と同じ情報設計で、シリーズ名・世界観・固定要素・継続ルールを定義します。
                  </p>
                  {editingSeriesId ? (
                    <p className="inline-flex rounded-md border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-mono text-charcoal/70">
                      Series ID: {editingSeriesId}
                    </p>
                  ) : null}
                </div>

                <div className="w-full md:w-auto">
                  <SeriesExternalAiPromptDrawer projectContextBlock={projectContextBlock} />
                </div>
              </div>
            </section>

            <div className="space-y-10">
              <section className="sketch-border relative overflow-hidden rounded-xl bg-ochre/10 p-6">
                <div className="absolute top-4 right-4 text-ochre/20">
                  <MaterialIcon className="text-6xl" name="account_tree" />
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <MaterialIcon className="text-sm text-ochre" name="link" />
                  <span className="text-[10px] font-black tracking-widest text-ochre uppercase">
                    親プロジェクト前提
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div>
                    <div className="mb-1 text-[9px] font-black tracking-widest text-charcoal/40 uppercase">
                      プロジェクト名
                    </div>
                    <div className="text-xs font-bold text-charcoal">{parentProject.name}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black tracking-widest text-charcoal/40 uppercase">
                      対象エリア
                    </div>
                    <div className="text-xs font-bold text-charcoal">{parentProject.area}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black tracking-widest text-charcoal/40 uppercase">
                      想定対象
                    </div>
                    <div className="text-xs font-bold text-charcoal">{parentProject.target}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black tracking-widest text-charcoal/40 uppercase">
                      目的
                    </div>
                    <div className="text-xs font-bold text-charcoal">{parentProject.purpose}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black tracking-widest text-charcoal/40 uppercase">
                      重視KPI
                    </div>
                    <div className="text-xs font-bold text-charcoal">{parentProject.kpi}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-charcoal/50 italic">
                  <MaterialIcon className="text-[12px]" name="info" />
                  このシリーズは、上記プロジェクト前提を引き継いで設計されます
                </div>
              </section>

              <section className="flex gap-4 rounded border-l-4 border-terracotta bg-terracotta/5 p-4">
                <MaterialIcon className="text-terracotta" name="lightbulb" />
                <p className="text-xs leading-relaxed font-bold text-charcoal/80">
                  この画面では、特定スポットや当日ルートではなく、シリーズ全体で共有する世界観と生成ルールを定義します。
                  <br />
                  <span className="font-normal text-charcoal/40">
                    ※作成画面で決めること、詳細画面で後から決めることがあります。まずは「核」となる部分を埋めましょう。
                  </span>
                </p>
              </section>

              <section className="ui-card sketch-border p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-terracotta/10 text-terracotta">
                    <MaterialIcon name="assignment" />
                  </div>
                  <h2 className="font-headline text-lg font-black text-charcoal">基本情報</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-name"
                    >
                      シリーズ名
                    </label>
                    <input
                      id="series-name"
                      name="seriesName"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.name}
                      placeholder="例：まちの記録フィールドノート編集室"
                      type="text"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-one-line"
                    >
                      一言説明
                    </label>
                    <input
                      id="series-one-line"
                      name="seriesOneLine"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.oneLine}
                      placeholder="例：この町の隠れた営みを採取し、未来へ残す編集体験"
                      type="text"
                    />
                    <p className="mt-1 text-[11px] text-charcoal/60">
                      このシリーズが、どの空間をどのような体験として扱うのかを短く記述します
                    </p>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-role"
                    >
                      シリーズの役割
                    </label>
                    <textarea
                      id="series-role"
                      name="seriesRole"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.role}
                      placeholder="例：メインストーリーを補完し、より深い地域文脈（歴史・地質）への入り口となる役割"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-participant-goal"
                    >
                      参加者がこのシリーズで得たいこと
                    </label>
                    <input
                      id="series-participant-goal"
                      name="participantGoal"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.participantGoal}
                      placeholder="例：ただの観光では見えない、町の『裏側』を知る喜びを味わう"
                      type="text"
                    />
                    <p className="mt-1 text-[11px] text-charcoal/60">
                      参加者が、このシリーズに入るときに求めること
                    </p>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-terracotta/10 text-terracotta">
                    <MaterialIcon name="public" />
                  </div>
                  <h2 className="font-headline text-lg font-black text-charcoal">シリーズ世界観</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                        htmlFor="participant-role"
                      >
                        参加者の立場
                      </label>
                      <input
                        id="participant-role"
                        name="participantRole"
                        className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                        defaultValue={draftInitialValues?.participantRole}
                        placeholder="例：見習い調査員"
                        type="text"
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                        htmlFor="guide-role"
                      >
                        案内役の立場
                      </label>
                      <input
                        id="guide-role"
                        name="guideRole"
                        className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                        defaultValue={draftInitialValues?.guideRole}
                        placeholder="例：ベテランのフィールドワーカー"
                        type="text"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="continuous-purpose"
                    >
                      シリーズの継続目的
                    </label>
                    <input
                      id="continuous-purpose"
                      name="continuousPurpose"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.continuousPurpose}
                      placeholder="例：散逸したフィールドノートの欠片をすべて集め、一冊の本を完成させる"
                      type="text"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="episode-completion-unit"
                    >
                      1話が完結したといえる単位
                    </label>
                    <input
                      id="episode-completion-unit"
                      name="episodeCompletionUnit"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.episodeCompletionUnit}
                      placeholder="例：一つのテーマ（地質、漁業など）に関する記事を1枚書き終える"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase">
                      シリーズ全体のトーン (最大3つ)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SERIES_TONE_OPTIONS.map((tone) => {
                        const checked = draftInitialValues
                          ? draftInitialValues.tones.includes(tone)
                          : DEFAULT_TONES.includes(tone);
                        return (
                          <label className="cursor-pointer" key={tone}>
                            <input
                              className="peer sr-only"
                              defaultChecked={checked}
                              name="seriesTones"
                              type="checkbox"
                              value={tone}
                            />
                            <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-xs font-semibold text-charcoal transition-colors peer-checked:border-terracotta peer-checked:bg-terracotta peer-checked:text-white">
                              {tone}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-terracotta/10 text-terracotta">
                    <MaterialIcon name="rule" />
                  </div>
                  <h2 className="font-headline text-lg font-black text-charcoal">エピソード生成ルール</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase">
                      扱う主題範囲 (タグ)
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {SERIES_TOPIC_OPTIONS.map((topic) => {
                        const checked = draftInitialValues
                          ? draftInitialValues.topics.includes(topic)
                          : DEFAULT_TOPICS.includes(topic);
                        return (
                          <label className="cursor-pointer" key={topic}>
                            <input
                              className="peer sr-only"
                              defaultChecked={checked}
                              name="seriesTopics"
                              type="checkbox"
                              value={topic}
                            />
                            <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-xs font-semibold text-charcoal transition-colors peer-checked:border-terracotta peer-checked:bg-terracotta peer-checked:text-white">
                              {topic}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <textarea
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={
                        draftInitialValues
                          ? joinLines(
                              draftInitialValues.topics.filter(
                                (topic) => !SERIES_TOPIC_OPTIONS.includes(topic),
                              ),
                            )
                          : ""
                      }
                      name="seriesTopicsText"
                      placeholder={"主題を追加する場合は改行区切りで入力\n例：地層観察\n伝統建築"}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase">
                      許可する表現モード (最大3つ)
                    </label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {EXPRESSION_MODE_OPTIONS.map((mode) => {
                        const checked = draftInitialValues
                          ? draftInitialValues.expressionModes.includes(mode)
                          : DEFAULT_EXPRESSION_MODES.includes(mode);
                        return (
                          <label className="cursor-pointer" key={mode}>
                            <input
                              className="peer sr-only"
                              defaultChecked={checked}
                              name="expressionModes"
                              type="checkbox"
                              value={mode}
                            />
                            <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-xs font-semibold text-charcoal transition-colors peer-checked:border-sage/40 peer-checked:bg-sage/10 peer-checked:text-sage">
                              {mode}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mb-2 space-y-1 rounded-lg border border-charcoal/5 bg-paper/50 p-3">
                      <p className="flex items-center gap-1 text-[9px] font-bold text-charcoal/40">
                        <MaterialIcon className="text-[12px]" name="tips_and_updates" />
                        モードごとの指針
                      </p>
                      <ul className="grid grid-cols-1 gap-2 text-[10px] text-charcoal/60 md:grid-cols-3">
                        <li className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-terracotta" />
                          発見型: 比較や気づきを重視
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-terracotta" />
                          調査型: 情報をつなぎ理解を深める
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-terracotta" />
                          小さな謎解き型: 次に進む理由を作る
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="mode-rule"
                    >
                      表現モードごとのルール
                    </label>
                    <textarea
                      id="mode-rule"
                      name="modeRule"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.modeRule}
                      placeholder="例：発見型では、まず対象の『見た目』の違和感を提示し、その後に歴史的背景を明かす手順にする。"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="required-points"
                    >
                      必ず含めたい観点
                    </label>
                    <textarea
                      id="required-points"
                      name="requiredPointsText"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={joinLines(draftInitialValues?.requiredPoints ?? [])}
                      placeholder={"例：\n必ず現在の風景と100年前の風景の対比に言及する"}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="avoid-rules"
                    >
                      避けたい表現 / 禁止ルール
                    </label>
                    <textarea
                      id="avoid-rules"
                      name="avoidRulesText"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={joinLines(draftInitialValues?.avoidRules ?? [])}
                      placeholder={"例：\n『絶景』という言葉を使わずに価値を伝える\n過度な美化や誇張を避ける"}
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <label
                        className="text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                        htmlFor="fact-direction-score"
                      >
                        事実と演出の境界
                      </label>
                      <div className="flex gap-8 text-[10px] font-black tracking-widest text-terracotta md:gap-12">
                        <span>事実重視 (0)</span>
                        <span>演出重視 (100)</span>
                      </div>
                    </div>
                    <input
                      id="fact-direction-score"
                      name="factDirectionScore"
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-charcoal/15 accent-terracotta"
                      defaultValue={draftInitialValues?.factDirectionScore ?? 30}
                      max={100}
                      min={0}
                      type="range"
                    />
                    <textarea
                      className="mt-4 w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.factDirectionNote}
                      name="factDirectionNote"
                      placeholder="スライダーの補足：基本は学術的データに基づくが、感情的なナレーションで参加者の没入感を高める。"
                      rows={1}
                    />
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-terracotta/10 text-terracotta">
                    <MaterialIcon name="all_inclusive" />
                  </div>
                  <h2 className="font-headline text-lg font-black text-charcoal">継続性</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-continuity"
                    >
                      シリーズで共有する継続性
                    </label>
                    <textarea
                      id="series-continuity"
                      name="continuityText"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.continuity}
                      placeholder="例：案内役との親密度をステータス化し、親密になるにつれて案内役が自分の過去を語り始めるようにする。"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-[10px] font-black tracking-widest text-charcoal/40 uppercase"
                      htmlFor="series-revisit-change"
                    >
                      再訪時に変化させたいこと
                    </label>
                    <textarea
                      id="series-revisit-change"
                      name="revisitChangeText"
                      className="w-full rounded-md border-[1.5px] border-charcoal bg-paper px-3 py-3 text-sm transition-all focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.revisitChange}
                      placeholder="例：一度訪れたスポットの周辺では、前回見逃していた別の側面の情報を提示する。"
                      rows={2}
                    />
                  </div>
                </div>
              </section>

            </div>
          </div>

          <footer className="glass-header fixed right-0 bottom-0 left-64 z-50 border-t border-charcoal/10 px-8 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
              <button
                className="rounded-lg px-5 py-2 text-sm font-bold text-charcoal/50 transition-colors hover:text-charcoal"
                name="intent"
                type="submit"
                value="draft"
              >
                下書きとして保存
              </button>
              <button
                className="sketch-border flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110"
                name="intent"
                type="submit"
                value="complete"
              >
                作成して詳細設計へ進む
                <MaterialIcon className="text-lg" name="arrow_forward" />
              </button>
            </div>
          </footer>
        </form>
      </main>
    </>
  );
}
