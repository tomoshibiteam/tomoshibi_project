# TOMOSHIBI AIバックエンド・Master MVPフロント統合 要件定義 / 実装計画

作成日: 2026-04-29  
対象バックエンド: `/Users/wataru/tomoshibi/apps/tomoshibi-master-mvp/functions`  
移行元バックエンド: `/Users/wataru/tomoshibi/apps/tomoshibi_ai`  
対象フロントエンド: `/Users/wataru/tomoshibi/apps/tomoshibi-master-mvp`

## 1. 目的

`tomoshibi_ai` で個別実装されていたAIコンパニオン・外出支援バックエンドを `tomoshibi-master-mvp/functions/src/aiCompanion` に複製・統合し、`tomoshibi-master-mvp` 単体でフロントとバックエンドが完結する形へ再設計・実装する。

今回の統合では、バックエンドの基盤設計を崩さない。フロント側を柔軟に修正し、画面・状態管理・APIクライアント・環境変数・開発起動手順をバックエンドの契約に合わせる。

最終状態では、通常操作中にフロント内の固定モックデータが表示されないことを必須条件にする。開発用フォールバックを残す場合も、ユーザー体験の本線には出さず、API未接続・未seed・外部APIキー未設定などの状態として明示する。

## 2. 統合方針

### 2.1 バックエンドを正本にする

`tomoshibi-master-mvp/functions/src/aiCompanion/types/api.ts` の型と `functions/src/aiCompanion/api/*.ts` の挙動をフロントの接続契約とする。移行元の `tomoshibi_ai` は参照用であり、実行時の接続先にはしない。

フロント側の既存機能である `spots` 直接購読、旅行プラン生成リクエスト、壱岐スポット管理UIは、AIコンパニオン体験の本線から外す。必要であれば後続で管理者向け/実証向けに別導線化する。

### 2.2 フロントは「画面プロトタイプ」から「API駆動アプリ」へ移行する

現状の `src/app/page.tsx` は、ホーム、会話、記録、地図、設定を1ファイル内でモック中心に構成している。統合後は次の責務に分割する。

- APIクライアント: `src/lib/tomoshibi-ai-api.ts`
- ドメイン型: `src/lib/tomoshibi-ai-types.ts`
- セッション状態: `src/lib/tomoshibi-session-store.ts` または React Context
- 画面コンポーネント: `src/components/*` または `src/app/_components/*`
- 現在地取得: `src/lib/geolocation.ts`

### 2.3 モック撤去を統合要件に含める

現状のフロントには、UI確認用の固定データが残っている。これらはバックエンド統合の完了前提として撤去する。

撤去対象:

- 固定提案データ: `SUGGESTION_BEACH`
- 固定初期会話: `INITIAL_MESSAGES`
- ランダム返信: `COMPANION_REPLIES`
- 固定アルバム/思い出
- 固定実績
- 固定コンパニオン状態
- 固定スポット名、固定地域名、固定ストーリー本文
- API失敗時に本物の結果に見える代替データを表示する挙動

許容するもの:

- API未接続時のエラー表示
- データ未作成時の空状態表示
- ローディング表示
- 開発用 seed データ
- バックエンド内部の mock provider が返した結果。ただし、これはバックエンドレスポンス由来であることを前提とし、フロントが勝手に作った固定結果とは区別する。

完了条件:

- フロントの通常レンダー経路で固定モック候補が表示されない。
- APIが落ちている場合、モック候補ではなく接続エラーを表示する。
- seedがない場合、固定キャラではなく空状態またはseed手順の案内を表示する。
- 画面上のキャラクター、会話、提案、地図ピン、記録、設定は、バックエンドレスポンスまたはユーザー操作で作られたローカル状態からのみ生成する。

## 3. 現状差分

