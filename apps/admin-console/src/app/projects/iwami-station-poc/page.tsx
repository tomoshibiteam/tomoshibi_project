/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HeaderAuthControls } from "../../_components/header-auth-controls";
import { MaterialIcon } from "../../_components/material-icon";

export default function IwamiStationPocPage() {
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

          <Link className="sidebar-item-active flex items-center gap-3 px-4 py-2.5 transition-all" href="/projects/iwami-station-poc">
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </Link>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#connected-spots"
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
            href="#latest-preview"
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

      <main className="ml-64 min-h-screen">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <MaterialIcon className="text-terracotta" name="hub" />
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">実務ハブ: 岩美駅PoC</h2>
            <div className="rounded border border-terracotta/20 bg-terracotta/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-terracotta uppercase">
              設計中
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
                  <span className="rounded-full border border-sage/20 bg-sage/15 px-3 py-1 text-xs font-bold text-sage">鳥取県岩美町</span>
                  <span className="rounded-full border border-charcoal/10 bg-charcoal/5 px-3 py-1 text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">
                    PJ ID: IWAMI-2024-POC
                  </span>
                </div>
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-charcoal">岩美駅PoC</h1>
                <p className="leading-relaxed font-medium text-charcoal/70">
                  無人駅を起点とした回遊と滞在の創出を目的とした実証実験プロジェクト。地域の物語とデジタル体験を融合させ、新たな滞在体験を設計します。
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto">
                <Link
                  className="sketch-border flex items-center justify-center gap-3 rounded-lg bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110"
                  href="/projects/iwami-station-poc/spots"
                >
                  <MaterialIcon name="map" />
                  案件全体のスポットDBへ
                </Link>
                <div className="flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-charcoal/20 bg-white px-4 py-2 text-xs font-bold text-charcoal transition-all hover:bg-charcoal/5">
                    <MaterialIcon className="text-[18px]" name="settings" />
                    プロジェクト設定
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-ochre/20 bg-ochre/10 px-4 py-2 text-xs font-bold text-ochre transition-all hover:bg-ochre/20">
                    <MaterialIcon name="share" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="ui-card p-6 md:col-span-8">
              <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                <MaterialIcon className="text-terracotta" name="flag" />
                案件目的と検証観点
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-charcoal/5 bg-paper/50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                    <span className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">案件の目的</span>
                  </div>
                  <p className="text-sm leading-relaxed font-bold text-charcoal">地域資源の再発見とデジタル活用による新しい観光動線の確立。</p>
                  <div className="pt-2">
                    <span className="mb-2 block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">想定シーン</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded border border-charcoal/10 bg-white px-2 py-0.5 text-[10px] font-bold text-charcoal/60">一人旅</span>
                      <span className="rounded border border-charcoal/10 bg-white px-2 py-0.5 text-[10px] font-bold text-charcoal/60">鉄道ファン</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-charcoal/5 bg-paper/50 p-5">
                  <div className="flex items-center gap-2 text-sage">
                    <MaterialIcon className="text-sm" name="check_circle" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase">検証ポイント</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-[11px] font-bold text-charcoal">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sage" />
                      駅起点での回遊導線の有効性検証
                    </li>
                    <li className="flex items-start gap-2 text-[11px] font-bold text-charcoal">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-sage" />
                      天候・交通手段による体験の連続性
                    </li>
                  </ul>
                  <div className="mt-auto border-t border-charcoal/5 pt-2">
                    <span className="mb-1 block text-[10px] font-extrabold tracking-widest text-ochre uppercase">成功指標</span>
                    <p className="text-xl font-extrabold text-charcoal">滞在時間 20% 向上</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ui-card border-l-4 border-l-ochre p-6 md:col-span-4">
              <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                <MaterialIcon className="text-ochre" name="bolt" />
                次にやること
              </h3>
              <div className="space-y-3">
                <a
                  className="group flex items-center justify-between rounded-lg border border-ochre/10 bg-ochre/5 p-3 transition-all hover:border-terracotta hover:bg-white hover:shadow-sm"
                  href="#continuity-design"
                >
                  <div className="flex items-center gap-3">
                    <MaterialIcon className="text-sm text-ochre" name="error" />
                    <span className="text-xs font-bold text-charcoal transition-colors group-hover:text-terracotta">シリーズのトーンが未設定です</span>
                  </div>
                  <MaterialIcon className="text-sm text-charcoal/20 transition-colors group-hover:text-terracotta" name="edit" />
                </a>

                <a
                  className="group flex items-center justify-between rounded-lg border border-charcoal/5 bg-paper/30 p-3 transition-all hover:border-terracotta hover:bg-white hover:shadow-sm"
                  href="#connected-spots"
                >
                  <div className="flex items-center gap-3">
                    <MaterialIcon className="text-sm text-charcoal/30" name="schedule" />
                    <span className="text-xs font-bold text-charcoal transition-colors group-hover:text-terracotta">営業時間未入力 (3箇所)</span>
                  </div>
                  <MaterialIcon
                    className="text-sm text-charcoal/20 transition-colors group-hover:text-terracotta"
                    name="arrow_forward"
                  />
                </a>

                <a
                  className="group flex items-center justify-between rounded-lg border border-charcoal/5 bg-paper/30 p-3 transition-all hover:border-terracotta hover:bg-white hover:shadow-sm"
                  href="#latest-preview"
                >
                  <div className="flex items-center gap-3">
                    <MaterialIcon className="text-sm text-charcoal/30" name="analytics" />
                    <span className="text-xs font-bold text-charcoal transition-colors group-hover:text-terracotta">全シナリオのAI検証が必要</span>
                  </div>
                  <MaterialIcon className="text-sm text-charcoal/20 transition-colors group-hover:text-terracotta" name="play_circle" />
                </a>
              </div>

              <button className="sketch-border mt-6 w-full rounded-lg border border-ochre/20 bg-ochre/10 py-3 text-sm font-bold text-ochre transition-all hover:bg-ochre/20">
                一括で課題を解決
              </button>
            </div>

            <div className="ui-card p-6 md:col-span-12" id="connected-series">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline flex items-center gap-2 text-xl font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="subscriptions" />
                    紐づくシリーズ
                    <span className="ml-2 rounded-full bg-charcoal/5 px-2.5 py-0.5 text-xs font-bold text-charcoal/40">2件</span>
                  </h3>
                </div>
                <Link
                  className="sketch-border flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110"
                  href="/projects/iwami-station-poc/series/new"
                >
                  <MaterialIcon className="text-[18px]" name="add" />
                  シリーズを追加
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-charcoal/5 text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      <th className="px-4 pb-4 font-extrabold">シリーズ情報</th>
                      <th className="px-4 pb-4 font-extrabold">ステータス</th>
                      <th className="px-4 pb-4 font-extrabold">構成</th>
                      <th className="px-4 pb-4 font-extrabold">進捗 / 不足項目</th>
                      <th className="px-4 pb-4 text-right">アクション</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-charcoal/5">
                    <tr className="group transition-colors hover:bg-paper/30">
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="sketch-border h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal/5">
                            <img
                              className="h-full w-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxYTJgV8qxgtgDu4c9y4Zw0eJz1oyTGCzZMt3Fi-F4cSOsf6M6-haTOYSpk96UF6NWxFi7XbF6niqS60X7cOPjnm7E0BeYNPXpvdAH7_aSvibZ0G9lUmAfr1t0feFqUCQ8GhSePIXAWXxHqd4OuUnWg_uOi4ug6r0KnB4yGFqlVmIzFzzvsTDtEp0phLsMujas8hTOZxYppWLS1-nGr3lVCpadAhocqS7J7GkLn-H40_wqQoWmT10ZNpQw4P0SBHOZAH_TOTOB5VM"
                              alt="Series thumbnail"
                            />
                          </div>
                          <div>
                            <span className="block text-base font-bold text-charcoal transition-colors group-hover:text-terracotta">
                              海の物語 - 岩美の記憶
                            </span>
                            <span className="text-[10px] font-medium text-charcoal/40">ID: IW-SEA-001</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-6">
                        <span className="rounded-full border border-sage/20 bg-sage/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-sage uppercase">
                          公開中
                        </span>
                      </td>

                      <td className="px-4 py-6">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-sm font-extrabold text-charcoal">5</div>
                            <div className="text-[9px] font-bold text-charcoal/40 uppercase">EP</div>
                          </div>
                          <div className="border-l border-charcoal/5 pl-4 text-center">
                            <div className="text-sm font-extrabold text-charcoal">12</div>
                            <div className="text-[9px] font-bold text-charcoal/40 uppercase">SPT</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="max-w-[120px] flex-1">
                            <div className="mb-1 flex justify-between text-[10px] font-extrabold">
                              <span className="text-sage">100%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill w-full bg-sage" />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-charcoal/30 italic">なし</span>
                        </div>
                      </td>

                      <td className="px-4 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            className="flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-terracotta/20 hover:bg-terracotta/5 hover:text-terracotta"
                            href="/projects/iwami-station-poc/series-detail"
                            title="編集"
                          >
                            <MaterialIcon className="text-[16px]" name="edit" />
                            シリーズ編集
                          </Link>
                          <Link
                            className="flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-charcoal/20 hover:bg-charcoal/5 hover:text-charcoal"
                            href="/projects/iwami-station-poc/spots?series=sea-memory"
                            title="スポットDB"
                          >
                            <MaterialIcon className="text-[16px]" name="database" />
                            スポットDB
                          </Link>
                        </div>
                      </td>
                    </tr>

                    <tr className="group transition-colors hover:bg-paper/30">
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="sketch-border h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal/5">
                            <img
                              className="h-full w-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd04RKMLF8bpYTsSrqWilrIZntauxKTYetM_rDzA0zWEdqWnYnszbkh0xHRmD4FyLAJWcGqELjB7XKiGLYD8cE9pLZmuH80UCR1HFUUaGPkOmgSOW02TC8uZQgxFwm8NMJmsb2cutj3kADVlmNuSn_48tskfaHY_u0j10H3licl7jF-xbDrWRVoUMMYQM13qB2MApYr6esJwiCbIvGTnx8Go9Q3a0zw_sVEILsr0sqsHO594UnAE21e2zY5bhbKAvA5OgSoop5VaI"
                              alt="Series thumbnail"
                            />
                          </div>
                          <div>
                            <span className="block text-base font-bold text-charcoal transition-colors group-hover:text-terracotta">
                              無人駅の秘密
                            </span>
                            <span className="text-[10px] font-medium text-charcoal/40">ID: IW-STA-002</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-6">
                        <span className="rounded-full border border-terracotta/20 bg-terracotta/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-terracotta uppercase">
                          下書き
                        </span>
                      </td>

                      <td className="px-4 py-6">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-sm font-extrabold text-charcoal">3</div>
                            <div className="text-[9px] font-bold text-charcoal/40 uppercase">EP</div>
                          </div>
                          <div className="border-l border-charcoal/5 pl-4 text-center">
                            <div className="text-sm font-extrabold text-charcoal">8</div>
                            <div className="text-[9px] font-bold text-charcoal/40 uppercase">SPT</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="max-w-[120px] flex-1">
                            <div className="mb-1 flex justify-between text-[10px] font-extrabold">
                              <span className="text-terracotta">65%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill w-[65%] bg-terracotta" />
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-ochre">
                            <MaterialIcon className="text-[12px]" name="warning" />2件
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            className="flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-terracotta/20 hover:bg-terracotta/5 hover:text-terracotta"
                            href="/projects/iwami-station-poc/series-detail"
                            title="編集"
                          >
                            <MaterialIcon className="text-[16px]" name="edit" />
                            シリーズ編集
                          </Link>
                          <Link
                            className="flex items-center gap-1 rounded-lg border border-charcoal/10 px-3 py-1.5 text-[11px] font-bold text-charcoal/70 transition-all hover:border-charcoal/20 hover:bg-charcoal/5 hover:text-charcoal"
                            href="/projects/iwami-station-poc/spots?series=station-secret"
                            title="スポットDB"
                          >
                            <MaterialIcon className="text-[16px]" name="database" />
                            スポットDB
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ui-card p-6 md:col-span-6" id="condition-sets">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="tune" />
                  検証シナリオ (条件セット)
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-terracotta hover:underline">
                  <MaterialIcon className="text-sm" name="add" /> 新規作成
                </button>
              </div>

              <div className="space-y-3">
                <div className="cursor-pointer rounded-xl border border-charcoal/5 bg-paper/30 p-4 transition-all hover:border-terracotta">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="sketch-border flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal/40">
                        <MaterialIcon name="directions_walk" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-charcoal">徒歩 / 2時間 / 晴れ</span>
                        <span className="block text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">メインシナリオ</span>
                      </div>
                    </div>
                    <span className="rounded border border-sage/20 bg-sage/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-sage uppercase">
                      検証済み
                    </span>
                  </div>
                </div>

                <div className="cursor-pointer rounded-xl border border-charcoal/5 bg-paper/30 p-4 transition-all hover:border-terracotta">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="sketch-border flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal/40">
                        <MaterialIcon name="directions_car" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-charcoal">車 / 4時間 / 雨</span>
                        <span className="block text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">エッジケース</span>
                      </div>
                    </div>
                    <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-ochre uppercase">
                      要確認
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-charcoal/5 bg-paper/30 p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="sketch-border flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal/40">
                        <MaterialIcon name="directions_bus" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-charcoal">バス / 3時間 / 曇り</span>
                        <span className="block text-[10px] font-bold tracking-widest text-charcoal/40 uppercase">オプション</span>
                      </div>
                    </div>
                    <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                      未検証
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="sketch-border relative flex flex-col justify-between overflow-hidden rounded-xl bg-charcoal p-6 text-white md:col-span-6"
              id="latest-preview"
            >
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <MaterialIcon className="text-[120px]" name="analytics" />
              </div>

              <div>
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="font-headline text-[10px] font-extrabold tracking-widest text-white/40 uppercase">最新シミュレーション結果</h3>
                  <span className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-white/60">2024.05.20 18:42</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-white/40">検証中のシナリオ</span>
                      <span className="text-sm font-bold">徒歩 / 2時間 / 晴れ</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-extrabold text-white/40">成立率</span>
                      <span className="text-3xl font-extrabold text-ochre">88%</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <span className="mb-2 block text-[10px] font-extrabold tracking-widest text-red-400 uppercase">発生している課題</span>
                    <p className="text-sm leading-relaxed font-bold text-red-100">
                      終盤の「荒砂神社」から駅への移動が、予定時間を12分超過するリスクを検出しました。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-terracotta py-3 text-sm font-bold text-white transition-all hover:brightness-110">
                  <MaterialIcon className="text-sm" name="refresh" /> 再試行
                </button>
                <button className="flex flex-1 items-center justify-center rounded-lg border border-white/10 bg-white/10 py-3 text-sm font-bold text-white transition-all hover:bg-white/20">
                  詳細レポート
                </button>
              </div>
            </div>

            <div className="ui-card p-8 md:col-span-12" id="readiness-checklist">
              <h3 className="font-headline mb-10 text-center text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">
                プロジェクト全体充足率 (公開準備状況)
              </h3>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-charcoal">シリーズ構成</span>
                      <span className="block text-[9px] leading-tight font-bold text-charcoal/40">全2件中1件が不完全</span>
                    </div>
                    <span className="text-2xl font-extrabold text-sage">80%</span>
                  </div>
                  <div className="progress-bar w-full">
                    <div className="progress-fill w-[80%] bg-sage" />
                  </div>
                </div>

                <div className="space-y-4" id="connected-spots">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-charcoal">スポットメタデータ</span>
                      <span className="block text-[9px] leading-tight font-bold text-charcoal/40">営業時間未入力あり</span>
                    </div>
                    <span className="text-2xl font-extrabold text-terracotta">45%</span>
                  </div>
                  <div className="progress-bar w-full">
                    <div className="progress-fill w-[45%] bg-terracotta" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-charcoal">シナリオ検証</span>
                      <span className="block text-[9px] leading-tight font-bold text-charcoal/40">AIプレビュー未完了</span>
                    </div>
                    <span className="text-2xl font-extrabold text-ochre">20%</span>
                  </div>
                  <div className="progress-bar w-full">
                    <div className="progress-fill w-[20%] bg-ochre" />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-3 border-t border-charcoal/5 pt-6">
                <MaterialIcon className="text-base text-charcoal/30" name="info" />
                <p className="text-[10px] font-bold text-charcoal/40 italic">
                  すべての項目を100%にすると、プロジェクト全体の最終承認プロセスが有効になります。
                </p>
              </div>
            </div>
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
