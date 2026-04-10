"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "../../_components/material-icon";

type FieldKind = "single" | "multi" | "select";

const PROJECT_FORM_STRUCTURE: Array<{
  section: string;
  fields: Array<{ label: string; kind: FieldKind }>;
}> = [
  {
    section: "1. プロジェクトの核",
    fields: [
      { label: "プロジェクト名", kind: "single" },
      { label: "一言サマリー", kind: "single" },
      { label: "起点となる場所", kind: "single" },
      { label: "プロジェクト種別", kind: "multi" },
    ],
  },
  {
    section: "2. 解きたい課題",
    fields: [
      { label: "背景", kind: "single" },
      { label: "解きたい課題", kind: "multi" },
      { label: "起こしたい変化", kind: "multi" },
      { label: "この案件で特に重視したいこと", kind: "multi" },
    ],
  },
  {
    section: "3. 対象ユーザーと利用シーン",
    fields: [
      { label: "主なターゲット", kind: "multi" },
      { label: "ターゲットの前提知識", kind: "select" },
      { label: "想定利用シーン", kind: "multi" },
      { label: "移動手段の想定", kind: "multi" },
      { label: "帰着条件や締切条件", kind: "single" },
    ],
  },
  {
    section: "4. 体験方針と制約",
    fields: [
      { label: "必ず含めたい観点", kind: "multi" },
      { label: "避けたいこと / 禁止表現", kind: "multi" },
      { label: "重要な制約", kind: "multi" },
    ],
  },
  {
    section: "5. 検証・運用の前提",
    fields: [
      { label: "このプロジェクトで見たいこと", kind: "multi" },
      { label: "KPI", kind: "multi" },
      { label: "関係者 / ステークホルダー", kind: "multi" },
    ],
  },
];

const MEMO_PLACEHOLDER =
  "例: 九州大学の新入生向けにキャンパスを周回するオリエンテーションを兼ねたプロジェクトを起業部とのコラボの形で実施予定です";