| 領域 | 統合バックエンド | `tomoshibi-master-mvp` フロント | 統合時の判断 |
| --- | --- | --- | --- |
| API方式 | HTTP POST JSON Cloud Functions | Firebase callable / Firestore直接購読 / 一部HTTP | HTTP POST JSONへ寄せる |
| 体験単位 | GuideSession | モック会話と提案カード | GuideSessionをUI状態の中心にする |
| 地図 | `origin` を入力に周辺候補を検索 | Google Maps表示、現在地中心へ調整済み | 現在地取得後に `createGuideSession` へ渡す |
| スポット | Google Places / mock / place cache / annotations | Firestore `spots` と壱岐スポット管理 | AI本線では `RoutePlan.places[].place` を表示 |
| 会話 | `respondToCompanion` が履歴・行動を記録 | ローカルモック返信 | APIレスポンスを会話タイムラインへ反映 |
| 記録 | `completeJourney` がJourneyMemory作成 | モックアルバム/実績 | 完了APIの結果を記録画面に表示 |
| キャラ | `characters`, `characterAppearances`, `characterParts` | 固定名「ホタル」 | `getAvailableCharacters` / `getUserCompanionState` に置換 |
| カスタマイズ | APIあり | 設定プレースホルダー | 設定画面に実装が必要 |
| 認証 | 現状 `userId` をリクエストで信頼 | Firebase Auth helperあり | MVPは仮userId、公開前にIDトークン検証必須 |
| CORS | `handleJsonRequest` にCORS処理なし | ブラウザから直接呼ぶ想定 | Next API route BFF推奨、またはFunctions側CORS追加 |

### 3.1 現在のフロントモック棚卸し

| 画面/領域 | 現在残っているモック | 置換先 | 完了条件 |
| --- | --- | --- | --- |
| ホーム | 固定キャラ名、固定あいさつ、固定提案カード | `getAvailableCharacters`, `getUserCompanionState`, `createGuideSession`, `suggestGuideRoute` | 初期表示から固定提案を出さず、API取得結果または空状態のみ表示 |
| 会話 | `INITIAL_MESSAGES`, `COMPANION_REPLIES` | `createGuideSession` のmessage、`suggestGuideRoute.companion`, `respondToCompanion` | 送信ごとにAPIを呼び、失敗時はエラー表示 |
| 地図 | 固定中心地、固定候補の流用 | 現在地、`RoutePlan.places[].place` | 取得済みRoutePlanだけをピン表示 |
| 記録 | 固定アルバム、固定実績、固定メモリ | `completeJourney` / `listJourneyMemories` | 完了前は空状態、完了後はAPI結果を表示 |
| 設定 | 固定キャラ状態/固定説明 | `getAvailableCharacters`, `getUserCompanionState`, `getCharacterCustomization`, `updateCharacterCustomization` | キャラ選択とパーツ保存がAPI経由で反映 |
| エラー時 | API失敗時に固定データへ逃がす可能性 | エラー/再試行/seed案内 | 本物に見えるモックを出さない |

## 4. MVP統合スコープ

### 4.1 必須

1. フロントから `tomoshibi-master-mvp/functions` に統合された Functions Emulator / Cloud Functions を呼べる。
2. 初回起動時にキャラクター一覧を取得し、既定キャラを選択できる。
3. 現在地を取得し、外出セッションを作成できる。
4. セッションに対してルート提案を取得し、候補カードとして表示できる。
5. 候補に対して「もっと知る」「保存」「違う候補」「行った」などのアクションを送れる。
6. ユーザーメッセージを送信し、相棒AIの返答を表示できる。
7. 外出完了時に `completeJourney` を呼び、思い出として記録画面に反映できる。
8. 設定画面からキャラ状態・見た目カスタマイズを取得/更新できる。
9. Firestore直接アクセスに依存しない。
10. 通常操作時に固定モックデータを表示しない。
11. API失敗時は固定モックにフォールバックせず、明示的なエラー/再試行/空状態を表示する。

### 4.2 MVPではやらない

