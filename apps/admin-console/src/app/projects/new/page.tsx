import Link from "next/link";
import { HeaderAuthControls } from "../../_components/header-auth-controls";
import { MaterialIcon } from "../../_components/material-icon";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";
import { saveNewProjectAction } from "./actions";
import { ExternalAiPromptDrawer } from "./external-ai-prompt-drawer";
import { ProjectAreaMapField } from "./project-area-map-field";

export const dynamic = "force-dynamic";

const PRIORITY_OPTIONS = [
  "回遊",
  "滞在",
  "理解促進",
  "消費",
  "再訪",
  "接点創出",
];

const TRANSPORT_OPTIONS = ["徒歩", "自転車", "車", "公共交通"];

const VALIDATION_OPTIONS = [
  "初回利用でも迷わず始められるか",
  "物語化で回遊が増えるか",
  "駅起点で滞在が伸びるか",
];
const KPI_INPUT_ROWS = [1, 2, 3] as const;

type NewProjectPageProps = {
  searchParams?:
    | {
        draft?: string | string[];
      }
    | Promise<{
    draft?: string | string[];
      }>;
};

type GoalMetric = {
  variable: string;
  indicator: string;
};

type DraftInitialValues = {
  id: string;
  projectName: string;
  projectSummary: string;
  projectArea: string;
  projectTypes: string[];
  projectBackground: string;
  projectChallenges: string;
  desiredChangesText: string;
  priorityFocus: string[];
  targetSegmentsText: string;
  targetKnowledge: string;
  usageScenesText: string;
  transportModes: string[];
  returnConstraint: string;
  requiredPerspectives: string;
  avoidExpressions: string;
  projectConstraints: string;
  validationGoals: string;
  validationOptions: string[];
  goalMetrics: GoalMetric[];
  projectStakeholders: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asGoalMetrics(value: unknown): GoalMetric[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const objectItem = item as { variable?: unknown; indicator?: unknown };
      const variable = asString(objectItem.variable).trim();
      const indicator = asString(objectItem.indicator).trim();
      if (!variable && !indicator) {
        return null;
      }
      return { variable, indicator };
    })
    .filter((item): item is GoalMetric => item !== null)
    .slice(0, 3);
}

function joinLines(values: string[]): string {
  return values.join("\n");
}

function asLineText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join("\n");
  }
  return "";
}

