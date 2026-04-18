"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "../_components/material-icon";

type EditorTab =
  | "landing"
  | "setup"
  | "preparing"
  | "ready"
  | "prologue"
  | "spot"
  | "epilogue"
  | "feedback";
type WorkspaceMode = "cms" | "ai";
type AIWorkspacePaneMode = "prompt" | "simulation";
type DeviceMode = "mobile" | "tablet";
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
type AIOutputTarget = "ready" | "prologue" | "spot" | "epilogue";

type TextDraft = {
  landing: {
    topTag: string;
    heroPanelTitle: string;
    heroPanelBody: string;
    eyebrow: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroDescription: string;
    journeyTitle: string;
    journeyCaption: string;
    featuresTitle: string;
    featuresCaption: string;
    startButton: string;
  };
  setup: {
    title: string;
    subtitle: string;
    userTypeLabel: string;
    familiarityLabel: string;
    explorationLabel: string;
    expectationLabel: string;
    durationLabel: string;
    durationHintShort: string;
    durationHintLong: string;
    researchNote: string;
    startButton: string;
  };
  preparing: {
    title: string;
    body: string;
    statusDone: string;
    statusProgress: string;
    statusPending: string;
    skipButton: string;
    footer: string;
  };
  ready: {
    chapterLabel: string;
    heroLead: string;
    summaryTitle: string;
    summaryText: string;
    generatedStoryLabel: string;
    startButton: string;
    transitionTitle: string;
    transitionBody: string;
  };
  prologue: {
    body: string;
    cta: string;
  };
  spot: {
    mapInfoLine1: string;
    mapInfoLine2: string;
    mapArrivedLabel: string;
    mapRestartLabel: string;
    speakerBadge: string;
    nextButton: string;
    backToMapButton: string;
    finishButton: string;
    narratives: string[];
  };
  epilogue: {
    body: string;
    cta: string;
  };
  feedback: {
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitleLine1: string;
    heroSubtitleLine2: string;
    questionOverall: string;
    questionGuidance: string;
    questionCampus: string;
    questionVisitIntent: string;
    questionExpectation: string;
    questionReuse: string;
    questionComment: string;
    commentNote: string;
    submitButton: string;
    thanks: string;
  };
};

type AIPromptDraft = {
  objective: string;
  audience: string;
  tone: string;
  requiredElements: string;
  forbiddenElements: string;
  fixedTextPolicy: string;
  routeDesign: string;
  additionalContext: string;
  outputLanguage: string;
  outputStyle: string;
  step4OutlinePrompt: string;
  step5NarrativePrompt: string;
  step7RepairPrompt: string;
  outputTargets: AIOutputTarget[];
};

type PreviewSimulationInputs = {
  userType: string;
  familiarity: string;
  duration: string;
  explorationStyle: string;
  experienceExpectation: string;
};

type SimulatedStoryPayload = {
  readyHeroLead?: string;
  readySummaryTitle?: string;
  readySummaryText?: string;
  prologueBody?: string;
  spotNarratives?: string[];
  epilogueBody?: string;
};

type ProgramFlowDraft = {
  step1: {
    normalizeUserType: string;
    normalizeFamiliarity: string;
    normalizeDuration: string;
  };
  step2: {
    spotCountLogic: string;
    difficultyLogic: string;
  };
  step3: {
    spotSelectionLogic: string;
    routeOrderingLogic: string;
  };
  step6: {
    jsonValidationLogic: string;
    textValidationLogic: string;
  };
  step8: {
    finalizeFormat: string;
    persistAndDispatch: string;
  };
};

type QuestGenerationStepId =
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "step5"
  | "step6"
  | "step7"
  | "step8";

type GenerationFlowStepKey =
  | "setup"
  | "preparing"
  | "ready"
  | "prologue"
  | "spot"
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

const ADMIN_SETTINGS_STORAGE_KEY = "tomoshibiAdminConsoleSettingsV2";

const EDITOR_TABS: Array<{ key: EditorTab; label: string; screen: PreviewScreen }> = [
  { key: "landing", label: "ランディング", screen: "landing" },
  { key: "setup", label: "セットアップ", screen: "setup" },
  { key: "preparing", label: "プリペアリング", screen: "preparing" },
  { key: "ready", label: "準備完了", screen: "ready" },
  { key: "prologue", label: "プロローグ", screen: "prologue" },
  { key: "spot", label: "スポット文", screen: "spotArrival" },
  { key: "epilogue", label: "エピローグ", screen: "epilogue" },
  { key: "feedback", label: "フィードバック", screen: "feedback" },
];

const WORKSPACE_MODE_ITEMS: Array<{
  key: WorkspaceMode;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    key: "cms",
    label: "UI CMS",
    description: "運営が固定で管理する画面文言を編集",
    icon: "edit_note",
  },
  {
    key: "ai",
    label: "AI生成ステップ",
    description: "AI生成文を作るための入力とプロンプト作成",
    icon: "auto_awesome",
  },
];

const AI_OUTPUT_TARGET_ITEMS: Array<{
  key: AIOutputTarget;
  label: string;
  description: string;
}> = [
  { key: "ready", label: "準備完了", description: "物語タイトル・サマリー" },
  { key: "prologue", label: "プロローグ", description: "導入本文" },
  { key: "spot", label: "スポット文", description: "各スポット本文（最大6）" },
  { key: "epilogue", label: "エピローグ", description: "締め本文" },
];

const QUEST_GENERATION_STEPS: Array<{
  id: QuestGenerationStepId;
  label: string;
  description: string;
  kind: "program" | "ai";
}> = [
  { id: "step1", label: "1. 入力正規化", description: "入力値を内部形式へ変換", kind: "program" },
  { id: "step2", label: "2. 体験設計", description: "スポット数と難易度を決定", kind: "program" },
  { id: "step3", label: "3. ルート確定", description: "候補選定と巡回順を決定", kind: "program" },
  { id: "step4", label: "4. 骨子生成", description: "物語骨子をAIで生成", kind: "ai" },
  { id: "step5", label: "5. 本文生成", description: "各セクション本文をAIで生成", kind: "ai" },
  { id: "step6", label: "6. 検証", description: "スキーマ/文言ルールを検証", kind: "program" },
  { id: "step7", label: "7. 部分再生成", description: "NG箇所のみAIでリペア", kind: "ai" },
  { id: "step8", label: "8. 最終確定", description: "最終JSONを確定し保存", kind: "program" },
];

const INITIAL_TEXT_DRAFT: TextDraft = {
  landing: {
    topTag: "伊都キャンパス探索ナビ",
    heroPanelTitle: "九大を、物語で知る。",
    heroPanelBody: "その場で体感する、伊都キャンパス紹介体験",
    eyebrow: "九州大学 伊都キャンパス ｜ 実証実験",
    heroTitleLine1: "はじめての伊都を、",
    heroTitleLine2: "物語で知る",
    heroDescription:
      "これは九大伊都キャンパスを舞台にした実証実験です。移動は不要 — その場にいながら、物語を通じて伊都キャンパスの各スポットを体験できます。",
    journeyTitle: "体験の流れ",
    journeyCaption: "移動なしで進める、3ステップの物語体験",
    featuresTitle: "この体験でできること",
    featuresCaption: "歩くだけで終わらない、九大の楽しみ方",
    startButton: "冒険をはじめる",
  },
  setup: {
    title: "体験の準備をしましょう",
    subtitle: "いくつか教えてください。あなたに合った流れで、伊都キャンパスの体験を始めます。",
    userTypeLabel: "あなたについて教えてください",
    familiarityLabel: "伊都キャンパスはどれくらい慣れていますか？",
    explorationLabel: "新しい場所に来たとき、どうしますか？",
    expectationLabel: "この体験に何を期待しますか？",
    durationLabel: "どれくらいで回りたいですか？",
    durationHintShort: "短い時間",
    durationHintLong: "じっくり",
    researchNote: "※ 研究データとして活用します",
    startButton: "体験をつくる",
  },
  preparing: {
    title: "あなたにあった\n体験を整えています",
    body: "伊都キャンパスの空気や流れに合わせて、\nこれから歩く物語を準備しています。",
    statusDone: "条件を整理しています",
    statusProgress: "体験の流れを整えています",
    statusPending: "最初の場所を準備しています",
    skipButton: "次へ",
    footer: "まもなく始まります",
  },
  ready: {
    chapterLabel: "CHAPTER 01",
    heroLead: "伊都キャンパス探索ルート",
    summaryTitle: "体験の準備が整いました",
    summaryText:
      "まだ掴みきれていない導線を補いながら伊都キャンパスを巡る物語です。各スポットで短いシナリオを受け取りながら、場所の背景と日常の使い方を自然に理解できる構成になっています。",
    generatedStoryLabel: "生成された物語名",
    startButton: "物語を始める",
    transitionTitle: "プロローグへ移動中",
    transitionBody: "物語の扉をひらいています",
  },
  prologue: {
    body: "あなたが今日歩くこの場所には、\nまだ気づいていない物語が眠っています。\nいつもの景色を、少し違う目線で辿ってみましょう。",
    cta: "最初の場所へ向かう",
  },
  spot: {
    mapInfoLine1: "次の目的地に向かいましょう。",
    mapInfoLine2: "到着したら物語が始まります。",
    mapArrivedLabel: "このスポットに到着した",
    mapRestartLabel: "最初のスポットから始める",
    speakerBadge: "案内役",
    nextButton: "次へ",
    backToMapButton: "マップに戻る",
    finishButton: "エピローグへ",
    narratives: [
      "ここはBig Orange。今日の物語が開く最初の場所です。",
      "ここでは、学びと日常がすれ違いながら重なっていきます。",
      "知の入口に立ちました。ここには多くの選択肢が静かに並んでいます。",
      "ここはInnovation Plaza。学びのアイデアが実験へ変わる結節点です。",
      "Research Commonsでは、分野を越えた対話が静かに進んでいます。",
      "ここが今日の終点です。歩いた景色が、ひとつの記憶として結ばれます。",
    ],
  },
  epilogue: {
    body: "歩いた景色も、立ち止まった場所も、\n今日の伊都キャンパスの記憶として残っていきます。\n最後に、今回の体験について教えてください。",
    cta: "体験を振り返る",
  },
  feedback: {
    heroTitleLine1: "体験を終えて",
    heroTitleLine2: "どう感じましたか？",
    heroSubtitleLine1: "最後に、今回の体験について教えてください。",
    heroSubtitleLine2: "今後の改善に活かします。",
    questionOverall: "体験全体の満足度を教えてください",
    questionGuidance: "体験の内容はわかりやすかったですか？",
    questionCampus: "物語を通じて、伊都キャンパスへの興味が高まりましたか？",
    questionVisitIntent: "体験後、実際にこのスポットを訪れてみたいと思いますか？",
    questionExpectation: "この体験は、始める前の期待通りでしたか？",
    questionReuse: "また体験したいと思いますか？",
    questionComment: "自由意見",
    commentNote: "※ 印象に残ったこと・改善してほしいこと・その他なんでも",
    submitButton: "送信して終了する",
    thanks: "Thank you for your voice",
  },
};

