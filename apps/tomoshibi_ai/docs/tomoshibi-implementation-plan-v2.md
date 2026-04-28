# TOMOSHIBI Implementation Plan v2

Last updated: 2026-04-27

このドキュメントは、既存の `docs/tomoshibi-master-plan.md` に対して、直近の事業構想で整理された「長期記憶・多様なキャラクター・見た目カスタマイズ・九州大学在学生向け実証・壱岐モード接続」を反映するための差分実装計画である。

今後の実装判断では、既存バックエンドMVPを壊さず、以下の方向へ収束させる。

> 既存の「AIガイド寄りの外出MVP」を、「長期記憶・多様なキャラクター・見た目・愛着を持ち、日常利用から壱岐へ接続する外出型AIコンパニオン」へ進化させる。

## 1. Current Assessment

現状実装はゼロから作り直す必要はない。すでに以下の垂直スライスが成立している。

1. セッション作成
2. 周辺スポット取得
3. ルート候補生成
4. 相棒AIによる提案理由生成
5. 会話・反応記録
6. フィードバック保存
7. 外出完了時の思い出化
8. 次回提案への記憶反映
9. 外部リンククリック計測

強み:

- LLMに事実を創作させない責任分界が正しい。
- Firebase Functions / Firestore / Repository / Service の分離ができている。
- JourneyMemory / Relationship / UserMemory の土台がある。
- Gemini による提案・会話・振り返り生成が動いている。
- `areaModes/iki`、`placeAnnotations`、`localStory` の基盤がある。

主要な差分:

| 領域 | 現状 | 最新構想との差分 |
| --- | --- | --- |
| 初期ターゲット | 一人旅・都市部散歩など広め | 九州大学在学生を初期実証の中心に置く |
| キャラクター | default character中心 | 複数キャラ・見た目カスタマイズが必要 |
| キャラ差分 | `guideStyle` で体験差分に見える可能性 | 全キャラが全体験に対応し、差分は話し方・見た目・距離感に限定 |
| 見た目 | 未実装 | 愛着形成・課金可能性の中核 |
| 記憶 | summary中心 | 構造化長期記憶・編集・削除・同意管理が必要 |
| 物語 | localStory / AreaMode中心 | ユーザーと相棒の共有体験・章立てへ再定義 |
| 壱岐実証 | AreaMode seedあり | 日常利用者を壱岐モードへ接続する導線が必要 |
| 送客 | outbound click中心 | 提案から訪問・予約意向までのファネル計測が必要 |
| フロント | 未実装 | 相棒感・見た目・記憶体験の中核として最優先 |

## 2. Updated Product Definition

### 2.1 Updated One Sentence

ユーザーとの記憶を育てる相棒AIが、日常の散歩・街歩きから壱岐などの旅先まで一緒に歩き、会話・好み・過去の体験をもとに、次の発見・立ち寄り・体験へ自然に導く外出型AIコンパニオン。

### 2.2 Updated Core Concept

TOMOSHIBIは、単なるAI観光ガイドでも、AI旅行プランナーでも、AIチャットでもない。

TOMOSHIBIは、ユーザーごとに育つ相棒AIが、日常の散歩・キャンパス歩き・街歩き・一人旅・旅先での空き時間に同行し、現在地・気分・興味・過去の好み・相棒との共有記憶をもとに、次の外出や立ち寄りを提案する外出型AIコンパニオンである。

初期実証では、九州大学在学生の日常外出を起点に、相棒AIとの接点・愛着・記憶を形成する。その後、壱岐モードを追加し、日常で育った相棒AIをそのまま壱岐での非日常旅行体験へ接続する。

### 2.3 Differentiation

| 比較対象 | TOMOSHIBIの違い |
| --- | --- |
| AI観光ガイド | 場所を案内するだけでなく、相棒との関係性を起点に外出体験を作る |
| AI旅行プランナー | その場の入力条件だけでなく、長期記憶と共有体験を踏まえて提案する |
| AIコンパニオン | 会話に閉じず、現実の外出・街歩き・旅行・地域送客に接続する |
| デジタルマップ | 情報を並べるだけでなく、相棒AIが会話の中で次の行動を提案する |
| 観光DXツール | 地域側の送客だけでなく、ユーザー側に継続接点と愛着を持つ |

## 3. Character v2

### 3.1 Core Rule

キャラクターごとに体験ジャンルを制限してはいけない。

禁止:

- 歴史向きキャラ
- カフェ向きキャラ
- 自然向きキャラ
- 作業場所向きキャラ
- 旅行向きキャラ

全キャラクターが以下に対応する。

