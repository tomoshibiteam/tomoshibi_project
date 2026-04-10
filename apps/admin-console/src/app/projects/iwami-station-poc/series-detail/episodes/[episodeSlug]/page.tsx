import Link from "next/link";
import { HeaderAuthControls } from "../../../../../_components/header-auth-controls";
import { MaterialIcon } from "../../../../../_components/material-icon";

type EpisodeSlug = "wave-reunion" | "local-culture" | "scenic-walk";

const episodeMeta: Record<
  EpisodeSlug,
  {
    title: string;
    role: string;
    target: string;
    temperature: string;
    fit: string;
  }
> = {
  "wave-reunion": {
    title: "波打ち際の再会 (歴史探索編)",
    role: "発見回",
    target: "初回向け",
    temperature: "静か / 内省的",
    fit: "徒歩・短〜中時間",
  },
  "local-culture": {
    title: "潮騒と暮らしの記憶 (地元文化編)",
    role: "深掘り回",
    target: "初回向け",
    temperature: "温かい / 親密",
    fit: "徒歩・中時間",
  },
  "scenic-walk": {
    title: "岬の先の光景 (絶景散策編)",
    role: "余韻回",
    target: "再訪向け",
    temperature: "開放 / 静謐",
    fit: "徒歩・中〜長時間",
  },
};

type PageProps = {
  params: Promise<{ episodeSlug: string }>;
};