- バックエンドの大規模設計変更
- 本番認証の完全実装
- 予約/決済/購入
- 複雑なキャラアバターエディタ
- 壱岐スポット管理機能の本線統合
- 長期記憶の編集/削除UI

## 5. 必要画面

### 5.1 ホーム画面

目的: 相棒状態と外出開始導線を表示する。

表示内容:

- 現在選択中のキャラクター名、説明、関係性レベル
- 直近の相棒メッセージ
- 「現在地で探す」ボタン
- 気分・所要時間・移動手段・興味タグの簡易入力
- セッション作成中/位置情報未許可/通信失敗の状態

使用API:

- `getAvailableCharacters`
- `getUserCompanionState`
- `createGuideSession`
- `suggestGuideRoute`

モック撤去要件:

- 固定の提案カードを初期表示しない。
- キャラ取得前は skeleton または loading を表示する。
- キャラ一覧が空の場合は「キャラクター未登録」状態を表示し、固定名へ戻さない。
- セッション未作成時は「現在地で探す」導線だけを出し、固定スポットを出さない。

### 5.2 地図画面

目的: 現在地と提案ルート/候補地点を確認する。

表示内容:

- Google Maps JavaScript API の地図
- 現在地ピン
- `RoutePlan` の地点ピン
- 選択中ルートの概要、所要時間、距離、タグ
- 地点カード: 名前、住所、評価、営業中推定、相棒の推薦理由

入力/操作:

- ルート選択
- 地点選択
- もっと知る
- 保存
- 行った

使用API:

- `suggestGuideRoute`
- `respondToCompanion`
- `saveUserFeedback`

モック撤去要件:

- 地図ピンは `currentLocation` と `RoutePlan.places` からだけ作る。
- `RoutePlan` がない状態では候補ピンを表示しない。
- Google Places API未設定でバックエンドが mock provider を返す場合でも、フロント側で地点を追加生成しない。

### 5.3 会話画面

目的: 相棒AIとの会話と行動フィードバックを行う。

表示内容:

- セッション開始メッセージ
- `companion.openingMessage`
- `companion.routeSummaries`
- `respondToCompanion` の返答
- `nextActions`

入力/操作:

- 自由入力メッセージ
- action button: `tell_more`, `save_place`, `skip_place`, `visited`, `liked`, `not_interested`, `next_suggestion`

使用API:

- `respondToCompanion`
- `saveUserFeedback`

モック撤去要件:

- `INITIAL_MESSAGES` を通常初期状態に使わない。
- セッション開始前は会話開始待ちの空状態を表示する。
- 自由入力の返信は必ず `respondToCompanion` の結果を使う。
- API失敗時に `COMPANION_REPLIES` のランダム文を返さない。

### 5.4 記録画面

目的: 外出完了後の思い出を表示する。

表示内容:

- `completeJourney` の `title`
- `summary`
- `companionMessage`
- `learnedPreferences`
- 訪問地点

使用API:

- `completeJourney`
- `listJourneyMemories`

補足:

記録一覧は `listJourneyMemories` で取得する。完了直後は `completeJourney` 実行後に一覧を再取得し、Firestoreに保存済みのJourneyMemoryを表示する。単一詳細は `getJourneyMemory` で取得する。

モック撤去要件:

- 固定アルバム/固定実績を通常表示しない。
- 完了履歴がない場合は空状態を表示する。
- 記録カードは `listJourneyMemories` のレスポンスから作る。
- `completeJourney` 成功後は `listJourneyMemories` を再取得する。

### 5.5 設定/キャラ画面

目的: キャラ選択、相棒状態、見た目カスタマイズを扱う。

表示内容:

- キャラ一覧
- キャラ説明、プレビュー文
- 関係性状態
- 使用可能パーツ
- 現在の選択パーツ

使用API:

- `getAvailableCharacters`
- `getUserCompanionState`
- `getCharacterCustomization`
- `updateCharacterCustomization`

