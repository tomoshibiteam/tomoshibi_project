import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type DurationBucket = "15〜20分" | "20〜30分" | "30〜45分";
type FamiliarityBucket =
  | "はじめて来た"
  | "まだあまり慣れていない"
  | "何度か来たことがある"
  | "よく来ている";

type UserTypeBucket = "新入生" | "在学生" | "保護者" | "教職員" | "その他";

type StepStatus = "completed" | "fallback";

type GenerationStepLog = {
  id: "step1" | "step2" | "step3" | "step4" | "step5" | "step6" | "step7" | "step8";
  label: string;
  status: StepStatus;
  detail: string;
};

type GenerationStepId = GenerationStepLog["id"];

type GenerationStepTrace = {
  id: GenerationStepId;
  program: string;
  inputVars: Record<string, unknown>;
  outputVars: Record<string, unknown>;
  aiPrompt?: {
    provider: "gemini";
    model: string;
    temperature: number;
    systemPrompt: string;
    userPrompt: string;
  };
};

type QuestSpotOutput = {
  id: string;
  name: string;
  overview: string;
  rationale: string;
  scenarioTexts: string[];
  lat: number;
  lng: number;
};

type QuestOutput = {
  generatedStoryName: string;
  storyTone: string;
  readyHeroLead: string;
  readySummaryTitle: string;
  readySummaryText: string;
  prologueBody: string;
  epilogueBody: string;
  spots: QuestSpotOutput[];
};

type SpotRank = 1 | 2 | 3 | 4;

type SpotRecord = {
  id: string;
  name: string;
  overview: string;
  facts: string[];
  rank: SpotRank;
  lat: number;
  lng: number;
};

type SpotDbExtractedRecord = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  source: string;
  address: string;
  kinds: string;
  description: string;
  official_map_ids_2025?: unknown;
  coordinate_basis?: string;
  source_url?: string;
  map_zone?: string;
  building_code?: string;
  sub_facilities?: unknown;
  [key: string]: unknown;
};

type RouteSpotKnowledge = {
  routeSpotId: string;
  routeSpotName: string;
  matchedBy: "id" | "nearest" | "none";
  matchedSpotDbId: string | null;
  matchedSpotDbName: string | null;
  matchedDistanceMeters: number | null;
  knowledgeCandidates: SpotDbExtractedRecord[];
};

type SpotPromptInput = {
  spot_id: string;
  spot_name: string;
  spot_order: number;
  spot_role: string;
  facility_summary: string;
  why_selected: string;
  what_player_should_notice: string;
  transition_to_next: string;
  optional_notes: string;
};

type ProgramFlowConfig = {
  step1?: {
    normalizeUserType?: string;
    normalizeFamiliarity?: string;
    normalizeDuration?: string;
  };
  step2?: {
    spotCountRule?: string;
    mobilityConstraintRule?: string;
  };
  step3?: {
    candidateSelectionRule?: string;
    routeOrderingRule?: string;
    spotDbLinkPolicy?: string;
    candidateSpotPoolIds?: string;
  };
  step5?: {
    narrativeContainerSpec?: string;
    slotInjectionPolicy?: string;
  };
  step6?: {
    worldSetting?: string;
    characterProfile?: string;
    characterRole?: string;
    storyArcFor4Spots?: string;
    storyArcFor5Spots?: string;
    storyArcFor6Spots?: string;
    conversationFlow?: string;
    readyGeneratedStoryName?: string;
    readyHeroLead?: string;
    readySummaryTitle?: string;
    readySummaryText?: string;
  };
  step7?: {
    validationRuleSet?: string;
    fallbackPolicy?: string;
  };
  step8?: {
    finalizeFormat?: string;
    persistAndDispatch?: string;
  };
};

type AIPromptConfig = {
  step4RouteOptimization?: string;
  step6InsertionGeneration?: string;
  step7MinimalRepair?: string;
};

type QuestGenerationConfig = {
  program?: ProgramFlowConfig;
  aiPrompts?: AIPromptConfig;
};

type GenerationRequestBody = {
  simulationInputs?: {
    userType?: string;
    familiarity?: string;
    duration?: string;
    explorationStyle?: string;
    experienceExpectation?: string;
    currentLat?: number | string;
    currentLng?: number | string;
  };
  simulationControl?: {
    runUntilStep?: GenerationStepId;
  };
  worldConfig?: {
    title?: string;
    description?: string;
    audience?: string;
    questName?: string;
    questSubtitle?: string;
    playerType?: string;
    playerState?: string;
    questTheme?: string;
    questGoal?: string;
    questTakeaway?: string;
    guideName?: string;
    guideRole?: string;
    guideDistance?: string;
    guideTone?: string;
    guideKnows?: string;
    guideDoesNotKnow?: string;
    guideForbiddenStyle?: string;
    questStructure?: string;
    endingStyle?: string;
    tone?: string;
    styleRules?: string;
    outputLanguage?: string;
    routeDesign?: string;
    fixedTextPolicy?: string;
    requiredKeywords?: string[];
    blockedKeywords?: string[];
    questGenerationConfig?: QuestGenerationConfig;
  };
};

type RouteStep4Result = {
  routeSpotIds?: string[];
  reasons?: Record<string, string>;
  routeReasonMap?: Record<string, string>;
  spotReasons?: Array<{ spotId?: string; reason?: string }>;
  routeStoryTheme?: string;
  mobilityNotes?: string;
};

type Step4CompactSpot = {
  id: string;
  lat: number;
  lng: number;
  distanceFromCurrentMeters: number;
  rank: SpotRank;
  source: "step3-extracted" | "fallback-spot-db";
};

type Step4CompactRouteInput = {
  currentLocation: {
    lat: number;
    lng: number;
  };
  travelMode: "walking";
  userType: UserTypeBucket;
  familiarity: FamiliarityBucket;
  duration: DurationBucket;
  explorationStyle: string;
  experienceExpectation: string;
  targetCount: number;
  maxReachableRadiusMeters: number;
  minSegmentDistanceMeters: number;
  maxSegmentDistanceMeters: number;
  requiredStartSpotId: string;
  candidateSpots: Step4CompactSpot[];
  candidateDistanceMatrixMeters: Array<{
    fromId: string;
    toId: string;
    distanceMeters: number;
  }>;
  baselineRoute: {
    routeIds: string[];
    totalDistanceMeters: number;
    legDistances: Array<{ fromId: string; toId: string; distanceMeters: number }>;
  };
};

type NarrativeStep6Result = {
  generatedStoryName?: string;
  storyTone?: string;
  readyHeroLead?: string;
  readySummaryTitle?: string;
  readySummaryText?: string;
  prologueBody?: string;
  epilogueBody?: string;
  spots?: Array<{
    id?: string;
    name?: string;
    overview?: string;
    rationale?: string;
    scenarioTexts?: string[];
  }>;
};

type GeminiJsonCallResult<T> = {
  data: T | null;
  error: string | null;
  model: string;
};

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_ROUTE_MODEL = (
  process.env.GEMINI_ROUTE_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-2.5-flash"
).trim();
const GEMINI_NARRATIVE_MODEL = (
  process.env.GEMINI_NARRATIVE_MODEL ||
  process.env.GEMINI_MODEL ||
  GEMINI_ROUTE_MODEL
).trim();
const GEMINI_ROUTE_FALLBACK_MODELS = Array.from(
  new Set(
    toText(process.env.GEMINI_ROUTE_FALLBACK_MODELS, "gemini-2.5-flash-lite,gemini-flash-latest")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  ),
);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-request-id",
};

const GENERATION_STEP_ORDER: GenerationStepId[] = [
  "step1",
  "step2",
  "step3",
  "step4",
  "step5",
  "step6",
  "step7",
  "step8",
];

const SPOT_DB: SpotRecord[] = [
  {
    id: "big-orange",
    name: "Big Orange",
    overview: "全ての物語が始まる場所。インフォメーションと建築が来訪者を迎える。",
    facts: [
      "キャンパス導線の起点として認識しやすい",
      "初訪問者でも方向感覚を作りやすい",
      "最初の導入説明に適した開放感がある",
    ],
    rank: 1,
    lat: 33.59895,
    lng: 130.2169,
  },
  {
    id: "center-zone",
    name: "Center Zone",
    overview: "学生の活動が交差する中心エリア。講義棟への導線が分かりやすい。",
    facts: [
      "日中は人の流れが多くキャンパスのリズムを体感しやすい",
      "主要施設への分岐が集まる",
      "初学者に必要な生活導線の理解に向く",
    ],
    rank: 1,
    lat: 33.5978,
    lng: 130.2204,
  },
  {
    id: "central-library",
    name: "中央図書館",
    overview: "静けさと知性が同居する空間。学びの深度を実感しやすい。",
    facts: [
      "自習・調査の拠点として利用される",
      "落ち着いた空気で物語の転調を作りやすい",
      "学修に関する具体的な行動へつなげやすい",
    ],
    rank: 1,
    lat: 33.5961,
    lng: 130.2184,
  },
  {
    id: "innovation-plaza",
    name: "Innovation Plaza",
    overview: "学際的な挑戦が交差する実践拠点。新しい発想の入口。",
    facts: [
      "分野横断の活動イメージを示しやすい",
      "未来志向の文脈を付与しやすい",
      "参加型イベントの話題と相性が良い",
    ],
    rank: 2,
    lat: 33.59735,
    lng: 130.2192,
  },
  {
    id: "research-commons",
    name: "Research Commons",
    overview: "研究者と学生の対話が生まれる空間。高度な学びの気配を感じられる。",
    facts: [
      "研究の実践現場を想起させる",
      "知的好奇心を刺激する話題と親和性が高い",
      "リピーターにも再発見を提供しやすい",
    ],
    rank: 3,
    lat: 33.59645,
    lng: 130.2171,
  },
  {
    id: "west-gate",
    name: "West Gate",
    overview: "キャンパスの広がりを感じる西の玄関口。体験の締めに適した地点。",
    facts: [
      "導線の収束点として分かりやすい",
      "振り返りの演出を置きやすい",
      "次回訪問への期待を自然に接続できる",
    ],
    rank: 4,
    lat: 33.5952,
    lng: 130.2159,
  },
];

const SPOT_BY_ID = SPOT_DB.reduce<Record<string, SpotRecord>>((acc, spot) => {
  acc[spot.id] = spot;
  return acc;
}, {});

const START_SPOT_ID = "center-zone";
const LEGACY_DEFAULT_GOAL_SPOT_ID = "west-gate";
const WALKING_MIN_SEGMENT_DISTANCE_METERS = 5;
const WALKING_MAX_SEGMENT_DISTANCE_METERS = 1000;
const WALKING_METERS_PER_MINUTE = 67;
const RADIUS_REACHABILITY_FACTOR = 0.6;
const STEP4_MAX_ROUTE_ENUMERATION = 50000;
const STEP4_MAX_ENUMERATION_MIDDLE_CANDIDATES = 10;
const STEP3_MAX_STEP4_MIDDLE_CANDIDATES = 18;
const LEGACY_FIXED_POOL_IDS = [
  START_SPOT_ID,
  "big-orange",
  "innovation-plaza",
  "central-library",
  "research-commons",
  LEGACY_DEFAULT_GOAL_SPOT_ID,
];
const DEFAULT_SPOT_DB_CANDIDATE_PATHS = [
  path.join(
    process.cwd(),
    "..",
    "tomoshibi-mobile",
    "mastra",
    "src",
    "data",
    "ito_spots.seed.json",
  ),
  path.join(
    process.cwd(),
    "apps",
    "tomoshibi-mobile",
    "mastra",
    "src",
    "data",
    "ito_spots.seed.json",
  ),
];

const DURATION_SPOT_COUNT: Record<DurationBucket, number> = {
  "15〜20分": 5,
  "20〜30分": 6,
  "30〜45分": 6,
};

const DURATION_UPPER_MINUTES: Record<DurationBucket, number> = {
  "15〜20分": 20,
  "20〜30分": 30,
  "30〜45分": 45,
};

const FAMILIARITY_MIDDLE_PRIORITY: Record<FamiliarityBucket, string[]> = {
  はじめて来た: ["big-orange", "innovation-plaza", "central-library", "research-commons"],
  まだあまり慣れていない: ["big-orange", "innovation-plaza", "central-library", "research-commons"],
  何度か来たことがある: ["big-orange", "innovation-plaza", "central-library", "research-commons"],
  よく来ている: ["big-orange", "innovation-plaza", "central-library", "research-commons"],
};

const FAMILIARITY_PREFERRED_SPOT_RANKS: Record<FamiliarityBucket, SpotRank[]> = {
  はじめて来た: [1],
  まだあまり慣れていない: [1, 2],
  何度か来たことがある: [1, 2, 3],
  よく来ている: [3, 4],
};

const FAMILIARITY_BACKFILL_SPOT_RANKS: Record<FamiliarityBucket, SpotRank[]> = {
  はじめて来た: [2, 3, 4],
  まだあまり慣れていない: [3, 4],
  何度か来たことがある: [4],
  よく来ている: [2, 1],
};

const DEFAULT_STEP4_PROMPT =
  "あなたは九州大学伊都キャンパスの徒歩ルート設計AIです。\n" +
  "目的: {userType}（習熟度: {familiarity}）が {duration} で完走できる巡回ルートを設計する。\n" +
  "探索スタイル: {explorationStyle} / 期待: {experienceExpectation}\n" +
  "設計ルール: {routeDesign}\n" +
  "ハード制約:\n" +
  "1) requiredStartSpotId で開始する\n" +
  "2) routeSpotIds は targetCount 件で重複なし\n" +
  "3) routeSpotIds は candidateSpots.id のみ\n" +
  "4) 全セグメントは minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下\n" +
  "最適化優先順位: 制約順守 > 総歩行距離最小化 > 最長区間短縮 > 体験文脈整合。\n" +
  "出力はJSONのみ。前置き・コードブロックは禁止。";

const DEFAULT_STEP6_PROMPT = `# Role
あなたは、大学回遊型クエストのシナリオライターです。
あなたの役割は、運営側が決めたクエスト骨格とスポット情報をもとに、ひとつの自然な短編クエストを生成することです。

# Mission
九州大学伊都キャンパスを舞台に、参加者が「今どこにいて、何がわかり、次にどこへ向かうか」を毎地点で理解できるクエストを作成してください。

# Important Rules
- スポット数は入力に従う
- スポット名・順番・役割は入力に従う
- 入力されていないスポット情報を勝手に補わない
- 案内役は作者目線で話さない
- 「このクエストでは」「ここで学ぶのは」などのメタ表現は禁止
- 抽象語だけで済ませず、具体的に言い換える
- 高校生〜大学1年生でもすぐ理解できる日本語にする
- 1文を長くしすぎない
- 出力言語は {outputLanguage}
- トーンは {tone}
- 文体は {outputStyle}
- 必須要素: {requiredElements}
- 禁止要素: {forbiddenElements}

# Quest Skeleton Input
【クエスト名】
{questName}

【サブタイトル】
{questSubtitle}

【想定プレイヤー】
{playerType}

【前提状態】
{playerState}

【所要時間】
{duration}

【クエスト全体テーマ】
{questTheme}

【体験ゴール】
{questGoal}

【体験後に持ち帰ってほしいこと】
{takeaway}

【案内役】
名前: {guideName}
立場: {guideRole}
距離感: {guideDistance}
話し方: {guideTone}
知っている範囲: {guideKnows}
知らない範囲: {guideDoesNotKnow}
禁止したい話し方: {guideForbiddenStyle}

【クエスト構造】
{questStructure}

【スポット数】
{spotCount}

【スポット一覧】
{spotsJson}

# Output Contract
出力はJSONのみ。コードブロック禁止。
JSON schema:
{
  "generatedStoryName": "string",
  "storyTone": "string",
  "readyHeroLead": "string",
  "readySummaryTitle": "string",
  "readySummaryText": "string",
  "prologueBody": "string",
  "epilogueBody": "string",
  "spots": [
    {
      "id": "string",
      "name": "string",
      "overview": "到着時の短い地の文",
      "rationale": "この場面の役割",
      "scenarioTexts": [
        "到着前の一言",
        "案内役の会話",
        "この地点での気づきと次スポットへの接続文"
      ]
    }
  ]
}

spots の順序と件数は、入力スポット一覧と完全一致させてください。`;

const DEFAULT_STEP7_PROMPT =
  "検証で失敗した箇所のみ最小限で修正してください。禁止要素={forbiddenElements}。固定文言ポリシー={fixedTextPolicy}。問題のないセクションは変更しない。";

