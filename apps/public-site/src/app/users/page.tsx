import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Eye,
  Footprints,
  History,
  Lightbulb,
  Link2,
  Map,
  QrCode,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "For Travelers | TOMOSHIBI",
  description:
    "旅行者向けに、条件に合わせたその日その人に合う地域の物語体験を提案するTOMOSHIBIページ。",
};

const faqItems = [
  {
    q: "アプリのインストールは必要ですか？",
    a: "いいえ、Webブラウザで動作するためインストールの手間はありません。QRコードを読み取ってすぐにお使いいただけます。",
  },
  {
    q: "どこから体験を始められますか？",
    a: "主要な駅の改札付近や、観光案内所、一部の提携宿泊施設に設置されている専用の灯り（QRスタンド）がスタート地点です。",
  },
  {
    q: "どのような条件を入力できますか？",
    a: "「何時までに戻りたいか」「移動手段（徒歩、バス、レンタカー等）」「今の気分（ゆっくり、アクティブ、学びたい等）」の3つをベースに入力します。",
  },
];

export default function UsersPage() {
  return (
    <>
      <SiteHeader activeTraveler />

      <main className="pt-40">
        <section className="section-lite relative overflow-hidden px-6 py-20 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div className="relative z-10 space-y-8">
              <span className="inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold text-[#E0A458]">
                STORY EXPERIENCE
              </span>
              <h1 className="font-headline text-4xl leading-[1.2] font-bold tracking-tight text-[#3D3D3D] lg:text-6xl">
                旅先で、その日その人に合う
                <br />
                <span className="hand-drawn-underline">物語体験を</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#3D3D3D]/80">
                滞在時間、移動手段、興味、帰着時間に合わせて、地域を回る一日の流れを提案します。現地では駅や地域拠点から体験を始められます。
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="flex items-center gap-2 rounded-2xl bg-[#D66D52] px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                  物語を始める
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="rounded-2xl border-2 border-[#3D3D3D]/10 px-8 py-4 font-bold transition-all hover:bg-white">
                  実施エリアを見る
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-[#E0A458]/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-[#8A9A5B]/10 blur-3xl" />
              <div className="sketch-border glow-effect relative z-10 overflow-hidden bg-white p-2">
                <img
                  className="aspect-[4/3] w-full rounded-sm object-cover"
                  decoding="async"
                  loading="eager"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWr1zUEjMlVrPN4PUFAorRA5hLwYX7At6pZB8z9v4lPIsRKLyOhF9Fo2Bt8zkIFjk_kaOKOcIBn8jyPFDLNcdc9NRYqO8ZQ1-xldexpqP_jJko4eUwabRbrWoN8EZLYJq_JIJeD2aDwXGK_CFvwckBA3pqRw8HfcFriyUSmfeEjDSp2h5Q9V2wVpQE6NETz8OoAMIFzqfEEAQgxYPkq5KZV32KZXw-5QMRxUaRxq2qs4EtF2SI5mCNqyWYlFb_Ye7tDgr-WuxGGPo"
                  alt="Traveler scene"
                />
              </div>
              <div className="sketch-border absolute -right-6 -bottom-6 z-20 hidden rotate-3 bg-white p-6 shadow-xl md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0A458]/10 text-[#E0A458]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Personalized Route</div>
                    <div className="text-xs text-[#3D3D3D]/60">Your story starts here.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/30 bg-white/50 py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-[#E0A458]">WHAT IS TOMOSHIBI</h2>
            <h3 className="font-headline mb-16 text-3xl font-bold">ただの観光ガイドではありません</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <article className="sketch-border flex flex-col items-center bg-[#FDF9F3] p-10 transition-transform hover:-rotate-1">
                <ScrollText className="mb-6 h-10 w-10 text-[#D66D52]" />
                <h4 className="font-headline mb-4 text-xl font-bold">Not just a guide</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  名所を巡るだけの案内ではなく、その土地の文脈を感じる体験をデザインします。
                </p>
              </article>
              <article className="sketch-border flex translate-y-4 flex-col items-center bg-[#FDF9F3] p-10 transition-transform md:rotate-1">
                <Link2 className="mb-6 h-10 w-10 text-[#8A9A5B]" />
                <h4 className="font-headline mb-4 text-xl font-bold">Connects spots into a story</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  点在するスポットを、あなただけの一本の物語として繋ぎ合わせます。
                </p>
              </article>
              <article className="sketch-border flex flex-col items-center bg-[#FDF9F3] p-10 transition-transform hover:rotate-1">
                <CalendarDays className="mb-6 h-10 w-10 text-[#E0A458]" />
                <h4 className="font-headline mb-4 text-xl font-bold">Tailored to the day&apos;s conditions</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  天気や混雑状況、あなたの気分に合わせて最適なルートをリアルタイムに提案。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite overflow-hidden px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-[#E0A458]">HOW TO USE</h2>
                <h3 className="font-headline text-3xl font-bold">4つのステップで始める物語</h3>
              </div>
              <div className="text-sm italic text-[#3D3D3D]/60">※アプリのインストールは不要です。</div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <article className="group sketch-border relative bg-[#FDF9F3] p-8 transition-colors hover:bg-white">
                <div className="absolute top-4 right-6 text-5xl font-black text-[#E0A458]/10 transition-colors group-hover:text-[#D66D52]/10">
                  01
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D66D52] text-white">
                  <QrCode className="h-6 w-6" />
                </div>
                <h4 className="font-headline mb-3 font-bold">Read QR at station/base</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">駅や観光案内所に設置されたQRコードを読み取ります。</p>
              </article>

              <article className="group sketch-border relative bg-[#FDF9F3] p-8 transition-colors hover:bg-white">
                <div className="absolute top-4 right-6 text-5xl font-black text-[#E0A458]/10 transition-colors group-hover:text-[#D66D52]/10">
                  02
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D66D52] text-white">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h4 className="font-headline mb-3 font-bold">Input conditions</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  帰りの時間、移動手段（徒歩・車・自転車）、興味を伝えます。
                </p>
              </article>

              <article className="group sketch-border relative bg-[#FDF9F3] p-8 transition-colors hover:bg-white">
                <div className="absolute top-4 right-6 text-5xl font-black text-[#E0A458]/10 transition-colors group-hover:text-[#D66D52]/10">
                  03
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D66D52] text-white">
                  <Map className="h-6 w-6" />
                </div>
                <h4 className="font-headline mb-3 font-bold">View today&apos;s plan</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">あなたの条件にぴったりな「今日の物語」が生成されます。</p>
              </article>

              <article className="group sketch-border relative bg-[#FDF9F3] p-8 transition-colors hover:bg-white">
                <div className="absolute top-4 right-6 text-5xl font-black text-[#E0A458]/10 transition-colors group-hover:text-[#D66D52]/10">
                  04
                </div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D66D52] text-white">
                  <Footprints className="h-6 w-6" />
                </div>
                <h4 className="font-headline mb-3 font-bold">Experience locally</h4>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  寄り道をしても大丈夫。途中で再計算して物語を続けます。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#8A9A5B]/30 bg-white/50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-4 text-center text-sm font-bold tracking-[0.2em] text-[#8A9A5B]">EXPERIENCE EXAMPLES</h2>
            <h3 className="font-headline mb-16 text-center text-3xl font-bold">実際に体験できる物語のカタチ</h3>

            <div className="grid gap-6 md:grid-cols-12">
              <article className="group sketch-border relative h-80 overflow-hidden md:col-span-8 md:h-[400px]">
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi1Y9FSxwdluu8uew6d4lhe0cBWfRXDR9Gh2gEcq0jQWrCCHeq2aM5klAxS0ppo3VPCaAZmhImH7lgMNK8hKE2dbNjZj_EFO2zADHhO_mnmhJEk-du_oY7K5gzauas2tOr56wvWa8QUreqk7PWIdryvM2ZbnyC9bbqAfPdcc4XIKKTWlWD6tC3scMSW5V5l3U1sgQrvx-Zsg6VCQuHuvB0gH93AB8KSXFIDSJ-uDjADhnzex98xofUpOPOy8USPmnxtVJS_VqsaDE"
                  alt="Nature route"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D3D3D]/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="mb-4 inline-block rounded-full bg-[#8A9A5B] px-3 py-1 text-xs font-bold">NATURE</span>
                  <h4 className="font-headline text-3xl font-bold">Nature of Iwami</h4>
                  <p className="mt-2 max-w-md text-sm opacity-90">山陰の雄大な自然と対話する、心洗われるルート。</p>
                </div>
              </article>

              <article className="group sketch-border relative h-80 overflow-hidden md:col-span-4 md:h-[400px]">
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLGArXeE7dWBExYq-7f4qVT49iPkboRHJU1fCMASzj6oI1HgMyILEctj3dkpyv1C_XCtPVPlqHUdkKi5qG2Xkd-o9GukFYWQ57Y4NxoCDyQgSif8X8Tu8WDyUAGFAY4JxcdhQDpdomjHD1TYwWR9P7x7cqx2D0ob8szs-eLTjFBY1D2Y65BIjfEbNGcEp6RBkWZDYYqFrmTHISj8edsybsAn0TwNMVxkH_xGDyVYZC11OhnNoQM3s8XRQyBvkazirgSRUa3kvl9Hc"
                  alt="History route"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D3D3D]/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="mb-4 inline-block rounded-full bg-[#E0A458] px-3 py-1 text-xs font-bold">HISTORY</span>
                  <h4 className="font-headline text-2xl font-bold">History &amp; Background</h4>
                  <p className="mt-2 text-sm opacity-90">教科書には載らない土地の記憶を巡る旅。</p>
                </div>
              </article>

              <article className="group sketch-border relative h-80 overflow-hidden md:col-span-4 md:h-[400px]">
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGa9CW7jB8Ecixl0Ho0Szxxarz1ZXhFNPJiIQh53XEVpeSx-HjhXlgfykwz8iuajEQTzsWoy-fS9omCqe968qC_oiGMttUBoAI2jg9_jBAZXmlw_0KdZmJkt6Q04WJ92Ng3EFpnPojfSqOAM0nVZ7bvUblW-xt1no50Hmq7DrdRL-hT76aWWaNHLLQwolUu6WDoZ89LFfNjhyjIEN4Q5wKLflNuU6fQIsP0FcxMwz1g__KAaxtoONbG-DmX7k9XTOgyjKM1yClFgE"
                  alt="Rainy day route"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D3D3D]/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="mb-4 inline-block rounded-full bg-[#D66D52] px-3 py-1 text-xs font-bold">RAINY DAY</span>
                  <h4 className="font-headline text-2xl font-bold">Rainy day detours</h4>
                  <p className="mt-2 text-sm opacity-90">雨の日だからこそ出会える、屋内の特別な景色。</p>
                </div>
              </article>

              <article className="sketch-border flex h-80 flex-col justify-center bg-[#FDF9F3] p-10 md:col-span-8 md:h-[400px]">
                <h4 className="font-headline mb-4 text-2xl font-bold text-[#3D3D3D]">And more...</h4>
                <p className="text-lg leading-relaxed text-[#3D3D3D]/70">
                  季節、天候、イベント情報など、その時々の「地域の今」を反映した物語が随時更新されています。訪れるたびに、新しい発見があるはずです。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="sketch-border glow-effect -rotate-1 transform overflow-hidden bg-white p-2">
                <img
                  className="w-full rounded-sm"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGZNAvPKRciNiWUDcXi3ZUYlN0iW0JW4y_xxx5OkyVYHcms4C7mWgP4i4RbVjjsYVJrU9V2u5MN6nlVvUk5kjTbOlkHXQ-uiow-Xy0LmwC4nuqNCpuYenng6TwrhrFjWXZFb4hPz1ZdlsJqkS15ZWk-iNK7UwcwBZ2kfLZ2bzUREPRuF8UfYerRW-s5o7_MKxd6vXlPDlUZ6yb8ONrfA6PrRxgaaAt_DOD5_KoY7GhsxDdvDceezYDwwbOqspg1jaElhOcgJ0ikl4"
                  alt="UI mock"
                />
              </div>
            </div>

            <div className="order-1 space-y-10 lg:order-2">
              <div>
                <h2 className="mb-4 text-sm font-bold tracking-[0.2em] text-[#8A9A5B]">FEATURES</h2>
                <h3 className="font-headline text-3xl font-bold">心地よい体験を支える機能</h3>
              </div>

              <div className="space-y-8">
                <article className="flex gap-6">
                  <div className="sketch-border flex h-12 w-12 flex-shrink-0 items-center justify-center border-[#8A9A5B] bg-[#8A9A5B]/10 text-[#8A9A5B]">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-2 text-xl font-bold">Adjusts to conditions</h4>
                    <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                      電車の遅延や急な天候変化を検知。歩行スピードや体力に合わせたルート調整も可能です。
                    </p>
                  </div>
                </article>

                <article className="flex gap-6">
                  <div className="sketch-border flex h-12 w-12 flex-shrink-0 items-center justify-center border-[#8A9A5B] bg-[#8A9A5B]/10 text-[#8A9A5B]">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-2 text-xl font-bold">Overview first UX</h4>
                    <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                      まずは全体像を提示。何にどれくらい時間を使うかがひと目で分かり、納得感のある出発を後押しします。
                    </p>
                  </div>
                </article>

                <article className="flex gap-6">
                  <div className="sketch-border flex h-12 w-12 flex-shrink-0 items-center justify-center border-[#8A9A5B] bg-[#8A9A5B]/10 text-[#8A9A5B]">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-2 text-xl font-bold">Continuous records</h4>
                    <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                      旅の終わりには、あなたが辿った軌跡が「一冊の記録」として残ります。後で見返したり、共有したりできます。
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/20 bg-white/30 px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-sm font-bold tracking-[0.2em] text-[#E0A458]">FAQ</h2>
            <h3 className="font-headline mb-16 text-center text-3xl font-bold">よくあるご質問</h3>

            <div className="space-y-6">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group sketch-border overflow-hidden bg-[#FDF9F3] transition-all duration-300"
                >
                  <summary className="font-headline flex cursor-pointer list-none items-center justify-between p-6 font-bold">
                    <span>{item.q}</span>
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-[#3D3D3D]/70">{item.a}</div>
                </details>
              ))}
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
          <div className="relative z-10 mx-auto max-w-4xl space-y-10 text-center text-white">
            <h2 className="font-headline text-4xl font-bold md:text-6xl">さあ、あなただけの物語へ</h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed opacity-90">
              現地に到着したら、まずはTOMOSHIBIを探してみてください。
              <br />
              日常から少し離れた、心地よい時間の流れを提案します。
            </p>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <button className="rounded-full bg-white px-12 py-5 text-lg font-bold text-[#D66D52] shadow-2xl transition-all hover:scale-105">
                物語を体験する
              </button>
              <button className="rounded-full border-2 border-white/40 px-12 py-5 text-lg font-bold text-white transition-all hover:bg-white/10">
                実施エリアを確認
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