モック撤去要件:

- 固定の相棒状態や固定パーツを表示しない。
- カスタマイズパーツは `getCharacterCustomization` のレスポンスから表示する。
- 保存後は `updateCharacterCustomization` の結果を画面状態へ反映する。
- API未接続時は編集不可状態と再試行導線を出す。

## 6. API接続仕様

### 6.1 エンドポイント解決

フロントに次の環境変数を追加する。

```env
NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL=http://127.0.0.1:5001/tomoshibi-950e2/asia-northeast1
NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_USER_ID=local-demo-user
NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_CHARACTER_ID=tomoshibi
```

本番では:

```env
NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL=https://asia-northeast1-<project-id>.cloudfunctions.net
```

### 6.2 呼び出し方式

全APIは `POST` + `Content-Type: application/json` で呼ぶ。

例:

```ts
POST {baseUrl}/createGuideSession
{
  "userId": "local-demo-user",
  "characterId": "tomoshibi",
  "mode": "daily_walk",
  "origin": { "lat": 35.681236, "lng": 139.767125 },
  "context": {
    "availableMinutes": 30,
    "mobility": "walk",
    "mood": "少し外に出たい",
    "interests": ["cafe", "quiet"]
  }
}
```

### 6.3 フロント内部の主要型

フロント側ではバックエンド型を直接importせず、まずは最小DTOとして定義する。将来的には `functions/src/aiCompanion/types` を共通パッケージ化する。

必要DTO:

- `CreateGuideSessionInput/Output`
- `SuggestGuideRouteInput/Output`
- `RespondToCompanionInput/Output`
- `CompleteJourneyInput/Output`
- `GetAvailableCharactersOutput`
- `GetUserCompanionStateOutput`
- `GetCharacterCustomizationOutput`
- `UpdateCharacterCustomizationInput/Output`
- `RoutePlan`
- `NormalizedPlace`

## 7. フロント状態設計

### 7.1 セッション状態

```ts
type TomoshibiAppState = {
  userId: string;
  selectedCharacterId: string;
  currentLocation: { lat: number; lng: number } | null;
  activeSessionId: string | null;
  activeRoutes: RoutePlan[];
  selectedRouteId: string | null;
  selectedPlaceId: string | null;
  messages: ChatMessage[];
  journeyResults: CompleteJourneyOutput[];
};
```

### 7.2 メッセージ状態

```ts
type ChatMessage = {
  id: string;
  role: "user" | "companion" | "system";
  text: string;
  createdAt: string;
  routeId?: string;
  placeId?: string;
  actions?: { label: string; action: string; payload?: Record<string, unknown> }[];
};
```

## 8. 実装計画

### Phase 0: 統合前の整理

1. `tomoshibi-master-mvp` に `docs/` を追加し、本書を正本にする。
2. 既存の壱岐スポット/旅行プラン関連コードを「現状維持だがAI本線では未使用」と明示する。
3. `tomoshibi-master-mvp` 内の Functions/Firestore emulator 起動手順を scripts に統合する。

成果物:

- 本書
- 統合タスク一覧

### Phase 1: APIクライアント作成

実装ファイル:

- `src/lib/tomoshibi-ai-types.ts`
- `src/lib/tomoshibi-ai-api.ts`
- `src/lib/geolocation.ts`

実装内容:

1. `NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL` を読む。
2. `postTomoshibiAiJson` 共通関数を作る。
3. 10個のバックエンドAPI関数を薄くラップする。
4. `{ error: { code, message } }` レスポンスをUI用エラーへ正規化する。

受け入れ条件:

- `health` 相当を除き、各APIのURL解決ができる。
- emulator URL / cloud URL を環境変数だけで切り替えられる。

### Phase 2: キャラ状態の接続

対象画面:

- ホーム
- 設定

実装内容:

