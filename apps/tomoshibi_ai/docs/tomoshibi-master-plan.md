# TOMOSHIBI Master Plan

Last updated: 2026-04-27

Important v2 update:

This master plan must be read together with `docs/tomoshibi-implementation-plan-v2.md`. The v2 plan adds the latest business direction:

- Initial pilot focus: Kyushu University students.
- Growth path: daily campus/city use -> Iki mode.
- Character model v2: multiple companions with appearance customization.
- Character differences must not limit outing categories.
- Memory v2: user-visible, editable, deletable structured long-term memory.
- Iki mode is a new chapter with the same companion, not a scripted regional story.
- Recommendation v2 should expose memory-based recommendation reasons.
- Referral and Iki conversion funnels must be measurable.

このドキュメントは、TOMOSHIBI の要件定義、実装計画、現在の実装状況、フロントエンドUI/UX方針を1つにまとめた正本である。

開発エージェントは、実装判断に迷った場合、まず本ドキュメントを参照すること。細部が `AGENTS.md` やコードと矛盾する場合は、実装前にこのドキュメントを更新してから進める。

## 1. Product Definition

### 1.1 Product Name

TOMOSHIBI

### 1.2 One Sentence

ユーザーとの記憶を育てる相棒AIが、日常の散歩・街歩きから壱岐などの旅先まで一緒に歩き、会話・好み・過去の体験をもとに、次の発見・立ち寄り・体験へ自然に導く外出型AIコンパニオン。

### 1.3 Core Concept

TOMOSHIBI は、単なるAI観光ガイドではない。

TOMOSHIBI は、ユーザーごとに育つ相棒AIが、日常の散歩・キャンパス歩き・街歩き・一人旅・旅先での空き時間に同行し、現在地・気分・興味・過去の好み・相棒との共有記憶をもとに、次の外出や立ち寄りを提案する「外出型AIコンパニオン」である。

初期実証では、九州大学在学生の日常外出を起点に、相棒AIとの接点・愛着・記憶を形成する。その後、壱岐モードを追加し、日常で育った相棒AIをそのまま壱岐での非日常旅行体験へ接続する。

### 1.4 What Makes TOMOSHIBI Different

- 既存のAI観光ガイドは、場所を案内する。
- 既存のAI旅行プランナーは、旅程を作る。
- 既存のAIコンパニオンは、会話や関係性を提供する。
- TOMOSHIBI は、相棒AIとの関係性を起点に、現実の外出、街歩き、旅行、地域消費へ接続する。

### 1.5 Product Principle

LLMは「事実を作る装置」ではなく、「取得済みの情報を、相棒らしく伝える装置」である。

## 2. 100 Point State

最終的に目指す状態は以下。

1. ユーザーが現在地、目的地、空き時間、移動手段、気分、興味を入力する。
2. 周辺スポットや地域資源が取得される。
3. ユーザー条件に合う街歩き・旅行ルートが複数候補として生成される。
4. 相棒AIが、単なる観光説明ではなく、ユーザーとの関係性・過去の好み・今の気分を踏まえて提案する。
5. ユーザーは相棒AIと会話しながら、スポットの背景、見どころ、店舗のこだわりを知る。
6. ユーザーは「もっと知る」「ここに行く」「違う」「保存する」「行った」「よかった」などの反応を返せる。
7. 反応はユーザー記憶・相棒との関係性・次回提案に反映される。
8. 外出・旅行後には、その体験が相棒との思い出として保存される。
9. 次回以降、相棒AIは「前にこういう場所が好きだったよね」と自然に反映する。
10. 将来的には、飲食、体験、宿泊、地域店舗への送客が自然に発生する。

## 3. AI Responsibility Boundary

### 3.1 AIに任せること

- 相棒らしい発話生成
- 提案理由の言語化
- ユーザーの気分に合わせた言い換え
- 取得済み場所情報のわかりやすい説明
- 外出後の振り返り生成
- ユーザー記憶の要約
- 相棒との関係性を感じさせる表現

### 3.2 AIに任せないこと

以下はLLMに創作させない。

- 実在するスポットの存在確認
- 緯度経度
- 距離
- 営業時間
- 料金
- 定休日
- 予約可否
- クーポン有無
- 歴史的事実の断定
- 店舗との提携状況

これらは外部API、自前DB、公式情報、管理者入力データから取得する。

## 4. Initial MVP Scope

### 4.1 MVPで実装するもの