- カフェ提案
- 食提案
- 自然・景色提案
- 歴史・文化説明
- 作業場所提案
- 体験アクティビティ提案
- ルート生成
- 旅中の予定変更
- 壱岐モード対応
- 日常外出対応
- 送客導線対応

キャラクター差分は以下に置く。

- 話し方
- 距離感
- 感情表現
- 表情
- 仕草
- 見た目
- 呼び方
- 提案の言い回し
- 関係性の育ち方

### 3.2 Character v2 Type

```ts
export type Character = {
  id: string;
  name: string;
  description: string;
  persona: {
    personality: string[];
    tone: "friendly" | "calm" | "energetic" | "mysterious" | "gentle" | "curious";
    firstPerson: string;
    userCallNameDefault: string;
    catchphrases?: string[];
    backstory?: string;
  };
  expressionStyle: {
    emotionalDistance: "close" | "balanced" | "polite";
    humorLevel: "low" | "medium" | "high";
    encouragementStyle: "soft" | "cheerful" | "thoughtful" | "matter_of_fact";
    explanationStyle: "simple" | "reflective" | "conversational";
  };
  capabilities: {
    canSuggestFood: true;
    canSuggestCafe: true;
    canSuggestHistory: true;
    canSuggestNature: true;
    canSuggestWorkSpot: true;
    canSuggestActivity: true;
    canGuideAreaMode: true;
  };
  defaultAppearanceId?: string;
  createdAt: string;
  updatedAt: string;
};
```

Implementation note:

- `guideStyle` は段階的に `expressionStyle` へ移行する。
- 後方互換が必要な間は両方を許容してよい。
- UIでは「このキャラはカフェ向き」などの機能差分を表示しない。

## 4. Appearance Customization

見た目の固有性は、愛着形成と将来的な課金可能性の中核である。

### 4.1 New Collections

```txt
characterAppearances/{appearanceId}
characterParts/{partId}
userCharacterCustomizations/{userId_characterId}
```

### 4.2 CharacterAppearance

