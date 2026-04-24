# Iwami AI Plan Backend (Firebase Functions)

このディレクトリは、岩美町向け観光Webアプリの `AIでプランをつくる` 向けバックエンドです。  
目的は「入力の安全な受け取り・検証・正規化・保存」と「非同期の3候補旅程生成」です。

## 実装済み

- `createPlanRequest` Function
  - 入力受信
  - Zodバリデーション
  - 正規化
  - Firestore保存 (`planRequests`)
  - `planRequestId` + `pollToken` 返却
- `getPlanRequestStatus` Function
  - `planRequestId` + `pollToken` を受信
  - `status` / `generationStage` / `progressPercent` / `result` / `error` を返却
- 非同期生成ワーカー
  - `planRequests/{id}` 作成トリガーで起動
  - `queued -> generating -> completed/failed` を更新
- ロジック分離
  - `validatePlanRequestInput`
  - `normalizePlanRequest`
  - `savePlanRequest`
  - `buildPlanGenerationPrompt`
  - `generatePlans`（AI候補選定 + ルール時系列化）
- `spots` データ基盤
  - Spot型/Zodスキーマ
  - Firestore保存・更新・取得・検索
  - 営業情報の構造化 (`business.weeklyHours`)
  - 機械判定データ (`business.operationalJudgement`)
    - `regularClosedDays`（定休日）
    - `seasonalClosures`（季節休業）
    - `lastAdmission`（最終受付）
    - `needsManualReview`（要追加調査フラグ）
  - Callable Functions (`createSpot`, `updateSpot`, `getSpotById`, `listSpots`, `listSpotsByCategory`, `searchSpots`)
  - seedスクリプト (`npm run seed:spots`)
  - xlsxインポート (`npm run import:spots:xlsx`)
  - open-info CSV取り込み (`npm run import:spots:openinfo-csv:emulator`)
  - 追加調査CSV取り込み (`npm run import:spots:missing-fields-verified-csv:emulator`)
  - 営業情報バックフィル (`npm run backfill:spots:operational:emulator`)
  - 要追加調査スポット抽出 (`npm run report:spots:operational-gaps:emulator`)
- `referenceData/transit` データ基盤
  - 3駅ノード（岩美駅・東浜駅・大岩駅）
  - 山陰本線の3駅間サービス（4方向）
  - 便ごとの edge schedule (`departAt/arriveAt/departMinutes/arriveMinutes/durationMinutes`)
  - bus GTFS-JP 取り込み（`stops/routes/trips/stop_times/calendar`）
  - 取得関数: `getNode`, `listOriginReturnStations`, `getOutgoingSchedules`, `getNextTrips`
  - seedスクリプト (`npm run seed:transit`)
  - GTFS import (`npm run import:transit:gtfs:emulator`)
- スポット間移動時間の計算基盤
  - 近似 Route Matrix utility (`computeApproximateRouteMatrix`)
  - `mode`: `walk / rental_cycle / car / bus / train` に対応
  - 旅程生成では座標ベース近似で `durationsMinutes` / `distancesMeters` を利用
  - Google Routes API utility は将来切替用として別実装で保持

## ディレクトリ構成

- `src/create-plan-request.ts`: Function本体（薄いオーケストレーション）
- `src/get-plan-request-status.ts`: ステータス取得 API
- `src/plan-request-worker.ts`: Firestore trigger
- `src/validation.ts`: 入力検証（Zod + 条件付き必須）
- `src/normalize.ts`: AI生成向け内部型への正規化
- `src/repository.ts`: Firestore保存
- `src/prompt.ts`: LLM用プロンプト組み立て
- `src/generate.ts`: 生成処理（AI候補選定 + ルール時系列化）
- `src/constants.ts`: 固定値
- `src/__tests__/*.spec.ts`: 最低限のユニットテスト
- `src/routing/approximateRouteMatrix.ts`: 座標ベース近似の移動時間行列
- `src/routing/googleRoutesMatrix.ts`: Google Routes API 連携（将来切替用）

## createPlanRequest 入力例

```json
{
  "tripStyle": "day_trip",
  "departureType": "current_location",
  "departureAt": "2026-04-22T09:30:00+09:00",
  "departureLocation": { "lat": 35.54, "lng": 134.33 },
  "durationType": "custom",
  "customDurationMinutes": 180,
  "returnTransport": "train",
  "returnStationId": "iwami_station",
  "localTransports": ["walk", "rental_cycle", "walk"],
  "desiredSpots": ["浦富海岸", " 岩井温泉 "],
  "tripPrompt": "海を見ながらゆっくり回りたい"
}
```