1. ユーザーが現在地と条件を入力する。
2. Google Places API または mock provider から周辺スポットを取得する。
3. ユーザー条件に応じて簡易ルートを3候補程度生成する。
4. 相棒AIがルートのおすすめ理由を話す。
5. ユーザーがスポットについて質問・反応できる。
6. liked / skipped / saved / visited などを記録する。
7. 外出完了時に短い振り返りを生成する。
8. 次回以降の提案にユーザーの好み・思い出を反映する。

### 4.2 MVPでやらないもの

- 本格的な旅行予約完結
- 複雑な経路最適化
- 複数人旅行の好み調整
- 謎解き・脚本型の本格物語
- 3D / Live2D アバター
- リアルタイム音声会話
- 成果報酬の自動精算
- 自治体管理画面
- 大規模な全国観光DB構築

## 5. Target Users

### 5.1 Initial Pilot Target

初期実証の中心は九州大学在学生である。

目的:

- 日常利用で相棒AIとの関係性を作る。
- 外出型AIコンパニオンの価値を低摩擦に検証する。
- 壱岐モードへの転換母集団を作る。
- 事前利用者と新規利用者の差分を壱岐で検証する。

初期ユースケース:

- 空きコマ散歩
- カフェ・作業場所探し
- 短時間の気分転換
- キャンパス周辺の静かな場所探し
- 旅前の壱岐モード関心形成

### 5.2 Broader Target

- 一人旅をする人
- 出張先で空き時間がある人
- 大学周辺や都市部を一人で歩く人
- 休日に一人で外出する人
- 旅行中に一人で少し歩く時間がある人
- 知らない街でどこへ行くか迷う人
- Googleマップ検索だけでは選びきれない人

### 5.3 Initially Not Targeted

- 複数人での旅行計画を中心にしたユーザー
- 効率だけを求めるビジネス出張者
- 観光地の網羅的な情報だけを求めるユーザー
- 人との会話やAIコンパニオンに強い抵抗があるユーザー

## 6. Key Use Cases

### 6.1 Daily Walk

例:

- 30分くらい歩きたい
- 静かな場所がいい
- カフェも寄れたら嬉しい

出力:

- 近くの公園
- 小さなカフェ
- 少し景色の良い道
- 相棒AIによる案内

### 6.2 Free Time While Traveling

例:

- 1時間空いた
- 歴史を少し知りたい
- 歩きすぎたくない

出力:

- 近くの史跡
- カフェ
- 景色の良い場所
- 相棒AIによる土地の背景説明

### 6.3 Pre-Trip Planning

将来実装。目的地、日程、予算、同行者、興味から、宿泊・体験・飲食候補を含む旅程を生成する。

### 6.4 Area Mode

壱岐など特定地域で、Google Places にない独自情報、地域ストーリー、提携事業者、クーポン、体験導線を重ねる。

## 7. Technical Stack

### 7.1 Current Stack

- Backend: Firebase Cloud Functions / TypeScript
- Database: Firestore
- Place Data: Mock Provider / Google Places API
- LLM: Gemini API
- Local Verification: Firebase Emulator, Vitest, ESLint, TypeScript build
- Frontend: Not implemented yet. Recommended first target is mobile Web / PWA with React or Next.js.

### 7.2 Architectural Rules

- API層、Service層、Repository層、Type層を分離する。
- API層から直接Firestoreを触らない。
- Firestore操作はRepository層経由にする。
- 外部APIはService層に閉じ込める。
- LLM呼び出しはCompanion系Serviceに閉じ込める。
- 外部API・LLMは必ずmock可能にする。
- TypeScriptの型を優先し、`any` で逃げない。
- 一度に巨大な実装をしない。
- 変更後は build / lint / test を通す。

## 8. Directory Structure

Current structure:

```txt
functions/
  src/
    index.ts
    api/
      createGuideSession.ts
      suggestGuideRoute.ts
      respondToCompanion.ts
      completeJourney.ts
      trackOutboundClick.ts
      getUserCompanionState.ts
      saveUserFeedback.ts
    services/
      places/
      routing/
      companion/
      memory/
      tracking/
    repositories/
    types/
    utils/
  scripts/
    seedLocal.ts
    smokeLocal.ts
docs/
  tomoshibi-master-plan.md
AGENTS.md
README.md
firebase.json
firestore.rules
firestore.indexes.json
```

Recommended future frontend:

```txt
web/
  app/ or src/
  components/
  features/
  lib/
  styles/
```

## 9. Firestore Collections

Implemented or planned collections:

