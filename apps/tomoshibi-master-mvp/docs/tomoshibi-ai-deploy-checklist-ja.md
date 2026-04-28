# TOMOSHIBI AI 本番前チェックリスト

更新日: 2026-04-29

## 1. ローカル統合スモーク

前提:

- Firestore Emulator: `127.0.0.1:8080`
- Functions Emulator: `127.0.0.1:5001`
- Next dev server: `http://localhost:8082`
- `TOMOSHIBI_AI_AUTH_MODE=local`

確認手順:

1. `npm run seed:tomoshibi-ai:emulator` を実行する。
2. `http://localhost:8082/` を開く。
3. ホームで「地点を指定」を選ぶ。
4. 任意の地点を選び、「現在地で探す」を押す。
5. 会話画面へ遷移し、バックエンド由来の提案カードが表示されることを確認する。
6. 「保存する」を押し、「保存しました。次の提案にも反映します。」が表示されることを確認する。
7. 「もっと知る」を押し、`respondToCompanion` 由来の返信が追加されることを確認する。
8. 記録画面で、`listJourneyMemories` 由来の外出記録が表示されることを確認する。
9. 設定画面で、キャラ選択/カスタマイズがAPIから表示・保存できることを確認する。

## 2. APIスモーク

```bash
curl -sS -X POST http://127.0.0.1:8082/api/tomoshibi-ai/getAvailableCharacters \
  -H 'Content-Type: application/json' \
  -d '{}'

curl -sS -X POST http://127.0.0.1:8082/api/tomoshibi-ai/listJourneyMemories \
  -H 'Content-Type: application/json' \
  -d '{"userId":"local-demo-user","characterId":"tomoshibi","limit":5}'
```

## 3. Auth切替チェック

ローカル/MVP:

- `TOMOSHIBI_AI_AUTH_MODE=local`
- bodyの `userId` を利用する。

本番:

- `TOMOSHIBI_AI_AUTH_MODE=firebase`
- `/api/tomoshibi-ai/*` に `Authorization: Bearer <Firebase ID token>` を付与する。
- BFFがID tokenを検証し、Functionsへ渡すbodyの `userId` を検証済みFirebase UIDで上書きする。
- Functions単体URLへ直接POSTする場合も、同じBearer tokenが必須。Functions側でID tokenを検証し、bodyの `userId` を検証済みUIDで上書きする。
- Firebase Web設定、特に `NEXT_PUBLIC_FIREBASE_API_KEY` が設定されていることを確認する。

## 4. 環境変数

必須:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL`
- `NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_CHARACTER_ID`
- `TOMOSHIBI_AI_AUTH_MODE`

ローカルのみ:

- `NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_USER_ID`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT`
- `NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST`
- `NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT`

## 5. deploy前コマンド

```bash
npx eslint src/app/page.tsx src/lib/tomoshibi-ai-api.ts src/lib/tomoshibi-ai-types.ts 'src/app/api/tomoshibi-ai/[functionName]/route.ts'
npx tsc --noEmit
npm --prefix functions run build
```

## 6. モック撤去確認

```bash
rg "SUGGESTION_|INITIAL_MESSAGES|COMPANION_REPLIES" src
rg "夕暮れの浜辺|ランダム返信" src
```

どちらも通常アプリコードではヒットしない状態を維持する。

## 7. 運用時の注意

- フロントのAPI型は `functions/src/aiCompanion/types/*` を再エクスポートしている。API契約を変える場合はFunctions側型を先に更新する。
- 本番Authの最終確認には、実Firebaseプロジェクトで発行したID tokenが必要。