1. 初期ロードで `getAvailableCharacters` を呼ぶ。
2. 既定キャラ `tomoshibi` を選択する。
3. `getUserCompanionState` を呼ぶ。
4. 固定表示「ホタル」をバックエンドキャラ名へ置換する。
5. 関係性がない場合の初回状態を表示する。
6. キャラ取得失敗時に固定キャラへ戻さず、エラー/再試行UIを表示する。

受け入れ条件:

- seed済みの `トモシビ`, `アカリ`, `シオン` が選択候補として表示される。
- キャラを切り替えてホーム/会話の名前が変わる。
- seed未実行時に固定キャラが表示されない。

### Phase 3: 現在地からセッション作成

対象画面:

- ホーム
- 地図

実装内容:

1. 現在地取得ボタンを追加する。
2. 取得成功時に `createGuideSession` を呼ぶ。
3. `sessionId` を状態に保存する。
4. 直後に `suggestGuideRoute` を呼ぶ。
5. ローディング、位置情報拒否、通信失敗を表示する。
6. セッション未作成時の固定提案カードを撤去する。

受け入れ条件:

- 現在地許可後、セッション作成メッセージが表示される。
- mock provider の状態でも、候補はバックエンドレスポンス由来として表示される。
- API失敗時に固定候補へフォールバックしない。

### Phase 4: ルート提案UI

対象画面:

- 地図
- ホーム提案カード
- 会話

実装内容:

1. `RoutePlan[]` をカード化する。
2. `route.places[].place` を地点カードとして表示する。
3. 地図には現在地と候補地点を表示する。
4. `companion.routeSummaries` をルートカードに紐づける。
5. 事実情報とAIコメントをUI上で分ける。
6. `SUGGESTION_BEACH` などの固定提案データを削除する。
7. 提案詳細オーバーレイも `RoutePlan` 由来のデータだけで構成する。

受け入れ条件:

- ルート名、所要時間、地点名、推薦理由が表示される。
- AIコメントだけで営業時間/存在/価格を断定しない。
- `RoutePlan` が空の場合は固定スポットではなく空状態を表示する。

### Phase 5: 会話・行動フィードバック

対象画面:

- 会話
- 地図地点カード

実装内容:

1. 自由入力から `respondToCompanion({ message })` を呼ぶ。
2. ボタン操作から `respondToCompanion({ action })` を呼ぶ。
3. `nextActions` を次のボタンとして表示する。
4. `liked`, `not_interested`, `save_place`, `visited` は必要に応じて `saveUserFeedback` も使う。ただし `respondToCompanion` 内で一部フィードバック保存済みなので二重保存しない。
5. `INITIAL_MESSAGES` と `COMPANION_REPLIES` を通常経路から削除する。
6. セッション開始前の会話画面には空状態と開始導線を表示する。

受け入れ条件:

- 会話ログがローカルUIに積み上がる。
- `tell_more` で地点詳細文が返る。
- `visited` で完了候補に含められる。
- API失敗時にランダム固定返信を表示しない。

### Phase 6: 外出完了・記録

対象画面:

- 記録
- 会話

実装内容:

1. 訪問済み地点IDをUI状態で保持する。
2. 「今日のおしまい」ボタンで `completeJourney` を呼ぶ。
3. 完了後に `listJourneyMemories` を呼び直す。
4. 返却された `JourneyMemory.title`, `summary`, `companionMessage`, `visitedPlaces`, `learnedPreferences` を記録画面に表示する。
5. 固定アルバム、固定実績、固定コンパニオンメモリを撤去する。
6. 完了履歴がない場合は空状態を表示する。

受け入れ条件:

- 完了後に記録タブへ遷移し、思い出が1件追加される。
- 関係性レベル/セッション数が次回 `getUserCompanionState` に反映される。
- 記録画面に固定の壱岐スポット履歴が表示されない。
- 再読み込み後も `listJourneyMemories` から保存済み記録が復元される。

### Phase 7: キャラカスタマイズ

対象画面:

