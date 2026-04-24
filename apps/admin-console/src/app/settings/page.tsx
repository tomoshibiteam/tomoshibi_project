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
type WorkspaceMode = "cms" | "ai" | "spotdb";
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

type SpotDbRecord = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  source: string;
  address: string;
  kinds: string;
};

type SpotDbApiResponse = {
  generatedAt: string | null;
  totalSpots: number;
  spots: SpotDbRecord[];
};

type GoogleMapInstance = {
  setCenter(center: { lat: number; lng: number }): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleLatLngBounds, padding?: number): void;
};

type GoogleMarkerInstance = {
  setMap(map: GoogleMapInstance | null): void;
};

type GoogleLatLngBounds = {
  extend(position: { lat: number; lng: number }): void;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      Map?: new (
        mapElement: HTMLElement,
        options: {
          center: { lat: number; lng: number };
          zoom: number;
          disableDefaultUI?: boolean;
          clickableIcons?: boolean;
          gestureHandling?: "cooperative" | "greedy" | "none" | "auto";
          keyboardShortcuts?: boolean;
        },
      ) => GoogleMapInstance;
      Marker?: new (options: {
        position: { lat: number; lng: number };
        map: GoogleMapInstance;
        title?: string;
      }) => GoogleMarkerInstance;
      LatLngBounds?: new () => GoogleLatLngBounds;
    };
  };
};

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
  step4RoutePrompt: string;
  step6InsertionPrompt: string;
  step7RepairPrompt: string;
  outputTargets: AIOutputTarget[];
};

type PreviewSimulationInputs = {
  userType: string;
  familiarity: string;
  duration: string;
  explorationStyle: string;
  experienceExpectation: string;
  currentLat: string;
  currentLng: string;
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
    spotCountRule: string;
    mobilityConstraintRule: string;
  };
  step3: {
    candidateSelectionRule: string;
    routeOrderingRule: string;
    spotDbLinkPolicy: string;
    candidateSpotPoolIds: string;
  };
  step5: {
    narrativeContainerSpec: string;
    slotInjectionPolicy: string;
  };
  step6: {
    worldSetting: string;
    characterProfile: string;
    characterRole: string;
    storyArcFor4Spots: string;
    storyArcFor5Spots: string;
    storyArcFor6Spots: string;
    conversationFlow: string;
  };
  step7: {
    validationRuleSet: string;
    fallbackPolicy: string;
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

type QuestGenerationStepStatus = "completed" | "fallback" | "error";

type QuestGenerationStepResponse = {
  id: QuestGenerationStepId;
  label: string;
  status: "completed" | "fallback";
  detail: string;
};

type QuestGenerationStepTrace = {
  id: QuestGenerationStepId;
  program?: string;
  inputVars?: Record<string, unknown>;
  outputVars?: Record<string, unknown>;
  aiPrompt?: {
    provider?: string;
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    userPrompt?: string;
  };
};

type QuestGenerationSimulationApiResponse = {
  ok: boolean;
  error?: string;
  steps?: QuestGenerationStepResponse[];
  stepTraces?: QuestGenerationStepTrace[];
};

type StepSimulationState = {
  ranAtIso: string;
  status: QuestGenerationStepStatus;
  detail: string;
  program: string;
  inputVars: Record<string, unknown>;
  outputVars: Record<string, unknown>;
  aiPrompt?: {
    provider: string;
    model: string;
    temperature: number;
    systemPrompt: string;
    userPrompt: string;
  };
};

type StepAiPromptView = {
  provider: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  userPrompt: string;
};

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

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const SETTINGS_MAPS_SCRIPT_ID = "google-maps-settings-script";
const DEFAULT_SPOT_DB_MAP_CENTER = { lat: 33.59588443, lng: 130.2178404 };
const DEFAULT_SPOT_DB_MAP_ZOOM = 14;

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
    description: "ルート最適化と差し込み生成のフロー設定",
    icon: "auto_awesome",
  },
  {
    key: "spotdb",
    label: "スポットDB",
    description: "現在のスポットDBを地図で確認",
    icon: "place",
  },
];

let settingsMapsScriptPromise: Promise<void> | null = null;