```txt
users/{userId}
characters/{characterId}
relationships/{userId_characterId}
guideSessions/{sessionId}
guideSessions/{sessionId}/messages/{messageId}
guideSessions/{sessionId}/suggestions/{suggestionId}
journeyMemories/{journeyId}
placeAnnotations/{placeAnnotationId}
placeCache/{provider_providerPlaceId}
partnerLinks/{partnerLinkId}
feedbackEvents/{eventId}
outboundClicks/{clickId}
analyticsEvents/{eventId}
areaModes/{areaId}
```

## 10. Core Data Models

### 10.0 Character v2 Direction

Latest rule:

キャラクターごとに体験ジャンルを制限しない。

All characters must be able to suggest food, cafes, history, nature, work spots, activities, daily outings, travel, and area modes. Character differences belong in tone, expression, distance, appearance, calling style, and wording.

Future model additions are defined in `docs/tomoshibi-implementation-plan-v2.md`:

- `Character.expressionStyle`
- all-true `Character.capabilities`
- `CharacterAppearance`
- `CharacterPart`
- `UserCharacterCustomization`

### 10.1 User

```ts
export type User = {
  id: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
  preferenceSummary?: string;
  preferences?: {
    likedPlaceTypes?: string[];
    dislikedPlaceTypes?: string[];
    preferredPace?: "slow" | "normal" | "active";
    mobility?: "walk" | "bike" | "car" | "public_transport";
    guideDetailLevel?: "short" | "normal" | "deep";
    interests?: string[];
  };
};
```

### 10.2 Character

```ts
export type Character = {
  id: string;
  name: string;
  description: string;
  persona: {
    personality: string[];
    tone: "friendly" | "calm" | "energetic" | "mysterious";
    firstPerson: string;
    userCallNameDefault: string;
    catchphrases?: string[];
    backstory?: string;
  };
  guideStyle: {
    detailLevel: "short" | "normal" | "deep";
    historyLevel: "low" | "medium" | "high";
    emotionalDistance: "close" | "balanced" | "polite";
    humorLevel: "low" | "medium" | "high";
  };
  createdAt: string;
  updatedAt: string;
};
```

### 10.3 Relationship

