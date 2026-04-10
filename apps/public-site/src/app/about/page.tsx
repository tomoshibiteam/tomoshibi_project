import type { Metadata } from "next";
import Link from "next/link";
import {
  ChartLine,
  Coins,
  Database,
  Lightbulb,
  Map,
  Network,
  RefreshCw,
  Route,
  ScrollText,
  Sparkles,
  Train,
  User,
  Users,
} from "lucide-react";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "運営について | TOMOSHIBI 公式サイト",
  description:
    "TOMOSHIBIプロジェクトの理念、背景、運営体制、現在の取り組み状況をご紹介します。",
};

export default function AboutPage() {
  return (
    <>
      <nav className="fixed top-6 right-6 left-6 z-50">
        <div className="nav-shell sketch-border mx-auto flex max-w-6xl items-center justify-between bg-white/90 px-6 py-4 shadow-lg backdrop-blur-md">
          <Link className="font-headline text-2xl font-bold tracking-tight text-[#D66D52]" href="/">
            TOMOSHIBI
          </Link>
          <div className="hidden items-center space-x-8 text-sm font-medium lg:flex">
            <Link className="transition-colors hover:text-[#E0A458]" href="/#about">
              サービス概要
            </Link>
            <Link className="transition-colors hover:text-[#E0A458]" href="/mechanism">
              仕組み
            </Link>
            <Link className="transition-colors hover:text-[#E0A458]" href="/#targets">
              導入対象
            </Link>
            <Link className="transition-colors hover:text-[#E0A458]" href="/proofs">
              実証・事例
            </Link>
            <Link className="border-b-2 border-[#D66D52] pb-1 text-[#D66D52]" href="/about">
              運営について
            </Link>
            <Link className="transition-colors hover:text-[#E0A458]" href="/users">
              旅行者の方へ
            </Link>
          </div>
          <Link
            className="rounded-full bg-[#D66D52] px-6 py-2 text-sm font-bold text-white transition-all hover:-rotate-2 hover:bg-[#E0A458]"
            href="/contact"
          >
            実証相談をする
          </Link>
        </div>
      </nav>

      <main className="overflow-x-hidden pt-48">
        <section className="section-lite relative px-6 py-20">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <span className="inline-block rotate-[-1deg] rounded-full bg-[#E0A458]/20 px-4 py-1 text-sm font-bold tracking-wider text-[#E0A458] uppercase">
              Project Philosophy
            </span>
            <h1 className="font-headline text-4xl font-bold md:text-6xl">運営について</h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#3D3D3D]/80 md:text-xl">
              TOMOSHIBIは、地域資源を回遊と滞在を生む体験へ変えることを目指して進めているプロジェクトです。
            </p>
          </div>
        </section>

        <section className="section-lite border-y-2 border-dashed border-[#E0A458]/30 bg-white/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="font-headline mb-4 text-3xl font-bold">なぜTOMOSHIBIをやっているのか</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#E0A458]" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <article className="sketch-border bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <div className="mb-6 text-[#D66D52]">
                  <Network className="h-10 w-10" />
                </div>
                <h3 className="font-headline mb-4 text-lg font-bold">1. 地域資源の点在</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  魅力的なスポットが地図上で離れており、繋がりのある「物語」として認識されにくい現状があります。
                </p>
              </article>

              <article className="sketch-border bg-[#FDF9F3] p-8 transition-transform hover:rotate-1">
                <div className="mb-6 text-[#8A9A5B]">
                  <Coins className="h-10 w-10" />
                </div>
                <h3 className="font-headline mb-4 text-lg font-bold">2. 低い消費転換率</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  訪れても、どこで何にお金を払えばいいか、体験の入り口が不明確で地域経済への寄与が限定的です。
                </p>
              </article>

              <article className="sketch-border bg-[#FDF9F3] p-8 transition-transform hover:-rotate-1">
                <div className="mb-6 text-[#E0A458]">
                  <Route className="h-10 w-10" />
                </div>
                <h3 className="font-headline mb-4 text-lg font-bold">3. 画一的なルート設定</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  個々の旅行者の興味や時間軸に合わせた最適な周遊プランが提供されず、機会損失が発生しています。
                </p>
              </article>

              <article className="sketch-border bg-[#FDF9F3] p-8 transition-transform hover:rotate-1">
                <div className="mb-6 text-[#D66D52]">
                  <RefreshCw className="h-10 w-10" />
                </div>
                <h3 className="font-headline mb-4 text-lg font-bold">4. リピート率の低迷</h3>
                <p className="text-sm leading-relaxed text-[#3D3D3D]/80">
                  一過性の観光で終わってしまい、地域との継続的な接点や「また来たい」と思える奥行きが不足しています。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-lite px-6 py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1 space-y-10">
              <div className="text-left">
                <h2 className="font-headline mb-4 text-3xl font-bold md:text-4xl">
                  TOMOSHIBIが
                  <br />
                  目指していること
                </h2>
                <p className="text-[#3D3D3D]/70">
                  地域の「未活用な資源」を、デジタルの力で「魅力的な滞在フロー」へ再構築します。
                </p>
              </div>

              <div className="grid gap-8">
                <article className="group flex items-start gap-6">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#8A9A5B]/20 bg-[#8A9A5B]/10 text-[#8A9A5B] transition-transform group-hover:rotate-6">
                    <Network className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-1 text-lg font-bold">資源を「流れ」へ</h4>
                    <p className="text-sm text-[#3D3D3D]/70">
                      点在するスポットを、個人の嗜好に合わせたシームレスな移動体験として繋ぎ合わせます。
                    </p>
                  </div>
                </article>

                <article className="group flex items-start gap-6">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#E0A458]/20 bg-[#E0A458]/10 text-[#E0A458] transition-transform group-hover:-rotate-6">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-1 text-lg font-bold">地域価値の蓄積</h4>
                    <p className="text-sm text-[#3D3D3D]/70">
                      体験データを通じて地域の良さを可視化し、持続可能な観光モデルを構築します。
                    </p>
                  </div>
                </article>

                <article className="group flex items-start gap-6">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#D66D52]/20 bg-[#D66D52]/10 text-[#D66D52] transition-transform group-hover:rotate-6">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-1 text-lg font-bold">適応型体験の提供</h4>
                    <p className="text-sm text-[#3D3D3D]/70">
                      天気、時間、混雑状況に応じた動的なプランニングで、常に「今、最高の体験」を提供します。
                    </p>
                  </div>
                </article>

                <article className="group flex items-start gap-6">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#8A9A5B]/20 bg-[#8A9A5B]/10 text-[#8A9A5B] transition-transform group-hover:-rotate-6">
                    <Train className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-headline mb-1 text-lg font-bold">無人駅からの成長</h4>
                    <p className="text-sm text-[#3D3D3D]/70">
                      駅舎などの拠点を起点に、無人でも成り立つ質の高いホスピタリティを実装します。
                    </p>
                  </div>
                </article>
              </div>
            </div>

            <div className="w-full flex-1">
              <div className="relative mx-auto max-w-xl">
                <div className="sketch-border glow-effect rotate-2 overflow-hidden">
                  <img
                    alt="Cinematic Japanese station"
                    className="h-[500px] w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXQ-7GE9BNr8WJB9PE4GuCkZzfcO4T-ivoYugcibL3dFwraLdru22z_KcA_hk98n23AxqkW3IlV9yfFj-VqeM9dE4Go_sKYl02L1k53Om-DI2B63hMNFdq25LbmCkxQzE6gbvcxEB3ZS6BxzWCp56oYBXrQ7U6Q7pTR8huS_LrfBatycqq_dmQoyIzY8svHd7RGckTmNAIFQrmycrrONVRAI1Zz52TdU5U8rzNad0X12GUKozrsx1LcgsmCF7JjB8uJyGQ9yURE_I"
                  />
                </div>
                <div className="absolute -right-6 -bottom-6 flex h-32 w-32 -rotate-12 items-center justify-center rounded-full bg-[#E0A458] p-4 text-center text-sm font-bold text-white shadow-lg">
                  地域に灯る
                  <br />
                  新しい物語
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-lite relative overflow-hidden bg-[#FAF7F2] px-6 py-32">
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-24 text-center">
              <h2 className="font-headline mb-4 text-4xl font-bold tracking-tight">運営メンバー</h2>
              <div className="mx-auto h-1.5 w-16 rounded-full bg-[#D66D52]/40" />
              <p className="mt-6 font-medium text-[#3D3D3D]/60">プロジェクトを支える核心メンバーのご紹介</p>
            </div>

            <div className="flex flex-col gap-32 md:gap-40">
              <article className="relative flex flex-col items-center gap-12 md:flex-row md:gap-20">
                <div className="relative flex w-full justify-center md:w-1/2 md:justify-end">
                  <div className="absolute inset-0 scale-110 -rotate-6 rounded-[42%_58%_70%_30%_/_45%_45%_55%_55%] bg-[#D66D52]/10" />
                  <div className="relative h-64 w-64 overflow-hidden rounded-[42%_58%_70%_30%_/_45%_45%_55%_55%] border-2 border-[#D66D52]/20 bg-white shadow-2xl md:h-80 md:w-80">
                    <div className="flex h-full w-full items-center justify-center bg-[#D66D52]/5">
                      <User className="h-28 w-28 text-[#D66D52]/30" />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-6 text-center md:w-1/2 md:text-left">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold tracking-[0.3em] text-[#D66D52] uppercase opacity-70">
                      Co-founder / Product Design
                    </span>
                    <h3 className="font-headline text-4xl font-bold text-[#3D3D3D] md:text-5xl">佐藤 健一</h3>
                  </div>
                  <div className="mx-auto w-24 rounded-full bg-[#D66D52]/10 p-1 md:mx-0 md:w-32" />
                  <p className="text-lg leading-relaxed font-medium text-[#3D3D3D]/80 italic">
                    「地域の風景に溶け込むデジタルプロダクトの設計を専門としています。テクノロジーが目立つのではなく、その土地の物語を主役に据えた、温かみのある体験作りを目指しています。」
                  </p>
                </div>
              </article>

              <article className="relative flex flex-col items-center gap-12 md:flex-row-reverse md:gap-20">
                <div className="relative flex w-full justify-center md:w-1/2 md:justify-start">
                  <div className="absolute inset-0 scale-110 rotate-6 rounded-[58%_42%_38%_62%_/_52%_64%_36%_48%] bg-[#8A9A5B]/10" />
                  <div className="relative h-64 w-64 overflow-hidden rounded-[58%_42%_38%_62%_/_52%_64%_36%_48%] border-2 border-[#8A9A5B]/20 bg-white shadow-2xl md:h-80 md:w-80">
                    <div className="flex h-full w-full items-center justify-center bg-[#8A9A5B]/5">
                      <User className="h-28 w-28 text-[#8A9A5B]/30" />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-6 text-center md:w-1/2 md:text-right">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold tracking-[0.3em] text-[#8A9A5B] uppercase opacity-70">
                      Co-founder / Business Strategy
                    </span>
                    <h3 className="font-headline text-4xl font-bold text-[#3D3D3D] md:text-5xl">田中 瑞希</h3>
                  </div>
                  <div className="mx-auto w-24 rounded-full bg-[#8A9A5B]/10 p-1 md:ml-auto md:mr-0 md:w-32" />
                  <p className="text-lg leading-relaxed font-medium text-[#3D3D3D]/80 italic">
                    「地域経済の自立と持続可能な観光モデルの構築をライフワークとしています。ステークホルダー全員が豊かになれる仕組みを、物語（ナラティブ）の力で実装していくことに情熱を注いでいます。」
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div className="absolute top-20 left-10 opacity-10">
            <span className="text-[200px]">“</span>
          </div>
        </section>

        <section className="section-lite mx-auto max-w-7xl px-6 py-32">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="sketch-border flex flex-col justify-between bg-[#FDF9F3] p-10 md:col-span-2">
              <div>
                <h2 className="font-headline mb-6 flex items-center gap-3 text-2xl font-bold text-[#D66D52]">
                  <ChartLine className="h-6 w-6" />
                  現在の取り組み状況
                </h2>
                <p className="mb-8 text-[#3D3D3D]/80">
                  現在は「PoC（概念実証）・企画フェーズ」にあります。鳥取県岩美町・岩美駅を主要なユースケースとし、地域密着型の実証実験を繰り返しています。
                </p>
              </div>
              <div className="flex items-center gap-6 rounded-2xl border border-[#3D3D3D]/10 bg-white/50 p-6">
                <img
                  alt="Iwami map"
                  className="h-24 w-24 rounded-xl object-cover grayscale transition-all hover:grayscale-0"
                  decoding="async"
                  loading="lazy"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2CWB6SFVE2HRgm5TkNGf3M588GmbmTDyiGV4WBD9LKQy-j4zn03Kn_X8Ihz58jUTk9BkeZ2L0SqNoKHoYTn_C82dfX1FsRcZxCa4hxwafMKpevHZq5Qju5ui1wy0Q1x3OCENeKZXh9Awpcd-6v9XVKRMNdQsD6eOA4_oAvZBYynAEnTnEKAkKvrUVNzRvxIL3t9ik6zGa2VbSdVTL8WBZzBAmqq-gmWkwXoTzhy9Iek20u6jMK_CRwnqFN3SY2XYv02s8S5n25zA"
                />
                <div>
                  <p className="mb-1 text-xs font-bold text-[#D66D52]">Focused Use Case</p>
                  <p className="font-headline text-lg font-bold">岩美町・岩美駅エリア</p>
                  <p className="text-xs text-[#3D3D3D]/60">
                    特定地域での深い検証を通じ、汎用的なスケールモデルを目指しています。
                  </p>
                </div>
              </div>
            </article>

            <article className="sketch-border flex flex-col justify-between border-[#3D3D3D] bg-[#3D3D3D] p-10 text-white/90 md:rotate-1">
              <div>
                <h2 className="font-headline mb-8 flex items-center gap-3 text-2xl font-bold text-[#E0A458]">
                  <Users className="h-6 w-6" />
                  運営体制
                </h2>
                <ul className="space-y-6">
                  <li className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-sm font-medium">Business Design</span>
                    <span className="text-sm">TOMOSHIBI Unit</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-sm font-medium">Product</span>
                    <span className="text-sm">Engineering Team</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-sm font-medium">Regional PoC</span>
                    <span className="text-sm">Iwami Partners</span>
                  </li>
                </ul>
              </div>
              <p className="mt-10 text-xs leading-relaxed text-white/50 italic">
                地域のステークホルダー、自治体、交通事業者と密接に連携し、共創の形でプロジェクトを推進しています。
              </p>
            </article>
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
            <h2 className="font-headline mb-8 text-4xl font-bold md:text-5xl">地域と共に、新しい物語を。</h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed opacity-90">
              TOMOSHIBIでは、実証実験に協力いただける自治体様や事業者様、そしてこの旅に参加いただける旅行者様をお待ちしています。
            </p>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <Link
                className="rounded-full bg-white px-12 py-5 text-lg font-bold text-[#D66D52] shadow-2xl transition-all hover:scale-105"
                href="/contact"
              >
                実証相談をする
              </Link>
              <Link
                className="rounded-full border-2 border-white/40 px-12 py-5 text-lg font-bold text-white transition-all hover:bg-white/10"
                href="/users"
              >
                旅行者向け案内を見る
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#3D3D3D] px-6 py-20 text-white/60">
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
                <Link className="transition-colors hover:text-[#E0A458]" href="/mechanism">
                  仕組み
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-[#E0A458]" href="/#targets">
                  導入対象
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
                <Link className="transition-colors hover:text-[#E0A458]" href="/about">
                  運営について
                </Link>
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
                <a className="transition-colors hover:text-[#E0A458]" href="#">
                  運営会社
                </a>
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
