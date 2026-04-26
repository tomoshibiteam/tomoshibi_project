# Spots Data Foundation

`spots` コレクションは、以下3用途を同時に満たすための共通データ基盤です。

1. マップ表示（観る/食べる/買う/体験）
2. AI旅程生成（希望条件とスポット属性の照合）
3. ルールベース絞り込み（営業時間/移動手段/滞在時間/天候適性/駅周辺条件）

## 設計意図

- **表示情報**と**旅程判定情報**を1ドキュメントに統合
- `plannerAttributes` と `aiContext` を分離し、
  - ルール判定: スコア・適性・制約
  - AI判定: 要約文脈・利用ケース
  を使い分け可能にする
- 将来拡張を見越し、重い項目は削除せず optional で先に構造化

## 入力運用の最適化（重複項目の自動補完）

作成/更新時 (`validateSpotInput`) で、重複しやすい項目は自動補完します。

- `shortName` 未入力: `nameJa` を採用
- `descriptionLong` 未入力: `descriptionShort` を採用
- `pricing.priceLabel` 未入力: `priceType / priceMinYen / priceMaxYen` から自動生成
- `plannerAttributes.themes` / `moodTags` 未入力: `tags` から補完
- `aiContext` 未入力: `descriptionShort` / `nameJa` / `themes` / `moodTags` から補完

補完は「入力を軽くするため」の前処理で、保存後の `spots` ドキュメント構造は従来どおりです。

## コレクション

- `spots/{slug}`
- ドキュメントIDは slug（例: `iwami-station`, `uradome-coast`）

## 主なフィールド

- 基本: `id`, `slug`, `nameJa`, `shortName`, `status`
- カテゴリ: `primaryCategory`, `secondaryCategories`, `tags`
- 位置: `location`, `nearestStations`
- 表示文脈: `descriptionShort`, `descriptionLong`, `heroImageUrl` など
- 営業: `business`（`estimatedStayMinutesMin/Max`, `isAlwaysOpen`, `weeklyHours`, `operationalJudgement` など）
- 料金: `pricing`
- アクセス: `access.supportedTransports`, `requiresFirstStop`, `requiredFirstStopReason`
- 旅程判定: `plannerAttributes`（theme, weather, scores, physicalLoad 等）
- AI文脈: `aiContext`（plannerSummary, whyVisit, bestFor, avoidIf, sampleUseCases）
- 検索: `searchText`（保存時に正規化生成）
- 管理: `source`, `lastReviewedAt`, `createdAt`, `updatedAt`

## 旅程生成での利用想定

- 例: 「海景観 + 海鮮 + 歩きすぎたくない + 駅周辺にも寄りたい」
  - `plannerAttributes.themes` で `sea_view`, `seafood` を照合
  - `foodScore`, `scenicScore`, `physicalLoad` でスコアリング
  - `stationStopoverScore` と `location.stationAreaType` で駅周辺誘導
  - `supportedTransports` で移動手段適合を判定
- レンタサイクル時は `access.requiresFirstStop` + `requiredFirstStopReason=rental_cycle_pickup` を使って起点立寄りルールを記述可能
- 営業判定は `business.weeklyHours` と `business.operationalJudgement` を使用
  - `regularClosedDays`: 定休日判定（曜日）
  - `seasonalClosures`: 季節休業判定（日付レンジ/月レンジ）
  - `lastAdmission`: 最終受付判定（時刻/閉館何分前）
  - `needsManualReview`: 自動判定だけで不十分なスポットの確認フラグ
  - `researchMeta`: 調査CSVの信頼度/メモ/出典/生データ保存

## 実装モジュール

- `spotTypes.ts`: Spot型定義
- `spotSchema.ts`: Zodスキーマ
- `spotModel.ts`: `validateSpotInput`, `normalizeSpotData`, `buildSearchText`
- `spotRepository.ts`: Firestore保存/取得/検索（`saveSpot`, `listSpotsWithFilters`）
- `spotService.ts`: create/update/get/list/search ユースケース
- `spotFunctions.ts`: Callable Functions 公開

## Seed

- サンプルJSON: `src/seeds/spots.seed.json`
- スクリプト: `src/scripts/seedSpots.ts`

実行例:

```bash
cd apps/iwami_proof_of_concept/functions
npm run seed:spots
```

任意で入力ファイルを変更:

```bash
SPOTS_JSON_PATH=src/seeds/spots.seed.json npm run seed:spots
```

Excelから直接投入:

```bash
SPOTS_XLSX_PATH=/absolute/path/iwami_spots_50.xlsx npm run import:spots:xlsx
```

検証のみ実行（保存しない）:

```bash
SPOTS_IMPORT_DRY_RUN=1 SPOTS_XLSX_PATH=/absolute/path/iwami_spots_50.xlsx npm run import:spots:xlsx
```

## テスト

- 必須不足で validation エラー
- `primaryCategory` 不正で validation エラー
- `supportedTransports` 不正で validation エラー
- `rental_cycle` 対応スポットで `requiresFirstStop` 条件保持
- `buildSearchText` の連結
- 正常spotの Firestore 保存
