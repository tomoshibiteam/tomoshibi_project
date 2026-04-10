import Link from "next/link";
import { HeaderAuthControls } from "./_components/header-auth-controls";
import { MaterialIcon } from "./_components/material-icon";
import { ProjectDeleteButton } from "./_components/project-delete-button";
import {
  getHomeDashboardData,
  type ProjectStatus,
} from "@/lib/home-dashboard";
import { getRequestAuthUser } from "@/lib/request-auth";

export const dynamic = "force-dynamic";

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  published: "公開中",
  previewable: "作成完了",
  draft: "下書き中",
};

const PROJECT_STATUS_CLASS: Record<ProjectStatus, string> = {
  published: "border-sage/20 bg-sage/15 text-sage",
  previewable: "border-ochre/20 bg-ochre/15 text-ochre",
  draft: "border-charcoal/10 bg-charcoal/5 text-charcoal/50",
};

export default async function Home() {
  const viewer = await getRequestAuthUser();
  const dashboard = await getHomeDashboardData(viewer?.uid ?? null);
  const projectCards = dashboard.projects.slice(0, 2);

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-charcoal/10 bg-white/50 p-4">
        <div className="mb-2 flex items-center gap-3 px-2 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm">
            <MaterialIcon name="auto_awesome" />
          </div>
          <div>
            <h1 className="font-headline text-lg leading-tight font-bold tracking-tight text-charcoal">
              TOMOSHIBI
              <br />
              <span className="text-sm">Studio</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          <a
            className="sidebar-item-active flex items-center gap-3 px-4 py-2.5 shadow-sm transition-all"
            href="#"
          >
            <MaterialIcon name="home" className="text-[20px]" />
            <span className="text-sm">制作ホーム</span>
          </a>

          <div className="nav-group-label">コンテンツ管理</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="folder_open" className="text-[20px]" />
            <span className="text-sm">プロジェクト</span>
          </a>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon name="location_on" className="text-[18px]" />
              <span className="text-sm">スポット</span>
            </a>
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon name="auto_stories" className="text-[18px]" />
              <span className="text-sm">シリーズ</span>
            </a>
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon name="history_edu" className="text-[18px]" />
              <span className="text-sm">エピソード</span>
            </a>
          </div>

          <div className="nav-group-label">検証・運用</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="visibility" className="text-[20px]" />
            <span className="text-sm">AIプレビュー</span>
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="cloud_upload" className="text-[20px]" />
            <span className="text-sm">公開管理</span>
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="terminal" className="text-[20px]" />
            <span className="text-sm">実行ログ</span>
          </a>

          <div className="nav-group-label">設定</div>

          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="settings" className="text-[20px]" />
            <span className="text-sm">設定</span>
          </a>
        </nav>

        <div className="mt-auto space-y-1 border-t border-charcoal/10 pt-4">
          <a
            className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-charcoal/50 transition-colors hover:text-terracotta"
            href="#"
          >
            <MaterialIcon name="help_outline" className="text-sm" />
            <span>サポート</span>
          </a>
        </div>
      </aside>

      <main className="ml-64 min-h-screen pb-20">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <span className="font-headline text-lg font-extrabold tracking-tight text-charcoal">
              制作ホーム
            </span>
            <div className="h-4 w-[1px] bg-charcoal/20" />
            <div className="flex items-center gap-4 rounded-full bg-charcoal/5 px-3 py-1.5">
              <div className="flex items-center gap-1.5 border-r border-charcoal/10 pr-3">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-charcoal/70">
                  {dashboard.statusCounts.published} 公開中
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-charcoal/10 pr-3">
                <span className="h-2 w-2 rounded-full bg-ochre" />
                <span className="text-[10px] font-bold text-charcoal/70">
                  {dashboard.statusCounts.previewable} 作成完了
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-charcoal/30" />
                <span className="text-[10px] font-bold text-charcoal/70">
                  {dashboard.statusCounts.draft} 下書き中
                </span>
              </div>
            </div>
          </div>

          <HeaderAuthControls />
        </header>

        <div className="mx-auto max-w-7xl space-y-10 px-8 py-8">
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-charcoal">
                制作ホーム
              </h2>
              <p className="text-sm font-medium text-charcoal/60">
                制作状況と次のステップを確認しましょう。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110"
                href="/projects/new"
              >
                <MaterialIcon name="add_circle" className="text-lg" />
                新しいプロジェクトを作成
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-charcoal">
                  <MaterialIcon name="fact_check" className="text-sage" />
                  プロジェクト一覧
                </h3>
                <a
                  className="flex items-center gap-1 text-xs font-bold text-terracotta hover:underline"
                  href="#"
                >
                  すべて見る
                  <MaterialIcon name="arrow_forward" className="text-xs" />
                </a>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {projectCards.map((project) => (
                  <div key={project.id} className="ui-card group flex flex-col p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <span
                        className={`rounded border px-2.5 py-1 text-[10px] font-bold ${PROJECT_STATUS_CLASS[project.status]}`}
                      >
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                      <div className="flex flex-col items-end gap-2">
                        <ProjectDeleteButton
                          projectId={project.id}
                          projectName={project.name}
                        />
                        <span className="text-[10px] font-medium text-charcoal/40">
                          {project.updatedAtLabel}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-headline mb-2 text-xl font-extrabold">{project.name}</h4>
                    <p className="mb-2 text-[10px] font-mono text-charcoal/45">ID: {project.id}</p>
                    <p className="mb-6 flex-grow text-xs leading-relaxed text-charcoal/60">
                      {project.description}
                    </p>
                    <div className="mb-6 flex items-center gap-4 border-t border-charcoal/5 pt-4">
                      <div className="flex items-center gap-1.5 text-charcoal/50">
                        <MaterialIcon name="auto_stories" className="text-base" />
                        <span className="text-[10px] font-bold uppercase">
                          {project.seriesCount} シリーズ
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-charcoal/50">
                        <MaterialIcon name="location_on" className="text-base" />
                        <span className="text-[10px] font-bold uppercase">
                          {project.spotCount} スポット
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Link
                        className="block rounded-md bg-terracotta py-2 text-center text-xs font-bold text-white transition-all hover:brightness-110"
                        href={`/projects/new?draft=${encodeURIComponent(project.id)}`}
                        prefetch={false}
                      >
                        下書きを編集
                      </Link>
                      {project.status !== "draft" ? (
                        <Link
                          className="block rounded-md border border-charcoal/15 bg-white py-2 text-center text-xs font-bold text-charcoal transition-all hover:bg-paper"
                          href={`/projects/${encodeURIComponent(project.id)}`}
                        >
                          プロジェクト詳細を開く
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
                {projectCards.length === 0 ? (
                  <div className="ui-card flex items-center justify-center p-6 md:col-span-2">
                    <p className="text-sm font-medium text-charcoal/50">
                      プロジェクトデータがありません。
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-charcoal">
                  <MaterialIcon name="lab_profile" className="text-ochre" />
                  最新プレビュー結果
                </h3>
                <div className="ui-card p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <MaterialIcon
                      className="text-ochre"
                      name="hourglass_top"
                    />
                    <p className="text-sm font-bold text-charcoal">
                      最新プレビュー結果を準備中です
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-charcoal/60">
                    プレビュー実行後に、このセクションへ最新結果を表示します。
                  </p>
                </div>
              </div>

            </div>

            <div className="space-y-8 lg:col-span-4">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-charcoal">
                  <MaterialIcon name="fact_check" className="text-sage" />
                  対応が必要な項目
                </h3>
                <div className="ui-card p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <MaterialIcon
                      className="text-ochre"
                      name="hourglass_top"
                    />
                    <p className="text-sm font-bold text-charcoal">
                      対応項目の自動抽出を準備中です
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-charcoal/60">
                    このセクションには、対応が必要な項目を自動で表示します。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-charcoal">
                  <MaterialIcon name="fact_check" className="text-sage" />
                  Spot DBの入力重複率
                </h3>

                <div className="ui-card p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <MaterialIcon
                      className="text-ochre"
                      name="hourglass_top"
                    />
                    <p className="text-sm font-bold text-charcoal">
                      入力重複率の集計を準備中です
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-charcoal/60">
                    Spot DBの入力重複率は、準備が整い次第このセクションに表示します。
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="ml-64 flex items-center justify-between border-t border-charcoal/10 px-8 py-10 text-[10px] font-bold tracking-widest text-charcoal/40 uppercase italic">
        <div>© 2024 TOMOSHIBI Studio. Illuminated by Local Stories.</div>
        <div className="flex gap-6 opacity-50">
          <MaterialIcon name="light" className="text-sm" />
          <MaterialIcon name="map" className="text-sm" />
          <MaterialIcon name="history_edu" className="text-sm" />
        </div>
      </footer>
    </>
  );
}
