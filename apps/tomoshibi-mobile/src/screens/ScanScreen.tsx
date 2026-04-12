import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { fonts } from "@/theme/fonts";

/* ───────── constants ───────── */

const PRIMARY = "#EE8C2B";
const SURFACE = "rgba(250,245,239,0.75)";
const SCAN_LINE_COLOR = "rgba(238,140,43,0.45)";

/* ───────── component ───────── */

export const ScanScreen = () => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [torch, setTorch] = useState(false);

  /* ── animation values ── */
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const reticleAppear = useRef(new Animated.Value(0)).current;
  const backgroundTextAppear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* scan line bounce */
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* entrance animations */
    Animated.stagger(150, [
      Animated.timing(backgroundTextAppear, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(reticleAppear, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scanLineAnim, reticleAppear, backgroundTextAppear]);

  /* ── interpolations ── */
  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  const reticleScale = reticleAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  /* ── permission not yet resolved ── */
  if (!permission) {
    return <View style={styles.root} />;
  }

  /* ── permission denied ── */
  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={["#1a1008", "#2a1a0e", "#0a0a0a"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={48} color={PRIMARY} style={{ marginBottom: 16 }} />
          <Text style={[styles.permissionTitle, { fontFamily: fonts.roundedBold }]}>
            カメラへのアクセス
          </Text>
          <Text style={[styles.permissionBody, { fontFamily: fonts.bodyRegular }]}>
            灯りをスキャンするにはカメラの使用を許可してください。
          </Text>
          <Pressable
            style={({ pressed }) => [styles.permissionButton, pressed && { opacity: 0.8 }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { fontFamily: fonts.displayBold }]}>
              カメラを許可する
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));
  const toggleTorch = () => setTorch((prev) => !prev);

  return (
    <View style={styles.root}>
      {/* ── Live Camera ── */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torch}
      />

      {/* ── Gradient overlay ── */}
      <LinearGradient
        colors={["rgba(0,0,0,0.20)", "transparent", "rgba(0,0,0,0.40)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Large background "SCAN" text ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.backgroundTextWrap,
          { top: insets.top + 64 },
          { opacity: backgroundTextAppear },
        ]}
      >
        <Text style={[styles.backgroundText, { fontFamily: fonts.displayExtraBold }]}>
          SCAN
        </Text>
      </Animated.View>

      {/* ── Scanning Reticle ── */}
      <Animated.View
        style={[
          styles.reticleWrap,
          {
            opacity: reticleAppear,
            transform: [{ scale: reticleScale }],
          },
        ]}
      >
        {/* 4 corners */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Scanning line */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslateY }] },
          ]}
        />

        {/* Guide text pill */}
        <View style={styles.guideTextWrap}>
          <View style={styles.guidePill}>
            <Text style={[styles.guideText, { fontFamily: fonts.roundedBold }]}>
              灯りをスキャンしてください
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Action sidebar ── */}
      <View style={[styles.actionSidebar, { top: "50%", marginTop: -80 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
            torch && styles.actionButtonActive,
          ]}
          onPress={toggleTorch}
        >
          <Ionicons name={torch ? "flash" : "flash-outline"} size={22} color={torch ? "#ffffff" : PRIMARY} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={toggleFacing}
        >
          <Ionicons name="camera-reverse-outline" size={22} color={PRIMARY} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Ionicons name="information-circle-outline" size={22} color={PRIMARY} />
        </Pressable>
      </View>
    </View>
  );
};

/* ───────── styles ───────── */

const CORNER_SIZE = 48;
const CORNER_BORDER = 3;
const RETICLE_SIZE = 280;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  /* background text */
  backgroundTextWrap: {
    position: "absolute",
    left: 20,
  },
  backgroundText: {
    fontSize: 86,
    color: "rgba(255,255,255,0.08)",
    lineHeight: 86,
    letterSpacing: -2,
  },

  /* reticle */
  reticleWrap: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -(RETICLE_SIZE / 2) - 20,
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: PRIMARY,
    borderTopLeftRadius: 18,
    opacity: 0.9,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: PRIMARY,
    borderTopRightRadius: 18,
    opacity: 0.9,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: PRIMARY,
    borderBottomLeftRadius: 18,
    opacity: 0.9,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: PRIMARY,
    borderBottomRightRadius: 18,
    opacity: 0.9,
  },
  scanLine: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: 16,
    height: 1,
    backgroundColor: SCAN_LINE_COLOR,
    shadowColor: "#EE8C2B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 4,
  },

  /* guide pill */
  guideTextWrap: {
    position: "absolute",
    bottom: -54,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  guidePill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  guideText: {
    fontSize: 13,
    color: PRIMARY,
    letterSpacing: 2,
  },

  /* action sidebar */
  actionSidebar: {
    position: "absolute",
    right: 18,
    gap: 18,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.85,
  },
  actionButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  /* permission screen */
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 22,
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  permissionButtonText: {
    fontSize: 14,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});