const DEFAULT_STEP6_WORLD_SETTING = "九州大学 伊都キャンパス。学びと生活が交差する世界観。";
const DEFAULT_STEP6_CHARACTER_PROFILE = "案内役: 落ち着いた語り口。観察と発見を促す。";
const DEFAULT_STEP6_CHARACTER_ROLE = "来訪者の不安を下げ、スポット固有情報を物語へ自然接続する。";
const DEFAULT_STEP6_ARC_4 =
  "Spot1:導入 / Spot2:理解 / Spot3:発見 / Spot4:締め。短時間で迷わず回れる体験を優先。";
const DEFAULT_STEP6_ARC_5 =
  "Spot1:導入 / Spot2:観察 / Spot3:発見 / Spot4:対話 / Spot5:締め。バランス重視。";
const DEFAULT_STEP6_ARC_6 =
  "Spot1:導入 / Spot2:観察 / Spot3:発見 / Spot4:対話 / Spot5:統合 / Spot6:締め。深掘り重視。";
const DEFAULT_STEP6_CONVERSATION_FLOW =
  "各スポットは 1)到着の一言 2)その場所の意味 3)次地点への橋渡し の順で会話を構成する。";
const DEFAULT_STEP6_READY_GENERATED_STORY_NAME = "石ヶ原ファイル｜九大の下に眠る時間をひらく物語";
const DEFAULT_STEP6_READY_HERO_LEAD =
  "物語の準備が整いました。ここから九大のもう一つの時間をたどります。";
const DEFAULT_STEP6_READY_SUMMARY_TITLE = "この物語で見えてくること";
const DEFAULT_STEP6_READY_SUMMARY_TEXT =
  "この地域に残る過去の出来事を、今の九州大学伊都キャンパスのスポットと結びつけながら読み進める構成です。各地点で手がかりを拾い、最後にそれらがつながったとき、九大がただ新しく建った場所ではないことがわかります。";
const DEFAULT_FIXED_TEXT_POLICY = "固定UI文言は変更しない";
const DEFAULT_SPOT_ROLE_TEMPLATE_6 = [
  "起点をつかむ",
  "戻る場所を知る",
  "人が集まる場所を知る",
  "挑戦が始まる場所を知る",
  "問いを深める場所を知る",
  "終着点で全体をつなぐ",
] as const;
const DEFAULT_SPOT_ROLE_TEMPLATE_5 = [
  "起点をつかむ",
  "戻る場所を知る",
  "挑戦が始まる場所を知る",
  "問いを深める場所を知る",
  "終着点で全体をつなぐ",
] as const;
const DEFAULT_SPOT_ROLE_TEMPLATE_4 = [
  "起点をつかむ",
  "戻る場所を知る",
  "問いを深める場所を知る",
  "終着点で全体をつなぐ",
] as const;
const DEFAULT_GUIDE_NAME = "澪先輩";
const DEFAULT_GUIDE_ROLE = "伊都キャンパスを案内する先輩";
const DEFAULT_GUIDE_DISTANCE = "近すぎず、必要なときに背中を押す距離";
const DEFAULT_GUIDE_KNOWS = "施設の使われ方、学生目線での価値、ルートの意図";
const DEFAULT_GUIDE_DOES_NOT_KNOW = "制作裏話、プレイヤーの内心、過剰な断定";
const DEFAULT_GUIDE_FORBIDDEN_STYLE = "メタ発言、抽象論だけの説明、説明くさすぎる語り";
const KYUDAI_ISHIGAHARA_PROLOGUE_BODY =
  "九州大学伊都キャンパスが建っているこの場所には、\n" +
  "大学ができるよりずっと前から、人が集まり、物が行き交い、何かが作られ、残されてきた時間がある。\n\n" +
  "その流れを、ひとつのファイルにまとめようとした人がいた。\n" +
  "昔この地域で起きていたことを、\n" +
  "今のキャンパスの場所と一枚ずつ結びつけて読めるようにするためのファイルだ。\n\n" +
  "けれど、そのファイルは完成しなかった。\n" +
  "途中のページが抜けたまま、最後まで読めなくなっている。\n\n" +
  "あなたはこれから、澪先輩と一緒に、その抜けたページを探しに行く。\n" +
  "集めるのは、ただの紙ではない。\n" +
  "それぞれのページには、昔この地域で実際に起きていたことが書かれている。\n\n" +
  "外から人や物が届いていたこと。\n" +
  "人が集まり、やり取りが起きていたこと。\n" +
  "何かを作る営みがあったこと。\n" +
  "その跡が、今まで残っていること。\n\n" +
  "ページを集めて最後まで読めたとき、\n" +
  "ただキャンパスを歩くだけでは見えない、もうひとつの九州大学が見えてくる。\n\n" +
  "なぜ今、ここに九州大学伊都キャンパスがあるのか。\n" +
  "その答えを読むために、石ヶ原ファイルを完成させよう。";
const KYUDAI_ISHIGAHARA_EPILOGUE_BODY =
  "石ヶ原ファイルは、ここで閉じられる。\n\n" +
  "あなたが集めたページに書かれていたのは、\n" +
  "昔この地域で本当に起きていたことだった。\n\n" +
  "外から人や物が届いたこと。\n" +
  "人が集まり、やり取りが生まれたこと。\n" +
  "何かを作る営みがあったこと。\n" +
  "その跡が、今まで残っていたこと。\n\n" +
  "最後まで読んでわかるのは、\n" +
  "それが昔の出来事で終わっていない、ということだ。\n\n" +
  "今、あなたが歩いている九州大学伊都キャンパスもまた、\n" +
  "その続きの上にある。\n\n" +
  "ここは、何もない場所に突然できた大学ではない。\n" +
  "もっと前から、人が来て、集まり、何かを生み出し、残してきた土地の、いちばん新しい形だ。\n\n" +
  "だから次にこのキャンパスを歩くとき、\n" +
  "あなたが見るのは、ただの建物ではない。\n\n" +
  "昔から続いてきた流れの、その先にある今の九州大学だ。";

const REQUEST_LOG_PREFIX = "[kyudai-mvp:quest-generate]";

type QuestProgressEventType =
  | "plan"
  | "step-start"
  | "step-process"
  | "step-end"
  | "request-error"
  | "request-finished";