- 設定

実装内容:

1. `getCharacterCustomization` でパーツ一覧を表示する。
2. カテゴリ別に選択UIを作る。
3. `updateCharacterCustomization` で保存する。
4. プレビュー画像がない場合は色・ラベル中心の簡易プレビューにする。
5. 固定パーツ/固定状態の表示を撤去する。

受け入れ条件:

- free パーツを選択して保存できる。
- 再読み込み後も選択が反映される。
- API未接続時に固定パーツを表示しない。

### Phase 8: モック撤去監査

対象ファイル:

- `src/app/page.tsx`
- `src/components/*`
- `src/app/_components/*`
- `src/lib/*`

実装内容:

1. `SUGGESTION_`, `INITIAL_MESSAGES`, `COMPANION_REPLIES` を削除する。
2. 固定アルバム/固定実績/固定思い出配列を削除する。
3. API失敗時に固定データへ戻る分岐を削除する。
4. 空状態、ローディング、エラー、再試行の表示を全画面に追加する。
5. `rg` で固定データ名、壱岐固定スポット名、mock fallback文言を検査する。

受け入れ条件:

- `rg "SUGGESTION_|INITIAL_MESSAGES|COMPANION_REPLIES" src` が0件。
- APIを停止した状態で、固定候補ではなくエラー/再試行UIが表示される。
- seed未実行状態で、固定キャラではなく空状態が表示される。
- 通常操作のスクリーンショット上に固定モック由来の壱岐スポット履歴が出ない。

### Phase 9: 開発運用統合

実装内容:

1. `apps/tomoshibi-master-mvp/package.json` と `functions/package.json` に統合起動スクリプトを追加する。
2. `tomoshibi-master-mvp` 内の emulator port を既存設定に合わせて固定する。
3. seed と smoke を統合手順に入れる。

推奨スクリプト案:

```json
{
  "dev:tomoshibi-master-functions": "npm --prefix apps/tomoshibi-master-mvp run emulators:start:persistent",
  "seed:tomoshibi-ai": "npm --prefix apps/tomoshibi-master-mvp/functions run seed:tomoshibi-ai:emulator",
  "dev:tomoshibi-master-mvp": "npm --prefix apps/tomoshibi-master-mvp run dev -- --port 8082"
}
```

## 9. バックエンド側に必要な最小追加/確認

バックエンド基盤は変えない。ただし、フロント統合に必要な境界調整として以下を確認する。

### 9.1 CORSまたはBFF

現状 `handleJsonRequest` はCORSヘッダーを返していない。ブラウザからFunctionsを直接呼ぶ場合、CORSで失敗する可能性が高い。

推奨順:

1. Next.js route handler をBFFとして置く。
2. 直接呼びが必要なら `tomoshibi-master-mvp/functions/src/aiCompanion/utils/http.ts` に許可originを環境変数で追加する。

### 9.2 認証

現状は `userId` をリクエストボディで受ける。MVPローカルでは許容するが、本番公開前にFirebase Auth ID token検証を入れる。

必要仕様:

- フロントは匿名ログインまたは明示ログインでUIDを取得する。
- バックエンドは `Authorization: Bearer <idToken>` を検証する。
- bodyの `userId` と token UID が一致することを確認する。

### 9.3 記録一覧API

記録画面は以下で永続化データを読む。

- `listJourneyMemories`
- `getJourneyMemory`

### 9.4 セッション履歴API

途中復帰は以下で行う。

- `getActiveGuideSession`
- `listGuideSessionMessages`

`getActiveGuideSession` は最新のactive sessionと最新ルート提案を返す。`listGuideSessionMessages` は保存済みのユーザー/相棒メッセージを返す。フロントは初期ロード時にこの2つを使い、リロード後も進行中の会話と候補ルートを復元する。

## 10. 受け入れテスト

### 10.1 ローカル統合テスト

前提:

