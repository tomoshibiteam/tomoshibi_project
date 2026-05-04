import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, FontSize, Font } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useOuting, OutingProposal } from '@/contexts/OutingContext';
import { useCompanion, CompanionPersonality } from '@/contexts/CompanionContext';
import { DepartureOverlay } from '@/components/DepartureOverlay';

type MessageRole = 'ai' | 'user';

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

// ── モックAI応答 ─────────────────────────────────────────────
const MOCK_RESPONSES: { keywords: string[]; reply: string; outing?: OutingProposal }[] = [
  {
    keywords: ['つかれ', '疲れ', 'しんど', 'きつい', 'ストレス'],
    reply: 'お疲れさまです。ずっと頑張ってたんだね。\n少し体と頭を休めたい気分？それとも気分転換したい感じ？',
    outing: { episodeTitle: '疲れた日の小さな逃げ道', destination: '近くの公園か川沿い', reason: '頭の熱を外に逃がすための外出', stepGoal: '+1,000歩', duration: '10〜15分' },
  },
  {
    keywords: ['ひま', '暇', 'することない', '退屈', 'つまらない'],
    reply: '休日にぽっかり時間が空いた感じかな。\nどこか出かけたい気持ちはある？近所でも全然いいよ。',
    outing: { episodeTitle: '何もない日の小さな発見', destination: '近所の知らない道や路地', reason: '日常の再発見をする外出', stepGoal: '+1,500歩', duration: '20〜30分' },
  },
  {
    keywords: ['でたい', '出たい', 'そとに', '外に', 'さんぽ', '散歩'],
    reply: 'いいね！どんな気分で出かけたい？\nのんびり歩きたいのか、何か目的地があるのか教えてくれると提案しやすいな。',
    outing: { episodeTitle: '今日の外出、どこにしよう', destination: 'あなたの気分に合わせた場所', reason: '今の気持ちに合う外出先を探そう', stepGoal: '+2,000歩', duration: '30分前後' },
  },
  {
    keywords: ['しごと', '仕事', '勉強', '作業', '行き詰まり', 'つまった'],
    reply: 'うーん、頭がいっぱいになってきた感じだね。\n一回外に出て、頭の中をリセットしてみない？答えは帰ってきてから考えよう。',
    outing: { episodeTitle: '画面の外に出る15分', destination: '近くの公園・コンビニ・川沿い', reason: '仕事モードから生活モードへ切り替える外出', stepGoal: '+1,000歩', duration: '10〜15分' },
  },
  {
    keywords: ['きぶん', '気分', 'もやもや', 'どんより', '重い'],
    reply: 'なんとなく気分が重い日、あるよね。\n無理に解決しなくていいから、少しだけ外の空気を吸ってみるのはどう？',
    outing: { episodeTitle: '気分を少しだけ変える外出', destination: '静かな道や近所の緑のある場所', reason: '気分転換のための小さな外出', stepGoal: '+1,000歩', duration: '10〜20分' },
  },
];

const DEFAULT_REPLIES: Record<CompanionPersonality, string[]> = {
  gentle: [
    'そうなんですね。ゆっくり聞かせてください。\n最近、外に出る機会はどれくらいありましたか？',
    'うん、聞いてますよ。\n気分転換に少し外に出てみたい気持ちはありますか？',
    'そっか…。\n今日の気分、1〜5で表すとどのくらいですか？',
    '話してくれてありがとう。\nいつでもここにいるので、気が向いたら何でも話してくださいね。',
  ],
  cheerful: [
    'あー、わかるわかる！そういう日あるよね。\n最近どのくらい外出てる？',
    'うんうん、聞いてるよ！\nちょっと外行ってみる気分ある？',
    'そっかそっか！\n今日の気分、点数つけるとしたら何点？',
    'ありがとう教えてくれて！\nいつでも話しかけてね、一緒に考えよ！',
  ],
  cool: [
    'なるほど。\n最近、外には出てるか？',
    'ふむ。\n外に出てみる気はあるか？',
    'そうか。\n今日の調子は、どうだ？',
    'わかった。\nいつでも話しかけてくれ。',
  ],
  warm: [
    'そうかそうか、まあゆっくり話してみよ。\n最近、外には出られてる？',
    'うんうん、聞いてるよ。\n気分転換に少しだけ外出てみるのはどうかな。',
    'そっかー。\n今日の気分、なんとなく1〜5でいうとどのくらい？',
    '話してくれてよかった。\nここにいるから、いつでも気軽に話しかけてね。',
  ],
};