const EXTERNAL_AI_PROMPT_TEMPLATE = `# Role
あなたは、体験設計・地域回遊・空間活用・新規事業企画に強いプランナーです。
特に、単なるイベント企画ではなく、後続の体験設計・シリーズ設計・運用設計に接続できる上流設計の整理を得意としています。

# TOMOSHIBI Context
TOMOSHIBIは、地域資源や空間資源を、回遊と滞在を生む継続型の体験へ変えるためのサービスです。

この相談における重要前提は以下です。
- TOMOSHIBIは、単発イベントの企画書を作るためだけのものではありません。
- 重要なのは、AIが自由に物語を創作することではなく、人が体験骨格を設計し、AIが参加者条件に応じて成立する体験へ変換することです。
- この新規プロジェクト作成フォームで定義する内容は、後続のシリーズ設計・エピソード設計・体験生成でも参照される上流文脈になります。
- そのため、出力は一回限りの運営台本や単発施策の詳細に寄りすぎず、対象ユーザー、利用シーン、起こしたい変化、制約、検証観点などを、後続設計に再利用しやすい粒度で整理してください。
- この段階では、具体的な固定ルートや完成台本を作り込みすぎず、プロジェクト全体の骨格が明確になることを優先してください。
- 「何を解きたいか」「誰向けか」「どんな体験として成立させたいか」「どんな制約があるか」が分かるように整理してください。
- もし相談内容が、観光・地域回遊ではなく、キャンパス・施設・イベント・拠点空間などを対象にしていても、TOMOSHIBI文脈では「空間資源を回遊と滞在を生む体験へ変える設計」として解釈してください。

# User Raw Idea (そのままの相談内容)
{{USER_RAW_IDEA}}

# Mission
上記の相談内容を、TOMOSHIBIにおける新規プロジェクト作成フォームを埋められる形で整理してください。
単発企画としてではなく、後続のシリーズ設計・エピソード設計・体験生成に接続しやすい上流文脈として整理してください。

# Important Rules
- 日本語で回答する
- 推測が必要な項目は断定せず、妥当な案 + 要確認事項を併記する
- フォームに転記しやすい具体的な文量で出力する
- 抽象論だけで終わらせず、フォームにそのまま入れやすい表現にする
- 複数選択項目は箇条書きで出力する
- 相談内容が短い場合でも、TOMOSHIBI文脈に照らして妥当な初期案を補完してよい
- ただし、補完した内容は断定せず、必要に応じて要確認事項に回す
- 出力は「運営の段取り」よりも「体験設計の骨格」を優先する
- 完成ルート、詳細台本、細かすぎる演出案までは作り込まない
- 後続のシリーズ設計・エピソード設計で流用しやすいよう、汎用性のある粒度で整理する
- もし相談内容から判断して、プロジェクト種別・利用シーン・制約・検証観点に複数の妥当な解釈がある場合は、もっとも自然な案を本文に記載し、他の有力候補は要確認事項または補足提案で示す

# Field Interpretation Guidance
以下の観点を意識して、各項目を整理してください。

- プロジェクト名:
  単なるイベント名ではなく、何の体験設計案件なのかが伝わる名前にする
- 一言サマリー:
  誰に対して、どの空間で、どんな回遊・滞在・体験価値を生みたいのかが分かるようにする
- 起点となる場所:
  Google Mapsで場所として理解しやすいように、住所ベースまたは施設名 + 住所ベースで、できるだけ地図上で特定しやすい形で出力する
  例: 「九州大学 伊都キャンパス センターゾーン 〒819-0395 福岡県福岡市西区元岡744」
  曖昧な場合は、妥当な候補を1つ本文に記載し、要確認事項で確認ポイントを示す
- プロジェクト種別:
  以下の選択肢の中から妥当なものを複数選ぶ
  - 実証
  - 学内回遊
  - 観光PoC
  - 常設導線
  - 新歓向け
  - 再訪促進
- 背景:
  なぜこの取り組みが必要なのかを、対象ユーザーと空間の文脈で簡潔に整理する
- 解きたい課題:
  情報不足、行動導線不足、滞在の浅さ、空間理解不足、接点不足など、体験設計上の課題として表現する
- 起こしたい変化:
  回遊、滞在、理解促進、消費、再訪、接点創出などの観点で表現する
- この案件で特に重視したいこと:
  以下の選択肢の中から妥当なものを複数選ぶ
  - 回遊
  - 滞在
  - 理解促進
  - 消費
  - 再訪
  - 接点創出
- 主なターゲット:
  ユーザー属性だけでなく、利用時の状態も意識する
- ターゲットの前提知識:
  以下の3択から最も妥当なものを1つ選ぶ
  - ほぼ知らない
  - 少し知っている
  - ある程度知っている
- 想定利用シーン:
  いつ・どのような状況でその体験が使われるかを表現する
- 移動手段の想定:
  以下の選択肢の中から妥当なものを複数選ぶ
  - 徒歩
  - 自転車
  - 車
  - 公共交通
- 帰着条件や締切条件:
  開始からどれくらいの時間制約がありそうか、どこに戻る必要がありそうか、イベントや運営上の締切があるかを簡潔に整理する
- 必ず含めたい観点:
  その空間ならではの価値や、体験として伝えたい視点を入れる
- 避けたいこと / 禁止表現:
  過度なゲーム化、説明過多、誤認を招く演出、宣伝感の強さなどを必要に応じて整理する
- 重要な制約:
  時間、移動、運営体制、施設利用条件、天候、参加者理解度などを意識する
- このプロジェクトで見たいこと:
  体験が成立するか、回遊が起きるか、初回参加でも使えるか、理解や接点が増えるか、などの観点で整理する
- KPI:
  「KPI方向性」ではなく、測定できる具体的なKPIを3つ提示する
  各KPIは「変数名 / 指標の定義 / 初期目標値または目標水準」の形で出力する
  相談内容だけでは数値断定が難しい場合は、妥当な初期仮説値として示し、要確認事項で調整余地を示す
- 関係者 / ステークホルダー:
  運営、協力先、参加者、空間管理者などの観点から整理する

# Output Format
以下の見出しと項目を、同じ順序・同じ項目名で必ず出力してください。

## 1. プロジェクトの核
- プロジェクト名: 1〜2文で簡潔に
- 一言サマリー: 1〜2文で簡潔に
- 起点となる場所: Google Mapsで理解しやすい場所表現で1〜2文
- プロジェクト種別: 以下の選択肢から該当するものを箇条書き
  - 実証
  - 学内回遊
  - 観光PoC
  - 常設導線
  - 新歓向け
  - 再訪促進

## 2. 解きたい課題
- 背景: 1〜2文で簡潔に
- 解きたい課題: 箇条書き（2〜5件目安）
- 起こしたい変化: 箇条書き（2〜5件目安）
- この案件で特に重視したいこと: 以下の選択肢から該当するものを箇条書き
  - 回遊
  - 滞在
  - 理解促進
  - 消費
  - 再訪
  - 接点創出

## 3. 対象ユーザーと利用シーン
- 主なターゲット: 箇条書き（2〜5件目安）
- ターゲットの前提知識: 以下の3択から1つ
  - ほぼ知らない
  - 少し知っている
  - ある程度知っている
- 想定利用シーン: 箇条書き（2〜5件目安）
- 移動手段の想定: 以下の選択肢から該当するものを箇条書き
  - 徒歩
  - 自転車
  - 車
  - 公共交通
- 帰着条件や締切条件: 1〜2文で簡潔に

## 4. 体験方針と制約
- 必ず含めたい観点: 箇条書き（2〜5件目安）
- 避けたいこと / 禁止表現: 箇条書き（2〜5件目安）
- 重要な制約: 箇条書き（2〜5件目安）

## 5. 検証・運用の前提
- このプロジェクトで見たいこと: 箇条書き（2〜5件目安）
- KPI: 3件、以下の形式で出力
  - 変数名:
  - 指標の定義:
  - 初期目標値または目標水準:
- 関係者 / ステークホルダー: 箇条書き（2〜5件目安）

## 要確認事項
- 情報不足で判断できない項目を3〜7件、優先度が高い順に列挙

## 補足提案（任意）
- 成果を高める追加提案を最大3件

# Final Instruction
最終回答は、上記テンプレートを埋めた完成形のみを返してください。
見出しや項目名は変更しないでください。
前置き・言い訳・補足説明は入れず、フォーム転記可能な完成出力だけを返してください。`;