- `tomoshibi-master-mvp` Functions + Firestore Emulator 起動
- `npm --prefix apps/tomoshibi-master-mvp/functions run seed:tomoshibi-ai:emulator` 実行済み
- `tomoshibi-master-mvp` dev server 起動

テスト:

1. ホームに `トモシビ` が表示される。
2. 設定から `アカリ` に切り替えられる。
3. 現在地許可後にセッションが作成される。
4. ルート候補が1件以上表示される。
5. ルート候補の「もっと知る」で相棒返答が表示される。
6. 「保存」「行った」がエラーなく通る。
7. 「今日のおしまい」で記録が追加される。
8. 再度ホームに戻ると関係性状態が更新される。
9. 初期表示、会話、地図、記録、設定の通常操作で固定モックデータが表示されない。
10. ブラウザNetworkで、主要操作時に `/api/tomoshibi-ai/*` が呼ばれている。

### 10.2 失敗系

1. 位置情報拒否時に手動エリア/再試行UIが出る。
2. Functions未起動時に接続エラーが出る。
3. Functions未起動時に固定候補/固定返信へフォールバックしない。
4. `GEMINI_API_KEY` 未設定でもバックエンドの mock LLM レスポンスとして動く。ただしフロントが独自にランダム返信を生成しない。
5. `GOOGLE_PLACES_API_KEY` 未設定でもバックエンドの mock place provider レスポンスとして動く。ただしフロントが独自に固定スポットを生成しない。
6. 不正 `sessionId` でUIがクラッシュしない。

### 10.3 モック撤去テスト

静的検査:

```sh
rg "SUGGESTION_|INITIAL_MESSAGES|COMPANION_REPLIES" src
rg "辰ノ島|一支国博物館|左京鼻|夕暮れの浜辺|ランダム返信" src
```

期待結果:

- どちらも通常アプリコードでは0件。
- テスト用fixtureに残す場合は `__tests__` または `fixtures` に限定し、本番レンダーからimportしない。

手動確認:

1. Functions emulatorを停止する。
2. ブラウザを更新する。
3. ホーム/会話/地図/記録/設定を開く。
4. 固定候補や固定返信ではなく、エラー/空状態/再試行UIが表示されることを確認する。

## 11. リスクと対応

| リスク | 影響 | 対応 |
| --- | --- | --- |
| CORS未対応 | ブラウザからAPIが呼べない | Next BFFを先に実装 |
| 認証未確定 | 本番公開不可 | MVPはlocal userId、本番前にAuth検証 |
| 型の二重管理 | フロント/バックのズレ | 後続で共通types package化 |
| 現在地許可拒否 | セッション開始不可 | 手動地点入力/現在地なしモードを追加 |
| 旧スポット機能との混在 | 画面意図がぶれる | AI本線と管理/実証機能を分離 |
| セッション復帰時の重複表示 | 最新提案と保存済み会話の両方を復元するため同内容が重なる可能性 | message idとsuggestion idで重複除外する |

## 12. 優先順位

P0:

- APIクライアント
- キャラ一覧/状態取得
- 現在地からセッション作成
- ルート提案表示
- 会話アクション
- 固定提案/固定初期会話/ランダム返信の撤去

P1:

- 外出完了/記録
- 設定/カスタマイズ
- 地図上の候補ピン
- エラー/再試行UI
- 固定アルバム/固定実績/固定相棒状態の撤去

P2:

- セッション復帰
- Auth統合
- 共通型パッケージ化
- 壱岐モード導線

## 13. 実装時の注意

- AI文と事実情報をUIで混ぜない。
- 店舗/地点の存在、営業時間、評価、公式URLは `NormalizedPlace` の事実フィールドから表示する。
- AIコメントは「おすすめ理由」「相棒の一言」として表示する。
- `respondToCompanion` と `saveUserFeedback` の二重記録に注意する。
- `placeId` は `NormalizedPlace.providerPlaceId` を使う。
- `routeId` は `RoutePlan.id` を使う。
- `areaId` は壱岐モード時だけ `iki` を渡す。
- 初期MVPは `mode: "daily_walk"` を標準にする。

