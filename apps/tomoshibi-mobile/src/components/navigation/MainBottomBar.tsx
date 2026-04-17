import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/theme/fonts";
import type { MainTabParamList } from "@/navigation/types";

type NavItem = {
  route: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const navItems: NavItem[] = [
  { route: "Home", label: "ホーム", icon: "home-outline", activeIcon: "home" },
  { route: "Search", label: "探す", icon: "compass-outline", activeIcon: "compass" },
  {
    route: "Notifications",
    label: "アクティビティ",
    icon: "ticket-outline",
    activeIcon: "ticket",
  },
  { route: "Create", label: "お気に入り", icon: "heart-outline", activeIcon: "heart" },
  { route: "Profile", label: "マイページ", icon: "person-outline", activeIcon: "person" },
];

const ACTIVE = "#7a532a";
const INACTIVE = "#9ca3af";
const NAV_BG = "rgba(248,249,250,0.9)";
const NAV_BORDER = "rgba(115,124,127,0.14)";

export const MainBottomBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name as keyof MainTabParamList | undefined;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(8, insets.bottom + 2),
          backgroundColor: NAV_BG,
          borderTopColor: NAV_BORDER,
        },
      ]}
    >
      <View style={styles.row}>
        {navItems.map((item) => {
          const active = currentRoute === item.route;

          return (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={23}
                color={active ? ACTIVE : INACTIVE}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: active ? ACTIVE : INACTIVE,
                    fontFamily: active ? fonts.displayBold : fonts.bodyMedium,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 2,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.95 }],
  },
});
