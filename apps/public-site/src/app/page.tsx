"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import {
  Archive,
  BookOpen,
  CircleCheck,
  Download,
  Footprints,
  Lightbulb,
  Map,
  MapPinOff,
  ScrollText,
  Search,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */

const revealDelay = (ms: number): CSSProperties => ({
  ["--reveal-delay" as string]: `${ms}ms`,
});

export default function Home() {
  useEffect(() => {
    const navShell = document.querySelector<HTMLElement>("[data-main-nav]");
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const onScroll = () => {
      navShell?.classList.toggle("nav-scrolled", window.scrollY > 12);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    for (const target of revealTargets) {
      observer.observe(target);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <SiteHeader enableScrollState />

      <main className="overflow-x-hidden">
        <section className="section-lite relative px-6 pt-40 pb-20 anchor-offset">
          <div className="reveal mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12" data-reveal>
            <div className="z-10 space-y-8 lg:col-span-6">
              <span className="inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold text-[#E0A458]">
                地域資源に、新しい灯をともす
              </span>
              <h1 className="font-headline text-4xl leading-tight font-bold text-[#3D3D3D] md:text-5xl lg:text-6xl">
                地域資源を、
                <br />
                <span className="hand-drawn-underline">回遊と滞在</span>を生む
                <br />
                物語体験へ
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-[#3D3D3D]/80">
                地域が伝えたい価値を蓄積し、旅行者一人ひとりに合わせた最適な回遊ルートと物語を生成します。無人駅や地域拠点からスマホで始まる、新しい旅の形。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="rounded-2xl bg-[#E0A458] px-8 py-4 text-center text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  href="/contact"
                >
                  実証相談をする
                </Link>
                <button className="flex items-center gap-2 rounded-2xl border-2 border-[#3D3D3D]/10 px-8 py-4 font-bold transition-all hover:bg-white">
                  サービス資料を見る <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="collage-container relative mx-auto aspect-square w-full max-w-lg">
                <div className="sketch-border glow-effect absolute top-0 right-0 z-0 h-3/4 w-3/4 rotate-3 overflow-hidden">
                  <img
                    alt="Station start point"
                    className="h-full w-full object-cover"
                    decoding="async"
                    fetchPriority="high"
                    loading="eager"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPBXKs7A0uPoSbLZWe7R5aeKzpQOYVY0ykghgAhm3y4M8GkC4LyQo-68mxlhykkQypKt2C5M0Ej8V5G-6qXYiAEulPnnFvrjdfdJzQj1kgvugmEXdTKWOQpPpJxJ3XDbJyFd9P2BinEMAUD3okL0OkoCJudGsS0HslZaG1SbfJzlMFNtN7ls5cMN4co47Xa7mBUM2nCBQi8cMw7Mn5fpu7E3UfBNvS7dzYhkqsn8Id1FYqqhs3nHcH0nguUHkP9TMN3EQxuD2yTSA"
                  />
                </div>
                <div className="tape-effect sketch-border absolute bottom-4 left-0 z-10 h-2/3 w-2/3 -rotate-6 overflow-hidden bg-white p-3 shadow-2xl">
                  <img
                    alt="Smartphone experience"
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWdWCHMhNQS4_otRaMfZBUb76CqlivJSqIVDU5P7325-HjCTVErWaClrzRRlgu9asZcYNZTu_iPG13CpOKLjcYNTJcNfwXga9I53HA03odPpsEmNhvz6rYBVijfA3tCeh9xw3gN0j21mbX67CE72i8fSqelGRBGHou8KstA8YlOFxT4uh_5jx-LRjGjnkbQb7xicB29MkVrjPF0RGV8m5y3KcbVGAqR1PHFJS05E_RhAd4jhSp_vNoBxEhD6dmUenvqo5tOON7-Mo"
                  />
                </div>
                <div className="glow-effect absolute -right-4 -bottom-10 flex h-32 w-32 rotate-12 items-center justify-center rounded-full bg-[#D66D52] p-4 text-center text-sm font-bold text-white">
                  物語が
                  <br />
                  動き出す
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section-lite anchor-offset border-y-2 border-dashed border-[#E0A458]/30 bg-white/50 px-6 py-24"
          id="about"
        >
          <div className="reveal mx-auto max-w-6xl" data-reveal style={revealDelay(40)}>
            <div className="mb-20 text-center">
              <h2 className="font-headline mb-4 text-3xl font-bold md:text-4xl">
                地域が抱える「回遊」の課題
              </h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#E0A458]" />
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <div className="sketch-border relative bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <div className="mb-6 text-[#D66D52]">
                  <MapPinOff className="h-12 w-12" />
                </div>
                <h3 className="font-headline mb-4 text-xl font-bold">1. 点在する資源</h3>
                <p className="text-sm leading-relaxed">
                  魅力的な資源はあっても、それらが点在しており、ストーリーとして繋がっていないため見過ごされています。
                </p>
              </div>
              <div className="sketch-border relative translate-y-8 bg-[#FDF9F3] p-8 transition-transform hover:rotate-0 md:rotate-2">
                <div className="mb-6 text-[#8A9A5B]">
                  <Footprints className="h-12 w-12" />
                </div>
                <h3 className="font-headline mb-4 text-xl font-bold">2. 低い回遊性</h3>
                <p className="text-sm leading-relaxed">
                  パンフレット等の情報提供だけでは、実際の消費行動や地域内での滞在・周遊に繋がりにくい現状があります。
                </p>
              </div>
              <div className="sketch-border relative bg-[#FDF9F3] p-8 transition-transform hover:rotate-1 md:-rotate-1">
                <div className="mb-6 text-[#E0A458]">
                  <Search className="h-12 w-12" />
                </div>
                <h3 className="font-headline mb-4 text-xl font-bold">3. 適合不足</h3>
                <p className="text-sm leading-relaxed">
                  旅行者一人ひとりの興味関心や移動手段、時間などの条件に合う導線設計が不足しています。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite anchor-offset px-6 py-24" id="mechanism">
          <div className="reveal mx-auto max-w-7xl" data-reveal style={revealDelay(60)}>
            <h2 className="font-headline mb-16 text-center text-3xl font-bold md:text-5xl">
              地域資源を「物語」として
              <br className="md:hidden" />
              再構成する仕組み
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="overflow-hidden rounded-3xl border-4 border-white bg-[#8A9A5B]/10 p-1 shadow-xl md:col-span-7">
                <div className="relative h-96">
                  <img
                    alt="AI Route Generation"
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsg-CdMkUYpjCWllV_orfekD7loqZMSOwUpkimQFBZfyIB2T5ZrLt8KPwf3AjOfcPPczTvWjIxSIaNoWYaNR60-9kG6N8oim-lDCtrUAImVq5Cs3KxDrZ59hDjf0NnIS7ivgpX67sZMBPmE_I8_sJ920CHMJpCg1IzieTkO-CaoelVNjw7FvjfS4P6aVU1QLs3c2EemKIhhiyCwkY-JMtL25vKrAx5kk40aQQi8x8dlnHJPFoqjOuX1SxkXiQFnncM6IMJ3D7xT1k"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#3D3D3D]/80 to-transparent p-8">
                    <h3 className="font-headline mb-2 text-2xl font-bold text-white">
                      AIによる最適ルート生成
                    </h3>
                    <p className="text-sm text-white/80">
                      蓄積された物語データベースから、旅行者の属性や現在地に合わせて最適な物語と回遊ルートをAIが瞬時に構築します。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8 md:col-span-5">
                <div className="sketch-border flex h-full flex-col justify-between bg-[#E0A458]/10 p-8">
                  <Archive className="h-10 w-10 text-[#E0A458]" />
                  <div>
                    <h3 className="font-headline mb-2 text-xl font-bold">地域価値の整理</h3>
                    <p className="text-sm">
                      歴史、文化、食、人。バラバラだった地域資源を整理し、デジタルアーカイブ化します。
                    </p>
                  </div>
                </div>
                <div className="sketch-border flex h-full flex-col justify-between bg-[#D66D52]/10 p-8">
                  <BookOpen className="h-10 w-10 text-[#D66D52]" />
                  <div>
                    <h3 className="font-headline mb-2 text-xl font-bold">シリーズ(物語)の設計</h3>
                    <p className="text-sm">
                      単なるスポット紹介ではなく、テーマ性を持った「物語のシリーズ」として体験を設計します。
                    </p>
                  </div>
                </div>
              </div>

              <div className="sketch-border group relative overflow-hidden bg-white p-8 shadow-2xl md:col-span-12 lg:col-span-4">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-[#E0A458]/10 transition-transform group-hover:scale-150" />
                <h3 className="font-headline mb-4 text-xl font-bold">物語化された体験提供</h3>
                <p className="mb-6 text-sm">
                  AR、音声、クイズなど、スマホを通じて没入感のある物語体験を旅行者に届けます。
                </p>
                <img
                  alt="Experience UI"
                  className="h-48 w-full rounded-xl object-cover grayscale transition-all group-hover:grayscale-0"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZiTyuIfvakK5kDCCNOC0-M_y39Ag3bNfLAOk1ct9AMn7nwpnZ8MVKIHq7OeNGDCbbCCEO2AIx5A48PEQB49gh4V8oKv3R8XOAi2b5Y3PUXfk3b7BLRUXaqRuHYKoOiikxRluw90VlTr65i62TuWyCaz-UoQR1LzYriHjLBffepOu-7Gil-ggLLaMfkFKGFDATPcwqBJnMHzBkdTF2XY1-Whtlj80HqtOyoJ-SAofov0cQewwXF_Cq9F7hEc8JsFt6qcgmd5_eXME"
                />
              </div>

              <div className="sketch-border border-[#8A9A5B] bg-[#FDF9F3] p-8 md:col-span-12 lg:col-span-8">
                <div className="flex flex-col items-center gap-8 md:flex-row">
                  <div className="space-y-4 md:w-1/2">
                    <h3 className="font-headline text-2xl font-bold text-[#8A9A5B]">
                      拠点からのデジタル回遊開始
                    </h3>
                    <p className="text-sm">
                      無人駅や道の駅などの「拠点」に設置されたQRコードから、特別なアプリのダウンロードなしで即座に体験を開始できます。
                    </p>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2">
                        <CircleCheck className="h-4 w-4 text-[#8A9A5B]" />
                        Webブラウザ完結のUX
                      </li>
                      <li className="flex items-center gap-2">
                        <CircleCheck className="h-4 w-4 text-[#8A9A5B]" />
                        多言語対応（インバウンド対応）
                      </li>
                      <li className="flex items-center gap-2">
                        <CircleCheck className="h-4 w-4 text-[#8A9A5B]" />
                        リアルタイムな回遊ログ分析
                      </li>
                    </ul>
                  </div>
                  <div className="glow-effect h-64 w-full rotate-1 overflow-hidden rounded-2xl md:w-1/2">
                    <img
                      alt="Local activity"
                      className="h-full w-full object-cover"
                      decoding="async"
                      loading="lazy"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-HzFvzno_sl2Tnc3MNz3PtgDzAmCLm8TieVjo02xRwt-I9ujCK3xNh1MLGM4uCXX_UqQ-DfDxF120PAPWdpNNd5NgJBBrYmIuZHZjYBlIhYbJJmEs1ROqToc38nSowMHbb2oW0gpQqk7xZFySlnCEk7ENe_OXPu3QgrLcmtX5z3xmS49Zf3yjS9s70InnqbV58WiMc5XAzBj1NhxdlIjLXuWBHYtJWUZQvvorOaqkrSbD-Kfp5nYmf2hCRuZV79wz8xPC6FJ7o18"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite anchor-offset px-6 pb-10" id="targets">
          <div className="reveal mx-auto grid max-w-7xl gap-6 md:grid-cols-3" data-reveal style={revealDelay(80)}>
            <article className="sketch-border bg-white p-6">
              <h3 className="font-headline mb-3 text-xl font-bold text-[#D66D52]">自治体・観光協会</h3>
              <p className="text-sm leading-relaxed">地域資源の可視化から実証運用、データに基づく改善まで一貫して支援。</p>
            </article>
            <article className="sketch-border bg-white p-6">
              <h3 className="font-headline mb-3 text-xl font-bold text-[#8A9A5B]">DMO・地域法人</h3>
              <p className="text-sm leading-relaxed">回遊設計・受入体制・多言語導線を統合し、持続的な観光施策を実装。</p>
            </article>
            <article className="sketch-border bg-white p-6">
              <h3 className="font-headline mb-3 text-xl font-bold text-[#E0A458]">店舗・施設運営者</h3>
              <p className="text-sm leading-relaxed">物語の中で自然に選ばれる接点をつくり、来訪と再訪を促進。</p>
            </article>
          </div>
        </section>

        <section className="section-lite anchor-offset px-6 py-10" id="cases">
          <div className="reveal mx-auto max-w-7xl rounded-3xl border-2 border-dashed border-[#E0A458]/40 bg-white/70 p-8" data-reveal style={revealDelay(100)}>
            <h3 className="font-headline mb-4 text-2xl font-bold">実証・事例イメージ</h3>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-xl bg-[#FDF9F3] p-4">無人駅起点の徒歩回遊モデル（90〜180分）</div>
              <div className="rounded-xl bg-[#FDF9F3] p-4">温泉街エリアの滞在延伸モデル（夕方〜夜）</div>
              <div className="rounded-xl bg-[#FDF9F3] p-4">地域イベント連動型の物語配信モデル</div>
            </div>
          </div>
        </section>

        <section className="section-lite anchor-offset px-6 pt-10 pb-24" id="travelers">
          <div className="reveal mx-auto max-w-7xl rounded-3xl bg-[#8A9A5B]/10 p-8 md:p-10" data-reveal style={revealDelay(120)}>
            <h3 className="font-headline mb-3 text-2xl font-bold text-[#8A9A5B]">旅行者の方へ</h3>
            <p className="mb-6 text-sm leading-relaxed">
              駅・地域拠点のQRからそのまま開始。現在地、滞在時間、移動手段に合わせて、今日だけの物語体験をご案内します。
            </p>
            <button className="rounded-full bg-[#8A9A5B] px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110">
              旅行者向けページを見る
            </button>
          </div>
        </section>

        <section className="section-lite relative overflow-hidden bg-[#D66D52] px-6 py-24">
          <div className="absolute top-0 left-0 h-full w-full opacity-10">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 60 Q 25 35 50 60 T 100 60" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="reveal relative z-10 mx-auto max-w-4xl text-center text-white" data-reveal style={revealDelay(140)}>
            <h2 className="font-headline mb-8 text-4xl font-bold md:text-6xl">地域資源に、新しい灯をともす</h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed opacity-90">
              自治体・観光協会・事業者の方へ。TOMOSHIBIで、地域本来の価値を届ける回遊体験を始めませんか？
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
            <p className="text-sm">地域資源を物語化し、最適な回遊と滞在を創出するナラティブ・プラットフォーム。</p>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">サービス</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#about">
                  サービス概要
                </a>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/proofs">
                  実証・事例
                </Link>
              </li>
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#travelers">
                  旅行者の方へ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-6 font-bold text-white">サポート</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  お問い合わせ
                </a>
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
          <p>© 2024 TOMOSHIBI System. Illuminated by Local Stories.</p>
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