// 時間帯インデックス: 0=朝, 1=昼, 2=夕, 3=夜
function getTimeIndex(): 0 | 1 | 2 | 3 {
  const h = new Date().getHours();
  return h >= 5 && h < 11 ? 0 : h >= 11 && h < 17 ? 1 : h >= 17 && h < 21 ? 2 : 3;
}

// 記録ありの場合に挟み込むフォローアップメッセージ（時間帯別）
const RECORD_FOLLOWUP: string[] = [
  'この前も歩いてたね！今日の調子はどう？', // 朝
  'この前も歩いてたね！今日の調子はどう？', // 昼
  'この前も歩いてたね！調子はどう？',        // 夕
  'この前も歩いてたね！今日もお疲れさま。',  // 夜
];

function getTimeGreeting(personality: CompanionPersonality, hasRecords: boolean): string {
  const idx = getTimeIndex();
  const greetings: Record<CompanionPersonality, string[]> = {
    gentle: [
      'おはようございます。☀️\n\n今朝の調子はいかがですか？\n気になることがあれば話してみてください。',
      'こんにちは。\n\n今日はどんな一日を過ごしていますか？\n気になることや今の気分を話してみてください。',
      'お疲れさまです。\n\n今日一日、どんな感じでしたか？\nゆっくり話しましょう。',
      '夜遅くまでお疲れさまです。\n\n無理しなくていいですよ。\n今の気分を話してみてください。',
    ],
    cheerful: [
      'おはよう！！☀️\n\n今日の朝ごはん食べた？\n今日どんな日にしたいか教えてよ！',
      'こんにちは！\n\n今日はどんな感じ？\nなんか面白いことあった？',
      'おつかれ〜！\n\n今日一日どうだった？\nいろいろ話して！',
      'こんな時間まで起きてるじゃん！\n\n大丈夫？\n話せることあったら聞くよ！',
    ],
    cool: [
      'おはよう。\n\n今日の調子は。\n話があれば聞く。',
      'よう。\n\n今日はどうだ。\n気になることがあれば言ってくれ。',
      'お疲れ。\n\n今日はどんな一日だった。\n聞くぞ。',
      'まだ起きてたか。\n\n無理するなよ。\n話したいことがあれば。',
    ],
    warm: [
      'おはよう。☀️\n\n今朝の調子はどうかな。\nゆっくり話してみてよ。',
      'こんにちは。\n\n今日はどんな感じで過ごしてる？\n気になることあれば話そ。',
      'おつかれさま。\n\n今日一日どうだった？\nゆっくり聞くよ。',
      'こんな時間まで起きてたんだね。\n\n無理しなくていいよ。\n話したいことあれば。',
    ],
  };

  const base = greetings[personality][idx];
  if (hasRecords && Math.random() < 0.5) {
    // 約50%の確率で「この前も歩いてたね」を追記
    return base + '\n\n' + RECORD_FOLLOWUP[idx];
  }
  return base;
}

function makeInitialMessages(personality: CompanionPersonality, hasRecords: boolean): Message[] {
  return [{ id: '0', role: 'ai', text: getTimeGreeting(personality, hasRecords), timestamp: new Date() }];
}

function getMockResponse(input: string, personality: CompanionPersonality): { reply: string; outing?: OutingProposal } {
  const lower = input.toLowerCase();
  for (const entry of MOCK_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return { reply: entry.reply, outing: entry.outing };
  }
  const replies = DEFAULT_REPLIES[personality];
  return { reply: replies[Math.floor(Math.random() * replies.length)] };
}

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// ── フレームアバター ─────────────────────────────────────────
function FlameAvatar({ size = 40, isActive = false }: { size?: number; isActive?: boolean }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: isActive ? 1.18 : 1.1, duration: isActive ? 600 : 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: isActive ? 600 : 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isActive]);

  const br = size / 2;
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: br,
        backgroundColor: colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.amberPrimary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isActive ? 0.8 : 0.4,
        shadowRadius: isActive ? 14 : 8,
        elevation: isActive ? 12 : 6,
        transform: [{ scale: pulse }],
      }}
    >
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size * 0.28,
          backgroundColor: colors.amberPrimary + (isActive ? 'FF' : 'CC'),
          shadowColor: colors.amberPrimary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 6,
        }}
      />
    </Animated.View>
  );
}

