/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MaterialIcon } from "../../../_components/material-icon";

type SpotsPageProps = {
  searchParams?: {
    series?: string | string[];
  };
};

const SERIES_LABELS: Record<string, string> = {
  "sea-memory": "海の物語 - 岩美の記憶",
  "station-secret": "無人駅の秘密",
};

export default function ProjectSpotsPage({ searchParams }: SpotsPageProps) {
  const rawSeries = Array.isArray(searchParams?.series) ? searchParams?.series[0] : searchParams?.series;
  const filteredSeriesName = rawSeries ? SERIES_LABELS[rawSeries] : undefined;
  const isSeriesFiltered = Boolean(filteredSeriesName);
  const visibleSpotCount = isSeriesFiltered ? 1 : 2;

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
            <span className="text-sm">制作ホーム</span>
          </Link>

          <div className="nav-group-label">コンテンツ管理</div>

          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="/projects/iwami-station-poc"
          >
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </Link>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <Link
              className="sidebar-item-active flex items-center gap-3 px-4 py-2 shadow-sm transition-all"
              href="/projects/iwami-station-poc/spots"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </Link>
            <Link
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="/projects/iwami-station-poc/series-detail"
            >
              <MaterialIcon className="text-[18px]" name="auto_stories" />
              <span className="text-sm">シリーズ</span>
            </Link>
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
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="visibility" />
            <span className="text-sm">AIプレビュー</span>
          </a>
          <a
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
            href="#"
          >
            <MaterialIcon className="text-[20px]" name="cloud_upload" />
            <span className="text-sm">公開管理</span>
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

      <main className="ml-64 min-h-screen">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-charcoal/40 uppercase">
              <Link href="/projects/iwami-station-poc">
                <MaterialIcon className="cursor-pointer text-[16px] transition-colors hover:text-charcoal/80" name="arrow_back" />
              </Link>
              <span>岩美駅PoC</span>
            </div>
            <div className="h-4 w-px bg-charcoal/10" />
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">プロジェクト内スポット管理</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-full bg-charcoal/5 px-4 py-1.5 text-xs font-bold text-charcoal/60 transition-all hover:bg-charcoal/10">
              <MaterialIcon className="text-[18px]" name="visibility" />
              <span>一括プレビュー</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-terracotta px-6 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110">
              <span>変更を保存</span>
            </button>
            <button className="rounded-full p-2 text-charcoal/40 transition-colors hover:text-charcoal/80">
              <MaterialIcon name="settings" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] space-y-8 p-8">
          <section className="space-y-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h3 className="font-headline text-4xl font-extrabold tracking-tight text-charcoal">プロジェクト内スポット管理</h3>
                <p className="mt-2 text-sm font-medium text-charcoal/50 italic">
                  岩美地域PoC向け：全シリーズのロケーション資産を統合管理
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-charcoal/5 bg-charcoal/10 bg-paper/50 p-1 shadow-sm md:grid-cols-7">
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">合計</p>
                    <p className="font-headline text-xl font-bold text-charcoal">22</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">必須</p>
                    <p className="font-headline text-xl font-bold text-sage">4</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">代替</p>
                    <p className="font-headline text-xl font-bold text-ochre">8</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">補助</p>
                    <p className="font-headline text-xl font-bold text-charcoal/60">6</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-charcoal/40 uppercase">未設定</p>
                    <p className="font-headline text-xl font-bold text-terracotta/40">4</p>
                  </div>
                  <div className="border-l-2 border-charcoal/5 bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-terracotta uppercase">未所属</p>
                    <p className="font-headline text-xl font-bold text-terracotta">3</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-[9px] font-bold tracking-widest text-sage uppercase">共用</p>
                    <p className="font-headline text-xl font-bold text-sage">5</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="ui-card sketch-border group flex cursor-pointer items-center gap-4 border-terracotta/20 p-4 transition-all hover:bg-terracotta/[0.02] active:scale-95">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                  <MaterialIcon name="schedule" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal/80">営業時間未入力</p>
                  <p className="text-[10px] font-bold text-terracotta">
                    5件のスポット <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </div>

              <div className="ui-card sketch-border group flex cursor-pointer items-center gap-4 border-ochre/20 p-4 transition-all hover:bg-ochre/[0.02] active:scale-95">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ochre/10 text-ochre">
                  <MaterialIcon name="cloud_off" />
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal/80">雨天対応タグ不足</p>
                  <p className="text-[10px] font-bold text-ochre">
                    3件のスポット <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </div>

              <div className="ui-card flex cursor-pointer items-center gap-4 rounded-lg bg-charcoal p-4 text-white transition-all hover:brightness-110">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-ochre">
                  <MaterialIcon name="auto_awesome" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">AIアシスタント</p>
                  <p className="text-[9px] opacity-60">不足データの自動要約を生成</p>
                </div>
                <MaterialIcon className="text-sm opacity-40" name="chevron_right" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
              <div className="flex items-center gap-1 rounded-lg bg-charcoal/5 p-1">
                <Link
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                    isSeriesFiltered ? "text-charcoal/50 hover:text-charcoal" : "bg-white text-charcoal shadow-sm"
                  }`}
                  href="/projects/iwami-station-poc/spots"
                >
                  全シリーズ
                </Link>
                <button
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                    isSeriesFiltered ? "bg-white text-charcoal shadow-sm" : "text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  シリーズで絞る
                </button>
                <button className="rounded-md px-4 py-1.5 text-xs font-bold text-charcoal/50 transition-colors hover:text-charcoal">
                  未所属のみ
                </button>
                <button className="rounded-md px-4 py-1.5 text-xs font-bold text-charcoal/50 transition-colors hover:text-charcoal">
                  複数共用
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <MaterialIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-charcoal/30" name="search" />
                  <input
                    className="w-full rounded-full border border-charcoal/10 bg-white py-2 pr-4 pl-10 text-xs font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    placeholder="スポット名で検索..."
                    type="text"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-3 py-2 text-[11px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                      <span>役割</span>
                      <MaterialIcon className="text-[14px]" name="expand_more" />
                    </button>
                  </div>

                  <div className="relative group">
                    <button className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-3 py-2 text-[11px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                      <span>入力状態</span>
                      <MaterialIcon className="text-[14px]" name="expand_more" />
                    </button>
                  </div>

                  <div className="relative group">
                    <button className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-3 py-2 text-[11px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                      <span>所属状態</span>
                      <MaterialIcon className="text-[14px]" name="expand_more" />
                    </button>
                    <div className="absolute top-full left-0 z-20 mt-2 hidden w-40 rounded-xl border border-charcoal/10 bg-white py-2 shadow-xl group-hover:block">
                      <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                        未所属
                      </button>
                      <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                        共用
                      </button>
                      <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                        入力不足
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isSeriesFiltered && filteredSeriesName ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-terracotta/20 bg-terracotta/5 px-3 py-1 text-[11px] font-bold text-terracotta">
                  シリーズ絞り込み中: {filteredSeriesName}
                </span>
                <Link
                  className="flex items-center gap-1 rounded-full border border-charcoal/10 bg-white px-2.5 py-1 text-[10px] font-bold text-charcoal/60 transition-colors hover:text-terracotta"
                  href="/projects/iwami-station-poc/spots"
                >
                  <MaterialIcon className="text-[12px]" name="cancel" />
                  解除
                </Link>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110">
                  <MaterialIcon className="text-[18px]" name="add_location_alt" />
                  <span>新規スポット追加</span>
                </button>
                <button className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-5 py-2.5 text-xs font-bold text-charcoal transition-all hover:bg-charcoal/5">
                  <MaterialIcon className="text-[18px]" name="database" />
                  <span>スポットプールから選択</span>
                </button>
                <div className="mx-1 h-6 w-px bg-charcoal/10" />

                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-charcoal/40 transition-all hover:text-terracotta">
                    <MaterialIcon className="text-[18px]" name="layers" />
                    <span>一括操作</span>
                    <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[9px] text-white">0</span>
                  </button>
                  <div className="absolute top-full left-0 z-20 mt-2 hidden w-56 rounded-xl border border-charcoal/10 bg-white py-2 shadow-xl group-hover:block">
                    <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                      一括で役割変更
                    </button>
                    <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                      一括でシリーズに割り当て
                    </button>
                    <button className="w-full px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-terracotta/5 hover:text-terracotta">
                      選択項目をエクスポート
                    </button>
                    <div className="my-1 h-px bg-charcoal/5" />
                    <button className="w-full px-4 py-2 text-left text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
                      プロジェクトから除外
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">
                現在 {visibleSpotCount}件のスポットを表示中
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="ui-card sketch-border group relative p-5 transition-all">
              <div className="absolute top-4 left-4 z-10">
                <input className="checkbox-custom h-5 w-5 cursor-pointer rounded border-charcoal/20 focus:ring-terracotta" type="checkbox" />
              </div>

              <div className="mb-3 ml-8 flex items-start justify-between">
                <div className="w-full">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="status-tag border border-sage/20 bg-sage/10 text-sage">必須</span>
                    <span className="text-[9px] font-bold text-charcoal/30">ID: IW-001</span>
                  </div>
                  <h4 className="font-headline text-lg font-extrabold text-charcoal transition-colors group-hover:text-terracotta">
                    岩美駅前広場
                  </h4>
                </div>

                <div className="group/menu relative">
                  <button className="rounded-full p-1.5 text-charcoal/20 transition-all hover:text-charcoal/60">
                    <MaterialIcon name="more_vert" />
                  </button>
                  <div className="absolute top-full right-0 z-30 mt-1 hidden w-48 rounded-lg border border-charcoal/10 bg-white py-1 shadow-xl group-hover/menu:block">
                    <button className="w-full px-4 py-2 text-left text-[11px] font-bold hover:bg-charcoal/5">
                      シリーズ割り当て解除
                    </button>
                    <button className="w-full px-4 py-2 text-left text-[11px] font-bold hover:bg-charcoal/5">
                      役割を「代替」に変更
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-charcoal/5">
                <img
                  alt="岩美駅前広場"
                  className="h-full w-full object-cover grayscale-[0.2] transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKX7WEfUz2qSTU7hMNBXORYtid229NqwwJd7sSQf_iwo5yS0Xoki5zRIlWYAdte7ivIUwGKu6bAzZJPSt9zslKbccllAPMG6EJbDqSCEiEIuRgwDI7BGBQsrNJPPzjI7ByZngu6dQeD9iOiCBAO6979qWz3d6hrrNcsV5VMZIWgvuSK6Gzx1W9dJud3KACYY9XmiVYci7QbtyQxka-i3Z6Y8OvJnsq03itUIbKvoGCdk7mj_1dOzMLXhEuZTGao6-42yHrEtOxxk0"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[9px] font-bold text-charcoal shadow-sm backdrop-blur">
                  <MaterialIcon className="text-[12px] text-sage" name="check_circle" />
                  <span>情報充実</span>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                <div className="space-y-2 rounded-lg border border-charcoal/5 bg-paper/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase">使用シリーズ</span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-charcoal px-2 py-0.5 text-[9px] font-bold text-white">海の物語</span>
                      <span className="rounded border border-charcoal/20 px-2 py-0.5 text-[9px] font-bold text-charcoal/60">共用</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">営業時間</span>
                    <MaterialIcon className="text-[14px] font-bold text-sage" name="check_circle" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">雨天対応</span>
                    <MaterialIcon className="text-[14px] font-bold text-sage" name="check_circle" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">背景説明</span>
                    <MaterialIcon className="text-[14px] font-bold text-terracotta" name="error" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">シリーズ所属</span>
                    <MaterialIcon className="text-[14px] font-bold text-sage" name="check_circle" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-lg bg-terracotta py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:brightness-110">
                  <MaterialIcon className="text-[16px]" name="edit_note" />
                  <span>詳細編集</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-lg border border-charcoal/10 bg-white py-2 text-[11px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                  <MaterialIcon className="text-[16px]" name="visibility" />
                  <span>プレビュー</span>
                </button>
              </div>
            </div>

            {!isSeriesFiltered ? (
              <div className="ui-card sketch-border group relative border border-charcoal/30 border-dashed p-5 transition-all">
              <div className="absolute top-4 left-4 z-10">
                <input className="checkbox-custom h-5 w-5 cursor-pointer rounded border-charcoal/20 focus:ring-terracotta" type="checkbox" />
              </div>

              <div className="mb-3 ml-8 flex items-start justify-between">
                <div className="w-full">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="status-tag border border-charcoal/10 bg-charcoal/5 text-charcoal/40">未設定</span>
                    <span className="text-[9px] font-bold text-charcoal/30">ID: IW-012</span>
                  </div>
                  <h4 className="font-headline text-lg font-extrabold text-charcoal transition-colors group-hover:text-terracotta">
                    浦富海岸 展望台
                  </h4>
                </div>
              </div>

              <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-charcoal/5 grayscale">
                <img
                  alt="展望台"
                  className="h-full w-full object-cover opacity-50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeVCmjEGBKihU6sVWjUvEH30K_70QQO4cVAD0h5xGSNW3NBQxdWgiYjiYt53sNwn0ACTpnWNg5LSHNjTo27aRWDz-6Wi_gxTkNFDlBuNfBesR4N6OCuZxOKd4jUlpkOR_BbB9_IpY_aZASmxHvxbstIFOLLohE3HGAs36Cej1H8L4TuqVsgoWCH6eCDjFienBKwAYhMB9dTYYeTZz_ee-Ps9KmqMApyinvaVViBcxt_dDrJGcs_8nbvOk_PRIKSLKnDQlUxZdKUxQ"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-charcoal shadow-sm">シリーズ未所属</span>
                </div>
              </div>

              <div className="mb-5 space-y-3">
                <div className="rounded-lg border border-terracotta/10 bg-terracotta/[0.03] p-3">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-terracotta">
                    <MaterialIcon className="text-[14px]" name="warning" />
                    <span>シリーズ未所属</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">営業時間</span>
                    <MaterialIcon className="text-[14px] font-bold text-terracotta" name="error" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">雨天対応</span>
                    <MaterialIcon className="text-[14px] font-bold text-terracotta" name="error" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">背景説明</span>
                    <MaterialIcon className="text-[14px] font-bold text-terracotta" name="error" />
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/5 pb-1 text-[10px] font-bold">
                    <span className="text-charcoal/40">シリーズ所属</span>
                    <MaterialIcon className="text-[14px] font-bold text-terracotta" name="cancel" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-lg bg-charcoal/5 py-2 text-[11px] font-bold text-charcoal transition-all hover:bg-charcoal/10">
                  <MaterialIcon className="text-[16px]" name="edit_note" />
                  <span>詳細編集</span>
                </button>
                <button className="cursor-not-allowed flex items-center justify-center gap-1.5 rounded-lg border border-charcoal/10 bg-white py-2 text-[11px] font-bold text-charcoal/40">
                  <MaterialIcon className="text-[16px]" name="visibility" />
                  <span>プレビュー不可</span>
                </button>
              </div>
              </div>
            ) : null}

            <div className="ui-card group flex min-h-[420px] cursor-pointer flex-col items-center justify-center border-2 border-charcoal/20 border-dashed bg-transparent p-6 transition-colors hover:border-terracotta/40">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/5 text-charcoal/20 transition-all group-hover:bg-terracotta/10 group-hover:text-terracotta">
                <MaterialIcon className="text-3xl" name="add" />
              </div>
              <div className="text-center">
                <p className="font-headline text-lg font-extrabold text-charcoal transition-colors group-hover:text-terracotta">
                  新規スポットを追加
                </p>
                <p className="mt-2 max-w-[200px] text-[11px] font-medium text-charcoal/40">
                  新しいロケーションをプロジェクトに追加し、シリーズを構築します
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-12 flex items-center justify-between border-t border-charcoal/10 px-8 py-10 text-[10px] font-bold tracking-widest text-charcoal/30 uppercase italic">
          <div>© 2024 TOMOSHIBI Studio. 実務運用ハブ - プロジェクト管理モード</div>
          <div className="flex gap-6 opacity-50">
            <MaterialIcon className="text-sm" name="light" />
            <MaterialIcon className="text-sm" name="map" />
            <MaterialIcon className="text-sm" name="history_edu" />
          </div>
        </footer>
      </main>
    </>
  );
}