```ts
export type CharacterAppearance = {
  id: string;
  characterId: string;
  displayName: string;
  baseStyle: "mii_like" | "duolingo_like" | "flat_avatar";
  previewImageUrl?: string;
  parts: {
    faceShape?: string;
    eyes?: string;
    eyebrows?: string;
    mouth?: string;
    hair?: string;
    outfit?: string;
    accessory?: string;
    colorTheme?: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 4.3 CharacterPart

```ts
export type CharacterPart = {
  id: string;
  category: "faceShape" | "eyes" | "eyebrows" | "mouth" | "hair" | "outfit" | "accessory" | "colorTheme";
  name: string;
  assetUrl?: string;
  rarity?: "free" | "standard" | "limited" | "area_limited" | "paid";
  areaId?: string;
  unlockCondition?: {
    type: "free" | "relationship_level" | "journey_completed" | "area_visit" | "purchase";
    value?: string | number;
  };
  createdAt: string;
  updatedAt: string;
};
```

### 4.4 UserCharacterCustomization

```ts
export type UserCharacterCustomization = {
  id: string;
  userId: string;
  characterId: string;
  appearanceName?: string;
  selectedParts: {
    faceShape?: string;
    eyes?: string;
    eyebrows?: string;
    mouth?: string;
    hair?: string;
    outfit?: string;
    accessory?: string;
    colorTheme?: string;
  };
  unlockedPartIds: string[];
  lastUpdatedAt: string;
  createdAt: string;
};
```

### 4.5 Character APIs

Add:

- `getAvailableCharacters`
- `getCharacterCustomization`
- `updateCharacterCustomization`
- `unlockCharacterPart`

Initial unlock rules:

- Free starter parts.
- Journey completed unlock.
- Iki mode participation unlock.

Do not implement paid parts in the first MVP.

## 5. Memory v2

### 5.1 Current State

Current memory primitives:

- `User.preferenceSummary`
- `User.preferences`
- `Relationship.sharedMemorySummary`
- `JourneyMemory`
- `JourneyMemory.learnedPreferences`
- `UserMemoryService`
- `RelationshipService`

These remain useful, but they are not enough for long-term trust and governance.

### 5.2 New Collection

```txt
userMemories/{memoryId}
```

```ts
export type UserMemory = {
  id: string;
  userId: string;
  characterId?: string;
  type:
    | "place_preference"
    | "food_preference"
    | "pace_preference"
    | "interest"
    | "mobility_preference"
    | "avoidance"
    | "work_style"
    | "travel_style"
    | "relationship_note"
    | "area_experience";
  label: string;
  value: string;
  confidence: number;
  source: {
    type: "explicit_user_input" | "feedback" | "journey_recap" | "conversation_summary" | "system_inferred";
    sessionId?: string;
    journeyId?: string;
    messageId?: string;
  };
  scope: "global" | "area" | "session";
  areaId?: string;
  usableForRecommendation: boolean;
  userVisible: boolean;
  createdAt: string;
  updatedAt: string;
  lastReinforcedAt?: string;
  deletedAt?: string;
};
```

### 5.3 Memory Types

1. Explicit memory:
   - User directly says it.
   - High confidence.

2. Behavioral memory:
   - Inferred from likes/saves/skips/visits.
   - Medium confidence.

3. Recap/conversation memory:
   - Extracted from journey recap or conversation summary.
   - Must be user-visible when used for personalization.

### 5.4 Memory APIs

Add:

- `listUserMemories`
- `updateUserMemory`
- `deleteUserMemory`
- `resetUserMemory`
- internal `summarizeUserMemoriesForPrompt`

### 5.5 Migration Rule

Do not remove existing fields immediately.

| Existing field | New role |
| --- | --- |
| `preferenceSummary` | Cache summary generated from `userMemories` |
| `User.preferences` | Explicit settings / defaults |
| `Relationship.sharedMemorySummary` | Relationship summary |
| `JourneyMemory.learnedPreferences` | Source for `userMemories` |

## 6. Story and Journey Chapters

Story should not mean a heavy scripted regional plot.

The story is:

> ユーザーとAIコンパニオンが、日常外出や旅行を重ねることで形成する共有体験の積み重ね。

### 6.1 JourneyMemory

Keep using `JourneyMemory` as the core unit of a shared outing.

### 6.2 Future JourneyChapter

```txt
journeyChapters/{chapterId}
```

```ts
export type JourneyChapter = {
  id: string;
  userId: string;
  characterId: string;
  title: string;
  chapterType: "daily" | "area_mode" | "travel";
  areaId?: string;
  journeyMemoryIds: string[];
  summary: string;
  companionReflection: string;
  themes: string[];
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

Initial MVP can treat chapters as a UI grouping without a collection. For Iki mode, show it as "壱岐編" or "相棒と初めての島旅".

### 6.3 localStory

`localStory` remains, but it is factual/local context for companion conversation, not a scripted narrative engine.

## 7. Kyushu University Pilot

### 7.1 Updated Initial Target

The initial pilot should focus on Kyushu University students.

Purpose:

- Build daily touchpoints.
- Create attachment and memory before travel.
- Prepare a user base for Iki mode conversion.
- Compare Iki conversion and satisfaction between pre-existing users and new users.

### 7.2 AreaMode

Add:

```txt
areaModes/kyushu_univ
```

Extend `AreaMode`:

```ts
export type AreaMode = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  modeType: "campus_daily" | "tourism_area" | "city_walk";
  active: boolean;
  defaultOrigin?: {
    lat: number;
    lng: number;
    label: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
```

Implementation recommendation:

- Short term: use `mode = "area_guide"` + `areaId = "kyushu_univ"`.
- UI label: "キャンパス散歩" / "空きコマ外出".

### 7.3 Kyushu University Use Cases

- 空きコマ散歩
- カフェ・作業場所探し
- 気分転換
- 短時間で戻れる外出
- 友人共有 is future, not MVP.

Tags:

- campus
- cafe
- quiet
- study
- short_walk
- bus_access
- nature
- rest

## 8. Iki Mode

### 8.1 Definition

壱岐モードは、単なる地域ガイドではない。

> 日常利用で育った相棒AIと、壱岐という舞台で新しい章を始める体験。

Requirements:

- Reflect daily memories in Iki suggestions.
- Overlay local information, stores, activities, and lodging links.
- Store recap as "壱岐編".
- Compare pre-existing users and new users.

### 8.2 Area Mode Events

Add:

- `area_mode_viewed`
- `area_mode_interest_clicked`
- `area_mode_join_requested`
- `area_mode_started`
- `area_mode_completed`

### 8.3 AreaMode Extension

```ts
export type AreaMode = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  modeType: "campus_daily" | "tourism_area" | "city_walk";
  active: boolean;
  onboardingMessage?: string;
  chapterTitle?: string;
  localThemes?: string[];
  partnerLinkIds?: string[];
  defaultOrigin?: {
    lat: number;
    lng: number;
    label: string;
  };
  createdAt: string;
  updatedAt: string;
};
```

### 8.4 PlaceAnnotation Extension

```ts
export type PlaceAnnotation = {
  id: string;
  areaId: string;
  provider: "google_places" | "own_db" | "mock";
  providerPlaceId?: string;
  name: string;
  tomoshibiTags: string[];
  localStory?: {
    short: string;
    long?: string;
    source?: string;
    sourceUrl?: string;
    verifiedBy?: string;
  };
  partner?: {
    isPartner: boolean;
    partnerLinkIds?: string[];
    disclosureLabel?: string;
  };
  recommendedContext?: {
    goodFor?: string[];
    avoidIf?: string[];
    estimatedStayMinutes?: number;
  };
  createdAt: string;
  updatedAt: string;
};
```

### 8.5 Iki UI Screens

- Iki Mode Intro
- Companion invitation message
- Iki interest input
- Iki route suggestions
- Iki spot details
- Store/activity/lodging links
- Iki journey chat
- Iki recap
- Iki chapter memory

The companion does not become a different persona in Iki mode. The user's existing companion gains Iki local context.

## 9. Recommendation v2

### 9.1 PersonalizationSignal

```ts
export type PersonalizationSignal = {
  memoryId: string;
  type: string;
  label: string;
  value: string;
  confidence: number;
  weight: number;
};
```

RouteScorer should add:

- userMemory match
- past liked place types
- past saved tags
- skipped tags penalty
- preferred pace
- preferred stay time
- area-specific interest
- companion relationship context

### 9.2 RecommendationReason

```ts
export type RecommendationReason = {
  type:
    | "current_condition"
    | "user_memory"
    | "area_context"
    | "time_fit"
    | "distance_fit"
    | "partner_match";
  label: string;
  userVisibleText: string;
};
```

Examples:

- 前に静かな場所が合っていそうだったから
- 30分で戻りやすい距離だから
- 壱岐で海の景色を少し見たいと言っていたから
- カフェに寄る外出をよく保存しているから

### 9.3 Anti-Advertising Rules

- Partner weighting has a strict cap.
- Do not show partner spots that do not match user conditions.
- Do not use advertising-like language.
- Partner/external link disclosure must be transparent.
- Keep `avoid advertising-like pressure` in LLM prompts.

## 10. Funnel and KPI Events

### 10.1 Add Events

- `route_selected`
- `place_card_viewed`
- `place_detail_viewed`
- `place_tell_more_requested`
- `place_saved`
- `place_skipped`
- `place_liked`
- `place_visited`
- `partner_link_viewed`
- `partner_link_clicked`
- `booking_intent_clicked`
- `area_mode_interest_clicked`
- `area_mode_join_requested`
- `recommendation_accepted`
- `recommendation_rejected`

### 10.2 Daily Use Funnel

1. app_opened
2. companion_dashboard_viewed
3. create_session_started
4. session_started
5. route_suggested
6. route_selected
7. place_detail_viewed
8. place_visited / journey_completed
9. second_session_started

### 10.3 Iki Conversion Funnel

1. area_mode_viewed
2. area_mode_interest_clicked
3. area_mode_join_requested
4. area_mode_started
5. route_suggested
6. route_selected
7. partner_link_clicked / place_visited
8. area_mode_completed

### 10.4 Referral Funnel

1. partner_place_suggested
2. partner_place_card_viewed
3. partner_place_detail_viewed
4. partner_link_clicked
5. booking_intent_clicked
6. visited / redeemed / completed

Initial MVP does not need confirmed booking completion. Click, intent, self-reported visit, and coupon/code usage are acceptable substitutes.

## 11. Frontend v2

Frontend is the largest missing area.

The backend has value, but the TOMOSHIBI experience only becomes visible in frontend:

- companion presence
- visual attachment
- feeling remembered
- outing consultation
- Iki invitation
- accumulated memories

### 11.1 Phase F1: Kyushu University Daily MVP

1. Onboarding / Companion Selection
2. Companion Appearance Customization
3. Home / Companion Dashboard
4. Outing Condition Input
5. Route Suggestions
6. Route Detail
7. Spot Detail / Tell More
8. Companion Chat
9. Journey Complete / Recap
10. Memories List
11. Memory Edit

### 11.2 Phase F2: Iki Mode MVP

12. Area Mode Intro
13. Iki Mode Onboarding
14. Iki Route Suggestions
15. Partner Link Confirmation
16. Iki Journey Recap
17. Iki Chapter Memory

### 11.3 Design System Update

Old:

- Companion name is always "トモシビ".

New:

- App name is "TOMOSHIBI".
- The companion name is the selected character's name.
- Default character can be "トモシビ".
- All characters support all outing/travel/area guide experiences.
- UI should present characters by atmosphere, appearance, and speech style, not functional category.

## 12. Backend Task Priority

### P0: Master Plan v2 Update

- Update product definition.
- Update target users.
- Update character policy.
- Add appearance customization.
- Add Memory v2.
- Add Kyushu University AreaMode.
- Redefine Iki mode.
- Update KPI.
- Update frontend prompts for multiple companions.

### P1: Character v2

1. Update `Character` type.
2. Add `CharacterAppearance`.
3. Add `CharacterPart`.
4. Add `UserCharacterCustomization`.
5. Add repositories.
6. Add seed.
7. Add `getAvailableCharacters`.
8. Add `getCharacterCustomization`.
9. Add `updateCharacterCustomization`.
10. Extend `getUserCompanionState`.

### P1: Memory v2

1. Add `UserMemory` type.
2. Add `UserMemoryRepository`.
3. Extend `UserMemoryService`.
4. Generate UserMemory from feedback.
5. Generate UserMemory from JourneyMemory.
6. Add `listUserMemories`.
7. Add `updateUserMemory`.
8. Add `deleteUserMemory`.
9. Add `resetUserMemory`.
10. Add prompt memory summary.

### P1: Kyushu University AreaMode

1. Add `areaModes/kyushu_univ` seed.
2. Add Kyushu University mock/own_db places.
3. Add annotations.
4. Ensure stable `areaId` handling.
5. Add AreaMode context to route prompt.
6. Add campus tags.

### P2: Iki Conversion Tracking

1. Add area mode events.
2. Add `trackAreaModeEvent`.
3. Add Iki mode external/application links.
4. Record existing vs new user state.

### P2: Recommendation v2

1. Add `PersonalizationSignal`.
2. Add `RecommendationReason`.
3. Reflect UserMemory in RouteScorer.
4. Add recommendationReasons to RoutePlan.
5. Add partner weight cap.
6. Include visible reasons in suggest response.

### P2: Referral Funnel

1. Add route selected.
2. Add place viewed/detail events.
3. Add partner link viewed/clicked.
4. Add booking intent.
5. Add accepted/rejected events.

## 13. Roadmap

### Phase A: Master Plan v2

Goal:

Align existing docs and implementation plan with current business direction.

Done when:

- Master Plan includes v2 direction.
- Character-by-functional-category wording is removed.
- Kyushu University daily use to Iki mode flow is explicit.

### Phase B: Character v2

Goal:

Enable companion individuality and appearance customization.

Done when:

- Multiple characters can be selected.
- Parts can be selected.
- All characters support all experiences.
- UI does not classify characters by functional specialty.

### Phase C: Memory v2

Goal:

Make long-term memory inspectable, editable, and useful for recommendations.

Done when:

- User can view memories.
- User can edit/delete/reset memories.
- RouteScorer and prompts use structured memory.

### Phase D: Kyushu University Daily MVP

Goal:

Validate daily outdoor companion value with Kyushu University students.

Done when:

- Students can use it for free-period walks, cafes, short outdoor reset.
- First journey completion and second session are measurable.
- Attachment/memory perception can be surveyed.

### Phase E: Iki Mode Connection

Goal:

Convert daily users to Iki mode.

Done when:

- Iki intro and interest events exist.
- Existing vs new user can be compared.
- Iki journey is stored as a chapter/memory.

### Phase F: Referral and B2B Validation

Goal:

Show value to regional businesses.

Done when:

- Suggestion to view to click to intent funnel is visible.
- Self-reported visits and simple coupons/codes are trackable.

## 14. Agent Rules for v2

絶対に守ること:

- キャラクターごとに体験ジャンルを制限しない。
- LLMに事実を創作させない。
- 送客対象を広告的に押し込まない。
- 恋愛依存型AIにしない。
- ユーザーが記憶を確認・編集・削除できる前提にする。
- 九州大学実証と壱岐実証の導線を分けて設計する。
- 壱岐モードは脚本型物語ではなく、相棒との新しい章として扱う。

実装判断の優先順位:

1. ユーザーの安全・プライバシー
2. 事実情報の正確性
3. ユーザーの満足度
4. 相棒との関係性・愛着
5. 外出行動への転換
6. 地域送客
7. 収益化

短期的な送客や課金よりも、相棒AIへの信頼を優先する。

## 15. Next Tasks

1. Update `docs/tomoshibi-master-plan.md` to include v2.
2. Update `AGENTS.md` to reference v2.
3. Implement Character v2 types and seed.
4. Implement Character customization APIs.
5. Implement Memory v2.
6. Implement Kyushu University AreaMode.
7. Scaffold frontend.
8. Implement Iki conversion events.
9. Expand referral funnel events.