## 保存フォーマット (`planRequests`)

- `createdAt`, `updatedAt`: `serverTimestamp()`
- `status`: `"queued"`
- `rawInput`: フロントからの入力
- `normalizedRequest`: 正規化済み内部表現
  - `returnConstraint`: `{"type":"train_station","stationId":"iwami_station"}` または `{"type":"free"}`
- `generationMeta`: `{ source: "web", version: 1, prompt: string }`
- `result`: `null`（初期値）
- `error`: `null`（初期値）

## 今後の生成結果スキーマ（骨格）

- `result.plans: PlanCandidate[]`
  - `id`
  - `title`
  - `description`
  - `estimatedDurationMinutes`
  - `transportModes`
  - `waypoints`
  - `reasonWhyRecommended`
  - `tags`
  - `couponCompatible`
  - `storyCompatible`
- `result.summary: string`
- `result.generationNotes: string[]`
- `result.warnings: string[]`

## 応答

成功:

```json
{
  "ok": true,
  "planRequestId": "xxx",
  "pollToken": "yyy",
  "status": "queued"
}
```

失敗:

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "customDurationMinutes is required when durationType is custom",
  "details": [{ "path": "customDurationMinutes", "message": "..." }]
}
```

## テスト

```bash
cd apps/iwami_proof_of_concept/functions
npm install
npm test
```

## 移動時間計算（MVP）

MVP の旅程生成は `computeApproximateRouteMatrix` を使用し、Google Routes API には依存しません。  
このため `GOOGLE_MAPS_SERVER_API_KEY` は必須ではありません。

将来、精密な道路ベース計算に切り替える場合のみ `googleRoutesMatrix.ts` を利用します。

## Transit seed/import

```bash
cd apps/iwami_proof_of_concept/functions
npm run seed:transit:emulator
npm run import:transit:gtfs:emulator -- --input /absolute/path/to/gtfs_dir_or_zip
```

- seedファイル
  - `src/seeds/transit/transportNodes.seed.json`
  - `src/seeds/transit/transitCalendars.seed.json`
  - `src/seeds/transit/transitServices.seed.json`
  - `src/seeds/transit/transitEdgeSchedules.seed.json`
- GTFS import実装
  - `src/transit/importers/gtfs/parser.ts`
  - `src/transit/importers/gtfs/mapper.ts`
  - `src/transit/importers/gtfs/overlays.ts`
  - `src/scripts/importTransitGtfs.ts`
- 保存先
  - `referenceData/transit/transportNodes/{nodeId}`
  - `referenceData/transit/transitCalendars/{calendarId}`
  - `referenceData/transit/transitServices/{serviceId}`
  - `referenceData/transit/transitEdgeSchedules/{edgeScheduleId}`
- 実装メモ
  - seed/import時に `departMinutes/arriveMinutes/durationMinutes` を計算
  - trips は `departMinutes` 昇順で保存
  - upsert (idempotent) で再実行可能
  - GTFS overlay で `routeVariant`, `isShoppingTrip`, `reservationRuleNote` を上乗せ

実装済み最低限テスト:

- current_location で座標欠落 -> エラー
- overnight で lodgingName 欠落 -> エラー
- custom で customDurationMinutes 欠落 -> エラー
- localTransports 空 -> エラー
- 2h/4h/custom の durationMinutes 正規化
- rental_cycle 含有時の派生フラグ
- `planRequests` への保存内容（`rawInput`, `normalizedRequest`, `status: queued`）

## AIモデル設定（必須）

この生成フローは Gemini 必須です。フォールバックは行いません。

- 優先: Functions 実行環境の環境変数
  - `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` / `GOOGLE_GENAI_API_KEY`
  - `PLAN_GEMINI_MODEL`（または `GEMINI_ROUTE_MODEL`）

推奨は `apps/iwami_proof_of_concept/functions/.env.local` に直接設定することです。

未設定の場合、`AI_PARSE_FAILED` で `failed` 終了します。

## 次の開発順（推奨）

1. `returnConstraint` を使った返着制約のルート判定実装
2. `planRequestId` をキーにフロントからステータス取得（polling or listener）
3. `spots` コレクションの候補抽出ロジック（移動手段・雨天適性・テーマ重み）
4. `generatePlans` 本実装（queued -> generating -> completed/failed）
5. `result` を3候補表示UIに接続
