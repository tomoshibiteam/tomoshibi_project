import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, FontSize, Font } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useOuting, OutingProposal } from '@/contexts/OutingContext';
import { useRouter } from 'expo-router';
import { DepartureOverlay } from '@/components/DepartureOverlay';

const MOCK_SUGGESTIONS: OutingProposal[] = [
  {
    episodeTitle: '夕暮れ前の小さな寄り道',
    destination: '近くの川沿い',
    reason: '静かな場所が好きって言ってたから、夕方の川沿いがきっと合うと思う。',
    stepGoal: '+1,500歩',
    duration: '15〜20分',
  },
  {
    episodeTitle: '知らない道を歩く日',
    destination: '近所の裏道・路地',
    reason: '日常の中に小さな発見がある。いつもと違う道を歩いてみよう。',
    stepGoal: '+2,000歩',
    duration: '20〜30分',
  },
  {
    episodeTitle: '一人のカフェ時間',
    destination: '静かなカフェ',
    reason: '頭を休めたいときは、外でコーヒーを飲むだけでかなり違う。',
    stepGoal: '+1,000歩',
    duration: '30〜60分',
  },
];

// ── 外出中ヒーロー ────────────────────────────────────────────
function ActiveOutingHero({
  proposal,
  startedAt,
  onReturn,
}: {
  proposal: OutingProposal;
  startedAt: Date;
  onReturn: () => void;
}) {
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);

    return () => {
      loop.stop();
      clearInterval(interval);
    };
  }, [startedAt]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}秒`;
    return `${m}分 ${s.toString().padStart(2, '0')}秒`;
  };

  return (
    <Animated.View
      style={[
        styles.activeHero,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.amberPrimary + '60',
          opacity: fadeIn,
        },
      ]}
    >
      {/* ステータス行 */}
      <View style={styles.activeStatusRow}>
        <View style={styles.activeDotWrap}>
          <Animated.View
            style={[
              styles.activeDotRipple,
              { backgroundColor: colors.amberPrimary + '30', transform: [{ scale: pulse }] },
            ]}
          />
          <View style={[styles.activeDot, { backgroundColor: colors.amberPrimary }]} />
        </View>
        <Text style={[styles.activeStatusText, { color: colors.amberPrimary }]}>外出中</Text>
        <View style={{ flex: 1 }} />
        <View style={[styles.elapsedBadge, { backgroundColor: colors.bgBase, borderColor: colors.border }]}>
          <Ionicons name="timer-outline" size={13} color={colors.textMuted} />
          <Text style={[styles.elapsedText, { color: colors.textMuted }]}>{formatElapsed(elapsed)}</Text>
        </View>
      </View>

      {/* タイトル */}
      <Text style={[styles.activeTitle, { color: colors.textPrimary }]}>
        「{proposal.episodeTitle}」
      </Text>

      {/* 行き先・目標 */}
      <View style={[styles.activeInfoBox, { backgroundColor: colors.bgBase, borderColor: colors.border }]}>
        <View style={styles.activeInfoRow}>
          <Ionicons name="location-outline" size={15} color={colors.amberSoft} />
          <Text style={[styles.activeInfoText, { color: colors.textSecondary }]}>{proposal.destination}</Text>
        </View>
        <View style={styles.activeInfoDivider} />
        <View style={styles.activeInfoRow}>
          <Ionicons name="time-outline" size={15} color={colors.amberSoft} />
          <Text style={[styles.activeInfoText, { color: colors.textSecondary }]}>{proposal.duration}</Text>
          <Text style={[styles.activeInfoDot, { color: colors.border }]}>·</Text>
          <Ionicons name="footsteps-outline" size={15} color={colors.amberSoft} />
          <Text style={[styles.activeInfoText, { color: colors.textSecondary }]}>{proposal.stepGoal}</Text>
        </View>
      </View>

      <Text style={[styles.activeCopy, { color: colors.textSecondary }]}>
        気をつけて行ってきてね。{'\n'}帰ったら記録しよう。
      </Text>

      <TouchableOpacity
        style={[styles.returnBtn, { backgroundColor: colors.amberPrimary }]}
        onPress={onReturn}
        activeOpacity={0.85}
      >
        <Ionicons name="home-outline" size={18} color={colors.bgBase} />
        <Text style={[styles.returnBtnText, { color: colors.bgBase }]}>帰ってきた！記録する</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── 歩数ウィジェット ───────────────────────────────────────────
function StepsWidget() {
  const { colors } = useTheme();
  const progress = 0.42;
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={[styles.stepsWidget, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
      <View style={styles.stepsTop}>
        <View>
          <Text style={[styles.stepsLabel, { color: colors.textMuted }]}>今日の歩数</Text>
          <View style={styles.stepsNumbers}>
            <Text style={[styles.stepsCurrent, { color: colors.textPrimary }]}>3,360</Text>
            <Text style={[styles.stepsGoal, { color: colors.textMuted }]}> / 8,000歩</Text>
          </View>
        </View>
        <View style={[styles.stepsPercent, { backgroundColor: colors.amberPrimary + '18' }]}>
          <Text style={[styles.stepsPercentText, { color: colors.amberPrimary }]}>42%</Text>
        </View>
      </View>
      <View style={[styles.stepsTrack, { backgroundColor: colors.bgElevated }]}>
        <Animated.View
          style={[
            styles.stepsFill,
            {
              backgroundColor: colors.amberPrimary,
              width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[styles.stepsRemaining, { color: colors.textMuted }]}>あと +4,640歩でゴール</Text>
    </View>
  );
}

// ── おすすめメインカード ──────────────────────────────────────
function MainSuggestionCard({
  suggestion,
  onStart,
}: {
  suggestion: OutingProposal;
  onStart: (s: OutingProposal) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.mainCard,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.amberPrimary + '60',
          shadowColor: colors.amberPrimary,
        },
      ]}
    >
      <View style={[styles.mainCardBadge, { backgroundColor: colors.amberPrimary + '20' }]}>
        <Ionicons name="sparkles" size={11} color={colors.amberSoft} />
        <Text style={[styles.mainCardBadgeText, { color: colors.amberSoft }]}>今日のおすすめ</Text>
      </View>

      <Text style={[styles.mainCardTitle, { color: colors.textPrimary }]}>
        「{suggestion.episodeTitle}」
      </Text>

      <Text style={[styles.mainCardReason, { color: colors.textSecondary }]}>
        {suggestion.reason}
      </Text>

      <View style={[styles.mainCardMeta, { backgroundColor: colors.bgBase, borderColor: colors.border }]}>
        <View style={styles.mainCardMetaItem}>
          <Ionicons name="location-outline" size={14} color={colors.amberSoft} />
          <Text style={[styles.mainCardMetaText, { color: colors.textSecondary }]}>{suggestion.destination}</Text>
        </View>
        <View style={[styles.mainCardMetaDivider, { backgroundColor: colors.border }]} />
        <View style={styles.mainCardMetaItem}>
          <Ionicons name="time-outline" size={14} color={colors.amberSoft} />
          <Text style={[styles.mainCardMetaText, { color: colors.textSecondary }]}>{suggestion.duration}</Text>
        </View>
        <View style={[styles.mainCardMetaDivider, { backgroundColor: colors.border }]} />
        <View style={styles.mainCardMetaItem}>
          <Ionicons name="footsteps-outline" size={14} color={colors.amberSoft} />
          <Text style={[styles.mainCardMetaText, { color: colors.textSecondary }]}>{suggestion.stepGoal}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.mainStartBtn, { backgroundColor: colors.amberPrimary }]}
        onPress={() => onStart(suggestion)}
        activeOpacity={0.85}
      >
        <Ionicons name="walk-outline" size={20} color={colors.bgBase} />
        <Text style={[styles.mainStartBtnText, { color: colors.bgBase }]}>出かける！</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── サブ提案カード ───────────────────────────────────────────
function SubSuggestionCard({
  suggestion,
  onStart,
}: {
  suggestion: OutingProposal;
  onStart: (s: OutingProposal) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.subCard,
        { backgroundColor: colors.bgSurface, borderColor: colors.border },
      ]}
    >
      <View style={styles.subCardContent}>
        <Text style={[styles.subCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          「{suggestion.episodeTitle}」
        </Text>
        <View style={styles.subCardMeta}>
          <Ionicons name="location-outline" size={12} color={colors.amberSoft} />
          <Text style={[styles.subCardMetaText, { color: colors.textSecondary }]}>{suggestion.destination}</Text>
          <Text style={[styles.subCardDot, { color: colors.border }]}>·</Text>
          <Ionicons name="time-outline" size={12} color={colors.amberSoft} />
          <Text style={[styles.subCardMetaText, { color: colors.textSecondary }]}>{suggestion.duration}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.subStartBtn, { borderColor: colors.amberPrimary + '80' }]}
        onPress={() => onStart(suggestion)}
        activeOpacity={0.8}
      >
        <Text style={[styles.subStartBtnText, { color: colors.amberPrimary }]}>出かける</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── メイン画面 ───────────────────────────────────────────────
export default function OutingScreen() {
  const { colors } = useTheme();
  const { activeOuting, startOuting } = useOuting();
  const router = useRouter();

  const [showDeparture, setShowDeparture] = useState(false);
  const pendingProposalRef = useRef<OutingProposal | null>(null);

  const handleStart = useCallback((suggestion: OutingProposal) => {
    pendingProposalRef.current = suggestion;
    setShowDeparture(true);
  }, []);

  const handleDepartureEnd = useCallback(() => {
    setShowDeparture(false);
    if (pendingProposalRef.current) {
      startOuting(pendingProposalRef.current);
      pendingProposalRef.current = null;
    }
  }, [startOuting]);

  const handleReturn = () => router.navigate('/(tabs)/records');

  const subSuggestions = MOCK_SUGGESTIONS.slice(1);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      {/* 出発の儀式オーバーレイ */}
      <DepartureOverlay visible={showDeparture} onAnimationEnd={handleDepartureEnd} />

      {/* ヘッダー */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {activeOuting ? '外出中だよ' : '今日、出かけよう'}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {activeOuting
              ? '無理せず、楽しんできてね'
              : 'あなたに合った外出プランを提案するよ'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeOuting ? (
          // ── 外出中レイアウト
          <>
            <ActiveOutingHero
              proposal={activeOuting.proposal}
              startedAt={activeOuting.startedAt}
              onReturn={handleReturn}
            />
            <StepsWidget />
          </>
        ) : (
          // ── 通常レイアウト
          <>
            <MainSuggestionCard suggestion={MOCK_SUGGESTIONS[0]} onStart={handleStart} />

            {subSuggestions.length > 0 && (
              <>
                <Text style={[styles.subSectionLabel, { color: colors.textMuted }]}>
                  他にもこんな提案があるよ
                </Text>
                {subSuggestions.map((s) => (
                  <SubSuggestionCard key={s.episodeTitle} suggestion={s} onStart={handleStart} />
                ))}
              </>
            )}

            <StepsWidget />
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FontSize.xxl, fontFamily: Font.heading },
  headerSub: { fontSize: FontSize.sm, fontFamily: Font.body, marginTop: 3 },

  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: Spacing.md },

  // ── 外出中ヒーロー
  activeHero: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
    gap: Spacing.md,
  },
  activeStatusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  activeDotWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  activeDotRipple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  activeStatusText: { fontSize: FontSize.sm, fontFamily: Font.bodySemiBold, letterSpacing: 1.2 },
  elapsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  elapsedText: { fontSize: FontSize.xs, fontFamily: Font.body },
  activeTitle: { fontSize: FontSize.xxl, fontFamily: Font.heading, lineHeight: 36 },
  activeInfoBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  activeInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeInfoDivider: { height: 1, backgroundColor: 'transparent' },
  activeInfoText: { fontSize: FontSize.sm, fontFamily: Font.body },
  activeInfoDot: { fontSize: FontSize.base, marginHorizontal: 2 },
  activeCopy: { fontSize: FontSize.base, fontFamily: Font.body, lineHeight: 26, textAlign: 'center' },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  returnBtnText: { fontFamily: Font.bodySemiBold, fontSize: FontSize.base },

  // ── 歩数ウィジェット
  stepsWidget: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  stepsTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  stepsLabel: { fontSize: FontSize.xs, fontFamily: Font.body, marginBottom: 2 },
  stepsNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  stepsCurrent: { fontSize: FontSize.xxl, fontFamily: Font.heading },
  stepsGoal: { fontSize: FontSize.sm, fontFamily: Font.body },
  stepsPercent: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  stepsPercentText: { fontSize: FontSize.sm, fontFamily: Font.bodySemiBold },
  stepsTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  stepsFill: { height: '100%', borderRadius: Radius.full },
  stepsRemaining: { fontSize: FontSize.xs, fontFamily: Font.body, textAlign: 'right' },

  // ── メイン提案カード
  mainCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
    gap: Spacing.md,
  },
  mainCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  mainCardBadgeText: { fontSize: FontSize.xs, fontFamily: Font.bodySemiBold },
  mainCardTitle: { fontSize: FontSize.xxl, fontFamily: Font.heading, lineHeight: 36 },
  mainCardReason: {
    fontSize: FontSize.base,
    fontFamily: Font.body,
    lineHeight: 24,
  },
  mainCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  mainCardMetaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  mainCardMetaDivider: { width: 1, height: 16 },
  mainCardMetaText: { fontSize: FontSize.xs, fontFamily: Font.body },
  mainStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  mainStartBtnText: { fontFamily: Font.bodySemiBold, fontSize: FontSize.lg },

  // ── サブ提案カード
  subSectionLabel: {
    fontSize: FontSize.sm,
    fontFamily: Font.bodySemiBold,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  subCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  subCardContent: { flex: 1, gap: 4 },
  subCardTitle: { fontSize: FontSize.base, fontFamily: Font.bodySemiBold },
  subCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subCardMetaText: { fontSize: FontSize.xs, fontFamily: Font.body },
  subCardDot: { fontSize: FontSize.base, marginHorizontal: 2 },
  subStartBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  subStartBtnText: { fontSize: FontSize.sm, fontFamily: Font.bodySemiBold },
});