export function ExternalAiPromptDrawer() {
  const [open, setOpen] = useState(false);
  const [ideaMemo, setIdeaMemo] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const totalFieldCount = useMemo(() => {
    return PROJECT_FORM_STRUCTURE.reduce((sum, section) => sum + section.fields.length, 0);
  }, []);

  const generatedPrompt = useMemo(() => {
    const normalizedMemo = ideaMemo.trim();
    const userIdea = normalizedMemo;
    return EXTERNAL_AI_PROMPT_TEMPLATE.replace("{{USER_RAW_IDEA}}", userIdea);
  }, [ideaMemo]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="contents">
      <button
        className="flex items-center justify-center gap-1 rounded-lg border border-terracotta/20 bg-terracotta/10 px-4 py-2 text-xs font-bold text-terracotta transition-all hover:bg-terracotta/20"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MaterialIcon className="text-sm" name="auto_awesome" />
        外部AI向けプロンプトを作成
      </button>

      <div
        className={`fixed inset-0 z-[70] flex justify-end transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          aria-label="ドロワーを閉じる"
          className={`h-full flex-1 bg-charcoal/20 backdrop-blur-sm transition-opacity duration-500 ease-out ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          type="button"
        />

        <aside
          className={`relative flex h-full w-[620px] max-w-[calc(100vw-12px)] transform-gpu flex-col overflow-hidden bg-[#fcf9f2] shadow-2xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            open ? "translate-x-0 opacity-100" : "translate-x-[105%] opacity-95"
          }`}
        >
          <div className="relative flex items-start justify-between border-b border-charcoal/10 px-8 py-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold text-charcoal">外部AI相談用プロンプト</h2>
              <p className="text-sm text-charcoal/60">
                構想メモを1つ入力すると、新規プロジェクト作成項目を埋める相談文を自動生成します
              </p>
            </div>
            <button
              className="rounded-full p-2 transition-colors hover:bg-charcoal/5"
              onClick={() => setOpen(false)}
              type="button"
            >
              <MaterialIcon className="text-charcoal/60" name="close" />
            </button>
          </div>

          <div className="relative flex-1 space-y-8 overflow-y-auto px-8 py-8">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-terracotta/10 px-2 py-0.5 text-xs font-bold text-terracotta">INPUT</span>
                <h3 className="font-headline text-lg font-bold text-charcoal">構想メモ（ここだけ入力）</h3>
              </div>
              <textarea
                className="h-40 w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm leading-relaxed text-charcoal/90 placeholder:text-charcoal/35 focus:border-terracotta focus:outline-none"
                onChange={(event) => setIdeaMemo(event.target.value)}
                placeholder={MEMO_PLACEHOLDER}
                value={ideaMemo}
              />
              <p className="rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-xs text-charcoal/65">
                口頭ベースのラフな内容で問題ありません。未整理のまま書いた内容を、外部AIがフォーム項目に分解できる前提でプロンプト化します。
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-terracotta/10 px-2 py-0.5 text-xs font-bold text-terracotta">OUTPUT</span>
                  <h3 className="font-headline text-lg font-bold text-charcoal">生成されたプロンプト</h3>
                </div>
                <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs font-semibold text-charcoal/70">
                  対象項目 {totalFieldCount}件
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PROJECT_FORM_STRUCTURE.map((section) => (
                  <div className="rounded-lg border border-charcoal/10 bg-white px-3 py-2" key={section.section}>
                    <p className="text-[11px] font-semibold text-charcoal/55">{section.section}</p>
                    <p className="text-xs font-bold text-charcoal">{section.fields.length}項目</p>
                  </div>
                ))}
              </div>

              <p className="rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-[11px] text-charcoal/65">
                この相談文は、入力メモに応じて自動更新されます。ChatGPT / Gemini に貼り付けると、フォーム項目ごとの回答を得られる設計です。
              </p>

              <div className="relative rounded-2xl border border-[#dbc1b9] bg-[#1c1c18] p-6 text-[#fcf9f2]">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/20"
                    onClick={handleCopy}
                    type="button"
                  >
                    <MaterialIcon className="text-[16px]" name="content_copy" />
                    {copied ? "コピー済み" : "相談文をコピー"}
                  </button>
                </div>

                <pre className="max-h-[340px] overflow-auto pr-28 text-xs leading-relaxed opacity-90">
                  <code>{generatedPrompt}</code>
                </pre>
              </div>
            </section>
          </div>

          <div className="relative flex items-center justify-between border-t border-charcoal/10 bg-charcoal/5 px-8 py-6">
            <button
              className="rounded-full px-6 py-2.5 font-bold text-charcoal/70 transition-colors hover:bg-charcoal/10"
              onClick={() => setOpen(false)}
              type="button"
            >
              閉じる
            </button>

            <button
              className="flex items-center gap-2 rounded-full bg-gradient-to-br from-terracotta to-[#b25d3f] px-8 py-2.5 font-extrabold text-white shadow-lg shadow-terracotta/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleCopy}
              type="button"
            >
              <MaterialIcon className="text-[20px]" name="content_copy" /> ChatGPTに貼る相談文をコピー
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
