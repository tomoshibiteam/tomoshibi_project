import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import {
  BarChart3,
  CircleCheck,
  Clock3,
  Footprints,
  Heart,
  History,
  Lightbulb,
  LineChart,
  Map,
  Megaphone,
  Network,
  RefreshCw,
  Route,
  ScrollText,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  UserPen,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "仕組み | TOMOSHIBI - 地域資源を回遊体験へ",
  description:
    "地域資源を物語構造で設計し、AIで動的に回遊体験を生成するTOMOSHIBIの仕組みページ。",
};

export default function MechanismPage() {
  return (
    <>
      <SiteHeader />

      <main className="pt-32">
        <section className="section-lite relative px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
            <div className="z-10 space-y-8 lg:col-span-6">
              <span className="inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold text-[#E0A458]">
                HOW IT WORKS
              </span>
              <h1 className="font-headline text-4xl leading-tight font-bold text-[#3D3D3D] md:text-5xl lg:text-6xl">
                地域資源を、その人に成立する
                <br />
                <span className="hand-drawn-underline">回遊体験</span>へ変える仕組み
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-[#3D3D3D]/80">
                魅力はあるのに、点在している。TOMOSHIBIは、滞在時間や移動手段、そして個人の興味関心に応じたルートをAIが動的に構成。駅に降り立ったその瞬間から、スマホ一つで始まる物語のような地域体験を届けます。
              </p>
            </div>
            <div className="relative lg:col-span-6">
              <div className="sketch-border glow-effect relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden shadow-2xl">
                <img
                  alt="Smartphone interaction"
                  className="h-full w-full object-cover"
                  decoding="async"
                  loading="eager"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPVVKYPJMBAPcTd2b7C5p0SmHP0W8wzEy0HJ5l7siUgBwyojgrT2ybOuIZE2dzvHneVy37pWFeFoLw5lMY7o9JobYXoo_HCBT7u6ONABY-33FtjDND0tTV_BeA5wpaqI0T6DGKG8Ff_8hXl0WICy33GAD4NjBLou3vBaztLRH8n30P6zSoN0nFOUO4jmOuBEFI2Wpzv-8H0m_d7JIpLMW7E4SRkgWBTeUR8MC8jCuiqZ3xVTJGDsGl3nrDmYNExKag2C4Rr2hELtA"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/30 bg-white/50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="font-headline mb-4 text-3xl font-bold md:text-4xl">私たちが解決している「課題」</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#E0A458]" />
              <p className="mt-4 text-[#3D3D3D]/70">「点」の魅力を「線」に変えられない理由を解消します</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <article className="sketch-border bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <Network className="mb-6 h-12 w-12 text-[#D66D52]" />
                <h3 className="font-headline mb-3 text-xl font-bold">1. 点在する資源</h3>
                <p className="text-sm leading-relaxed">素晴らしいスポットが離れており、歩きや公共交通での移動計画が困難。</p>
              </article>
              <article className="sketch-border rotate-1 bg-[#FDF9F3] p-8 transition-transform hover:rotate-0">
                <Route className="mb-6 h-12 w-12 text-[#8A9A5B]" />
                <h3 className="font-headline mb-3 text-xl font-bold">2. 低い回遊性</h3>
                <p className="text-sm leading-relaxed">
                  メイン通りだけで終わってしまい、路地裏や地域の本質的な魅力に届かない。
                </p>
              </article>
              <article className="sketch-border -rotate-1 bg-[#FDF9F3] p-8 transition-transform hover:rotate-1">
                <Clock3 className="mb-6 h-12 w-12 text-[#E0A458]" />
                <h3 className="font-headline mb-3 text-xl font-bold">3. 条件不足</h3>
                <p className="text-sm leading-relaxed">
                  「あと2時間ある」「子供連れ」など、状況に合わせたプランが提示できない。
                </p>
              </article>
              <article className="sketch-border rotate-1 bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <History className="mb-6 h-12 w-12 text-[#3D3D3D]/50" />
                <h3 className="font-headline mb-3 text-xl font-bold">4. 継続性の弱さ</h3>
                <p className="text-sm leading-relaxed">
                  一過性のキャンペーンで終わり、デジタルデータが地域の資産にならない。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-20 text-center">
              <h2 className="font-headline mb-6 text-3xl font-bold md:text-5xl">TOMOSHIBIの階層構造</h2>
              <div className="mx-auto mb-4 h-1 w-32 rounded-full bg-[#D66D52]" />
              <p className="text-[#3D3D3D]/70">ただのルート作成ではなく、物語の構造として設計されています</p>
            </div>
            <div className="relative space-y-12">
              <div className="absolute top-0 bottom-0 left-1/2 hidden w-1 -translate-x-1/2 border-l-2 border-dashed border-[#3D3D3D]/20 md:block" />

              <div className="group relative flex flex-col items-center gap-8 md:flex-row">
                <div className="hidden md:block md:w-1/2 md:text-right">
                  <span className="font-headline text-xl font-bold italic tracking-widest text-[#D66D52]">AREA</span>
                </div>
                <div className="sketch-border z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#D66D52] font-bold text-white shadow-lg">
                  01
                </div>
                <div className="sketch-border w-full bg-white p-8 transition-transform group-hover:rotate-1 md:w-1/2">
                  <h4 className="font-headline mb-2 text-lg font-bold text-[#D66D52]">エリア（基礎自治体・DMO単位）</h4>
                  <p className="text-sm text-[#3D3D3D]/80">地域のポテンシャルを定義する最上位レイヤー。</p>
                </div>
              </div>

              <div className="group relative flex flex-col items-center gap-8 md:flex-row-reverse">
                <div className="hidden md:block md:w-1/2 md:text-left">
                  <span className="font-headline text-xl font-bold italic tracking-widest text-[#8A9A5B]">SERIES</span>
                </div>
                <div className="sketch-border z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#8A9A5B] font-bold text-white shadow-lg">
                  02
                </div>
                <div className="sketch-border w-full bg-white p-8 transition-transform group-hover:-rotate-1 md:w-1/2">
                  <h4 className="font-headline mb-2 text-lg font-bold text-[#8A9A5B]">シリーズ（テーマ・文脈）</h4>
                  <p className="text-sm text-[#3D3D3D]/80">「歴史を辿る」「職人と出会う」など、回遊のテーマを設計。</p>
                </div>
              </div>

              <div className="group relative flex flex-col items-center gap-8 md:flex-row">
                <div className="hidden md:block md:w-1/2 md:text-right">
                  <span className="font-headline text-xl font-bold italic tracking-widest text-[#E0A458]">EPISODE</span>
                </div>
                <div className="sketch-border z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E0A458] font-bold text-white shadow-lg">
                  03
                </div>
                <div className="sketch-border w-full bg-white p-8 transition-transform group-hover:rotate-1 md:w-1/2">
                  <h4 className="font-headline mb-2 text-lg font-bold text-[#E0A458]">エピソード（具体的な体験構成）</h4>
                  <p className="text-sm text-[#3D3D3D]/80">スポットの組み合わせと、その間に流れるナラティブ（語り）の構築。</p>
                </div>
              </div>

              <div className="group relative flex flex-col items-center gap-8 md:flex-row-reverse">
                <div className="hidden md:block md:w-1/2 md:text-left">
                  <span className="font-headline text-xl font-bold italic tracking-widest text-[#FF7F50]">
                    DYNAMIC ROUTE
                  </span>
                </div>
                <div className="sketch-border z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FF7F50] font-bold text-white shadow-lg">
                  04
                </div>
                <div className="sketch-border w-full border-[#FF7F50] bg-white p-8 ring-8 ring-[#FF7F50]/5 transition-transform group-hover:-rotate-1 md:w-1/2">
                  <h4 className="font-headline mb-2 text-lg font-bold text-[#FF7F50]">実行時AI（動的ルート生成）</h4>
                  <p className="text-sm text-[#3D3D3D]/80">ユーザーの現在地・時間・気分から、最適な巡り方をリアルタイム構成。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite bg-white/30 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="font-headline mb-4 text-3xl font-bold md:text-4xl">人とAIの役割分担</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#8A9A5B]" />
              <p className="mt-4 text-[#3D3D3D]/70">
                AIが勝手に作るのではなく、人の「想い」をAIが「具現化」する共創の形
              </p>
            </div>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <article className="sketch-border bg-[#FDF9F3] p-10 transition-transform hover:-rotate-1">
                <div className="mb-8 flex items-center gap-4">
                  <div className="sketch-border flex h-14 w-14 items-center justify-center rounded-full bg-[#8A9A5B]/20">
                    <UserPen className="h-8 w-8 text-[#8A9A5B]" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold">人が担う「価値と文脈」</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <CircleCheck className="mt-0.5 h-5 w-5 text-[#8A9A5B]" />
                    <div>
                      <h4 className="mb-1 font-bold">コンセプトの策定</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        地域の歴史や風土から、どんな感情を届けるかの「物語」を定義します。
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <CircleCheck className="mt-0.5 h-5 w-5 text-[#8A9A5B]" />
                    <div>
                      <h4 className="mb-1 font-bold">コアスポットの選定</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        地域住民しか知らない隠れた名店や、守るべき景観を「点」として登録。
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <CircleCheck className="mt-0.5 h-5 w-5 text-[#8A9A5B]" />
                    <div>
                      <h4 className="mb-1 font-bold">執筆・編集（ナラティブ）</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        AIには書けない、熱のこもった紹介文や地域の想いを言葉にします。
                      </p>
                    </div>
                  </li>
                </ul>
              </article>

              <article className="sketch-border rotate-1 bg-white p-10 transition-transform hover:rotate-0">
                <div className="mb-8 flex items-center gap-4">
                  <div className="sketch-border flex h-14 w-14 items-center justify-center rounded-full bg-[#D66D52]/20">
                    <Sparkles className="h-8 w-8 text-[#D66D52]" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold">AIが担う「動的構成」</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <SlidersHorizontal className="mt-0.5 h-5 w-5 text-[#D66D52]" />
                    <div>
                      <h4 className="mb-1 font-bold">ルートの瞬時最適化</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        営業状況や交通機関の遅延、滞在時間に合わせて順序を組み替えます。
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <Heart className="mt-0.5 h-5 w-5 text-[#D66D52]" />
                    <div>
                      <h4 className="mb-1 font-bold">パーソナライズ</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        ユーザー属性に合わせ、設計された物語の中から「最も響く部分」を抽出。
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <LineChart className="mt-0.5 h-5 w-5 text-[#D66D52]" />
                    <div>
                      <h4 className="mb-1 font-bold">回遊データの解析</h4>
                      <p className="text-sm text-[#3D3D3D]/70">
                        実際の行動ログから「滞在の質」を可視化し、次の設計への示唆を与えます。
                      </p>
                    </div>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite overflow-hidden px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-headline mb-16 text-center text-3xl font-bold md:text-5xl">
              <span className="hand-drawn-underline">体験までの5ステップ</span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              <article className="sketch-border relative -rotate-1 bg-white p-8 transition-transform hover:rotate-0">
                <span className="font-headline absolute top-4 right-6 text-5xl font-black text-[#3D3D3D]/5">01</span>
                <h4 className="font-headline mb-4 text-lg font-bold text-[#8A9A5B]">設計 (Design)</h4>
                <p className="text-xs text-[#3D3D3D]/70">管理画面からスポットを登録し、物語の「骨格」を作成します。</p>
              </article>

              <article className="sketch-border relative rotate-1 bg-white p-8 transition-transform hover:rotate-0">
                <span className="font-headline absolute top-4 right-6 text-5xl font-black text-[#3D3D3D]/5">02</span>
                <h4 className="font-headline mb-4 text-lg font-bold text-[#8A9A5B]">条件入力 (Input)</h4>
                <p className="text-xs text-[#3D3D3D]/70">旅行者が「今の気分」「空き時間」を選択。たった3タップで準備完了。</p>
              </article>

              <article className="sketch-border relative -rotate-2 bg-[#D66D52] p-8 text-white shadow-xl transition-transform hover:rotate-0">
                <span className="font-headline absolute top-4 right-6 text-5xl font-black text-white/10">03</span>
                <h4 className="font-headline mb-4 text-lg font-bold">ルート構成 (Compose)</h4>
                <p className="text-xs opacity-90">AIが数万通りの組み合わせから、その瞬間の「正解」を提示。</p>
              </article>

              <article className="sketch-border relative rotate-1 bg-white p-8 transition-transform hover:rotate-0">
                <span className="font-headline absolute top-4 right-6 text-5xl font-black text-[#3D3D3D]/5">04</span>
                <h4 className="font-headline mb-4 text-lg font-bold text-[#8A9A5B]">物語化 (Narrate)</h4>
                <p className="text-xs text-[#3D3D3D]/70">
                  スポット間の移動中も、音声やテキストで地域の物語が並走します。
                </p>
              </article>

              <article className="sketch-border relative -rotate-1 border-[#E0A458] bg-[#E0A458]/10 p-8 transition-transform hover:rotate-0">
                <span className="font-headline absolute top-4 right-6 text-5xl font-black text-[#E0A458]/10">05</span>
                <h4 className="font-headline mb-4 text-lg font-bold text-[#E0A458]">現地体験 (Realize)</h4>
                <p className="text-xs text-[#3D3D3D]/70">「どこに行けばいいか」の迷いが消え、景色と対話に集中できます。</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/30 bg-white/50 px-6 py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="tape-effect sketch-border glow-effect rotate-1 overflow-hidden bg-white p-3 shadow-2xl">
                <img
                  alt="Admin Dashboard"
                  className="h-auto w-full"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz_dyUD8rVvMfVBq5nMXcj4g5PRPfQiY6P8WZ-TYZ8gwToMs1e88tqw7dCYaNKvoKLKNadIYdFaHC6Tu70wZqz-w0MT43cmkatBN0vxr6ESx4bTKHhlP45BwzBTLguq73ZOmxO-An7JRUUp1X-uRpFZgE2xsHdWDTu0MLx18I_E7LtdtWNkoFsWMl7qt81MrReBmsdfAtXbjzj9_B1sh2TgufUxp6M8FPoWdx7lPzuhNNuVixSdDsHpMnxAyXWWsTzTVR6K7KaHzM"
                />
              </div>
            </div>
            <div className="order-1 space-y-8 lg:order-2">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">運用を支える管理システム</h2>
              <div className="h-1 w-24 rounded-full bg-[#D66D52]" />
              <p className="text-lg leading-relaxed text-[#3D3D3D]/80">
                地域の方々が迷わず使える、直感的な管理画面を用意。複数の担当者が関わる場合でも安心な承認ワークフローや、実際の旅行者の動きをヒートマップで確認できる分析機能を備えています。
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="sketch-border -rotate-1 flex items-start gap-3 bg-white p-4">
                  <ShieldCheck className="mt-1 h-5 w-5 text-[#D66D52]" />
                  <div>
                    <h5 className="text-sm font-bold">承認フロー</h5>
                    <p className="text-xs text-[#3D3D3D]/60">コンテンツの品質を維持。</p>
                  </div>
                </div>
                <div className="sketch-border rotate-1 flex items-start gap-3 bg-white p-4">
                  <BarChart3 className="mt-1 h-5 w-5 text-[#8A9A5B]" />
                  <div>
                    <h5 className="text-sm font-bold">データ分析</h5>
                    <p className="text-xs text-[#3D3D3D]/60">滞在の質をスコア化。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-headline mb-16 text-center text-3xl font-bold md:text-5xl">
              <span className="hand-drawn-underline">TOMOSHIBIが生み出す価値</span>
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <article className="sketch-border bg-white p-10 text-center transition-transform hover:-rotate-1">
                <div className="sketch-border mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#D66D52]/10">
                  <Footprints className="h-10 w-10 text-[#D66D52]" />
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold">回遊理由の創出</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  ただの移動が「物語の一環」になることで、自発的な回遊意欲を高めます。
                </p>
              </article>

              <article className="sketch-border rotate-2 bg-white p-10 text-center transition-transform hover:rotate-0">
                <div className="sketch-border mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#8A9A5B]/10">
                  <Timer className="h-10 w-10 text-[#8A9A5B]" />
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold">滞在設計の最適化</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  空き時間を価値に変え、地域での平均滞在時間と消費額を向上させます。
                </p>
              </article>

              <article className="sketch-border -rotate-1 bg-white p-10 text-center transition-transform hover:rotate-1">
                <div className="sketch-border mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E0A458]/10">
                  <RefreshCw className="h-10 w-10 text-[#E0A458]" />
                </div>
                <h4 className="font-headline mb-4 text-xl font-bold">再訪への導線設計</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                  体験の満足度がデジタルで蓄積され、一人ひとりに合わせた再訪のきっかけを。
                </p>
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
          <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
            <h2 className="font-headline mb-8 text-4xl font-bold md:text-6xl">
              あなたの地域の物語を、
              <br />
              光り輝く体験へ。
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed opacity-90">
              地域の資産を整理し、デジタルでの回遊体験を設計するためのパートナーシップを募集しています。
            </p>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <Link
                className="rounded-full bg-white px-12 py-5 text-lg font-bold text-[#D66D52] shadow-2xl transition-all hover:scale-105"
                href="/contact"
              >
                実証相談をする
              </Link>
              <button className="rounded-full border-2 border-white/40 px-12 py-5 text-lg font-bold text-white transition-all hover:bg-white/10">
                サービス資料を見る
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#2D2D2D] px-6 py-16 text-white/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="font-headline text-3xl font-bold text-white">TOMOSHIBI</div>
            <p className="text-sm">
              地域を灯し、旅人を導く。
              <br />
              共創する回遊体験プラットフォーム。
            </p>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">ABOUT</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/#about">
                  サービス概要
                </Link>
              </li>
              <li>
                <Link className="font-bold text-[#E0A458]" href="/mechanism">
                  仕組み
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/proofs">
                  実証・事例
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">SUPPORT</h4>
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
            <h4 className="font-headline mb-6 font-bold text-white">FOLLOW US</h4>
            <div className="flex gap-4">
              <a
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all hover:bg-[#E0A458] hover:text-white"
                href="#"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all hover:bg-[#E0A458] hover:text-white"
                href="#"
              >
                <Megaphone className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs md:flex-row">
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