function loadSettingsGoogleMapsScript(apiKey: string): Promise<void> {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  const mapsWindow = window as GoogleMapsWindow;
  if (mapsWindow.google?.maps?.Map && mapsWindow.google?.maps?.Marker) {
    return Promise.resolve();
  }

  if (settingsMapsScriptPromise) {
    return settingsMapsScriptPromise;
  }

  settingsMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(SETTINGS_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SETTINGS_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja&region=JP`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Google Maps script.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return settingsMapsScriptPromise;
}

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
  kind: "program" | "ai" | "hybrid";
}> = [
  { id: "step1", label: "1. 入力正規化", description: "入力値を内部形式へ変換", kind: "program" },
  { id: "step2", label: "2. 制約計算", description: "スポット数と移動制約を決定", kind: "program" },
  { id: "step3", label: "3. 候補抽出", description: "候補スポットと順序候補を抽出", kind: "program" },
  { id: "step4", label: "4. ルート最適化", description: "条件に合う巡回ルートをAIで決定", kind: "ai" },
  { id: "step5", label: "5. テンプレ割当", description: "事前定義の器へ差し込み先を割当", kind: "program" },
  { id: "step6", label: "6. 差し込み生成", description: "器に沿って最終文面をAIで調整生成", kind: "ai" },
  { id: "step7", label: "7. 検証/最小再生成", description: "検証後に必要箇所のみ再生成", kind: "hybrid" },
  { id: "step8", label: "8. 最終確定", description: "最終JSONを確定し保存", kind: "program" },
];

const STEP_SIMULATION_SPECS: Record<
  QuestGenerationStepId,
  {
    inputVars: string[];
    outputVars: string[];
    programSummary: string;
  }
> = {
  step1: {
    inputVars: [
      "simulationInputs.userType",
      "simulationInputs.familiarity",
      "simulationInputs.duration",
      "simulationInputs.explorationStyle",
      "simulationInputs.experienceExpectation",
      "simulationInputs.currentLat",
      "simulationInputs.currentLng",
    ],
    outputVars: [
      "normalizedUserType",
      "normalizedFamiliarity",
      "normalizedDuration",
      "explorationStyle",
      "experienceExpectation",
    ],
    programSummary:
      "入力文字列を内部カテゴリへ正規化します（ユーザータイプ/習熟度/体験時間）。未入力時は既定値を適用します。",
  },
  step2: {
    inputVars: ["normalizedDuration", "normalizedFamiliarity", "DURATION_SPOT_COUNT"],
    outputVars: [
      "targetCount",
      "mobilityConstraint",
      "minSegmentDistanceMeters",
      "maxSegmentDistanceMeters",
      "preferredSpotRanks",
      "backfillSpotRanks",
    ],
    programSummary:
      "正規化済み時間からスポット数を決め、徒歩制約（連続スポット間5m以上1km以内）と習熟度別スポットrank対象（優先/補完）を計算します。",
  },
  step3: {
    inputVars: [
      "normalizedFamiliarity",
      "normalizedDuration",
      "preferredSpotRanks",
      "backfillSpotRanks",
      "currentOrigin(lat/lng)",
      "walkingMetersPerMinute",
      "radiusReachabilityFactor",
      "extractionPolicy(all records from spot-db -> radius filter)",
      "program.step3.candidateSpotPoolIds",
      "program.step3.spotDbLinkPolicy",
      "targetCount",
    ],
    outputVars: [
      "extractedSpotDbStatus",
      "extractedSpotDbSource",
      "extractedSpotDbTotal",
      "extractedSpotDbReducedTotal",
      "extractedSpotDbFilteredOutCount",
      "maxReachableRadiusMeters",
      "extractedSpotDbRecords",
      "prefilterPoolBaseIds",
      "configuredPoolIds",
      "configuredRankExcludedPoolIds",
      "ignoredPoolIds",
      "preferredPoolIdsByRank",
      "backfillPoolIdsByRank",
      "middleCandidatesWithinRadius",
      "reducedMiddleCandidates",
      "poolBaseIds",
      "middleCandidates",
      "fallbackRouteIds",
    ],
    programSummary:
      "spot-db全件を取得し、現在地と体験時間に応じた半径で候補を削減します。削減後の候補からstep4用fallback routeを組み立てます。",
  },
  step4: {
    inputVars: [
      "normalizedUserType / normalizedFamiliarity / normalizedDuration (step1)",
      "targetCount / mobilityConstraint / minSegmentDistanceMeters / maxSegmentDistanceMeters (step2)",
      "compactInput.currentLocation + candidateSpots(id/lat/lng) + candidateDistanceMatrixMeters + baselineRoute (step3)",
    ],
    outputVars: [
      "routeIds",
      "routeReasonMap",
      "routeStoryTheme",
      "routeLegDistances",
      "mobilityNotes",
      "routeQuality",
      "routeDistanceSummary",
    ],
    programSummary:
      "step1〜3の制約とcompact候補（id/lat/lng + 距離行列）を Gemini に投入し、徒歩制約を満たすルート候補を生成。最終的にプログラム側で距離最短参照ルートと比較し、制約順守と歩行効率を保証します。",
  },
  step5: {
    inputVars: ["routeIds", "program.step5.narrativeContainerSpec", "program.step5.slotInjectionPolicy"],
    outputVars: ["routeSpots", "templateContainer", "narrativeContainerSpec", "slotInjectionPolicy"],
    programSummary:
      "確定ルートをテンプレート器（ready/prologue/spot/epilogue）の差し込みスロットへ割り当てます。",
  },
  step6: {
    inputVars: [
      "step6InsertionGeneration prompt template",
      "program.step6 world/character/arc settings",
      "routeSpots",
      "worldConfig tone/style/keywords",
    ],
    outputVars: ["narrativeResult", "generatedStoryName", "generatedSpotsCount", "step6Status"],
    programSummary:
      "運営定義の世界観・役割設定をプロンプトへ埋め込み、ルート情報を差し込んだ本文をAI生成します。",
  },
  step7: {
    inputVars: ["narrativeResult", "validationRuleSet", "fallbackPolicy", "step7MinimalRepair prompt"],
    outputVars: ["validationErrors", "repairedNarrativeResult", "step7Status"],
    programSummary:
      "生成結果を検証し、失敗箇所のみ最小再生成します。通過済みなら再生成をスキップします。",
  },
  step8: {
    inputVars: ["routeIds", "routeSpots", "sanitizedNarrative", "program.step8.*"],
    outputVars: ["finalQuest", "steps[]", "quest payload for app"],
    programSummary:
      "最終JSONをサニタイズ・統合し、アプリ配信用のクエスト出力として確定します。",
  },
};

const KYUDAI_ISHIGAHARA_PROLOGUE_BODY =
  "九州大学伊都キャンパスが建っているこの場所には、\n大学ができるよりずっと前から、人が集まり、物が行き交い、何かが作られ、残されてきた時間がある。\n\nその流れを、ひとつのファイルにまとめようとした人がいた。\n昔この地域で起きていたことを、\n今のキャンパスの場所と一枚ずつ結びつけて読めるようにするためのファイルだ。\n\nけれど、そのファイルは完成しなかった。\n途中のページが抜けたまま、最後まで読めなくなっている。\n\nあなたはこれから、澪先輩と一緒に、その抜けたページを探しに行く。\n集めるのは、ただの紙ではない。\nそれぞれのページには、昔この地域で実際に起きていたことが書かれている。\n\n外から人や物が届いていたこと。\n人が集まり、やり取りが起きていたこと。\n何かを作る営みがあったこと。\nその跡が、今まで残っていること。\n\nページを集めて最後まで読めたとき、\nただキャンパスを歩くだけでは見えない、もうひとつの九州大学が見えてくる。\n\nなぜ今、ここに九州大学伊都キャンパスがあるのか。\nその答えを読むために、石ヶ原ファイルを完成させよう。";
const KYUDAI_ISHIGAHARA_EPILOGUE_BODY =
  "石ヶ原ファイルは、ここで閉じられる。\n\nあなたが集めたページに書かれていたのは、\n昔この地域で本当に起きていたことだった。\n\n外から人や物が届いたこと。\n人が集まり、やり取りが生まれたこと。\n何かを作る営みがあったこと。\nその跡が、今まで残っていたこと。\n\n最後まで読んでわかるのは、\nそれが昔の出来事で終わっていない、ということだ。\n\n今、あなたが歩いている九州大学伊都キャンパスもまた、\nその続きの上にある。\n\nここは、何もない場所に突然できた大学ではない。\nもっと前から、人が来て、集まり、何かを生み出し、残してきた土地の、いちばん新しい形だ。\n\nだから次にこのキャンパスを歩くとき、\nあなたが見るのは、ただの建物ではない。\n\n昔から続いてきた流れの、その先にある今の九州大学だ。";

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
    heroLead: "九大センターゾーン発 観測航路",
    summaryTitle: "体験の準備が整いました",
    summaryText:
      "Center Zoneを起点に6地点を起承転結で巡る物語です。各スポットの豆知識を短いシナリオへ変換し、最後にWest Gateで全体を接続します。",
    generatedStoryLabel: "生成された物語名",
    startButton: "物語を始める",
    transitionTitle: "プロローグへ移動中",
    transitionBody: "物語の扉をひらいています",
  },
  prologue: {
    body: KYUDAI_ISHIGAHARA_PROLOGUE_BODY,
    cta: "最初の場所へ向かう",
  },
  spot: {
    mapInfoLine1: "次の視点へ進み、導線の意味を観測しましょう。",
    mapInfoLine2: "到着後に、スポットの豆知識を物語として解放します。",
    mapArrivedLabel: "このスポットに到着した",
    mapRestartLabel: "最初のスポットから始める",
    speakerBadge: "案内役",
    nextButton: "次へ",
    backToMapButton: "マップに戻る",
    finishButton: "エピローグへ",
    narratives: [
      "センターゾーンは講義棟と生活導線が重なる基点です。ここから観測を始めます。",
      "ビッグオレンジは案内・食事・待ち合わせが集まる生活拠点。再集合地点として機能します。",
      "Innovation Plazaでは学びが試作へ変わります。展示の痕跡から挑戦の文脈を拾えます。",
      "中央図書館は静かな集中と情報探索の中枢。紙と電子を横断して問いを磨きます。",
      "Research Commonsは分野横断の対話拠点。ポスター1枚から新しい接続が生まれます。",
      "West Gateで6地点を接続し、学内で得た視点を次の行動へ持ち帰ります。",
    ],
  },
  epilogue: {
    body: KYUDAI_ISHIGAHARA_EPILOGUE_BODY,
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
  objective: "入力条件で無理なく回れるルートを生成し、物語テンプレに自然に接続する。",
  audience: "新入生。キャンパスはまだ不慣れ。",
  tone: "落ち着き・知的・親しみやすい。断定しすぎない。",
  requiredElements: "テンプレの意図を維持しつつ、スポット固有情報を自然に埋め込む。",
  forbiddenElements: "誇張表現、スラング、根拠のない事実、過度な煽り。",
  fixedTextPolicy: "固定UI文言と運営定義の物語軸は変更しない。差し込み部分のみ調整する。",
  routeDesign: "15-20分は5スポット、20-30分は6スポット、30-45分は6スポットを想定。",
  additionalContext: "九州大学 伊都キャンパス。研究目的のPoCとして利用。",
  outputLanguage: "日本語",
  outputStyle: "です・ます調、簡潔、1文を短めに保つ。",
  step4RoutePrompt:
    "あなたは九州大学伊都キャンパスの徒歩ルート設計AIです。\n" +
    "目的: {userType}（習熟度: {familiarity}）に対して、{duration}で完走できる巡回ルートを設計する。\n" +
    "探索スタイル: {explorationStyle} / 体験期待: {experienceExpectation}\n" +
    "設計ルール: {routeDesign}\n" +
    "ハード制約:\n" +
    "1) requiredStartSpotId で開始する（終点は可変）\n" +
    "2) routeSpotIds は targetCount 件で重複なし\n" +
    "3) routeSpotIds は candidateSpots.id のみ使用\n" +
    "4) 全セグメントは minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下\n" +
    "最適化優先順位:\n" +
    "1) 制約順守\n" +
    "2) 総歩行距離最小化\n" +
    "3) 最長セグメント短縮\n" +
    "4) 物語進行とユーザー期待の整合\n" +
    "出力要件:\n" +
    "- routeSpotIds は候補IDのみ、重複なし\n" +
    "- routeReasonMap は routeSpotIds の全IDをキーとして埋める\n" +
    "- mobilityNotes には baselineRoute 比較結果も含める\n" +
    "出力はJSONのみ。説明文の前置きは禁止。",
  step6InsertionPrompt:
    "# Role\n" +
    "あなたは、大学回遊型クエストのシナリオライターです。運営側が決めたクエスト骨格とスポット情報をもとに、自然な短編クエストを生成してください。\n\n" +
    "# Mission\n" +
    "九州大学伊都キャンパスを舞台に、参加者が「今どこにいて、何がわかり、次にどこへ向かうか」を毎地点で理解できる体験を作ってください。\n\n" +
    "# Important Rules\n" +
    "- スポット数は入力に従う\n" +
    "- スポット名・順番・役割は入力に従う\n" +
    "- 入力されていないスポット情報を勝手に補わない\n" +
    "- 案内役は作者目線で話さない\n" +
    "- 「このクエストでは」「ここで学ぶのは」などのメタ表現は禁止\n" +
    "- 抽象語だけで済ませず、具体的に言い換える\n" +
    "- 高校生〜大学1年生でもすぐ理解できる日本語にする\n" +
    "- 1文を長くしすぎない\n" +
    "- 出力言語は {outputLanguage}\n" +
    "- トーンは {tone}\n" +
    "- 文体は {outputStyle}\n" +
    "- 必須要素: {requiredElements}\n" +
    "- 禁止要素: {forbiddenElements}\n\n" +
    "# Quest Skeleton Input\n" +
    "【クエスト名】\n{questName}\n\n" +
    "【サブタイトル】\n{questSubtitle}\n\n" +
    "【想定プレイヤー】\n{playerType}\n\n" +
    "【前提状態】\n{playerState}\n\n" +
    "【所要時間】\n{duration}\n\n" +
    "【クエスト全体テーマ】\n{questTheme}\n\n" +
    "【体験ゴール】\n{questGoal}\n\n" +
    "【体験後に持ち帰ってほしいこと】\n{takeaway}\n\n" +
    "【案内役】\n" +
    "名前: {guideName}\n" +
    "立場: {guideRole}\n" +
    "距離感: {guideDistance}\n" +
    "話し方: {guideTone}\n" +
    "知っている範囲: {guideKnows}\n" +
    "知らない範囲: {guideDoesNotKnow}\n" +
    "禁止したい話し方: {guideForbiddenStyle}\n\n" +
    "【クエスト構造】\n{questStructure}\n\n" +
    "【スポット数】\n{spotCount}\n\n" +
    "【スポット一覧】\n{spotsJson}\n\n" +
    "# Output Contract\n" +
    "出力はJSONのみ。コードブロック禁止。\n" +
    "JSON schema:\n" +
    "{\n" +
    '  "generatedStoryName": "string",\n' +
    '  "storyTone": "string",\n' +
    '  "readyHeroLead": "string",\n' +
    '  "readySummaryTitle": "string",\n' +
    '  "readySummaryText": "string",\n' +
    '  "prologueBody": "string",\n' +
    '  "epilogueBody": "string",\n' +
    '  "spots": [\n' +
    "    {\n" +
    '      "id": "string",\n' +
    '      "name": "string",\n' +
    '      "overview": "到着時の短い地の文",\n' +
    '      "rationale": "この場面の役割",\n' +
    '      "scenarioTexts": [\n' +
    '        "到着前の一言",\n' +
    '        "案内役の会話",\n' +
    '        "この地点での気づきと次スポットへの接続文"\n' +
    "      ]\n" +
    "    }\n" +
    "  ]\n" +
    "}\n" +
    "spots の順序と件数は、入力スポット一覧と完全一致させる。",
  step7RepairPrompt:
    "検証で失敗した箇所のみ最小限で修正してください。禁止要素={forbiddenElements}。固定文言ポリシー={fixedTextPolicy}。問題のないセクションは変更しない。",
  outputTargets: ["ready", "prologue", "spot", "epilogue"],
};

const INITIAL_PROGRAM_FLOW_DRAFT: ProgramFlowDraft = {
  step1: {
    normalizeUserType: "新入生/在学生/保護者/研究来訪者を内部カテゴリに正規化する。",
    normalizeFamiliarity: "習熟度を4段階に正規化し、既定値は「まだあまり慣れていない」。",
    normalizeDuration: "15-20 / 20-30 / 30-45 の3区分へ丸める。",
  },
  step2: {
    spotCountRule: "15-20分=5件, 20-30分=6件, 30-45分=6件。",
    mobilityConstraintRule: "徒歩限定。連続スポット間の移動距離は5m以上1km以内とする。",
  },
  step3: {
    candidateSelectionRule:
      "spot-db の全レコードを取得し、現在地中心の時間制約半径（duration上限分×徒歩速度×係数）で候補件数を削減する。",
    routeOrderingRule: "削減後の候補を使い、センターゾーン起点で終点可変の順序候補を組み立てる。",
    spotDbLinkPolicy:
      "spot-db は全件取得するが、Step3でプログラム制約（半径フィルタ）を適用して件数を減らす。",
    candidateSpotPoolIds: "",
  },
  step5: {
    narrativeContainerSpec: "ready/prologue/spot/epilogue のテンプレ器を固定し、差し込みスロットを明示する。",
    slotInjectionPolicy: "スポット名・見どころ・移動導線をどのスロットへ入れるかを定義する。",
  },
  step6: {
    worldSetting: "九州大学 伊都キャンパス。学びと生活が交差する世界観。",
    characterProfile:
      "案内役: 作者目線に立たず、施設の使われ方と学生目線の価値を実感ベースで伝える。落ち着いた語り口。",
    characterRole: "来訪者の不安を下げ、今どこにいて何を見るべきかを具体的に示し、次地点へ接続する。",
    storyArcFor4Spots:
      "Spot1:起点をつかむ / Spot2:戻る場所を知る / Spot3:問いを深める場所を知る / Spot4:終着点で全体をつなぐ。",
    storyArcFor5Spots:
      "Spot1:起点をつかむ / Spot2:戻る場所を知る / Spot3:挑戦が始まる場所を知る / Spot4:問いを深める場所を知る / Spot5:終着点で全体をつなぐ。",
    storyArcFor6Spots:
      "Spot1:起点をつかむ / Spot2:戻る場所を知る / Spot3:人が集まる場所を知る / Spot4:挑戦が始まる場所を知る / Spot5:問いを深める場所を知る / Spot6:終着点で全体をつなぐ。",
    conversationFlow:
      "各スポットは 1)到着前の一言 2)案内役の会話 3)気づきと次地点接続 を必ず含める。メタ発言は禁止。",
  },
  step7: {
    validationRuleSet: "出力JSON必須キー、スポット件数（最大6）、禁止語、文字数、重複率を検証する。",
    fallbackPolicy: "検証失敗時は該当スロットのみ再生成し、全体再生成は行わない。",
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
  currentLat: "33.59780",
  currentLng: "130.22040",
};

const STEP4_PREVIEW_REQUIRED_START_SPOT_ID = "center-zone";
const STEP4_PREVIEW_MIN_SEGMENT_DISTANCE_METERS = 5;
const STEP4_PREVIEW_MAX_SEGMENT_DISTANCE_METERS = 1000;
const STEP4_PREVIEW_WALKING_METERS_PER_MINUTE = 67;
const STEP4_PREVIEW_RADIUS_REACHABILITY_FACTOR = 0.6;
const STEP4_PREVIEW_SPOT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "center-zone": { lat: 33.5978, lng: 130.2204 },
  "big-orange": { lat: 33.59895, lng: 130.2169 },
  "innovation-plaza": { lat: 33.59735, lng: 130.2192 },
  "central-library": { lat: 33.5961, lng: 130.2184 },
  "research-commons": { lat: 33.59645, lng: 130.2171 },
  "west-gate": { lat: 33.5952, lng: 130.2159 },
};

function distanceMetersBetweenCoordinates(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const latProduct = Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat));
  const haversine = sinLat * sinLat + latProduct * sinLng * sinLng;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

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
  const spotCount = duration.includes("15") ? 5 : 6;

  const readyHeroLead = "九大センターゾーン発 観測航路";
  const readySummaryTitle = `${userType}向け${spotCount}スポット構成を生成しました`;
  const readySummaryText = `${familiarity}の来訪者向けに、${objective}を満たす${spotCount}地点の導線を構成しました。${requiredElements}を守りつつ、${tone}で起承転結を案内します。設計ルール: ${programFlowDraft.step2.spotCountRule}`;
  const prologueBody = KYUDAI_ISHIGAHARA_PROLOGUE_BODY;
  const epilogueBody = KYUDAI_ISHIGAHARA_EPILOGUE_BODY;

  const stageLabels = ["起", "承", "承", "転", "転", "結"];
  const spotNarratives = Array.from({ length: 6 }, (_, index) => {
    const fallback = fallbackSpotNarratives[index] || `スポット${index + 1}です。`;
    if (index < spotCount) {
      return `${stageLabels[index] ?? `段階${index + 1}`}の地点です。${fallback} ${explorationStyle}を保ちながら、${experienceExpectation}につながる手がかりを拾ってください。`;
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

function parseLineSeparatedIds(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
      .filter((item) => item.length > 0),
    ),
  );
}

function resolveDurationUpperMinutes(duration: string): number {
  if (duration.includes("15")) return 20;
  if (duration.includes("45")) return 45;
  return 30;
}

function resolveStep4TargetCount(duration: string): number {
  if (duration.includes("15")) return 5;
  return 6;
}

function parsePreviewCoordinate(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildStep4PreviewCompactInput(
  previewInputs: PreviewSimulationInputs,
  programFlowDraft: ProgramFlowDraft,
): Record<string, unknown> {
  const currentLat = parsePreviewCoordinate(previewInputs.currentLat, DEFAULT_SPOT_DB_MAP_CENTER.lat);
  const currentLng = parsePreviewCoordinate(previewInputs.currentLng, DEFAULT_SPOT_DB_MAP_CENTER.lng);
  const durationUpperMinutes = resolveDurationUpperMinutes(previewInputs.duration);
  const targetCount = resolveStep4TargetCount(previewInputs.duration);
  const maxReachableRadiusMeters =
    durationUpperMinutes *
    STEP4_PREVIEW_WALKING_METERS_PER_MINUTE *
    STEP4_PREVIEW_RADIUS_REACHABILITY_FACTOR;

  const configuredCandidateSpotPoolIds = parseLineSeparatedIds(programFlowDraft.step3.candidateSpotPoolIds);
  const previewFallbackPoolIds =
    configuredCandidateSpotPoolIds.length > 0
      ? configuredCandidateSpotPoolIds
      : Object.keys(STEP4_PREVIEW_SPOT_COORDINATES);
  const candidateSpotPoolIds = Array.from(
    new Set([
      STEP4_PREVIEW_REQUIRED_START_SPOT_ID,
      ...previewFallbackPoolIds,
    ]),
  );

  const candidateSpots = candidateSpotPoolIds.map((id) => {
    const coordinate = STEP4_PREVIEW_SPOT_COORDINATES[id];
    return {
      id,
      lat: coordinate?.lat ?? null,
      lng: coordinate?.lng ?? null,
    };
  });
  const coordinateReadyCandidateSpots = candidateSpots.filter(
    (spot): spot is { id: string; lat: number; lng: number } =>
      typeof spot.lat === "number" && typeof spot.lng === "number",
  );
  const candidateDistanceMatrixMeters = coordinateReadyCandidateSpots.flatMap((from) =>
    coordinateReadyCandidateSpots
      .filter((to) => to.id !== from.id)
      .map((to) => ({
        fromId: from.id,
        toId: to.id,
        distanceMeters: Math.round(
          distanceMetersBetweenCoordinates(
            { lat: from.lat, lng: from.lng },
            { lat: to.lat, lng: to.lng },
          ),
        ),
      })),
  );
  const baselineMiddleTarget = Math.max(0, targetCount - 1);
  const baselineMiddleIds = candidateSpotPoolIds
    .filter((id) => id !== STEP4_PREVIEW_REQUIRED_START_SPOT_ID)
    .slice(0, baselineMiddleTarget);
  const baselineRouteIds = [
    STEP4_PREVIEW_REQUIRED_START_SPOT_ID,
    ...baselineMiddleIds,
  ];
  const baselineLegDistances = baselineRouteIds.slice(0, -1).map((fromId, index) => {
    const toId = baselineRouteIds[index + 1];
    const from = STEP4_PREVIEW_SPOT_COORDINATES[fromId];
    const to = STEP4_PREVIEW_SPOT_COORDINATES[toId];
    if (!from || !to) {
      return {
        fromId,
        toId,
        distanceMeters: null,
      };
    }
    return {
      fromId,
      toId,
      distanceMeters: Math.round(
        distanceMetersBetweenCoordinates(
          { lat: from.lat, lng: from.lng },
          { lat: to.lat, lng: to.lng },
        ),
      ),
    };
  });
  const baselineTotalDistanceMeters = baselineLegDistances.reduce(
    (sum, leg) => sum + (typeof leg.distanceMeters === "number" ? leg.distanceMeters : 0),
    0,
  );
  const baselineUnknownSegments = baselineLegDistances.filter(
    (leg) => typeof leg.distanceMeters !== "number",
  ).length;

  return {
    currentLocation: {
      lat: currentLat,
      lng: currentLng,
    },
    travelMode: "walking",
    userType: previewInputs.userType,
    familiarity: previewInputs.familiarity,
    duration: previewInputs.duration,
    explorationStyle: previewInputs.explorationStyle,
    experienceExpectation: previewInputs.experienceExpectation,
    targetCount,
    maxReachableRadiusMeters: Math.round(maxReachableRadiusMeters),
    minSegmentDistanceMeters: STEP4_PREVIEW_MIN_SEGMENT_DISTANCE_METERS,
    maxSegmentDistanceMeters: STEP4_PREVIEW_MAX_SEGMENT_DISTANCE_METERS,
    requiredStartSpotId: STEP4_PREVIEW_REQUIRED_START_SPOT_ID,
    candidateSpots,
    candidateDistanceMatrixMeters,
    baselineRoute: {
      routeIds: baselineRouteIds,
      totalDistanceMeters: baselineTotalDistanceMeters,
      legDistances: baselineLegDistances,
      unknownSegmentCount: baselineUnknownSegments,
    },
  };
}

function sanitizeStepOutputPreview(
  stepId: QuestGenerationStepId,
  outputVars: Record<string, unknown>,
): Record<string, unknown> {
  if (stepId !== "step4") return outputVars;

  const routeIds = Array.isArray(outputVars.routeIds)
    ? outputVars.routeIds
    : Array.isArray(outputVars.routeSpotIds)
      ? outputVars.routeSpotIds
      : [];
  const routeLegDistances = Array.isArray(outputVars.routeLegDistances)
    ? outputVars.routeLegDistances
    : [];
  const routeReasonMap = isRecord(outputVars.routeReasonMap)
    ? outputVars.routeReasonMap
    : isRecord(outputVars.reasonBySpotId)
      ? outputVars.reasonBySpotId
      : {};
  const routeQuality = isRecord(outputVars.routeQuality)
    ? outputVars.routeQuality
    : {};
  const routeDistanceSummary = isRecord(outputVars.routeDistanceSummary)
    ? outputVars.routeDistanceSummary
    : {};

  return {
    routeIds,
    routeStoryTheme:
      typeof outputVars.routeStoryTheme === "string" ? outputVars.routeStoryTheme : "",
    routeReasonMap,
    routeLegDistances,
    mobilityNotes:
      typeof outputVars.mobilityNotes === "string" ? outputVars.mobilityNotes : "",
    routeQuality,
    routeDistanceSummary,
  };
}

function normalizeStep4RoutePrompt(value: unknown): string {
  if (typeof value !== "string") return INITIAL_AI_PROMPT_DRAFT.step4RoutePrompt;
  const trimmed = value.trim();
  if (trimmed.length === 0) return INITIAL_AI_PROMPT_DRAFT.step4RoutePrompt;

  const looksLegacyOutlinePrompt =
    /(体験の骨子|骨子を作成|ready|prologue|epilogue|本文を作成)/i.test(trimmed) &&
    !/(巡回ルート|ルート最適化|route)/i.test(trimmed);

  return looksLegacyOutlinePrompt ? INITIAL_AI_PROMPT_DRAFT.step4RoutePrompt : trimmed;
}

function applyPromptTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key) => vars[key] ?? "");
}

function buildStepAiPromptPreview(params: {
  stepId: QuestGenerationStepId;
  previewInputs: PreviewSimulationInputs;
  aiPromptDraft: AIPromptDraft;
  programFlowDraft: ProgramFlowDraft;
}): StepAiPromptView | null {
  const { stepId, previewInputs, aiPromptDraft, programFlowDraft } = params;

  if (stepId === "step4") {
    const step4PromptTemplate = normalizeStep4RoutePrompt(aiPromptDraft.step4RoutePrompt);
    const step4PromptResolved = applyPromptTemplate(step4PromptTemplate, {
      userType: previewInputs.userType,
      familiarity: previewInputs.familiarity,
      duration: previewInputs.duration,
      explorationStyle: previewInputs.explorationStyle,
      experienceExpectation: previewInputs.experienceExpectation,
      routeDesign: aiPromptDraft.routeDesign,
    });
    return {
      provider: "gemini",
      model: "server:GEMINI_ROUTE_MODEL",
      temperature: 0.2,
      systemPrompt:
        "あなたは徒歩ルート最適化担当です。出力は必ずJSONのみ。入力JSON以外の情報は使用禁止。" +
        "routeSpotIds は candidateSpots の id のみ使用可能。requiredStartSpotId から開始すること（終点は可変）。" +
        "travelMode=walking のため、連続スポット間は minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下を守ること。" +
        "まずハード制約を満たし、次に total walking distance 最小化を行うこと。",
      userPrompt:
        `${step4PromptResolved}\n\n` +
        "以下の compact input を使ってルートを設計してください。\n" +
        "compact_input=<step3出力 compactInput を実行時に注入>\n" +
        "制約メモ: targetCount=<step2出力>, mobilityConstraint=<step2出力>\n\n" +
        "最適化手順:\n" +
        "1) requiredStartSpotId から開始（終点は可変）\n" +
        "2) routeSpotIds は targetCount 件、重複なし\n" +
        "3) candidateDistanceMatrixMeters で全セグメントが minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下の経路のみ残す\n" +
        "4) 残った経路のうち総歩行距離(totalDistance)が最小の経路を選ぶ\n" +
        "5) 同点なら最長セグメントが短い経路を優先\n" +
        "6) baselineRoute.totalDistanceMeters より悪化する場合は mobilityNotes へ理由を記載\n" +
        "7) routeSpotIds の全IDに routeReasonMap を付与\n\n" +
        "JSON schema:\n" +
        "{\n" +
        '  "routeSpotIds": ["center-zone", "..."],\n' +
        '  "routeStoryTheme": "文字列",\n' +
        '  "routeReasonMap": {"spotId": "その地点を採用した理由"},\n' +
        '  "mobilityNotes": "制約順守に関する短い注記"\n' +
        "}\n" +
        "注意: 必ずJSONのみを返すこと。コードブロック禁止。",
    };
  }

  if (stepId === "step6") {
    const step6SpotCount = previewInputs.duration.includes("15") ? "5" : "6";
    const step6QuestName = `${previewInputs.userType}の伊都キャンパスクエスト`;
    const step6QuestSubtitle = `${previewInputs.duration}で巡る伊都キャンパス回遊`;
    const step6QuestTheme = aiPromptDraft.objective;
    const step6QuestGoal = aiPromptDraft.routeDesign;
    const step6Takeaway = aiPromptDraft.requiredElements;
    const step6GuideName = "澪先輩";
    const step6GuideRole = "伊都キャンパスを案内する先輩";
    const step6GuideDistance = "近すぎず、必要なときに背中を押す距離";
    const step6GuideTone = aiPromptDraft.tone;
    const step6GuideKnows = "施設の使われ方、学生目線での価値、ルートの意図";
    const step6GuideDoesNotKnow = "制作裏話、プレイヤーの内心、過剰な断定";
    const step6GuideForbiddenStyle = "メタ発言、抽象論だけの説明、説明くさすぎる語り";
    const step6QuestStructure = "序盤: 起点をつかむ / 中盤: 戻る場所・挑戦・深める場を回収 / 終盤: 終着点で全体をつなぐ";
    const step6SpotsJson = "[step5出力: spot_id, spot_name, spot_order, spot_role, facility_summary, why_selected, what_player_should_notice, transition_to_next, optional_notes]";
    const step6PromptResolved = applyPromptTemplate(aiPromptDraft.step6InsertionPrompt, {
      objective: aiPromptDraft.objective,
      audience: aiPromptDraft.audience,
      additionalContext: aiPromptDraft.additionalContext,
      requiredElements: aiPromptDraft.requiredElements,
      tone: aiPromptDraft.tone,
      outputStyle: aiPromptDraft.outputStyle,
      outputLanguage: aiPromptDraft.outputLanguage,
      fixedTextPolicy: aiPromptDraft.fixedTextPolicy,
      forbiddenElements: aiPromptDraft.forbiddenElements,
      worldSetting: programFlowDraft.step6.worldSetting,
      characterProfile: programFlowDraft.step6.characterProfile,
      characterRole: programFlowDraft.step6.characterRole,
      storyArcFor4Spots: programFlowDraft.step6.storyArcFor4Spots,
      storyArcFor5Spots: programFlowDraft.step6.storyArcFor5Spots,
      storyArcFor6Spots: programFlowDraft.step6.storyArcFor6Spots,
      conversationFlow: programFlowDraft.step6.conversationFlow,
      questName: step6QuestName,
      questSubtitle: step6QuestSubtitle,
      playerType: previewInputs.userType,
      playerState: previewInputs.familiarity,
      duration: previewInputs.duration,
      questTheme: step6QuestTheme,
      questGoal: step6QuestGoal,
      takeaway: step6Takeaway,
      guideName: step6GuideName,
      guideRole: step6GuideRole,
      guideDistance: step6GuideDistance,
      guideTone: step6GuideTone,
      guideKnows: step6GuideKnows,
      guideDoesNotKnow: step6GuideDoesNotKnow,
      guideForbiddenStyle: step6GuideForbiddenStyle,
      questStructure: step6QuestStructure,
      spotCount: step6SpotCount,
      spotsJson: step6SpotsJson,
    });
    return {
      provider: "openai",
      model: "server:OPENAI_MODEL",
      temperature: 0.45,
      systemPrompt:
        "あなたは観光/キャンパス案内の日本語ライターです。出力はJSONのみ。spots は routeSpotIds と同じ順序・同じ件数で返し、scenarioTextsは3要素固定で返す。",
      userPrompt:
        `${step6PromptResolved}\n\n` +
        `ユーザー条件: userType=${previewInputs.userType}, familiarity=${previewInputs.familiarity}, duration=${previewInputs.duration}, explorationStyle=${previewInputs.explorationStyle}, expectation=${previewInputs.experienceExpectation}\n` +
        "ルートテーマ: <step4出力 routeStoryTheme>\n" +
        "運営設定: objective/audience/additionalContext/fixedTextPolicy を実行時に注入\n" +
        "ルートID順: <step4出力 routeIds>\n" +
        "ルート詳細: <step5出力 routeSpotKnowledge + routeSpots>\n" +
        'JSON schema: {"generatedStoryName":string,"storyTone":string,"readyHeroLead":string,"readySummaryTitle":string,"readySummaryText":string,"prologueBody":string,"epilogueBody":string,"spots":[{"id":string,"name":string,"overview":string,"rationale":string,"scenarioTexts":["到着前の一言","案内役の会話","気づきと次スポット接続"]}]}',
    };
  }

  if (stepId === "step7") {
    const step7PromptResolved = applyPromptTemplate(aiPromptDraft.step7RepairPrompt, {
      forbiddenElements: aiPromptDraft.forbiddenElements,
      fixedTextPolicy: aiPromptDraft.fixedTextPolicy,
    });
    return {
      provider: "openai",
      model: "server:OPENAI_MODEL",
      temperature: 0.1,
      systemPrompt: "あなたは検証修正担当です。必ずJSONのみを返し、指摘項目だけ最小修正してください。",
      userPrompt:
        `${step7PromptResolved}\n\n` +
        "エラー: <step7実行時の validationErrors>\n" +
        "routeIds: <step4出力 routeIds>\n" +
        "currentPayload: <step6生成 payload>",
    };
  }

  return null;
}

function buildStepInputPreview(
  stepId: QuestGenerationStepId,
  previewInputs: PreviewSimulationInputs,
  aiPromptDraft: AIPromptDraft,
  programFlowDraft: ProgramFlowDraft,
): Record<string, unknown> {
  if (stepId === "step1") {
    return {
      simulationInputs: previewInputs,
    };
  }
  if (stepId === "step2") {
    return {
      normalizedSourceInputs: {
        userType: previewInputs.userType,
        familiarity: previewInputs.familiarity,
        duration: previewInputs.duration,
        currentLat: previewInputs.currentLat,
        currentLng: previewInputs.currentLng,
      },
      rules: programFlowDraft.step2,
    };
  }
  if (stepId === "step3") {
    return {
      familiarity: previewInputs.familiarity,
      currentOrigin: {
        lat: previewInputs.currentLat,
        lng: previewInputs.currentLng,
      },
      rules: {
        candidateSelectionRule: programFlowDraft.step3.candidateSelectionRule,
        routeOrderingRule: programFlowDraft.step3.routeOrderingRule,
        spotDbLinkPolicy: programFlowDraft.step3.spotDbLinkPolicy,
        candidateSpotPoolIds: parseLineSeparatedIds(programFlowDraft.step3.candidateSpotPoolIds),
      },
    };
  }
  if (stepId === "step4") {
    const step4CompactInputPreview = buildStep4PreviewCompactInput(previewInputs, programFlowDraft);
    return {
      normalizedInputsFromStep1: {
        userType: previewInputs.userType,
        familiarity: previewInputs.familiarity,
        duration: previewInputs.duration,
      },
      constraintsFromStep2: {
        targetCount: resolveStep4TargetCount(previewInputs.duration),
        mobilityConstraintRule: programFlowDraft.step2.mobilityConstraintRule,
        minSegmentDistanceMeters: STEP4_PREVIEW_MIN_SEGMENT_DISTANCE_METERS,
        maxSegmentDistanceMeters: STEP4_PREVIEW_MAX_SEGMENT_DISTANCE_METERS,
      },
      compactInputFromStep3: step4CompactInputPreview,
    };
  }
  if (stepId === "step5") {
    return {
      routeInputs: {
        duration: previewInputs.duration,
        familiarity: previewInputs.familiarity,
      },
      rules: programFlowDraft.step5,
    };
  }
  if (stepId === "step6") {
    return {
      simulationInputs: previewInputs,
      objective: aiPromptDraft.objective,
      tone: aiPromptDraft.tone,
      outputStyle: aiPromptDraft.outputStyle,
      step6PromptTemplate: aiPromptDraft.step6InsertionPrompt,
      worldConfig: programFlowDraft.step6,
    };
  }
  if (stepId === "step7") {
    return {
      step7PromptTemplate: aiPromptDraft.step7RepairPrompt,
      rules: programFlowDraft.step7,
    };
  }
  return {
    rules: programFlowDraft.step8,
    outputTargets: aiPromptDraft.outputTargets,
  };
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
      parsed.activeWorkspaceMode === "ai"
        ? "ai"
        : parsed.activeWorkspaceMode === "spotdb"
          ? "spotdb"
          : "cms";
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
          const persistedAiPrompt = parsed.aiPromptDraft as Record<string, unknown>;
          const migratedAiPrompt: Record<string, unknown> = { ...persistedAiPrompt };
          if (
            typeof migratedAiPrompt.step4RoutePrompt !== "string" &&
            typeof persistedAiPrompt.step4OutlinePrompt === "string"
          ) {
            migratedAiPrompt.step4RoutePrompt = persistedAiPrompt.step4OutlinePrompt;
          }
          if (
            typeof migratedAiPrompt.step6InsertionPrompt !== "string" &&
            typeof persistedAiPrompt.step5NarrativePrompt === "string"
          ) {
            migratedAiPrompt.step6InsertionPrompt = persistedAiPrompt.step5NarrativePrompt;
          }

          const mergedPrompt = {
            ...INITIAL_AI_PROMPT_DRAFT,
            ...(migratedAiPrompt as Partial<AIPromptDraft>),
          };
          const persistedTargets = migratedAiPrompt.outputTargets;
          return {
            ...mergedPrompt,
            step4RoutePrompt: normalizeStep4RoutePrompt(mergedPrompt.step4RoutePrompt),
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
          const persistedStep5 = isRecord(persistedProgramFlow.step5) ? persistedProgramFlow.step5 : {};
          const persistedStep6 = isRecord(persistedProgramFlow.step6) ? persistedProgramFlow.step6 : {};
          const persistedStep7 = isRecord(persistedProgramFlow.step7) ? persistedProgramFlow.step7 : {};
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
              spotCountRule:
                typeof persistedStep2.spotCountRule === "string"
                  ? persistedStep2.spotCountRule
                  : typeof persistedStep2.spotCountLogic === "string"
                    ? persistedStep2.spotCountLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step2.spotCountRule,
              mobilityConstraintRule:
                typeof persistedStep2.mobilityConstraintRule === "string"
                  ? persistedStep2.mobilityConstraintRule
                  : typeof persistedStep2.difficultyLogic === "string"
                    ? persistedStep2.difficultyLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step2.mobilityConstraintRule,
            },
            step3: {
              candidateSelectionRule:
                typeof persistedStep3.candidateSelectionRule === "string"
                  ? persistedStep3.candidateSelectionRule
                  : typeof persistedStep3.spotSelectionLogic === "string"
                    ? persistedStep3.spotSelectionLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step3.candidateSelectionRule,
              routeOrderingRule:
                typeof persistedStep3.routeOrderingRule === "string"
                  ? persistedStep3.routeOrderingRule
                  : typeof persistedStep3.routeOrderingLogic === "string"
                    ? persistedStep3.routeOrderingLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step3.routeOrderingRule,
              spotDbLinkPolicy:
                typeof persistedStep3.spotDbLinkPolicy === "string"
                  ? persistedStep3.spotDbLinkPolicy
                  : INITIAL_PROGRAM_FLOW_DRAFT.step3.spotDbLinkPolicy,
              candidateSpotPoolIds:
                typeof persistedStep3.candidateSpotPoolIds === "string"
                  ? persistedStep3.candidateSpotPoolIds
                  : INITIAL_PROGRAM_FLOW_DRAFT.step3.candidateSpotPoolIds,
            },
            step5: {
              narrativeContainerSpec:
                typeof persistedStep5.narrativeContainerSpec === "string"
                  ? persistedStep5.narrativeContainerSpec
                  : INITIAL_PROGRAM_FLOW_DRAFT.step5.narrativeContainerSpec,
              slotInjectionPolicy:
                typeof persistedStep5.slotInjectionPolicy === "string"
                  ? persistedStep5.slotInjectionPolicy
                  : INITIAL_PROGRAM_FLOW_DRAFT.step5.slotInjectionPolicy,
            },
            step6: {
              worldSetting:
                typeof persistedStep6.worldSetting === "string"
                  ? persistedStep6.worldSetting
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.worldSetting,
              characterProfile:
                typeof persistedStep6.characterProfile === "string"
                  ? persistedStep6.characterProfile
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.characterProfile,
              characterRole:
                typeof persistedStep6.characterRole === "string"
                  ? persistedStep6.characterRole
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.characterRole,
              storyArcFor4Spots:
                typeof persistedStep6.storyArcFor4Spots === "string"
                  ? persistedStep6.storyArcFor4Spots
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.storyArcFor4Spots,
              storyArcFor5Spots:
                typeof persistedStep6.storyArcFor5Spots === "string"
                  ? persistedStep6.storyArcFor5Spots
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.storyArcFor5Spots,
              storyArcFor6Spots:
                typeof persistedStep6.storyArcFor6Spots === "string"
                  ? persistedStep6.storyArcFor6Spots
                  : INITIAL_PROGRAM_FLOW_DRAFT.step6.storyArcFor6Spots,
              conversationFlow:
                typeof persistedStep6.conversationFlow === "string"
                  ? persistedStep6.conversationFlow
                  : typeof persistedStep6.textValidationLogic === "string"
                    ? persistedStep6.textValidationLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step6.conversationFlow,
            },
            step7: {
              validationRuleSet:
                typeof persistedStep7.validationRuleSet === "string"
                  ? persistedStep7.validationRuleSet
                  : typeof persistedStep6.jsonValidationLogic === "string"
                    ? persistedStep6.jsonValidationLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step7.validationRuleSet,
              fallbackPolicy:
                typeof persistedStep7.fallbackPolicy === "string"
                  ? persistedStep7.fallbackPolicy
                  : typeof persistedStep6.textValidationLogic === "string"
                    ? persistedStep6.textValidationLogic
                    : INITIAL_PROGRAM_FLOW_DRAFT.step7.fallbackPolicy,
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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  rows?: number;
  helper?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold tracking-wider text-[#2d3432]">{label}</label>
      <textarea
        className={[
          "w-full resize-none rounded-xl border p-4 text-[14px] leading-[1.6] text-[#2d3432] shadow-sm transition-colors focus:outline-none",
          readOnly
            ? "border-[#d5ddd9] bg-[#f4f7f5] text-[#3e4a46]"
            : "border-[#dee4e0] bg-white focus:border-[#f5ce53] focus:ring-1 focus:ring-[#f5ce53]",
        ].join(" ")}
        rows={rows}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
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
  const [aiWorkspacePaneMode] = useState<AIWorkspacePaneMode>(persistedSettings?.aiWorkspacePaneMode ?? "prompt");
  const [activeQuestGenerationStep, setActiveQuestGenerationStep] = useState<QuestGenerationStepId>(
    persistedSettings?.activeQuestGenerationStep ?? "step1",
  );
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>(persistedSettings?.activeEditorTab ?? "landing");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(persistedSettings?.deviceMode ?? "mobile");
  const [textDraft, setTextDraft] = useState<TextDraft>(persistedSettings?.textDraft ?? INITIAL_TEXT_DRAFT);
  const [aiPromptDraft] = useState<AIPromptDraft>(persistedSettings?.aiPromptDraft ?? INITIAL_AI_PROMPT_DRAFT);
  const [programFlowDraft] = useState<ProgramFlowDraft>(
    persistedSettings?.programFlowDraft ?? INITIAL_PROGRAM_FLOW_DRAFT,
  );
  const [previewSimulationInputs, setPreviewSimulationInputs] = useState<PreviewSimulationInputs>(
    DEFAULT_PREVIEW_SIMULATION_INPUTS,
  );
  const [stepSimulationStates, setStepSimulationStates] = useState<
    Partial<Record<QuestGenerationStepId, StepSimulationState>>
  >({});
  const [simulatingStepId, setSimulatingStepId] = useState<QuestGenerationStepId | null>(null);
  const [simulationModalStepId, setSimulationModalStepId] = useState<QuestGenerationStepId | null>(null);
  const [simulationVisibleStepCount, setSimulationVisibleStepCount] = useState(1);
  const [simulationCompletedStepCount, setSimulationCompletedStepCount] = useState(0);

  const [previewScreen, setPreviewScreen] = useState<PreviewScreen | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [spotDbData, setSpotDbData] = useState<SpotDbApiResponse | null>(null);
  const [spotDbLoading, setSpotDbLoading] = useState(false);
  const [spotDbError, setSpotDbError] = useState<string | null>(null);
  const [spotDbMapReady, setSpotDbMapReady] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const spotDbMapContainerRef = useRef<HTMLDivElement | null>(null);
  const spotDbMapRef = useRef<GoogleMapInstance | null>(null);
  const spotDbMarkersRef = useRef<GoogleMarkerInstance[]>([]);
  const previewAppUrl = process.env.NEXT_PUBLIC_KYUDAI_PREVIEW_URL ?? "http://localhost:8082/";

  const previewOrigin = useMemo(() => {
    try {
      return new URL(previewAppUrl).origin;
    } catch {
      return "*";
    }
  }, [previewAppUrl]);

  const clearSpotDbMarkers = useCallback(() => {
    spotDbMarkersRef.current.forEach((marker) => marker.setMap(null));
    spotDbMarkersRef.current = [];
  }, []);

  const fetchSpotDbData = useCallback(async () => {
    setSpotDbLoading(true);
    setSpotDbError(null);
    try {
      const response = await fetch("/api/spot-db", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("スポットDBの取得に失敗しました。");
      }
      const payload = (await response.json()) as Partial<SpotDbApiResponse>;
      const normalizedSpots = Array.isArray(payload.spots)
        ? payload.spots.filter(
            (spot): spot is SpotDbRecord =>
              Boolean(
                spot &&
                  typeof spot.id === "string" &&
                  typeof spot.name === "string" &&
                  typeof spot.lat === "number" &&
                  Number.isFinite(spot.lat) &&
                  typeof spot.lng === "number" &&
                  Number.isFinite(spot.lng),
              ),
          )
        : [];

      setSpotDbData({
        generatedAt: typeof payload.generatedAt === "string" ? payload.generatedAt : null,
        totalSpots:
          typeof payload.totalSpots === "number" && Number.isFinite(payload.totalSpots)
            ? payload.totalSpots
            : normalizedSpots.length,
        spots: normalizedSpots,
      });
    } catch {
      setSpotDbError("スポットDBを読み込めませんでした。しばらくして再試行してください。");
    } finally {
      setSpotDbLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeWorkspaceMode !== "spotdb") return;
    if (spotDbData || spotDbLoading || spotDbError) return;
    void fetchSpotDbData();
  }, [activeWorkspaceMode, fetchSpotDbData, spotDbData, spotDbLoading, spotDbError]);

  useEffect(() => {
    if (activeWorkspaceMode !== "spotdb") return;
    if (!spotDbData?.spots.length) {
      setSpotDbMapReady(false);
      clearSpotDbMarkers();
      return;
    }
    if (!GOOGLE_MAPS_API_KEY || !spotDbMapContainerRef.current) {
      setSpotDbMapReady(false);
      return;
    }

    let isDisposed = false;
    setSpotDbMapReady(false);
    void loadSettingsGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (isDisposed || !spotDbMapContainerRef.current) return;
        const mapsWindow = window as GoogleMapsWindow;
        const MapCtor = mapsWindow.google?.maps?.Map;
        const MarkerCtor = mapsWindow.google?.maps?.Marker;
        const LatLngBoundsCtor = mapsWindow.google?.maps?.LatLngBounds;
        if (!MapCtor || !MarkerCtor || !LatLngBoundsCtor) {
          throw new Error("Google Maps script loaded without required APIs.");
        }

        if (!spotDbMapRef.current) {
          spotDbMapRef.current = new MapCtor(spotDbMapContainerRef.current, {
            center: DEFAULT_SPOT_DB_MAP_CENTER,
            zoom: DEFAULT_SPOT_DB_MAP_ZOOM,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "cooperative",
            keyboardShortcuts: false,
          });
        }

        const map = spotDbMapRef.current;
        clearSpotDbMarkers();
        const bounds = new LatLngBoundsCtor();
        const duplicatePositionCount = new Map<string, number>();
        const jitterBase = 0.00008;
        const jitterMaxPerRing = 6;

        spotDbData.spots.forEach((spot) => {
          const key = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
          const currentIndex = duplicatePositionCount.get(key) ?? 0;
          duplicatePositionCount.set(key, currentIndex + 1);

          let markerPosition = { lat: spot.lat, lng: spot.lng };
          if (currentIndex > 0) {
            const ring = Math.floor((currentIndex - 1) / jitterMaxPerRing) + 1;
            const angle =
              ((currentIndex - 1) % jitterMaxPerRing) * ((Math.PI * 2) / jitterMaxPerRing);
            const distance = jitterBase * ring;
            markerPosition = {
              lat: spot.lat + Math.sin(angle) * distance,
              lng: spot.lng + Math.cos(angle) * distance,
            };
          }

          const marker = new MarkerCtor({
            position: markerPosition,
            map,
            title: spot.name,
          });
          spotDbMarkersRef.current.push(marker);
          bounds.extend(markerPosition);
        });

        if (spotDbData.spots.length === 1) {
          const onlySpot = spotDbData.spots[0];
          map.setCenter({ lat: onlySpot.lat, lng: onlySpot.lng });
          map.setZoom(16);
        } else {
          map.fitBounds(bounds, 40);
        }

        if (!isDisposed) {
          setSpotDbMapReady(true);
        }
      })
      .catch(() => {
        if (!isDisposed) {
          setSpotDbError("地図の読み込みに失敗しました。APIキー設定を確認してください。");
        }
      });

    return () => {
      isDisposed = true;
    };
  }, [activeWorkspaceMode, clearSpotDbMarkers, spotDbData]);

  useEffect(() => {
    return () => {
      clearSpotDbMarkers();
    };
  }, [clearSpotDbMarkers]);

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
      title: aiPromptDraft.objective.trim(),
      description: aiPromptDraft.additionalContext.trim(),
      audience: aiPromptDraft.audience.trim(),
      tone: aiPromptDraft.tone.trim(),
      styleRules: aiPromptDraft.outputStyle.trim(),
      outputLanguage: aiPromptDraft.outputLanguage.trim(),
      routeDesign: aiPromptDraft.routeDesign.trim(),
      fixedTextPolicy: aiPromptDraft.fixedTextPolicy.trim(),
      requiredKeywords: parseLineSeparatedIds(aiPromptDraft.requiredElements),
      blockedKeywords: parseLineSeparatedIds(aiPromptDraft.forbiddenElements),
      questGenerationConfig: {
        program: programFlowDraft,
        aiPrompts: {
          step4RouteOptimization: aiPromptDraft.step4RoutePrompt,
          step6InsertionGeneration: aiPromptDraft.step6InsertionPrompt,
          step7MinimalRepair: aiPromptDraft.step7RepairPrompt,
        },
      },
    }),
    [textDraft, programFlowDraft, aiPromptDraft],
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
  }, [worldConfigPayload, simulatedStoryPayload]);

  const effectivePreviewPayload =
    activeWorkspaceMode === "ai" && aiWorkspacePaneMode === "simulation"
      ? aiSimulationWorldConfigPayload
      : worldConfigPayload;

  const postWorldConfigToPreview = useCallback(() => {
    const frameWindow = previewFrameRef.current?.contentWindow;
    if (!frameWindow) return;
    try {
      frameWindow.postMessage(
        {
          source: "tomoshibi-admin-console",
          type: "tomoshibi-world-config:update",
          payload: effectivePreviewPayload,
        },
        "*",
      );
    } catch (error) {
      console.warn("[settings-preview] world-config postMessage skipped", {
        previewOrigin,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
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

      if (message.source !== "tomoshibi-master-mvp") return;
      if (message.type === "tomoshibi-mobile:debug-log") {
        const payload = isRecord(message.payload) ? message.payload : null;
        const event = payload && typeof payload.event === "string" ? payload.event : "unknown";
        const emittedAt = payload && typeof payload.emittedAt === "string" ? payload.emittedAt : null;
        const debugData = payload && isRecord(payload.data) ? payload.data : payload;
        console.info(`[kyudai-preview-debug] ${event}`, {
          emittedAt,
          payload: debugData,
        });
        return;
      }
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
          currentLat:
            typeof simulationInputs.currentLat === "string"
              ? simulationInputs.currentLat
              : typeof simulationInputs.currentLat === "number"
                ? String(simulationInputs.currentLat)
              : prev.currentLat,
          currentLng:
            typeof simulationInputs.currentLng === "string"
              ? simulationInputs.currentLng
              : typeof simulationInputs.currentLng === "number"
                ? String(simulationInputs.currentLng)
              : prev.currentLng,
        };

        if (
          next.userType === prev.userType &&
          next.familiarity === prev.familiarity &&
          next.duration === prev.duration &&
          next.explorationStyle === prev.explorationStyle &&
          next.experienceExpectation === prev.experienceExpectation &&
          next.currentLat === prev.currentLat &&
          next.currentLng === prev.currentLng
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
      try {
        frameWindow.postMessage(
          {
            source: "tomoshibi-admin-console",
            type: "tomoshibi-navigation:step",
            payload: { direction },
          },
          "*",
        );
      } catch (error) {
        console.warn("[settings-preview] navigation postMessage skipped", {
          direction,
          previewOrigin,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
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
      try {
        frameWindow.postMessage(
          {
            source: "tomoshibi-admin-console",
            type: "tomoshibi-navigation:set-screen",
            payload: { screen: target.screen },
          },
          "*",
        );
      } catch (error) {
        console.warn("[settings-preview] set-screen postMessage skipped", {
          screen: target.screen,
          previewOrigin,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
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

  const updateSimulationInput = (key: keyof PreviewSimulationInputs, value: string) => {
    setPreviewSimulationInputs((prev) => ({ ...prev, [key]: value }));
  };

  const fetchSimulationStates = useCallback(
    async (runUntilStep: QuestGenerationStepId): Promise<Partial<Record<QuestGenerationStepId, StepSimulationState>>> => {
      const runUntilStepIndex = QUEST_GENERATION_STEPS.findIndex((step) => step.id === runUntilStep);
      const response = await fetch("/api/kyudai-mvp/quest/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulationInputs: {
            userType: previewSimulationInputs.userType,
            familiarity: previewSimulationInputs.familiarity,
            duration: previewSimulationInputs.duration,
            explorationStyle: previewSimulationInputs.explorationStyle,
            experienceExpectation: previewSimulationInputs.experienceExpectation,
            currentLat: previewSimulationInputs.currentLat,
            currentLng: previewSimulationInputs.currentLng,
          },
          simulationControl: {
            runUntilStep,
          },
          worldConfig: worldConfigPayload,
        }),
      });

      const payload = (await response.json()) as QuestGenerationSimulationApiResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "ステップシミュレーションに失敗しました。");
      }

      const ranAtIso = new Date().toISOString();
      const stepMap = new Map<QuestGenerationStepId, QuestGenerationStepResponse>();
      const traceMap = new Map<QuestGenerationStepId, QuestGenerationStepTrace>();
      if (Array.isArray(payload.steps)) {
        payload.steps.forEach((step) => {
          stepMap.set(step.id, step);
        });
      }
      if (Array.isArray(payload.stepTraces)) {
        payload.stepTraces.forEach((trace) => {
          traceMap.set(trace.id, trace);
        });
      }

      const nextStates: Partial<Record<QuestGenerationStepId, StepSimulationState>> = {};
      QUEST_GENERATION_STEPS.forEach((step, index) => {
        if (index > runUntilStepIndex) return;
        const matchedStep = stepMap.get(step.id);
        const matchedTrace = traceMap.get(step.id);
        if (!matchedStep && !matchedTrace) return;
        const spec = STEP_SIMULATION_SPECS[step.id];
        const traceAiPrompt = matchedTrace?.aiPrompt;
        const normalizedAiPrompt =
          traceAiPrompt &&
          typeof traceAiPrompt.provider === "string" &&
          typeof traceAiPrompt.model === "string" &&
          typeof traceAiPrompt.temperature === "number" &&
          typeof traceAiPrompt.systemPrompt === "string" &&
          typeof traceAiPrompt.userPrompt === "string"
            ? {
                provider: traceAiPrompt.provider,
                model: traceAiPrompt.model,
                temperature: traceAiPrompt.temperature,
                systemPrompt: traceAiPrompt.systemPrompt,
                userPrompt: traceAiPrompt.userPrompt,
              }
            : undefined;
        nextStates[step.id] = {
          ranAtIso,
          status: matchedStep?.status ?? "completed",
          detail:
            matchedStep?.detail ??
            (matchedTrace ? "シミュレーション完了" : "このステップの実行結果を取得できませんでした。"),
          program:
            typeof matchedTrace?.program === "string" && matchedTrace.program.trim().length > 0
              ? matchedTrace.program
              : spec.programSummary,
          inputVars:
            matchedTrace?.inputVars && isRecord(matchedTrace.inputVars) ? matchedTrace.inputVars : {},
          outputVars:
            matchedTrace?.outputVars && isRecord(matchedTrace.outputVars) ? matchedTrace.outputVars : {},
          aiPrompt: normalizedAiPrompt,
        };
      });

      return nextStates;
    },
    [previewSimulationInputs, worldConfigPayload],
  );

  const openSequentialSimulationModal = useCallback(() => {
    setSimulationModalStepId("step1");
    setStepSimulationStates({});
    setSimulationVisibleStepCount(1);
    setSimulationCompletedStepCount(0);
    setSimulatingStepId(null);
  }, []);

  const runStepSimulation = useCallback(
    async (stepId: QuestGenerationStepId) => {
      if (simulatingStepId) return;

      const currentStepIndex = QUEST_GENERATION_STEPS.findIndex((step) => step.id === stepId);
      if (currentStepIndex < 0 || currentStepIndex !== simulationCompletedStepCount) {
        return;
      }

      setSimulatingStepId(stepId);
      try {
        const nextStates = await fetchSimulationStates(stepId);
        setStepSimulationStates((prev) => ({ ...prev, ...nextStates }));

        const totalSteps = QUEST_GENERATION_STEPS.length;
        const nextCompleted = Math.min(totalSteps, simulationCompletedStepCount + 1);
        const nextVisible = Math.min(totalSteps, nextCompleted + 1);
        const nextFocusIndex = Math.min(nextCompleted, totalSteps - 1);

        setSimulationCompletedStepCount(nextCompleted);
        setSimulationVisibleStepCount(nextVisible);
        setSimulationModalStepId(QUEST_GENERATION_STEPS[nextFocusIndex]?.id ?? stepId);
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : "ステップシミュレーション中にエラーが発生しました。";
        const spec = STEP_SIMULATION_SPECS[stepId];
        setStepSimulationStates((prev) => ({
          ...prev,
          [stepId]: {
            ranAtIso: new Date().toISOString(),
            status: "error",
            detail: message,
            program: spec.programSummary,
            inputVars: {},
            outputVars: {},
          },
        }));
      } finally {
        setSimulatingStepId(null);
      }
    },
    [fetchSimulationStates, simulatingStepId, simulationCompletedStepCount],
  );

  const renderStepSimulationButton = () => {
    const isDisabled = simulatingStepId !== null;
    return (
      <button
        type="button"
        onClick={() => openSequentialSimulationModal()}
        disabled={isDisabled}
        className="rounded-lg border border-[#dee4e0] bg-white px-4 py-2 text-sm font-semibold text-[#2d3432] hover:border-[#f5ce53] disabled:cursor-not-allowed disabled:opacity-60"
      >
        一連シミュレーション開始
      </button>
    );
  };

  const renderStepSimulationPanel = (stepId: QuestGenerationStepId) => {
    const spec = STEP_SIMULATION_SPECS[stepId];
    const inputPreview = buildStepInputPreview(stepId, previewSimulationInputs, aiPromptDraft, programFlowDraft);

    return (
      <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#2d3432]">処理ロジック（プログラム）</p>
          <p className="text-sm leading-relaxed text-[#3e4a46]">{spec.programSummary}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">受け入れ入力変数</p>
            <div className="flex flex-wrap gap-2">
              {spec.inputVars.map((item) => (
                <span key={item} className="rounded-md border border-[#dee4e0] bg-white px-2 py-1 text-xs text-[#3e4a46]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">出力変数</p>
            <div className="flex flex-wrap gap-2">
              {spec.outputVars.map((item) => (
                <span key={item} className="rounded-md border border-[#dee4e0] bg-white px-2 py-1 text-xs text-[#3e4a46]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-[#dee4e0] bg-white p-3">
          <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">実行前の入力値プレビュー</p>
          <pre className="max-h-[260px] overflow-auto rounded-lg border border-[#dee4e0] bg-[#f9f9f7] p-3 text-xs leading-relaxed text-[#3e4a46]">
            {JSON.stringify(inputPreview, null, 2)}
          </pre>
          <p className="text-xs text-[#5a605e]">
            実行結果は Step1→Step8 の連鎖（前段出力が次段入力に入る形）でモーダル表示します。
          </p>
        </div>
      </div>
    );
  };

  const renderSimulationResultModal = () => {
    if (!simulationModalStepId) return null;

    const totalSteps = QUEST_GENERATION_STEPS.length;
    const resultEntries = QUEST_GENERATION_STEPS.map((step, index) => ({
      step,
      index,
      result: stepSimulationStates[step.id],
    }));
    const visibleEntries = resultEntries.slice(0, simulationVisibleStepCount);
    const isRunning = simulatingStepId !== null;
    const isFinished = simulationCompletedStepCount >= totalSteps;
    const latestRanAtIso = resultEntries.find((entry) => entry.result)?.result?.ranAtIso;
    const activeStepLabel =
      QUEST_GENERATION_STEPS.find((step) => step.id === simulationModalStepId)?.label ?? simulationModalStepId;
    const statusBadgeClass = (status: QuestGenerationStepStatus | "not-run") => {
      if (status === "completed") return "border-[#c9d8cd] bg-[#eef6f0] text-[#335a3c]";
      if (status === "fallback") return "border-[#f0d2a3] bg-[#fff3df] text-[#8a5a15]";
      if (status === "error") return "border-[#f1c7c5] bg-[#fce9e8] text-[#8c3430]";
      return "border-[#dee4e0] bg-[#f2f4f2] text-[#5a605e]";
    };
    const statusLabel = (status: QuestGenerationStepStatus | "not-run") => status;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
        <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#dee4e0] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#dee4e0] px-5 py-3">
            <div>
              <p className="text-sm text-[#5a605e]">シミュレーション結果</p>
              <h5 className="text-lg font-bold text-[#2d3432]">{activeStepLabel}</h5>
              <p className="text-xs text-[#5a605e]">
                進行: {Math.min(simulationCompletedStepCount, totalSteps)} / {totalSteps}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSimulationModalStepId(null)}
              className="rounded-lg border border-[#dee4e0] bg-white px-3 py-1.5 text-sm font-semibold text-[#2d3432] hover:border-[#f5ce53]"
            >
              閉じる
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#5a605e]">
                表示モード: Step1から順番に実行し、前段の出力を次段の入力へ引き継ぎます。
              </p>
              {latestRanAtIso ? (
                <p className="text-xs text-[#5a605e]">実行時刻: {new Date(latestRanAtIso).toLocaleString("ja-JP")}</p>
              ) : null}
            </div>
            {isRunning ? (
              <div className="rounded-lg border border-[#dee4e0] bg-[#f9f9f7] px-4 py-8 text-center text-sm text-[#5a605e]">
                一連シミュレーションを実行中です...
              </div>
            ) : null}
            {visibleEntries.map((entry, index) => {
              const isExecuted = entry.index < simulationCompletedStepCount;
              const isCurrent = entry.index === simulationCompletedStepCount && !isFinished;
              const isCurrentRunning = simulatingStepId === entry.step.id;
              const inputPreview =
                entry.result && Object.keys(entry.result.inputVars).length > 0
                  ? entry.result.inputVars
                  : buildStepInputPreview(entry.step.id, previewSimulationInputs, aiPromptDraft, programFlowDraft);
              const outputPreview = sanitizeStepOutputPreview(entry.step.id, entry.result?.outputVars ?? {});
              const aiPromptPreview =
                entry.result?.aiPrompt ??
                buildStepAiPromptPreview({
                  stepId: entry.step.id,
                  previewInputs: previewSimulationInputs,
                  aiPromptDraft,
                  programFlowDraft,
                });
              const currentStatus: QuestGenerationStepStatus | "not-run" = isExecuted
                ? entry.result?.status ?? "completed"
                : entry.result?.status === "error"
                  ? "error"
                  : "not-run";

              const previous = index > 0 ? visibleEntries[index - 1] : null;
              const previousOutputVars = previous?.result?.outputVars ?? {};
              const previousOutputKeys = Object.keys(previousOutputVars);
              const currentInputKeys = Object.keys(inputPreview);
              const carriedKeys = previousOutputKeys.filter((key) => currentInputKeys.includes(key));
              const additionalInputKeys = currentInputKeys.filter((key) => !carriedKeys.includes(key));

              return (
                <div
                  key={entry.step.id}
                  className={[
                    "space-y-3 rounded-xl border p-4",
                    entry.step.id === simulationModalStepId
                      ? "border-[#f5ce53] bg-[#fffdf6]"
                      : "border-[#dee4e0] bg-[#f9f9f7]",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h6 className="text-base font-bold text-[#2d3432]">{entry.step.label}</h6>
                    {isCurrent ? (
                      <button
                        type="button"
                        onClick={() => {
                          void runStepSimulation(entry.step.id);
                        }}
                        disabled={Boolean(simulatingStepId)}
                        className="rounded-lg border border-[#dee4e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d3432] hover:border-[#f5ce53] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCurrentRunning ? "実行中..." : "実行する"}
                      </button>
                    ) : (
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(currentStatus)}`}>
                        {statusLabel(currentStatus)}
                      </span>
                    )}
                  </div>
                  <TextAreaField
                    label="処理ロジック（実行時）"
                    value={entry.result?.program ?? STEP_SIMULATION_SPECS[entry.step.id].programSummary}
                    readOnly
                    rows={2}
                  />
                  <p className="text-sm text-[#3e4a46]">
                    {isExecuted
                      ? entry.result?.detail ?? "実行完了"
                      : entry.result?.status === "error"
                        ? entry.result.detail
                        : "このステップは未実行です。右上の「実行する」で進めてください。"}
                  </p>
                  {index > 0 ? (
                    <div className="space-y-2 rounded-lg border border-[#dee4e0] bg-white p-3">
                      <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">
                        前段連鎖: {previous?.step.label} の出力 → {entry.step.label} の入力
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {carriedKeys.length > 0 ? (
                          carriedKeys.map((key) => (
                            <span
                              key={`carry-${entry.step.id}-${key}`}
                              className="rounded-md border border-[#d8e6dc] bg-[#eef6f0] px-2 py-1 text-[11px] text-[#335a3c]"
                            >
                              連鎖入力: {key}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-md border border-[#dee4e0] bg-[#f2f4f2] px-2 py-1 text-[11px] text-[#5a605e]">
                            自動連鎖キーなし（構造変換あり）
                          </span>
                        )}
                        {additionalInputKeys.map((key) => (
                          <span
                            key={`additional-${entry.step.id}-${key}`}
                            className="rounded-md border border-[#f0d2a3] bg-[#fff3df] px-2 py-1 text-[11px] text-[#8a5a15]"
                          >
                            追加入力: {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">
                        {isExecuted ? "入力値（実行時）" : "入力値（未実行プレビュー）"}
                      </p>
                      <pre className="max-h-[220px] overflow-auto rounded-lg border border-[#dee4e0] bg-white p-3 text-xs leading-relaxed text-[#3e4a46]">
                        {JSON.stringify(inputPreview, null, 2)}
                      </pre>
                      {aiPromptPreview ? (
                        <div className="space-y-2 rounded-lg border border-[#dee4e0] bg-white p-3">
                          <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">
                            {entry.result?.aiPrompt ? "AIプロンプト（実行時・原文）" : "AIプロンプト（実行前プレビュー）"}
                          </p>
                          <p className="text-[11px] text-[#5a605e]">
                            provider={aiPromptPreview.provider} / model={aiPromptPreview.model} /
                            temperature={aiPromptPreview.temperature}
                          </p>
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-[#3e4a46]">system prompt</p>
                            <pre className="max-h-[180px] overflow-auto rounded-lg border border-[#dee4e0] bg-[#f9f9f7] p-2 text-[11px] leading-relaxed text-[#3e4a46]">
                              {aiPromptPreview.systemPrompt}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-[#3e4a46]">user prompt</p>
                            <pre className="max-h-[260px] overflow-auto rounded-lg border border-[#dee4e0] bg-[#f9f9f7] p-2 text-[11px] leading-relaxed text-[#3e4a46]">
                              {aiPromptPreview.userPrompt}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold tracking-wide text-[#5a605e] uppercase">出力結果</p>
                      {isExecuted ? (
                        <pre className="max-h-[220px] overflow-auto rounded-lg border border-[#dee4e0] bg-white p-3 text-xs leading-relaxed text-[#3e4a46]">
                          {JSON.stringify(outputPreview, null, 2)}
                        </pre>
                      ) : (
                        <div className="rounded-lg border border-[#dee4e0] bg-white px-3 py-4 text-xs text-[#5a605e]">
                          未実行のため、出力結果はまだありません。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const activeQuestStep = useMemo(
    () => QUEST_GENERATION_STEPS.find((step) => step.id === activeQuestGenerationStep) ?? QUEST_GENERATION_STEPS[0],
    [activeQuestGenerationStep],
  );

  const showLivePreviewPane = activeWorkspaceMode === "cms";
  const spotDbUpdatedAtLabel = useMemo(() => {
    if (!spotDbData?.generatedAt) return "不明";
    const parsed = new Date(spotDbData.generatedAt);
    if (Number.isNaN(parsed.getTime())) return spotDbData.generatedAt;
    return parsed.toLocaleString("ja-JP");
  }, [spotDbData?.generatedAt]);

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
              ) : activeWorkspaceMode === "ai" ? (
                <div className="max-w-none space-y-6">
                  <div className="rounded-xl border border-[#dee4e0] bg-white px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-1 text-2xl font-bold text-[#2d3432]">AI生成フロー管理</h3>
                        <p className="text-[14px] leading-relaxed text-[#5a605e]">
                          ステップごとの設定を編集し、`questGenerationConfig`として生成APIに反映します。
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#f5ce53]/50 bg-[#fff7e2] px-3 py-2 text-xs font-semibold text-[#5a605e]">
                        現在: {activeQuestStep.label}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#dee4e0] bg-white p-2">
                    <div className="flex min-w-max gap-2">
                      {QUEST_GENERATION_STEPS.map((step) => {
                        const isActive = activeQuestGenerationStep === step.id;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveQuestGenerationStep(step.id)}
                            className={[
                              "min-w-[180px] rounded-lg border px-3 py-3 text-left transition-colors",
                              isActive
                                ? "border-[#f5ce53] bg-[#fff7e2]"
                                : "border-[#dee4e0] bg-[#f9f9f7] hover:border-[#f5ce53]/70",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[#2d3432]">{step.label}</p>
                              <span
                                className={[
                                  "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                                  step.kind === "program"
                                    ? "bg-[#e6eef8] text-[#455363]"
                                    : step.kind === "ai"
                                      ? "bg-[#fef0d1] text-[#745c00]"
                                      : "bg-[#ece8f9] text-[#55408a]",
                                ].join(" ")}
                              >
                                {step.kind === "program" ? "Program" : step.kind === "ai" ? "AI" : "Hybrid"}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-[#5a605e]">{step.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5 rounded-xl border border-[#dee4e0] bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-[#2d3432]">{activeQuestStep.label} シミュレーション</h4>
                        <p className="mt-1 text-sm text-[#5a605e]">
                          実行時は Step1→Step8 を連鎖実行し、前段出力が次段入力へ渡る流れを含めて確認できます。
                        </p>
                      </div>
                      {renderStepSimulationButton()}
                    </div>
                    <div className="space-y-4 rounded-xl border border-[#dee4e0] bg-[#f9f9f7] p-4">
                      <p className="text-sm font-semibold text-[#2d3432]">シミュレーション入力値（実際に投入する値）</p>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <InputField
                          label="userType"
                          value={previewSimulationInputs.userType}
                          onChange={(value) => updateSimulationInput("userType", value)}
                        />
                        <InputField
                          label="familiarity"
                          value={previewSimulationInputs.familiarity}
                          onChange={(value) => updateSimulationInput("familiarity", value)}
                        />
                        <InputField
                          label="duration"
                          value={previewSimulationInputs.duration}
                          onChange={(value) => updateSimulationInput("duration", value)}
                        />
                        <InputField
                          label="explorationStyle"
                          value={previewSimulationInputs.explorationStyle}
                          onChange={(value) => updateSimulationInput("explorationStyle", value)}
                        />
                        <InputField
                          label="experienceExpectation"
                          value={previewSimulationInputs.experienceExpectation}
                          onChange={(value) => updateSimulationInput("experienceExpectation", value)}
                        />
                        <InputField
                          label="currentLat"
                          value={previewSimulationInputs.currentLat}
                          onChange={(value) => updateSimulationInput("currentLat", value)}
                        />
                        <InputField
                          label="currentLng"
                          value={previewSimulationInputs.currentLng}
                          onChange={(value) => updateSimulationInput("currentLng", value)}
                        />
                      </div>
                      <p className="text-xs text-[#5a605e]">
                        緯度経度を空欄にすると、既定の開始地点（Big Orange）を現在地として扱います。
                      </p>
                    </div>
                    {renderStepSimulationPanel(activeQuestGenerationStep)}
                  </div>
                </div>
              ) : activeWorkspaceMode === "spotdb" ? (
                <div className="max-w-none space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="mb-2 text-2xl font-bold text-[#2d3432]">スポットDB</h3>
                      <p className="text-[15px] leading-relaxed text-[#5a605e]">
                        現在のスポットDBを地図上に全件ピン表示します。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void fetchSpotDbData();
                      }}
                      disabled={spotDbLoading}
                      className="rounded-lg border border-[#dee4e0] bg-white px-4 py-2 text-sm font-semibold text-[#2d3432] hover:border-[#f5ce53] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {spotDbLoading ? "読み込み中..." : "再読み込み"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#dee4e0] bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-wide text-[#5a605e] uppercase">総スポット数</p>
                      <p className="mt-1 text-2xl font-bold text-[#2d3432]">{spotDbData?.totalSpots ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-[#dee4e0] bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-wide text-[#5a605e] uppercase">最終更新</p>
                      <p className="mt-1 text-sm font-semibold text-[#2d3432]">{spotDbUpdatedAtLabel}</p>
                    </div>
                    <div className="rounded-xl border border-[#dee4e0] bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-wide text-[#5a605e] uppercase">地図API</p>
                      <p className="mt-1 text-sm font-semibold text-[#2d3432]">
                        {GOOGLE_MAPS_API_KEY ? "利用可能" : "未設定"}
                      </p>
                    </div>
                  </div>

                  {spotDbError ? (
                    <div className="rounded-xl border border-[#f5ce53]/40 bg-[#fff7e2] px-4 py-3 text-sm text-[#5a605e]">
                      {spotDbError}
                    </div>
                  ) : null}

                  <div className="overflow-hidden rounded-xl border border-[#dee4e0] bg-white">
                    <div className="flex items-center justify-between border-b border-[#dee4e0] px-4 py-3">
                      <p className="text-sm font-semibold text-[#2d3432]">スポット分布マップ</p>
                      <p className="text-xs text-[#5a605e]">全件ピン表示</p>
                    </div>
                    <div className="relative h-[420px] bg-[#f4f7f5]">
                      {!GOOGLE_MAPS_API_KEY ? (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-relaxed text-[#5a605e]">
                          `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` が未設定のため、ピン付きマップを表示できません。
                        </div>
                      ) : spotDbLoading && !spotDbData ? (
                        <div className="flex h-full items-center justify-center text-sm text-[#5a605e]">
                          スポットDBを読み込み中...
                        </div>
                      ) : spotDbData?.spots.length ? (
                        <>
                          <div className="h-full w-full" ref={spotDbMapContainerRef} />
                          {!spotDbMapReady ? (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f4f7f5]/70 text-sm text-[#5a605e]">
                              地図を読み込み中...
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#5a605e]">
                          表示できるスポットがありません。
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-[#dee4e0] bg-white">
                    <div className="border-b border-[#dee4e0] px-4 py-3">
                      <p className="text-sm font-semibold text-[#2d3432]">スポット一覧</p>
                    </div>
                    <div className="max-h-[320px] overflow-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="sticky top-0 bg-[#f9f9f7] text-xs font-semibold tracking-wide text-[#5a605e] uppercase">
                          <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">名称</th>
                            <th className="px-3 py-2">緯度</th>
                            <th className="px-3 py-2">経度</th>
                            <th className="px-3 py-2">source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(spotDbData?.spots ?? []).map((spot, index) => (
                            <tr className="border-t border-[#eef2ef]" key={spot.id}>
                              <td className="px-3 py-2 text-xs text-[#5a605e]">{index + 1}</td>
                              <td className="px-3 py-2 font-medium text-[#2d3432]">{spot.name}</td>
                              <td className="px-3 py-2 text-[#3e4a46]">{spot.lat.toFixed(6)}</td>
                              <td className="px-3 py-2 text-[#3e4a46]">{spot.lng.toFixed(6)}</td>
                              <td className="px-3 py-2 text-xs text-[#5a605e]">{spot.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full" />
              )}
            </main>
          </div>
        </div>

        {showLivePreviewPane ? (
          <aside className="relative z-10 flex h-full min-h-0 w-[clamp(360px,38vw,520px)] min-w-[360px] max-w-[520px] flex-shrink-0 flex-col border-l border-[#dee4e0] bg-[#f2f4f2] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="sticky top-0 z-20 h-14 border-b border-[#dee4e0] bg-[#f9f9f7]/70 px-3 backdrop-blur-sm sm:px-4">
              <div className="flex h-full items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#2d3432]">Live Preview</h4>
                  <p className="text-[11px] text-[#5a605e]">現在: {previewScreen ?? "未接続"}</p>
                </div>
                <div className="flex items-center gap-2">
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
          </aside>
        ) : null}
      </div>
      {renderSimulationResultModal()}
    </main>
  );
}
