import React, { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/theme/fonts";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";
import { useSessionUserId } from "@/hooks/useSessionUser";
import { fetchUserProfile } from "@/services/social";
import { subscribeOpenCreateSheet } from "@/lib/createSheetBus";

type NavItem = {
  route: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const navItems: NavItem[] = [
  { route: "Home", label: "探索", icon: "compass-outline", activeIcon: "compass" },
  { route: "Scan", label: "スキャン", icon: "qr-code-outline", activeIcon: "qr-code" },
  { route: "Notifications", label: "アーカイブ", icon: "reader-outline", activeIcon: "reader" },
  { route: "Profile", label: "プロフィール", icon: "person-outline", activeIcon: "person" },
];

const NAV_BG = "rgba(252,249,242,0.92)";
const NAV_BORDER = "rgba(219,193,185,0.28)";
const ACTIVE = "#934529";
const MUTED = "#7E7A76";

export const MainBottomBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { userId } = useSessionUserId();

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileInitial, setProfileInitial] = useState("G");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const createSheetTranslateY = useMemo(() => new Animated.Value(420), []);
  const currentRoute = state.routes[state.index]?.name as keyof MainTabParamList | undefined;

  useEffect(() => {
    const unsubscribe = subscribeOpenCreateSheet(() => {
      setCreateModalOpen(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!createModalOpen) return;
    createSheetTranslateY.setValue(420);
    Animated.timing(createSheetTranslateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [createModalOpen, createSheetTranslateY]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!userId) {
        if (!mounted) return;
        setProfileImageUrl(null);
        setProfileInitial("G");
        return;
      }

      try {
        const profile = await fetchUserProfile(userId);
        if (!mounted) return;
        setProfileImageUrl(profile?.profile_picture_url || null);
        setProfileInitial((profile?.name || "G").slice(0, 1).toUpperCase());
      } catch {
        if (!mounted) return;
        setProfileImageUrl(null);
        setProfileInitial("G");
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const navigateRoot = (screen: keyof RootStackParamList) => {
    const parent = navigation.getParent();
    if (!parent) return;
    parent.navigate(screen as never);
  };

  return (
    <>
      <View
        style={{
          paddingBottom: Math.max(10, insets.bottom),
          borderTopWidth: 1,
          borderTopColor: NAV_BORDER,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: NAV_BG,
          shadowColor: "#1C1C18",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        <View pointerEvents="none" style={styles.steamLayer}>
          <View style={[styles.steam, { left: 30, width: 54, opacity: 0.45 }]} />
          <View style={[styles.steam, { left: 94, width: 68, opacity: 0.35 }]} />
          <View style={[styles.steam, { right: 92, width: 64, opacity: 0.34 }]} />
          <View style={[styles.steam, { right: 28, width: 58, opacity: 0.44 }]} />
        </View>

        <View style={styles.navRow}>
          {navItems.map((item) => {
            const active = currentRoute === item.route;

            if (item.route === "Profile") {
              return (
                <Pressable key={item.route} style={styles.navItem} onPress={() => navigation.navigate(item.route)}>
                  <View style={[styles.navPill, active && styles.navPillActive]}>
                    <View
                      style={[
                        styles.avatar,
                        active && {
                          borderColor: ACTIVE,
                        },
                      ]}
                    >
                      {profileImageUrl ? (
                        <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={[styles.avatarInitial, { fontFamily: fonts.displayBold }]}>{profileInitial}</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.navLabel,
                        {
                          color: active ? ACTIVE : MUTED,
                          fontFamily: fonts.displayBold,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable key={item.route} style={styles.navItem} onPress={() => navigation.navigate(item.route)}>
                <View style={[styles.navPill, active && styles.navPillActive]}>
                  <Ionicons
                    name={active ? item.activeIcon : item.icon}
                    size={20}
                    color={active ? ACTIVE : MUTED}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: active ? ACTIVE : MUTED,
                        fontFamily: fonts.displayBold,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal animationType="none" transparent visible={createModalOpen} onRequestClose={() => setCreateModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCreateModalOpen(false)} />
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(48, insets.bottom + 28),
                transform: [{ translateY: createSheetTranslateY }],
              },
            ]}
          >
            <View style={styles.sheetHead}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetTitleRow}>
                <Text style={[styles.sheetTitle, { fontFamily: fonts.displayBold }]}>作成する</Text>
                <Pressable onPress={() => setCreateModalOpen(false)}>
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </Pressable>
              </View>
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
                onPress={() => {
                  setCreateModalOpen(false);
                  navigateRoot("CreateSeries");
                }}
              >
                <View style={styles.sheetActionIconWrap}>
                  <Ionicons name="book-outline" size={26} color="#EE8C2B" />
                </View>
                <View style={styles.sheetActionBody}>
                  <Text style={[styles.sheetActionTitle, { fontFamily: fonts.displayBold }]}>新しいシリーズを作る</Text>
                  <Text style={[styles.sheetActionText, { fontFamily: fonts.bodyRegular }]}>世界観やキャラクターをゼロから構築し、物語の骨格を作ります</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
                onPress={() => {
                  setCreateModalOpen(false);
                  navigateRoot("AddEpisode");
                }}
              >
                <View style={styles.sheetActionIconWrap}>
                  <Ionicons name="document-text-outline" size={26} color="#EE8C2B" />
                </View>
                <View style={styles.sheetActionBody}>
                  <Text style={[styles.sheetActionTitle, { fontFamily: fonts.displayBold }]}>エピソードを追加する</Text>
                  <Text style={[styles.sheetActionText, { fontFamily: fonts.bodyRegular }]}>既存のシリーズに、新しい場所や物語の続きを追加します</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  steamLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -6,
    height: 30,
  },
  steam: {
    position: "absolute",
    top: 0,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  navRow: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navPill: {
    minWidth: 62,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  navPillActive: {
    backgroundColor: "#F6F3EC",
  },
  navLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(136,114,108,0.32)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFE2D3",
  },
  avatarInitial: {
    fontSize: 10,
    color: "#7A4E2D",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  sheetHead: {
    marginBottom: 18,
  },
  sheetHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 20,
    color: "#2B1E16",
  },
  sheetActions: {
    gap: 12,
  },
  sheetAction: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#F8FAFC",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetActionPressed: {
    borderColor: "rgba(238,140,43,0.2)",
    backgroundColor: "#FFF7ED",
  },
  sheetActionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sheetActionBody: {
    flex: 1,
  },
  sheetActionTitle: {
    fontSize: 14,
    color: "#2B1E16",
    marginBottom: 4,
  },
  sheetActionText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
});
