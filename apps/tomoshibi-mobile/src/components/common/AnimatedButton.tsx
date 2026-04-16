import React, { useCallback } from "react";
import type { PressableProps, ViewStyle, StyleProp } from "react-native";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

type AnimatedButtonProps = PressableProps & {
  /** ボタン全体のclassName（NativeWind） */
  className?: string;
  /** ボタン全体のstyle */
  style?: StyleProp<ViewStyle>;
  /** 押下時スケール（デフォルト: 0.95） */
  pressedScale?: number;
  children: React.ReactNode;
};

/**
 * AnimatedButton
 *
 * 押下時にスケール縮小アニメーションを行うボタンコンポーネント。
 * - 押下時: scale 1.0 → pressedScale（100ms、timing）
 * - 離した時: scale → 1.0（150ms、spring）
 *
 * GamePlayScreen の主要ボタン（「次へ」「到着した」「回答する」等）に適用。
 *
 * 実装上の注意:
 * NativeWind v4 では Animated.createAnimatedComponent() でラップしたコンポーネントに
 * className を渡しても正しくスタイルが適用されない。
 * そのため className は外側の Animated.View に、スケールアニメーションは
 * 内側の Pressable（fill）に分離している。
 */
export const AnimatedButton = ({
  className,
  style,
  pressedScale = 0.95,
  onPress,
  onPressIn,
  onPressOut,
  children,
  disabled,
  ...rest
}: AnimatedButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      if (disabled) return;
      scale.value = withTiming(pressedScale, { duration: 100 });
      if (onPressIn) {
        runOnJS(onPressIn)(event);
      }
    },
    [disabled, pressedScale, scale, onPressIn]
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
      });
      if (onPressOut) {
        runOnJS(onPressOut)(event);
      }
    },
    [scale, onPressOut]
  );

  return (
    // NativeWind の className は Animated.View（対応コンポーネント）側で受け取る。
    // Animated.createAnimatedComponent(Pressable) への className 渡しは
    // NativeWind v4 では機能しないため、この二層構造にしている。
    <Animated.View
      className={className}
      style={[animatedStyle, style as ViewStyle]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

/**
 * PulseView
 *
 * マウント時に1回パルスアニメーション（scale 1.0 → 1.05 → 1.0）を実行するView。
 * 「到着した」ボタンが有効になった瞬間に使用する。
 */
export const PulseView = ({
  children,
  style,
  className,
  pulse,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  /** trueになった瞬間にパルスアニメーションを実行 */
  pulse: boolean;
}) => {
  const scale = useSharedValue(1);
  const prevPulse = React.useRef(false);

  React.useEffect(() => {
    if (pulse && !prevPulse.current) {
      scale.value = withTiming(1.05, { duration: 150 }, () => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 300,
          mass: 0.5,
        });
      });
    }
    prevPulse.current = pulse;
  }, [pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View className={className} style={[animatedStyle, style as ViewStyle]}>
      {children}
    </Animated.View>
  );
};

/**
 * TypewriterFlashText
 *
 * タイプライター完了時に一瞬テキスト色を明るくしてフェードバックするテキスト用ラッパー。
 * completed が false → true に変わった瞬間にフラッシュアニメーション（200ms）。
 */
export const TypewriterFlash = ({
  children,
  completed,
  style,
  className,
}: {
  children: React.ReactNode;
  /** タイプライター完了フラグ。false→trueになった瞬間にフラッシュ */
  completed: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) => {
  const opacity = useSharedValue(1);
  const prevCompleted = React.useRef(false);

  React.useEffect(() => {
    if (completed && !prevCompleted.current) {
      opacity.value = withTiming(1.3, { duration: 100 }, () => {
        opacity.value = withTiming(1, { duration: 100 });
      });
    }
    prevCompleted.current = completed;
  }, [completed, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value > 1 ? 1 : opacity.value,
  }));

  return (
    <Animated.View className={className} style={[animatedStyle, style as ViewStyle]}>
      {children}
    </Animated.View>
  );
};