```ts
export type Relationship = {
  id: string;
  userId: string;
  characterId: string;
  relationshipLevel: number;
  totalSessions: number;
  totalWalkDistanceMeters: number;
  totalVisitedPlaces: number;
  sharedMemorySummary?: string;
  unlockedPhrases?: string[];
  lastInteractionAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 10.4 GuideSession

```ts
export type GuideSession = {
  id: string;
  userId: string;
  characterId: string;
  mode: "daily_walk" | "travel" | "trip_planning" | "area_guide";
  status: "active" | "completed" | "abandoned";
  origin: { lat: number; lng: number; label?: string };
  destination?: { lat: number; lng: number; label?: string };
  areaId?: string;
  context: {
    availableMinutes: number;
    mobility: "walk" | "bike" | "car" | "public_transport";
    mood?: string;
    interests?: string[];
    companionType?: "solo" | "couple" | "friends" | "family";
    timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  };
  createdAt: string;
  updatedAt: string;
};
```

### 10.5 NormalizedPlace

```ts
export type NormalizedPlace = {
  provider: "google_places" | "hotpepper" | "rakuten" | "veltra" | "own_db" | "mock";
  providerPlaceId: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  types: string[];
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  photoRefs?: string[];
  websiteUri?: string;
  googleMapsUri?: string;
  tomoshibiTags?: string[];
  localStory?: {
    short: string;
    long?: string;
    source?: string;
  };
  partnerLinkIds?: string[];
};
```

### 10.6 RoutePlan

```ts
export type RoutePlan = {
  id: string;
  title: string;
  concept: string;
  estimatedMinutes: number;
  totalDistanceMeters?: number;
  places: {
    place: NormalizedPlace;
    order: number;
    estimatedStayMinutes: number;
    reason: string;
  }[];
  score: number;
  tags: string[];
};
```

### 10.7 JourneyMemory

```ts
export type JourneyMemory = {
  id: string;
  userId: string;
  characterId: string;
  sessionId: string;
  title: string;
  summary: string;
  companionMessage: string;
  visitedPlaces: {
    placeId: string;
    name: string;
    visitedAt?: string;
    userReaction?: "liked" | "neutral" | "skipped" | "saved";
  }[];
  learnedPreferences?: string[];
  relationshipDelta?: number;
  createdAt: string;
};
```

## 11. Backend APIs

### 11.1 createGuideSession

Purpose:

ユーザーの現在地・気分・興味・空き時間を受け取り、相棒AIとの外出セッションを開始する。

Current status:

- Implemented.
- User create/get.
- Character create/get with default character.
- Relationship create/update.
- GuideSession create.
- `session_started` event logging.

### 11.2 suggestGuideRoute

Purpose:

周辺スポットを取得し、ユーザー条件に応じたルート候補を生成し、相棒AIが案内する。

Current status:

- Implemented.
- MockPlaceProvider implemented.
- GooglePlacesProvider Nearby Search implemented.
- Google failure fallback to mock implemented.
- PlaceAnnotation merge implemented.
- PlaceCache connected for cacheable providers.
- RoutePlanner / RouteScorer implemented.
- Gemini route guide generation implemented.
- Recent JourneyMemory is passed into route suggestion prompt.
- Suggestions saved under `guideSessions/{sessionId}/suggestions`.
- `route_suggested` event logging.

### 11.3 respondToCompanion

Purpose:

ユーザーのメッセージやアクションに対して、相棒AIが文脈を保って応答する。

Current status:

- Implemented.
- Saves user messages.
- Handles feedback actions.
- Updates UserMemory on feedback.
- `tell_more` can fetch stored place context.
- Google Place Details implemented for detail-time factual fields.
- Gemini companion response implemented.
- LLM fallback implemented.
- Messages saved under session.
- `companion_message_sent` event logging.

### 11.4 completeJourney

Purpose:

外出終了時に、相棒AIとの思い出として記録し、次回提案に反映する。

Current status:

- Implemented.
- Reads messages and feedback.
- Creates JourneyMemory.
- Gemini recap generation implemented.
- Fallback recap implemented.
- Updates Relationship sharedMemorySummary.
- Marks session completed.
- `journey_completed` event logging.

### 11.5 trackOutboundClick

Purpose:

送客・外部リンククリックを計測する。

Current status:

- Implemented.
- Saves outbound click.
- Logs `outbound_clicked`.
- Returns redirectUrl.

### 11.6 getUserCompanionState

Purpose:

ユーザー、キャラクター、関係性の状態を取得する。

Current status:

- Implemented.

### 11.7 saveUserFeedback

Purpose:

liked / saved / visited などを保存する。

Current status:

- Implemented.
- Applies feedback to UserMemory and Relationship as applicable.

## 12. Service Responsibilities

### 12.1 PlaceProvider

Implemented:

- `MockPlaceProvider`
- `GooglePlacesProvider`

Current behavior:

- Nearby Search is used for initial discovery.
- Place Details is used only when more details are requested.
- Google Places content is not persisted in placeCache by default due policy risk.

### 12.2 RoutePlanner

Implemented MVP:

- Creates simple route candidates.
- Uses scored candidate places.
- Focuses on 1-3 spot routes.

### 12.3 RouteScorer

Implemented:

- Distance
- Available minutes
- Mobility
- Mood / interests
- Place types
- Rating / userRatingCount
- tomoshibiTags
- openNow

### 12.4 CompanionPromptBuilder

Implemented:

- Route suggestion prompt.
- Companion response prompt.
- Recent JourneyMemory inclusion.
- Safety constraints.

### 12.5 CompanionGenerator

Implemented:

- Gemini JSON route guide.
- Gemini JSON companion response.
- Fallbacks for LLM failure.

### 12.6 UserMemoryService

Implemented:

- Updates liked/disliked place type signals from feedback metadata.
- Updates `preferenceSummary`.

### 12.7 RelationshipService

Implemented:

- Session start update.
- Feedback signal update.
- Journey completion update.
- `sharedMemorySummary` update.

### 12.8 JourneyMemoryService

Implemented:

- Builds JourneyMemory.
- Gemini recap generation.
- Fallback recap.
- learnedPreferences from explicit feedback.

### 12.9 EventLogService

Implemented:

- Analytics event logging.

### 12.10 ClickTrackingService

Implemented:

- Outbound click storage.

## 13. LLM Policy

### 13.1 Current LLM Provider

Gemini is the active implementation target.

Environment variables:

```txt
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

Do not commit real API keys.

### 13.2 Prompt Rules

All Gemini prompts must include:

- Do not invent factual place data.
- Do not infer opening hours, prices, booking status, partner status.
- Keep companion tone short, calm, and natural.
- Avoid advertising-like pressure.
- Avoid romantic dependency.
- Avoid mental health counseling.

### 13.3 Structured Output

Gemini calls use JSON output schemas for:

- route guide output
- companion response output
- journey memory output

Fallback must exist for each LLM call.

## 14. Place Data Policy

### 14.1 Google Places

Implemented:

- Nearby Search New via POST.
- FieldMask for cost control.
- Place Details via GET with FieldMask.
- Details only fetched on `tell_more`.

Current fields:

- id
- name
- displayName
- location
- formattedAddress
- types
- rating
- userRatingCount
- currentOpeningHours.openNow
- websiteUri
- googleMapsUri
- photos

### 14.2 Caching Policy

Current policy:

- `mock` and `own_db` can be persisted in `placeCache`.
- `google_places` is not persisted in `placeCache` by default.

Reason:

Google Maps Platform policy and Places API content storage restrictions must be reviewed for exact production use. Until then, store only safe internal/mock data.

## 15. Area Mode

Implemented:

- `areaModes`
- `placeAnnotations`
- Seed for `iki`
- Annotation merge by providerPlaceId/name
- localStory support

Current seed:

- `areaModes/iki`
- `placeAnnotations/iki_mock_quiet_park`
- `placeAnnotations/iki_mock_cafe`

Future:

- Real local story dataset.
- Source attribution.
- Partner links.
- Area-specific UI.

## 16. Event Logs and KPI

Implemented events:

- `session_started`
- `route_suggested`
- `companion_message_sent`
- `journey_completed`
- `outbound_clicked`

Planned or partially covered:

- `route_selected`
- `place_card_viewed`
- `place_saved`
- `place_skipped`
- `place_liked`
- `place_visited`

Initial KPIs:

- セッション開始数
- ルート提案数
- ルート選択率
- もっと知る率
- 保存率
- スキップ率
- liked率
- journey完了率
- outbound click率
- 再利用率

## 17. Current Progress

### 17.1 Overall Progress Estimate

Backend MVP vertical slice: about 70%.

Overall product to production-ready MVP after v2 scope: about 40-50%.

Reason:

- Backend core flow works.
- Gemini integration works.
- Memory and relationship flow works.
- Local emulator smoke works.
- Frontend is not implemented yet.
- Character v2 is not implemented yet.
- Memory v2 is not implemented yet.
- Kyushu University AreaMode is not implemented yet.
- Production security, secrets, policies, and UI are not complete.

### 17.2 Completed

- Firebase Functions TypeScript project.
- Firestore repositories.
- Core types.
- createGuideSession.
- suggestGuideRoute.
- respondToCompanion.
- completeJourney.
- trackOutboundClick.
- getUserCompanionState.
- saveUserFeedback.
- Mock place provider.
- Google Places Nearby Search.
- Google Place Details.
- RoutePlanner / RouteScorer.
- Gemini client.
- Structured JSON LLM outputs.
- UserMemory updates.
- Relationship updates.
- JourneyMemory creation.
- sharedMemorySummary updates.
- Recent JourneyMemory injected into next route suggestions.
- PlaceAnnotation merge.
- placeCache for cacheable providers.
- Iki local seed.
- Local smoke test.

### 17.3 Not Yet Implemented

- Frontend application.
- Authentication.
- Character v2.
- Appearance customization.
- Structured userMemories.
- User preference edit API.
- JourneyMemory list/detail API.
- Saved places/routes list API.
- Kyushu University AreaMode.
- Iki conversion tracking events.
- RecommendationReason / PersonalizationSignal.
- Route selection event endpoint or explicit route selection flow.
- Partner link display and partner link management.
- Production Security Rules.
- Secret Manager migration.
- Google Places production compliance review.
- Map UI.
- PWA setup.
- Push notifications.
- Native app.

## 18. Implementation Phases

### Phase 0: Environment and Skeleton

Status: Done.

- Firebase Functions + TypeScript.
- AGENTS.md.
- Directory structure.
- API skeleton.
- Types.
- Build passes.

### Phase 1: Firestore Data Model

Status: Done.

- Repository layer.
- users / characters / relationships / guideSessions.
- createGuideSession.

### Phase 2: Places

Status: Mostly done.

- PlaceProvider interface.
- MockPlaceProvider.
- GooglePlacesProvider.
- NormalizedPlace conversion.
- Details endpoint.
- Safe caching policy.

Remaining:

- Production policy review.
- Additional providers.

### Phase 3: Route Generation

Status: Done for MVP.

- RoutePlanner.
- RouteScorer.
- RoutePlan generation.
- suggestGuideRoute connected.

### Phase 4: Companion AI Guide

Status: Done for MVP.

- LlmClient.
- GeminiLlmClient.
- CompanionPromptBuilder.
- CompanionGenerator.
- JSON output.
- Fallback.

### Phase 5: Conversation Session

Status: Done for MVP.

