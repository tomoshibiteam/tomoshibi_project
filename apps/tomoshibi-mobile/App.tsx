import "./src/styles/global.css";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as usePlusJakartaFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
  useFonts as useNotoSansFonts,
} from "@expo-google-fonts/noto-sans-jp";
import {
  NotoSerifJP_400Regular,
  NotoSerifJP_600SemiBold,
  NotoSerifJP_700Bold,
  useFonts as useNotoSerifFonts,
} from "@expo-google-fonts/noto-serif-jp";
import {
  ZenMaruGothic_500Medium,
  ZenMaruGothic_700Bold,
  useFonts as useZenMaruFonts,
} from "@expo-google-fonts/zen-maru-gothic";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "@/navigation/RootNavigator";
import {
  getFirebaseClientApp,
  getFirebaseClientAuth,
  getFirebaseClientDb,
  getFirebaseMissingEnvKeys,
  probeFirebaseConnectivity,
} from "@/lib/firebase";

export default function App() {
  useEffect(() => {
    const app = getFirebaseClientApp();
    if (!app) {
      const missing = getFirebaseMissingEnvKeys();
      console.warn(
        `Firebase is not configured yet. Missing env: ${missing.join(", ")}`
      );
      return;
    }

    getFirebaseClientAuth();
    getFirebaseClientDb();
    console.log(`[Firebase] initialized for project: ${app.options.projectId}`);

    void probeFirebaseConnectivity().then((result) => {
      if (result.ok) {
        console.log(`[Firebase] connectivity ok (${result.details})`);
        return;
      }
      console.warn(`[Firebase] connectivity failed (${result.details})`);
    });
  }, []);

  const [displayLoaded] = usePlusJakartaFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [bodyLoaded] = useNotoSansFonts({
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
  });
  const [storyLoaded] = useNotoSerifFonts({
    NotoSerifJP_400Regular,
    NotoSerifJP_600SemiBold,
    NotoSerifJP_700Bold,
  });
  const [roundedLoaded] = useZenMaruFonts({
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });

  const fontsReady = displayLoaded && bodyLoaded && storyLoaded && roundedLoaded;

  if (!fontsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F7F6]">
        <ActivityIndicator color="#EE8C2B" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" translucent={false} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