async function loadDraftInitialValues(
  draftId: string | null,
  viewerUid: string | null,
): Promise<DraftInitialValues | null> {
  if (!draftId || !viewerUid) {
    return null;
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return null;
  }

  try {
    const snapshot = await db.collection("projects").doc(draftId).get();
    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data() as {
      name?: unknown;
      metadata?: unknown;
      ownerUid?: unknown;
    } | undefined;
    const ownerUid = asString(data?.ownerUid).trim();
    if (!ownerUid || ownerUid !== viewerUid) {
      return null;
    }

    const metadata =
      data?.metadata && typeof data.metadata === "object"
        ? (data.metadata as Record<string, unknown>)
        : {};

    const kpiFallback = asStringArray(metadata.kpiDirections)
      .map((row) => {
        const [variable, indicator] = row.split("/").map((part) => part.trim());
        if (!variable && !indicator) {
          return null;
        }
        return {
          variable: variable ?? "",
          indicator: indicator ?? "",
        };
      })
      .filter((item): item is GoalMetric => item !== null)
      .slice(0, 3);

    const goalMetrics = asGoalMetrics(metadata.goalMetrics);

    return {
      id: snapshot.id,
      projectName: asString(data?.name),
      projectSummary: asString(metadata.summary),
      projectArea: asString(metadata.startPlace),
      projectTypes: asStringArray(metadata.projectTypes),
      projectBackground: asString(metadata.background),
      projectChallenges: asString(metadata.challenges),
      desiredChangesText: joinLines(asStringArray(metadata.desiredChanges)),
      priorityFocus: asStringArray(metadata.priorityFocus),
      targetSegmentsText: joinLines(asStringArray(metadata.targetSegments)),
      targetKnowledge: asString(metadata.targetKnowledge),
      usageScenesText: joinLines(asStringArray(metadata.usageScenes)),
      transportModes: asStringArray(metadata.transportModes),
      returnConstraint: asString(metadata.returnConstraint),
      requiredPerspectives: asLineText(metadata.requiredPerspectives),
      avoidExpressions: asString(metadata.avoidExpressions),
      projectConstraints: asString(metadata.constraints),
      validationGoals: asString(metadata.validationGoals),
      validationOptions: asStringArray(metadata.validationOptions),
      goalMetrics: goalMetrics.length > 0 ? goalMetrics : kpiFallback,
      projectStakeholders: asLineText(metadata.stakeholders),
    };
  } catch {
    return null;
  }
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const viewer = await getRequestAuthUser();
  const viewerUid = viewer?.uid ?? null;
  const resolvedSearchParams = await searchParams;
  const rawDraftParam = Array.isArray(resolvedSearchParams?.draft)
    ? resolvedSearchParams?.draft[0]
    : resolvedSearchParams?.draft;
  const draftParam = rawDraftParam?.trim() ?? "";
  const draftInitialValues = await loadDraftInitialValues(draftParam || null, viewerUid);
  const defaultGoalMetrics = draftInitialValues?.goalMetrics ?? [];
  const editingProjectId = draftInitialValues?.id ?? "";
  const formRenderKey = editingProjectId || "new";
  const draftLoadFailed = Boolean(draftParam) && !draftInitialValues;

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

          <a className="sidebar-item-active flex items-center gap-3 px-4 py-2.5 transition-all" href="#">
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </a>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </a>
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
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
            <span className="text-sm font-medium">AIプレビュー</span>
          </a>
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

      <main className="ml-64 min-h-screen pb-28">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal/40">
              <span>プロジェクト</span>
              <MaterialIcon className="text-sm" name="chevron_right" />
            </div>
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">
              新規プロジェクト作成
            </h2>
            <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-ochre uppercase">
              下書き
            </span>
          </div>

          <HeaderAuthControls />
        </header>

        <form action={saveNewProjectAction} key={formRenderKey}>
          {editingProjectId ? <input name="projectId" type="hidden" value={editingProjectId} /> : null}
          <div className="mx-auto max-w-7xl space-y-8 p-8">
          {draftLoadFailed ? (
            <section className="ui-card border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                指定された下書きが見つからないか、アクセス権がありません。
              </p>
              <p className="mt-1 text-xs text-red-600">
                もう一度ホームの「下書きを編集」から開くか、URLの `draft` パラメータ（{draftParam}）を確認してください。
              </p>
            </section>
          ) : null}
          <section className="ui-card border-b-4 border-b-terracotta p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-3xl space-y-3">
                <div className="flex items-center gap-2 text-charcoal/40">
                  <MaterialIcon className="text-base" name="engineering" />
                  <span className="text-[10px] font-extrabold tracking-widest uppercase">
                    Project Setup
                  </span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-charcoal">
                  {editingProjectId ? "下書きプロジェクトを編集する" : "プロジェクトの基本設計を登録する"}
                </h1>
                <p className="text-sm leading-relaxed font-medium text-charcoal/70">
                  ホームと詳細画面と同じ情報設計で、公開前に必要な基本情報と目的・検証観点を入力します。
                </p>
                {editingProjectId ? (
                  <p className="inline-flex rounded-md border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-mono text-charcoal/70">
                    Project ID: {editingProjectId}
                  </p>
                ) : null}
              </div>

              <div className="w-full md:w-auto">
                <ExternalAiPromptDrawer />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="edit_note" />
                  1. プロジェクトの核
                </h3>

                <ProjectAreaMapField
                  initialProjectArea={draftInitialValues?.projectArea}
                  initialProjectName={draftInitialValues?.projectName}
                  initialProjectSummary={draftInitialValues?.projectSummary}
                  initialProjectTypes={draftInitialValues?.projectTypes}
                />
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-sage" name="flag" />
                  2. 解きたい課題
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="project-background"
                    >
                      背景
                    </label>
                    <textarea
                      id="project-background"
                      name="projectBackground"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.projectBackground}
                      placeholder="例：キャンパスが広く、新入生が一部の施設しか知らないまま終わりやすい"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="project-challenges"
                    >
                      解きたい課題
                    </label>
                    <textarea
                      id="project-challenges"
                      name="projectChallenges"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.projectChallenges}
                      placeholder={"例:\n・回遊が起きにくい\n・情報を渡しても行動につながらない\n・初回導線が弱い"}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="desired-changes"
                    >
                      起こしたい変化
                    </label>
                    <textarea
                      id="desired-changes"
                      name="desiredChangesText"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.desiredChangesText}
                      placeholder={"例:\n・歩き回る\n・滞在が伸びる\n・再訪したくなる"}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      この案件で特に重視したいこと
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITY_OPTIONS.map((option) => (
                        <label className="cursor-pointer" key={option}>
                          <input
                            className="peer sr-only"
                            defaultChecked={draftInitialValues?.priorityFocus.includes(option)}
                            name="priorityFocus"
                            type="checkbox"
                            value={option}
                          />
                          <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-[11px] font-bold text-charcoal/70 transition-colors peer-checked:border-sage/40 peer-checked:bg-sage/10 peer-checked:text-sage">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-ochre" name="person_search" />
                  3. 対象ユーザーと利用シーン
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="target-segments"
                    >
                      主なターゲット
                    </label>
                    <textarea
                      id="target-segments"
                      name="targetSegmentsText"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.targetSegmentsText}
                      placeholder={"例:\n・初来訪者\n・新入生\n・友人同士で回りたい利用者"}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="target-knowledge"
                    >
                      ターゲットの前提知識
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none rounded-lg border border-charcoal/10 bg-white px-4 py-3 pr-10 text-sm font-medium focus:border-terracotta focus:outline-none"
                        id="target-knowledge"
                        name="targetKnowledge"
                        defaultValue={draftInitialValues?.targetKnowledge || "ほぼ知らない"}
                      >
                        <option>ほぼ知らない</option>
                        <option>少し知っている</option>
                        <option>ある程度知っている</option>
                      </select>
                      <MaterialIcon
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-charcoal/40"
                        name="expand_more"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="usage-scenes"
                    >
                      想定利用シーン
                    </label>
                    <textarea
                      id="usage-scenes"
                      name="usageScenesText"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.usageScenesText}
                      placeholder={"例:\n・初回案内\n・空き時間の回遊\n・駅到着直後に使う短時間導線"}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      移動手段の想定
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TRANSPORT_OPTIONS.map((option) => (
                        <label className="cursor-pointer" key={option}>
                          <input
                            className="peer sr-only"
                            defaultChecked={draftInitialValues?.transportModes.includes(option)}
                            name="transportModes"
                            type="checkbox"
                            value={option}
                          />
                          <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-[11px] font-bold text-charcoal/70 transition-colors peer-checked:border-sage/40 peer-checked:bg-sage/10 peer-checked:text-sage">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="return-constraint"
                    >
                      帰着条件や締切条件
                    </label>
                    <input
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.returnConstraint}
                      id="return-constraint"
                      name="returnConstraint"
                      placeholder="例：90分以内に中央食堂へ戻る必要がある"
                      type="text"
                    />
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="tune" />
                  4. 体験方針と制約
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="required-perspectives"
                    >
                      必ず含めたい観点
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.requiredPerspectives}
                      id="required-perspectives"
                      name="requiredPerspectives"
                      placeholder={"例:\n・学内の多様性\n・海とのつながり\n・初見でも歩きやすい安心感"}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="avoid-expressions"
                    >
                      避けたいこと / 禁止表現
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.avoidExpressions}
                      id="avoid-expressions"
                      name="avoidExpressions"
                      placeholder="例：過度にゲームっぽくしない / 宣伝っぽくしない / 誤認を招く表現をしない"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="project-constraints"
                    >
                      重要な制約
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.projectConstraints}
                      id="project-constraints"
                      name="projectConstraints"
                      placeholder="例：夜間利用不可 / 雨天時も成立させたい / 一部施設は営業時間制約あり"
                      rows={3}
                    />
                  </div>

                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-sage" name="query_stats" />
                  5. 検証・運用の前提
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="validation-goals"
                    >
                      このプロジェクトで見たいこと
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.validationGoals}
                      id="validation-goals"
                      name="validationGoals"
                      placeholder="例：初回利用でも迷わず始められるか / 駅起点で滞在が伸びるか"
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      {VALIDATION_OPTIONS.map((option) => (
                        <label className="cursor-pointer" key={option}>
                          <input
                            className="peer sr-only"
                            defaultChecked={draftInitialValues?.validationOptions.includes(option)}
                            name="validationOptions"
                            type="checkbox"
                            value={option}
                          />
                          <span className="inline-flex rounded-full border border-charcoal/15 bg-white px-3 py-1 text-[11px] font-bold text-charcoal/70 transition-colors peer-checked:border-sage/40 peer-checked:bg-sage/10 peer-checked:text-sage">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      目標変数と指標（3件まで）
                    </label>
                    <div className="space-y-3">
                      {KPI_INPUT_ROWS.map((index) => (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2" key={index}>
                          <input
                            className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                            defaultValue={defaultGoalMetrics[index - 1]?.variable ?? ""}
                            name={`goalVariable${index}`}
                            placeholder={`目標変数 ${index}（例：回遊完了率）`}
                            type="text"
                          />
                          <input
                            className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                            defaultValue={defaultGoalMetrics[index - 1]?.indicator ?? ""}
                            name={`goalIndicator${index}`}
                            placeholder={`指標 ${index}（例：体験開始者のうち完走した割合）`}
                            type="text"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="project-stakeholders"
                    >
                      関係者 / ステークホルダー
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      defaultValue={draftInitialValues?.projectStakeholders}
                      id="project-stakeholders"
                      name="projectStakeholders"
                      placeholder={"例:\n・大学運営\n・新入生\n・観光協会\n・地域店舗"}
                      rows={4}
                    />
                  </div>

                </div>
              </section>

            </div>

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
                作成完了する
                <MaterialIcon className="text-lg" name="arrow_forward" />
              </button>
            </div>
          </footer>
        </form>
      </main>
    </>
  );
}
