"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "../../../../_components/material-icon";

type SeriesExternalAiPromptDrawerProps = {
  projectContextBlock: string;
};

const SERIES_EXTERNAL_AI_PROMPT_TEMPLATE = `Role

あなたは、体験設計・地域回遊・空間活用・シリーズ設計に強いプランナーです。
特に、単発企画ではなく、後続のエピソード設計や当日生成に接続できる「シリーズの固定条件」を整理することを得意としています。

TOMOSHIBI Context

TOMOSHIBIは、地域資源や空間資源を、回遊と滞在を生む継続型の体験へ変えるためのサービスです。

この相談における重要前提は以下です。

TOMOSHIBIにおけるシリーズは、単なるテーマ名ではなく、複数のエピソードを束ねる共通世界観・参加者の立場・表現ルール・継続性を定義する枠です。
エピソードは1話完結ですが、シリーズ内でゆるい継続性を持ちます。
シリーズでは、特定スポットや当日ルートを固定しません。
シリーズ世界観は、対象エリア全体で成立する上位設定にしてください。特定スポットに行かなかった場合に崩れる設定は避けてください。
実在する団体・文化・空間の特徴を参照してよいですが、そのままの名称や設定を使いすぎず、半歩ずらしたオリジナル設定に翻訳してください。
出力は、雰囲気だけのコンセプト文ではなく、後続のエピソード生成に使える固定条件として整理してください。
シリーズは「何を扱うか」だけでなく、「参加者は何者か」「案内役は何者か」「なぜ毎回巡るのか」「各話で何を持ち帰るのか」「どの表現を許可するか」まで定義する必要があります。
歴史、自然、食、産業、暮らし、建築などは、シリーズの中で扱う主題範囲であり、シリーズそのものではない場合があります。根本目的や参加動機が大きく異ならない限り、それらは同一シリーズ内の主題候補として扱ってください。

Parent Project Inheritance Rule

以下の親プロジェクト情報は、すでに上位UI/システム側で定義済みの固定前提です。
あなたはこれを完全に引き継ぐこと。
要約・補完・再定義・言い換え・目的の再解釈・KPIの読み替えをしてはいけません。
シリーズ設計は、必ずこの親プロジェクト前提に従って行ってください。
出力では、親プロジェクトの条件を変更せず、その上でシリーズ世界観と固定条件のみを設計してください。

Project Context

以下は、親プロジェクトで定義済みの前提です。シリーズ設計ではこれを引き継いでください。

{{PROJECT_CONTEXT_BLOCK}}

Parent Project Handling Rules
親プロジェクトの対象、目的、対象者、対象エリア、KPIは変更しないこと
親プロジェクトの目的を、シリーズ側で別目的にすり替えないこと
親プロジェクトで定義された実証・運用前提を維持したまま、物語世界観を上乗せすること
シリーズは親プロジェクトを置き換えるものではなく、親プロジェクトを実現するための体験レイヤーとして設計すること
物語性を強める際も、親プロジェクトの実証目的やUI上の前提を壊さないこと

Series Purpose Axis (Required)

以下は、シリーズで参加者に提供したい目的軸です。必ず反映してください。
同一プロジェクト・同一エリア内でも、この目的軸によってシリーズは分岐します。
例：観光体験 / SDGs教育 / 海洋プラスチック課題への行動変容 / 社会貢献活動

{{SERIES_PURPOSE_AXIS}}

Core Design Requirement

この相談で最重要なのは、単なる案内や情報提示ではなく、物語だからこそ成立する参加動機・回遊理由・視点変化を持ったシリーズを設計することです。

以下を厳守してください。

単に「参加者に役割を与えて、各スポットで説明を受ける」だけの構造にしない
単に「地図を埋める」「施設を知る」「案内される」だけの構造にしない
単に「ガイドに世界観ラベルを貼っただけ」のシリーズにしない
物語である以上、参加者は世界観の中で何らかの目的・立場・未完了の問い・探索理由を持って動く必要がある
各スポットや各主題は、単なる解説対象ではなく、物語上の判断材料・痕跡・手がかり・見方の変化・関係性の更新として機能する必要がある
参加者は、ただ説明を受ける人ではなく、世界の中で自分なりに意味を読み取り、進める側である必要がある
物語は重すぎる長編設定でなくてよいが、「この設定だからこそ場所を見るのが楽しくなる」「この世界観だからこそ同じ場所が違って見える」状態を作ること
シリーズ世界観は、対象空間や場所の理解の妨げではなく、理解を面白くし、参加者の視点を変え、能動性を生む装置である必要がある
求めているのはAIガイドではなく、物語世界の中で空間を読む体験設計である

Anti-Guide Rule

以下のような出力になった場合は失敗です。

案内役がいて、参加者がスポットへ行き、スポット説明を聞くのが中心になっている
参加者の目的が「知ること」「慣れること」だけで、物語上の駆動力がない
世界観が薄く、別の地域・施設・空間にもそのまま差し替えできる
各話の達成が「施設理解」だけで終わっている
物語の中での参加者の変化・蓄積・判断が弱い
空間が舞台装置に留まり、その場所ならではの見え方の変化が設計されていない

出力前に必ず、以下を内部で自己点検してください。

この案は、世界観を外したら普通のAIガイドと大差ないか
参加者は、ただ説明を受ける人になっていないか
各主題や各場所が、物語上の意味や進行に関わっているか
「物語だからこそ楽しい」が成立しているか
対象エリア固有の空間性や文化性が、世界観の根に入っているか

この5点のうち1つでも弱い場合は、より物語駆動に再設計してください。

Desired Narrative Quality

今回ほしいのは、以下のような設計です。

参加者が世界観の中で、ある立場を持って対象空間を読む
対象空間の各場所や機能が、単なる施設・地点情報ではなく、世界を理解するための異なる断片として見える
同じ「拠点」「窓口」「広場」「建物」「自然空間」でも、物語の文脈に入ることで見え方が変わる
参加者は毎話ごとに何かを受け取るだけでなく、少しずつ世界との関係性や読み解き方を獲得する
情報理解・場所理解・物語体験が分離せず、一体化している
楽しさは、単なる説明のわかりやすさではなく、世界観の中で自分が動く意味があることから生まれる

Mission

上記のTOMOSHIBI前提と親プロジェクト前提を踏まえ、
対象エリア全体に通用するシリーズ世界観と、後続のエピソード生成に必要な共通ルールを設計してください。

対象エリア・対象空間・対象組織について公開情報ベースで必ずリサーチし、
その場所ならではの特徴、文化、空間性、利用動機、見え方の面白さを踏まえた上で、
シリーズ新規作成フォームにそのまま転記できる形で整理してください。

Research Rules
対象エリアや対象空間について公開情報をもとに必ずリサーチしてください
リサーチする際は、特定スポット1箇所の情報ではなく、対象エリア全体・空間全体の特徴を優先してください
実在団体や実在文脈を参考にしてよいですが、シリーズ世界観は特定団体に依存しない上位設定へ翻訳してください
特定スポットを訪れなかった場合に破綻する世界観は避けてください
リサーチを実施したうえで情報が不足する場合は、与えられたプロジェクト情報から妥当な案を構築し、要確認事項に不確定点を明記してください
空間の物理機能だけでなく、そこで人が何を始め、何に迷い、どう関係を持ち始める空間なのかを読み取ってください
施設機能の整理だけで終わらず、その空間に通底する「らしさ」や「見方の切り口」を世界観に翻訳してください

Additional Design Requirement

シリーズを設計する際、必ず以下を定義に含めてください。

参加者は、このシリーズの中で何を進めている存在なのか
案内役は、単なる説明役ではなく、どういう理由で参加者に伴走する存在なのか
なぜ毎話ごとに別の主題や場所を見る必要があるのか
1話完結で何が達成されるのか
シリーズ全体で何が蓄積されるのか
どういう種類の問い・判断・読み取りが、各話で起こるのか
世界観が強すぎて実在空間理解を邪魔しないための制御ルール
「知識の伝達」ではなく「世界の読み解き」が起こるための表現ルール

Important Rules
日本語で回答する
前置きや言い訳は不要
フォームに転記しやすい具体的な文量で出力する
ふわっとしたコンセプトコピーではなく、エピソード生成で使える固定条件を出す
推測が必要な項目は断定しすぎず、妥当な案として記述し、必要なら要確認事項に回す
シリーズ世界観は、対象エリア全体に通用する設定にする
特定スポット名に依存した世界観の中核設定は避ける
参加者の立場、案内役の立場、継続目的、完結単位は具体的に書く
許可する表現モードは最大3つまでに絞る
強いホラー、強い恋愛、過度な史実改変など、公共性の高い空間や地域体験に不向きな方向は慎重に扱う
「主題範囲」は特定スポットではなくテーマの範囲で書く
「事実と演出の境界」は、0〜100の数値だけでなく文章でも補足する
出力は、シリーズ新規作成の入力欄にそのまま入れられる形にする
内部で複数案を比較してもよいが、最終出力は最も妥当な1案に絞って返す
案内型に寄りすぎないこと
物語の世界観が、参加者の動機・視点・回遊理由にまで食い込んでいること
「説明を受ける体験」ではなく、「世界を読み解きながら進む体験」になっていること

Field Interpretation Guidance

以下の観点を意識して整理してください。

シリーズ名:
そのシリーズの立場や世界観が感じられ、後続エピソードを束ねやすい名前にする
一言説明:
どの空間を、どんな読み方・体験の仕方で扱うシリーズかが分かるようにする
シリーズの役割:
親プロジェクトの中で、このシリーズが何を担うのかを書く
シリーズの参加目的:
参加者が、このシリーズに入るときに何を求めているのかを書く
参加者の立場:
このシリーズの中で、参加者がどんな役割・立ち位置・未完了の目的を持って体験するのかを書く
案内役の立場:
名前ではなく、シリーズを通じて同行・補助・接続する存在の役割を書く。単なる説明係にしない
シリーズの継続目的:
なぜ毎回エピソードをまたいで巡るのか、その理由を書く
1話ごとに何を持ち帰るか:
各エピソードで完結したとみなせる達成単位を書く。施設知識だけでは弱い
シリーズ全体のトーン:
発見型、調査型、やわらかい案内型、軽いミステリー型などから妥当なものを整理する
主題範囲:
歴史、自然、食、産業、暮らし、建築など、シリーズ内で扱うテーマ範囲を書く
表現モード:
エピソードごとに採用してよい噛み砕き方を書く。最大3つまで
表現モードごとのルール:
各モードを使うときの基準や注意点を書く
必ず含めたい観点:
どのエピソードでも失いたくない視点や体験価値を書く
避けたい表現 / 禁止ルール:
シリーズ全体として避けるべき方向を書く
事実と演出の境界:
事実をどこまで厳密に守り、どこまで演出してよいかを書く
シリーズで共有する継続性:
記録、章、訪問済み主題、案内役との関係など、エピソード間で引き継ぐものを書く
再訪時に変化させたいこと:
再訪や次話でどう差分を出すかを書く。単なる別スポット化ではなく、見方や読み解きの深まりも含める

Strong Preference for Worldview Quality

以下のような方向を優先してください。

参加者が「場所に慣れるために機能一覧を覚える人」ではなく、対象空間という世界の断片を読み取り、関係を結び、意味を見出していく人
案内役が「ここは○○ですと説明する人」ではなく、その世界の見方を渡し、読み解きの補助線を引く人
体験の面白さが「説明がわかりやすい」ではなく、同じ場所が別の意味を持って見えてくること
1話ごとに「理解した」で終わるのではなく、世界の見え方が一段変わった、次も読みたくなったで終わること

UI Output Rules
出力は、各項目の「入力UIタイプ」に合わせる
[単文] は1文、改行なしで書く
[説明文] は2〜3文以内で書く
[箇条書き] は1項目1行で「- 」から始める
[カテゴリー複数選択] は候補リストの語句をそのまま使う（言い換え禁止）
[バー] は数値と補足説明を必ず両方書く

カテゴリー候補は以下を使用すること:

シリーズ全体のトーン: 落ち着いた発見型 / 小さな謎解き型 / 学術的・アカデミック / 情緒的・詩的 / 活気ある交流型 / 神秘的・ファンタジー
主題範囲カテゴリー: 歴史・文化 / 自然・景観 / 食・グルメ / 建築・街並み / 産業・仕事 / 暮らし・日常
表現モード: 発見型 / 調査型 / 小さな謎解き型 / インタビュー形式 / 独白形式

Output Format

以下の見出しと項目を、同じ順序・同じ項目名で必ず出力してください。

1. 基本情報
シリーズ名 [単文]:
一言説明 [単文]:
シリーズの役割 [説明文]:
シリーズの参加目的 [単文]:
2. シリーズ世界観
参加者の立場 [単文]:
案内役の立場 [単文]:
シリーズの継続目的 [単文]:
1話ごとに何を持ち帰るか [単文]:
シリーズ全体のトーン [カテゴリー複数選択 / 最大3]:
選択:
（候補から選んだ値）
3. エピソード生成ルール
このシリーズで扱う主題範囲 [カテゴリー複数選択 + 任意追加]:
カテゴリー選択:
（候補から選んだ値）
追加主題（任意）[箇条書き]:
（候補外の主題がある場合のみ）
許可する表現モード [カテゴリー複数選択 / 最大3]:
選択:
（候補から選んだ値）
表現モードごとのルール [説明文]:
必ず含めたい観点 [箇条書き]:
（1項目ずつ）
避けたい表現 / 禁止ルール [箇条書き]:
（1項目ずつ）
事実と演出の境界 [バー]:
数値 (0-100):
補足説明 [単文]:
4. 継続性
シリーズで共有する継続性 [説明文]:
再訪時に変化させたいこと [説明文]:
要確認事項 [箇条書き]
情報不足や判断保留が必要な点を、優先度が高い順に3〜7件列挙してください
補足提案（任意）[箇条書き]
シリーズの完成度を上げる追加提案を最大3件

Final Instruction

最終回答は、上記テンプレートを埋めた完成形のみを返してください。
見出しや項目名は変更しないでください。
前置き・補足説明・余計な要約は入れないでください。
また、出力が「役割付き案内」や「世界観を載せただけのAIガイド」に見える場合は失敗とみなし、物語駆動になるまで内部で再設計してください。

Strict Output Enforcement

次の応答は、必ず Output Format を埋めた完成出力のみを1回で返してください。
以下の応答は全面禁止です：
- 「受け取りました」「了解しました」「良いプロンプトです」などの所感
- 「次はどれをしますか」「1つ選んでください」などの選択肢提示
- 不足情報の質問返し
- 出力フォーマット外の解説・注釈・方針説明

情報不足があっても出力を止めず、妥当な仮説で全項目を埋めたうえで要確認事項に明記してください。
回答は必ず「1. 基本情報」から開始し、指定フォーマットを埋めた本文で終了してください。`;