- respondToCompanion.
- messages save.
- tell_more / skip / liked / saved / visited basics.
- Gemini response.

Remaining:

- Better action-specific UX.
- Route switching behavior.

### Phase 6: Memory and Relationship

Status: Done for MVP.

- UserMemoryService.
- RelationshipService.
- Feedback preferences.
- sharedMemorySummary.

Remaining:

- User-facing memory edit.
- Memory reset.
- Safer memory governance.

### Phase 7: Journey Recap

Status: Done for MVP.

- completeJourney.
- JourneyMemory.
- Gemini recap.
- Next suggestion uses recent memories.

### Phase 8: Outbound Click Tracking

Status: Partially done.

- outboundClicks.
- trackOutboundClick.

Remaining:

- partnerLinks UI.
- partner link selection.
- outbound analytics dashboard.

### Phase 9: Area Mode

Status: Partially done.

- areaModes.
- placeAnnotations.
- localStory merge.
- Iki seed.

Remaining:

- Region UI.
- More real data.
- Source handling.

### Phase 10: Logs and KPI

Status: Partially done.

- Main events are logged.

Remaining:

- KPI aggregation.
- Analytics views.

### Phase 11: Production Readiness

Status: Not done.

- Security Rules.
- Secret Manager.
- Policy review.
- Deployment setup.
- Error observability.

### Phase 12: Frontend MVP

Status: Not started.

Recommended target:

- Mobile Web / PWA first.
- Native-like UX.
- React / Next.js.

## 19. Frontend Strategy

### 19.1 Web vs Native

Current implementation plan assumes Web / React / Next.js first.

Product experience is native-app-like because it uses:

- location
- outdoor usage
- recurring relationship
- possible future notifications
- map/external app handoff

Recommended path:

1. Build mobile Web / PWA first.
2. Validate UX and backend.
3. Later migrate or expand to React Native / Expo if needed.

### 19.2 Frontend Principles

- Do not make a generic travel search app.
- Do not make a fitness walking app.
- Do not make a generic AI chat app.
- Make an outdoor AI companion app.
- The user should feel: "トモシビ remembered what I liked and is helping me decide where to go next."

## 20. Frontend Screens

### 20.1 Required Screens

1. Home / Companion Dashboard
2. Outing Condition Input
3. Route Suggestions
4. Route Detail
5. Spot Detail / Tell More
6. Companion Chat
7. In-Journey Progress
8. Journey Complete / Recap
9. Journey Memories List
10. Journey Memory Detail
11. Companion State / Profile
12. Preference Edit
13. Saved Places / Routes
14. External Link Confirmation
15. Area Mode

### 20.2 API Mapping

| Screen | Backend |
| --- | --- |
| Home | getUserCompanionState, future listJourneyMemories |
| Outing Condition Input | createGuideSession |
| Route Suggestions | suggestGuideRoute |
| Route Detail | suggestGuideRoute output, respondToCompanion, saveUserFeedback |
| Spot Detail | respondToCompanion tell_more, trackOutboundClick |
| Companion Chat | respondToCompanion |
| In-Journey Progress | respondToCompanion, saveUserFeedback |
| Journey Complete | completeJourney |
| Memories List | future listJourneyMemories |
| Memory Detail | future getJourneyMemory |
| Profile | getUserCompanionState |
| Preference Edit | future updateUserPreferences |
| Saved | future listSavedPlaces / listSavedRoutes |
| External Link | trackOutboundClick |
| Area Mode | future getAreaMode / listAreaAnnotations |

## 21. Frontend Design System Prompt

Use this common prompt at the beginning of all UI-generation prompts.

