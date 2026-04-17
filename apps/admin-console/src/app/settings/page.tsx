"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "../_components/material-icon";

type EditorTab = "world" | "scenarioFlow" | "character" | "prologue" | "epilogue" | "spotDb";
type DeviceMode = "mobile" | "tablet";
type CharacterDraft = {
  id: string;
  name: string;
  role: string;
  toneRule: string;
  imageDataUrl: string | null;
  imageFileName: string | null;
};
type PreviewScreen =
  | "landing"
  | "setup"
  | "preparing"
  | "ready"
  | "prologue"
  | "map"
  | "spotArrival"
  | "epilogue"
  | "feedback";

const PREVIEW_SCREEN_ORDER: PreviewScreen[] = [
  "landing",
  "setup",
  "preparing",
  "ready",
  "prologue",
  "map",
  "spotArrival",
  "epilogue",
  "feedback",
];

const PREVIEW_VIEWPORT_SIZE = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 420, height: 760 },
} as const;
const ADMIN_SETTINGS_STORAGE_KEY = "tomoshibiAdminConsoleSettingsV1";

const EDITOR_TABS: Array<{ key: EditorTab; label: string }> = [
  { key: "world", label: "物語概要" },
  { key: "scenarioFlow", label: "シナリオフロー" },
  { key: "character", label: "キャラクター" },
  { key: "spotDb", label: "スポットDB" },
  { key: "prologue", label: "プロローグ" },
  { key: "epilogue", label: "エピローグ" },
];

const TONE_OPTIONS = [
  { key: "calm", label: "落ち着いた (Calm & Intellectual)" },
  { key: "adventurous", label: "冒険的 (Adventurous & Dynamic)" },
  { key: "warm", label: "温かい (Warm & Welcoming)" },
] as const;

const INITIAL_WORLD_TITLE = "Academic Discovery";
const INITIAL_WORLD_DESCRIPTION =
  "新入生に向けた探求的で知的な旅。物語は好奇心を刺激し、九州大学キャンパスの建築や自然の美しさを反映した、落ち着きのある洗練された感覚を提供するものでなければならない。";
const INITIAL_STYLE_RULES =
  "- 「です・ます」調を統一して使用する。\n- キャンパス施設を紹介する際は、過度に専門的な用語を避ける。\n- 密度の高い実用的なテキストは避け、洗練されたエディトリアルトーンを維持する。";
const INITIAL_REQUIRED_KEYWORDS = ["好奇心", "発見", "アーカイブ"];
const INITIAL_BLOCKED_KEYWORDS = ["やばい", "マジで"];
const INITIAL_CHARACTER_NAME = "案内役";
const INITIAL_CHARACTER_ROLE = "伊都キャンパスの記憶を案内するナビゲーター";
const INITIAL_CHARACTER_TONE =
  "静かで知的。断定しすぎず、問いかけるような語り口でユーザーの発見を促す。";
const INITIAL_CHARACTERS: CharacterDraft[] = [
  {
    id: "character-1",
    name: INITIAL_CHARACTER_NAME,
    role: INITIAL_CHARACTER_ROLE,
    toneRule: INITIAL_CHARACTER_TONE,
    imageDataUrl: null,
    imageFileName: null,
  },
];
const INITIAL_PROLOGUE_BODY =
  "あなたが今日歩くこの場所には、\nまだ気づいていない物語が眠っています。\nいつもの景色を、少し違う目線で辿ってみましょう。";
const INITIAL_PROLOGUE_CTA = "体験を始める";
const INITIAL_EPILOGUE_BODY =
  "歩いた景色も、立ち止まった場所も、\n今日の伊都キャンパスの記憶として残っていきます。\n最後に、今回の体験について教えてください。";
const INITIAL_EPILOGUE_CTA = "体験を振り返る";
const SCENARIO_DURATION_OPTIONS = [
  { key: "15-20", label: "15〜20分", intermediateSpotCount: 1 },
  { key: "20-30", label: "20〜30分", intermediateSpotCount: 2 },
  { key: "30-45", label: "30〜45分", intermediateSpotCount: 3 },
] as const;
const INITIAL_SCENARIO_DURATION = SCENARIO_DURATION_OPTIONS[0].key;