const INITIAL_AI_PROMPT_DRAFT: AIPromptDraft = {
  objective: "伊都キャンパス初訪問者が、スポットを物語として理解できる体験を作る。",
  audience: "新入生。キャンパスはまだ不慣れ。",
  tone: "落ち着き・知的・親しみやすい。断定しすぎない。",
  requiredElements: "各文に具体的な場所性を含める。行動イメージが湧く表現にする。",
  forbiddenElements: "誇張表現、スラング、根拠のない事実、過度な煽り。",
  fixedTextPolicy: "固定UI文言は変更しない。AI生成対象本文のみ出力する。",
  routeDesign: "15-20分は4スポット、20-30分は5スポット、30-45分は6スポットを想定。",
  additionalContext: "九州大学 伊都キャンパス。研究目的のPoCとして利用。",
  outputLanguage: "日本語",
  outputStyle: "です・ます調、簡潔、1文を短めに保つ。",
  step4OutlinePrompt:
    "以下の条件で体験の骨子を作成してください。ユーザー={userType} / 習熟度={familiarity} / 時間={duration} / 期待={experienceExpectation}。出力は ready, prologue, spot構成のみ。",
  step5NarrativePrompt:
    "骨子に基づき ready, prologue, spot, epilogue の本文を作成してください。トーン={tone}。必須要素={requiredElements}。文体={outputStyle}。",
  step7RepairPrompt:
    "検証で失敗した項目のみ修正してください。禁止要素={forbiddenElements}。固定文言ポリシー={fixedTextPolicy}。他セクションは変更しない。",
  outputTargets: ["ready", "prologue", "spot", "epilogue"],
};

const INITIAL_PROGRAM_FLOW_DRAFT: ProgramFlowDraft = {
  step1: {
    normalizeUserType: "新入生/在学生/保護者/研究来訪者を内部カテゴリに正規化する。",
    normalizeFamiliarity: "習熟度を4段階に正規化し、既定値は「まだあまり慣れていない」。",
    normalizeDuration: "15-20 / 20-30 / 30-45 の3区分へ丸める。",
  },
  step2: {
    spotCountLogic: "15-20分=4件, 20-30分=5件, 30-45分=6件。",
    difficultyLogic: "不慣れなユーザーほど導線が明確なスポットを優先。",
  },
  step3: {
    spotSelectionLogic: "必須スポットを先に確保し、残りをスコア順で採用。",
    routeOrderingLogic: "移動負荷が低い順で並べ、最後に終点スポットを固定。",
  },
  step6: {
    jsonValidationLogic: "出力JSONの必須キーと配列件数（spot最大6）を検証。",
    textValidationLogic: "禁止語・文字数・重複率を検証し、失敗時はstep7へ。",
  },
  step8: {
    finalizeFormat: "ready/prologue/spot/epilogue を1つのクエストJSONに統合。",
    persistAndDispatch: "保存後に配信用イベントを発火し、プレビューへ反映。",
  },
};

const DEFAULT_PREVIEW_SIMULATION_INPUTS: PreviewSimulationInputs = {
  userType: "新入生",
  familiarity: "まだあまり慣れていない",
  duration: "20〜30分",
  explorationStyle: "地図で事前確認",
  experienceExpectation: "場所を覚えたい",
};

const GENERATION_FLOW_STEPS: Array<{
  key: GenerationFlowStepKey;
  label: string;
  description: string;
  screens: PreviewScreen[];
}> = [
  {
    key: "setup",
    label: "条件入力",
    description: "アプリ内のセットアップで条件を選択",
    screens: ["setup"],
  },
  {
    key: "preparing",
    label: "生成中",
    description: "条件に基づいてクエストを構築",
    screens: ["preparing"],
  },
  {
    key: "ready",
    label: "準備完了",
    description: "生成結果の要約を提示",
    screens: ["ready"],
  },
  {
    key: "prologue",
    label: "導入生成",
    description: "導入文を表示して開始",
    screens: ["prologue"],
  },
  {
    key: "spot",
    label: "スポット進行",
    description: "各スポット文を順に表示",
    screens: ["map", "spotArrival"],
  },
  {
    key: "epilogue",
    label: "締め生成",
    description: "エピローグを表示",
    screens: ["epilogue"],
  },
  {
    key: "feedback",
    label: "フィードバック",
    description: "体験後アンケート",
    screens: ["feedback"],
  },
];

