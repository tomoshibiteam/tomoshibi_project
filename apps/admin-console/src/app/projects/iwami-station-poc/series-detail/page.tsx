/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HeaderAuthControls } from "../../../_components/header-auth-controls";
import { MaterialIcon } from "../../../_components/material-icon";

export default function SeriesDetailPage() {
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
            href="/projects/iwami-station-poc"
          >
            <MaterialIcon className="text-[20px]" name="folder_open" />
            <span className="text-sm">プロジェクト</span>
          </Link>

          <div className="mt-1 ml-4 space-y-0.5 border-l border-charcoal/10">
            <Link
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="/projects/iwami-station-poc/spots?series=sea-memory"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </Link>
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

      <main className="ml-64 min-h-screen">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link className="flex items-center text-charcoal/40 transition-colors hover:text-terracotta" href="/projects/iwami-station-poc">
              <MaterialIcon className="text-sm" name="arrow_back" />
            </Link>
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">シリーズ詳細</h2>
            <div className="rounded border border-charcoal/10 bg-charcoal/5 px-2.5 py-1 text-[10px] font-bold tracking-widest text-charcoal/60 uppercase">
              設計中
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full border border-terracotta/20 px-5 py-1.5 text-sm font-bold text-terracotta transition-colors hover:bg-terracotta/5">
              プレビュー
            </button>
            <button className="rounded-full bg-terracotta px-6 py-1.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90">
              保存
            </button>
            <HeaderAuthControls className="ml-2" showNotifications={false} />
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-8">
          <div className="ui-card sketch-border group overflow-hidden p-8">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]">
              <MaterialIcon className="text-9xl" name="auto_stories" />
            </div>
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-tertiary/20 bg-tertiary/15 px-3 py-1 text-xs font-bold text-tertiary">シリーズハブ</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
                  <span className="text-xs font-bold text-sage">ステータス：設計中</span>
                </div>
                <span className="rounded bg-charcoal/5 px-2 py-1 text-[10px] font-bold text-charcoal/40">プロジェクト: 岩美の記憶 2024</span>
              </div>
              <h1 className="font-headline mb-4 text-4xl font-extrabold tracking-tight text-charcoal">海の物語 - 岩美の記憶</h1>
              <div className="mb-6 space-y-1">
                <p className="text-sm font-bold text-charcoal/80">
                  <span className="hand-drawn-underline">コンセプト：</span> 波音に紛れる故郷の記憶を、歩いて辿る没入体験
                </p>
                <div className="flex gap-4 text-xs font-bold text-charcoal/60">
                  <p>目的：再訪意欲の向上（リピーター創出）</p>
                  <p>体験タイプ：ドラマチック・ウォーク</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="sketch-border flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:brightness-110">
                  <MaterialIcon className="text-[18px]" name="edit" />
                  基本設定を編集
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-charcoal/20 bg-white px-4 py-2 text-sm font-bold text-charcoal transition-all hover:bg-charcoal/5">
                  <MaterialIcon className="text-[18px]" name="add_circle" />
                  テンプレート管理
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <section className="ui-card sketch-border overflow-hidden">
                <div className="flex items-center justify-between border-b border-charcoal/10 p-6">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="map" />
                    シリーズ内スポットプールマップ
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-terracotta" />
                      <span className="text-[10px] font-bold text-charcoal/60 uppercase">特定EP使用</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-tertiary" />
                      <span className="text-[10px] font-bold text-charcoal/60 uppercase">複数EP共有</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-charcoal/20" />
                      <span className="text-[10px] font-bold text-charcoal/60 uppercase">未使用</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="map-container relative h-[400px] flex-1">
                    <div className="absolute top-1/4 left-1/3 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-terracotta shadow-sm">
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-tertiary shadow-sm">
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="absolute top-1/3 right-1/4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-charcoal/20 shadow-sm">
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="absolute bottom-1/4 left-1/4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-terracotta shadow-sm">
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 space-y-1 rounded-lg border border-charcoal/10 bg-white/90 p-3 text-[10px] font-bold shadow-sm backdrop-blur">
                      <p className="tracking-widest text-charcoal/40 uppercase">現在の表示</p>
                      <p className="text-charcoal">岩美町 全域（海岸エリア中心）</p>
                    </div>
                  </div>

                  <div className="w-full space-y-6 border-l border-charcoal/10 bg-paper/30 p-6 md:w-56">
                    <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">統計サマリー</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-charcoal/50 uppercase">総カバレッジ</p>
                        <p className="text-sm font-black text-charcoal">12.5 km²</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-charcoal/50 uppercase">総スポット数</p>
                        <p className="text-sm font-black text-charcoal">
                          22 <span className="text-[10px] font-bold opacity-40">箇所</span>
                        </p>
                      </div>
                      <div className="border-t border-charcoal/10 pt-4">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-charcoal/60">共有スポット</span>
                          <span className="text-[10px] font-black text-tertiary">08</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-charcoal/60">未使用スポット</span>
                          <span className="text-[10px] font-black text-charcoal/40">04</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex w-full items-center justify-center gap-1 rounded border border-charcoal/20 bg-white py-2 text-[10px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                      <MaterialIcon className="text-sm" name="open_in_full" />
                      マップを全画面表示
                    </button>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="analytics" />
                    エピソード別候補分布
                  </h3>
                  <span className="rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-charcoal/40 uppercase">素材密度分析</span>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">歴史探索編</span>
                        <span className="rounded bg-charcoal/5 px-1.5 text-[9px] font-black text-charcoal/40">歴史</span>
                      </div>
                      <span className="text-xs font-black text-charcoal">
                        12 <span className="text-[10px] font-medium opacity-40 italic">spots</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal/5">
                      <div className="h-full bg-terracotta" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">地元文化編</span>
                        <span className="rounded bg-charcoal/5 px-1.5 text-[9px] font-black text-charcoal/40">文化</span>
                      </div>
                      <span className="text-xs font-black text-charcoal">
                        08 <span className="text-[10px] font-medium opacity-40 italic">spots</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal/5">
                      <div className="h-full bg-terracotta" style={{ width: "66%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">絶景散策編</span>
                        <span className="rounded bg-charcoal/5 px-1.5 text-[9px] font-black text-charcoal/40">景色</span>
                      </div>
                      <span className="text-xs font-black text-charcoal">
                        05 <span className="text-[10px] font-medium opacity-40 italic">spots</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal/5">
                      <div className="h-full bg-terracotta" style={{ width: "42%" }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">伝統工芸編</span>
                        <span className="rounded bg-charcoal/5 px-1.5 text-[9px] font-black text-charcoal/40">オリジナル</span>
                      </div>
                      <span className="text-xs font-black text-charcoal">
                        03 <span className="text-[10px] font-medium opacity-40 italic">spots</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal/5">
                      <div className="h-full bg-terracotta" style={{ width: "25%" }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-charcoal/5 bg-paper/50 p-4">
                  <p className="text-[10px] leading-relaxed font-bold text-charcoal/60 italic">
                    <MaterialIcon className="mr-1 inline-block align-middle text-xs" name="info" />
                    「絶景散策編」および「伝統工芸編」のスポット密度が低めです。物語の展開に厚みを持たせるため、追加のスポット登録を検討してください。
                  </p>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-charcoal p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-charcoal" name="account_tree" />
                    キャスト・キャラクター定義（固定）
                  </h3>
                  <span className="rounded border px-1.5 text-[9px] font-bold text-charcoal/40 uppercase">固定キャスト</span>
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                  <div className="w-full shrink-0 md:w-48">
                    <div className="sketch-border group/img relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-paper/50">
                      <img
                        alt="Character Profile"
                        className="h-full w-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZujzDkElwT_J39lqGbFIRs_VkQJJh8aKk43fNAiB_UJJs7g-u54jhQhal2ClRiouY_qeuWBeQIJSyDtSxGVct6XH5CXlpWSjumuPdtDHOkknfJ8ZlnEnRPnoHYtuWjj0_JYCZfnPx785DRqn6j5V0VRuo0tuYjpPSfTs7y74S-N3rDkp2Otcf8xrldjjUxVgey9Sfs48i5ByOg1LZJHW7zqI_Q2YZx9XqUY7oASV3sqLqi3UJyWaeI90_6vSfpvPKFBmqIhVpEzM"
                      />
                    </div>
                    <button className="flex w-full items-center justify-center gap-1 rounded border border-charcoal/20 bg-white py-2 text-[10px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                      <MaterialIcon className="text-sm" name="settings" /> 属性定義を編集
                    </button>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">ナレーター名</label>
                        <p className="text-lg font-bold text-charcoal">シズク</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">主要な役割</label>
                        <span className="inline-flex items-center rounded border border-tertiary/20 bg-tertiary/10 px-2.5 py-0.5 text-[10px] font-bold text-tertiary">
                          地元の語り部
                        </span>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">登場範囲・条件</label>
                        <p className="text-xs leading-relaxed font-bold text-charcoal/80">全エピソードに登場。ただし、第3章「忘却の淵」では声のみの出演。</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">声のトーンと距離感</label>
                        <div className="rounded-lg border border-charcoal/5 bg-paper/50 p-3">
                          <div className="mb-1.5 flex justify-between text-[9px] font-extrabold tracking-tighter text-charcoal/40 opacity-40 uppercase">
                            <span>親密</span>
                            <span>客観</span>
                          </div>
                          <div className="relative h-1.5 w-full rounded-full bg-charcoal/10">
                            <div className="absolute top-1/2 left-1/4 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-terracotta shadow-sm" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">再訪時の振る舞い</label>
                        <p className="text-xs font-bold text-charcoal/80">前回の会話内容を断片的に言及し、時間軸の連続性を強調する。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-terracotta/40 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-sage" name="public" />
                    世界観・ロジック定義（固定）
                  </h3>
                  <span className="rounded border border-sage/20 px-1.5 text-[9px] font-bold text-sage/60 uppercase">コアロジック</span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-charcoal/5 bg-paper/50 p-4">
                    <h4 className="mb-4 text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">視点バランス</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">ドキュメンタリー</span>
                        <span className="text-[10px] font-bold">40%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-charcoal/5">
                        <div className="h-full bg-sage" style={{ width: "40%" }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">物語演出</span>
                        <span className="text-[10px] font-bold">60%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-charcoal/5">
                        <div className="h-full bg-terracotta" style={{ width: "60%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 rounded-xl border border-charcoal/5 bg-paper/50 p-4">
                    <h4 className="mb-4 text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">禁止事項と事実保全ルール</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black tracking-tight text-red-500 uppercase">禁止事項</p>
                        <ul className="space-y-1.5 text-[10px] font-bold text-charcoal/70">
                          <li>• 現代的なスラングの使用</li>
                          <li>• 地域の歴史に対する過度な美化</li>
                        </ul>
                      </div>
                      <div className="space-y-2 border-l border-charcoal/10 pl-4">
                        <p className="text-[9px] font-black tracking-tight text-sage uppercase">事実ルール</p>
                        <p className="text-[10px] leading-relaxed font-bold text-charcoal/70">
                          地名、1920年代の気象データは史実に基づく。民話の解釈のみ許可。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6" id="episode-framework">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="schema" />
                    エピソードテンプレート一覧
                  </h3>
                  <Link
                    className="sketch-border flex items-center gap-1 rounded bg-terracotta px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm hover:brightness-110"
                    href="/projects/iwami-station-poc/series-detail/episodes/new"
                  >
                    <MaterialIcon className="text-[14px]" name="add" />
                    テンプレート追加
                  </Link>
                </div>

                <div className="space-y-2">
                  <div className="group flex items-center justify-between rounded-lg border border-charcoal/10 bg-paper/30 p-4 transition-all hover:border-terracotta hover:bg-white">
                    <div className="flex items-center gap-6">
                      <span className="w-32 text-sm font-bold text-charcoal">歴史探索編</span>
                      <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2 py-0.5 text-[9px] font-black text-charcoal/40 uppercase">歴史</span>
                    </div>
                    <Link
                      className="rounded border border-terracotta/20 px-3 py-1.5 text-[10px] font-bold text-terracotta transition-colors hover:bg-terracotta/5"
                      href="/projects/iwami-station-poc/series-detail/episodes/wave-reunion"
                    >
                      詳細を編集
                    </Link>
                  </div>

                  <div className="group flex items-center justify-between rounded-lg border border-charcoal/10 bg-paper/30 p-4 transition-all hover:border-terracotta hover:bg-white">
                    <div className="flex items-center gap-6">
                      <span className="w-32 text-sm font-bold text-charcoal">地元文化編</span>
                      <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2 py-0.5 text-[9px] font-black text-charcoal/40 uppercase">文化</span>
                    </div>
                    <Link
                      className="rounded border border-terracotta/20 px-3 py-1.5 text-[10px] font-bold text-terracotta transition-colors hover:bg-terracotta/5"
                      href="/projects/iwami-station-poc/series-detail/episodes/local-culture"
                    >
                      詳細を編集
                    </Link>
                  </div>

                  <div className="group flex items-center justify-between rounded-lg border border-charcoal/10 bg-paper/30 p-4 transition-all hover:border-terracotta hover:bg-white">
                    <div className="flex items-center gap-6">
                      <span className="w-32 text-sm font-bold text-charcoal">絶景散策編</span>
                      <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2 py-0.5 text-[9px] font-black text-charcoal/40 uppercase">景色</span>
                    </div>
                    <Link
                      className="rounded border border-terracotta/20 px-3 py-1.5 text-[10px] font-bold text-terracotta transition-colors hover:bg-terracotta/5"
                      href="/projects/iwami-station-poc/series-detail/episodes/scenic-walk"
                    >
                      詳細を編集
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6 lg:col-span-4">
              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center gap-2">
                  <MaterialIcon className="text-terracotta" name="dynamic_feed" />
                  <h3 className="font-headline text-sm font-extrabold tracking-widest text-charcoal uppercase">継続性・分岐ロジック</h3>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl border border-charcoal/5 bg-paper/30 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-terracotta uppercase">
                      <MaterialIcon className="text-sm" name="database" />
                      引き継ぎプロパティ
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-charcoal/60">好感度</span>
                        <span className="text-terracotta uppercase">有効</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-charcoal/60">解放済みシーン</span>
                        <span className="text-terracotta uppercase">永続</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-charcoal/5 bg-paper/30 p-4">
                    <h4 className="mb-4 text-[10px] font-extrabold tracking-widest text-terracotta uppercase">再訪インタラクション</h4>
                    <div className="relative space-y-5 border-l-2 border-charcoal/10 pl-5">
                      <div className="relative">
                        <div className="absolute top-1 -left-[24.5px] h-2 w-2 rounded-full bg-terracotta" />
                        <p className="text-[10px] font-black text-charcoal">初回: 発見</p>
                        <p className="text-[9px] font-bold text-charcoal/50">その場の概略と伝説を語る</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-1 -left-[24.5px] h-2 w-2 rounded-full bg-sage" />
                        <p className="text-[10px] font-black text-charcoal">2回目: 共鳴</p>
                        <p className="text-[9px] font-bold text-charcoal/50">より個人的な秘話を共有。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-charcoal uppercase">
                    <MaterialIcon className="text-sm text-sage" name="location_on" />
                    スポットプール状況
                  </h3>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded border border-charcoal/5 bg-paper/50 p-2 text-center">
                    <p className="text-[8px] font-black text-charcoal/30 uppercase">総数</p>
                    <p className="text-sm font-black text-charcoal">22</p>
                  </div>
                  <div className="rounded border border-sage/10 bg-sage/5 p-2 text-center">
                    <p className="text-[8px] font-black text-sage uppercase">必須</p>
                    <p className="text-sm font-black text-sage">04</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 opacity-60">
                  <span className="rounded border border-charcoal/10 bg-white px-1.5 py-0.5 text-[9px] font-bold">岩美駅</span>
                  <span className="rounded border border-charcoal/10 bg-white px-1.5 py-0.5 text-[9px] font-bold">浦富海岸</span>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-terracotta p-6">
                <h3 className="font-headline mb-4 flex items-center gap-2 text-sm font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="science" />
                  検証・シミュレーション
                </h3>

                <div className="space-y-4 rounded-xl border border-charcoal/5 bg-paper/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">設計の整合性</span>
                    <span className="rounded border border-sage/20 bg-sage/10 px-2 py-0.5 text-[9px] font-extrabold text-sage">合格</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-sage" />
                      <span className="text-[10px] font-bold text-charcoal/70">叙述トリック整合性: OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                      <span className="text-[10px] font-bold text-charcoal/70">スポット連結密度: 82%</span>
                    </div>
                  </div>

                  <button className="sketch-border w-full rounded bg-charcoal/5 py-2 text-[9px] font-black tracking-widest text-charcoal uppercase transition-colors hover:bg-charcoal/10">
                    バリデーションを実行
                  </button>
                </div>
              </section>

              <section className="ui-card sketch-border relative overflow-hidden rounded-xl border-none bg-charcoal p-6 text-white shadow-lg">
                <div className="absolute -top-4 -right-4 opacity-10">
                  <MaterialIcon className="text-8xl text-tertiary" name="auto_awesome" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MaterialIcon className="text-tertiary" name="auto_awesome" />
                      <h3 className="font-headline text-sm font-extrabold tracking-tight uppercase">AI 設計レビュー</h3>
                    </div>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-black">2.4</span>
                  </div>

                  <div className="space-y-3">
                    <div className="group cursor-pointer rounded-lg border border-white/10 bg-white/10 p-3 transition-all hover:bg-white/20">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="rounded bg-tertiary/20 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-tertiary uppercase">
                          トーン不整合
                        </span>
                        <MaterialIcon className="text-xs transition-transform group-hover:translate-x-1" name="chevron_right" />
                      </div>
                      <p className="text-[11px] leading-relaxed font-bold opacity-80">
                        エピソード2の語りが一部客観的すぎます。「慈しみ」のトーンを維持するよう修正が必要です。
                      </p>
                    </div>
                  </div>

                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta py-2.5 text-xs font-black text-white shadow-lg transition-all hover:brightness-110">
                    フルプレビューを実行
                    <MaterialIcon className="text-[14px]" name="analytics" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="ml-64 flex items-center justify-between border-t border-charcoal/10 bg-transparent px-8 py-10 text-[10px] font-bold tracking-widest text-charcoal/40 italic uppercase">
        <div>
          © 2024 TOMOSHIBIスタジオ. <span className="hand-drawn-underline">地域の物語に、光を。</span>
        </div>
        <div className="flex gap-6 opacity-30">
          <MaterialIcon className="text-sm" name="light" />
          <MaterialIcon className="text-sm" name="map" />
          <MaterialIcon className="text-sm" name="history_edu" />
        </div>
      </footer>
    </>
  );
}