```md
あなたはTOMOSHIBIという外出型AIコンパニオンアプリのUI/UXを設計します。

TOMOSHIBIは、単なる観光ガイド、旅行検索、地図アプリ、AIチャットではありません。
ユーザーのことを少しずつ覚えていく相棒AIが、日常の散歩、街歩き、一人旅、旅先の空き時間に寄り添い、現在地・気分・興味・過去の好みをもとに、次の外出を自然に提案するアプリです。

全画面で共通するトーン:
- 静かで温かい
- 日常と旅の中間
- ひとりで街を歩く時間に寄り添う
- 観光予約サイトのように派手にしない
- フィットネスアプリにしない
- ゲーム的・恋愛的・依存的にしない
- AIチャットアプリっぽくしすぎない
- 地図アプリのように機械的にしすぎない
- 「相棒が覚えてくれている」感覚を、控えめに表現する

ビジュアル方針:
- ベースカラーは、白、淡いグレー、少し温かいオフホワイト
- アクセントカラーは、灯りを感じる琥珀色・柔らかい橙・淡い金色
- 補助色として、静かな緑、淡い青灰、墨色を少量使う
- 全体を単色テーマにしない
- 強いグラデーション、大きな装飾、派手な観光写真風の演出は避ける
- 角丸は控えめ。カードは8px程度
- 余白は落ち着いているが、情報密度は実用的に保つ

UI方針:
- モバイルWeb / PWA前提
- 片手で使いやすい
- 屋外でも見やすい文字サイズとコントラスト
- CTAは下部固定を基本にする
- チップ、セグメント、トグル、アイコンボタンを活用する
- 不明な情報は断定せず、「確認してみよう」「不明」と扱う
- AI生成文と外部API由来の事実情報は視覚的に分ける

ナビゲーション:
- 下部ナビを共通で使う
- 項目は「ホーム」「探す」「会話」「思い出」「設定」
- 現在の画面がどこに属するか分かるようにする

相棒AIの表現:
- 相棒名は「トモシビ」
- 話し方は穏やか、押し付けない、短く自然
- 吹き出しや小さな灯りアイコンで存在を表現する
- 大きすぎるキャラクター演出は不要
- 恋愛的な親密さではなく、外出を一緒に考える相棒感にする

言語:
- UIテキストは日本語
- アプリロゴ表記の「TOMOSHIBI」のみ英字可
- Good afternoon / Start Walking など英語UIは使わない

重要:
このあと作る各画面は、すべてこの共通トーン、色、余白、コンポーネント、ナビゲーションに揃えてください。
```

## 22. Home Screen UI Prompt

```md
上記のTOMOSHIBI共通デザイン方針に沿って、ホーム画面を作ってください。

画面の目的:
ユーザーがアプリを開いたときに、相棒AI「トモシビ」が前回の外出や好みを覚えていて、今日の外出を自然に始められる入口にする。
検索アプリのトップページではなく、「今日はどんな感じで歩こうか」と相棒に声をかけられるような画面にする。

現在の注意:
- フィットネスアプリに見せない
- Start Walking のような運動開始ボタンを使わない
- Good afternoon のような汎用挨拶を大見出しにしない
- Maple Street など海外っぽい地名を使わない
- UIテキストは日本語

想定データ:
- character.name: トモシビ
- user.preferenceSummary: 好きそうな場所: cafe, quiet, relax
- relationship.relationshipLevel: 2
- relationship.totalSessions: 2
- relationship.totalVisitedPlaces: 1
- relationship.sharedMemorySummary: 静かなカフェで一息。路地裏のカフェを一緒に記録した。
- recentJourneyMemories:
  - 静かなカフェで一息
  - 短いテスト散歩

レイアウト:
1. 上部ヘッダー
- 左上に「TOMOSHIBI」
- 右上に小さな設定アイコン
- ヘッダーは軽く、アプリ名を主張しすぎない

2. 相棒AIのメインエリア
- 小さな灯りのような相棒アイコン
- 名前: トモシビ
- メッセージ:
  「前に静かなカフェ、少し合っていそうだったね。今日は無理せず、近くを歩いてみる？」
- メッセージは大きすぎない吹き出しで表示
- 恋愛的・依存的に見えない距離感にする

3. 今日の外出開始エリア
- メインCTA: 「今日の外出を相談する」
- クイック開始チップ:
  - 30分だけ歩く
  - 静かな場所
  - カフェあり
  - 前回の雰囲気で
  - 旅先で使う

4. 覚えていることエリア
- タイトル: 「トモシビが覚えていること」
- 内容:
  - 静かな場所が合いそう
  - カフェに寄る外出が好きそう
  - 歩きすぎない方がよさそう
- タグ表示で控えめに見せる
- 「変えられる」リンクを小さく置く

5. 最近の思い出エリア
- タイトル: 「最近の思い出」
- カードを2件表示
- 各カード:
  - 思い出タイトル
  - 短いsummary
  - learnedPreferencesタグ
  - 「似た雰囲気で歩く」ボタン
- 写真がなくても成立するカードデザインにする

6. 下部ナビ
- ホーム
- 探す
- 会話
- 思い出
- 設定
- ホームを選択状態にする
```

## 23. Outing Condition Input UI Prompt