const INITIAL_SPOT_DB_ROWS = [
  {
    id: "spot-001",
    name: "Big Orange",
    familiarity: "初回向け",
    phase: "START",
    note: "導入説明と最初の物語を表示",
  },
  {
    id: "spot-002",
    name: "Center Zone",
    familiarity: "初回〜中級",
    phase: "MIDDLE",
    note: "中間スポット（順不同フェーズ）",
  },
  {
    id: "spot-003",
    name: "中央図書館",
    familiarity: "全レベル",
    phase: "MIDDLE",
    note: "中間スポット（順不同フェーズ）",
  },
  {
    id: "spot-004",
    name: "West Gate",
    familiarity: "全レベル",
    phase: "GOAL",
    note: "締めの導線とエピローグ遷移",
  },
] as const;

export default function SettingsPage() {
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>("world");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");

  const [worldTitle, setWorldTitle] = useState(INITIAL_WORLD_TITLE);
  const [worldDescription, setWorldDescription] = useState(INITIAL_WORLD_DESCRIPTION);
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]["key"]>("calm");
  const [styleRules, setStyleRules] = useState(INITIAL_STYLE_RULES);
  const [requiredKeywords, setRequiredKeywords] = useState<string[]>(INITIAL_REQUIRED_KEYWORDS);
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>(INITIAL_BLOCKED_KEYWORDS);
  const [requiredKeywordInput, setRequiredKeywordInput] = useState("");
  const [blockedKeywordInput, setBlockedKeywordInput] = useState("");
  const [characters, setCharacters] = useState<CharacterDraft[]>(INITIAL_CHARACTERS);
  const [prologueBody, setPrologueBody] = useState(INITIAL_PROLOGUE_BODY);
  const [prologueCta, setPrologueCta] = useState(INITIAL_PROLOGUE_CTA);
  const [epilogueBody, setEpilogueBody] = useState(INITIAL_EPILOGUE_BODY);
  const [epilogueCta, setEpilogueCta] = useState(INITIAL_EPILOGUE_CTA);
  const [scenarioDuration, setScenarioDuration] = useState<
    (typeof SCENARIO_DURATION_OPTIONS)[number]["key"]
  >(INITIAL_SCENARIO_DURATION);

  const [previewScreen, setPreviewScreen] = useState<PreviewScreen | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewAppUrl =
    process.env.NEXT_PUBLIC_KYUDAI_PREVIEW_URL ?? "http://localhost:8082/";

  const previewOrigin = useMemo(() => {
    try {
      return new URL(previewAppUrl).origin;
    } catch {
      return "*";
    }
  }, [previewAppUrl]);

  const toneLabel = useMemo(
    () => TONE_OPTIONS.find((option) => option.key === tone)?.label ?? TONE_OPTIONS[0].label,
    [tone],
  );
  const selectedScenarioDuration = useMemo(
    () =>
      SCENARIO_DURATION_OPTIONS.find((option) => option.key === scenarioDuration) ??
      SCENARIO_DURATION_OPTIONS[0],
    [scenarioDuration],
  );

  const worldConfigPayload = useMemo(
    () => ({
      title: worldTitle.trim(),
      description: worldDescription.trim(),
      tone,
      styleRules: styleRules.trim(),
      requiredKeywords,
      blockedKeywords,
      characters: characters.map((character) => ({
        id: character.id,
        name: character.name.trim(),
        role: character.role.trim(),
        toneRule: character.toneRule.trim(),
        imageDataUrl: character.imageDataUrl,
        imageFileName: character.imageFileName,
      })),
      prologueBody: prologueBody.trim(),
      prologueCta: prologueCta.trim(),
      epilogueBody: epilogueBody.trim(),
      epilogueCta: epilogueCta.trim(),
    }),
    [
      blockedKeywords,
      characters,
      epilogueBody,
      epilogueCta,
      prologueBody,
      prologueCta,
      requiredKeywords,
      styleRules,
      tone,
      worldDescription,
      worldTitle,
    ],
  );

  const postWorldConfigToPreview = useCallback(() => {
    const frameWindow = previewFrameRef.current?.contentWindow;
    if (!frameWindow) return;

    frameWindow.postMessage(
      {
        source: "tomoshibi-admin-console",
        type: "tomoshibi-world-config:update",
        payload: worldConfigPayload,
      },
      previewOrigin,
    );
  }, [previewOrigin, worldConfigPayload]);

  useEffect(() => {
    postWorldConfigToPreview();
  }, [postWorldConfigToPreview]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ADMIN_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          worldTitle,
          worldDescription,
          tone,
          styleRules,
          requiredKeywords,
          blockedKeywords,
          characters,
          prologueBody,
          prologueCta,
          epilogueBody,
          epilogueCta,
          scenarioDuration,
        }),
      );
    } catch {
      // ignore local persistence errors
    }
  }, [
    blockedKeywords,
    characters,
    epilogueBody,
    epilogueCta,
    prologueBody,
    prologueCta,
    requiredKeywords,
    scenarioDuration,
    styleRules,
    tone,
    worldDescription,
    worldTitle,
  ]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      const message = data as {
        source?: unknown;
        type?: unknown;
        payload?: unknown;
      };

      if (message.source !== "kyudai-dictionary-mvp-mobile") return;
      if (message.type !== "tomoshibi-mobile:state") return;
      if (!message.payload || typeof message.payload !== "object") return;

      const payload = message.payload as { screen?: unknown };
      if (typeof payload.screen !== "string") return;
      if (!PREVIEW_SCREEN_ORDER.includes(payload.screen as PreviewScreen)) return;
      setPreviewScreen(payload.screen as PreviewScreen);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const navigatePreview = useCallback(
    (direction: "back" | "forward") => {
      const frameWindow = previewFrameRef.current?.contentWindow;
      if (!frameWindow) return;

      frameWindow.postMessage(
        {
          source: "tomoshibi-admin-console",
          type: "tomoshibi-navigation:step",
          payload: { direction },
        },
        previewOrigin,
      );
    },
    [previewOrigin],
  );

  const handleEditorTabClick = useCallback(
    (tab: EditorTab) => {
      setActiveEditorTab(tab);

      const targetScreenByTab: Partial<Record<EditorTab, PreviewScreen>> = {
        prologue: "prologue",
        epilogue: "epilogue",
      };
      const targetScreen = targetScreenByTab[tab];
      if (!targetScreen) return;

      const frameWindow = previewFrameRef.current?.contentWindow;
      if (!frameWindow) return;
      frameWindow.postMessage(
        {
          source: "tomoshibi-admin-console",
          type: "tomoshibi-navigation:set-screen",
          payload: { screen: targetScreen },
        },
        previewOrigin,
      );
    },
    [previewOrigin],
  );

  const previewScreenIndex = previewScreen ? PREVIEW_SCREEN_ORDER.indexOf(previewScreen) : -1;
  const canGoPreviewBack = previewScreenIndex > 0;
  const canGoPreviewForward =
    previewScreenIndex >= 0 && previewScreenIndex < PREVIEW_SCREEN_ORDER.length - 1;
  const previewBaseSize =
    deviceMode === "tablet" ? PREVIEW_VIEWPORT_SIZE.tablet : PREVIEW_VIEWPORT_SIZE.mobile;

  useEffect(() => {
    const viewport = previewViewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const styles = window.getComputedStyle(viewport);
      const paddingX = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const paddingY = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
      const horizontalSafetyMargin = 8;
      const verticalSafetyMargin = 18;
      const availableWidth = viewport.clientWidth - paddingX - horizontalSafetyMargin * 2;
      const availableHeight = viewport.clientHeight - paddingY - verticalSafetyMargin * 2;
      const horizontalRatio = availableWidth / previewBaseSize.width;
      const verticalRatio = availableHeight / previewBaseSize.height;
      const nextScale = Math.min(1, horizontalRatio, verticalRatio);
      if (!Number.isFinite(nextScale) || nextScale <= 0) {
        setPreviewScale(1);
        return;
      }
      setPreviewScale(nextScale);
    };

    updateScale();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateScale);
      observer.observe(viewport);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [previewBaseSize.height, previewBaseSize.width]);

  const addRequiredKeyword = () => {
    const normalized = requiredKeywordInput.trim();
    if (!normalized || requiredKeywords.includes(normalized)) return;
    setRequiredKeywords((prev) => [...prev, normalized]);
    setRequiredKeywordInput("");
  };

  const addBlockedKeyword = () => {
    const normalized = blockedKeywordInput.trim();
    if (!normalized || blockedKeywords.includes(normalized)) return;
    setBlockedKeywords((prev) => [...prev, normalized]);
    setBlockedKeywordInput("");
  };

  const updateCharacterField = <K extends keyof CharacterDraft>(
    id: string,
    key: K,
    value: CharacterDraft[K],
  ) => {
    setCharacters((prev) =>
      prev.map((character) => (character.id === id ? { ...character, [key]: value } : character)),
    );
  };

  const addCharacter = () => {
    const nextNumber = characters.length + 1;
    const nextId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `character-${Date.now()}-${nextNumber}`;
    setCharacters((prev) => [
      ...prev,
      {
        id: nextId,
        name: `案内役 ${nextNumber}`,
        role: "",
        toneRule: "",
        imageDataUrl: null,
        imageFileName: null,
      },
    ]);
  };

  const handleCharacterImageFileChange = (id: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setCharacters((prev) =>
        prev.map((character) =>
          character.id === id
            ? {
                ...character,
                imageDataUrl: reader.result as string,
                imageFileName: file.name,
              }
            : character,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#f9f9f7] text-[#2d3432]" style={{ backgroundImage: "none" }}>
      <div className="flex h-screen min-h-0 flex-1 flex-row overflow-hidden bg-[#f9f9f7]">
        <main className="min-w-0 flex-1 overflow-y-auto px-3 pt-2 pb-6 sm:px-5 md:px-6 lg:px-8 xl:px-10 xl:pt-3 xl:pb-6">
          <nav className="mb-5 flex h-14 items-end gap-4 overflow-x-auto border-b border-[#dee4e0] sm:mb-6 sm:gap-8">
            {EDITOR_TABS.map((tab) => {
              const isActive = activeEditorTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleEditorTabClick(tab.key)}
                  className={[
                    "whitespace-nowrap -mb-px border-b-2 border-transparent pb-3 transition-colors",
                    isActive
                      ? "border-[#f5ce53] font-semibold text-[#2d3432]"
                      : "font-medium text-[#5a605e] hover:text-[#2d3432]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

            {activeEditorTab === "world" ? (
              <div className="max-w-none xl:max-w-3xl">
              <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">物語概要設定</h3>
              <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                体験全体の方向性、トーン、文体ルールを定義します。
              </p>

              <form className="space-y-8">
                <div>
                  <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                    物語タイトル
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] font-medium text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      type="text"
                      value={worldTitle}
                      onChange={(event) => setWorldTitle(event.target.value)}
                    />
                    <MaterialIcon
                      className="absolute right-3 top-3.5 text-[20px] text-green-600"
                      name="check_circle"
                    />
                  </div>
                  <p className="mt-2 text-[13px] text-[#5a605e]">この物語設定を識別するための簡潔な名前。</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                    物語概要
                  </label>
                  <textarea
                    className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                    rows={4}
                    value={worldDescription}
                    onChange={(event) => setWorldDescription(event.target.value)}
                  />
                  <p className="mt-2 text-[13px] text-[#5a605e]">UIやコンテンツが体現すべき根本的な哲学を提供します。</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                    トーン
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      value={tone}
                      onChange={(event) => setTone(event.target.value as (typeof TONE_OPTIONS)[number]["key"])}
                    >
                      {TONE_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <MaterialIcon
                      className="pointer-events-none absolute right-4 top-3.5 text-[#5a605e]"
                      name="expand_more"
                    />
                  </div>
                  <p className="mt-2 text-[13px] text-[#5a605e]">
                    ユーザーインタラクションの主要な感情的トーンを選択します（現在: {toneLabel}）。
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">文体ルール</label>
                  <textarea
                    className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                    rows={4}
                    value={styleRules}
                    onChange={(event) => setStyleRules(event.target.value)}
                  />
                  <p className="mt-2 text-[13px] text-[#5a605e]">生成されるコンテンツの具体的な文法や構造のルール。</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      必須キーワード
                    </label>
                    <div className="min-h-[46px] rounded-xl border border-[#dee4e0] bg-white p-2 shadow-sm transition-colors focus-within:border-[#f5ce53] focus-within:ring-1 focus-within:ring-[#f5ce53]">
                      <div className="flex flex-wrap gap-2">
                        {requiredKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 rounded-full bg-[#ecefec] px-3 py-1 text-[13px] font-medium text-[#2d3432]"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() =>
                                setRequiredKeywords((prev) => prev.filter((item) => item !== keyword))
                              }
                            >
                              <MaterialIcon className="text-[14px] hover:text-[#9f403d]" name="close" />
                            </button>
                          </span>
                        ))}
                        <input
                          className="min-w-[80px] flex-1 border-none bg-transparent px-2 text-[13px] text-[#2d3432] focus:outline-none"
                          type="text"
                          placeholder="追加..."
                          value={requiredKeywordInput}
                          onChange={(event) => setRequiredKeywordInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            addRequiredKeyword();
                          }}
                          onBlur={addRequiredKeyword}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] text-[#5a605e]">説明に頻出させるべきキーワード。</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      NG表現
                    </label>
                    <div className="min-h-[46px] rounded-xl border border-[#dee4e0] bg-white p-2 shadow-sm transition-colors focus-within:border-[#f5ce53] focus-within:ring-1 focus-within:ring-[#f5ce53]">
                      <div className="flex flex-wrap gap-2">
                        {blockedKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 rounded-full bg-[#fe8983] px-3 py-1 text-[13px] font-medium text-[#752121]"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() =>
                                setBlockedKeywords((prev) => prev.filter((item) => item !== keyword))
                              }
                            >
                              <MaterialIcon className="text-[14px] hover:text-[#9f403d]" name="close" />
                            </button>
                          </span>
                        ))}
                        <input
                          className="min-w-[80px] flex-1 border-none bg-transparent px-2 text-[13px] text-[#2d3432] focus:outline-none"
                          type="text"
                          placeholder="追加..."
                          value={blockedKeywordInput}
                          onChange={(event) => setBlockedKeywordInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            addBlockedKeyword();
                          }}
                          onBlur={addBlockedKeyword}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] text-[#5a605e]">使用を避けるべき表現。</p>
                  </div>
                </div>
              </form>
              </div>
            ) : null}

            {activeEditorTab === "scenarioFlow" ? (
              <div className="max-w-none xl:max-w-3xl">
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">シナリオフロー</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                  想定時間に応じて、中間スポット数を切り替えます。
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {SCENARIO_DURATION_OPTIONS.map((option) => {
                    const isActive = option.key === scenarioDuration;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setScenarioDuration(option.key)}
                        className={[
                          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-[#1a1c20] text-[#f7f7fd]"
                            : "border border-[#dee4e0] bg-white text-[#2d3432] hover:border-[#f5ce53]",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-[#dee4e0] bg-white p-5 shadow-sm">
                  <p className="mb-4 text-sm font-semibold text-[#2d3432]">
                    構成: プロローグ → 中間スポット {selectedScenarioDuration.intermediateSpotCount}つ → エピローグ
                  </p>

                  <div className="space-y-2">
                    <div className="rounded-xl border border-[#dee4e0] bg-[#f9f9f7] px-4 py-3">
                      <p className="text-sm font-semibold text-[#2d3432]">プロローグ</p>
                    </div>

                    {Array.from(
                      { length: selectedScenarioDuration.intermediateSpotCount },
                      (_, index) => index + 1,
                    ).map((spotNumber) => (
                      <div key={spotNumber} className="rounded-xl border border-[#dee4e0] bg-[#f9f9f7] px-4 py-3">
                        <p className="text-sm font-semibold text-[#2d3432]">中間スポット {spotNumber}</p>
                      </div>
                    ))}

                    <div className="rounded-xl border border-[#dee4e0] bg-[#f9f9f7] px-4 py-3">
                      <p className="text-sm font-semibold text-[#2d3432]">エピローグ</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeEditorTab === "character" ? (
              <div className="max-w-none xl:max-w-3xl">
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">キャラクター設定</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                  左側でキャラクター情報を編集し、右側で画像を選択します。必要に応じて下の＋から追加できます。
                </p>
                <div className="space-y-6">
                  {characters.map((character, index) => (
                    <section key={character.id} className="rounded-2xl border border-[#dee4e0] bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-bold text-[#2d3432]">キャラクター {index + 1}</h4>
                        <span className="rounded-full bg-[#f2f4f2] px-3 py-1 text-xs font-semibold text-[#5a605e]">
                          {character.imageFileName ?? "画像未設定"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <form className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              キャラクター名
                            </label>
                            <input
                              className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] font-medium text-[#2d3432] transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                              type="text"
                              value={character.name}
                              onChange={(event) =>
                                updateCharacterField(character.id, "name", event.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              キャラクターの役割
                            </label>
                            <input
                              className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] text-[#2d3432] transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                              type="text"
                              value={character.role}
                              onChange={(event) =>
                                updateCharacterField(character.id, "role", event.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              話し方ルール
                            </label>
                            <textarea
                              className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                              rows={4}
                              value={character.toneRule}
                              onChange={(event) =>
                                updateCharacterField(character.id, "toneRule", event.target.value)
                              }
                            />
                          </div>
                        </form>

                        <div className="flex flex-col">
                          <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                            キャラクター画像
                          </label>
                          <label
                            htmlFor={`character-image-${character.id}`}
                            className="group relative flex min-h-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#adb3b0] bg-[#f9f9f7] transition-colors hover:border-[#f5ce53]"
                          >
                            {character.imageDataUrl ? (
                              <img
                                src={character.imageDataUrl}
                                alt={`${character.name || "キャラクター"}の画像プレビュー`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="px-4 text-center">
                                <MaterialIcon className="mb-2 text-3xl text-[#5a605e]" name="add_photo_alternate" />
                                <p className="text-sm font-semibold text-[#2d3432]">クリックして画像を選択</p>
                                <p className="mt-1 text-xs text-[#5a605e]">PNG / JPG / WebP</p>
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <p className="text-xs font-medium text-white">画像を変更</p>
                            </div>
                          </label>
                          <input
                            id={`character-image-${character.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              handleCharacterImageFileChange(character.id, event.target.files)
                            }
                          />
                        </div>
                      </div>
                    </section>
                  ))}

                  <button
                    type="button"
                    onClick={addCharacter}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#adb3b0] bg-[#f2f4f2] px-4 py-3 text-sm font-semibold text-[#2d3432] transition-colors hover:border-[#f5ce53] hover:bg-[#fff7e2]"
                  >
                    <MaterialIcon className="text-base" name="add" />
                    キャラクターを追加
                  </button>
                </div>
              </div>
            ) : null}

            {activeEditorTab === "prologue" ? (
              <div className="max-w-none xl:max-w-3xl">
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">プロローグ設定</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                  体験開始前に表示する導入文とCTAを設定します。
                </p>
                <form className="space-y-8">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      本文
                    </label>
                    <textarea
                      className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      rows={5}
                      value={prologueBody}
                      onChange={(event) => setPrologueBody(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      CTAラベル
                    </label>
                    <input
                      className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      type="text"
                      value={prologueCta}
                      onChange={(event) => setPrologueCta(event.target.value)}
                    />
                  </div>
                </form>
              </div>
            ) : null}

            {activeEditorTab === "epilogue" ? (
              <div className="max-w-none xl:max-w-3xl">
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">エピローグ設定</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                  最終スポット後の締めメッセージとフィードバック導線を設定します。
                </p>
                <form className="space-y-8">
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      本文
                    </label>
                    <textarea
                      className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      rows={5}
                      value={epilogueBody}
                      onChange={(event) => setEpilogueBody(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                      CTAラベル
                    </label>
                    <input
                      className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
                      type="text"
                      value={epilogueCta}
                      onChange={(event) => setEpilogueCta(event.target.value)}
                    />
                  </div>
                </form>
              </div>
            ) : null}

            {activeEditorTab === "spotDb" ? (
              <div className="max-w-none xl:max-w-3xl">
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">スポットDB</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-[#5a605e]">
                  ルート生成に利用するスポットの基本情報と役割を確認・編集します。
                </p>
                <div className="overflow-hidden rounded-xl border border-[#dee4e0] bg-white shadow-sm">
                  <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1.6fr] gap-2 border-b border-[#dee4e0] bg-[#f2f4f2] px-4 py-3 text-xs font-semibold tracking-wider text-[#5a605e]">
                    <span>スポット名</span>
                    <span>慣れ度タグ</span>
                    <span>フェーズ</span>
                    <span>メモ</span>
                  </div>
                  {INITIAL_SPOT_DB_ROWS.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1.2fr_1fr_0.8fr_1.6fr] gap-2 border-b border-[#ecefec] px-4 py-3 text-sm text-[#2d3432] last:border-b-0"
                    >
                      <span className="font-medium">{row.name}</span>
                      <span className="text-[#5a605e]">{row.familiarity}</span>
                      <span>
                        <span className="rounded-full bg-[#ecefec] px-2 py-1 text-xs font-semibold text-[#455363]">
                          {row.phase}
                        </span>
                      </span>
                      <span className="text-[#5a605e]">{row.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

        </main>

        <aside className="relative z-10 flex h-full min-h-0 w-[clamp(360px,38vw,520px)] min-w-[360px] max-w-[520px] flex-shrink-0 flex-col border-l border-[#dee4e0] bg-[#f2f4f2] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="sticky top-0 z-20 h-14 border-b border-[#dee4e0] bg-[#f9f9f7]/70 px-3 backdrop-blur-sm sm:px-4">
              <div className="flex h-full items-center justify-between">
                <h4 className="text-sm font-semibold text-[#2d3432]">Live Preview</h4>
                <div className="rounded-full bg-[#dee4e0] p-0.5">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    className={[
                      "rounded-full p-1",
                      deviceMode === "mobile"
                        ? "bg-white text-[#2d3432] shadow-sm"
                        : "text-[#5a605e] hover:text-[#2d3432]",
                    ].join(" ")}
                  >
                    <MaterialIcon className="text-[20px]" name="phone_iphone" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("tablet")}
                    className={[
                      "rounded-full p-1",
                      deviceMode === "tablet"
                        ? "bg-white text-[#2d3432] shadow-sm"
                        : "text-[#5a605e] hover:text-[#2d3432]",
                    ].join(" ")}
                  >
                    <MaterialIcon className="text-[20px]" name="open_in_full" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={previewViewportRef}
              className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 py-3 sm:px-2.5 sm:py-4 xl:px-3 xl:py-4"
            >
              <div
                className="relative flex flex-shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[8px] border-[#dee4e0] bg-white shadow-[0_20px_40px_rgba(26,28,32,0.08)]"
                style={{
                  width: previewBaseSize.width,
                  height: previewBaseSize.height,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center center",
                }}
              >
                <div className="absolute left-0 top-0 z-50 flex h-6 w-full items-center justify-between px-4 pt-1">
                  <span className="text-[10px] font-medium text-[#2d3432]">9:41</span>
                  <div className="flex gap-1">
                    <MaterialIcon className="text-[12px] text-[#2d3432]" name="radio_button_checked" />
                    <MaterialIcon className="text-[12px] text-[#2d3432]" name="network" />
                    <MaterialIcon className="text-[12px] text-[#2d3432]" name="bolt" />
                  </div>
                </div>

                <iframe
                  ref={previewFrameRef}
                  title="Kyudai MVP live preview"
                  src={previewAppUrl}
                  onLoad={postWorldConfigToPreview}
                  className="h-full w-full border-0 bg-[#f9f9f7] pt-6"
                  allow="camera; geolocation"
                />
              </div>
            </div>

            <div className="border-t border-[#dee4e0] bg-[#f9f9f7]/90 px-2 py-1.5 sm:px-3 sm:py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigatePreview("back")}
                  disabled={!canGoPreviewBack}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#dee4e0] bg-white px-3 py-1 text-xs font-semibold text-[#2d3432] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MaterialIcon name="arrow_back" className="text-sm" />
                  前に戻る
                </button>
                <button
                  type="button"
                  onClick={() => navigatePreview("forward")}
                  disabled={!canGoPreviewForward}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#1a1c20] px-3 py-1 text-xs font-semibold text-[#f7f7fd] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  次に進む
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </button>
              </div>
            </div>
        </aside>
      </div>
    </main>
  );
}
