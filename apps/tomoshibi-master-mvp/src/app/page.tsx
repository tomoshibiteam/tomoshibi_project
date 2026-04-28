"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════
// SVG コンポーネント
// ═══════════════════════════════════════════════════════════

function FlameSvg({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fg-outer" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFEEB0" />
          <stop offset="45%" stopColor="#F5902A" />
          <stop offset="100%" stopColor="#C84010" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fg-inner" cx="50%" cy="65%" r="45%">
          <stop offset="0%" stopColor="#FFFBE0" />
          <stop offset="100%" stopColor="#F5902A" />
        </radialGradient>
      </defs>
      <path d="M24 3C24 3 37 16 39 28C41 38 35 46 31 48C30 42 28 37 24 34C20 37 18 42 17 48C13 46 7 38 9 28C11 16 24 3 24 3Z" fill="url(#fg-outer)" />
      <path d="M24 16C24 16 30 24 31 32C32 38 28 42 26 44C25.5 40 25 37 24 35C23 37 22.5 40 22 44C20 42 16 38 17 32C18 24 24 16 24 16Z" fill="url(#fg-inner)" opacity="0.9" />
      <ellipse cx="24" cy="38" rx="4" ry="5" fill="#FFFEF0" opacity="0.65" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? c : "none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? "#E8722A" : "#9C8B78";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// 型定義
// ═══════════════════════════════════════════════════════════

type Tab = "home" | "map" | "conversation" | "record" | "settings";

type SuggestionData = {
  id: string;
  title: string;
  place: string;
  region: string;
  quote: string;
  highlightWords: string[];
  walkTime: string;
  distance: string;
  rating: string;
  category: string;
  categoryEmoji: string;
  storyText: string;
  tags: string[];
};

type Message = {
  id: string;
  type: "companion" | "user" | "suggestion";
  text?: string;
  suggestion?: SuggestionData;
};

// ═══════════════════════════════════════════════════════════
// データ
// ═══════════════════════════════════════════════════════════

const SUGGESTION_BEACH: SuggestionData = {
  id: "s1",
  title: "夕暮れの浜辺へ",
  place: "辰ノ島",
  region: "壱岐",
  quote: "ここで夕日を見てほしかったんだ。海の向こうに落ちていく光が、なんか…言葉にならなくて。",
  highlightWords: ["夕日", "言葉にならなくて"],
  walkTime: "徒歩15分",
  distance: "1.2km",
  rating: "4.8",
  category: "海辺",
  categoryEmoji: "🌊",
  storyText: "断崖の上に立つと、水平線が丸く見える。古くから漁師たちが灯台代わりに仰いできたというこの場所は、夕暮れ時になると空と海の境界が溶け合い、世界の果てにいるような錯覚を覚える。誰かと一緒に来たとき、二人ともしばらく言葉を失った——そんな話を、地元の老人から聞いた……",
  tags: ["絶景", "夕日", "海辺", "ひとり旅", "カップル"],
};

const SUGGESTION_CASTLE: SuggestionData = {
  id: "s2",
  title: "隠れた絶景スポット",
  place: "勝本城跡",
  region: "壱岐",
  quote: "あなたが歴史好きって話してたの、覚えてるよ。ここ、きっと気に入ると思う。",
  highlightWords: ["歴史好き", "覚えてる"],
  walkTime: "車で20分",
  distance: "8.5km",
  rating: "4.6",
  category: "歴史",
  categoryEmoji: "🏯",
  storyText: "戦国時代、対馬を望むこの丘に築かれた小さな城。今は石垣と眺望だけが残るが、かつてここに立った武将たちも、同じ海を見ていた。草に覆われた石段を登り切ったとき、眼下に広がる紺碧の入り江は——地図には載っていない、知る人ぞ知る景色だ……",
  tags: ["歴史", "城跡", "絶景", "穴場", "散策"],
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", type: "companion", text: "来てくれたんだね。ちょうど話したいことがあったんだ。" },
  { id: "2", type: "companion", text: "昨日ね、ずっと気になってた場所を調べてたんだよ。" },
  { id: "3", type: "suggestion", suggestion: SUGGESTION_BEACH },
  { id: "4", type: "companion", text: "一緒に行ってみない？" },
];

const COMPANION_REPLIES = [
  "そうなんだ。もう少し聞かせてくれる？",
  "なるほど…ちょっと考えさせて。",
  "うん、わかった。それ覚えておくね。",
  "それ、すごく素敵だと思う。",
  "ふふ、あなたらしいね。",
  "そういえばね、気になる場所がまた一個増えたんだ。",
];

function getTimeGreeting(): { line1: string; line2: string } {
  const h = new Date().getHours();
  if (h < 6)  return { line1: "こんな夜中に、起きてたの？", line2: "静かな時間だね。何か話そう。" };
  if (h < 11) return { line1: "おはよう。今日も一緒に冒険しよ？", line2: "朝の空気、外で吸ってみない？" };
  if (h < 14) return { line1: "お昼だよ。どこか行きたい気分じゃない？", line2: "いい場所、知ってるよ。" };
  if (h < 17) return { line1: "午後の光、外で感じてみない？", line2: "今日の空、特別な気がする。" };
  if (h < 20) return { line1: "夕方の光、今日は特別きれいな気がする。", line2: "どこかに寄って帰ろうか。" };
  return { line1: "今夜はどんな話、聞かせてくれる？", line2: "ゆっくり話そう。" };
}

// ═══════════════════════════════════════════════════════════
// ハイライトテキスト
// ═══════════════════════════════════════════════════════════

function HighlightedText({ text, words }: { text: string; words: string[] }) {
  if (words.length === 0) return <>{text}</>;

  const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        words.includes(part) ? (
          <span key={i} className="text-[#E8722A] font-semibold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// 外出提案詳細オーバーレイ
// ═══════════════════════════════════════════════════════════

function SuggestionDetailOverlay({
  suggestion,
  companionName,
  onClose,
  onGo,
}: {
  suggestion: SuggestionData;
  companionName: string;
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto"
      style={{ animation: "fade-in 0.2s ease-out" }}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* スライドアップパネル */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#F5F0E8] rounded-t-3xl overflow-hidden flex flex-col"
        style={{ height: "92dvh", animation: "slide-up 0.38s cubic-bezier(0.16,1,0.3,1)" }}
      >

        {/* ── ヒーロービジュアル ── */}
        <div className="relative flex-shrink-0" style={{ height: "42%" }}>
          {/* 背景（ダーク・ミステリアス） */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0603] via-[#1A0F06] to-[#2A1C10]" />

          {/* 炎グロー演出 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-[#E8722A] opacity-15 blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flame-animate opacity-40">
              <FlameSvg size={72} />
            </div>
          </div>

          {/* 上部ボタン行 */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5 pb-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:opacity-70"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={onClose}
              className="text-white/70 text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full active:opacity-70"
            >
              あとで
            </button>
          </div>

          {/* スポット情報オーバーレイ（下部） */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-[#140E09] to-transparent pt-10">
            <span className="bg-[#E8722A] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              {suggestion.categoryEmoji} {suggestion.category}
            </span>
            <h2 className="text-white text-xl font-bold font-headline mt-2">{suggestion.title}</h2>
            <p className="text-[#9C8B78] text-xs mt-0.5">{suggestion.place} · {suggestion.region}</p>
          </div>
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-8 flex flex-col gap-5">

            {/* コンパニオンのことば */}
            <div className="bg-white rounded-2xl px-4 py-4 border border-[#D4C9B8] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                  <FlameSvg size={16} />
                </div>
                <span className="text-[#9C8B78] text-[10px] font-semibold tracking-wider uppercase">{companionName}のことば</span>
              </div>
              <p className="text-[#2A1C10] text-sm leading-relaxed italic">
                「<HighlightedText text={suggestion.quote} words={suggestion.highlightWords} />」
              </p>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center gap-3">
              {[
                { icon: "🚶", label: suggestion.walkTime },
                { icon: "📍", label: suggestion.distance },
                { icon: "⭐", label: suggestion.rating },
              ].map((item) => (
                <div key={item.label} className="flex-1 bg-white rounded-xl border border-[#D4C9B8] px-3 py-2.5 flex flex-col items-center gap-0.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[#2A1C10] text-xs font-semibold">{item.label}</span>
                </div>
              ))}
            </div>

            {/* 物語の導入テキスト */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-[#D4C9B8]" />
                <span className="text-[#9C8B78] text-[10px] font-semibold tracking-wider uppercase">物語の導入</span>
                <div className="h-px flex-1 bg-[#D4C9B8]" />
              </div>
              <p className="text-[#3A2A18] text-sm leading-[1.9] tracking-wide">
                {suggestion.storyText}
              </p>
            </div>

            {/* タグ */}
            <div className="flex flex-wrap gap-2">
              {suggestion.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white border border-[#D4C9B8] text-[#9C8B78] text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── アクションボタン ── */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 bg-[#F5F0E8] border-t border-[#D4C9B8]">
          <button
            onClick={onGo}
            className="w-full bg-[#E8722A] text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-[#E8722A]/25 active:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <div className="flame-animate"><FlameSvg size={20} /></div>
            行く
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 text-[#9C8B78] text-sm py-2 active:opacity-70"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 提案カード（会話・ホーム共通）
// ═══════════════════════════════════════════════════════════

function SuggestionCard({
  suggestion,
  onTap,
  compact = false,
}: {
  suggestion: SuggestionData;
  onTap: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-[#D4C9B8] shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
      onClick={onTap}
    >
      <div
        className={`bg-gradient-to-br from-[#1A0F06] via-[#2A1C10] to-[#4A2A10] flex items-center justify-center relative overflow-hidden ${compact ? "h-28" : "h-44"}`}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full bg-[#E8722A] opacity-20 blur-2xl" />
        <div className="flame-animate opacity-60">
          <FlameSvg size={compact ? 38 : 56} />
        </div>
        <span className="absolute top-3 left-3 bg-[#E8722A] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
          {suggestion.categoryEmoji} {suggestion.category}
        </span>
        <span className="absolute bottom-2 right-3 text-white/25 text-[9px]">スポット画像</span>
      </div>
      <div className="px-4 py-3">
        <h3 className={`text-[#2A1C10] font-bold font-headline ${compact ? "text-sm" : "text-base"} mb-1`}>
          {suggestion.title}
        </h3>
        <p className="text-[#9C8B78] text-xs leading-relaxed mb-2.5 line-clamp-2 italic">
          「{suggestion.quote}」
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#9C8B78]">
            <span>🚶 {suggestion.walkTime}</span>
            <span>📍 {suggestion.place}</span>
          </div>
          <button
            className="bg-[#E8722A] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full active:opacity-80"
            onClick={(e) => { e.stopPropagation(); onTap(); }}
          >
            詳しく見る →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ホーム画面
// ═══════════════════════════════════════════════════════════

function HomeScreen({
  companionName,
  onOpenChat,
  onSuggestionTap,
}: {
  companionName: string;
  onOpenChat: () => void;
  onSuggestionTap: (s: SuggestionData) => void;
}) {
  const [greeting, setGreeting] = useState({ line1: "", line2: "" });
  useEffect(() => { setGreeting(getTimeGreeting()); }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ヒーロー */}
      <div className="bg-[#140E09] px-5 pt-4 pb-7 flex flex-col items-center relative overflow-hidden flex-shrink-0">
        <div className="w-full flex items-center justify-between mb-7">
          <span className="text-[#E8722A] font-bold text-base tracking-[0.18em] font-headline">TOMOSHIBI</span>
          <button className="w-9 h-9 rounded-full border border-[#3A2A18] flex items-center justify-center active:opacity-70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8B78" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
        <div className="glow-animate absolute top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#E8722A] opacity-[0.08] blur-3xl pointer-events-none" />
        <div className="relative mb-4 fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-24 h-24 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center shadow-xl">
            <div className="flame-animate"><FlameSvg size={52} /></div>
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#E8722A] border-2 border-[#140E09]" />
        </div>
        <div className="fade-in-up text-center mb-5" style={{ animationDelay: "0.2s" }}>
          <p className="text-[#9C8B78] text-[10px] tracking-[0.2em] uppercase mb-1">あなたのコンパニオン</p>
          <h2 className="text-white text-xl font-bold font-headline">{companionName}</h2>
        </div>
        <button onClick={onOpenChat} className="fade-in-up w-full active:opacity-80" style={{ animationDelay: "0.3s" }}>
          <div className="bg-[#2A1C10] rounded-2xl rounded-tl-sm px-5 py-4 border border-[#3A2A18] text-left">
            <p className="text-white text-sm leading-relaxed">{greeting.line1}</p>
            <p className="text-[#9C8B78] text-xs mt-1">{greeting.line2}</p>
            <p className="text-[#E8722A] text-[10px] mt-2 font-medium">話しかける →</p>
          </div>
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 flex flex-col gap-5">
        <section className="fade-in-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-2">✦ {companionName}からの提案</p>
          <SuggestionCard suggestion={SUGGESTION_BEACH} onTap={() => onSuggestionTap(SUGGESTION_BEACH)} />
        </section>

        <section className="fade-in-up" style={{ animationDelay: "0.5s" }}>
          <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-2">✦ 最近の思い出</p>
          <div className="flex flex-col gap-2">
            {[
              { emoji: "🌊", title: "左京鼻の夕焼け", date: "3日前" },
              { emoji: "🌿", title: "一支国博物館", date: "先週" },
            ].map((item) => (
              <button key={item.title} className="bg-white/70 rounded-2xl border border-[#D4C9B8] px-4 py-3 flex items-center gap-3 w-full text-left active:opacity-80">
                <div className="w-11 h-11 rounded-xl bg-[#F5F0E8] border border-[#D4C9B8] flex items-center justify-center flex-shrink-0 text-xl">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2A1C10] text-sm font-medium truncate">{item.title}</p>
                  <p className="text-[#9C8B78] text-xs">{item.date} · {companionName}と一緒に</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4C9B8" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 会話画面
// ═══════════════════════════════════════════════════════════

function ConversationScreen({
  companionName,
  onSuggestionTap,
  onStartOuting,
}: {
  companionName: string;
  onSuggestionTap: (s: SuggestionData) => void;
  onStartOuting: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), type: "user", text: inputText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = COMPANION_REPLIES[Math.floor(Math.random() * COMPANION_REPLIES.length)];
      const reply: Message = { id: (Date.now() + 1).toString(), type: "companion", text: replyText };
      setMessages((prev) => {
        const next = [...prev, reply];
        if (Math.random() < 0.3) {
          return [...next, { id: (Date.now() + 2).toString(), type: "suggestion", suggestion: SUGGESTION_CASTLE }];
        }
        return next;
      });
    }, 800 + Math.random() * 500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
          <div className="flame-animate"><FlameSvg size={22} /></div>
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-sm font-headline">{companionName}</h2>
          <p className="text-[#E8722A] text-[10px]">● オンライン</p>
        </div>
        <button
          onClick={onStartOuting}
          className="text-[#E8722A] text-xs border border-[#E8722A]/40 bg-[#E8722A]/10 px-3 py-1.5 rounded-full active:opacity-70 font-medium"
        >
          外出を始める
        </button>
      </div>

      {/* メッセージ */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => {
          if (msg.type === "user") {
            return (
              <div key={msg.id} className="flex justify-end fade-in-up">
                <div className="bg-[#E8722A] text-white text-sm px-4 py-3 rounded-2xl rounded-br-sm max-w-[75%] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }
          if (msg.type === "suggestion" && msg.suggestion) {
            return (
              <div key={msg.id} className="flex items-end gap-2 fade-in-up">
                <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                  <FlameSvg size={18} />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <SuggestionCard
                    suggestion={msg.suggestion}
                    onTap={() => onSuggestionTap(msg.suggestion!)}
                    compact
                  />
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex items-end gap-2 fade-in-up">
              <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
                <FlameSvg size={18} />
              </div>
              <div className="bg-white border border-[#D4C9B8] text-[#2A1C10] text-sm px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] leading-relaxed shadow-sm">
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2 fade-in-up">
            <div className="w-8 h-8 rounded-full bg-[#2A1C10] border border-[#3A2A18] flex items-center justify-center flex-shrink-0">
              <FlameSvg size={18} />
            </div>
            <div className="bg-white border border-[#D4C9B8] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9C8B78]"
                  style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力 */}
      <div className="px-4 py-3 bg-[#F5F0E8] border-t border-[#D4C9B8] flex-shrink-0">
        <div className="bg-white border border-[#D4C9B8] rounded-2xl shadow-sm flex items-center gap-2 px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-[#2A1C10] flex items-center justify-center flex-shrink-0">
            <FlameSvg size={16} />
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`${companionName}に話しかける…`}
            className="flex-1 text-sm text-[#2A1C10] placeholder-[#9C8B78] bg-transparent outline-none"
          />
          <button
            onClick={handleSend}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${inputText.trim() ? "bg-[#E8722A]" : "bg-[#D4C9B8]"}`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 記録画面
// ═══════════════════════════════════════════════════════════

type RecordTab = "album" | "achievement" | "companion";

type AlbumEntry = {
  id: string;
  spotName: string;
  title: string;
  region: string;
  date: string;
  companionQuote: string;
  steps: number;
  duration: string;
  emoji: string;
  tags: string[];
};

type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlockedAt: string | null;
};

type RegionProgress = {
  region: string;
  visited: number;
  total: number;
};

const MOCK_ALBUM: AlbumEntry[] = [
  {
    id: "a1",
    spotName: "辰ノ島",
    title: "夕暮れの浜辺へ",
    region: "壱岐",
    date: "4月25日（木）",
    companionQuote: "言葉にならない夕日だったね。また来ようね。",
    steps: 4820,
    duration: "2時間15分",
    emoji: "🌊",
    tags: ["絶景", "夕日", "海辺"],
  },
  {
    id: "a2",
    spotName: "一支国博物館",
    title: "歴史の海へ潜る旅",
    region: "壱岐",
    date: "4月18日（金）",
    companionQuote: "あなたが遺跡の前で黙り込んでたの、覚えてるよ。",
    steps: 3210,
    duration: "1時間40分",
    emoji: "🏛️",
    tags: ["歴史", "博物館"],
  },
  {
    id: "a3",
    spotName: "左京鼻",
    title: "岬に吹く風を感じに",
    region: "壱岐",
    date: "4月10日（水）",
    companionQuote: "風が強くて、声も届かなくて。それがよかった。",
    steps: 6100,
    duration: "3時間05分",
    emoji: "🌿",
    tags: ["自然", "絶景", "岬"],
  },
];

const MOCK_BADGES: Badge[] = [
  { id: "b1", emoji: "🌊", name: "海の旅人", description: "海辺スポットを3箇所訪問", unlockedAt: "4月25日" },
  { id: "b2", emoji: "🏛️", name: "歴史探訪者", description: "歴史スポットを2箇所訪問", unlockedAt: "4月18日" },
  { id: "b3", emoji: "🔥", name: "初めての外出", description: "はじめて外出を完了した", unlockedAt: "4月10日" },
  { id: "b4", emoji: "🌟", name: "壱岐の申し子", description: "壱岐のスポットを5箇所訪問", unlockedAt: null },
  { id: "b5", emoji: "🌙", name: "夜の探索者", description: "夕暮れ以降に外出を完了", unlockedAt: null },
  { id: "b6", emoji: "👣", name: "一万歩の達人", description: "1回の外出で1万歩を達成", unlockedAt: null },
];

const MOCK_REGION_PROGRESS: RegionProgress[] = [
  { region: "壱岐", visited: 5, total: 12 },
  { region: "対馬", visited: 0, total: 8 },
  { region: "五島列島", visited: 0, total: 10 },
];

function AlbumTab({ companionName }: { companionName: string }) {
  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      {MOCK_ALBUM.map((entry, idx) => (
        <div key={entry.id} className="fade-in-up" style={{ animationDelay: `${idx * 0.08}s` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#9C8B78] text-[10px] font-semibold">{entry.date}</span>
            <div className="h-px flex-1 bg-[#D4C9B8]" />
          </div>
          <div className="bg-white rounded-2xl overflow-hidden border border-[#D4C9B8] shadow-sm">
            <div className="h-32 bg-gradient-to-br from-[#1A0F06] via-[#2A1C10] to-[#3A2010] relative flex items-center justify-center overflow-hidden">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full bg-[#E8722A] opacity-20 blur-2xl" />
              <span className="text-5xl relative z-10">{entry.emoji}</span>
              <span className="absolute bottom-2 right-3 text-white/20 text-[9px]">写真を追加</span>
            </div>
            <div className="px-4 pt-3 pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[#9C8B78] text-[10px] font-semibold tracking-wider">{entry.region} · {entry.spotName}</p>
                  <h3 className="text-[#2A1C10] font-bold text-base font-headline mt-0.5">{entry.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {entry.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-[#F5F0E8] border border-[#D4C9B8] text-[#9C8B78] text-[9px] px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#2A1C10] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FlameSvg size={11} />
                </div>
                <p className="text-[#3A2A18] text-xs leading-relaxed italic flex-1">「{entry.companionQuote}」</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#9C8B78] border-t border-[#F5F0E8] pt-2.5">
                <span>👣 {entry.steps.toLocaleString()}歩</span>
                <span>⏱ {entry.duration}</span>
                <span className="ml-auto text-[10px]">{companionName}と一緒に</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementTab() {
  return (
    <div className="px-4 py-5 flex flex-col gap-6">
      <section>
        <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-3">
          獲得バッジ {MOCK_BADGES.filter((b) => b.unlockedAt).length}/{MOCK_BADGES.length}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {MOCK_BADGES.map((badge, idx) => (
            <div
              key={badge.id}
              className={`fade-in-up rounded-2xl p-3 flex flex-col items-center gap-1.5 border text-center ${
                badge.unlockedAt ? "bg-white border-[#D4C9B8] shadow-sm" : "bg-[#F5F0E8] border-[#D4C9B8]/50"
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className={`text-3xl ${badge.unlockedAt ? "" : "grayscale opacity-30"}`}>{badge.emoji}</span>
              <span className={`text-[10px] font-bold leading-tight ${badge.unlockedAt ? "text-[#2A1C10]" : "text-[#9C8B78]"}`}>
                {badge.name}
              </span>
              {badge.unlockedAt
                ? <span className="text-[#E8722A] text-[9px]">{badge.unlockedAt}</span>
                : <span className="text-[#9C8B78] text-[9px]">🔒</span>
              }
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-3">地域別 達成状況</p>
        <div className="flex flex-col gap-3">
          {MOCK_REGION_PROGRESS.map((rp) => (
            <div key={rp.region} className="bg-white rounded-2xl border border-[#D4C9B8] px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#2A1C10] text-sm font-semibold">{rp.region}</span>
                <span className="text-[#9C8B78] text-xs">{rp.visited} / {rp.total} スポット</span>
              </div>
              <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8722A] rounded-full"
                  style={{ width: `${(rp.visited / rp.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompanionStateTab({ companionName }: { companionName: string }) {
  const memories = [
    "夕日を一緒に見た（辰ノ島）",
    "遺跡の前で沈黙した（一支国博物館）",
    "岬の風の中で立ち止まった（左京鼻）",
  ];
  const items = [
    { emoji: "🌊", name: "波の記憶", unlockedAt: "4月25日" },
    { emoji: "🏛️", name: "歴史の欠片", unlockedAt: "4月18日" },
    { emoji: "🌿", name: "風の声", unlockedAt: "4月10日" },
    { emoji: "🔮", name: "???", unlockedAt: null },
  ];

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      {/* コンパニオンアバター + レベル */}
      <div className="bg-[#140E09] rounded-3xl p-6 flex flex-col items-center gap-4 relative overflow-hidden">
        <div className="glow-animate absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#E8722A] opacity-[0.07] blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#2A1C10] border-2 border-[#3A2A18] flex items-center justify-center shadow-xl">
            <div className="flame-animate"><FlameSvg size={44} /></div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#E8722A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#140E09]">
            Lv.3
          </div>
        </div>
        <div className="text-center">
          <p className="text-[#9C8B78] text-[10px] tracking-wider uppercase mb-0.5">あなたのコンパニオン</p>
          <h2 className="text-white font-bold text-lg font-headline">{companionName}</h2>
          <p className="text-[#9C8B78] text-xs mt-1">旅の記憶を持つ灯火</p>
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#9C8B78] text-[10px] font-semibold tracking-wider uppercase">親密度</span>
            <span className="text-[#E8722A] text-[10px] font-bold">68 / 100</span>
          </div>
          <div className="h-2 bg-[#2A1C10] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: "68%", background: "linear-gradient(90deg, #E8722A 0%, #F5A060 100%)" }}
            />
          </div>
          <p className="text-[#9C8B78] text-[9px] mt-1 text-right">次のレベルまで 32</p>
        </div>
      </div>

      {/* 蓄積された記憶 */}
      <section>
        <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-3">✦ 蓄積された記憶</p>
        <div className="flex flex-col gap-2">
          {memories.map((memory, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-[#D4C9B8] px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-1 h-8 rounded-full bg-[#E8722A] flex-shrink-0" />
              <p className="text-[#3A2A18] text-xs leading-relaxed">{memory}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 解放アイテム */}
      <section>
        <p className="text-[#9C8B78] text-[10px] font-semibold tracking-[0.18em] uppercase mb-3">✦ 解放されたアイテム</p>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-3.5 flex items-center gap-3 ${
                item.unlockedAt ? "bg-white border-[#D4C9B8] shadow-sm" : "bg-[#F5F0E8] border-[#D4C9B8]/50"
              }`}
            >
              <span className={`text-2xl ${item.unlockedAt ? "" : "grayscale opacity-30"}`}>{item.emoji}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${item.unlockedAt ? "text-[#2A1C10]" : "text-[#9C8B78]"}`}>{item.name}</p>
                {item.unlockedAt
                  ? <p className="text-[#E8722A] text-[9px]">{item.unlockedAt}</p>
                  : <p className="text-[#9C8B78] text-[9px]">🔒 未解放</p>
                }
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RecordScreen({ companionName }: { companionName: string }) {
  const [recordTab, setRecordTab] = useState<RecordTab>("album");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-lg font-headline">記録</h1>
          <span className="text-[#9C8B78] text-xs">{MOCK_ALBUM.length}回の外出</span>
        </div>
        <div className="flex bg-[#2A1C10] rounded-xl p-1 gap-1">
          {(
            [
              { key: "album" as RecordTab, label: "アルバム" },
              { key: "achievement" as RecordTab, label: "実績" },
              { key: "companion" as RecordTab, label: "コンパニオン" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRecordTab(key)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                recordTab === key ? "bg-[#E8722A] text-white shadow-sm" : "text-[#9C8B78]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {recordTab === "album" && <AlbumTab companionName={companionName} />}
        {recordTab === "achievement" && <AchievementTab />}
        {recordTab === "companion" && <CompanionStateTab companionName={companionName} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// プレースホルダー
// ═══════════════════════════════════════════════════════════

const PLACEHOLDER_CONFIG: Record<string, { emoji: string; label: string; desc: string }> = {
  map:      { emoji: "🗺️", label: "地図",   desc: "周辺スポットを地図で確認できます" },
  settings: { emoji: "⚙️", label: "設定",   desc: "プロフィール・通知・コンパニオン編集" },
};

function PlaceholderScreen({ tab }: { tab: string }) {
  const c = PLACEHOLDER_CONFIG[tab] ?? { emoji: "🔨", label: tab, desc: "準備中" };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#140E09] px-5 pt-4 pb-4 flex-shrink-0 flex items-center">
        <h1 className="text-white font-bold text-lg font-headline">{c.label}</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white border border-[#D4C9B8] flex items-center justify-center text-4xl shadow-sm">{c.emoji}</div>
        <div>
          <h3 className="text-[#2A1C10] font-bold text-lg font-headline mb-1">{c.label}</h3>
          <p className="text-[#9C8B78] text-sm leading-relaxed">{c.desc}</p>
        </div>
        <span className="bg-[#D4C9B8]/50 text-[#9C8B78] text-xs px-3 py-1 rounded-full">開発中</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NavButton
// ═══════════════════════════════════════════════════════════

function NavButton({ label, active, onClick, children }: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 flex-1 py-2 active:opacity-70 transition-opacity">
      {children}
      <span className={`text-[10px] font-medium ${active ? "text-[#E8722A]" : "text-[#9C8B78]"}`}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// メインコンポーネント
// ═══════════════════════════════════════════════════════════

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionData | null>(null);
  const COMPANION_NAME = "ホタル";

  const handleSuggestionTap = (s: SuggestionData) => setActiveSuggestion(s);
  const handleCloseDetail = () => setActiveSuggestion(null);
  const handleGo = () => {
    setActiveSuggestion(null);
    // TODO: 外出開始演出へ
  };

  return (
    <>
      <style>{`
        @keyframes typing-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>

      <div className="h-full bg-[#140E09] flex flex-col max-w-md mx-auto overflow-hidden">
        {/* iOS ノッチ・Dynamic Island セーフエリア */}
        <div className="flex-shrink-0" style={{ height: "env(safe-area-inset-top, 0px)" }} />

        {/* コンテンツ — relative + overflow-hidden で高さを完全固定 */}
        <div className="flex-1 relative overflow-hidden bg-[#F5F0E8]">
          {activeTab === "home" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <HomeScreen
                companionName={COMPANION_NAME}
                onOpenChat={() => setActiveTab("conversation")}
                onSuggestionTap={handleSuggestionTap}
              />
            </div>
          )}
          {activeTab === "conversation" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <ConversationScreen
                companionName={COMPANION_NAME}
                onSuggestionTap={handleSuggestionTap}
                onStartOuting={handleGo}
              />
            </div>
          )}
          {activeTab === "record" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <RecordScreen companionName={COMPANION_NAME} />
            </div>
          )}
          {activeTab !== "home" && activeTab !== "conversation" && activeTab !== "record" && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <PlaceholderScreen tab={activeTab} />
            </div>
          )}
        </div>

        {/* ボトムナビ */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-[#D4C9B8]">
        <div className="flex items-center h-[60px] px-2">
          <NavButton label="ホーム" active={activeTab === "home"} onClick={() => setActiveTab("home")}>
            <HomeIcon active={activeTab === "home"} />
          </NavButton>
          <NavButton label="地図" active={activeTab === "map"} onClick={() => setActiveTab("map")}>
            <MapIcon active={activeTab === "map"} />
          </NavButton>
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setActiveTab("conversation")}
              className={`w-[58px] h-[58px] rounded-full shadow-lg flex flex-col items-center justify-center gap-0.5 -translate-y-3 active:scale-95 transition-all ${
                activeTab === "conversation" ? "bg-[#2A1C10] shadow-[#140E09]/40" : "bg-[#E8722A] shadow-[#E8722A]/30"
              }`}
            >
              <div className="flame-animate"><FlameSvg size={22} /></div>
              <span className="text-white text-[9px] font-bold tracking-wide">会話</span>
            </button>
          </div>
          <NavButton label="記録" active={activeTab === "record"} onClick={() => setActiveTab("record")}>
            <BookIcon active={activeTab === "record"} />
          </NavButton>
          <NavButton label="設定" active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
            <SettingsIcon active={activeTab === "settings"} />
          </NavButton>
        </div>
        {/* iOS ホームバー セーフエリア */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>

        {/* 外出提案詳細オーバーレイ */}
        {activeSuggestion && (
          <SuggestionDetailOverlay
            suggestion={activeSuggestion}
            companionName={COMPANION_NAME}
            onClose={handleCloseDetail}
            onGo={handleGo}
          />
        )}
      </div>
    </>
  );
}
