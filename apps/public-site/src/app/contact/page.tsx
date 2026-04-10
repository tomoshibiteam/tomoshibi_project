import Link from "next/link";
import SiteHeader from "@/app/_components/site-header";
import { Lightbulb, LocateFixed, Map, MessageCircle, Rocket, ScrollText } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <SiteHeader consultHref="#contact-form" />

      <main className="pb-20 pt-40">
        <section className="mx-auto mb-20 max-w-4xl px-6 text-center">
          <span className="mb-6 inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold text-[#E0A458]">
            Consultation
          </span>
          <h1 className="font-headline mb-8 text-4xl font-bold leading-tight text-[#3D3D3D] md:text-5xl">
            <span className="hand-drawn-underline">実証相談・お問い合わせ</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#3D3D3D]/80">
            地域の物語を、未来へつなぐ第一歩。
            <br />
            TOMOSHIBIは、自治体や地域の皆さまと共に、新しい回遊体験を共創します。
          </p>
        </section>

        <section className="mx-auto mb-24 max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="sketch-border flex flex-col items-center bg-white p-8 text-center shadow-sm transition-transform hover:-rotate-1">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D66D52]/10">
                <MessageCircle className="h-8 w-8 text-[#D66D52]" />
              </div>
              <div className="font-headline mb-2 text-xs font-bold tracking-widest text-[#D66D52] uppercase">
                Step 01
              </div>
              <h3 className="font-headline mb-4 text-xl font-bold">ご相談</h3>
              <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                まずは課題や理想をお聞かせください。担当者が丁寧にお伺いします。
              </p>
            </article>

            <article className="sketch-border flex flex-col items-center bg-white p-8 text-center shadow-sm transition-transform hover:rotate-0 md:rotate-1">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#8A9A5B]/10">
                <LocateFixed className="h-8 w-8 text-[#8A9A5B]" />
              </div>
              <div className="font-headline mb-2 text-xs font-bold tracking-widest text-[#8A9A5B] uppercase">
                Step 02
              </div>
              <h3 className="font-headline mb-4 text-xl font-bold">現地調査・要件定義</h3>
              <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                地域の資源を深く掘り下げ、具体的な実施プランを策定します。
              </p>
            </article>

            <article className="sketch-border flex flex-col items-center bg-white p-8 text-center shadow-sm transition-transform hover:rotate-1 md:-rotate-1">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E0A458]/10">
                <Rocket className="h-8 w-8 text-[#E0A458]" />
              </div>
              <div className="font-headline mb-2 text-xs font-bold tracking-widest text-[#E0A458] uppercase">
                Step 03
              </div>
              <h3 className="font-headline mb-4 text-xl font-bold">実証開始</h3>
              <p className="text-sm leading-relaxed text-[#3D3D3D]/70">
                デジタルの灯りを地域に灯し、新たな価値を創出します。
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6" id="contact-form">
          <div className="sketch-border bg-white/50 p-8 shadow-xl md:p-12">
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#3D3D3D]/80" htmlFor="organization">
                  団体・法人名
                  <span className="rounded bg-[#D66D52]/10 px-2 py-0.5 text-[10px] text-[#D66D52]">必須</span>
                </label>
                <input
                  className="w-full rounded-xl border-2 border-[#3D3D3D]/10 bg-white px-4 py-3 transition-colors focus:border-[#E0A458] focus:ring-0"
                  id="organization"
                  placeholder="例：〇〇市役所 観光振興課"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#3D3D3D]/80" htmlFor="name">
                  お名前
                  <span className="rounded bg-[#D66D52]/10 px-2 py-0.5 text-[10px] text-[#D66D52]">必須</span>
                </label>
                <input
                  className="w-full rounded-xl border-2 border-[#3D3D3D]/10 bg-white px-4 py-3 transition-colors focus:border-[#E0A458] focus:ring-0"
                  id="name"
                  placeholder="例：山田 太郎"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#3D3D3D]/80" htmlFor="email">
                  メールアドレス
                  <span className="rounded bg-[#D66D52]/10 px-2 py-0.5 text-[10px] text-[#D66D52]">必須</span>
                </label>
                <input
                  className="w-full rounded-xl border-2 border-[#3D3D3D]/10 bg-white px-4 py-3 transition-colors focus:border-[#E0A458] focus:ring-0"
                  id="email"
                  placeholder="example@tomoshibi.jp"
                  type="email"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-[#3D3D3D]/80">興味のあるテーマ</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input className="h-5 w-5 rounded border-[#3D3D3D]/20 text-[#D66D52] focus:ring-[#D66D52]/20" type="checkbox" />
                    <span className="text-sm text-[#3D3D3D] transition-colors group-hover:text-[#D66D52]">
                      回遊・滞在の向上
                    </span>
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input className="h-5 w-5 rounded border-[#3D3D3D]/20 text-[#D66D52] focus:ring-[#D66D52]/20" type="checkbox" />
                    <span className="text-sm text-[#3D3D3D] transition-colors group-hover:text-[#D66D52]">
                      地域資源のデジタル化
                    </span>
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input className="h-5 w-5 rounded border-[#3D3D3D]/20 text-[#D66D52] focus:ring-[#D66D52]/20" type="checkbox" />
                    <span className="text-sm text-[#3D3D3D] transition-colors group-hover:text-[#D66D52]">
                      無人駅・拠点活用
                    </span>
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input className="h-5 w-5 rounded border-[#3D3D3D]/20 text-[#D66D52] focus:ring-[#D66D52]/20" type="checkbox" />
                    <span className="text-sm text-[#3D3D3D] transition-colors group-hover:text-[#D66D52]">
                      その他
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#3D3D3D]/80" htmlFor="details">
                  相談内容
                </label>
                <textarea
                  className="w-full resize-none rounded-xl border-2 border-[#3D3D3D]/10 bg-white px-4 py-3 transition-colors focus:border-[#E0A458] focus:ring-0"
                  id="details"
                  placeholder="ご質問やご要望、現在の課題などをご自由にご記入ください。"
                  rows={5}
                />
              </div>

              <div className="flex flex-col items-center gap-6 pt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input className="h-5 w-5 rounded border-[#3D3D3D]/20 text-[#D66D52] focus:ring-[#D66D52]/20" type="checkbox" />
                  <span className="text-sm text-[#3D3D3D]/70">
                    <a className="underline hover:text-[#D66D52]" href="#">
                      プライバシーポリシー
                    </a>
                    への同意
                  </span>
                </label>
                <button
                  className="w-full rounded-full bg-[#D66D52] px-12 py-4 font-bold text-white shadow-xl transition-all hover:-rotate-1 hover:bg-[#E0A458] active:scale-95 md:w-auto"
                  type="submit"
                >
                  内容を確認して送信する
                </button>
              </div>
            </form>
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
                <Link className="transition-colors hover:text-[#E0A458]" href="/#cases">
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
                <a className="transition-colors hover:text-[#E0A458]" href="#contact-form">
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