// ── タイピングインジケーター ──────────────────────────────────
function TypingIndicator() {
  const { colors } = useTheme();
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    dots.forEach((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      ).start()
    );
  }, []);

  return (
    <View style={styles.aiBubbleRow}>
      <FlameAvatar size={30} isActive />
      <View style={[styles.bubble, styles.aiBubble, styles.typingBubble, { backgroundColor: colors.aiBubble, borderColor: colors.border, borderLeftColor: colors.amberPrimary + '80' }]}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { backgroundColor: colors.amberPrimary + 'AA', transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

// ── チャットバブル ───────────────────────────────────────────
function ChatBubble({ message, showTime }: { message: Message; showTime: boolean }) {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  if (message.role === 'ai') {
    return (
      <Animated.View style={[styles.aiBubbleRow, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <FlameAvatar size={30} />
        <View style={{ flex: 1 }}>
          <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.aiBubble, borderColor: colors.border, borderLeftColor: colors.amberPrimary + '80' }]}>
            <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>{message.text}</Text>
          </View>
          {showTime && (
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>{formatTime(message.timestamp)}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.userBubbleRow, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.bubble, styles.userBubble, { backgroundColor: colors.userBubble, borderColor: colors.amberPrimary + '45' }]}>
          <Text style={[styles.bubbleText, { color: colors.textPrimary }]}>{message.text}</Text>
        </View>
        {showTime && (
          <Text style={[styles.timestamp, styles.timestampRight, { color: colors.textMuted }]}>{formatTime(message.timestamp)}</Text>
        )}
      </View>
    </Animated.View>
  );
}

// ── 外出提案カード ───────────────────────────────────────────
function OutingCard({ proposal, onAccept, onDismiss }: { proposal: OutingProposal; onAccept: () => void; onDismiss: () => void }) {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.proposalCard, { opacity: fade, transform: [{ translateY: slide }], backgroundColor: colors.bgElevated, borderColor: colors.amberPrimary + '60' }]}>
      {/* バッジ */}
      <View style={[styles.proposalBadgeRow, { backgroundColor: colors.amberPrimary + '15', borderBottomColor: colors.amberPrimary + '25' }]}>
        <Ionicons name="sparkles" size={11} color={colors.amberSoft} />
        <Text style={[styles.proposalBadge, { color: colors.amberSoft }]}>外出の提案</Text>
      </View>

      <View style={styles.proposalBody}>
        {/* タイトル + reason */}
        <Text style={[styles.proposalTitle, { color: colors.textPrimary }]}>「{proposal.episodeTitle}」</Text>
        <Text style={[styles.proposalReason, { color: colors.textSecondary }]}>{proposal.reason}</Text>

        {/* メタ情報 */}
        <View style={[styles.proposalMetaBox, { backgroundColor: colors.bgBase, borderColor: colors.border }]}>
          <View style={styles.proposalMetaItem}>
            <Ionicons name="location-outline" size={13} color={colors.amberSoft} />
            <Text style={[styles.proposalMetaText, { color: colors.textSecondary }]}>{proposal.destination}</Text>
          </View>
          <View style={[styles.proposalMetaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.proposalMetaItem}>
            <Ionicons name="time-outline" size={13} color={colors.amberSoft} />
            <Text style={[styles.proposalMetaText, { color: colors.textSecondary }]}>{proposal.duration}</Text>
          </View>
          <View style={[styles.proposalMetaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.proposalMetaItem}>
            <Ionicons name="footsteps-outline" size={13} color={colors.amberSoft} />
            <Text style={[styles.proposalMetaText, { color: colors.textSecondary }]}>{proposal.stepGoal}</Text>
          </View>
        </View>
      </View>

      {/* ボタン: 主アクションを大きく、副アクションをテキストリンクに */}
      <View style={[styles.proposalActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: colors.amberPrimary, shadowColor: colors.amberPrimary }]}
          onPress={onAccept}
          activeOpacity={0.85}
        >
          <Ionicons name="walk-outline" size={18} color={colors.bgBase} />
          <Text style={[styles.acceptBtnText, { color: colors.bgBase }]}>出かける！</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
          <Text style={[styles.dismissBtnText, { color: colors.textMuted }]}>また今度</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── 音声ウェーブ ─────────────────────────────────────────────
function VoiceWave({ colors, large = false }: { colors: ReturnType<typeof useTheme>['colors']; large?: boolean }) {
  const count = large ? 9 : 5;
  const bars = Array.from({ length: count }, () => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    const loops = bars.map((bar, i) => {
      const toVal = large ? [0.3, 0.9, 0.5, 1, 0.7, 1, 0.5, 0.9, 0.3][i] : [0.5, 1, 0.7, 1, 0.6][i];
      const delay = (i * (large ? 60 : 100)) % 300;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bar, { toValue: toVal, duration: large ? 350 : 400, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.2, duration: large ? 350 : 400, useNativeDriver: true }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [large]);

  const barHeight = large ? 36 : 22;
  const barWidth = large ? 4 : 3;
  const gap = large ? 5 : 4;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap, paddingHorizontal: 4 }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{ width: barWidth, height: barHeight, borderRadius: barWidth / 2, backgroundColor: colors.amberPrimary, transform: [{ scaleY: bar }] }}
        />
      ))}
    </View>
  );
}