## 14. 次に実装する具体タスク

1. `src/lib/tomoshibi-ai-types.ts` を作る。
2. `src/lib/tomoshibi-ai-api.ts` を作る。
3. `.env.example` に `NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL` を追加する。
4. ホームの固定 `ホタル` を `getAvailableCharacters` の結果へ置換する。
5. 現在地取得後に `createGuideSession` と `suggestGuideRoute` を呼ぶ。
6. 返却された `RoutePlan` を既存提案カードUIへマッピングする。
7. 会話画面のモック返信を `respondToCompanion` へ置換する。
8. 記録画面に `completeJourney` 結果を表示する。
9. 設定画面にキャラ選択/カスタマイズを追加する。
10. `SUGGESTION_BEACH`, `INITIAL_MESSAGES`, `COMPANION_REPLIES` を削除する。
11. 固定アルバム/固定実績/固定コンパニオン状態を削除する。
12. API失敗時の固定データフォールバックを削除する。
13. 全画面にローディング/空状態/エラー/再試行UIを入れる。
14. モック撤去テストとローカル統合テスト手順をREADMEへ追記する。

## 15. 現時点の進捗

更新日: 2026-04-29

概算進捗: 100%

完了済み:

- `tomoshibi_ai` 由来のAIコンパニオンバックエンドを `tomoshibi-master-mvp/functions/src/aiCompanion` に統合
- Next API route BFF `/api/tomoshibi-ai/*` の追加
- キャラ一覧/状態取得、現在地セッション作成、ルート提案、会話、行動フィードバック、外出完了の接続
- Google Maps 表示と現在地/候補地点表示
- 固定提案、固定初期会話、固定返信、固定アルバム、固定実績の通常表示からの撤去
- 設定画面のキャラ選択/カスタマイズAPI接続
- `listJourneyMemories` / `getJourneyMemory` による記録一覧/詳細API
- `getActiveGuideSession` / `listGuideSessionMessages` による途中復帰API
- セッション開始メッセージの永続化
- ホーム画面の壱岐モード導線。`areaId: "iki"`、興味タグ、所要時間、移動手段、気分入力を `createGuideSession` に反映
- 位置情報拒否/失敗時の手動地点入力。現在地取得に失敗した場合は指定地点でセッション開始
- UI操作別のAPI分岐。保存/訪問/到着/スキップ/ルート選択は `saveUserFeedback`、追加説明/次提案など会話が必要な操作は `respondToCompanion` を使う
- BFFのAuth境界。`TOMOSHIBI_AI_AUTH_MODE=local` ではMVP用body `userId`、`firebase` ではBearer Firebase ID tokenを検証してUIDで `userId` を上書き
- Functions直叩き時のAuth境界。`TOMOSHIBI_AI_AUTH_MODE=firebase` ではFunctions側でもFirebase ID tokenを検証してUIDで `userId` を上書き
- ブラウザスモーク。手動地点からセッション開始、バックエンド提案表示、保存フィードバック表示まで確認
- 本番前チェックリスト `docs/tomoshibi-ai-deploy-checklist-ja.md` の追加
- フロントの `src/lib/tomoshibi-ai-types.ts` をFunctions側API/ドメイン型の再エクスポートへ変更し、API型定義の重複を解消
- READMEへのローカル起動、seed、スモーク、モック撤去検査手順の追記

残り実装:

- なし

運用前確認:

1. 本番Firebaseプロジェクトの実ID tokenで、BFF/FunctionsのUID上書きが通ることを確認する。
2. 本番Google Maps/Places/Geminiキーを設定し、利用制限と課金上限を確認する。
3. deploy後に `docs/tomoshibi-ai-deploy-checklist-ja.md` の本番スモークを実施する。
