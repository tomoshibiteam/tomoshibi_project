import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/types";
import { HomeScreen } from "@/screens/HomeScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { FavoritesScreen } from "@/screens/FavoritesScreen";
import { MainBottomBar } from "@/components/navigation/MainBottomBar";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <MainBottomBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notifications" component={HistoryScreen} />
      <Tab.Screen name="Create" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
