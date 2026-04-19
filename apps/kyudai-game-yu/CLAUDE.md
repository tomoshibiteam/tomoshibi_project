# kyudai-dictionary-mvp-mobile 開発ガイド

九州大学 伊都キャンパスを舞台にした**実証実験・卒業研究兼用**のモバイル体験アプリ。
物語を通じてキャンパスへの興味・愛着形成を促す効果を検証する。

---

## 起動方法

```bash
cd apps/kyudai-dictionary-mvp-mobile
npm install          # 初回のみ
npx expo start --web --port 8086
```

ブラウザ: http://localhost:8086

---

## 技術スタック

| 領域 | 技術 |
|------|------|
| フレームワーク | React Native + Expo (SDK 54) |
| 言語 | TypeScript |
| スタイリング | StyleSheet（NativeWind 不使用・単一ファイル構成のため） |
| バックエンド | Firebase（Anonymous Auth + Firestore） |
| 地図 | react-native-maps（現在はモック表示） |

---

## アプリ概要

### 実証実験の前提
- **移動なし** — 参加者はその場にいながら物語を体験する（GPS・移動不要）
- **対象** — 九州大学 伊都キャンパスの新入生・在学生等
- **目的** — 物語体験がキャンパスへの関心・愛着に与える効果の検証

### 画面フロー（9画面）
```
Landing → Setup → Preparing → Ready → Prologue
→ Map → SpotArrival → Epilogue → Feedback
```

### 各画面の役割

| 画面 | 役割 |
|------|------|
| Landing | サービス紹介・実証実験の説明 |
| Setup | ユーザー属性収集（5設問） |
| Preparing | ローディング演出（アニメーション） |
| Ready | 生成された体験の確認 |
| Prologue | 物語の導入（タイピングエフェクト） |
| Map | スポット案内（現在はモック） |
| SpotArrival | 各スポットの物語体験 |
| Epilogue | 物語の締め（タイピングエフェクト） |
| Feedback | アンケート（7設問・Firebase保存） |

---

## ファイル構成

```
kyudai-dictionary-mvp-mobile/
├── App.tsx           # 全画面・全コンポーネントを含む単一ファイル（約6300行）
├── src/
│   └── lib/
│       └── firebase.ts   # Firebase 初期化
├── assets/
│   ├── kyudai-night.jpg      # Landing ヒーロー画像（九大夜景・1080×1080px 推奨）
│   ├── tomoshibi-logo.png    # ヘッダーロゴ（全画面共通）
│   └── characters/
│       └── ar-character.png  # SpotArrival キャラクター
├── app.config.js     # Expo 設定
└── package.json
```

> **注意**: `App.tsx` は単一ファイルで全実装を含む MVP 構成。
> リファクタリング時は画面ごとにコンポーネント分割を検討する。

---

## Setup 設問（収集データ）

| # | 設問 | state変数 | Firebase保存キー |
|---|------|---------|----------------|
| Q1 | あなたの立場 | `selectedUserType` | `setup.userType` |
| Q2 | キャンパスの慣れ具合 | `selectedFamiliarity` | `setup.familiarity` |
| Q3 | 探索スタイル | `selectedExplorationStyle` | `setup.explorationStyle` |
| Q4 | 期待する体験 | `selectedExperienceExpectation` | `setup.experienceExpectation` |
| Q5 | 体験時間 | `selectedDuration` | `setup.duration` |

---

## Feedback 設問（研究データ）

| # | 設問 | state変数 | 研究的意義 |
|---|------|---------|----------|
| Q1 | 全体満足度 ★5 | `feedbackOverallRating` | UX基本指標 |
| Q2 | わかりやすさ 1-5 | `feedbackGuidanceScore` | ユーザビリティ |
| Q3 | キャンパスへの興味 1-5 | `feedbackCampusScore` | 仮説①「物語→関心」 |
| Q4 | スポット訪問意図 1-5 | `feedbackVisitIntentScore` | 仮説②「関心→行動」 |
| Q5 | 期待との一致 1-5 | `feedbackExpectationScore` | Setup Q4と対応・因果分析 |
| Q6 | また使いたいか 3択 | `feedbackReuseIntent` | 継続利用意向 |
| Q7 | 自由意見 | `feedbackComment` | 定性データ |

> **卒論分析軸**: Q3×Q4（興味→行動）、Setup Q4 vs Feedback Q5（期待確認）

---

## Firebase データ構造

```
Firestore: sessions/{sessionId}
├── setup
│   ├── userType
│   ├── familiarity
│   ├── explorationStyle      # 新設
│   ├── experienceExpectation # 新設
│   └── duration
├── feedback
│   ├── overallRating
│   ├── guidanceScore
│   ├── campusScore
│   ├── visitIntentScore      # 新設
│   ├── expectationScore      # 新設
│   ├── reuseIntent
│   └── comment
└── experienceStartedAt
```

---

## スポットカタログ（固定6箇所）

| ID | 名称 |
|----|------|
| `big-orange` | Big Orange（START固定） |
| `center-zone` | Center Zone |
| `central-library` | 中央図書館 |
| `innovation-plaza` | Innovation Plaza |
| `research-commons` | Research Commons |
| `west-gate` | West Gate（GOAL固定） |

---

## デザイン仕様

- **ヒーロー画像サイズ**: 1080×1080px（正方形）
- **ロゴ表示サイズ**: height 26px / width 130px（`brandLogo` スタイル）
- **最大コンテンツ幅**: 520px（`contentWidth` = `Math.min(width - 32, 520)`）
- **ヒーロー高さ**: `contentWidth`（正方形）
- **画像焦点**: `objectPosition: "center bottom"`（石碑が見えるよう下寄せ）

---

## 既知の課題・TODO

### 未実装
- [ ] AI物語生成（現在はハードコードテキスト）
- [ ] リアルタイムGPS・スポット到着自動判定
- [ ] Map 画面のリアル地図（現在はモック）
- [ ] オフライン対応

### いつかやる
- [ ] App.tsx を画面ごとにファイル分割
- [ ] NativeWind への移行
- [ ] 多言語対応（英語）

---

## コミットメッセージ形式

```
feat: 〇〇機能を追加
fix:  〇〇のバグを修正
ui:   〇〇のUIを改善
ux:   〇〇のUXを改善
research: 研究データ収集に関する変更
```

---

## 注意事項

- `App.tsx` を編集する前に必ず Read で該当箇所を確認する
- `.env` は絶対にコミットしない（Firebase API キーを含む）
- `package-lock.json` は `npm install` 後に自動更新される。コミットに含めてよい
- CLAUDE.md 系ファイルはチームリポジトリにはコミットしない（個人設定）