export default async function EpisodeDetailPage({ params }: PageProps) {
  const { episodeSlug } = await params;
  const key = (episodeSlug in episodeMeta ? episodeSlug : "wave-reunion") as EpisodeSlug;
  const meta = episodeMeta[key];

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
            <Link
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="/projects/iwami-station-poc/series-detail"
            >
              <MaterialIcon className="text-[18px]" name="auto_stories" />
              <span className="text-sm">シリーズ</span>
            </Link>
            <a className="sidebar-item-active flex items-center gap-3 px-4 py-2 transition-all" href="#">
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
            <Link className="flex items-center text-charcoal/40 transition-colors hover:text-terracotta" href="/projects/iwami-station-poc/series-detail">
              <MaterialIcon className="text-sm" name="arrow_back" />
            </Link>
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">エピソード詳細設計</h2>
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
              <MaterialIcon className="text-9xl" name="history_edu" />
            </div>
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-terracotta/20 bg-terracotta/15 px-3 py-1 text-xs font-bold text-terracotta">エピソード設計図</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
                  <span className="text-xs font-bold text-sage">ステータス：設計中</span>
                </div>
                <span className="rounded bg-charcoal/5 px-2 py-1 text-[10px] font-bold text-charcoal/40">シリーズ：三浦半島・歴史の断片を辿る旅</span>
              </div>
              <h1 className="font-headline mb-6 text-4xl font-extrabold tracking-tight text-charcoal">{meta.title}</h1>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-charcoal/5 bg-paper/50 p-4 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black tracking-widest text-charcoal/40 uppercase">役割</label>
                  <p className="text-xs font-bold text-charcoal">{meta.role}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black tracking-widest text-charcoal/40 uppercase">対象</label>
                  <p className="text-xs font-bold text-charcoal">{meta.target}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black tracking-widest text-charcoal/40 uppercase">温度感</label>
                  <p className="text-xs font-bold text-charcoal">{meta.temperature}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black tracking-widest text-charcoal/40 uppercase">相性</label>
                  <p className="text-xs font-bold text-charcoal">{meta.fit}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="map" />
                    候補範囲マップ
                  </h3>
                  <span className="rounded border px-1.5 text-[9px] font-bold text-charcoal/40 uppercase">分布・密度可視化</span>
                </div>
                <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-charcoal/10 bg-paper/80">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(#3D3D3D 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
                    <div className="flex items-start justify-between">
                      <div className="sketch-border rounded-lg bg-white/90 p-3 shadow-sm">
                        <p className="mb-1 text-[10px] font-bold text-charcoal/60">起点：観音崎駅</p>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-terracotta" />
                          <span className="text-[11px] font-extrabold text-charcoal">徒歩15分圏内</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="rounded-full border border-sage/20 bg-sage/10 px-3 py-1 text-[10px] font-bold text-sage">雨天時成立エリア良好</div>
                      </div>
                    </div>

                    <div className="absolute top-1/2 left-1/3 h-4 w-4 animate-bounce rounded-full border-2 border-white bg-terracotta shadow-lg" />
                    <div className="absolute top-1/3 left-1/2 h-3 w-3 rounded-full border border-white bg-terracotta/60 shadow-md" />
                    <div className="absolute right-1/4 bottom-1/4 h-3 w-3 rounded-full border border-white bg-ochre/60 shadow-md" />
                    <div className="absolute top-1/4 right-1/3 h-3 w-3 rounded-full border border-white bg-secondary/60 shadow-md" />

                    <div className="mt-auto flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-terracotta" />
                        <span className="text-[10px] font-bold text-charcoal/60">コア候補</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-[10px] font-bold text-charcoal/60">補助候補</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-ochre" />
                        <span className="text-[10px] font-bold text-charcoal/60">休憩候補</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="database" />
                    エピソード候補スポットプール
                  </h3>
                  <div className="flex gap-2">
                    <span className="rounded bg-charcoal/5 px-2 py-0.5 text-[10px] font-bold text-charcoal/60">この中からAIが当日選択</span>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-5 gap-3">
                  <div className="rounded-lg border border-charcoal/5 bg-paper/50 p-3 text-center">
                    <p className="mb-1 text-[9px] font-black text-charcoal/40 uppercase">候補総数</p>
                    <p className="font-headline text-xl leading-none font-extrabold text-charcoal">12</p>
                  </div>
                  <div className="rounded-lg border border-terracotta/10 bg-terracotta/5 p-3 text-center">
                    <p className="mb-1 text-[9px] font-black text-terracotta/60 uppercase">コア</p>
                    <p className="font-headline text-xl leading-none font-extrabold text-terracotta">4</p>
                  </div>
                  <div className="rounded-lg border border-secondary/10 bg-secondary/5 p-3 text-center">
                    <p className="mb-1 text-[9px] font-black text-secondary/60 uppercase">補助</p>
                    <p className="font-headline text-xl leading-none font-extrabold text-secondary">5</p>
                  </div>
                  <div className="rounded-lg border border-ochre/10 bg-ochre/5 p-3 text-center">
                    <p className="mb-1 text-[9px] font-black text-ochre/60 uppercase">休憩</p>
                    <p className="font-headline text-xl leading-none font-extrabold text-ochre">3</p>
                  </div>
                  <div className="rounded-lg border border-charcoal/10 bg-charcoal/5 p-3 text-center opacity-40">
                    <p className="mb-1 text-[9px] font-black text-charcoal/60 uppercase">除外</p>
                    <p className="font-headline text-xl leading-none font-extrabold text-charcoal">8</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-3 w-1 rounded-full bg-terracotta" />
                      <h4 className="text-xs font-extrabold tracking-wider text-charcoal">
                        コア候補 <span className="ml-1 text-[10px] font-medium text-charcoal/40">歴史的痕跡の核</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="ui-card pool-card p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h5 className="text-sm leading-tight font-bold tracking-tight text-charcoal">観音崎砲台跡 (第一・第二)</h5>
                          <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[8px] font-black text-terracotta uppercase">遺構</span>
                        </div>
                        <p className="mb-3 text-[10px] leading-relaxed font-bold text-charcoal/60">レンガ造りの暗がりと、そこから見える海の対比が「生きた風景」の核となる。</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 rounded-full border border-charcoal/5 bg-paper/50 px-2 py-0.5 text-[8px] font-bold text-charcoal/50">
                            <MaterialIcon className="text-[10px]" name="directions_walk" /> 5分以内
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-sage/20 bg-sage/10 px-2 py-0.5 text-[8px] font-bold text-sage">
                            <MaterialIcon className="text-[10px]" name="umbrella" /> 雨天OK
                          </div>
                        </div>
                      </div>

                      <div className="ui-card pool-card p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h5 className="text-sm leading-tight font-bold tracking-tight text-charcoal">波打ち際の旧道</h5>
                          <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[8px] font-black text-terracotta uppercase">史跡</span>
                        </div>
                        <p className="mb-3 text-[10px] leading-relaxed font-bold text-charcoal/60">地形的な「境目」を感じやすく、内省的な語り出しに最適。</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 rounded-full border border-charcoal/5 bg-paper/50 px-2 py-0.5 text-[8px] font-bold text-charcoal/50">
                            <MaterialIcon className="text-[10px]" name="directions_walk" /> 12分
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-ochre/20 bg-ochre/10 px-2 py-0.5 text-[8px] font-bold text-ochre">
                            <MaterialIcon className="text-[10px]" name="cloud" /> 雨天△
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-3 w-1 rounded-full bg-secondary" />
                      <h4 className="text-xs font-extrabold tracking-wider text-charcoal">
                        準コア / 補助候補 <span className="ml-1 text-[10px] font-medium text-charcoal/40">体験の深掘り</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="ui-card pool-card p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h5 className="text-sm leading-tight font-bold tracking-tight text-charcoal">海岸沿いの民話碑</h5>
                          <span className="rounded bg-secondary/10 px-1.5 py-0.5 text-[8px] font-black text-secondary uppercase">伝承</span>
                        </div>
                        <p className="mb-3 text-[10px] leading-relaxed font-bold text-charcoal/60">案内役の語りを補強する具体的なエピソードの参照点。</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 rounded-full border border-charcoal/5 bg-paper/50 px-2 py-0.5 text-[8px] font-bold text-charcoal/50">
                            <MaterialIcon className="text-[10px]" name="directions_walk" /> 15分
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-3 w-1 rounded-full bg-ochre" />
                      <h4 className="text-xs font-extrabold tracking-wider text-charcoal">
                        休憩 / 立ち寄り候補 <span className="ml-1 text-[10px] font-medium text-charcoal/40">内省の余白</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="ui-card pool-card p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h5 className="text-sm leading-tight font-bold tracking-tight text-charcoal">海が見える東屋</h5>
                          <span className="rounded bg-ochre/10 px-1.5 py-0.5 text-[8px] font-black text-ochre uppercase">休憩</span>
                        </div>
                        <p className="mb-3 text-[10px] leading-relaxed font-bold text-charcoal/60">物語の最後、波音だけを聞きながら振り返るための場所。</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 rounded-full border border-sage/20 bg-sage/10 px-2 py-0.5 text-[8px] font-bold text-sage">
                            <MaterialIcon className="text-[10px]" name="umbrella" /> 雨天回避可
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-charcoal/5 pt-4">
                    <button className="flex items-center gap-2 text-[10px] font-black tracking-widest text-charcoal/30 uppercase transition-colors hover:text-charcoal/60">
                      <MaterialIcon className="text-sm" name="visibility_off" />
                      除外対象スポットを表示 (8件)
                    </button>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-charcoal p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-charcoal" name="psychology" />
                    感情と伝承
                  </h3>
                  <span className="rounded border px-1.5 text-[9px] font-bold text-charcoal/40 uppercase">コンセプト定義</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">コア・メッセージ</label>
                    <div className="rounded-xl border border-charcoal/5 bg-paper/50 p-4">
                      <p className="text-sm leading-relaxed font-bold text-charcoal">ただの「史跡」が、個人の記憶と重なり合うことで「生きた風景」に変わる瞬間を体験させる。</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-charcoal/5 bg-paper/30 p-4">
                      <label className="mb-2 block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">主要な感情ターゲット</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded border border-secondary/20 bg-secondary/10 px-2 py-1 text-[10px] font-bold text-secondary">郷愁（ノスタルジー）</span>
                        <span className="rounded border border-tertiary/20 bg-tertiary/10 px-2 py-1 text-[10px] font-bold text-tertiary">知的好奇心</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-charcoal/5 bg-paper/30 p-4">
                      <label className="mb-2 block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">体験終了時の余韻</label>
                      <p className="text-[10px] leading-relaxed font-bold text-charcoal/70">「どこか懐かしい、誰かの物語」を自分事として持ち帰る感覚。</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-sage p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-sage" name="visibility" />
                    必須観点と禁止表現
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-sage/10 bg-sage/5 p-4">
                    <label className="mb-2 block text-[10px] font-extrabold tracking-widest text-sage uppercase">必ず含めたい観点</label>
                    <p className="text-[10px] leading-relaxed font-bold text-charcoal/70">戦時中の砲台跡としての冷たさと、現在の静かな海とのコントラスト。地元住民に伝わる民話的側面。</p>
                  </div>
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <label className="mb-2 block text-[10px] font-extrabold tracking-widest text-red-500 uppercase">禁止したい表現</label>
                    <p className="text-[10px] leading-relaxed font-bold text-charcoal/70">過度な戦記調や暴力的な描写。公式の歴史教科書のような無機質な年表の読み上げ。</p>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="route" />
                    体験成立要件とAI可変性
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">抽象的成立要件</label>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 rounded-lg border border-charcoal/5 bg-paper/30 p-3">
                        <MaterialIcon className="text-sm text-charcoal/40" name="history_edu" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] leading-tight font-bold text-charcoal/80">歴史的痕跡の可読性</p>
                          <p className="text-[9px] font-medium text-charcoal/40">選定されるスポットは、案内役が語る「かつての光景」を視覚的に重ねられる痕跡を有すること。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border border-charcoal/5 bg-paper/30 p-3">
                        <MaterialIcon className="text-sm text-charcoal/40" name="spatial_audio_off" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] leading-tight font-bold text-charcoal/80">静粛な立ち止まり環境</p>
                          <p className="text-[9px] font-medium text-charcoal/40">1分以上の解説を集中して聴取可能な、交通騒音の少ない地点がルートに含まれること。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border border-charcoal/5 bg-paper/30 p-3">
                        <MaterialIcon className="text-sm text-charcoal/40" name="directions_walk" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] leading-tight font-bold text-charcoal/80">徒歩移動のシークエンス</p>
                          <p className="text-[9px] font-medium text-charcoal/40">スポット間の移動が「内省の時間」として機能するよう、適切な徒歩移動距離を確保すること。</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-extrabold tracking-widest text-terracotta uppercase">当日AIの可変範囲</label>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between border-b border-charcoal/5 p-2">
                        <span className="text-[11px] font-bold">スポット選択</span>
                        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[9px] font-black text-terracotta">プール内から動的選定</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-charcoal/5 p-2">
                        <span className="text-[11px] font-bold">順路構築</span>
                        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[9px] font-black text-terracotta">移動効率×文脈で最適化</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-charcoal/5 p-2">
                        <span className="text-[11px] font-bold">台詞差分</span>
                        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[9px] font-black text-terracotta">天候・時間・属性で生成</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-charcoal/5 p-2">
                        <span className="text-[11px] font-bold">演出トーン</span>
                        <span className="rounded bg-ochre/10 px-1.5 py-0.5 text-[9px] font-black text-ochre">一部可変</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-charcoal/5 p-2">
                        <span className="text-[11px] font-bold">コアメッセージ</span>
                        <span className="rounded bg-charcoal/5 px-1.5 py-0.5 text-[9px] font-black text-charcoal/40 uppercase">固定</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6 lg:col-span-4">
              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center gap-2">
                  <MaterialIcon className="text-terracotta" name="settings_input_component" />
                  <h3 className="font-headline text-sm font-extrabold tracking-widest text-charcoal uppercase">運用ルール：生成3層化</h3>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-charcoal/10 bg-charcoal/5 p-4">
                    <h4 className="mb-2 text-[10px] font-black text-charcoal uppercase">固定（Core）</h4>
                    <p className="text-[10px] leading-relaxed font-bold text-charcoal/60">コアメッセージ、禁止表現、案内役の人格の芯、歴史解釈の境界</p>
                  </div>
                  <div className="rounded-xl border border-terracotta/10 bg-terracotta/5 p-4">
                    <h4 className="mb-2 text-[10px] font-black text-terracotta uppercase">AI可変（Flexible）</h4>
                    <p className="text-[10px] leading-relaxed font-bold text-charcoal/60">周辺描写、導入の入り方、接続文、余韻</p>
                  </div>
                  <div className="rounded-xl border border-ochre/10 bg-ochre/5 p-4">
                    <h4 className="mb-2 text-[10px] font-black text-ochre uppercase">人確認推奨（Review）</h4>
                    <p className="text-[10px] leading-relaxed font-bold text-charcoal/60">史実に見える演出、強い感情表現、現地固有名詞</p>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border border-l-4 border-l-terracotta p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-charcoal uppercase">
                    <MaterialIcon className="text-lg text-terracotta" name="record_voice_over" />
                    案内役の役割
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-charcoal/5 bg-paper/50 p-3">
                    <label className="mb-1 block text-[9px] font-extrabold tracking-widest text-terracotta uppercase">キャラクター</label>
                    <p className="text-[11px] leading-relaxed font-bold text-charcoal/80">老漁師の語り：目撃者としての振る舞い</p>
                  </div>
                  <div className="rounded-lg border border-charcoal/5 bg-paper/50 p-3">
                    <label className="mb-1 block text-[9px] font-extrabold tracking-widest text-terracotta uppercase">語り口</label>
                    <p className="text-[11px] leading-relaxed font-bold text-charcoal/80">潮風に合わせたゆっくりとしたテンポと親しみのある口語</p>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border p-6">
                <div className="mb-6 flex items-center gap-2">
                  <MaterialIcon className="text-terracotta" name="precision_manufacturing" />
                  <h3 className="font-headline text-sm font-extrabold tracking-widest text-charcoal uppercase">シミュレーション適性</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon className="text-sm text-sage" name="thumb_up" />
                      <span className="text-[10px] font-bold text-charcoal/60 uppercase">成立しやすい</span>
                    </div>
                    <p className="pl-6 text-[10px] font-bold text-charcoal/80">徒歩、晴天〜曇天、15〜30分</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon className="text-sm text-ochre" name="thumb_down" />
                      <span className="text-[10px] font-bold text-charcoal/60 uppercase">苦手な条件</span>
                    </div>
                    <p className="pl-6 text-[10px] font-bold text-charcoal/80">雨天強風、騒がしい時間帯、自転車高速移動</p>
                  </div>
                </div>
              </section>

              <section className="ui-card sketch-border relative overflow-hidden rounded-xl border-none bg-charcoal p-6 text-white shadow-lg">
                <div className="absolute -top-4 -right-4 opacity-10">
                  <MaterialIcon className="text-8xl text-tertiary" name="smart_toy" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MaterialIcon className="text-tertiary" name="auto_awesome" />
                      <h3 className="font-headline text-sm font-extrabold tracking-tight uppercase">AI 設計アシスタント</h3>
                    </div>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  </div>

                  <div className="space-y-3">
                    <div className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 p-3 transition-all hover:bg-red-500/20">
                      <div className="mb-1 flex items-center gap-2">
                        <MaterialIcon className="text-xs text-red-400" name="warning" />
                        <span className="rounded bg-red-400/20 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-red-400 uppercase">要修正</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-red-200">コア候補の密度が低い</p>
                        <p className="text-[10px] leading-relaxed opacity-60">「発見」を確実にするため、歴史的痕跡の強いスポットをあと2箇所プールに追加すべきです。</p>
                      </div>
                    </div>

                    <div className="cursor-pointer rounded-lg border border-white/10 bg-white/10 p-3 transition-all hover:bg-white/20">
                      <div className="mb-1 flex items-center gap-2">
                        <MaterialIcon className="text-xs text-tertiary" name="lightbulb" />
                        <span className="rounded bg-tertiary/20 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-tertiary uppercase">改善提示</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-tertiary">候補範囲が広すぎる懸念</p>
                        <p className="text-[10px] leading-relaxed opacity-60">徒歩圏内ギリギリのスポットが含まれています。AIによる除外優先度を設定してください。</p>
                      </div>
                    </div>

                    <div className="cursor-pointer rounded-lg border border-white/10 bg-white/10 p-3 transition-all hover:bg-white/20">
                      <div className="mb-1 flex items-center gap-2">
                        <MaterialIcon className="text-xs text-sage" name="check_circle" />
                        <span className="rounded bg-sage/20 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-sage uppercase">整合性良</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-bold opacity-80">スポット間の歴史的文脈の繋がりは良好です。</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/60">設計完了度</span>
                      <span className="text-[10px] font-black text-tertiary">74%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-tertiary" style={{ width: "74%" }} />
                    </div>
                  </div>

                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta py-2.5 text-xs font-black text-white shadow-lg transition-all hover:brightness-110">
                    プールを再スキャン
                    <MaterialIcon className="text-[14px]" name="refresh" />
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
