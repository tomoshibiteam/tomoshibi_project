import Link from "next/link";
import { HeaderAuthControls } from "../../../../../_components/header-auth-controls";
import { MaterialIcon } from "../../../../../_components/material-icon";

export default function NewEpisodePage() {
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
            <a
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-charcoal/60 transition-all hover:bg-white/60 hover:text-terracotta"
              href="#"
            >
              <MaterialIcon className="text-[18px]" name="location_on" />
              <span className="text-sm">スポット</span>
            </a>
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

      <main className="ml-64 min-h-screen pb-28">
        <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              className="flex items-center text-charcoal/40 transition-colors hover:text-terracotta"
              href="/projects/iwami-station-poc/series-detail"
            >
              <MaterialIcon className="text-sm" name="arrow_back" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal/40">
              <span>エピソード</span>
              <MaterialIcon className="text-sm" name="chevron_right" />
            </div>
            <h2 className="font-headline text-lg font-extrabold tracking-tight text-charcoal">新規作成</h2>
            <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-ochre uppercase">
              下書き
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full border border-terracotta/20 px-5 py-1.5 text-sm font-bold text-terracotta transition-colors hover:bg-terracotta/5">
              プレビュー
            </button>
            <HeaderAuthControls />
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-8">
          <section className="ui-card border-b-4 border-b-terracotta p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-3xl space-y-3">
                <div className="flex items-center gap-2 text-charcoal/40">
                  <MaterialIcon className="text-base" name="history_edu" />
                  <span className="text-[10px] font-extrabold tracking-widest uppercase">Episode Setup</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-charcoal">エピソード構成の定義</h1>
                <p className="text-sm leading-relaxed font-medium text-charcoal/70">
                  物語の意味と使用スポット候補を定義し、ルート生成に必要な前提を整理します。
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-1">
                <button className="rounded-lg border border-charcoal/15 bg-white px-4 py-2 text-xs font-bold text-charcoal transition-all hover:bg-charcoal/5">
                  入力を一時保存
                </button>
                <button className="rounded-lg border border-ochre/20 bg-ochre/10 px-4 py-2 text-xs font-bold text-ochre transition-all hover:bg-ochre/20">
                  テンプレート読込
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-terracotta" name="info" />
                  基本情報
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">親シリーズ</span>
                    <div className="rounded-lg border border-charcoal/10 bg-paper/50 px-4 py-3 text-sm font-bold text-charcoal/80">
                      隠岐諸島：海と人の記録
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="episode-name"
                    >
                      エピソード名
                    </label>
                    <input
                      id="episode-name"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      placeholder="潮風が運ぶ、千年の記憶"
                      type="text"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="episode-role"
                    >
                      役割
                    </label>
                    <div className="relative">
                      <select
                        id="episode-role"
                        className="w-full appearance-none rounded-lg border border-charcoal/10 bg-white px-4 py-3 pr-10 text-sm font-medium focus:border-terracotta focus:outline-none"
                        defaultValue="発見 (Discovery)"
                      >
                        <option>導入 (Intro)</option>
                        <option>発見 (Discovery)</option>
                        <option>深化 (Deep Dive)</option>
                        <option>結び (Conclusion)</option>
                      </select>
                      <MaterialIcon
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-charcoal/40"
                        name="expand_more"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">訪問種別</span>
                    <div className="flex h-11 items-center gap-6 rounded-lg border border-charcoal/10 bg-white px-4">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-charcoal/70">
                        <input className="h-4 w-4 border-charcoal/20 text-terracotta focus:ring-terracotta" name="visit_type" type="radio" />
                        再訪
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-charcoal/70">
                        <input
                          className="h-4 w-4 border-charcoal/20 text-terracotta focus:ring-terracotta"
                          defaultChecked
                          name="visit_type"
                          type="radio"
                        />
                        初めて
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-sage" name="psychology" />
                  物語の核心
                </h3>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                      htmlFor="episode-message"
                    >
                      伝えたいこと・メッセージ
                    </label>
                    <textarea
                      id="episode-message"
                      className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm leading-relaxed font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                      placeholder="厳しい自然環境の中で育まれた独自の文化と、そこに住む人々の力強さを伝えたい"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <span className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">ターゲット感情</span>
                      <div className="flex flex-wrap gap-2 rounded-lg border border-charcoal/10 bg-white p-3">
                        <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-1 text-[10px] font-bold text-ochre">畏敬の念</span>
                        <span className="rounded border border-ochre/20 bg-ochre/10 px-2.5 py-1 text-[10px] font-bold text-ochre">郷愁</span>
                        <button className="rounded border border-dashed border-charcoal/20 px-2.5 py-1 text-[10px] font-bold text-charcoal/40 transition-colors hover:bg-charcoal/5">
                          + 追加
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        className="block text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase"
                        htmlFor="banned-expression"
                      >
                        禁止表現
                      </label>
                      <input
                        id="banned-expression"
                        className="w-full rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                        placeholder="「過疎」「何もない」などのネガティブな強調"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-ochre" name="record_voice_over" />
                  案内役の役割
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-charcoal/10 bg-paper/40 p-4">
                    <p className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">キャラクター</p>
                    <p className="mt-1 text-sm font-bold text-charcoal/80">老漁師の語り：目撃者としての振る舞い</p>
                  </div>
                  <div className="rounded-lg border border-charcoal/10 bg-paper/40 p-4">
                    <p className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">語り口</p>
                    <p className="mt-1 text-sm font-bold text-charcoal/80">潮風に合わせたゆっくりとしたテンポと親しみのある口語</p>
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline flex items-center gap-2 text-lg font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="database" />
                    エピソード候補スポットプール
                  </h3>
                  <button className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 text-[10px] font-bold text-charcoal transition-all hover:bg-charcoal/5">
                    スポットを追加選択
                  </button>
                </div>

                <p className="mb-4 text-xs font-medium text-charcoal/60">
                  シリーズプールから、このエピソードに適したスポット候補を絞り込みます。
                </p>

                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
                  <div className="rounded-lg border border-charcoal/10 bg-charcoal/5 p-3 text-center">
                    <p className="text-[9px] font-extrabold tracking-widest text-charcoal/40 uppercase">総数</p>
                    <p className="mt-1 text-lg font-extrabold text-charcoal">42</p>
                  </div>
                  <div className="rounded-lg border border-terracotta/20 bg-terracotta/5 p-3 text-center">
                    <p className="text-[9px] font-extrabold tracking-widest text-terracotta/60 uppercase">使用可能</p>
                    <p className="mt-1 text-lg font-extrabold text-terracotta">12</p>
                  </div>
                  <div className="rounded-lg border border-terracotta/10 bg-terracotta/5 p-3 text-center">
                    <p className="text-[9px] font-extrabold tracking-widest text-terracotta/60 uppercase">コア</p>
                    <p className="mt-1 text-lg font-extrabold text-terracotta">4</p>
                  </div>
                  <div className="rounded-lg border border-sage/10 bg-sage/5 p-3 text-center">
                    <p className="text-[9px] font-extrabold tracking-widest text-sage/60 uppercase">補助</p>
                    <p className="mt-1 text-lg font-extrabold text-sage">5</p>
                  </div>
                  <div className="rounded-lg border border-ochre/10 bg-ochre/5 p-3 text-center">
                    <p className="text-[9px] font-extrabold tracking-widest text-ochre/60 uppercase">休憩</p>
                    <p className="mt-1 text-lg font-extrabold text-ochre">3</p>
                  </div>
                  <div className="rounded-lg border border-charcoal/10 bg-charcoal/5 p-3 text-center opacity-50">
                    <p className="text-[9px] font-extrabold tracking-widest text-charcoal/60 uppercase">除外</p>
                    <p className="mt-1 text-lg font-extrabold text-charcoal">8</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="group flex items-center justify-between rounded-lg border border-charcoal/10 bg-white p-4 transition-all hover:border-terracotta">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-[9px] font-black text-terracotta uppercase">Core</span>
                        <h4 className="text-sm font-bold text-charcoal">摩天崖 (Matengai)</h4>
                      </div>
                      <p className="text-xs text-charcoal/55">圧倒的な垂直の絶壁、自然の驚異を体験する核スポット</p>
                    </div>
                    <MaterialIcon className="text-charcoal/20 transition-colors group-hover:text-terracotta" name="drag_indicator" />
                  </div>

                  <div className="group flex items-center justify-between rounded-lg border border-charcoal/10 bg-white p-4 transition-all hover:border-sage">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-sage/10 px-1.5 py-0.5 text-[9px] font-black text-sage uppercase">Sub</span>
                        <h4 className="text-sm font-bold text-charcoal">赤壁 (Sekihei)</h4>
                      </div>
                      <p className="text-xs text-charcoal/55">夕陽に映える赤い岩肌のダイナミズムを補助導線に配置</p>
                    </div>
                    <MaterialIcon className="text-charcoal/20 transition-colors group-hover:text-sage" name="drag_indicator" />
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="ui-card p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <MaterialIcon className="text-charcoal/40" name="login" />
                    <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">継続性の入力（前章から）</h4>
                  </div>
                  <div className="rounded-lg border border-charcoal/10 bg-paper/40 p-4 text-xs leading-relaxed font-medium text-charcoal/70">
                    前エピソードで語られた「海上の境界線」という概念を継承し、陸の境界へと繋げる。
                  </div>
                </div>

                <div className="ui-card p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <MaterialIcon className="text-charcoal/40" name="logout" />
                    <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">継続性の出力（次章へ）</h4>
                  </div>
                  <textarea
                    className="h-24 w-full resize-none rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm font-medium placeholder:text-charcoal/30 focus:border-terracotta focus:outline-none"
                    placeholder="次章へのフックを記述..."
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <section className="ui-card border-l-4 border-l-ochre p-6">
                <h3 className="font-headline mb-5 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-ochre" name="bolt" />
                  次にやること
                </h3>

                <div className="space-y-3">
                  <a
                    className="group flex items-center justify-between rounded-lg border border-ochre/10 bg-ochre/5 p-3 transition-all hover:border-terracotta hover:bg-white"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon className="text-sm text-ochre" name="error" />
                      <span className="text-xs font-bold text-charcoal">メッセージ文案を確定</span>
                    </div>
                    <MaterialIcon className="text-sm text-charcoal/20 group-hover:text-terracotta" name="edit" />
                  </a>

                  <a
                    className="group flex items-center justify-between rounded-lg border border-charcoal/5 bg-paper/30 p-3 transition-all hover:border-terracotta hover:bg-white"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon className="text-sm text-charcoal/30" name="check_circle" />
                      <span className="text-xs font-bold text-charcoal">候補スポットを2件以上選定</span>
                    </div>
                    <MaterialIcon
                      className="text-sm text-charcoal/20 group-hover:text-terracotta"
                      name="arrow_forward"
                    />
                  </a>

                  <a
                    className="group flex items-center justify-between rounded-lg border border-charcoal/5 bg-paper/30 p-3 transition-all hover:border-terracotta hover:bg-white"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <MaterialIcon className="text-sm text-charcoal/30" name="analytics" />
                      <span className="text-xs font-bold text-charcoal">次章への継続性を記述</span>
                    </div>
                    <MaterialIcon
                      className="text-sm text-charcoal/20 group-hover:text-terracotta"
                      name="arrow_forward"
                    />
                  </a>
                </div>
              </section>

              <section className="ui-card p-6">
                <h3 className="font-headline mb-4 flex items-center gap-2 text-lg font-extrabold text-charcoal">
                  <MaterialIcon className="text-sage" name="psychology" />
                  作成補助
                </h3>

                <div className="space-y-4">
                  <div className="rounded-lg border border-charcoal/10 bg-paper/40 p-4">
                    <p className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">AI提案</p>
                    <p className="mt-2 text-sm leading-relaxed font-medium text-charcoal/70">
                      推奨メッセージ: 「断崖絶壁に立つとき、人は自らの矮小さを知り、同時にそれを越えようとする意志に気づく」。
                    </p>
                  </div>

                  <div className="rounded-lg border border-red-300/25 bg-red-50 p-4">
                    <p className="text-[10px] font-extrabold tracking-widest text-red-500 uppercase">チェック</p>
                    <p className="mt-2 text-xs leading-relaxed font-bold text-red-600/90">
                      移動時間が長い可能性があります。「焼火神社」を追加すると文脈の繋がりが改善します。
                    </p>
                  </div>

                  <div className="rounded-lg border border-charcoal/10 bg-white p-4">
                    <p className="text-[10px] font-extrabold tracking-widest text-charcoal/40 uppercase">構成完了度</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-charcoal/10">
                      <div className="h-full w-[85%] rounded-full bg-terracotta" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-charcoal/70">85%（あと 2 項目で完了）</p>
                  </div>
                </div>
              </section>

              <section className="ui-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-headline flex items-center gap-2 text-sm font-extrabold text-charcoal">
                    <MaterialIcon className="text-terracotta" name="map" />
                    候補範囲マップ
                  </h4>
                  <span className="rounded border border-charcoal/10 bg-charcoal/5 px-2 py-0.5 text-[9px] font-bold text-charcoal/40 uppercase">
                    プレビュー
                  </span>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-lg border border-charcoal/10 bg-paper/50">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(#3D3D3D 1px, transparent 1px)",
                      backgroundSize: "15px 15px",
                    }}
                  />
                  <div className="absolute top-1/4 left-1/3 h-3 w-3 rounded-full border-2 border-white bg-terracotta shadow-sm" />
                  <div className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full border border-white bg-terracotta/40" />
                  <div className="absolute right-1/4 bottom-1/3 h-2 w-2 rounded-full border border-white bg-sage/50" />
                </div>

                <div className="mt-3 flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase">コア</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase">補助</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

        <footer className="glass-header fixed right-0 bottom-0 left-64 z-50 border-t border-charcoal/10 px-8 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link
              className="flex items-center gap-2 text-sm font-bold text-charcoal/40 transition-colors hover:text-charcoal"
              href="/projects/iwami-station-poc/series-detail"
            >
              <MaterialIcon className="text-lg" name="arrow_back" />
              <span>シリーズ詳細へ戻る</span>
            </Link>

            <div className="flex items-center gap-3">
              <button className="rounded-lg px-5 py-2 text-sm font-bold text-charcoal/50 transition-colors hover:text-charcoal">
                下書き保存
              </button>
              <Link
                className="sketch-border flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110"
                href="/projects/iwami-station-poc/series-detail"
              >
                構成を完了し詳細設計へ進む
                <MaterialIcon className="text-lg" name="arrow_forward" />
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