function buildSimulatedStoryPayload(
  aiPromptDraft: AIPromptDraft,
  previewInputs: PreviewSimulationInputs,
  fallbackSpotNarratives: string[],
  programFlowDraft: ProgramFlowDraft,
): SimulatedStoryPayload {
  const userType = previewInputs.userType.trim() || DEFAULT_PREVIEW_SIMULATION_INPUTS.userType;
  const familiarity = previewInputs.familiarity.trim() || DEFAULT_PREVIEW_SIMULATION_INPUTS.familiarity;
  const duration = previewInputs.duration.trim() || DEFAULT_PREVIEW_SIMULATION_INPUTS.duration;
  const explorationStyle =
    previewInputs.explorationStyle.trim() || DEFAULT_PREVIEW_SIMULATION_INPUTS.explorationStyle;
  const experienceExpectation =
    previewInputs.experienceExpectation.trim() || DEFAULT_PREVIEW_SIMULATION_INPUTS.experienceExpectation;

  const objective =
    aiPromptDraft.objective
      .split(/\n|。/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "伊都キャンパスを物語として理解できる体験を作る";
  const requiredElements =
    aiPromptDraft.requiredElements
      .split(/\n|。/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "各文に具体的な場所性を含める";
  const tone =
    aiPromptDraft.tone
      .split(/\n|。/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "落ち着き・知的・親しみやすい";
  const additionalContext =
    aiPromptDraft.additionalContext
      .split(/\n|。/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "九州大学 伊都キャンパス";
  const spotCount = duration.includes("15") ? 4 : duration.includes("45") ? 6 : 5;

  const readyHeroLead = `${duration} / ${familiarity}向けクエスト`;
  const readySummaryTitle = `${userType}向けシミュレーションを生成しました`;
  const readySummaryText = `${familiarity}の来訪者向けに、${objective}を満たす導線を組み立てました。${requiredElements}を守りつつ、${tone}で案内します。設計ルール: ${programFlowDraft.step2.spotCountLogic}`;
  const prologueBody = `${additionalContext}でのシミュレーションを開始します。\n探索スタイルは「${explorationStyle}」。\n期待「${experienceExpectation}」を満たすよう最初のスポットへ進みましょう。`;
  const epilogueBody = `クエスト完了です。今回の目的は「${experienceExpectation}」でした。\n達成度を確認し、必要に応じてセットアップ条件を変更して再試行してください。`;

  const stageLabels = ["導入", "観察", "発見", "対話", "統合", "余白"];
  const spotNarratives = Array.from({ length: 6 }, (_, index) => {
    const fallback = fallbackSpotNarratives[index] || `スポット${index + 1}です。`;
    if (index < spotCount) {
      return `${stageLabels[index] ?? `段階${index + 1}`}スポットです。${fallback} ${explorationStyle}を保ちながら、${experienceExpectation}につながる手がかりを拾ってください。`;
    }
    return `${fallback} この地点は任意です。時間に余裕がある場合のみ立ち寄り、体験の理解を補強してください。`;
  });

  const payload: SimulatedStoryPayload = {};
  if (aiPromptDraft.outputTargets.includes("ready")) {
    payload.readyHeroLead = readyHeroLead;
    payload.readySummaryTitle = readySummaryTitle;
    payload.readySummaryText = readySummaryText;
  }
  if (aiPromptDraft.outputTargets.includes("prologue")) {
    payload.prologueBody = prologueBody;
  }
  if (aiPromptDraft.outputTargets.includes("spot")) {
    payload.spotNarratives = spotNarratives;
  }
  if (aiPromptDraft.outputTargets.includes("epilogue")) {
    payload.epilogueBody = epilogueBody;
  }
  return payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findFlowStepIndex(screen: PreviewScreen | null): number {
  if (!screen) return -1;
  return GENERATION_FLOW_STEPS.findIndex((step) => step.screens.includes(screen));
}

function renderPromptTemplate(
  template: string,
  previewInputs: PreviewSimulationInputs,
  aiPromptDraft: AIPromptDraft,
): string {
  const replacements: Record<string, string> = {
    userType: previewInputs.userType,
    familiarity: previewInputs.familiarity,
    duration: previewInputs.duration,
    explorationStyle: previewInputs.explorationStyle,
    experienceExpectation: previewInputs.experienceExpectation,
    objective: aiPromptDraft.objective,
    audience: aiPromptDraft.audience,
    tone: aiPromptDraft.tone,
    requiredElements: aiPromptDraft.requiredElements,
    forbiddenElements: aiPromptDraft.forbiddenElements,
    fixedTextPolicy: aiPromptDraft.fixedTextPolicy,
    outputStyle: aiPromptDraft.outputStyle,
  };

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    const value = replacements[key];
    if (typeof value !== "string") return match;
    return value;
  });
}

function readPersistedSettings(): {
  activeWorkspaceMode: WorkspaceMode;
  aiWorkspacePaneMode: AIWorkspacePaneMode;
  activeQuestGenerationStep: QuestGenerationStepId;
  activeEditorTab: EditorTab;
  deviceMode: DeviceMode;
  textDraft: TextDraft;
  aiPromptDraft: AIPromptDraft;
  programFlowDraft: ProgramFlowDraft;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const activeEditorTab: EditorTab =
      typeof parsed.activeEditorTab === "string" &&
      EDITOR_TABS.some((tab) => tab.key === parsed.activeEditorTab)
        ? (parsed.activeEditorTab as EditorTab)
        : "landing";
    const activeWorkspaceMode: WorkspaceMode =
      parsed.activeWorkspaceMode === "ai" ? "ai" : "cms";
    const aiWorkspacePaneMode: AIWorkspacePaneMode =
      parsed.aiWorkspacePaneMode === "simulation" ? "simulation" : "prompt";
    const activeQuestGenerationStep: QuestGenerationStepId =
      typeof parsed.activeQuestGenerationStep === "string" &&
      QUEST_GENERATION_STEPS.some((step) => step.id === parsed.activeQuestGenerationStep)
        ? (parsed.activeQuestGenerationStep as QuestGenerationStepId)
        : "step1";
    const deviceMode: DeviceMode =
      parsed.deviceMode === "mobile" || parsed.deviceMode === "tablet"
        ? parsed.deviceMode
        : "mobile";

    if (!isRecord(parsed.textDraft)) {
      return {
        activeWorkspaceMode,
        aiWorkspacePaneMode,
        activeQuestGenerationStep,
        activeEditorTab,
        deviceMode,
        textDraft: INITIAL_TEXT_DRAFT,
        aiPromptDraft: INITIAL_AI_PROMPT_DRAFT,
        programFlowDraft: INITIAL_PROGRAM_FLOW_DRAFT,
      };
    }

    const maybeTextDraft = parsed.textDraft as Partial<TextDraft>;
    const textDraft: TextDraft = {
      ...INITIAL_TEXT_DRAFT,
      ...maybeTextDraft,
      landing: { ...INITIAL_TEXT_DRAFT.landing, ...(isRecord(maybeTextDraft.landing) ? maybeTextDraft.landing : {}) },
      setup: { ...INITIAL_TEXT_DRAFT.setup, ...(isRecord(maybeTextDraft.setup) ? maybeTextDraft.setup : {}) },
      preparing: { ...INITIAL_TEXT_DRAFT.preparing, ...(isRecord(maybeTextDraft.preparing) ? maybeTextDraft.preparing : {}) },
      ready: { ...INITIAL_TEXT_DRAFT.ready, ...(isRecord(maybeTextDraft.ready) ? maybeTextDraft.ready : {}) },
      prologue: { ...INITIAL_TEXT_DRAFT.prologue, ...(isRecord(maybeTextDraft.prologue) ? maybeTextDraft.prologue : {}) },
      spot: {
        ...INITIAL_TEXT_DRAFT.spot,
        ...(isRecord(maybeTextDraft.spot) ? maybeTextDraft.spot : {}),
        narratives:
          isRecord(maybeTextDraft.spot) && Array.isArray(maybeTextDraft.spot.narratives)
            ? maybeTextDraft.spot.narratives.slice(0, 6).map((item) => (typeof item === "string" ? item : ""))
            : INITIAL_TEXT_DRAFT.spot.narratives,
      },
      epilogue: { ...INITIAL_TEXT_DRAFT.epilogue, ...(isRecord(maybeTextDraft.epilogue) ? maybeTextDraft.epilogue : {}) },
      feedback: { ...INITIAL_TEXT_DRAFT.feedback, ...(isRecord(maybeTextDraft.feedback) ? maybeTextDraft.feedback : {}) },
    };

    const aiPromptDraft: AIPromptDraft = isRecord(parsed.aiPromptDraft)
      ? (() => {
          const persistedAiPrompt = parsed.aiPromptDraft as Partial<AIPromptDraft>;
          const persistedTargets = persistedAiPrompt.outputTargets;
          return {
            ...INITIAL_AI_PROMPT_DRAFT,
            ...persistedAiPrompt,
            outputTargets: Array.isArray(persistedTargets)
              ? persistedTargets.filter((target): target is AIOutputTarget =>
                  AI_OUTPUT_TARGET_ITEMS.some((item) => item.key === target),
                )
              : INITIAL_AI_PROMPT_DRAFT.outputTargets,
          };
        })()
      : INITIAL_AI_PROMPT_DRAFT;

    const programFlowDraft: ProgramFlowDraft = isRecord(parsed.programFlowDraft)
      ? (() => {
          const persistedProgramFlow = parsed.programFlowDraft;
          const persistedStep1 = isRecord(persistedProgramFlow.step1) ? persistedProgramFlow.step1 : {};
          const persistedStep2 = isRecord(persistedProgramFlow.step2) ? persistedProgramFlow.step2 : {};
          const persistedStep3 = isRecord(persistedProgramFlow.step3) ? persistedProgramFlow.step3 : {};
          const persistedStep6 = isRecord(persistedProgramFlow.step6) ? persistedProgramFlow.step6 : {};
          const persistedStep8 = isRecord(persistedProgramFlow.step8) ? persistedProgramFlow.step8 : {};
          return {
            step1: {
              normalizeUserType:
                typeof persistedStep1.normalizeUserType === "string"
                  ? persistedStep1.normalizeUserType
                  : INITIAL_PROGRAM_FLOW_DRAFT.step1.normalizeUserType,
              normalizeFamiliarity:
                typeof persistedStep1.normalizeFamiliarity === "string"
                  ? persistedStep1.normalizeFamiliarity
                  : INITIAL_PROGRAM_FLOW_DRAFT.step1.normalizeFamiliarity,
              normalizeDuration:
                typeof persistedStep1.normalizeDuration === "string"
                  ? persistedStep1.normalizeDuration
                  : INITIAL_PROGRAM_FLOW_DRAFT.step1.normalizeDuration,
            },
            step2: {
              spotCountLogic:
                typeof persistedStep2.spotCountLogic === "string"
                  ? persistedStep2.spotCountLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step2.spotCountLogic,
              difficultyLogic:
                typeof persistedStep2.difficultyLogic === "string"
                  ? persistedStep2.difficultyLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step2.difficultyLogic,
            },
            step3: {
              spotSelectionLogic:
                typeof persistedStep3.spotSelectionLogic === "string"
                  ? persistedStep3.spotSelectionLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step3.spotSelectionLogic,
              routeOrderingLogic:
                typeof persistedStep3.routeOrderingLogic === "string"
                  ? persistedStep3.routeOrderingLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step3.routeOrderingLogic,
            },
            step6: {
              jsonValidationLogic:
                typeof persistedStep6.jsonValidationLogic === "string"
                  ? persistedStep6.jsonValidationLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.jsonValidationLogic,
              textValidationLogic:
                typeof persistedStep6.textValidationLogic === "string"
                  ? persistedStep6.textValidationLogic
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.textValidationLogic,
            },
            step8: {
              finalizeFormat:
                typeof persistedStep8.finalizeFormat === "string"
                  ? persistedStep8.finalizeFormat
                  : INITIAL_PROGRAM_FLOW_DRAFT.step8.finalizeFormat,
              persistAndDispatch:
                typeof persistedStep8.persistAndDispatch === "string"
                  ? persistedStep8.persistAndDispatch
                  : INITIAL_PROGRAM_FLOW_DRAFT.step8.persistAndDispatch,
            },
          };
        })()
      : INITIAL_PROGRAM_FLOW_DRAFT;

    return {
      activeWorkspaceMode,
      aiWorkspacePaneMode,
      activeQuestGenerationStep,
      activeEditorTab,
      deviceMode,
      textDraft,
      aiPromptDraft,
      programFlowDraft,
    };
  } catch {
    return null;
  }
}

function InputField({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">{label}</label>
      <input
        className="w-full rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-[14px] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? <p className="mt-2 text-[12px] text-[#5a605e]">{helper}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">{label}</label>
      <textarea
        className="w-full resize-none rounded-xl border border-[#dee4e0] bg-white p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53] focus:outline-none"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? <p className="mt-2 text-[12px] text-[#5a605e]">{helper}</p> : null}
    </div>
  );
}

export default function SettingsPage() {
  const persistedSettings = useMemo(() => readPersistedSettings(), []);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<WorkspaceMode>(
    persistedSettings?.activeWorkspaceMode ?? "cms",
  );
  const [aiWorkspacePaneMode, setAiWorkspacePaneMode] = useState<AIWorkspacePaneMode>(
    persistedSettings?.aiWorkspacePaneMode ?? "prompt",
  );
  const [activeQuestGenerationStep, setActiveQuestGenerationStep] = useState<QuestGenerationStepId>(
    persistedSettings?.activeQuestGenerationStep ?? "step1",
  );
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>(persistedSettings?.activeEditorTab ?? "landing");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(persistedSettings?.deviceMode ?? "mobile");
  const [textDraft, setTextDraft] = useState<TextDraft>(persistedSettings?.textDraft ?? INITIAL_TEXT_DRAFT);
  const [aiPromptDraft, setAiPromptDraft] = useState<AIPromptDraft>(
    persistedSettings?.aiPromptDraft ?? INITIAL_AI_PROMPT_DRAFT,
  );
  const [programFlowDraft, setProgramFlowDraft] = useState<ProgramFlowDraft>(
    persistedSettings?.programFlowDraft ?? INITIAL_PROGRAM_FLOW_DRAFT,
  );
  const [committedPromptSnapshot, setCommittedPromptSnapshot] = useState<string>("");
  const [previewSimulationInputs, setPreviewSimulationInputs] = useState<PreviewSimulationInputs>(
    DEFAULT_PREVIEW_SIMULATION_INPUTS,
  );

  const [previewScreen, setPreviewScreen] = useState<PreviewScreen | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewAppUrl = process.env.NEXT_PUBLIC_KYUDAI_PREVIEW_URL ?? "http://localhost:8082/";

  const previewOrigin = useMemo(() => {
    try {
      return new URL(previewAppUrl).origin;
    } catch {
      return "*";
    }
  }, [previewAppUrl]);

  const worldConfigPayload = useMemo(
    () => ({
      landingTopTag: textDraft.landing.topTag.trim(),
      landingHeroPanelTitle: textDraft.landing.heroPanelTitle.trim(),
      landingHeroPanelBody: textDraft.landing.heroPanelBody.trim(),
      landingEyebrow: textDraft.landing.eyebrow.trim(),
      landingHeroTitleLine1: textDraft.landing.heroTitleLine1.trim(),
      landingHeroTitleLine2: textDraft.landing.heroTitleLine2.trim(),
      landingHeroDescription: textDraft.landing.heroDescription.trim(),
      landingJourneyTitle: textDraft.landing.journeyTitle.trim(),
      landingJourneyCaption: textDraft.landing.journeyCaption.trim(),
      landingFeaturesTitle: textDraft.landing.featuresTitle.trim(),
      landingFeaturesCaption: textDraft.landing.featuresCaption.trim(),
      landingStartButton: textDraft.landing.startButton.trim(),
      setupTitle: textDraft.setup.title.trim(),
      setupSubtitle: textDraft.setup.subtitle.trim(),
      setupUserTypeLabel: textDraft.setup.userTypeLabel.trim(),
      setupFamiliarityLabel: textDraft.setup.familiarityLabel.trim(),
      setupExplorationLabel: textDraft.setup.explorationLabel.trim(),
      setupExpectationLabel: textDraft.setup.expectationLabel.trim(),
      setupDurationLabel: textDraft.setup.durationLabel.trim(),
      setupDurationHintShort: textDraft.setup.durationHintShort.trim(),
      setupDurationHintLong: textDraft.setup.durationHintLong.trim(),
      setupResearchNote: textDraft.setup.researchNote.trim(),
      setupStartButton: textDraft.setup.startButton.trim(),
      preparingTitle: textDraft.preparing.title.trim(),
      preparingBody: textDraft.preparing.body.trim(),
      preparingStatusDone: textDraft.preparing.statusDone.trim(),
      preparingStatusProgress: textDraft.preparing.statusProgress.trim(),
      preparingStatusPending: textDraft.preparing.statusPending.trim(),
      preparingSkipButton: textDraft.preparing.skipButton.trim(),
      preparingFooter: textDraft.preparing.footer.trim(),
      readyChapterLabel: textDraft.ready.chapterLabel.trim(),
      readyGeneratedStoryLabel: textDraft.ready.generatedStoryLabel.trim(),
      readyStartButton: textDraft.ready.startButton.trim(),
      readyTransitionTitle: textDraft.ready.transitionTitle.trim(),
      readyTransitionBody: textDraft.ready.transitionBody.trim(),
      prologueCta: textDraft.prologue.cta.trim(),
      spotMapInfoLine1: textDraft.spot.mapInfoLine1.trim(),
      spotMapInfoLine2: textDraft.spot.mapInfoLine2.trim(),
      spotMapArrivedLabel: textDraft.spot.mapArrivedLabel.trim(),
      spotMapRestartLabel: textDraft.spot.mapRestartLabel.trim(),
      spotSpeakerBadge: textDraft.spot.speakerBadge.trim(),
      spotNextButton: textDraft.spot.nextButton.trim(),
      spotBackToMapButton: textDraft.spot.backToMapButton.trim(),
      spotFinishButton: textDraft.spot.finishButton.trim(),
      epilogueCta: textDraft.epilogue.cta.trim(),
      feedbackHeroTitleLine1: textDraft.feedback.heroTitleLine1.trim(),
      feedbackHeroTitleLine2: textDraft.feedback.heroTitleLine2.trim(),
      feedbackHeroSubtitleLine1: textDraft.feedback.heroSubtitleLine1.trim(),
      feedbackHeroSubtitleLine2: textDraft.feedback.heroSubtitleLine2.trim(),
      feedbackQuestionOverall: textDraft.feedback.questionOverall.trim(),
      feedbackQuestionGuidance: textDraft.feedback.questionGuidance.trim(),
      feedbackQuestionCampus: textDraft.feedback.questionCampus.trim(),
      feedbackQuestionVisitIntent: textDraft.feedback.questionVisitIntent.trim(),
      feedbackQuestionExpectation: textDraft.feedback.questionExpectation.trim(),
      feedbackQuestionReuse: textDraft.feedback.questionReuse.trim(),
      feedbackQuestionComment: textDraft.feedback.questionComment.trim(),
      feedbackCommentNote: textDraft.feedback.commentNote.trim(),
      feedbackSubmitButton: textDraft.feedback.submitButton.trim(),
      feedbackThanks: textDraft.feedback.thanks.trim(),
    }),
    [textDraft],
  );

  const simulatedStoryPayload = useMemo(
    () =>
      buildSimulatedStoryPayload(
        aiPromptDraft,
        previewSimulationInputs,
        textDraft.spot.narratives,
        programFlowDraft,
      ),
    [aiPromptDraft, previewSimulationInputs, textDraft.spot.narratives, programFlowDraft],
  );

  const aiSimulationWorldConfigPayload = useMemo(() => {
    return {
      ...worldConfigPayload,
      questGenerationConfig: {
        program: programFlowDraft,
        aiPrompts: {
          step4: aiPromptDraft.step4OutlinePrompt,
          step5: aiPromptDraft.step5NarrativePrompt,
          step7: aiPromptDraft.step7RepairPrompt,
        },
      },
      ...(simulatedStoryPayload.readyHeroLead
        ? { readyHeroLead: simulatedStoryPayload.readyHeroLead }
        : {}),
      ...(simulatedStoryPayload.readySummaryTitle
        ? { readySummaryTitle: simulatedStoryPayload.readySummaryTitle }
        : {}),
      ...(simulatedStoryPayload.readySummaryText
        ? { readySummaryText: simulatedStoryPayload.readySummaryText }
        : {}),
      ...(simulatedStoryPayload.prologueBody
        ? { prologueBody: simulatedStoryPayload.prologueBody }
        : {}),
      ...(Array.isArray(simulatedStoryPayload.spotNarratives)
        ? { spotNarratives: simulatedStoryPayload.spotNarratives }
        : {}),
      ...(simulatedStoryPayload.epilogueBody
        ? { epilogueBody: simulatedStoryPayload.epilogueBody }
        : {}),
    };
  }, [worldConfigPayload, programFlowDraft, aiPromptDraft, simulatedStoryPayload]);

  const effectivePreviewPayload =
    activeWorkspaceMode === "ai" && aiWorkspacePaneMode === "simulation"
      ? aiSimulationWorldConfigPayload
      : worldConfigPayload;

  const postWorldConfigToPreview = useCallback(() => {
    const frameWindow = previewFrameRef.current?.contentWindow;
    if (!frameWindow) return;

    frameWindow.postMessage(
      {
        source: "tomoshibi-admin-console",
        type: "tomoshibi-world-config:update",
        payload: effectivePreviewPayload,
      },
      previewOrigin,
    );
  }, [previewOrigin, effectivePreviewPayload]);

  useEffect(() => {
    postWorldConfigToPreview();
  }, [postWorldConfigToPreview]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ADMIN_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          activeWorkspaceMode,
          aiWorkspacePaneMode,
          activeQuestGenerationStep,
          activeEditorTab,
          deviceMode,
          textDraft,
          aiPromptDraft,
          programFlowDraft,
        }),
      );
    } catch {
      // ignore persistence errors
    }
  }, [
    activeWorkspaceMode,
    aiWorkspacePaneMode,
    activeQuestGenerationStep,
    activeEditorTab,
    deviceMode,
    textDraft,
    aiPromptDraft,
    programFlowDraft,
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

      const payload = message.payload as {
        screen?: unknown;
        simulationInputs?: unknown;
      };
      if (typeof payload.screen !== "string") return;
      if (!PREVIEW_SCREEN_ORDER.includes(payload.screen as PreviewScreen)) return;
      setPreviewScreen(payload.screen as PreviewScreen);

      const simulationInputs = payload.simulationInputs;
      if (!isRecord(simulationInputs)) return;
      setPreviewSimulationInputs((prev) => {
        const next: PreviewSimulationInputs = {
          userType:
            typeof simulationInputs.userType === "string"
              ? simulationInputs.userType
              : prev.userType,
          familiarity:
            typeof simulationInputs.familiarity === "string"
              ? simulationInputs.familiarity
              : prev.familiarity,
          duration:
            typeof simulationInputs.duration === "string"
              ? simulationInputs.duration
              : prev.duration,
          explorationStyle:
            typeof simulationInputs.explorationStyle === "string"
              ? simulationInputs.explorationStyle
              : prev.explorationStyle,
          experienceExpectation:
            typeof simulationInputs.experienceExpectation === "string"
              ? simulationInputs.experienceExpectation
              : prev.experienceExpectation,
        };

        if (
          next.userType === prev.userType &&
          next.familiarity === prev.familiarity &&
          next.duration === prev.duration &&
          next.explorationStyle === prev.explorationStyle &&
          next.experienceExpectation === prev.experienceExpectation
        ) {
          return prev;
        }
        return next;
      });
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
      const target = EDITOR_TABS.find((item) => item.key === tab);
      if (!target) return;
      const frameWindow = previewFrameRef.current?.contentWindow;
      if (!frameWindow) return;
      frameWindow.postMessage(
        {
          source: "tomoshibi-admin-console",
          type: "tomoshibi-navigation:set-screen",
          payload: { screen: target.screen },
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

  const updateLanding = (key: keyof TextDraft["landing"], value: string) => {
    setTextDraft((prev) => ({ ...prev, landing: { ...prev.landing, [key]: value } }));
  };

  const updateSetup = (key: keyof TextDraft["setup"], value: string) => {
    setTextDraft((prev) => ({ ...prev, setup: { ...prev.setup, [key]: value } }));
  };

  const updatePreparing = (key: keyof TextDraft["preparing"], value: string) => {
    setTextDraft((prev) => ({ ...prev, preparing: { ...prev.preparing, [key]: value } }));
  };

  const updateReady = (key: keyof TextDraft["ready"], value: string) => {
    setTextDraft((prev) => ({ ...prev, ready: { ...prev.ready, [key]: value } }));
  };

  const updatePrologue = (key: keyof TextDraft["prologue"], value: string) => {
    setTextDraft((prev) => ({ ...prev, prologue: { ...prev.prologue, [key]: value } }));
  };

  const updateSpot = (key: keyof Omit<TextDraft["spot"], "narratives">, value: string) => {
    setTextDraft((prev) => ({ ...prev, spot: { ...prev.spot, [key]: value } }));
  };

  const updateEpilogue = (key: keyof TextDraft["epilogue"], value: string) => {
    setTextDraft((prev) => ({ ...prev, epilogue: { ...prev.epilogue, [key]: value } }));
  };

  const updateFeedback = (key: keyof TextDraft["feedback"], value: string) => {
    setTextDraft((prev) => ({ ...prev, feedback: { ...prev.feedback, [key]: value } }));
  };

  const updateAIPromptField = (key: keyof Omit<AIPromptDraft, "outputTargets">, value: string) => {
    setAiPromptDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateProgramStep1Field = (
    key: keyof ProgramFlowDraft["step1"],
    value: string,
  ) => {
    setProgramFlowDraft((prev) => ({
      ...prev,
      step1: { ...prev.step1, [key]: value },
    }));
  };

  const updateProgramStep2Field = (
    key: keyof ProgramFlowDraft["step2"],
    value: string,
  ) => {
    setProgramFlowDraft((prev) => ({
      ...prev,
      step2: { ...prev.step2, [key]: value },
    }));
  };

  const updateProgramStep3Field = (
    key: keyof ProgramFlowDraft["step3"],
    value: string,
  ) => {
    setProgramFlowDraft((prev) => ({
      ...prev,
      step3: { ...prev.step3, [key]: value },
    }));
  };

  const updateProgramStep6Field = (
    key: keyof ProgramFlowDraft["step6"],
    value: string,
  ) => {
    setProgramFlowDraft((prev) => ({
      ...prev,
      step6: { ...prev.step6, [key]: value },
    }));
  };

  const updateProgramStep8Field = (
    key: keyof ProgramFlowDraft["step8"],
    value: string,
  ) => {
    setProgramFlowDraft((prev) => ({
      ...prev,
      step8: { ...prev.step8, [key]: value },
    }));
  };

  const toggleAIPromptTarget = (target: AIOutputTarget) => {
    setAiPromptDraft((prev) => {
      const hasTarget = prev.outputTargets.includes(target);
      if (hasTarget) {
        const nextTargets = prev.outputTargets.filter((item) => item !== target);
        return {
          ...prev,
          outputTargets: nextTargets.length > 0 ? nextTargets : [target],
        };
      }
      return {
        ...prev,
        outputTargets: [...prev.outputTargets, target],
      };
    });
  };

  const step4PromptPreview = useMemo(
    () => renderPromptTemplate(aiPromptDraft.step4OutlinePrompt, previewSimulationInputs, aiPromptDraft),
    [aiPromptDraft, previewSimulationInputs],
  );
  const step5PromptPreview = useMemo(
    () => renderPromptTemplate(aiPromptDraft.step5NarrativePrompt, previewSimulationInputs, aiPromptDraft),
    [aiPromptDraft, previewSimulationInputs],
  );
  const step7PromptPreview = useMemo(
    () => renderPromptTemplate(aiPromptDraft.step7RepairPrompt, previewSimulationInputs, aiPromptDraft),
    [aiPromptDraft, previewSimulationInputs],
  );

  const generatedAIPrompt = useMemo(() => {
    const targetLabels = AI_OUTPUT_TARGET_ITEMS
      .filter((item) => aiPromptDraft.outputTargets.includes(item.key))
      .map((item) => item.label)
      .join(" / ");
    return [
      `対象: ${targetLabels || "未選択"}`,
      "",
      "[STEP4 骨子生成]",
      step4PromptPreview,
      "",
      "[STEP5 本文生成]",
      step5PromptPreview,
      "",
      "[STEP7 部分再生成]",
      step7PromptPreview,
    ].join("\n");
  }, [aiPromptDraft.outputTargets, step4PromptPreview, step5PromptPreview, step7PromptPreview]);

  const runSimulation = useCallback(() => {
    setCommittedPromptSnapshot(generatedAIPrompt);
    setAiWorkspacePaneMode("simulation");

    const frameWindow = previewFrameRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage(
      {
        source: "tomoshibi-admin-console",
        type: "tomoshibi-navigation:set-screen",
        payload: { screen: "setup" },
      },
      previewOrigin,
    );
  }, [generatedAIPrompt, previewOrigin]);

  const returnToPromptBuilder = useCallback(() => {
    setAiWorkspacePaneMode("prompt");
  }, []);

  const simulationPromptSource = committedPromptSnapshot || generatedAIPrompt;
  const currentFlowStepIndex = findFlowStepIndex(previewScreen);

  const isAISimulationActive =
    activeWorkspaceMode === "ai" && aiWorkspacePaneMode === "simulation";
  const rightPaneTitle = isAISimulationActive ? "Simulation Preview" : "Live Preview";
  const rightPaneSubtitle = isAISimulationActive
    ? `現在: ${previewScreen ?? "未接続"} / 合成結果をアプリUIで確認`
    : `現在: ${previewScreen ?? "未接続"}`;

  return (
    <main className="h-screen overflow-hidden bg-[#f9f9f7] text-[#2d3432]" style={{ backgroundImage: "none" }}>
      <div className="flex h-screen min-h-0 flex-1 flex-row overflow-hidden bg-[#f9f9f7]">
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0">
            <aside className="w-[220px] flex-shrink-0 border-r border-[#dee4e0] bg-[#f2f4f2] p-3">
              <h3 className="px-1 py-2 text-xs font-bold tracking-wider text-[#5a605e] uppercase">編集モード</h3>
              <div className="space-y-2">
                {WORKSPACE_MODE_ITEMS.map((item) => {
                  const isActive = activeWorkspaceMode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveWorkspaceMode(item.key)}
                      className={[
                        "w-full rounded-xl border px-3 py-2 text-left transition-colors",
                        isActive
                          ? "border-[#f5ce53] bg-[#fff7e2]"
                          : "border-[#dee4e0] bg-white hover:border-[#f5ce53]/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <MaterialIcon className={isActive ? "text-[#2d3432]" : "text-[#5a605e]"} name={item.icon} />
                        <p className={isActive ? "text-sm font-semibold text-[#2d3432]" : "text-sm font-semibold text-[#2d3432]"}>
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#5a605e]">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </aside>
            <main className="min-w-0 flex-1 overflow-y-auto px-3 pt-2 pb-6 sm:px-5 md:px-6 lg:px-8 xl:px-10 xl:pt-3 xl:pb-6">
              {activeWorkspaceMode === "cms" ? (
                <>
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

          {activeEditorTab === "landing" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">ランディング画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">ホーム画面の主要テキストを編集します。</p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="上部タグ" value={textDraft.landing.topTag} onChange={(value) => updateLanding("topTag", value)} />
                <InputField label="ヒーローパネル見出し" value={textDraft.landing.heroPanelTitle} onChange={(value) => updateLanding("heroPanelTitle", value)} />
                <InputField label="ヒーローパネル本文" value={textDraft.landing.heroPanelBody} onChange={(value) => updateLanding("heroPanelBody", value)} />
                <InputField label="眉見出し" value={textDraft.landing.eyebrow} onChange={(value) => updateLanding("eyebrow", value)} />
                <InputField label="タイトル1行目" value={textDraft.landing.heroTitleLine1} onChange={(value) => updateLanding("heroTitleLine1", value)} />
                <InputField label="タイトル2行目" value={textDraft.landing.heroTitleLine2} onChange={(value) => updateLanding("heroTitleLine2", value)} />
                <InputField label="体験の流れ 見出し" value={textDraft.landing.journeyTitle} onChange={(value) => updateLanding("journeyTitle", value)} />
                <InputField label="体験の流れ サブ見出し" value={textDraft.landing.journeyCaption} onChange={(value) => updateLanding("journeyCaption", value)} />
                <InputField label="できること 見出し" value={textDraft.landing.featuresTitle} onChange={(value) => updateLanding("featuresTitle", value)} />
                <InputField label="できること サブ見出し" value={textDraft.landing.featuresCaption} onChange={(value) => updateLanding("featuresCaption", value)} />
                <InputField label="開始ボタン" value={textDraft.landing.startButton} onChange={(value) => updateLanding("startButton", value)} />
              </div>

              <TextAreaField
                label="ヒーロー説明文"
                rows={4}
                value={textDraft.landing.heroDescription}
                onChange={(value) => updateLanding("heroDescription", value)}
              />
            </div>
          ) : null}

          {activeEditorTab === "setup" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">セットアップ画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">質問ラベルと導入文を編集します。</p>
              </div>

              <TextAreaField label="タイトル" rows={2} value={textDraft.setup.title} onChange={(value) => updateSetup("title", value)} />
              <TextAreaField label="サブタイトル" rows={3} value={textDraft.setup.subtitle} onChange={(value) => updateSetup("subtitle", value)} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="ユーザー質問ラベル" value={textDraft.setup.userTypeLabel} onChange={(value) => updateSetup("userTypeLabel", value)} />
                <InputField label="慣れ質問ラベル" value={textDraft.setup.familiarityLabel} onChange={(value) => updateSetup("familiarityLabel", value)} />
                <InputField label="探索スタイル質問ラベル" value={textDraft.setup.explorationLabel} onChange={(value) => updateSetup("explorationLabel", value)} />
                <InputField label="期待質問ラベル" value={textDraft.setup.expectationLabel} onChange={(value) => updateSetup("expectationLabel", value)} />
                <InputField label="時間質問ラベル" value={textDraft.setup.durationLabel} onChange={(value) => updateSetup("durationLabel", value)} />
                <InputField label="研究注記" value={textDraft.setup.researchNote} onChange={(value) => updateSetup("researchNote", value)} />
                <InputField label="時間ヒント（左）" value={textDraft.setup.durationHintShort} onChange={(value) => updateSetup("durationHintShort", value)} />
                <InputField label="時間ヒント（右）" value={textDraft.setup.durationHintLong} onChange={(value) => updateSetup("durationHintLong", value)} />
                <InputField label="開始ボタン" value={textDraft.setup.startButton} onChange={(value) => updateSetup("startButton", value)} />
              </div>
            </div>
          ) : null}

          {activeEditorTab === "preparing" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">プリペアリング画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">ロード中ステップ文言を編集します。</p>
              </div>

              <TextAreaField label="タイトル" rows={2} value={textDraft.preparing.title} onChange={(value) => updatePreparing("title", value)} />
              <TextAreaField label="説明文" rows={3} value={textDraft.preparing.body} onChange={(value) => updatePreparing("body", value)} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="ステータス1" value={textDraft.preparing.statusDone} onChange={(value) => updatePreparing("statusDone", value)} />
                <InputField label="ステータス2" value={textDraft.preparing.statusProgress} onChange={(value) => updatePreparing("statusProgress", value)} />
                <InputField label="ステータス3" value={textDraft.preparing.statusPending} onChange={(value) => updatePreparing("statusPending", value)} />
                <InputField label="スキップボタン" value={textDraft.preparing.skipButton} onChange={(value) => updatePreparing("skipButton", value)} />
                <InputField label="フッター文言" value={textDraft.preparing.footer} onChange={(value) => updatePreparing("footer", value)} />
              </div>
            </div>
          ) : null}

          {activeEditorTab === "ready" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">準備完了画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">
                  この画面は「AI生成領域」と「固定UI領域」を分離しています。ここでは固定UI文言のみ編集できます。
                </p>
              </div>

              <div className="rounded-xl border border-[#f5ce53]/40 bg-[#fff7e2] px-4 py-3 text-sm text-[#5a605e]">
                AI生成対象: 物語タイトル、サマリー見出し、サマリー本文
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="章ラベル" value={textDraft.ready.chapterLabel} onChange={(value) => updateReady("chapterLabel", value)} />
                <InputField label="生成物語ラベル" value={textDraft.ready.generatedStoryLabel} onChange={(value) => updateReady("generatedStoryLabel", value)} />
                <InputField label="開始ボタン" value={textDraft.ready.startButton} onChange={(value) => updateReady("startButton", value)} />
                <InputField label="遷移タイトル" value={textDraft.ready.transitionTitle} onChange={(value) => updateReady("transitionTitle", value)} />
                <InputField label="遷移本文" value={textDraft.ready.transitionBody} onChange={(value) => updateReady("transitionBody", value)} />
              </div>
            </div>
          ) : null}

          {activeEditorTab === "prologue" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">プロローグ画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">
                  AI生成本文と固定CTAを分離しています。ここでは固定CTAのみ編集できます。
                </p>
              </div>

              <div className="rounded-xl border border-[#f5ce53]/40 bg-[#fff7e2] px-4 py-3 text-sm text-[#5a605e]">
                AI生成対象: プロローグ本文
              </div>
              <InputField label="CTA" value={textDraft.prologue.cta} onChange={(value) => updatePrologue("cta", value)} />
            </div>
          ) : null}

          {activeEditorTab === "spot" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">スポット文タブ</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">
                  AI生成スポット本文と固定UI文言を分離しています。ここでは固定UI文言のみ編集できます。
                </p>
              </div>

              <div className="rounded-xl border border-[#f5ce53]/40 bg-[#fff7e2] px-4 py-3 text-sm text-[#5a605e]">
                AI生成対象: スポット本文（最大6件）
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="マップ説明 1行目" value={textDraft.spot.mapInfoLine1} onChange={(value) => updateSpot("mapInfoLine1", value)} />
                <InputField label="マップ説明 2行目" value={textDraft.spot.mapInfoLine2} onChange={(value) => updateSpot("mapInfoLine2", value)} />
                <InputField label="到着ボタン文言" value={textDraft.spot.mapArrivedLabel} onChange={(value) => updateSpot("mapArrivedLabel", value)} />
                <InputField label="再開ボタン文言" value={textDraft.spot.mapRestartLabel} onChange={(value) => updateSpot("mapRestartLabel", value)} />
                <InputField label="スポット話者ラベル" value={textDraft.spot.speakerBadge} onChange={(value) => updateSpot("speakerBadge", value)} />
                <InputField label="スポット 次へ" value={textDraft.spot.nextButton} onChange={(value) => updateSpot("nextButton", value)} />
                <InputField label="スポット マップ戻る" value={textDraft.spot.backToMapButton} onChange={(value) => updateSpot("backToMapButton", value)} />
                <InputField label="スポット 最終遷移" value={textDraft.spot.finishButton} onChange={(value) => updateSpot("finishButton", value)} />
              </div>
            </div>
          ) : null}

          {activeEditorTab === "epilogue" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">エピローグ画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">
                  AI生成本文と固定CTAを分離しています。ここでは固定CTAのみ編集できます。
                </p>
              </div>

              <div className="rounded-xl border border-[#f5ce53]/40 bg-[#fff7e2] px-4 py-3 text-sm text-[#5a605e]">
                AI生成対象: エピローグ本文
              </div>
              <InputField label="CTA" value={textDraft.epilogue.cta} onChange={(value) => updateEpilogue("cta", value)} />
            </div>
          ) : null}

          {activeEditorTab === "feedback" ? (
            <div className="max-w-none space-y-8 xl:max-w-4xl">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">フィードバック画面</h3>
                <p className="text-[15px] leading-relaxed text-[#5a605e]">見出しと各質問文言を編集します。</p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InputField label="ヒーロー1行目" value={textDraft.feedback.heroTitleLine1} onChange={(value) => updateFeedback("heroTitleLine1", value)} />
                <InputField label="ヒーロー2行目" value={textDraft.feedback.heroTitleLine2} onChange={(value) => updateFeedback("heroTitleLine2", value)} />
                <InputField label="サブ1行目" value={textDraft.feedback.heroSubtitleLine1} onChange={(value) => updateFeedback("heroSubtitleLine1", value)} />
                <InputField label="サブ2行目" value={textDraft.feedback.heroSubtitleLine2} onChange={(value) => updateFeedback("heroSubtitleLine2", value)} />
                <InputField label="質問1: 全体満足" value={textDraft.feedback.questionOverall} onChange={(value) => updateFeedback("questionOverall", value)} />
                <InputField label="質問2: 内容理解" value={textDraft.feedback.questionGuidance} onChange={(value) => updateFeedback("questionGuidance", value)} />
                <InputField label="質問3: キャンパス興味" value={textDraft.feedback.questionCampus} onChange={(value) => updateFeedback("questionCampus", value)} />
                <InputField label="質問4: 訪問意向" value={textDraft.feedback.questionVisitIntent} onChange={(value) => updateFeedback("questionVisitIntent", value)} />
                <InputField label="質問5: 期待一致" value={textDraft.feedback.questionExpectation} onChange={(value) => updateFeedback("questionExpectation", value)} />
                <InputField label="質問6: 再利用意向" value={textDraft.feedback.questionReuse} onChange={(value) => updateFeedback("questionReuse", value)} />
                <InputField label="質問7: 自由意見ラベル" value={textDraft.feedback.questionComment} onChange={(value) => updateFeedback("questionComment", value)} />
                <InputField label="自由意見 注記" value={textDraft.feedback.commentNote} onChange={(value) => updateFeedback("commentNote", value)} />
                <InputField label="送信ボタン" value={textDraft.feedback.submitButton} onChange={(value) => updateFeedback("submitButton", value)} />
                <InputField label="送信後テキスト" value={textDraft.feedback.thanks} onChange={(value) => updateFeedback("thanks", value)} />
              </div>
            </div>
          ) : null}
                </>
              ) : aiWorkspacePaneMode === "prompt" ? (
                <div className="max-w-none space-y-6 xl:max-w-5xl">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">クエスト生成フロー管理</h3>
                    <p className="text-[15px] leading-relaxed text-[#5a605e]">
                      1〜8の各ステップを編集します。4/5/7はAIプロンプト、1/2/3/6/8はプログラム設定です。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="space-y-2 rounded-xl border border-[#dee4e0] bg-white p-3">
                      {QUEST_GENERATION_STEPS.map((step) => {
                        const isActive = activeQuestGenerationStep === step.id;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveQuestGenerationStep(step.id)}
                            className={[
                              "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#f5ce53] bg-[#fff7e2]"
                                : "border-[#dee4e0] bg-[#f9f9f7] hover:border-[#f5ce53]/70",
                            ].join(" ")}
                          >
                            <p className="text-sm font-semibold text-[#2d3432]">{step.label}</p>
                            <p className="text-[11px] text-[#5a605e]">{step.description}</p>
                            <p className="mt-1 text-[10px] font-semibold text-[#5a605e] uppercase">
                              {step.kind === "ai" ? "AI" : "Program"}
                            </p>
                          </button>
                        );
                      })}
                    </aside>

                    <div className="space-y-6">
                      {activeQuestGenerationStep === "step1" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 1: 入力正規化</h4>
                          <TextAreaField
                            label="ユーザータイプ正規化ルール"
                            rows={4}
                            value={programFlowDraft.step1.normalizeUserType}
                            onChange={(value) => updateProgramStep1Field("normalizeUserType", value)}
                          />
                          <TextAreaField
                            label="習熟度正規化ルール"
                            rows={4}
                            value={programFlowDraft.step1.normalizeFamiliarity}
                            onChange={(value) => updateProgramStep1Field("normalizeFamiliarity", value)}
                          />
                          <TextAreaField
                            label="時間正規化ルール"
                            rows={3}
                            value={programFlowDraft.step1.normalizeDuration}
                            onChange={(value) => updateProgramStep1Field("normalizeDuration", value)}
                          />
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step2" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 2: 体験設計</h4>
                          <TextAreaField
                            label="スポット数ロジック"
                            rows={4}
                            value={programFlowDraft.step2.spotCountLogic}
                            onChange={(value) => updateProgramStep2Field("spotCountLogic", value)}
                          />
                          <TextAreaField
                            label="難易度ロジック"
                            rows={4}
                            value={programFlowDraft.step2.difficultyLogic}
                            onChange={(value) => updateProgramStep2Field("difficultyLogic", value)}
                          />
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step3" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 3: ルート確定</h4>
                          <TextAreaField
                            label="スポット選定ロジック"
                            rows={4}
                            value={programFlowDraft.step3.spotSelectionLogic}
                            onChange={(value) => updateProgramStep3Field("spotSelectionLogic", value)}
                          />
                          <TextAreaField
                            label="巡回順ロジック"
                            rows={4}
                            value={programFlowDraft.step3.routeOrderingLogic}
                            onChange={(value) => updateProgramStep3Field("routeOrderingLogic", value)}
                          />
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step4" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 4: 骨子生成（AI）</h4>
                          <TextAreaField
                            label="目的"
                            rows={3}
                            value={aiPromptDraft.objective}
                            onChange={(value) => updateAIPromptField("objective", value)}
                          />
                          <TextAreaField
                            label="対象ユーザー"
                            rows={3}
                            value={aiPromptDraft.audience}
                            onChange={(value) => updateAIPromptField("audience", value)}
                          />
                          <TextAreaField
                            label="骨子生成プロンプトテンプレート"
                            rows={5}
                            helper="利用可能な変数: {userType}, {familiarity}, {duration}, {explorationStyle}, {experienceExpectation}"
                            value={aiPromptDraft.step4OutlinePrompt}
                            onChange={(value) => updateAIPromptField("step4OutlinePrompt", value)}
                          />
                          <div>
                            <p className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              プロンプトプレビュー
                            </p>
                            <textarea
                              readOnly
                              rows={7}
                              value={step4PromptPreview}
                              className="w-full resize-none rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-4 text-[13px] leading-[1.6] text-[#2d3432] focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step5" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 5: 本文生成（AI）</h4>
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <TextAreaField
                              label="トーン"
                              rows={3}
                              value={aiPromptDraft.tone}
                              onChange={(value) => updateAIPromptField("tone", value)}
                            />
                            <TextAreaField
                              label="必須要素"
                              rows={3}
                              value={aiPromptDraft.requiredElements}
                              onChange={(value) => updateAIPromptField("requiredElements", value)}
                            />
                            <InputField
                              label="出力文体"
                              value={aiPromptDraft.outputStyle}
                              onChange={(value) => updateAIPromptField("outputStyle", value)}
                            />
                            <InputField
                              label="出力言語"
                              value={aiPromptDraft.outputLanguage}
                              onChange={(value) => updateAIPromptField("outputLanguage", value)}
                            />
                          </div>
                          <div className="rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-3">
                            <p className="mb-2 text-xs font-bold tracking-wider text-[#5a605e] uppercase">生成対象</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {AI_OUTPUT_TARGET_ITEMS.map((item) => {
                                const selected = aiPromptDraft.outputTargets.includes(item.key);
                                return (
                                  <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => toggleAIPromptTarget(item.key)}
                                    className={[
                                      "rounded-lg border px-3 py-2 text-left transition-colors",
                                      selected
                                        ? "border-[#f5ce53] bg-[#fff7e2]"
                                        : "border-[#dee4e0] bg-white hover:border-[#f5ce53]/70",
                                    ].join(" ")}
                                  >
                                    <p className="text-sm font-semibold text-[#2d3432]">{item.label}</p>
                                    <p className="text-[11px] text-[#5a605e]">{item.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <TextAreaField
                            label="本文生成プロンプトテンプレート"
                            rows={5}
                            helper="利用可能な変数: {tone}, {requiredElements}, {outputStyle}, {forbiddenElements}"
                            value={aiPromptDraft.step5NarrativePrompt}
                            onChange={(value) => updateAIPromptField("step5NarrativePrompt", value)}
                          />
                          <div>
                            <p className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              プロンプトプレビュー
                            </p>
                            <textarea
                              readOnly
                              rows={7}
                              value={step5PromptPreview}
                              className="w-full resize-none rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-4 text-[13px] leading-[1.6] text-[#2d3432] focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step6" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 6: 検証</h4>
                          <TextAreaField
                            label="JSON検証ロジック"
                            rows={4}
                            value={programFlowDraft.step6.jsonValidationLogic}
                            onChange={(value) => updateProgramStep6Field("jsonValidationLogic", value)}
                          />
                          <TextAreaField
                            label="テキスト検証ロジック"
                            rows={4}
                            value={programFlowDraft.step6.textValidationLogic}
                            onChange={(value) => updateProgramStep6Field("textValidationLogic", value)}
                          />
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step7" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 7: 部分再生成（AI）</h4>
                          <TextAreaField
                            label="禁止要素"
                            rows={3}
                            value={aiPromptDraft.forbiddenElements}
                            onChange={(value) => updateAIPromptField("forbiddenElements", value)}
                          />
                          <TextAreaField
                            label="固定文言ポリシー"
                            rows={3}
                            value={aiPromptDraft.fixedTextPolicy}
                            onChange={(value) => updateAIPromptField("fixedTextPolicy", value)}
                          />
                          <TextAreaField
                            label="部分再生成プロンプトテンプレート"
                            rows={5}
                            helper="利用可能な変数: {forbiddenElements}, {fixedTextPolicy}, {tone}"
                            value={aiPromptDraft.step7RepairPrompt}
                            onChange={(value) => updateAIPromptField("step7RepairPrompt", value)}
                          />
                          <div>
                            <p className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">
                              プロンプトプレビュー
                            </p>
                            <textarea
                              readOnly
                              rows={7}
                              value={step7PromptPreview}
                              className="w-full resize-none rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-4 text-[13px] leading-[1.6] text-[#2d3432] focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : null}

                      {activeQuestGenerationStep === "step8" ? (
                        <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-white p-4">
                          <h4 className="text-lg font-semibold text-[#2d3432]">Step 8: 最終確定</h4>
                          <TextAreaField
                            label="最終フォーマット"
                            rows={4}
                            value={programFlowDraft.step8.finalizeFormat}
                            onChange={(value) => updateProgramStep8Field("finalizeFormat", value)}
                          />
                          <TextAreaField
                            label="保存・配信処理"
                            rows={4}
                            value={programFlowDraft.step8.persistAndDispatch}
                            onChange={(value) => updateProgramStep8Field("persistAndDispatch", value)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#dee4e0] bg-white px-4 py-3 text-sm text-[#5a605e]">
                    シミュレーション開始後は、右側プレビュー操作に応じて左側の生成フロー進行がハイライトされます。
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={runSimulation}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1a1c20] px-4 py-2 text-sm font-semibold text-[#f7f7fd] hover:bg-[#2d3432]"
                    >
                      <MaterialIcon name="science" className="text-base" />
                      シミュレーションモードへ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-none space-y-8 xl:max-w-4xl">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">AIシミュレーション</h3>
                    <p className="text-[15px] leading-relaxed text-[#5a605e]">
                      右側プレビューの操作を条件として扱います。左側では確定プロンプトと生成フロー進行を確認します。
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#dee4e0] bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-[#2d3432]">現在のプレビュー条件（読み取り専用）</p>
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#2d3432] sm:grid-cols-2">
                      <div className="rounded-lg bg-[#f9f9f7] px-3 py-2">ユーザー: {previewSimulationInputs.userType}</div>
                      <div className="rounded-lg bg-[#f9f9f7] px-3 py-2">習熟度: {previewSimulationInputs.familiarity}</div>
                      <div className="rounded-lg bg-[#f9f9f7] px-3 py-2">時間: {previewSimulationInputs.duration}</div>
                      <div className="rounded-lg bg-[#f9f9f7] px-3 py-2">探索: {previewSimulationInputs.explorationStyle}</div>
                      <div className="rounded-lg bg-[#f9f9f7] px-3 py-2 sm:col-span-2">期待: {previewSimulationInputs.experienceExpectation}</div>
                    </div>
                    <p className="mt-3 text-[12px] text-[#5a605e]">
                      条件変更は右側プレビューのセットアップ画面で行ってください。
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-[#dee4e0] bg-white p-4">
                    <p className="text-sm font-semibold text-[#2d3432]">確定プロンプト</p>
                    <textarea
                      readOnly
                      value={simulationPromptSource}
                      rows={12}
                      className="w-full resize-none rounded-lg border border-[#dee4e0] bg-[#f9f9f7] p-3 text-[12px] leading-[1.65] text-[#2d3432] focus:outline-none"
                    />
                    <p className="text-[11px] text-[#5a605e]">シミュレーション開始時点で確定したプロンプトです。</p>
                  </div>

                  <div className="rounded-xl border border-[#dee4e0] bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-[#2d3432]">生成フロー</p>
                    <div className="space-y-2">
                      {GENERATION_FLOW_STEPS.map((step, index) => {
                        const isActive = currentFlowStepIndex === index;
                        const isDone = currentFlowStepIndex > index;
                        return (
                          <div
                            key={step.key}
                            className={[
                              "rounded-lg border px-3 py-2 transition-colors",
                              isActive
                                ? "border-[#f5ce53] bg-[#fff7e2]"
                                : isDone
                                  ? "border-[#cfd7d3] bg-[#f4f7f5]"
                                  : "border-[#dee4e0] bg-[#f9f9f7]",
                            ].join(" ")}
                          >
                            <p className="text-sm font-semibold text-[#2d3432]">{step.label}</p>
                            <p className="text-[11px] text-[#5a605e]">{step.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={runSimulation}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1a1c20] px-4 py-2 text-sm font-semibold text-[#f7f7fd] hover:bg-[#2d3432]"
                    >
                      <MaterialIcon name="play_arrow" className="text-base" />
                      再シミュレーション
                    </button>
                    <button
                      type="button"
                      onClick={returnToPromptBuilder}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#dee4e0] bg-white px-4 py-2 text-sm font-semibold text-[#2d3432] hover:border-[#f5ce53]"
                    >
                      <MaterialIcon name="edit_note" className="text-base" />
                      プロンプト編集に戻る
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        <aside
          className={[
            "relative z-10 flex h-full min-h-0 flex-shrink-0 flex-col border-l border-[#dee4e0] bg-[#f2f4f2] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]",
            isAISimulationActive
              ? "w-[clamp(460px,50vw,760px)] min-w-[460px] max-w-[760px]"
              : "w-[clamp(360px,38vw,520px)] min-w-[360px] max-w-[520px]",
          ].join(" ")}
        >
          <>
            <div className="sticky top-0 z-20 h-14 border-b border-[#dee4e0] bg-[#f9f9f7]/70 px-3 backdrop-blur-sm sm:px-4">
              <div className="flex h-full items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#2d3432]">{rightPaneTitle}</h4>
                  <p className="text-[11px] text-[#5a605e]">{rightPaneSubtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAISimulationActive ? (
                    <button
                      type="button"
                      onClick={returnToPromptBuilder}
                      className="rounded-lg border border-[#dee4e0] bg-white px-2.5 py-1 text-xs font-semibold text-[#2d3432] hover:border-[#f5ce53]"
                    >
                      プロンプト編集へ
                    </button>
                  ) : null}
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
          </>
        </aside>
      </div>
    </main>
  );
}