// ── メイン画面 ───────────────────────────────────────────────
export default function HomeScreen() {
  const { colors } = useTheme();
  const { startOuting, records } = useOuting();
  const { profile } = useCompanion();
  const personality = profile?.personality ?? 'gentle';
  const displayName = profile?.nickname?.trim() || 'TOMOSHIBI';
  const hasRecords = records.length > 0;
  const [messages, setMessages] = useState<Message[]>(() => makeInitialMessages(personality, hasRecords));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<OutingProposal | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showDeparture, setShowDeparture] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const voicePulse = useRef(new Animated.Value(1)).current;
  const voiceLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const recordingFade = useRef(new Animated.Value(0)).current;

  const startRecording = useCallback(() => {
    setIsRecording(true);
    voiceLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(voicePulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(voicePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    voiceLoopRef.current.start();
    Animated.timing(recordingFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    // TODO: バックエンド連携後ここで音声認識を開始する
  }, [voicePulse, recordingFade]);

  const stopRecording = useCallback(() => {
    Animated.timing(recordingFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      voiceLoopRef.current?.stop();
      voicePulse.setValue(1);
      setIsRecording(false);
    });
    // TODO: バックエンド連携後ここで認識テキストを setInput に渡す
  }, [voicePulse, recordingFade]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setHasInteracted(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setPendingProposal(null);
    scrollToBottom();

    setTimeout(() => {
      const { reply, outing } = getMockResponse(trimmed, personality);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: reply, timestamp: new Date() };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
      if (outing) setPendingProposal(outing);
      scrollToBottom();
    }, 1000 + Math.random() * 800);
  }, [input, isTyping, personality, scrollToBottom]);

  const handleAccept = useCallback(() => {
    // 演出を開始する（実際の遷移は handleDepartureEnd で行う）
    setShowDeparture(true);
  }, []);

  const handleDepartureEnd = useCallback(() => {
    setShowDeparture(false);
    if (pendingProposal) startOuting(pendingProposal);
    setPendingProposal(null);
    router.navigate('/(tabs)/outing');
  }, [pendingProposal, startOuting, router]);

  const dismissTexts: Record<CompanionPersonality, string> = {
    gentle: 'そっか、気が向いたらまた言ってくださいね。\nいつでも一緒に考えますよ。',
    cheerful: 'そっかー！また気が向いたら言ってね！\nいつでも一緒に考えるよ！',
    cool: 'そうか。気が向いたらまた言ってくれ。',
    warm: 'そっかそっか。また気が向いたら話してね。\nいつでも一緒に考えよう。',
  };

  const handleDismiss = useCallback(() => {
    setPendingProposal(null);
    const msg: Message = { id: Date.now().toString(), role: 'ai', text: dismissTexts[personality], timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  }, [personality, scrollToBottom]);

  const typingSubtitles: Record<CompanionPersonality, string> = {
    gentle: '考えています...',
    cheerful: 'ちょっと待ってね！',
    cool: '...',
    warm: 'ちょっと待って...',
  };

  const showVoiceHint = !hasInteracted && messages.length <= 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* 出発の儀式オーバーレイ */}
      <DepartureOverlay visible={showDeparture} onAnimationEnd={handleDepartureEnd} />

      {/* ヘッダー */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bgBase }]}>
        <View style={styles.headerLeft}>
          <FlameAvatar size={40} isActive={isTyping} />
          <View>
            <Text style={[styles.headerName, { color: colors.amberPrimary }]}>{displayName}</Text>
            <Text style={[styles.headerSub, { color: isTyping ? colors.amberSoft : colors.textMuted }]}>
              {isTyping ? typingSubtitles[personality] : 'あなたの外出サポートAI'}
            </Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.headerProfileBtn} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* チャット + 入力 */}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatBubble message={item} showTime={index === messages.length - 1} />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {isTyping && <TypingIndicator />}
              {pendingProposal && !isTyping && (
                <OutingCard proposal={pendingProposal} onAccept={handleAccept} onDismiss={handleDismiss} />
              )}
              <View style={{ height: Spacing.md }} />
            </>
          }
        />

        {/* 音声ヒント（初回のみ） */}
        {showVoiceHint && (
          <View style={[styles.voiceHint, { backgroundColor: colors.bgElevated, borderColor: colors.amberPrimary + '40' }]}>
            <Ionicons name="mic-outline" size={14} color={colors.amberPrimary} />
            <Text style={[styles.voiceHintText, { color: colors.textSecondary }]}>
              テキスト入力でも、右のマイクボタンで話しかけてもOKだよ
            </Text>
          </View>
        )}

        {/* 入力バー */}
        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.bgBase }]}>
          {isRecording ? (
            // ── 録音中UI ──────────────────────────────────────
            <Animated.View style={[styles.recordingBar, { opacity: recordingFade, backgroundColor: colors.bgElevated, borderColor: colors.amberPrimary + '80' }]}>
              <View style={styles.recordingTop}>
                <Animated.View style={{ transform: [{ scale: voicePulse }] }}>
                  <Ionicons name="mic" size={22} color={colors.amberPrimary} />
                </Animated.View>
                <VoiceWave colors={colors} large />
              </View>
              <Text style={[styles.recordingLabel, { color: colors.textMuted }]}>
                話しかけてください。タップで停止します。
              </Text>
              <TouchableOpacity
                style={[styles.stopBtn, { backgroundColor: colors.amberPrimary, shadowColor: colors.amberPrimary }]}
                onPress={stopRecording}
                activeOpacity={0.85}
              >
                <Ionicons name="stop" size={14} color={colors.bgBase} />
                <Text style={[styles.stopBtnText, { color: colors.bgBase }]}>停止する</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // ── テキスト入力UI ────────────────────────────────
            <>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.bgElevated, borderColor: colors.border, color: colors.textPrimary }]}
                value={input}
                onChangeText={setInput}
                placeholder="今日はどんな感じ？"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={300}
              />
              {input.trim() ? (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.amberPrimary }]}
                  onPress={sendMessage}
                  disabled={isTyping}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-up" size={20} color={colors.bgBase} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.micBtn, { backgroundColor: colors.bgElevated, borderColor: colors.amberPrimary, shadowColor: colors.amberPrimary }]}
                  onPress={startRecording}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mic" size={22} color={colors.amberPrimary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // ── ヘッダー
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerName: { fontSize: FontSize.base, fontFamily: Font.heading, letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.xs, fontFamily: Font.body, marginTop: 2 },
  headerProfileBtn: { padding: 4 },

  // ── メッセージリスト
  messageList: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // ── バブル共通
  aiBubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md, gap: Spacing.sm },
  userBubbleRow: { alignItems: 'flex-end', marginBottom: Spacing.md },
  bubble: { maxWidth: '78%', borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2 },
  aiBubble: {
    borderWidth: 1,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userBubble: {
    borderWidth: 1,
    borderBottomRightRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleText: { fontSize: FontSize.base, fontFamily: Font.body, lineHeight: 24 },
  timestamp: { fontSize: 11, fontFamily: Font.body, marginTop: 4, marginLeft: Spacing.xs },
  timestampRight: { marginLeft: 0, marginRight: Spacing.xs },

  // ── タイピング
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: Spacing.sm + 6 },
  typingDot: { width: 7, height: 7, borderRadius: 4 },

  // ── 外出提案カード
  proposalCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  proposalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  proposalBadge: { fontSize: FontSize.xs, fontFamily: Font.bodySemiBold, letterSpacing: 0.6 },
  proposalBody: { padding: Spacing.md, gap: Spacing.sm },
  proposalTitle: { fontSize: FontSize.xl, fontFamily: Font.heading, lineHeight: 30 },
  proposalReason: { fontSize: FontSize.base, fontFamily: Font.body, lineHeight: 23 },
  proposalMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  proposalMetaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  proposalMetaDivider: { width: 1, height: 14 },
  proposalMetaText: { fontSize: FontSize.xs, fontFamily: Font.body },
  proposalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.md,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptBtnText: { fontFamily: Font.bodySemiBold, fontSize: FontSize.base },
  dismissBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  dismissBtnText: { fontSize: FontSize.sm, fontFamily: Font.body },

  // ── 音声ヒント
  voiceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  voiceHintText: { flex: 1, fontSize: FontSize.xs, fontFamily: Font.body, lineHeight: 18 },

  // ── 入力バー
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },

  // テキスト入力行
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.base,
    lineHeight: 22,
    marginBottom: 0,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    alignSelf: 'center',
    marginLeft: 'auto',
  },

  // 録音中バー
  recordingBar: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  recordingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  recordingLabel: { fontSize: FontSize.xs, fontFamily: Font.body },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    marginTop: Spacing.xs,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopBtnText: { fontFamily: Font.bodySemiBold, fontSize: FontSize.sm },
});