export function SeriesExternalAiPromptDrawer({
  projectContextBlock,
}: SeriesExternalAiPromptDrawerProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seriesPurposeAxis, setSeriesPurposeAxis] = useState("");

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

  const generatedPrompt = useMemo(() => {
    const normalizedProjectContext = projectContextBlock.trim() || "- 親プロジェクト前提情報が未設定";
    const normalizedSeriesPurposeAxis =
      seriesPurposeAxis.trim() || "【未入力】シリーズ目的軸を入力してください。";

    return SERIES_EXTERNAL_AI_PROMPT_TEMPLATE
      .replace("{{PROJECT_CONTEXT_BLOCK}}", normalizedProjectContext)
      .replace("{{SERIES_PURPOSE_AXIS}}", normalizedSeriesPurposeAxis);
  }, [seriesPurposeAxis, projectContextBlock]);

  const isSeriesPurposeAxisFilled = seriesPurposeAxis.trim().length > 0;

  const handleCopy = async () => {
    if (!isSeriesPurposeAxisFilled) {
      setCopied(false);
      return;
    }

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
              <h2 className="font-headline text-2xl font-bold text-charcoal">シリーズ外部AI相談用プロンプト</h2>
              <p className="text-sm text-charcoal/60">
                親プロジェクト前提を自動反映した相談文を生成します
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
                <span className="rounded bg-terracotta/10 px-2 py-0.5 text-xs font-bold text-terracotta">PROJECT CONTEXT</span>
                <h3 className="font-headline text-lg font-bold text-charcoal">親プロジェクト前提（自動反映）</h3>
              </div>
              <pre className="max-h-44 overflow-auto rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-xs leading-relaxed text-charcoal/80">
                <code>{projectContextBlock}</code>
              </pre>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">REQUIRED</span>
                <h3 className="font-headline text-lg font-bold text-charcoal">シリーズ目的軸（必須）</h3>
              </div>
              <textarea
                className="h-28 w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm leading-relaxed text-charcoal/90 placeholder:text-charcoal/35 focus:border-terracotta focus:outline-none"
                onChange={(event) => setSeriesPurposeAxis(event.target.value)}
                placeholder="例：このシリーズはSDGs教育を目的に、海洋プラスチック課題への理解と行動変容を促す体験として設計する"
                required
                value={seriesPurposeAxis}
              />
              <p
                className={`rounded-lg border px-3 py-2 text-xs ${
                  isSeriesPurposeAxisFilled
                    ? "border-charcoal/10 bg-white text-charcoal/65"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {isSeriesPurposeAxisFilled
                  ? "入力内容はプロンプトの Series Purpose Axis (Required) にそのまま反映されます。"
                  : "シリーズ目的軸は必須です。入力しないとコピーできません。"}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-terracotta/10 px-2 py-0.5 text-xs font-bold text-terracotta">OUTPUT</span>
                  <h3 className="font-headline text-lg font-bold text-charcoal">生成されたプロンプト</h3>
                </div>
              </div>

              <div className="relative rounded-2xl border border-[#dbc1b9] bg-[#1c1c18] p-6 text-[#fcf9f2]">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isSeriesPurposeAxisFilled
                        ? "bg-white/10 hover:bg-white/20"
                        : "cursor-not-allowed bg-white/5 text-white/40"
                    }`}
                    disabled={!isSeriesPurposeAxisFilled}
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
              className={`flex items-center gap-2 rounded-full px-8 py-2.5 font-extrabold text-white transition-all ${
                isSeriesPurposeAxisFilled
                  ? "bg-gradient-to-br from-terracotta to-[#b25d3f] shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-[0.98]"
                  : "cursor-not-allowed bg-charcoal/30"
              }`}
              disabled={!isSeriesPurposeAxisFilled}
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