type QuestProgressEvent = {
  requestId: string;
  type: QuestProgressEventType;
  timestamp: string;
  stepId?: GenerationStepId;
  stepLabel?: string;
  stepOrdinal?: number;
  totalSteps?: number;
  status?: StepStatus;
  durationMs?: number | null;
  message: string;
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

declare global {
  // eslint-disable-next-line no-var
  var __KYUDAI_QUEST_PROGRESS_EMITTER__:
    | ((event: QuestProgressEvent) => void)
    | undefined;
}

const emitQuestProgress = (event: Omit<QuestProgressEvent, "timestamp">) => {
  try {
    globalThis.__KYUDAI_QUEST_PROGRESS_EMITTER__?.({
      ...event,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // progress streaming failure must not break quest generation
  }
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseLineSeparatedIds(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toFiniteNumber(value: unknown): number | null {
  if (isFiniteNumber(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toExtractedSpotRecord(value: unknown, index: number): SpotDbExtractedRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const id = toText(record.id, `spot-${index + 1}`);
  const name = toText(record.name);
  const lat = record.lat;
  const lng = record.lng;
  if (!name || !isFiniteNumber(lat) || !isFiniteNumber(lng)) return null;

  return {
    ...record,
    id,
    name,
    lat,
    lng,
    source: toText(record.source, "unknown"),
    address: toText(record.address),
    kinds: toText(record.kinds),
    description: toText(record.description),
    coordinate_basis: toText(record.coordinate_basis),
    source_url: toText(record.source_url),
    map_zone: toText(record.map_zone),
    building_code: toText(record.building_code),
    official_map_ids_2025: record.official_map_ids_2025,
    sub_facilities: record.sub_facilities,
  };
}

function fallbackExtractedSpotRecords(): SpotDbExtractedRecord[] {
  return SPOT_DB.map((spot) => ({
    id: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    source: "fallback:route.ts",
    address: "",
    kinds: "",
    description: [spot.overview, ...spot.facts].join(" / "),
    official_map_ids_2025: [],
    coordinate_basis: "",
    source_url: "",
    map_zone: "",
    building_code: "",
    sub_facilities: [],
  }));
}

function normalizeTextFragments(value: string): string[] {
  return value
    .split(/[。/\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function inferRankFromExtractedSpot(record: SpotDbExtractedRecord): SpotRank {
  const kinds = toText(record.kinds).toLowerCase();
  const name = toText(record.name).toLowerCase();

  if (name.includes("gate") || name.includes("ゲート")) return 4;
  if (name.includes("library") || name.includes("図書")) return 1;
  if (kinds.includes("bus_stop") || kinds.includes("plaza")) return 1;
  if (kinds.includes("service") || kinds.includes("shop") || kinds.includes("food")) return 2;
  if (kinds.includes("research") || kinds.includes("lab")) return 3;
  return 2;
}

function toRouteSpotFromExtracted(record: SpotDbExtractedRecord): SpotRecord {
  const description = toText(record.description);
  const address = toText(record.address);
  const kinds = toText(record.kinds);
  const fragments = normalizeTextFragments(description);
  const factCandidates = [
    ...fragments,
    address ? `所在地: ${address}` : "",
    kinds ? `分類: ${kinds}` : "",
  ].filter((item) => item.length > 0);

  const facts = dedupeIds(factCandidates).slice(0, 3);
  const overview =
    facts[0] ??
    (address ? `${record.name}（${address}）` : `${record.name}の見どころを案内するスポット`);

  return {
    id: record.id,
    name: record.name,
    overview,
    facts: facts.length > 0 ? facts : [`${record.name}の見どころを案内するスポット`],
    rank: inferRankFromExtractedSpot(record),
    lat: record.lat,
    lng: record.lng,
  };
}

function upsertSpotRegistryFromExtracted(records: SpotDbExtractedRecord[]): {
  insertedCount: number;
  updatedCount: number;
} {
  let insertedCount = 0;
  let updatedCount = 0;

  for (const record of records) {
    const mapped = toRouteSpotFromExtracted(record);
    const existing = SPOT_BY_ID[mapped.id];
    if (!existing) {
      SPOT_BY_ID[mapped.id] = mapped;
      insertedCount += 1;
      continue;
    }
    if (existing.id === START_SPOT_ID) {
      continue;
    }
    SPOT_BY_ID[mapped.id] = mapped;
    updatedCount += 1;
  }

  return {
    insertedCount,
    updatedCount,
  };
}

function isLegacyFixedPool(ids: string[]): boolean {
  const normalized = dedupeIds(ids);
  if (normalized.length !== LEGACY_FIXED_POOL_IDS.length) return false;
  return normalized.every((id) => LEGACY_FIXED_POOL_IDS.includes(id));
}

async function resolveSpotDbPath(): Promise<string | null> {
  const envConfiguredPath = [process.env.ADMIN_SPOT_DB_PATH, process.env.MASTRA_ITO_SPOT_DB_PATH]
    .map((value) => toText(value))
    .find((value) => value.length > 0);
  const candidates = envConfiguredPath
    ? [envConfiguredPath, ...DEFAULT_SPOT_DB_CANDIDATE_PATHS]
    : DEFAULT_SPOT_DB_CANDIDATE_PATHS;

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function loadExtractedSpotDbRecords(): Promise<{
  records: SpotDbExtractedRecord[];
  sourcePath: string | null;
  status: "loaded" | "fallback";
  reason: string;
}> {
  const spotDbPath = await resolveSpotDbPath();
  if (!spotDbPath) {
    return {
      records: fallbackExtractedSpotRecords(),
      sourcePath: null,
      status: "fallback",
      reason: "spot-db file not found",
    };
  }

  try {
    const rawFile = await fs.readFile(spotDbPath, "utf8");
    const payload = JSON.parse(rawFile) as { spots?: unknown };
    const rawSpots = Array.isArray(payload.spots) ? payload.spots : [];
    const records = rawSpots
      .map((entry, index) => toExtractedSpotRecord(entry, index))
      .filter((entry): entry is SpotDbExtractedRecord => Boolean(entry));

    return {
      records,
      sourcePath: spotDbPath,
      status: "loaded",
      reason: "loaded from spot-db file",
    };
  } catch (error) {
    return {
      records: fallbackExtractedSpotRecords(),
      sourcePath: spotDbPath,
      status: "fallback",
      reason: error instanceof Error ? error.message : "failed to parse spot-db",
    };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `qg-${crypto.randomUUID()}`;
  }
  return `qg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function clipText(value: string, maxLength = 1200): string {
  if (value.length <= maxLength) return value;
  const hiddenChars = value.length - maxLength;
  return `${value.slice(0, maxLength)}... [truncated ${hiddenChars} chars]`;
}

function clipForTraceLog(value: string, maxLength = 1200): string {
  return FULL_LOG_MODE ? value : clipText(value, maxLength);
}

function formatLogPayload(payload?: Record<string, unknown>): string {
  if (!payload) return "";
  try {
    return ` ${JSON.stringify(payload)}`;
  } catch {
    return " [payload-serialize-error]";
  }
}

const FULL_LOG_MODE = toText(process.env.KYUDAI_QUEST_LOG_FULL, "true").toLowerCase() === "true";
const LOG_MAX_STRING_LENGTH = FULL_LOG_MODE ? 200000 : 3200;
const LOG_MAX_ARRAY_ITEMS = FULL_LOG_MODE ? 1000 : 40;
const LOG_MAX_OBJECT_KEYS = FULL_LOG_MODE ? 1000 : 60;
const LOG_MAX_DEPTH = FULL_LOG_MODE ? 20 : 6;

function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return clipText(value, LOG_MAX_STRING_LENGTH);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    if (depth >= LOG_MAX_DEPTH) {
      return `[max-depth-array length=${value.length}]`;
    }
    const limited = value.slice(0, LOG_MAX_ARRAY_ITEMS).map((item) => sanitizeLogValue(item, depth + 1));
    if (value.length > LOG_MAX_ARRAY_ITEMS) {
      limited.push(`[truncated ${value.length - LOG_MAX_ARRAY_ITEMS} items]`);
    }
    return limited;
  }

  if (typeof value === "object") {
    if (depth >= LOG_MAX_DEPTH) {
      return "[max-depth-object]";
    }
    const entries = Object.entries(value as Record<string, unknown>);
    const limitedEntries = entries.slice(0, LOG_MAX_OBJECT_KEYS);
    const normalized = Object.fromEntries(
      limitedEntries.map(([key, entryValue]) => [key, sanitizeLogValue(entryValue, depth + 1)]),
    );
    if (entries.length > LOG_MAX_OBJECT_KEYS) {
      normalized.__truncatedKeys = entries.length - LOG_MAX_OBJECT_KEYS;
    }
    return normalized;
  }

  return String(value);
}

function sanitizeLogPayload(payload?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, sanitizeLogValue(value)]),
  );
}

function buildReadyReflectionSummary(quest: QuestOutput): Record<string, unknown> {
  const spotScenarioCoverage = quest.spots.map((spot) => ({
    id: spot.id,
    scenarioCount: Array.isArray(spot.scenarioTexts) ? spot.scenarioTexts.length : 0,
  }));
  const readyFieldsPresent =
    toText(quest.readyHeroLead).length > 0 &&
    toText(quest.readySummaryTitle).length > 0 &&
    toText(quest.readySummaryText).length > 0 &&
    toText(quest.generatedStoryName).length > 0;

  return {
    readyFieldsPresent,
    generatedStoryName: clipText(quest.generatedStoryName, 280),
    storyTone: clipText(quest.storyTone, 280),
    readyHeroLead: clipText(quest.readyHeroLead, 280),
    readySummaryTitle: clipText(quest.readySummaryTitle, 280),
    readySummaryTextPreview: clipText(quest.readySummaryText, 520),
    prologueBodyChars: quest.prologueBody.length,
    epilogueBodyChars: quest.epilogueBody.length,
    spotsCount: quest.spots.length,
    spotIds: quest.spots.map((spot) => spot.id),
    spotScenarioCoverage,
    appBindingContract: {
      readyHeroLead: "quest.readyHeroLead -> generatedQuest.readyHeroLead -> Ready画面タイトル",
      readySummaryTitle: "quest.readySummaryTitle -> generatedQuest.readySummaryTitle -> Ready画面見出し",
      readySummaryText: "quest.readySummaryText -> generatedQuest.readySummaryText -> Ready画面本文",
      generatedStoryName: "quest.generatedStoryName -> generatedQuest.generatedStoryName -> Ready画面生成物語名",
    },
  };
}

function toGenerationStepId(value: unknown): GenerationStepId | null {
  if (typeof value !== "string") return null;
  return GENERATION_STEP_ORDER.includes(value as GenerationStepId) ? (value as GenerationStepId) : null;
}

function parseJsonObjectText<T>(rawText: string): T | null {
  const normalized = rawText.trim();
  if (!normalized) return null;

  const parseTargets = [normalized];
  const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) parseTargets.push(fenced[1].trim());

  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    parseTargets.push(normalized.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of parseTargets) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      continue;
    }
  }
  return null;
}

function normalizeUserType(value: unknown): UserTypeBucket {
  const text = toText(value, "新入生");
  if (text.includes("在学生")) return "在学生";
  if (text.includes("保護者")) return "保護者";
  if (text.includes("教職員")) return "教職員";
  if (text.includes("新入生")) return "新入生";
  return "その他";
}

function normalizeFamiliarity(value: unknown): FamiliarityBucket {
  const text = toText(value, "まだあまり慣れていない");
  if (text.includes("はじめて")) return "はじめて来た";
  if (text.includes("よく")) return "よく来ている";
  if (text.includes("何度")) return "何度か来たことがある";
  return "まだあまり慣れていない";
}

function normalizeDuration(value: unknown): DurationBucket {
  const text = toText(value, "20〜30分");
  if (text.includes("15") || text.includes("20分")) return "15〜20分";
  if (text.includes("45") || text.includes("30〜45")) return "30〜45分";
  return "20〜30分";
}

function applyTemplate(template: string, replacements: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key) => replacements[key] ?? "");
}

function dedupeIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function resolveSpotRoleTemplates(spotCount: number): string[] {
  if (spotCount <= 4) return [...DEFAULT_SPOT_ROLE_TEMPLATE_4].slice(0, Math.max(spotCount, 1));
  if (spotCount === 5) return [...DEFAULT_SPOT_ROLE_TEMPLATE_5];
  if (spotCount === 6) return [...DEFAULT_SPOT_ROLE_TEMPLATE_6];
  const base = [...DEFAULT_SPOT_ROLE_TEMPLATE_6];
  const result: string[] = [];
  for (let index = 0; index < spotCount; index += 1) {
    if (index < base.length) {
      result.push(base[index]);
    } else if (index === spotCount - 1) {
      result.push("終着点で全体をつなぐ");
    } else {
      result.push(`中継地点${index + 1}の役割を回収する`);
    }
  }
  return result;
}

function buildDefaultQuestStructure(roleTemplates: string[]): string {
  if (roleTemplates.length === 0) return "序盤: 起点を理解する。終盤: 全体を接続して終える。";
  if (roleTemplates.length === 1) return `単地点: ${roleTemplates[0]}。`;
  const middleRoles = roleTemplates.slice(1, -1);
  const middleSummary = middleRoles.length > 0 ? middleRoles.join(" → ") : "中間地点なし";
  return `序盤: ${roleTemplates[0]}\n中盤: ${middleSummary}\n終盤: ${roleTemplates[roleTemplates.length - 1]}`;
}

function buildSpotPromptInputs(params: {
  routeSpots: SpotRecord[];
  roleTemplates: string[];
  routeReasonMap: Record<string, string>;
  routeSpotKnowledgeByRouteId: Map<string, RouteSpotKnowledge>;
}): SpotPromptInput[] {
  return params.routeSpots.map((spot, index) => {
    const nextSpot = params.routeSpots[index + 1];
    const nextRole = params.roleTemplates[index + 1] ?? "次の地点の役割";
    const knowledge = params.routeSpotKnowledgeByRouteId.get(spot.id);
    const knowledgeSummary = (knowledge?.knowledgeCandidates ?? [])
      .slice(0, 2)
      .map((record) => formatSpotKnowledgeForPrompt(record))
      .join(" / ");
    const facilitySummary = [spot.overview, ...spot.facts].filter((item) => item.length > 0).slice(0, 2).join(" ");
    return {
      spot_id: spot.id,
      spot_name: spot.name,
      spot_order: index + 1,
      spot_role: params.roleTemplates[index] ?? `地点${index + 1}の役割`,
      facility_summary: facilitySummary || `${spot.name}の特徴を確認する地点`,
      why_selected: toText(params.routeReasonMap[spot.id], "ルート全体の連続性を保つため。"),
      what_player_should_notice: spot.facts[0] ?? spot.overview,
      transition_to_next: nextSpot
        ? `${nextSpot.name}へ向かい、「${nextRole}」を回収する。`
        : "最終スポットです。見てきた場所を一本の行動導線として結び直して締める。",
      optional_notes: knowledgeSummary || "なし",
    };
  });
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceMetersBetweenCoordinates(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const earthRadius = 6371000;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const latProduct = Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat));
  const haversine = sinLat * sinLat + latProduct * sinLng * sinLng;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

function distanceMetersBetweenSpots(a: SpotRecord, b: SpotRecord): number {
  return distanceMetersBetweenCoordinates(a, b);
}

function buildRouteSpotKnowledge(
  routeIds: string[],
  extractedSpotDbRecords: SpotDbExtractedRecord[],
): RouteSpotKnowledge[] {
  const extractedById = new Map(extractedSpotDbRecords.map((record) => [record.id, record]));
  const coordinateReadyRecords = extractedSpotDbRecords.filter(
    (record) => isFiniteNumber(record.lat) && isFiniteNumber(record.lng),
  );

  return routeIds.map((routeSpotId) => {
    const routeSpot = SPOT_BY_ID[routeSpotId];
    const directMatch = extractedById.get(routeSpotId) ?? null;
    if (directMatch) {
      return {
        routeSpotId,
        routeSpotName: routeSpot?.name ?? routeSpotId,
        matchedBy: "id",
        matchedSpotDbId: directMatch.id,
        matchedSpotDbName: directMatch.name,
        matchedDistanceMeters: 0,
        knowledgeCandidates: [directMatch],
      };
    }

    if (!routeSpot || coordinateReadyRecords.length === 0) {
      return {
        routeSpotId,
        routeSpotName: routeSpot?.name ?? routeSpotId,
        matchedBy: "none",
        matchedSpotDbId: null,
        matchedSpotDbName: null,
        matchedDistanceMeters: null,
        knowledgeCandidates: [],
      };
    }

    const nearestCandidates = coordinateReadyRecords
      .map((record) => ({
        record,
        distanceMeters: distanceMetersBetweenCoordinates(routeSpot, record),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);

    return {
      routeSpotId,
      routeSpotName: routeSpot.name,
      matchedBy: nearestCandidates.length > 0 ? "nearest" : "none",
      matchedSpotDbId: nearestCandidates[0]?.record.id ?? null,
      matchedSpotDbName: nearestCandidates[0]?.record.name ?? null,
      matchedDistanceMeters: nearestCandidates[0]
        ? Math.round(nearestCandidates[0].distanceMeters)
        : null,
      knowledgeCandidates: nearestCandidates.map((item) => item.record),
    };
  });
}

function formatSpotKnowledgeForPrompt(record: SpotDbExtractedRecord): string {
  const fragments = [
    `id=${record.id}`,
    `name=${record.name}`,
    `kinds=${toText(record.kinds) || "-"}`,
  ];
  const description = toText(record.description);
  if (description) fragments.push(`description=${description}`);
  const address = toText(record.address);
  if (address) fragments.push(`address=${address}`);
  const zone = toText(record.map_zone);
  if (zone) fragments.push(`zone=${zone}`);
  const building = toText(record.building_code);
  if (building) fragments.push(`building=${building}`);
  return fragments.join(", ");
}

function filterRouteSpotIdsByRadius(
  spotIds: string[],
  origin: { lat: number; lng: number },
  maxRadiusMeters: number,
): string[] {
  return spotIds.filter((spotId) => {
    const spot = SPOT_BY_ID[spotId];
    if (!spot) return false;
    return distanceMetersBetweenCoordinates(origin, spot) <= maxRadiusMeters;
  });
}

function sortSpotIdsByDistanceFromOrigin(
  spotIds: string[],
  origin: { lat: number; lng: number },
): string[] {
  return [...spotIds].sort((a, b) => {
    const spotA = SPOT_BY_ID[a];
    const spotB = SPOT_BY_ID[b];
    if (!spotA || !spotB) return 0;
    const distanceA = distanceMetersBetweenCoordinates(origin, spotA);
    const distanceB = distanceMetersBetweenCoordinates(origin, spotB);
    return distanceA - distanceB;
  });
}

function buildCandidateDistanceMatrixMeters(
  candidateSpots: Step4CompactSpot[],
): Array<{ fromId: string; toId: string; distanceMeters: number }> {
  const rows: Array<{ fromId: string; toId: string; distanceMeters: number }> = [];

  for (const from of candidateSpots) {
    for (const to of candidateSpots) {
      if (from.id === to.id) continue;
      const distanceMeters = Math.round(
        distanceMetersBetweenCoordinates(
          { lat: from.lat, lng: from.lng },
          { lat: to.lat, lng: to.lng },
        ),
      );
      rows.push({
        fromId: from.id,
        toId: to.id,
        distanceMeters,
      });
    }
  }

  return rows;
}

function buildStep4CompactRouteInput(params: {
  poolBaseIds: string[];
  extractedSpotDbRecords: SpotDbExtractedRecord[];
  currentOrigin: { lat: number; lng: number };
  userType: UserTypeBucket;
  familiarity: FamiliarityBucket;
  duration: DurationBucket;
  explorationStyle: string;
  experienceExpectation: string;
  targetCount: number;
  maxReachableRadiusMeters: number;
  minSegmentDistanceMeters: number;
  maxSegmentDistanceMeters: number;
  fallbackRouteIds: string[];
}): Step4CompactRouteInput {
  const extractedById = new Map(params.extractedSpotDbRecords.map((record) => [record.id, record] as const));

  const candidateSpots = params.poolBaseIds
    .map((id) => {
      const fallbackSpot = SPOT_BY_ID[id];
      if (!fallbackSpot) return null;
      const extractedSpot = extractedById.get(id);
      const lat = extractedSpot && isFiniteNumber(extractedSpot.lat) ? extractedSpot.lat : fallbackSpot.lat;
      const lng = extractedSpot && isFiniteNumber(extractedSpot.lng) ? extractedSpot.lng : fallbackSpot.lng;
      return {
        id,
        lat,
        lng,
        distanceFromCurrentMeters: Math.round(
          distanceMetersBetweenCoordinates(params.currentOrigin, {
            lat,
            lng,
          }),
        ),
        rank: fallbackSpot.rank,
        source: extractedSpot ? "step3-extracted" : "fallback-spot-db",
      } satisfies Step4CompactSpot;
    })
    .filter((item): item is Step4CompactSpot => Boolean(item));
  const candidateDistanceMatrixMeters = buildCandidateDistanceMatrixMeters(candidateSpots);
  const baselineRouteLegDistances = buildRouteLegDistances(params.fallbackRouteIds);
  const baselineRouteTotalDistanceMeters = baselineRouteLegDistances.reduce(
    (sum, leg) => sum + leg.distanceMeters,
    0,
  );

  return {
    currentLocation: params.currentOrigin,
    travelMode: "walking",
    userType: params.userType,
    familiarity: params.familiarity,
    duration: params.duration,
    explorationStyle: params.explorationStyle,
    experienceExpectation: params.experienceExpectation,
    targetCount: params.targetCount,
    maxReachableRadiusMeters: params.maxReachableRadiusMeters,
    minSegmentDistanceMeters: params.minSegmentDistanceMeters,
    maxSegmentDistanceMeters: params.maxSegmentDistanceMeters,
    requiredStartSpotId: START_SPOT_ID,
    candidateSpots,
    candidateDistanceMatrixMeters,
    baselineRoute: {
      routeIds: params.fallbackRouteIds,
      totalDistanceMeters: baselineRouteTotalDistanceMeters,
      legDistances: baselineRouteLegDistances,
    },
  };
}

function getSegmentDistanceMeters(fromId: string, toId: string): number | null {
  const fromSpot = SPOT_BY_ID[fromId];
  const toSpot = SPOT_BY_ID[toId];
  if (!fromSpot || !toSpot) return null;
  return distanceMetersBetweenSpots(fromSpot, toSpot);
}

function isWalkableSegment(
  fromId: string,
  toId: string,
  minSegmentDistanceMeters: number,
  maxSegmentDistanceMeters: number,
): boolean {
  const distance = getSegmentDistanceMeters(fromId, toId);
  if (distance === null) return false;
  const roundedDistance = Math.round(distance);
  return roundedDistance >= minSegmentDistanceMeters && roundedDistance <= maxSegmentDistanceMeters;
}

function canReachRemainingStepsWithinWalkLimit(
  fromId: string,
  availableSpotIds: string[],
  remainingSteps: number,
  minSegmentDistanceMeters: number,
  maxSegmentDistanceMeters: number,
): boolean {
  if (remainingSteps <= 0) return true;

  const candidates = dedupeIds(availableSpotIds).filter(
    (id) => id !== START_SPOT_ID && Boolean(SPOT_BY_ID[id]),
  );
  if (candidates.length < remainingSteps) return false;

  const dfs = (currentId: string, remainingIds: string[], stepsLeft: number): boolean => {
    if (stepsLeft <= 0) return true;
    if (remainingIds.length < stepsLeft) return false;

    for (let index = 0; index < remainingIds.length; index += 1) {
      const candidateId = remainingIds[index];
      if (
        !isWalkableSegment(
          currentId,
          candidateId,
          minSegmentDistanceMeters,
          maxSegmentDistanceMeters,
        )
      ) {
        continue;
      }
      const nextRemaining = remainingIds.filter((_id, innerIndex) => innerIndex !== index);
      if (dfs(candidateId, nextRemaining, stepsLeft - 1)) return true;
    }
    return false;
  };

  return dfs(fromId, candidates, remainingSteps);
}

function clampRoute(
  routeIds: string[],
  middleCandidates: string[],
  targetCount: number,
  minSegmentDistanceMeters = 0,
  maxSegmentDistanceMeters = Number.POSITIVE_INFINITY,
): string[] {
  const target = Math.max(1, targetCount);
  if (target === 1) return [START_SPOT_ID];

  const filtered = dedupeIds(routeIds.filter((id) => Boolean(SPOT_BY_ID[id])));
  const prioritizedSpots = dedupeIds([...filtered, ...middleCandidates]).filter(
    (id) => id !== START_SPOT_ID && Boolean(SPOT_BY_ID[id]),
  );

  const selectedSpots: string[] = [];
  const remainingSpots = [...prioritizedSpots];
  let currentId = START_SPOT_ID;

  while (selectedSpots.length < target - 1 && remainingSpots.length > 0) {
    const nextIndex = remainingSpots.findIndex((candidateId, candidateIndex) => {
      if (
        !isWalkableSegment(
          currentId,
          candidateId,
          minSegmentDistanceMeters,
          maxSegmentDistanceMeters,
        )
      ) {
        return false;
      }
      const futureSpotIds = remainingSpots.filter((_, index) => index !== candidateIndex);
      const remainingAfterPick = target - (selectedSpots.length + 2);
      return canReachRemainingStepsWithinWalkLimit(
        candidateId,
        futureSpotIds,
        remainingAfterPick,
        minSegmentDistanceMeters,
        maxSegmentDistanceMeters,
      );
    });

    if (nextIndex === -1) break;

    const [nextId] = remainingSpots.splice(nextIndex, 1);
    selectedSpots.push(nextId);
    currentId = nextId;
  }

  return [START_SPOT_ID, ...selectedSpots].slice(0, target);
}

function buildRouteLegDistances(routeIds: string[]): Array<{ fromId: string; toId: string; distanceMeters: number }> {
  const legs: Array<{ fromId: string; toId: string; distanceMeters: number }> = [];

  for (let index = 0; index < routeIds.length - 1; index += 1) {
    const fromId = routeIds[index];
    const toId = routeIds[index + 1];
    const distance = getSegmentDistanceMeters(fromId, toId);
    if (distance === null) continue;
    legs.push({
      fromId,
      toId,
      distanceMeters: Math.round(distance),
    });
  }

  return legs;
}

function sumRouteDistance(legs: Array<{ fromId: string; toId: string; distanceMeters: number }>): number {
  return legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);
}

function findShortestDistanceRoute(params: {
  candidatePoolIds: string[];
  targetCount: number;
  minSegmentDistanceMeters: number;
  maxSegmentDistanceMeters: number;
}): {
  routeIds: string[];
  routeLegDistances: Array<{ fromId: string; toId: string; distanceMeters: number }>;
  totalDistanceMeters: number;
  searchedRouteCount: number;
  truncated: boolean;
  cappedCandidateCount: number;
} | null {
  const selectionTarget = Math.max(0, params.targetCount - 1);
  const allCandidates = dedupeIds(params.candidatePoolIds).filter(
    (id) => id !== START_SPOT_ID && Boolean(SPOT_BY_ID[id]),
  );
  const candidateSpots = allCandidates.slice(0, STEP4_MAX_ENUMERATION_MIDDLE_CANDIDATES);
  const cappedCandidateCount = candidateSpots.length;

  if (selectionTarget === 0) {
    const routeIds = [START_SPOT_ID];
    const routeLegDistances = buildRouteLegDistances(routeIds);
    return {
      routeIds,
      routeLegDistances,
      totalDistanceMeters: sumRouteDistance(routeLegDistances),
      searchedRouteCount: 1,
      truncated: false,
      cappedCandidateCount,
    };
  }

  if (candidateSpots.length < selectionTarget) return null;

  let searchedRouteCount = 0;
  let truncated = false;
  let bestRouteIds: string[] | null = null;
  let bestRouteLegDistances: Array<{ fromId: string; toId: string; distanceMeters: number }> = [];
  let bestTotalDistanceMeters = Number.POSITIVE_INFINITY;
  let bestLongestSegmentMeters = Number.POSITIVE_INFINITY;

  const dfs = (
    currentId: string,
    remainingIds: string[],
    selectedSpotIds: string[],
    distanceSoFar: number,
  ) => {
    if (truncated) return;

    if (selectedSpotIds.length === selectionTarget) {
      const routeIds = [START_SPOT_ID, ...selectedSpotIds];
      const routeLegDistances = buildRouteLegDistances(routeIds);
      const totalDistanceMeters = distanceSoFar;
      const longestSegmentMeters = routeLegDistances.reduce(
        (max, leg) => Math.max(max, leg.distanceMeters),
        0,
      );
      searchedRouteCount += 1;
      if (
        searchedRouteCount >= STEP4_MAX_ROUTE_ENUMERATION &&
        remainingIds.length > 0
      ) {
        truncated = true;
      }
      if (
        totalDistanceMeters < bestTotalDistanceMeters ||
        (totalDistanceMeters === bestTotalDistanceMeters &&
          longestSegmentMeters < bestLongestSegmentMeters)
      ) {
        bestRouteIds = routeIds;
        bestRouteLegDistances = routeLegDistances;
        bestTotalDistanceMeters = totalDistanceMeters;
        bestLongestSegmentMeters = longestSegmentMeters;
      }
      return;
    }

    const needed = selectionTarget - selectedSpotIds.length;
    if (remainingIds.length < needed) return;

    for (let index = 0; index < remainingIds.length; index += 1) {
      if (truncated) return;
      const candidateId = remainingIds[index];
      const segmentDistance = getSegmentDistanceMeters(currentId, candidateId);
      if (
        segmentDistance === null ||
        Math.round(segmentDistance) < params.minSegmentDistanceMeters ||
        Math.round(segmentDistance) > params.maxSegmentDistanceMeters
      ) {
        continue;
      }
      const roundedSegmentDistance = Math.round(segmentDistance);
      const nextRemaining = remainingIds.filter((_id, innerIndex) => innerIndex !== index);
      const remainingAfterPick = selectionTarget - (selectedSpotIds.length + 1);
      if (
        !canReachRemainingStepsWithinWalkLimit(
          candidateId,
          nextRemaining,
          remainingAfterPick,
          params.minSegmentDistanceMeters,
          params.maxSegmentDistanceMeters,
        )
      ) {
        continue;
      }
      dfs(
        candidateId,
        nextRemaining,
        [...selectedSpotIds, candidateId],
        distanceSoFar + roundedSegmentDistance,
      );
    }
  };

  dfs(START_SPOT_ID, candidateSpots, [], 0);
  if (!bestRouteIds) return null;

  return {
    routeIds: bestRouteIds,
    routeLegDistances: bestRouteLegDistances,
    totalDistanceMeters: bestTotalDistanceMeters,
    searchedRouteCount,
    truncated,
    cappedCandidateCount,
  };
}

function buildRouteDistanceSummary(params: {
  routeLegDistances: Array<{ fromId: string; toId: string; distanceMeters: number }>;
  baselineRouteTotalDistanceMeters: number;
  deterministicBestTotalDistanceMeters: number | null;
  deterministicSearchCapped: boolean;
  deterministicSearchTruncated: boolean;
  deterministicCandidateCount: number;
  selectedRouteSource: "ai" | "algorithmic-override" | "fallback";
}): {
  selectedRouteSource: "ai" | "algorithmic-override" | "fallback";
  selectedRouteTotalDistanceMeters: number;
  baselineRouteTotalDistanceMeters: number;
  deltaVsBaselineMeters: number;
  deltaVsBaselineRate: number | null;
  deterministicBestTotalDistanceMeters: number | null;
  deltaVsDeterministicBestMeters: number | null;
  deterministicSearchCapped: boolean;
  deterministicSearchTruncated: boolean;
  deterministicCandidateCount: number;
} {
  const selectedRouteTotalDistanceMeters = sumRouteDistance(params.routeLegDistances);
  const baselineRouteTotalDistanceMeters = params.baselineRouteTotalDistanceMeters;
  const deltaVsBaselineMeters = selectedRouteTotalDistanceMeters - baselineRouteTotalDistanceMeters;
  const deltaVsBaselineRate =
    baselineRouteTotalDistanceMeters > 0
      ? Number((deltaVsBaselineMeters / baselineRouteTotalDistanceMeters).toFixed(3))
      : null;
  const deterministicComparable =
    !params.deterministicSearchCapped && !params.deterministicSearchTruncated;
  const deltaVsDeterministicBestMeters =
    params.deterministicBestTotalDistanceMeters === null || !deterministicComparable
      ? null
      : selectedRouteTotalDistanceMeters - params.deterministicBestTotalDistanceMeters;

  return {
    selectedRouteSource: params.selectedRouteSource,
    selectedRouteTotalDistanceMeters,
    baselineRouteTotalDistanceMeters,
    deltaVsBaselineMeters,
    deltaVsBaselineRate,
    deterministicBestTotalDistanceMeters: params.deterministicBestTotalDistanceMeters,
    deltaVsDeterministicBestMeters,
    deterministicSearchCapped: params.deterministicSearchCapped,
    deterministicSearchTruncated: params.deterministicSearchTruncated,
    deterministicCandidateCount: params.deterministicCandidateCount,
  };
}

function normalizeRouteReasonMap(step4Data: RouteStep4Result | null, routeIds: string[]): Record<string, string> {
  if (!step4Data) return {};

  const directMap = asRecord(step4Data.routeReasonMap);
  if (directMap) {
    return Object.fromEntries(
      Object.entries(directMap).map(([spotId, reason]) => [spotId, toText(reason, "導線と体験目的の両立のため")]),
    );
  }

  const legacyMap = asRecord(step4Data.reasons);
  if (legacyMap) {
    return Object.fromEntries(
      Object.entries(legacyMap).map(([spotId, reason]) => [spotId, toText(reason, "導線と体験目的の両立のため")]),
    );
  }

  if (Array.isArray(step4Data.spotReasons)) {
    const entries = step4Data.spotReasons
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const spotId = toText((item as { spotId?: unknown }).spotId);
        const reason = toText((item as { reason?: unknown }).reason);
        if (!spotId) return null;
        return [spotId, reason || "導線と体験目的の両立のため"] as const;
      })
      .filter((item): item is readonly [string, string] => Boolean(item));
    if (entries.length > 0) return Object.fromEntries(entries);
  }

  return Object.fromEntries(
    routeIds.map((spotId) => [spotId, "徒歩制約と体験文脈の両立のため"]),
  );
}

function ensureRouteReasonMap(
  routeIds: string[],
  rawReasonMap: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};

  routeIds.forEach((spotId, index) => {
    const explicitReason = toText(rawReasonMap[spotId]);
    if (explicitReason) {
      normalized[spotId] = explicitReason;
      return;
    }

    if (index === 0) {
      normalized[spotId] = "開始地点を固定する制約を満たすため。";
      return;
    }
    if (index === routeIds.length - 1) {
      normalized[spotId] = "終点として総歩行距離を抑えられる配置のため。";
      return;
    }
    normalized[spotId] = "前後スポットとの歩行距離と体験文脈の両立を満たすため。";
  });

  return normalized;
}

function buildRouteQualitySummary(
  routeIds: string[],
  targetCount: number,
  minSegmentDistanceMeters: number,
  maxSegmentDistanceMeters: number,
): {
  targetCount: number;
  actualCount: number;
  totalDistanceMeters: number;
  longestSegmentMeters: number;
  estimatedWalkingMinutes: number;
  constraintChecks: {
    startsAtRequiredSpot: boolean;
    spotCountMatchesTarget: boolean;
    allSegmentsWithinLimit: boolean;
    hasDuplicateSpot: boolean;
  };
  violatedConstraints: string[];
} {
  const routeLegDistances = buildRouteLegDistances(routeIds);
  const totalDistanceMeters = routeLegDistances.reduce((sum, leg) => sum + leg.distanceMeters, 0);
  const longestSegmentMeters = routeLegDistances.reduce(
    (max, leg) => Math.max(max, leg.distanceMeters),
    0,
  );
  const estimatedWalkingMinutes = Number(
    (totalDistanceMeters / WALKING_METERS_PER_MINUTE).toFixed(1),
  );
  const startsAtRequiredSpot = routeIds[0] === START_SPOT_ID;
  const spotCountMatchesTarget = routeIds.length === targetCount;
  const allSegmentsWithinLimit = routeLegDistances.every(
    (leg) =>
      leg.distanceMeters >= minSegmentDistanceMeters &&
      leg.distanceMeters <= maxSegmentDistanceMeters,
  );
  const hasDuplicateSpot = routeIds.length !== new Set(routeIds).size;
  const violatedConstraints: string[] = [];
  if (!startsAtRequiredSpot) violatedConstraints.push("startsAtRequiredSpot");
  if (!spotCountMatchesTarget) violatedConstraints.push("spotCountMatchesTarget");
  if (!allSegmentsWithinLimit) violatedConstraints.push("allSegmentsWithinLimit");
  if (hasDuplicateSpot) violatedConstraints.push("hasDuplicateSpot");

  return {
    targetCount,
    actualCount: routeIds.length,
    totalDistanceMeters,
    longestSegmentMeters,
    estimatedWalkingMinutes,
    constraintChecks: {
      startsAtRequiredSpot,
      spotCountMatchesTarget,
      allSegmentsWithinLimit,
      hasDuplicateSpot,
    },
    violatedConstraints,
  };
}

function sanitizeNarrativeResult(input: NarrativeStep6Result, routeIds: string[]): NarrativeStep6Result {
  const spotMap = new Map<string, NonNullable<NarrativeStep6Result["spots"]>[number]>();
  for (const spot of input.spots ?? []) {
    const id = toText(spot.id);
    if (!id || !SPOT_BY_ID[id]) continue;
    spotMap.set(id, spot);
  }

  const sanitizedSpots = routeIds.map((id) => {
    const source = spotMap.get(id);
    const scenarioTexts = toStringArray(source?.scenarioTexts)
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .slice(0, 3);

    return {
      id,
      name: toText(source?.name),
      overview: toText(source?.overview),
      rationale: toText(source?.rationale),
      scenarioTexts,
    };
  });

  return {
    generatedStoryName: toText(input.generatedStoryName),
    storyTone: toText(input.storyTone),
    readyHeroLead: toText(input.readyHeroLead),
    readySummaryTitle: toText(input.readySummaryTitle),
    readySummaryText: toText(input.readySummaryText),
    prologueBody: toText(input.prologueBody),
    epilogueBody: toText(input.epilogueBody),
    spots: sanitizedSpots,
  };
}

function validateNarrativeResult(input: NarrativeStep6Result, routeIds: string[]): string[] {
  const errors: string[] = [];

  if (!toText(input.generatedStoryName)) errors.push("generatedStoryName が空です");
  if (!toText(input.readyHeroLead)) errors.push("readyHeroLead が空です");
  if (!toText(input.readySummaryTitle)) errors.push("readySummaryTitle が空です");
  if (!toText(input.readySummaryText)) errors.push("readySummaryText が空です");
  if (!toText(input.prologueBody)) errors.push("prologueBody が空です");
  if (!toText(input.epilogueBody)) errors.push("epilogueBody が空です");

  const spots = input.spots ?? [];
  if (spots.length !== routeIds.length) {
    errors.push(`spots 件数が不正です: expected=${routeIds.length}, actual=${spots.length}`);
  }

  for (const id of routeIds) {
    const spot = spots.find((item) => toText(item.id) === id);
    if (!spot) {
      errors.push(`spots に ${id} がありません`);
      continue;
    }
    if (!toText(spot.name)) errors.push(`${id} の name が空です`);
    if (!toText(spot.overview)) errors.push(`${id} の overview が空です`);
    if (!toText(spot.rationale)) errors.push(`${id} の rationale が空です`);
    const scenarioTexts = toStringArray(spot.scenarioTexts);
    if (scenarioTexts.length !== 3) {
      errors.push(`${id} の scenarioTexts は3要素ちょうど必要です`);
    }
    for (let index = 0; index < scenarioTexts.length; index += 1) {
      if (!toText(scenarioTexts[index])) {
        errors.push(`${id} の scenarioTexts[${index}] が空です`);
      }
    }
  }

  return errors;
}

async function callGeminiJson<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
}): Promise<GeminiJsonCallResult<T>> {
  const apiKey = toText(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = toText(params.model, GEMINI_ROUTE_MODEL);
  if (!apiKey) {
    return {
      data: null,
      error: "GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY が未設定です。",
      model,
    };
  }

  const endpoint = `${GEMINI_ENDPOINT_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: params.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }],
          },
        ],
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        data: null,
        error: `Gemini API エラー: ${response.status} ${detail}`,
        model,
      };
    }

    const payload = await response.json();
    const text = Array.isArray(payload?.candidates?.[0]?.content?.parts)
      ? payload.candidates[0].content.parts
          .map((part: { text?: unknown }) => (typeof part?.text === "string" ? part.text : ""))
          .join("\n")
          .trim()
      : "";

    if (!text) {
      return {
        data: null,
        error: "Geminiレスポンスの text が空です。",
        model,
      };
    }

    const parsed = parseJsonObjectText<T>(text);
    if (!parsed) {
      return {
        data: null,
        error: "GeminiレスポンスJSONの解析に失敗しました。",
        model,
      };
    }

    return {
      data: parsed,
      error: null,
      model,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return {
      data: null,
      error: `Gemini呼び出し失敗: ${message}`,
      model,
    };
  }
}

function parseQuestGenerationConfig(worldConfig: unknown): QuestGenerationConfig {
  const defaultConfig: QuestGenerationConfig = {
    program: {},
    aiPrompts: {},
  };

  const world = asRecord(worldConfig);
  if (!world) return defaultConfig;

  const rawConfig = asRecord(world.questGenerationConfig);
  if (!rawConfig) return defaultConfig;

  const rawProgram = asRecord(rawConfig.program);
  const rawPrompts = asRecord(rawConfig.aiPrompts);
  const rawStep1 = asRecord(rawProgram?.step1);
  const rawStep2 = asRecord(rawProgram?.step2);
  const rawStep3 = asRecord(rawProgram?.step3);
  const rawStep5 = asRecord(rawProgram?.step5);
  const rawStep6 = asRecord(rawProgram?.step6);
  const rawStep7 = asRecord(rawProgram?.step7);
  const rawStep8 = asRecord(rawProgram?.step8);

  return {
    program: {
      step1: rawStep1
        ? {
            normalizeUserType: toText(rawStep1.normalizeUserType),
            normalizeFamiliarity: toText(rawStep1.normalizeFamiliarity),
            normalizeDuration: toText(rawStep1.normalizeDuration),
          }
        : undefined,
      step2: rawStep2
        ? {
            spotCountRule: toText(rawStep2.spotCountRule),
            mobilityConstraintRule: toText(rawStep2.mobilityConstraintRule),
          }
        : undefined,
      step3: rawStep3
        ? {
            candidateSelectionRule: toText(rawStep3.candidateSelectionRule),
            routeOrderingRule: toText(rawStep3.routeOrderingRule),
            spotDbLinkPolicy: toText(rawStep3.spotDbLinkPolicy),
            candidateSpotPoolIds: toText(rawStep3.candidateSpotPoolIds),
          }
        : undefined,
      step5: rawStep5
        ? {
            narrativeContainerSpec: toText(rawStep5.narrativeContainerSpec),
            slotInjectionPolicy: toText(rawStep5.slotInjectionPolicy),
          }
        : undefined,
      step6: rawStep6
        ? {
            worldSetting: toText(rawStep6.worldSetting),
            characterProfile: toText(rawStep6.characterProfile),
            characterRole: toText(rawStep6.characterRole),
            storyArcFor4Spots: toText(rawStep6.storyArcFor4Spots),
            storyArcFor5Spots: toText(rawStep6.storyArcFor5Spots),
            storyArcFor6Spots: toText(rawStep6.storyArcFor6Spots),
            conversationFlow: toText(rawStep6.conversationFlow),
          }
        : undefined,
      step7: rawStep7
        ? {
            validationRuleSet: toText(rawStep7.validationRuleSet),
            fallbackPolicy: toText(rawStep7.fallbackPolicy),
          }
        : undefined,
      step8: rawStep8
        ? {
            finalizeFormat: toText(rawStep8.finalizeFormat),
            persistAndDispatch: toText(rawStep8.persistAndDispatch),
          }
        : undefined,
    },
    aiPrompts: {
      step4RouteOptimization: toText(rawPrompts?.step4RouteOptimization),
      step6InsertionGeneration: toText(rawPrompts?.step6InsertionGeneration),
      step7MinimalRepair: toText(rawPrompts?.step7MinimalRepair),
    },
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const requestId = toText(request.headers.get("x-request-id")) || createRequestId();
  const requestStartedAt = Date.now();
  const parsedRequestUrl = (() => {
    try {
      return new URL(request.url);
    } catch {
      return null;
    }
  })();

  const log = (event: string, payload?: Record<string, unknown>) => {
    const normalizedPayload = sanitizeLogPayload(payload);
    console.info(`${REQUEST_LOG_PREFIX} [${requestId}] ${event}${formatLogPayload(normalizedPayload)}`);
  };

  const logError = (event: string, payload?: Record<string, unknown>) => {
    const normalizedPayload = sanitizeLogPayload(payload);
    console.error(`${REQUEST_LOG_PREFIX} [${requestId}] ${event}${formatLogPayload(normalizedPayload)}`);
  };

  const steps: GenerationStepLog[] = [];
  const stepTraces: GenerationStepTrace[] = [];
  const stepStartedAt = new Map<GenerationStepId, number>();
  const stepLabelById = new Map<GenerationStepId, string>();
  const pendingStepEndEventById = new Map<GenerationStepId, Omit<QuestProgressEvent, "timestamp">>();
  const STEP_HEARTBEAT_INTERVAL_MS = 10_000;
  let activeStepHeartbeat: ReturnType<typeof setInterval> | null = null;

  const toStepOrdinal = (id: GenerationStepId): number => {
    const index = GENERATION_STEP_ORDER.indexOf(id);
    return index >= 0 ? index + 1 : 0;
  };

  const formatStepTag = (id: GenerationStepId): string => {
    const ordinal = toStepOrdinal(id);
    return ordinal > 0 ? `STEP ${ordinal}/${GENERATION_STEP_ORDER.length}` : "STEP ?";
  };

  const stopStepHeartbeat = () => {
    if (!activeStepHeartbeat) return;
    clearInterval(activeStepHeartbeat);
    activeStepHeartbeat = null;
  };

  const flushPendingStepEndEvent = (id: GenerationStepId) => {
    const pending = pendingStepEndEventById.get(id);
    if (!pending) return;
    emitQuestProgress(pending);
    pendingStepEndEventById.delete(id);
  };

  const flushAllPendingStepEndEvents = () => {
    for (const id of GENERATION_STEP_ORDER) {
      flushPendingStepEndEvent(id);
    }
  };

  const stepStart = (id: GenerationStepId, label: string, payload?: Record<string, unknown>) => {
    stopStepHeartbeat();
    const startedAt = Date.now();
    stepStartedAt.set(id, startedAt);
    stepLabelById.set(id, label);
    const stepOrdinal = toStepOrdinal(id);
    const stepTag = formatStepTag(id);
    const inputVars = sanitizeLogPayload(payload);
    console.info(`${REQUEST_LOG_PREFIX} [${requestId}] >>> ${stepTag} 開始: ${label}`);
    emitQuestProgress({
      requestId,
      type: "step-start",
      stepId: id,
      stepLabel: label,
      stepOrdinal,
      totalSteps: GENERATION_STEP_ORDER.length,
      message: `${stepTag} 開始: ${label}`,
      inputVars,
    });
    log(`step.${id}.start`, { label, ...(payload ?? {}) });

    activeStepHeartbeat = setInterval(() => {
      const elapsedMs = Date.now() - (stepStartedAt.get(id) ?? startedAt);
      console.info(`${REQUEST_LOG_PREFIX} [${requestId}] ... ${stepTag} 実行中: ${label} (${Math.floor(elapsedMs / 1000)}s)`);
    }, STEP_HEARTBEAT_INTERVAL_MS);
    if (typeof activeStepHeartbeat.unref === "function") {
      activeStepHeartbeat.unref();
    }
  };

  const stepEnd = (entry: GenerationStepLog, payload?: Record<string, unknown>) => {
    stopStepHeartbeat();
    const startedAt = stepStartedAt.get(entry.id);
    const durationMs = startedAt ? Date.now() - startedAt : null;
    steps.push(entry);
    const stepOrdinal = toStepOrdinal(entry.id);
    const stepTag = formatStepTag(entry.id);
    const outputVars = sanitizeLogPayload(payload);
    console.info(
      `${REQUEST_LOG_PREFIX} [${requestId}] <<< ${stepTag} 終了: ${entry.label} ` +
        `(status=${entry.status}, durationMs=${durationMs ?? "unknown"}) ` +
        `detail=${clipText(entry.detail, 220)}`,
    );
    pendingStepEndEventById.set(entry.id, {
      requestId,
      type: "step-end",
      stepId: entry.id,
      stepLabel: entry.label,
      stepOrdinal,
      totalSteps: GENERATION_STEP_ORDER.length,
      status: entry.status,
      durationMs,
      message:
        `${stepTag} 終了: ${entry.label} ` +
        `(status=${entry.status}, durationMs=${durationMs ?? "unknown"})`,
      outputVars,
    });
    log(`step.${entry.id}.end`, { ...entry, durationMs, ...(payload ?? {}) });
  };

  const stepTrace = (trace: GenerationStepTrace) => {
    stepTraces.push(trace);
    const stepOrdinal = toStepOrdinal(trace.id);
    const stepTag = formatStepTag(trace.id);
    const label = stepLabelById.get(trace.id) ?? trace.id;
    const inputVars = sanitizeLogPayload(trace.inputVars);
    const outputVars = sanitizeLogPayload(trace.outputVars);
    const aiPrompt = trace.aiPrompt
      ? {
          provider: trace.aiPrompt.provider,
          model: trace.aiPrompt.model,
          temperature: trace.aiPrompt.temperature,
          systemPrompt: trace.aiPrompt.systemPrompt
            ? clipForTraceLog(trace.aiPrompt.systemPrompt, 1400)
            : undefined,
          userPrompt: trace.aiPrompt.userPrompt
            ? clipForTraceLog(trace.aiPrompt.userPrompt, 1800)
            : undefined,
        }
      : undefined;
    console.info(`${REQUEST_LOG_PREFIX} [${requestId}] ... ${stepTag} 処理: ${label} -> ${clipText(trace.program, 260)}`);
    emitQuestProgress({
      requestId,
      type: "step-process",
      stepId: trace.id,
      stepLabel: label,
      stepOrdinal,
      totalSteps: GENERATION_STEP_ORDER.length,
      message: `${stepTag} 処理: ${label} -> ${clipText(trace.program, 260)}`,
      program: trace.program,
      inputVars,
      outputVars,
      aiPrompt,
    });
    flushPendingStepEndEvent(trace.id);
    log(`step.${trace.id}.trace`, {
      id: trace.id,
      program: trace.program,
      inputVars: trace.inputVars,
      outputVars: trace.outputVars,
      aiPrompt: trace.aiPrompt
        ? {
            ...trace.aiPrompt,
            systemPrompt: clipForTraceLog(trace.aiPrompt.systemPrompt, 1400),
            userPrompt: clipForTraceLog(trace.aiPrompt.userPrompt, 1800),
          }
        : undefined,
    });
  };

  let responseStatus = 200;
  let responseOk = false;

  log("request.received", {
    method: request.method,
    path: parsedRequestUrl?.pathname ?? "unknown",
    userAgent: request.headers.get("user-agent") ?? "unknown",
    referer: request.headers.get("referer") ?? "",
    origin: request.headers.get("origin") ?? "",
    fullLogMode: FULL_LOG_MODE,
  });

  let body: GenerationRequestBody;

  try {
    body = (await request.json()) as GenerationRequestBody;
  } catch (error) {
    responseStatus = 400;
    logError("request.invalid_json", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return jsonResponse({ ok: false, error: "JSONの解析に失敗しました。" }, 400);
  }

  try {
    const normalizedUserType = normalizeUserType(body?.simulationInputs?.userType);
    const normalizedFamiliarity = normalizeFamiliarity(body?.simulationInputs?.familiarity);
    const normalizedDuration = normalizeDuration(body?.simulationInputs?.duration);
    const explorationStyle = toText(body?.simulationInputs?.explorationStyle, "地図で事前確認");
    const experienceExpectation = toText(body?.simulationInputs?.experienceExpectation, "場所を覚えたい");
    const worldConfigRecord = asRecord(body.worldConfig);
    const questGenerationConfig = parseQuestGenerationConfig(worldConfigRecord);
    const runUntilStep = toGenerationStepId(body?.simulationControl?.runUntilStep);

    log("request.parsed_inputs", {
      runUntilStep: runUntilStep ?? null,
      simulationInputsRaw: body?.simulationInputs ?? null,
      worldConfigKeys: Object.keys(worldConfigRecord ?? {}),
      hasQuestGenerationConfig: Boolean(worldConfigRecord?.questGenerationConfig),
    });
    console.info(
      `${REQUEST_LOG_PREFIX} [${requestId}] --- 実行計画: ${GENERATION_STEP_ORDER.join(" -> ")}` +
        (runUntilStep ? ` (runUntilStep=${runUntilStep})` : ""),
    );
    emitQuestProgress({
      requestId,
      type: "plan",
      totalSteps: GENERATION_STEP_ORDER.length,
      message:
        `実行計画: ${GENERATION_STEP_ORDER.join(" -> ")}` +
        (runUntilStep ? ` (runUntilStep=${runUntilStep})` : ""),
    });

    const normalizedInputs = {
      userType: normalizedUserType,
      familiarity: normalizedFamiliarity,
      duration: normalizedDuration,
      explorationStyle,
      experienceExpectation,
    };

    let resolvedSpotCount: number | null = null;
    let resolvedMobilityConstraint: string | null = null;

    const buildSuccessPayload = (quest?: QuestOutput): Record<string, unknown> => {
      const payload: Record<string, unknown> = {
        ok: true,
        generatedAt: new Date().toISOString(),
        normalizedInputs,
        steps,
        stepTraces,
      };
      if (resolvedSpotCount !== null && resolvedMobilityConstraint) {
        payload.constraints = {
          spotCount: resolvedSpotCount,
          mobilityConstraint: resolvedMobilityConstraint,
        };
      }
      if (quest) {
        payload.quest = quest;
      }
      if (runUntilStep) {
        payload.executedUntilStep = runUntilStep;
      }
      return payload;
    };

    const maybeReturnPartial = (stepId: GenerationStepId): Response | null => {
      if (runUntilStep !== stepId) return null;
      responseOk = true;
      responseStatus = 200;
      const partialPayload = buildSuccessPayload();
      log("request.success_partial", {
        runUntilStep: stepId,
        stepsCount: steps.length,
        stepIds: steps.map((step) => step.id),
      });
      log("request.success_partial_payload", {
        runUntilStep: stepId,
        payload: partialPayload,
      });
      return jsonResponse(partialPayload);
    };

    stepStart("step1", "入力正規化", {
      rawInputs: body?.simulationInputs ?? null,
    });
    stepEnd(
      {
        id: "step1",
        label: "入力正規化",
        status: "completed",
        detail: `userType=${normalizedUserType}, familiarity=${normalizedFamiliarity}, duration=${normalizedDuration}`,
      },
      {
        normalizedInputs,
      },
    );
    stepTrace({
      id: "step1",
      program:
        "normalizeUserType / normalizeFamiliarity / normalizeDuration を順に適用し、入力文字列を内部カテゴリへ変換する。",
      inputVars: {
        userType: body?.simulationInputs?.userType ?? null,
        familiarity: body?.simulationInputs?.familiarity ?? null,
        duration: body?.simulationInputs?.duration ?? null,
        explorationStyle: body?.simulationInputs?.explorationStyle ?? null,
        experienceExpectation: body?.simulationInputs?.experienceExpectation ?? null,
        rules: questGenerationConfig.program?.step1 ?? null,
      },
      outputVars: {
        normalizedUserType,
        normalizedFamiliarity,
        normalizedDuration,
        explorationStyle,
        experienceExpectation,
      },
    });
    const partialStep1 = maybeReturnPartial("step1");
    if (partialStep1) return partialStep1;

    stepStart("step2", "制約計算", {
      durationRule: DURATION_SPOT_COUNT,
      familiarity: normalizedFamiliarity,
    });
    const targetCount = Math.max(2, Math.min(DURATION_SPOT_COUNT[normalizedDuration], SPOT_DB.length));
    const preferredSpotRanks = FAMILIARITY_PREFERRED_SPOT_RANKS[normalizedFamiliarity];
    const backfillSpotRanks = FAMILIARITY_BACKFILL_SPOT_RANKS[normalizedFamiliarity];
    const mobilityConstraint = `徒歩限定: 連続スポット間 ${Math.round(
      WALKING_MAX_SEGMENT_DISTANCE_METERS / 1000,
    )}km以内（同一点連続を避けるため最低${WALKING_MIN_SEGMENT_DISTANCE_METERS}m以上）`;
    resolvedSpotCount = targetCount;
    resolvedMobilityConstraint = mobilityConstraint;
    stepEnd(
      {
        id: "step2",
        label: "制約計算",
        status: "completed",
        detail: `spotCount=${targetCount}, mobility=${mobilityConstraint}, preferredRanks=${preferredSpotRanks.join("/")}`,
      },
      {
        resolvedConstraints: {
          spotCount: targetCount,
          mobilityConstraint,
          minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
          maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
          preferredSpotRanks,
          backfillSpotRanks,
        },
      },
    );
    stepTrace({
      id: "step2",
      program:
        "durationバケットからspot数を計算し、徒歩制約（連続スポット間1km以内）とfamiliarity別の対象スポットrank（優先/補完）を決定する。",
      inputVars: {
        normalizedDuration,
        normalizedFamiliarity,
        durationRule: DURATION_SPOT_COUNT,
        rules: questGenerationConfig.program?.step2 ?? null,
      },
      outputVars: {
        targetCount,
        mobilityConstraint,
        minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
        maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
        preferredSpotRanks,
        backfillSpotRanks,
      },
    });
    const partialStep2 = maybeReturnPartial("step2");
    if (partialStep2) return partialStep2;

    stepStart("step3", "候補抽出");
    const extractedSpotDbLoad = await loadExtractedSpotDbRecords();
    const extractedSpotDbAllRecords = extractedSpotDbLoad.records;
    const extractedSpotDbTotal = extractedSpotDbAllRecords.length;
    const extractedSpotDbStatus = extractedSpotDbLoad.status;
    const extractedSpotDbSource = extractedSpotDbLoad.sourcePath ?? "fallback:route.ts";
    const extractedSpotDbReason = extractedSpotDbLoad.reason;
    const currentOrigin = {
      lat: toFiniteNumber(body?.simulationInputs?.currentLat) ?? SPOT_BY_ID[START_SPOT_ID].lat,
      lng: toFiniteNumber(body?.simulationInputs?.currentLng) ?? SPOT_BY_ID[START_SPOT_ID].lng,
    };
    const durationUpperMinutes = DURATION_UPPER_MINUTES[normalizedDuration];
    const maxReachableRadiusMeters = Math.round(
      durationUpperMinutes * WALKING_METERS_PER_MINUTE * RADIUS_REACHABILITY_FACTOR,
    );
    const extractedSpotDbRecordsWithinRadius = extractedSpotDbAllRecords.filter(
      (record) => distanceMetersBetweenCoordinates(currentOrigin, record) <= maxReachableRadiusMeters,
    );
    const extractedSpotDbRecords =
      extractedSpotDbRecordsWithinRadius.length > 0 ? extractedSpotDbRecordsWithinRadius : extractedSpotDbAllRecords;
    const extractedSpotDbReducedTotal = extractedSpotDbRecords.length;
    const extractedSpotDbFilteredOutCount = extractedSpotDbTotal - extractedSpotDbReducedTotal;

    const registryUpsert = upsertSpotRegistryFromExtracted(extractedSpotDbRecords);
    const middlePriority = FAMILIARITY_MIDDLE_PRIORITY[normalizedFamiliarity];
    const configuredPoolIdsRaw = parseLineSeparatedIds(questGenerationConfig.program?.step3?.candidateSpotPoolIds);
    const dynamicCatalog = Object.values(SPOT_BY_ID).filter((spot) => Boolean(spot));
    const dynamicCatalogIdSet = new Set(dynamicCatalog.map((spot) => spot.id));
    const configuredPoolIds = configuredPoolIdsRaw.filter((id) => dynamicCatalogIdSet.has(id));
    const ignoredPoolIds = configuredPoolIdsRaw.filter((id) => !dynamicCatalogIdSet.has(id));
    const useConfiguredPool = configuredPoolIds.length > 0 && !isLegacyFixedPool(configuredPoolIds);

    const preferredRankSet = new Set<SpotRank>(preferredSpotRanks);
    const backfillRankSet = new Set<SpotRank>(backfillSpotRanks);
    const preferredPoolIdsByRank = dynamicCatalog
      .filter(
        (spot) =>
          spot.id !== START_SPOT_ID &&
          preferredRankSet.has(spot.rank),
      )
      .map((spot) => spot.id);
    const backfillPoolIdsByRank = dynamicCatalog
      .filter(
        (spot) =>
          spot.id !== START_SPOT_ID &&
          !preferredRankSet.has(spot.rank) &&
          backfillRankSet.has(spot.rank),
      )
      .map((spot) => spot.id);
    const rankEligibleMiddleIds = dedupeIds([...preferredPoolIdsByRank, ...backfillPoolIdsByRank]);
    const rankEligibleMiddleIdSet = new Set(rankEligibleMiddleIds);

    const extractedMiddleIdsWithinRadius = extractedSpotDbRecords
      .map((record) => record.id)
      .filter((id) => id !== START_SPOT_ID && dynamicCatalogIdSet.has(id));

    const configuredRankExcludedPoolIds = configuredPoolIds.filter(
      (id) => id !== START_SPOT_ID && !rankEligibleMiddleIdSet.has(id),
    );
    const configuredRankEligiblePoolIds = configuredPoolIds.filter(
      (id) => id === START_SPOT_ID || rankEligibleMiddleIdSet.has(id),
    );

    const prefilterPoolBaseIds = useConfiguredPool
      ? dedupeIds([START_SPOT_ID, ...configuredRankEligiblePoolIds])
      : dedupeIds([START_SPOT_ID, ...rankEligibleMiddleIds, ...extractedMiddleIdsWithinRadius]);
    const poolIdSet = new Set(prefilterPoolBaseIds);
    const fallbackMiddle = prefilterPoolBaseIds.filter((id) => id !== START_SPOT_ID);
    const middleCandidates = dedupeIds([
      ...middlePriority.filter((id) => poolIdSet.has(id)),
      ...fallbackMiddle,
    ]);
    const middleCandidatesWithinRadius = filterRouteSpotIdsByRadius(
      middleCandidates,
      currentOrigin,
      maxReachableRadiusMeters,
    );
    const reducedMiddleCandidatesRaw =
      middleCandidatesWithinRadius.length > 0 ? middleCandidatesWithinRadius : middleCandidates;
    const reducedMiddleCandidates = sortSpotIdsByDistanceFromOrigin(reducedMiddleCandidatesRaw, currentOrigin).slice(
      0,
      STEP3_MAX_STEP4_MIDDLE_CANDIDATES,
    );
    const poolBaseIds = dedupeIds([START_SPOT_ID, ...reducedMiddleCandidates]);
    const fallbackRouteIds = clampRoute(
      [START_SPOT_ID, ...reducedMiddleCandidates],
      reducedMiddleCandidates,
      targetCount,
      WALKING_MIN_SEGMENT_DISTANCE_METERS,
      WALKING_MAX_SEGMENT_DISTANCE_METERS,
    );
    const fallbackRouteLegDistances = buildRouteLegDistances(fallbackRouteIds);
    const spotDbLinkPolicy = toText(
      questGenerationConfig.program?.step3?.spotDbLinkPolicy,
      "spot-db 全件を母集団にする",
    );
    stepEnd(
      {
        id: "step3",
        label: "候補抽出",
        status: "completed",
        detail: `spotDb抽出=${extractedSpotDbTotal}件→${extractedSpotDbReducedTotal}件, ルート候補=${middleCandidates.length}件→${reducedMiddleCandidates.length}件 (cap=${STEP3_MAX_STEP4_MIDDLE_CANDIDATES})`,
      },
      {
        candidateSummary: {
          extractedSpotDbStatus,
          extractedSpotDbSource,
          extractedSpotDbReason,
          extractedSpotDbTotal,
          extractedSpotDbReducedTotal,
          extractedSpotDbFilteredOutCount,
          spotRegistryInsertedCount: registryUpsert.insertedCount,
          spotRegistryUpdatedCount: registryUpsert.updatedCount,
          currentOrigin,
          durationUpperMinutes,
          maxReachableRadiusMeters,
          useConfiguredPool,
          prefilterPoolBaseIds,
          middlePriority,
          middleCandidates,
          middleCandidatesWithinRadius,
          reducedMiddleCandidates,
          poolBaseIds,
          configuredPoolIds,
          ignoredPoolIds,
          configuredRankExcludedPoolIds,
          preferredSpotRanks,
          backfillSpotRanks,
          preferredPoolIdsByRank,
          backfillPoolIdsByRank,
          rankEligibleMiddleIds,
          spotDbLinkPolicy,
          step4MiddleCandidateCap: STEP3_MAX_STEP4_MIDDLE_CANDIDATES,
          fallbackRouteIds,
          fallbackRouteLegDistances,
        },
      },
    );
    stepTrace({
      id: "step3",
      program:
        "spot-db全件を取得し、現在地と体験時間から算出した半径内へプログラムで絞り込む。さらにrank優先ロジックを適用し、step4用候補を削減してfallbackRouteIdsを組み立てる。",
      inputVars: {
        normalizedFamiliarity,
        normalizedDuration,
        targetCount,
        preferredSpotRanks,
        backfillSpotRanks,
        currentOrigin,
        durationUpperMinutes,
        walkingMetersPerMinute: WALKING_METERS_PER_MINUTE,
        radiusReachabilityFactor: RADIUS_REACHABILITY_FACTOR,
        extractionPolicy: "spot-db を全件抽出後、現在地中心の時間制約半径内へ削減",
        candidateSpotPoolIdsRaw: configuredPoolIdsRaw,
        useConfiguredPool,
        spotDbLinkPolicy,
        step4MiddleCandidateCap: STEP3_MAX_STEP4_MIDDLE_CANDIDATES,
        rules: questGenerationConfig.program?.step3 ?? null,
      },
      outputVars: {
        extractedSpotDbStatus,
        extractedSpotDbSource,
        extractedSpotDbReason,
        extractedSpotDbTotal,
        extractedSpotDbReducedTotal,
        extractedSpotDbFilteredOutCount,
        spotRegistryInsertedCount: registryUpsert.insertedCount,
        spotRegistryUpdatedCount: registryUpsert.updatedCount,
        maxReachableRadiusMeters,
        extractedSpotDbRecords,
        prefilterPoolBaseIds,
        configuredPoolIds,
        ignoredPoolIds,
        configuredRankExcludedPoolIds,
        preferredPoolIdsByRank,
        backfillPoolIdsByRank,
        middleCandidatesWithinRadius,
        reducedMiddleCandidates,
        poolBaseIds,
        middleCandidates,
        fallbackRouteIds,
        fallbackRouteLegDistances,
      },
    });
    const partialStep3 = maybeReturnPartial("step3");
    if (partialStep3) return partialStep3;

    const routeDesign = toText(
      worldConfigRecord?.routeDesign,
      "15-20分は5スポット、20-30分は6スポット、30-45分は6スポットを想定",
    );

    const step4PromptTemplate =
      toText(questGenerationConfig.aiPrompts?.step4RouteOptimization) || DEFAULT_STEP4_PROMPT;

    const step4Prompt = applyTemplate(step4PromptTemplate, {
      userType: normalizedUserType,
      familiarity: normalizedFamiliarity,
      duration: normalizedDuration,
      explorationStyle,
      experienceExpectation,
      routeDesign,
    });
    const step4CompactRouteInput = buildStep4CompactRouteInput({
      poolBaseIds,
      extractedSpotDbRecords,
      currentOrigin,
      userType: normalizedUserType,
      familiarity: normalizedFamiliarity,
      duration: normalizedDuration,
      explorationStyle,
      experienceExpectation,
      targetCount,
      maxReachableRadiusMeters,
      minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
      maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
      fallbackRouteIds,
    });

    let routeIds = fallbackRouteIds;
    let routeReasonMap: Record<string, string> = {};
    let routeStoryTheme = `${normalizedFamiliarity}向けに無理なく巡る伊都キャンパス体験`;
    let mobilityNotes = "";
    let routeSelectionSource: "ai" | "algorithmic-override" | "fallback" = "fallback";
    const deterministicCandidatePoolCount = dedupeIds(poolBaseIds).filter(
      (id) => id !== START_SPOT_ID && Boolean(SPOT_BY_ID[id]),
    ).length;
    const deterministicSearchCapped =
      deterministicCandidatePoolCount > STEP4_MAX_ENUMERATION_MIDDLE_CANDIDATES;
    const deterministicBestRoute = findShortestDistanceRoute({
      candidatePoolIds: poolBaseIds,
      targetCount,
      minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
      maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
    });
    const step4SystemPrompt =
      "あなたは徒歩ルート最適化担当です。出力は必ずJSONのみ。" +
      "入力JSON以外の情報は使用禁止。" +
      "routeSpotIds は candidateSpots の id のみ使用可能。" +
      `開始は ${START_SPOT_ID} に固定。終点は候補内で最適化により可変。` +
      "travelMode=walking のため、連続スポット間は minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下を厳守すること。" +
      "まずハード制約を満たし、次に総歩行距離最小化を行うこと。";

    stepStart("step4", "ルート最適化", {
      promptTemplate: clipForTraceLog(step4PromptTemplate),
      promptResolved: clipForTraceLog(step4Prompt, 2000),
      targetCount,
      mobilityConstraint,
      maxReachableRadiusMeters,
      minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
      maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
      allowedPoolSize: poolBaseIds.length,
      compactCandidateCount: step4CompactRouteInput.candidateSpots.length,
      deterministicBestRoute: deterministicBestRoute
        ? {
            routeIds: deterministicBestRoute.routeIds,
            totalDistanceMeters: deterministicBestRoute.totalDistanceMeters,
            searchedRouteCount: deterministicBestRoute.searchedRouteCount,
            truncated: deterministicBestRoute.truncated,
          }
        : null,
    });

    const step4UserPrompt =
      `${step4Prompt}\n\n` +
      "以下の compact input を使ってルートを設計してください。\n" +
      `compact_input=${JSON.stringify(step4CompactRouteInput)}\n` +
      `制約メモ: targetCount=${targetCount}, mobilityConstraint=${mobilityConstraint}\n` +
      "最適化手順:\n" +
      "1) requiredStartSpotId から開始する（終点は可変）。\n" +
      "2) routeSpotIds の件数を targetCount に一致させる（重複禁止）。\n" +
      "3) candidateDistanceMatrixMeters を使い、全セグメントが minSegmentDistanceMeters 以上かつ maxSegmentDistanceMeters 以下の経路のみ残す。\n" +
      "4) 残った経路のうち、総歩行距離(totalDistance)が最小の経路を選ぶ。\n" +
      "5) 同点なら最長セグメントが短い経路を優先する。\n" +
      "6) baselineRoute.totalDistanceMeters より悪化する場合は、その理由を mobilityNotes に明記する。\n" +
      "7) 各 spotId に routeReasonMap を必ず付与する。\n" +
      "JSON schema: " +
      "{\"routeSpotIds\": string[], \"routeStoryTheme\": string, \"routeReasonMap\": {\"spotId\": \"理由\"}, \"mobilityNotes\": string}\n" +
      "必ずJSONのみを返し、コードブロックや前置き文は出力しないでください。";
    const step4ModelCandidates = dedupeIds([GEMINI_ROUTE_MODEL, ...GEMINI_ROUTE_FALLBACK_MODELS]);

    log("step4.ai.request", {
      provider: "gemini",
      modelCandidates: step4ModelCandidates,
      temperature: 0.2,
      systemPrompt: step4SystemPrompt,
      userPrompt: clipForTraceLog(step4UserPrompt, 3000),
    });

    let step4Gemini: GeminiJsonCallResult<RouteStep4Result> = {
      data: null,
      error: "Gemini未実行",
      model: GEMINI_ROUTE_MODEL,
    };
    const step4ModelAttempts: Array<{
      model: string;
      success: boolean;
      error: string | null;
    }> = [];

    for (const modelCandidate of step4ModelCandidates) {
      const attempt = await callGeminiJson<RouteStep4Result>({
        systemPrompt: step4SystemPrompt,
        userPrompt: step4UserPrompt,
        temperature: 0.2,
        model: modelCandidate,
      });
      const success = Boolean(attempt.data?.routeSpotIds && Array.isArray(attempt.data.routeSpotIds));
      step4ModelAttempts.push({
        model: attempt.model,
        success,
        error: attempt.error,
      });
      step4Gemini = attempt;
      if (success) break;
    }

    const aiRouteGenerated = Boolean(
      step4Gemini.data?.routeSpotIds && Array.isArray(step4Gemini.data.routeSpotIds),
    );

    if (aiRouteGenerated && step4Gemini.data?.routeSpotIds) {
      const allowedPoolSet = new Set(poolBaseIds);
      const aiRouteWithinPool = step4Gemini.data.routeSpotIds.filter((id) => allowedPoolSet.has(id));
      const aiClampedRoute = clampRoute(
        aiRouteWithinPool,
        middleCandidates,
        targetCount,
        WALKING_MIN_SEGMENT_DISTANCE_METERS,
        WALKING_MAX_SEGMENT_DISTANCE_METERS,
      );
      const aiRouteLegDistances = buildRouteLegDistances(aiClampedRoute);
      const aiRouteTotalDistanceMeters = sumRouteDistance(aiRouteLegDistances);
      routeIds = aiClampedRoute;
      routeSelectionSource = "ai";
      routeReasonMap = normalizeRouteReasonMap(step4Gemini.data, aiClampedRoute);
      routeStoryTheme = toText(step4Gemini.data.routeStoryTheme, routeStoryTheme);
      mobilityNotes = toText(step4Gemini.data.mobilityNotes);

      if (
        deterministicBestRoute &&
        deterministicBestRoute.routeIds.length === targetCount &&
        deterministicBestRoute.totalDistanceMeters < aiRouteTotalDistanceMeters
      ) {
        routeIds = deterministicBestRoute.routeIds;
        routeSelectionSource = "algorithmic-override";
        mobilityNotes = `AI提案より短い経路が見つかったため、距離最小ルートへ補正しました（AI=${aiRouteTotalDistanceMeters}m, best=${deterministicBestRoute.totalDistanceMeters}m）。`;
      }
    } else {
      if (deterministicBestRoute && deterministicBestRoute.routeIds.length === targetCount) {
        routeIds = deterministicBestRoute.routeIds;
        routeSelectionSource = "algorithmic-override";
        mobilityNotes = "AI応答不正のため、プログラムで求めた距離最短ルートを採用しました。";
      } else {
        routeIds = fallbackRouteIds;
        routeSelectionSource = "fallback";
        mobilityNotes = "AI応答不正のため、step3 fallback routeを採用しました。";
      }
      routeReasonMap = normalizeRouteReasonMap(null, routeIds);
    }

    routeReasonMap = ensureRouteReasonMap(routeIds, routeReasonMap);
    const routeLegDistances = buildRouteLegDistances(routeIds);
    const routeQuality = buildRouteQualitySummary(
      routeIds,
      targetCount,
      WALKING_MIN_SEGMENT_DISTANCE_METERS,
      WALKING_MAX_SEGMENT_DISTANCE_METERS,
    );
    if (!mobilityNotes) {
      mobilityNotes =
        routeQuality.violatedConstraints.length === 0
          ? "制約順守: 開始/件数/徒歩距離の制約を満たしています。"
          : `制約違反: ${routeQuality.violatedConstraints.join(", ")}`;
    }
    const routeDistanceSummary = buildRouteDistanceSummary({
      routeLegDistances,
      baselineRouteTotalDistanceMeters: step4CompactRouteInput.baselineRoute.totalDistanceMeters,
      deterministicBestTotalDistanceMeters: deterministicBestRoute?.totalDistanceMeters ?? null,
      deterministicSearchCapped,
      deterministicSearchTruncated: deterministicBestRoute?.truncated ?? false,
      deterministicCandidateCount:
        deterministicBestRoute?.cappedCandidateCount ??
        Math.min(deterministicCandidatePoolCount, STEP4_MAX_ENUMERATION_MIDDLE_CANDIDATES),
      selectedRouteSource: routeSelectionSource,
    });

    if (aiRouteGenerated) {
      log("step4.ai.response", {
        provider: "gemini",
        model: step4Gemini.model,
        modelAttempts: step4ModelAttempts,
        usedFallback: false,
        routeSpotIds: routeIds,
        routeLegDistances,
        routeSelectionSource,
        routeDistanceSummary,
        reasonKeys: Object.keys(routeReasonMap),
        routeStoryTheme,
      });
    } else {
      logError("step4.ai.response_error", {
        provider: "gemini",
        model: step4Gemini.model,
        modelAttempts: step4ModelAttempts,
        usedFallback: true,
        error: step4Gemini.error ?? "AI response missing routeSpotIds",
        fallbackRouteIds: fallbackRouteIds,
        selectedRouteIds: routeIds,
        routeSelectionSource,
      });
    }

    stepEnd(
      {
        id: "step4",
        label: "ルート最適化",
        status: aiRouteGenerated ? "completed" : "fallback",
        detail: `${routeSelectionSource} route=${routeIds.join(" -> ")}${aiRouteGenerated ? "" : ` (${step4Gemini.error ?? "Gemini未利用"})`}`,
      },
      {
        routeIds,
        routeLegDistances,
        routeReasonMap,
        routeStoryTheme,
        mobilityNotes,
        routeQuality,
        routeDistanceSummary,
      },
    );
    stepTrace({
      id: "step4",
      program:
        "step1〜3の正規化条件とcompact候補(id/lat/lng+距離行列)をGeminiへ投入してroute候補を生成し、最後にプログラム側で距離最短参照ルートと比較して制約順守・歩行効率を保証する。",
      inputVars: {
        normalizedInputsFromStep1: {
          normalizedUserType,
          normalizedFamiliarity,
          normalizedDuration,
          explorationStyle,
          experienceExpectation,
        },
        constraintsFromStep2: {
          targetCount,
          mobilityConstraint,
          minSegmentDistanceMeters: WALKING_MIN_SEGMENT_DISTANCE_METERS,
          maxSegmentDistanceMeters: WALKING_MAX_SEGMENT_DISTANCE_METERS,
        },
        compactInputFromStep3: step4CompactRouteInput,
        fallbackRouteIdsFromStep3: fallbackRouteIds,
        deterministicBestRoute: deterministicBestRoute
          ? {
              routeIds: deterministicBestRoute.routeIds,
              totalDistanceMeters: deterministicBestRoute.totalDistanceMeters,
              searchedRouteCount: deterministicBestRoute.searchedRouteCount,
              truncated: deterministicBestRoute.truncated,
              cappedCandidateCount: deterministicBestRoute.cappedCandidateCount,
            }
          : null,
        modelAttempts: step4ModelAttempts,
        aiError: aiRouteGenerated ? null : step4Gemini.error ?? "AI response missing routeSpotIds",
      },
      outputVars: {
        routeIds,
        routeLegDistances,
        routeReasonMap,
        routeStoryTheme,
        mobilityNotes,
        routeQuality,
        routeDistanceSummary,
      },
      aiPrompt: {
        provider: "gemini",
        model: step4Gemini.model,
        temperature: 0.2,
        systemPrompt: step4SystemPrompt,
        userPrompt: step4UserPrompt,
      },
    });

    const partialStep4 = maybeReturnPartial("step4");
    if (partialStep4) return partialStep4;

    const routeSpotKnowledge = buildRouteSpotKnowledge(routeIds, extractedSpotDbRecords);
    const routeSpotKnowledgeByRouteId = new Map(routeSpotKnowledge.map((item) => [item.routeSpotId, item]));

    stepStart("step5", "テンプレ割当");
    const routeSpots = routeIds.map((id) => SPOT_BY_ID[id]).filter((spot): spot is SpotRecord => Boolean(spot));
    const narrativeContainerSpec = toText(
      questGenerationConfig.program?.step5?.narrativeContainerSpec,
      "ready/prologue/spot/epilogue のテンプレ器を固定し、差し込みスロットを明示する。",
    );
    const slotInjectionPolicy = toText(
      questGenerationConfig.program?.step5?.slotInjectionPolicy,
      "スポット名・見どころ・移動導線をどのスロットへ入れるかを定義する。",
    );
    const templateContainer = {
      ready: "タイトル / サマリー / 体験価値",
      prologue: "導入文 (2-3文)",
      spot: "各スポット本文 (1-3文)",
      epilogue: "締め文 (2-3文)",
    };
    stepEnd(
      {
        id: "step5",
        label: "テンプレ割当",
        status: "completed",
        detail: `container=ready/prologue/spot/epilogue, routeSpots=${routeSpots.map((spot) => spot.name).join(" -> ")}`,
      },
      {
        templateContainer,
        narrativeContainerSpec,
        slotInjectionPolicy,
        routeSpotIds: routeSpots.map((spot) => spot.id),
        routeSpotKnowledge,
      },
    );
    stepTrace({
      id: "step5",
      program: "確定routeをready/prologue/spot/epilogueのテンプレート器へマッピングする。",
      inputVars: {
        routeIds,
        routeSpots: routeSpots.map((spot) => ({ id: spot.id, name: spot.name })),
        narrativeContainerSpec,
        slotInjectionPolicy,
        routeSpotKnowledge,
      },
      outputVars: {
        templateContainer,
        routeSpotKnowledge,
      },
    });

    const partialStep5 = maybeReturnPartial("step5");
    if (partialStep5) return partialStep5;

    const step6PromptTemplate =
      toText(questGenerationConfig.aiPrompts?.step6InsertionGeneration) || DEFAULT_STEP6_PROMPT;
    const objective = toText(worldConfigRecord?.title, "入力条件で無理なく回れるルートを生成し、物語テンプレに自然に接続する。");
    const audience = toText(worldConfigRecord?.audience, "新入生");
    const additionalContext = toText(worldConfigRecord?.description, "九州大学 伊都キャンパス。研究目的のPoCとして利用。");
    const requiredElements = toStringArray(worldConfigRecord?.requiredKeywords).join("、") || "スポット固有情報と導線の意味";
    const forbiddenElements = toStringArray(worldConfigRecord?.blockedKeywords).join("、") || "誇張表現、根拠のない断定";
    const tone = toText(worldConfigRecord?.tone, "落ち着き・知的・親しみやすい");
    const outputStyle = toText(worldConfigRecord?.styleRules, "です・ます調、簡潔");
    const outputLanguage = toText(worldConfigRecord?.outputLanguage, "日本語");
    const fixedTextPolicy = toText(worldConfigRecord?.fixedTextPolicy, DEFAULT_FIXED_TEXT_POLICY);
    const step6WorldSetting = toText(
      questGenerationConfig.program?.step6?.worldSetting,
      DEFAULT_STEP6_WORLD_SETTING,
    );
    const step6CharacterProfile = toText(
      questGenerationConfig.program?.step6?.characterProfile,
      DEFAULT_STEP6_CHARACTER_PROFILE,
    );
    const step6CharacterRole = toText(
      questGenerationConfig.program?.step6?.characterRole,
      DEFAULT_STEP6_CHARACTER_ROLE,
    );
    const step6StoryArcFor4Spots = toText(
      questGenerationConfig.program?.step6?.storyArcFor4Spots,
      DEFAULT_STEP6_ARC_4,
    );
    const step6StoryArcFor5Spots = toText(
      questGenerationConfig.program?.step6?.storyArcFor5Spots,
      DEFAULT_STEP6_ARC_5,
    );
    const step6StoryArcFor6Spots = toText(
      questGenerationConfig.program?.step6?.storyArcFor6Spots,
      DEFAULT_STEP6_ARC_6,
    );
    const step6ConversationFlow = toText(
      questGenerationConfig.program?.step6?.conversationFlow,
      DEFAULT_STEP6_CONVERSATION_FLOW,
    );
    const roleTemplates = resolveSpotRoleTemplates(routeSpots.length);
    const questName = toText(worldConfigRecord?.questName, `${normalizedUserType}の伊都キャンパスクエスト`);
    const questSubtitle = toText(worldConfigRecord?.questSubtitle, `${normalizedDuration}で巡る伊都キャンパス回遊`);
    const playerType = toText(worldConfigRecord?.playerType, audience || normalizedUserType);
    const playerState = toText(worldConfigRecord?.playerState, normalizedFamiliarity);
    const questTheme = toText(worldConfigRecord?.questTheme, objective);
    const questGoal = toText(worldConfigRecord?.questGoal, toText(worldConfigRecord?.routeDesign, routeDesign));
    const takeaway = toText(worldConfigRecord?.questTakeaway, requiredElements);
    const guideName = toText(worldConfigRecord?.guideName, DEFAULT_GUIDE_NAME);
    const guideRole = toText(worldConfigRecord?.guideRole, DEFAULT_GUIDE_ROLE);
    const guideDistance = toText(worldConfigRecord?.guideDistance, DEFAULT_GUIDE_DISTANCE);
    const guideTone = toText(worldConfigRecord?.guideTone, tone);
    const guideKnows = toText(worldConfigRecord?.guideKnows, DEFAULT_GUIDE_KNOWS);
    const guideDoesNotKnow = toText(worldConfigRecord?.guideDoesNotKnow, DEFAULT_GUIDE_DOES_NOT_KNOW);
    const guideForbiddenStyle = toText(worldConfigRecord?.guideForbiddenStyle, DEFAULT_GUIDE_FORBIDDEN_STYLE);
    const questStructure = toText(worldConfigRecord?.questStructure, buildDefaultQuestStructure(roleTemplates));
    const spotPromptInputs = buildSpotPromptInputs({
      routeSpots,
      roleTemplates,
      routeReasonMap,
      routeSpotKnowledgeByRouteId,
    });
    const spotsJson = JSON.stringify(spotPromptInputs, null, 2);
    const step6ReadyTemplateContext = {
      userType: normalizedUserType,
      familiarity: normalizedFamiliarity,
      duration: normalizedDuration,
      routeTheme: routeStoryTheme,
      spotCount: String(routeSpots.length),
      guideName,
      firstSpotName: routeSpots[0]?.name ?? "",
      lastSpotName: routeSpots[routeSpots.length - 1]?.name ?? "",
    };
    const step6ReadyOutput = {
      generatedStoryName: applyTemplate(
        toText(
          questGenerationConfig.program?.step6?.readyGeneratedStoryName,
          DEFAULT_STEP6_READY_GENERATED_STORY_NAME,
        ),
        step6ReadyTemplateContext,
      ),
      readyHeroLead: applyTemplate(
        toText(
          questGenerationConfig.program?.step6?.readyHeroLead,
          DEFAULT_STEP6_READY_HERO_LEAD,
        ),
        step6ReadyTemplateContext,
      ),
      readySummaryTitle: applyTemplate(
        toText(
          questGenerationConfig.program?.step6?.readySummaryTitle,
          DEFAULT_STEP6_READY_SUMMARY_TITLE,
        ),
        step6ReadyTemplateContext,
      ),
      readySummaryText: applyTemplate(
        toText(
          questGenerationConfig.program?.step6?.readySummaryText,
          DEFAULT_STEP6_READY_SUMMARY_TEXT,
        ),
        step6ReadyTemplateContext,
      ),
    };

    const step6Prompt = applyTemplate(step6PromptTemplate, {
      objective,
      audience,
      additionalContext,
      requiredElements,
      tone,
      outputStyle,
      outputLanguage,
      fixedTextPolicy,
      forbiddenElements,
      worldSetting: step6WorldSetting,
      characterProfile: step6CharacterProfile,
      characterRole: step6CharacterRole,
      storyArcFor4Spots: step6StoryArcFor4Spots,
      storyArcFor5Spots: step6StoryArcFor5Spots,
      storyArcFor6Spots: step6StoryArcFor6Spots,
      conversationFlow: step6ConversationFlow,
      questName,
      questSubtitle,
      playerType,
      playerState,
      duration: normalizedDuration,
      questTheme,
      questGoal,
      takeaway,
      guideName,
      guideRole,
      guideDistance,
      guideTone,
      guideKnows,
      guideDoesNotKnow,
      guideForbiddenStyle,
      questStructure,
      spotCount: String(routeSpots.length),
      spotsJson,
      readyGeneratedStoryName: step6ReadyOutput.generatedStoryName,
      readyHeroLead: step6ReadyOutput.readyHeroLead,
      readySummaryTitle: step6ReadyOutput.readySummaryTitle,
      readySummaryText: step6ReadyOutput.readySummaryText,
    });

    stepStart("step6", "Ready生成", {
      promptTemplate: clipForTraceLog(step6PromptTemplate),
      promptResolved: clipForTraceLog(step6Prompt, 2000),
      routeIds,
      routeStoryTheme,
      outputLanguage,
      readyOutputTemplate: step6ReadyOutput,
      routeSpotKnowledge: routeSpotKnowledge.map((item) => ({
        routeSpotId: item.routeSpotId,
        matchedBy: item.matchedBy,
        matchedSpotDbId: item.matchedSpotDbId,
        matchedDistanceMeters: item.matchedDistanceMeters,
      })),
      roleTemplates,
    });

    const step6UserPrompt =
      `${step6Prompt}\n\n` +
      `ユーザー条件: userType=${normalizedUserType}, familiarity=${normalizedFamiliarity}, duration=${normalizedDuration}, explorationStyle=${explorationStyle}, expectation=${experienceExpectation}\n` +
      `ルートテーマ: ${routeStoryTheme}\n` +
      `運営設定: objective=${objective} / audience=${audience} / additionalContext=${additionalContext} / fixedTextPolicy=${fixedTextPolicy}\n` +
      `物語テンプレ設定: worldSetting=${step6WorldSetting} / characterProfile=${step6CharacterProfile} / characterRole=${step6CharacterRole} / conversationFlow=${step6ConversationFlow}\n` +
      `スポット別アーク: 4spots=${step6StoryArcFor4Spots} / 5spots=${step6StoryArcFor5Spots} / 6spots=${step6StoryArcFor6Spots}\n` +
      `案内役ルール: guideName=${guideName} / guideRole=${guideRole} / guideTone=${guideTone} / guideKnows=${guideKnows} / guideDoesNotKnow=${guideDoesNotKnow} / guideForbiddenStyle=${guideForbiddenStyle}\n` +
      `テンプレ方針: narrativeContainerSpec=${narrativeContainerSpec} / slotInjectionPolicy=${slotInjectionPolicy}\n` +
      `ルートID順: ${routeIds.join(" -> ")}\n` +
      `スポット役割: ${roleTemplates.join(" -> ")}\n` +
      `ルート詳細: ${routeSpots
        .map((spot) => {
          const knowledge = routeSpotKnowledgeByRouteId.get(spot.id);
          const knowledgeSummary = (knowledge?.knowledgeCandidates ?? [])
            .slice(0, 2)
            .map((record) => formatSpotKnowledgeForPrompt(record))
            .join(" || ");
          const matchedBy = knowledge?.matchedBy ?? "none";
          const matchedSpotDbId = knowledge?.matchedSpotDbId ?? "-";
          const matchedDistance = knowledge?.matchedDistanceMeters ?? "-";
          const knowledgeLine = knowledgeSummary.length > 0 ? knowledgeSummary : "none";
          return `${spot.id}:${spot.name}(${spot.overview}) facts=${spot.facts.join(
            " / ",
          )} knowledgeMatch={by=${matchedBy}, spotDbId=${matchedSpotDbId}, distanceMeters=${matchedDistance}} knowledgeCandidates=${knowledgeLine}`;
        })
        .join("; ")}\n` +
      `テンプレ器: ${JSON.stringify(templateContainer)}\n` +
      "JSON schema: {\"generatedStoryName\":string,\"storyTone\":string,\"readyHeroLead\":string,\"readySummaryTitle\":string,\"readySummaryText\":string,\"prologueBody\":string,\"epilogueBody\":string,\"spots\":[{\"id\":string,\"name\":string,\"overview\":string,\"rationale\":string,\"scenarioTexts\":[\"到着前の一言\",\"案内役の会話\",\"気づきと次スポット接続\"]}]}";
    const step6SystemPrompt =
      "あなたは観光/キャンパス案内の日本語ライターです。出力はJSONのみ。spots は routeSpotIds と同じ順序・同じ件数で返し、scenarioTextsは3要素固定で返す。";

    log("step6.ai.request", {
      providerCandidates: ["gemini"],
      geminiModel: GEMINI_NARRATIVE_MODEL,
      temperature: 0.45,
      readyOutputLocked: step6ReadyOutput,
      systemPrompt: step6SystemPrompt,
      userPrompt: clipForTraceLog(step6UserPrompt, 3000),
    });

    const step6Gemini = await callGeminiJson<NarrativeStep6Result>({
      systemPrompt: step6SystemPrompt,
      userPrompt: step6UserPrompt,
      temperature: 0.45,
      model: GEMINI_NARRATIVE_MODEL,
    });

    let narrativeResult: NarrativeStep6Result;

    if (step6Gemini.data) {
      const step6UsedModel = step6Gemini.model ?? GEMINI_NARRATIVE_MODEL;
      narrativeResult = {
        ...step6Gemini.data,
        generatedStoryName: step6ReadyOutput.generatedStoryName,
        readyHeroLead: step6ReadyOutput.readyHeroLead,
        readySummaryTitle: step6ReadyOutput.readySummaryTitle,
        readySummaryText: step6ReadyOutput.readySummaryText,
      };

      log("step6.ai.response", {
        usedFallback: false,
        provider: "gemini",
        model: step6UsedModel,
        geminiError: null,
        generatedStoryName: toText(narrativeResult.generatedStoryName),
        generatedSpotsCount: Array.isArray(narrativeResult.spots) ? narrativeResult.spots.length : 0,
        payload: narrativeResult,
      });
      stepEnd(
        {
          id: "step6",
          label: "Ready生成",
          status: "completed",
          detail: "Readyテンプレを固定適用し、本文生成をGeminiで実行しました",
        },
        {
          provider: "gemini",
          model: step6UsedModel,
          generatedStoryName: toText(narrativeResult.generatedStoryName),
          generatedSpotsCount: Array.isArray(narrativeResult.spots) ? narrativeResult.spots.length : 0,
        },
      );
      stepTrace({
        id: "step6",
        program:
          "step6InsertionGenerationプロンプトへworld/character/arc設定とspot-db知識候補を埋め込み、route順spot本文をGeminiで生成する。",
        inputVars: {
          promptTemplate: step6PromptTemplate,
          promptResolved: step6Prompt,
          worldSetting: step6WorldSetting,
          characterProfile: step6CharacterProfile,
          characterRole: step6CharacterRole,
          conversationFlow: step6ConversationFlow,
          readyOutputLocked: step6ReadyOutput,
          routeIds,
          routeSpotKnowledge,
          geminiError: null,
        },
        outputVars: {
          status: "completed",
          provider: "gemini",
          model: step6UsedModel,
          generatedStoryName: toText(narrativeResult.generatedStoryName),
          generatedSpotsCount: Array.isArray(narrativeResult.spots) ? narrativeResult.spots.length : 0,
        },
        aiPrompt: {
          provider: "gemini",
          model: step6UsedModel,
          temperature: 0.45,
          systemPrompt: step6SystemPrompt,
          userPrompt: step6UserPrompt,
        },
      });
    } else {
      const step6Error = step6Gemini.error ?? "unknown";
      logError("step6.ai.response_error", {
        usedFallback: false,
        geminiError: step6Error,
      });
      stepEnd(
        {
          id: "step6",
          label: "Ready生成",
          status: "fallback",
          detail: `Gemini本文生成に失敗したため中断します (gemini=${step6Error})`,
        },
        {
          provider: "gemini",
          model: step6Gemini.model ?? GEMINI_NARRATIVE_MODEL,
          geminiError: step6Error,
        },
      );
      stepTrace({
        id: "step6",
        program: "step6 の Gemini 生成が失敗したため、fallbackを使わずにエラー終了する。",
        inputVars: {
          promptTemplate: step6PromptTemplate,
          promptResolved: step6Prompt,
          readyOutputLocked: step6ReadyOutput,
          routeIds,
          routeSpotKnowledge,
          geminiError: step6Error,
        },
        outputVars: {
          status: "fallback",
          error: step6Error,
        },
        aiPrompt: {
          provider: "gemini",
          model: step6Gemini.model ?? GEMINI_NARRATIVE_MODEL,
          temperature: 0.45,
          systemPrompt: step6SystemPrompt,
          userPrompt: step6UserPrompt,
        },
      });
      throw new Error(`step6 Gemini generation failed: ${step6Error}`);
    }

    const partialStep6 = maybeReturnPartial("step6");
    if (partialStep6) return partialStep6;

    const validationErrors = validateNarrativeResult(narrativeResult, routeIds);
    stepStart("step7", "検証/最小再生成", {
      validationErrorCount: validationErrors.length,
      validationErrors,
    });

    if (validationErrors.length > 0) {
      const step7PromptTemplate =
        toText(questGenerationConfig.aiPrompts?.step7MinimalRepair) || DEFAULT_STEP7_PROMPT;
      const step7Prompt = applyTemplate(step7PromptTemplate, {
        forbiddenElements,
        fixedTextPolicy,
      });

      const step7UserPrompt =
        `${step7Prompt}\n\n` +
        `エラー: ${validationErrors.join(" / ")}\n` +
        `routeIds: ${routeIds.join(" -> ")}\n` +
        `currentPayload: ${JSON.stringify(narrativeResult)}`;
      const step7SystemPrompt =
        "あなたは検証修正担当です。必ずJSONのみを返し、指摘項目だけ最小修正してください。";

      log("step7.ai.request", {
        providerCandidates: ["gemini"],
        geminiModel: GEMINI_NARRATIVE_MODEL,
        temperature: 0.1,
        systemPrompt: step7SystemPrompt,
        userPrompt: clipForTraceLog(step7UserPrompt, 3000),
      });

      const step7Gemini = await callGeminiJson<NarrativeStep6Result>({
        systemPrompt: step7SystemPrompt,
        userPrompt: step7UserPrompt,
        temperature: 0.1,
        model: GEMINI_NARRATIVE_MODEL,
      });
      const step7UsedModel = step7Gemini.model ?? GEMINI_NARRATIVE_MODEL;
      const step7Result = step7Gemini.data;

      if (step7Result) {
        narrativeResult = step7Result;
        log("step7.ai.response_payload", {
          provider: "gemini",
          model: step7UsedModel,
          geminiError: null,
          payload: step7Result,
        });
        const afterRepairErrors = validateNarrativeResult(narrativeResult, routeIds);
        if (afterRepairErrors.length === 0) {
          log("step7.ai.response", {
            usedFallback: false,
            repaired: true,
            provider: "gemini",
            model: step7UsedModel,
            validationErrorCountAfterRepair: 0,
          });
          stepEnd({
            id: "step7",
            label: "検証/最小再生成",
            status: "completed",
            detail: "Geminiで最小修正を実行し、検証を通過しました",
          });
          stepTrace({
            id: "step7",
            program: "検証失敗時にstep7MinimalRepairプロンプトでGemini最小再生成し、再検証で通過を確認する。",
            inputVars: {
              validationErrors,
              promptTemplate: step7PromptTemplate,
              promptResolved: step7Prompt,
              geminiError: null,
            },
            outputVars: {
              status: "completed",
              provider: "gemini",
              model: step7UsedModel,
              validationErrorCountAfterRepair: 0,
            },
            aiPrompt: {
              provider: "gemini",
              model: step7UsedModel,
              temperature: 0.1,
              systemPrompt: step7SystemPrompt,
              userPrompt: step7UserPrompt,
            },
          });
        } else {
          logError("step7.ai.response_validation_failed", {
            usedFallback: false,
            validationErrorCountAfterRepair: afterRepairErrors.length,
            validationErrorsAfterRepair: afterRepairErrors,
          });
          stepEnd({
            id: "step7",
            label: "検証/最小再生成",
            status: "fallback",
            detail: `Gemini修正後も検証失敗: ${afterRepairErrors.join(" / ")}。エラー終了します。`,
          });
          stepTrace({
            id: "step7",
            program: "Gemini最小再生成後も検証不通過のため、fallbackを使わずエラー終了する。",
            inputVars: {
              validationErrors,
              promptTemplate: step7PromptTemplate,
              promptResolved: step7Prompt,
              geminiError: null,
            },
            outputVars: {
              status: "fallback",
              validationErrorsAfterRepair: afterRepairErrors,
            },
            aiPrompt: {
              provider: "gemini",
              model: step7UsedModel,
              temperature: 0.1,
              systemPrompt: step7SystemPrompt,
              userPrompt: step7UserPrompt,
            },
          });
          throw new Error(`step7 Gemini repair validation failed: ${afterRepairErrors.join(" / ")}`);
        }
      } else {
        const step7Error = step7Gemini.error ?? "unknown";
        logError("step7.ai.response_error", {
          usedFallback: false,
          geminiError: step7Error,
        });
        stepEnd({
          id: "step7",
          label: "検証/最小再生成",
          status: "fallback",
          detail: `Gemini修正を実行できませんでした (gemini=${step7Error})。エラー終了します。`,
        });
        stepTrace({
          id: "step7",
          program: "検証失敗時にGemini修正呼び出しが失敗したため、fallbackを使わずエラー終了する。",
          inputVars: {
            validationErrors,
            promptTemplate: step7PromptTemplate,
            promptResolved: step7Prompt,
            geminiError: step7Error,
          },
          outputVars: {
            status: "fallback",
            error: `gemini=${step7Error}`,
          },
          aiPrompt: {
            provider: "gemini",
            model: step7UsedModel,
            temperature: 0.1,
            systemPrompt: step7SystemPrompt,
            userPrompt: step7UserPrompt,
          },
        });
        throw new Error(`step7 Gemini repair failed: ${step7Error}`);
      }
    } else {
      stepEnd({
        id: "step7",
        label: "検証/最小再生成",
        status: "completed",
        detail: "検証を通過したため再生成は不要でした",
      });
      stepTrace({
        id: "step7",
        program: "validateNarrativeResultが通過したため再生成をスキップする。",
        inputVars: {
          validationErrors,
          validationRuleSet: questGenerationConfig.program?.step7?.validationRuleSet ?? null,
          fallbackPolicy: questGenerationConfig.program?.step7?.fallbackPolicy ?? null,
        },
        outputVars: {
          status: "completed",
          skippedRepair: true,
        },
      });
    }

    const partialStep7 = maybeReturnPartial("step7");
    if (partialStep7) return partialStep7;

    stepStart("step8", "最終確定");
    const sanitizedNarrative = sanitizeNarrativeResult(narrativeResult, routeIds);
    const sanitizedValidationErrors = validateNarrativeResult(sanitizedNarrative, routeIds);
    if (sanitizedValidationErrors.length > 0) {
      stepEnd({
        id: "step8",
        label: "最終確定",
        status: "fallback",
        detail: `sanitize後の検証に失敗: ${sanitizedValidationErrors.join(" / ")}`,
      });
      stepTrace({
        id: "step8",
        program: "sanitize後の最終検証で不整合を検出したため、fallbackを使わずエラー終了する。",
        inputVars: {
          routeIds,
          validationErrors: sanitizedValidationErrors,
        },
        outputVars: {
          status: "fallback",
          errorCount: sanitizedValidationErrors.length,
        },
      });
      throw new Error(`step8 final validation failed: ${sanitizedValidationErrors.join(" / ")}`);
    }
    const narrativeSpotMap = new Map(
      (sanitizedNarrative.spots ?? []).map((spot) => [spot.id, spot] as const),
    );
    const finalQuestSpots = routeSpots.map((spot) => {
      const generated = narrativeSpotMap.get(spot.id);
      if (!generated) {
        throw new Error(`step8 missing generated spot: ${spot.id}`);
      }
      const name = toText(generated.name);
      const overview = toText(generated.overview);
      const rationale = toText(generated.rationale);
      const scenarioTexts = toStringArray(generated.scenarioTexts)
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .slice(0, 3);
      if (!name || !overview || !rationale || scenarioTexts.length !== 3) {
        throw new Error(`step8 invalid generated spot payload: ${spot.id}`);
      }
      return {
        id: spot.id,
        name,
        overview,
        rationale,
        scenarioTexts,
        lat: spot.lat,
        lng: spot.lng,
      };
    });

    const finalQuest: QuestOutput = {
      generatedStoryName: toText(sanitizedNarrative.generatedStoryName),
      storyTone: toText(sanitizedNarrative.storyTone, tone),
      readyHeroLead: toText(sanitizedNarrative.readyHeroLead),
      readySummaryTitle: toText(sanitizedNarrative.readySummaryTitle),
      readySummaryText: toText(sanitizedNarrative.readySummaryText),
      prologueBody: toText(sanitizedNarrative.prologueBody),
      epilogueBody: toText(sanitizedNarrative.epilogueBody),
      spots: finalQuestSpots,
    };

    stepEnd(
      {
        id: "step8",
        label: "最終確定",
        status: "completed",
        detail: `finalized route=${routeIds.join(" -> ")}, spots=${finalQuest.spots.length}`,
      },
      {
        finalQuestSummary: {
          generatedStoryName: finalQuest.generatedStoryName,
          routeIds: finalQuest.spots.map((spot) => spot.id),
          spotsCount: finalQuest.spots.length,
        },
      },
    );
    stepTrace({
      id: "step8",
      program: "sanitize済みnarrativeとroute情報を統合し、最終quest JSONを確定する。",
      inputVars: {
        routeIds,
        finalizeFormat: questGenerationConfig.program?.step8?.finalizeFormat ?? null,
        persistAndDispatch: questGenerationConfig.program?.step8?.persistAndDispatch ?? null,
      },
      outputVars: {
        generatedStoryName: finalQuest.generatedStoryName,
        spotsCount: finalQuest.spots.length,
        routeIds: finalQuest.spots.map((spot) => spot.id),
      },
    });

    responseOk = true;
    responseStatus = 200;
    const readyReflection = buildReadyReflectionSummary(finalQuest);
    const successPayload = {
      ok: true,
      generatedAt: new Date().toISOString(),
      normalizedInputs: {
        userType: normalizedUserType,
        familiarity: normalizedFamiliarity,
        duration: normalizedDuration,
        explorationStyle,
        experienceExpectation,
      },
      constraints: {
        spotCount: targetCount,
        mobilityConstraint,
      },
      steps,
      stepTraces,
      quest: finalQuest,
    };

    log("request.final_quest_output", {
      quest: finalQuest,
      readyReflection,
    });
    log("request.success", {
      generatedStoryName: finalQuest.generatedStoryName,
      stepsCount: steps.length,
      stepIds: steps.map((step) => step.id),
    });
    log("request.success_payload", {
      payload: successPayload,
    });

    return jsonResponse(successPayload);
  } catch (error) {
    responseStatus = 500;
    responseOk = false;
    emitQuestProgress({
      requestId,
      type: "request-error",
      message: error instanceof Error ? error.message : "unknown_error",
    });
    logError("request.unhandled_error", {
      error: error instanceof Error ? error.message : "unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return jsonResponse({ ok: false, error: "クエスト生成中にサーバーエラーが発生しました。" }, 500);
  } finally {
    stopStepHeartbeat();
    flushAllPendingStepEndEvents();
    emitQuestProgress({
      requestId,
      type: "request-finished",
      message: `request finished: ok=${responseOk}, status=${responseStatus}, stepsExecuted=${steps.length}`,
    });
    log("request.finished", {
      ok: responseOk,
      status: responseStatus,
      totalDurationMs: Date.now() - requestStartedAt,
      stepsExecuted: steps.length,
    });
  }
}
