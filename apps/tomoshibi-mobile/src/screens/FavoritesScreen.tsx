import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { fonts } from "@/theme/fonts";
import { featuredCampaign } from "@/lib/featuredCampaign";

type FavoriteItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

const favoriteItems: FavoriteItem[] = [
  {
    id: "fav-1",
    title: "岩美駅プロジェクト：潮風と記憶の駅",
    subtitle: "鳥取県・海岸線の記憶をたどる",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvJXQFfqEAwqgENzg9cXrRoaXObiFIxmiR30PcqlVW03gCdi0T7ZIaK3TC-I_Z7YAaS6ebWs1q50F6oEhzhD_jMyobhDfnsZ89UgUgIL1hj2UVdGLKuYDBhhmS44G8g9puYWlmIN8DmVdNBuw_S1IwgNI8yAUwQlljo-W-ocA7JF966JRb7NOWQ7_nrrcAd1VUYUmTeTydEcV3m6j_RTwRJc1Z4n5InN3ozK8El5T2f0bgXCZQ-00I5jTADhUCMzG9pVP28o89pRdu",
  },
  {
    id: "fav-2",
    title: "静寂の庭園",
    subtitle: "500m先・短時間で巡れる癒しの体験",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDr0Mos7bz10Y9y1nUE5fh5tR8VzTX18TgVHLT37277omxr2mfrrPO4MCDYa5uH5k2YgWNgTLudLrPfhe1uvN17Xf4_FsMO-yCigItJHjUsxVICF4JKfNCLKAObRKEufpAG6Y5DsmbDHqkBQE4vgO-zV4-HGJHTM_HnlT_mPl3E-ARVuAKjHaoCTVqzL8Gx2ey546EJwpylmX8jEc0iCy1Nirk4DofXMWBcwkeC-j2BMOc8rRBdFQewOXgvbuoqjppfe9Yxyofh9Ogu",
  },
];

export const FavoritesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: fonts.displayExtraBold }]}>お気に入り</Text>
          <Text style={[styles.subtitle, { fontFamily: fonts.bodyRegular }]}>保存した体験をここからすぐ再開できます</Text>
        </View>

        <View style={styles.list}>
          {favoriteItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate("FeaturedCampaign", { campaignId: featuredCampaign.id })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { fontFamily: fonts.bodyBold }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.cardSubtitle, { fontFamily: fonts.bodyRegular }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>
                <View style={styles.favoriteMeta}>
                  <Ionicons name="heart" size={14} color="#7d562d" />
                  <Text style={[styles.favoriteMetaText, { fontFamily: fonts.displayBold }]}>お気に入り済み</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    color: "#2b3437",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#586064",
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(171,179,183,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: "#2b3437",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#586064",
    marginBottom: 8,
  },
  favoriteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoriteMetaText: {
    fontSize: 11,
    color: "#7d562d",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