```md
前回作成したTOMOSHIBIホーム画面と同じデザインシステム、色、余白、角丸、タイポグラフィ、下部ナビ、相棒AIの表現を維持してください。

TOMOSHIBIの外出条件入力画面を作ってください。

画面の目的:
ユーザーが相棒AI「トモシビ」に、今の外出条件を伝える画面。
検索フォームではなく、「今日はどう歩きたいか」を相棒に相談する体験にする。

対応API:
- createGuideSession

入力データ:
- userId
- characterId
- mode
- origin
- areaId
- context.availableMinutes
- context.mobility
- context.mood
- context.interests
- context.companionType

レイアウト:
1. 上部
- 戻るボタン
- タイトル: 「今日の歩き方」
- 小さな説明: 「今の気分に合わせて、トモシビが候補を考えます」

2. 相棒AIメッセージ
- トモシビの小さな灯りアイコン
- 吹き出し:
  「今日はどんな感じで歩こうか。短めでも、少し寄り道でも大丈夫。」

3. 現在地エリア
- 現在地取得カード
- 表示例: 「現在地: 壱岐テスト地点」
- ボタン:
  - 現在地を使う
  - 場所を変更

4. 空き時間
- 15分
- 30分
- 45分
- 60分
- 90分
- 選択中は琥珀色アクセント

5. 移動手段
- 徒歩
- 自転車
- 車
- 公共交通
- アイコン付きセグメント

6. 気分
- 落ち着きたい
- 歴史を知りたい
- 写真を撮りたい
- カフェに行きたい
- 軽く歩きたい
- 夜に楽しみたい

7. 興味
- cafe
- quiet
- history
- nature
- scenic
- local_story

8. 誰と歩くか
- ひとり
- 友達
- カップル
- 家族
- 初期ターゲットはひとりなので「ひとり」をデフォルトにする

9. 下部固定CTA
- 「トモシビに提案してもらう」
- 小さく「場所情報は外部データをもとに確認します」
```

## 24. Remaining Frontend Prompts To Expand

Need to write detailed prompts for:

- Route Suggestions
- Route Detail
- Spot Detail / Tell More
- Companion Chat
- In-Journey Progress
- Journey Complete / Recap
- Journey Memories List
- Journey Memory Detail
- Companion Profile
- Preference Edit
- Saved Places / Routes
- External Link Confirmation
- Area Mode

## 25. Security and Safety

### 25.1 API Keys

- Do not hardcode keys in source.
- Use `.env` locally.
- Use Secret Manager before production.
- `.env.example` contains key names only.

### 25.2 Firestore

- Backend currently uses Admin SDK.
- Production Security Rules are not ready.
- Current `firestore.rules` is intentionally restrictive and not a full client access model.

### 25.3 AI Safety

- Do not create dependency-oriented romantic companion behavior.
- Do not provide mental health counseling.
- Do not store sensitive personal data.
- Do not make unsafe outdoor recommendations.
- Do not make unverifiable historical claims.

## 26. Local Development Commands

Use Node 20:

```sh
cd functions
npm run build
npm run lint
npm run test
```

Emulator smoke:

```sh
./functions/node_modules/.bin/firebase emulators:exec --project tomoshibi-local --only functions,firestore "cd functions && npm run seed:local && npm run smoke:local"
```

If Java is installed via Homebrew:

```sh
PATH="/opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/openjdk@21/bin:$PATH" JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./functions/node_modules/.bin/firebase emulators:exec --project tomoshibi-local --only functions,firestore "cd functions && npm run seed:local && npm run smoke:local"
```

## 27. Definition of Done

For each backend change:

- TypeScript build passes.
- lint passes.
- tests pass.
- major APIs work in mock/emulator where relevant.
- Firestore access remains in Repository layer.
- external APIs remain in Service layer.
- LLM calls remain in Companion/Memory services.
- fallback exists for LLM and external API failures.
- changed files, commands, results, and TODOs are reported.

For frontend work:

- UI follows TOMOSHIBI common design system.
- All visible text is Japanese except TOMOSHIBI logo.
- It does not look like a fitness app, generic travel app, map app, or generic chatbot.
- It distinguishes AI-generated companion text from factual place data.
- It maps clearly to backend API inputs/outputs.
- Mobile/PWA layout is usable one-handed.

## 28. Next Recommended Tasks

1. Expand detailed UI prompts for all remaining frontend screens.
2. Add frontend API contract document or generated client types.
3. Implement frontend scaffold under `web/`.
4. Add `listJourneyMemories` and `getJourneyMemory`.
5. Add `updateUserPreferences`.
6. Add `listSavedPlaces` / `listSavedRoutes`.
7. Improve action-specific companion responses.
8. Harden Firebase Security Rules and Secret Manager setup.
9. Review Google Places policy before production.
10. Add route selection and place card viewed events.
