import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import {
  ArrowRight,
  Clock3,
  Lightbulb,
  Map,
  Mountain,
  RefreshCw,
  ScrollText,
  Store,
  Train,
  UserPlus,
  UsersRound,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */

export default function ProofsPage() {
  return (
    <>
      <SiteHeader activeTab="proofs" />

      <main className="overflow-x-hidden pt-32">
        <section className="section-lite relative px-6 py-20 md:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
            <div className="z-10 space-y-8 lg:col-span-7">
              <span className="inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold text-[#E0A458]">
                Demonstration &amp; Case Studies
              </span>
              <h1 className="font-headline text-4xl leading-tight font-bold text-[#3D3D3D] md:text-5xl lg:text-6xl">
                地域での実証を通じて、
                <br />
                <span className="hand-drawn-underline">回遊と滞在</span>の新しい導線を
                <br />
                検証します。
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#3D3D3D]/80">
                地域の眠っている資源をデジタルと体験で再編集し、
                <br />
                持続可能な地域経済の「灯り」を灯すための実践的なアプローチ。
              </p>
            </div>

            <div className="relative hidden lg:col-span-5 lg:block">
              <div className="relative aspect-square w-full">
                <div className="absolute inset-0 rounded-full bg-[#E0A458]/5 blur-3xl" />
                <div className="sketch-border glow-effect absolute top-1/2 left-1/2 h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rotate-3 overflow-hidden bg-white p-2">
                  <img
                    alt="Japanese traditional landscape"
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo7eKS6KULyUb4NKLBmhouiWL6M0KAVtOYnhReutjMl2N3NVkKw834NGFLbwpaHbpVQwcxgKa9VhhvejQnIS4mE8W6AYsaLuAVtW7lsl88UEumO1gOVe74iejnh84fW3buL9apNb28b0TFpdtKzgkw_8se6SfvaZCSGi4Yr1SEstu_ue1sbfayruikzP6DwPE-Ej1Dt_jGQnIZ6B-mPGe3y17AnvQKz4Lt2X-7RyHcniEfMty7Is6Z0L5_GlXar7hXddQP0mgIphU"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/20 bg-white/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="font-headline mb-4 text-3xl font-bold md:text-4xl">実証のポイント</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#D66D52]" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <article className="group sketch-border bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#D66D52]/10 text-[#D66D52] transition-transform group-hover:scale-110">
                  <Map className="h-8 w-8" />
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold">回遊創出</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  点在するスポットを有機的に繋ぎ、歩きたくなる導線を設計します。
                </p>
              </article>

              <article className="group sketch-border translate-y-4 bg-[#FDF9F3] p-8 transition-transform md:rotate-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#8A9A5B]/10 text-[#8A9A5B] transition-transform group-hover:scale-110">
                  <Clock3 className="h-8 w-8" />
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold">滞在時間</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  「通過する場所」から「留まりたくなる場所」へ、体験価値を向上させます。
                </p>
              </article>

              <article className="group sketch-border -rotate-1 bg-[#FDF9F3] p-8 transition-transform">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#E0A458]/10 text-[#E0A458] transition-transform group-hover:scale-110">
                  <UsersRound className="h-8 w-8" />
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold">地域接点</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  来訪者と地域住民、伝統文化が交差する新たな接点を創出します。
                </p>
              </article>

              <article className="group sketch-border translate-y-4 rotate-1 bg-[#FDF9F3] p-8 transition-transform">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#D66D52]/10 text-[#D66D52] transition-transform group-hover:scale-110">
                  <RefreshCw className="h-8 w-8" />
                </div>
                <h3 className="font-headline mb-3 text-xl font-bold">再訪意欲</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  一度きりの観光で終わらせない、継続的な関係性の種をまきます。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-headline mb-16 text-center text-3xl font-bold md:text-5xl">実証の進め方</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <article className="sketch-border relative flex flex-col items-center bg-white/60 px-6 pt-12 pb-8 text-center">
                <span className="font-headline absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#3D3D3D] text-lg font-bold text-white shadow-lg">
                  01
                </span>
                <h4 className="mb-4 text-lg font-bold">ヒアリング</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  地域の課題、歴史、そして目指したい未来を深く聞き取ります。
                </p>
              </article>

              <article className="sketch-border relative flex flex-col items-center bg-white/60 px-6 pt-12 pb-8 text-center md:translate-y-8">
                <span className="font-headline absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#3D3D3D] text-lg font-bold text-white shadow-lg">
                  02
                </span>
                <h4 className="mb-4 text-lg font-bold">設計</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  データと感性の両面から、最適な実証シナリオを構築します。
                </p>
              </article>

              <article className="sketch-border relative flex flex-col items-center bg-white/60 px-6 pt-12 pb-8 text-center">
                <span className="font-headline absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#3D3D3D] text-lg font-bold text-white shadow-lg">
                  03
                </span>
                <h4 className="mb-4 text-lg font-bold">準備</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  デジタルツール、設え、地域との連携体制を整えます。
                </p>
              </article>

              <article className="sketch-border relative flex flex-col items-center bg-white/60 px-6 pt-12 pb-8 text-center md:translate-y-8">
                <span className="font-headline absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#3D3D3D] text-lg font-bold text-white shadow-lg">
                  04
                </span>
                <h4 className="font-headline mb-4 text-lg font-bold">実証・振り返り</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  実地検証を行い、分析から次の一歩を導きます。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite bg-[#8A9A5B]/5 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="font-headline mb-4 text-3xl font-bold md:text-5xl">想定ユースケース</h2>
                <p className="text-[#3D3D3D]/70">地域の特性に合わせた、多様な展開パターンをご提案します。</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <article className="sketch-border flex h-80 flex-col justify-between bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <Train className="mb-4 h-10 w-10 text-[#D66D52]" />
                  <h3 className="font-headline mb-4 text-xl font-bold">無人駅起点</h3>
                  <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                    駅を地域の「玄関口」として再定義。待合室の活用や周辺店舗への誘導を強化します。
                  </p>
                </div>
              </article>

              <article className="sketch-border flex h-80 rotate-1 flex-col justify-between bg-[#E0A458]/10 p-8 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <Store className="mb-4 h-10 w-10 text-[#E0A458]" />
                  <h3 className="font-headline mb-4 text-xl font-bold">駅前滞在</h3>
                  <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                    短時間の滞在を深い体験に変える、ポップアップやデジタル案内の最適化。
                  </p>
                </div>
              </article>

              <article className="sketch-border flex h-80 -rotate-1 flex-col justify-between bg-[#8A9A5B]/10 p-8 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <Mountain className="mb-4 h-10 w-10 text-[#8A9A5B]" />
                  <h3 className="font-headline mb-4 text-xl font-bold">地域資源再編集</h3>
                  <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                    見逃されていた日常を、来訪者の視点でコンテンツ化。新しい歩き方を提案します。
                  </p>
                </div>
              </article>

              <article className="sketch-border flex h-80 rotate-1 flex-col justify-between bg-[#D66D52]/10 p-8 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <UserPlus className="mb-4 h-10 w-10 text-[#D66D52]" />
                  <h3 className="font-headline mb-4 text-xl font-bold">再訪導線</h3>
                  <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                    デジタルスタンプ等を通じた、継続的な関係構築の仕組み。
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12">
              <h2 className="font-headline mb-2 text-3xl font-bold md:text-4xl">事例・実証予定リスト</h2>
              <div className="h-1 w-16 rounded-full bg-[#D66D52]" />
            </div>
            <div className="grid grid-cols-1 gap-12">
              <article className="group sketch-border overflow-hidden bg-white transition-all duration-500 hover:shadow-xl" id="iwami-proof">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-72 overflow-hidden md:h-auto md:w-1/2">
                    <img
                      alt="Iwami-cho Coast"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      decoding="async"
                      loading="lazy"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5xlInIycXxOisExPjUGpN_00CP1ytXh202jMMI3KpLNBgO7d6YFvdRAimaxlMQwkNRD-ZqUgz3c8xniL_5TFr_ZwfqVVhl9unDA74hZqWtJrZC6wLjTCJf5-dBS6cRIrXUJdx74dg-uwSPPAcZZZG0E638HdBl4HsWrmfyblxwZYWnWCeu_Sf9k78ryXf3RjSEwcXrerm2H4AcJU4AnHW_YbjQXxTnLD2-PUqZLrNYONd_JreSQD-CEXu_hZVG5575vLS52faFxc"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="rounded-full border border-[#D66D52]/20 bg-white/90 px-3 py-1 text-[10px] font-bold text-[#D66D52] backdrop-blur">
                        鳥取県岩美町
                      </span>
                      <span className="rounded-full bg-[#E0A458] px-3 py-1 text-[10px] font-bold text-white">準備中</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6 p-8 md:w-1/2 md:p-12">
                    <div className="space-y-2">
                      <h3 className="font-headline text-2xl font-bold md:text-3xl">岩美町実証想定</h3>
                      <p className="text-sm font-bold text-[#E0A458]">起点：岩美駅</p>
                    </div>
                    <p className="leading-relaxed text-[#3D3D3D]/70">
                      岩美駅を起点とし、透明度の高い海や地元の食、歴史的な町並みへの回遊を設計。無人駅を拠点とした新しい観光コンシェルジュ機能と、町内資源を巡る一日体験のプロトタイプを構築しています。
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="sketch-border bg-[#FDF9F3] px-3 py-1 text-[10px] font-bold">駅起点</span>
                      <span className="sketch-border bg-[#FDF9F3] px-3 py-1 text-[10px] font-bold">一日体験</span>
                      <span className="sketch-border bg-[#FDF9F3] px-3 py-1 text-[10px] font-bold">デジタルガイド</span>
                    </div>
                    <div className="pt-4">
                      <a className="inline-flex items-center gap-2 font-bold text-[#D66D52] transition-all hover:gap-4" href="#">
                        詳細を見る <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite relative overflow-hidden bg-[#D66D52] px-6 py-24">
          <div className="absolute top-0 left-0 h-full w-full opacity-10">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 60 Q 25 35 50 60 T 100 60" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center text-white">
            <h2 className="font-headline text-3xl font-bold md:text-5xl">地域の未来を共に描きましょう</h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed opacity-90">
              TOMOSHIBIは、地域の物語をデジタルと融合させ、
              <br className="hidden md:block" />
              新しい人の流れを生み出すお手伝いをします。
            </p>
            <div className="flex flex-col items-center justify-center gap-6 pt-4 md:flex-row">
              <Link
                className="rounded-full bg-white px-12 py-5 text-lg font-bold text-[#D66D52] shadow-2xl transition-all hover:-rotate-1 hover:scale-105"
                href="/contact"
              >
                実証相談をする
              </Link>
              <a
                className="rounded-full border-2 border-white/40 px-12 py-5 text-lg font-bold text-white transition-all hover:bg-white/10"
                href="#iwami-proof"
              >
                岩美町実証想定を見る
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#2D2D2D] px-6 py-16 text-white/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="font-headline text-3xl font-bold text-white">TOMOSHIBI</div>
            <p className="text-sm">地域資源を物語化し、最適な回遊と滞在を創出するナラティブ・プラットフォーム。</p>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">サービス</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/#about">
                  サービス概要
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/proofs">
                  実証・事例
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/users">
                  旅行者の方へ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">サポート</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/contact">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  よくある質問
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  ログイン
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">法務・規約</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  利用規約
                </a>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/about">
                  運営について
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs italic md:flex-row">
          <p>© 2024 TOMOSHIBI. All rights reserved.</p>
          <div className="flex gap-6">
            <Lightbulb className="h-5 w-5 text-[#E0A458]" />
            <Map className="h-5 w-5 text-[#8A9A5B]" />
            <ScrollText className="h-5 w-5 text-[#D66D52]" />
          </div>
        </div>
      </footer>
    </>
  );
}
