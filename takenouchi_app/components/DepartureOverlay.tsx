import React, { useEffect, useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { FontSize, Font } from '@/constants/theme';

const DEPARTURE_MESSAGES = [
  'よし、行こう！☀️',
  '一緒に行くよ！',
  '楽しんできてね！',
] as const;

function randomDepartureMessage(): string {
  return DEPARTURE_MESSAGES[Math.floor(Math.random() * DEPARTURE_MESSAGES.length)];
}

interface DepartureOverlayProps {
  visible: boolean;
  onAnimationEnd: () => void;
}

export function DepartureOverlay({ visible, onAnimationEnd }: DepartureOverlayProps) {
  const { colors } = useTheme();
  const [message] = useState(() => randomDepartureMessage());

  const avatarScale = useSharedValue(1);
  const avatarGlow = useSharedValue(0.4);
  const bgOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    shadowOpacity: avatarGlow.value,
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  useEffect(() => {
    if (!visible) return;

    // 1. 背景フェードイン
    bgOpacity.value = withTiming(1, { duration: 200 });

    // 2. アバター パルス → 大きく弾ける
    avatarScale.value = withSequence(
      withTiming(1.15, { duration: 200 }),
      withTiming(0.95, { duration: 150 }),
      withSpring(1.4, { damping: 5, stiffness: 200 }),
      withTiming(1.2, { duration: 200 }),
    );
    avatarGlow.value = withSequence(
      withTiming(0.9, { duration: 300 }),
      withTiming(0.6, { duration: 400 }),
    );

    // 3. 相棒の一言をフェードイン（少し遅らせる）
    textOpacity.value = withDelay(350, withTiming(1, { duration: 300 }));
    textTranslateY.value = withDelay(350, withSpring(0, { damping: 12, stiffness: 120 }));

    // 4. 1秒後に画面遷移
    const timer = setTimeout(() => {
      bgOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onAnimationEnd)();
      });
    }, 1050);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <Reanimated.View
        style={[
          styles.overlay,
          { backgroundColor: colors.bgBase + 'F0' },
          bgStyle,
        ]}
      >
        {/* FlameAvatar */}
        <Reanimated.View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: colors.bgElevated,
              shadowColor: colors.amberPrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 28,
              elevation: 20,
            },
            avatarStyle,
          ]}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.amberPrimary,
              shadowColor: colors.amberPrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 10,
            }}
          />
        </Reanimated.View>

        {/* 相棒の一言 */}
        <Reanimated.Text
          style={[
            styles.message,
            { color: colors.textPrimary },
            textStyle,
          ]}
        >
          {message}
        </Reanimated.Text>
      </Reanimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: FontSize.xxl,
    fontFamily: Font.heading,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
