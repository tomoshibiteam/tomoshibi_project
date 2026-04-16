/**
 * DEVモード用モックデータ
 * 舞台：九州大学 伊都キャンパス
 * タイトル：「伊都の灯火 〜消えた論文の謎〜」
 *
 * このファイルは __DEV__ フラグで保護されている箇所からのみ参照する。
 * 本番ビルドに含まれても動作に影響はないが、questId === "DEV_MOCK" でのみ使用される。
 */

import type { GameplayQuest } from "@/services/gameplay";

export const DEV_QUEST_ID = "DEV_MOCK";

const KYUSHU_UNIV_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1080&q=80",
] as const;

/**
 * 伊都キャンパスを舞台にしたミステリー物語のモックデータ。
 *
 * スポット構成：
 *  1. 中央図書館       — narration + dialogue（導入）
 *  2. ビッグオレンジ   — dialogue + choice（選択肢分岐）
 *  3. ウエスト1号館    — narration + puzzle（謎解き）
 *  4. イーストゾーン   — dialogue + epilogue（エピローグ）
 */
export const devQuestData: GameplayQuest = {
  id: DEV_QUEST_ID,
  title: "伊都の灯火 〜消えた論文の謎〜",
  areaName: "九州大学 伊都キャンパス",
  coverImageUrl: KYUSHU_UNIV_BACKGROUNDS[0],
  prologue:
    "2036年。九州大学 伊都キャンパスに、ある噂が流れている。\n量子情報理論の権威・霧島 教授の博士論文データが、キャンパスのサーバーから忽然と消えた。\nその論文には、現代の暗号技術を根底から覆す発見が含まれているという。\nあなたは教授の助手・鈴原 透（すずはら とおる）の依頼を受け、真相を追うことになった。",
  epilogue:
    "論文データは、イーストゾーンの旧実験棟に隠されていた。\n霧島教授は意図的に論文を「隠した」のだ——世界が、その発見を受け入れる準備ができるまで。\n鈴原の瞳に、静かな光が灯る。\n「教授は信じていたんだ。いつか、誰かが正しく使ってくれる日が来ると」\n伊都の灯火は、今日も静かに揺れている。",
  characters: [
    {
      id: "suzuhara",
      name: "鈴原 透",
      role: "教授の助手・依頼人",
      avatarUrl: null,
    },
    {
      id: "kirishima",
      name: "霧島 教授",
      role: "謎めいた量子情報研究者",
      avatarUrl: null,
    },
  ],
  spots: [
    // ─── SPOT 1: 中央図書館 ─────────────────────────────────────────────
    // 形式: narration（地の文） + dialogue（キャラクター対話）
    {
      id: "dev-spot-library",
      orderIndex: 1,
      name: "中央図書館",
      description:
        "伊都キャンパスの心臓部。蔵書80万冊を誇るこの建物で、霧島教授は毎晩遅くまで研究を続けていた。",
      lat: 33.5951,
      lng: 130.2157,
      backgroundImage: KYUSHU_UNIV_BACKGROUNDS[0],
      puzzleQuestion: null,
      puzzleAnswer: null,
      puzzleHints: [],
      puzzleSuccessMessage: null,
      preMessages: [
        {
          id: "dev-lib-pre-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "中央図書館の自動ドアが開く。冷えた空気と、古い紙の匂いが混ざり合う。",
        },
        {
          id: "dev-lib-pre-2",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "カウンターの奥に、見覚えのある背中がある。鈴原 透だ。",
        },
        {
          id: "dev-lib-pre-3",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "来てくれてよかった。実は……教授の論文データが、3日前から消えているんです。",
        },
        {
          id: "dev-lib-pre-4",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "バックアップも、クラウドも、全部。まるで最初から存在しなかったみたいに。",
        },
        {
          id: "dev-lib-pre-5",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "図書館の窓から、キャンパスを見渡す。どこかに、手がかりがあるはずだ。",
        },
      ],
      postMessages: [
        {
          id: "dev-lib-post-1",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "教授が最後に姿を見せたのは、ビッグオレンジ——中央食堂です。何か手がかりがあるかもしれない。",
        },
        {
          id: "dev-lib-post-2",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "図書館を後にし、賑やかな声が聞こえる方へ向かう。",
        },
      ],
    },

    // ─── SPOT 2: ビッグオレンジ（中央食堂） ─────────────────────────────
    // 形式: dialogue + choice（選択肢分岐）
    {
      id: "dev-spot-bigorange",
      orderIndex: 2,
      name: "ビッグオレンジ（中央食堂）",
      description:
        "学生・教職員が集まるキャンパスの憩いの場。霧島教授は論文提出前日、ここで誰かと長時間話していたという。",
      lat: 33.596,
      lng: 130.216,
      backgroundImage: KYUSHU_UNIV_BACKGROUNDS[1],
      puzzleQuestion: null,
      puzzleAnswer: null,
      puzzleHints: [],
      puzzleSuccessMessage: null,
      preMessages: [
        {
          id: "dev-orange-pre-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "ランチタイムを過ぎた食堂は、静かに片付けられつつある。",
        },
        {
          id: "dev-orange-pre-2",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "教授はここで、誰かと話していた。食堂スタッフが見ていたらしいんですが……",
        },
        {
          id: "dev-orange-pre-3",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "相手は若い研究者だったと。学外の人間か、それとも内部の誰かか。どう思いますか？",
        },
        // choice形式：選択肢はpuzzleQuestion + puzzleAnswerで表現
        // ここでは会話のフォローアップメッセージで選択の雰囲気を演出
        {
          id: "dev-orange-pre-4",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "——あなたは直感的に、内部の人間だと感じた。",
        },
        {
          id: "dev-orange-pre-5",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "そうか……だとしたら、研究室に鍵を持つ人間が怪しい。ウエスト1号館を調べましょう。",
        },
      ],
      postMessages: [
        {
          id: "dev-orange-post-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "食堂の隅のテーブルに、小さなメモが落ちていた。「W1-302 夜10時」。",
        },
        {
          id: "dev-orange-post-2",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "ウエスト1号館、302号室……教授の研究室です。行ってみましょう。",
        },
      ],
    },

    // ─── SPOT 3: ウエスト1号館 ──────────────────────────────────────────
    // 形式: narration + puzzle（謎解き）
    {
      id: "dev-spot-west1",
      orderIndex: 3,
      name: "ウエスト1号館",
      description:
        "理系研究棟。霧島教授の研究室はここ302号室にある。扉には暗証番号ロックがかかっていた。",
      lat: 33.5947,
      lng: 130.2147,
      backgroundImage: KYUSHU_UNIV_BACKGROUNDS[2],
      puzzleQuestion:
        "扉に暗証番号の謎が貼られていた。\n「私の研究は『光』から始まる。その英語を小文字で」\nA. light\nB. hope\nC. data",
      puzzleAnswer: "light",
      puzzleHints: [
        "霧島教授の研究テーマは『量子光学』",
        "英語5文字、lから始まる",
        "日本語にすると『ひかり』",
      ],
      puzzleSuccessMessage:
        "正解。扉が開いた。研究室の中に、消えたはずのデータの痕跡があった——イーストゾーンの旧実験棟を指す手書きのメモと共に。",
      preMessages: [
        {
          id: "dev-west-pre-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "ウエスト1号館の廊下は薄暗い。302号室の前に立つと、扉に紙が貼られていた。",
        },
        {
          id: "dev-west-pre-2",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "教授らしい文字で、謎めいたメッセージが書かれている。",
        },
        {
          id: "dev-west-pre-3",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "これは……教授が意図的に残したんだ。答えられる人だけを、中に通すために。",
        },
      ],
      postMessages: [
        {
          id: "dev-west-post-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "研究室の机の上に、古びたUSBメモリ。そして一枚のメモ：「East Zone. Old Lab. Under the lamp.」",
        },
        {
          id: "dev-west-post-2",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "イーストゾーンの旧実験棟……最後の手がかりはそこにあります。急ぎましょう。",
        },
        {
          id: "dev-west-post-3",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "夕暮れのキャンパスを横切る。伊都の空が、橙色に染まり始めた。",
        },
      ],
    },

    // ─── SPOT 4: イーストゾーン ─────────────────────────────────────────
    // 形式: dialogue + epilogue（エピローグナレーション）
    {
      id: "dev-spot-east",
      orderIndex: 4,
      name: "イーストゾーン（旧実験棟）",
      description:
        "現在は使われていない旧実験棟。薄暗い廊下の突き当たりに、あの論文データが眠っているという。",
      lat: 33.5965,
      lng: 130.218,
      backgroundImage: KYUSHU_UNIV_BACKGROUNDS[3],
      puzzleQuestion: null,
      puzzleAnswer: null,
      puzzleHints: [],
      puzzleSuccessMessage: null,
      preMessages: [
        {
          id: "dev-east-pre-1",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "旧実験棟。錆びた扉を押すと、ほこりの匂いが漂ってくる。",
        },
        {
          id: "dev-east-pre-2",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "ここ、もう10年以上使われていないはずなのに……足跡がある。",
        },
        {
          id: "dev-east-pre-3",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "突き当たりの棚の下。古いランプの影に、防水ケースが隠されていた。",
        },
        {
          id: "dev-east-pre-4",
          speakerType: "character",
          name: "霧島 教授",
          avatarUrl: null,
          text: "——見つけてくれたか。予想より早かったな。",
        },
        {
          id: "dev-east-pre-5",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "振り返ると、白髪の老人が静かに立っていた。霧島 教授だ。",
        },
      ],
      postMessages: [
        {
          id: "dev-east-post-1",
          speakerType: "character",
          name: "霧島 教授",
          avatarUrl: null,
          text: "あの論文は、消したわけじゃない。世界が準備できるまで、ここに置いておきたかっただけだ。",
        },
        {
          id: "dev-east-post-2",
          speakerType: "narrator",
          name: null,
          avatarUrl: null,
          text: "教授の言葉が、静かに胸に染みる。伊都の空に、一番星が瞬き始めた。",
        },
        {
          id: "dev-east-post-3",
          speakerType: "character",
          name: "鈴原 透",
          avatarUrl: null,
          text: "教授……ありがとうございます。この灯火、絶やしません。",
        },
      ],
    },
  ],
};
