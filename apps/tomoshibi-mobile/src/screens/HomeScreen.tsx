import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fonts } from "@/theme/fonts";
import type { RootStackParamList } from "@/navigation/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSessionUserId } from "@/hooks/useSessionUser";
import { fetchExplorePayload } from "@/services/feed";
import { featuredCampaign } from "@/lib/featuredCampaign";
import type { ExploreCreator, ExploreQuest } from "@/types/feed";

const HERO_FALLBACK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAthdvAhJ4XCOykibTGqOzJ_w5Lh6y0WxbkPOYpWLt_m1LaV8N-y5K1I_BnGOJMX3MaFIQ_gui-Dmpe8116af02vjntcnGCL4SEJ8-6nGc4cMkaKt1kxWKRJL59WBWX33UQrKNVkqk5_Yn3NtUithfpBO3GPCIE4_yuOy4HsfNVPpZ9TtJV3habfIpDwJMMcbBRhxVrSNtxL8t_zX4QF0C_LikkLr0cTzjxBpaCILVXOZubbl1V-5W4C8OlzwcdVDvDSB035fdY6f4";

const PROFILE_FALLBACK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAzPo9gS-PgvWKlM4d908SLrTOVA-tig_SzVJJo0rwG8VeeWAOtDOkYgYacjUOuULINTeUkpDBIEklNyQvd4qrdMn4puUFGP6pyznJBtDA9GCJcXT7aXNS9eVSSKbECjNTk6D0wmo6mCIESr5gW_vAMDneJ7frIiHwrOlKqRDUUxmmINZ85Aj5bQSs-tcaNnxu8qTcmp1ZxsgTYb1NXI4dBufNKEY7heoxoJ8EoeEdo-cnCNP61SRzwxTINT-n-N6V7yffLWP5U08o";

type FeedPost = {
  id: string;
  questId: string;
  authorId: string | null;
  authorName: string;
  authorAvatar: string | null;
  postedAt: string;
  questTitle: string;
  questImage: string;
  area: string;
  tags: string[];
};

type RecommendationCard = {
  id: string;
  title: string;
  description: string;
  distance: string;
  duration: string;
  tagPrimary: string;
  tagSecondary: string;
  imageUrl: string;
  authorAvatar?: string | null;
};

const recommendationFallback: RecommendationCard[] = [
  {
    id: "fallback-1",
    title: "Echoes of the Bamboo Grove",
    description: "竹林に響く風の音と共に、この地に伝わる古い詩を辿る静かな散策路。",
    distance: "2.4 km",
    duration: "45 min",
    tagPrimary: "Nature",
    tagSecondary: "Poetry",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLztwXnAbS1PGR5xsZg49qMDvuCsyLUEV9_RVRZkU2QaGNt-MU8CS7-fguxK6hEJ4FNfjHPhv2okWYq50ubnrHOaI62mNDiE9YE9nHJwB9NOaRs0HJAzhwaW5iUNCUWtIIx_ZCqFAVwFm96PU-PJ5pYI7a0ZsgSIJDfmqFkOFH3h_0hGuZHhGV007Z1seKtABoyw_vXTaw6vOebayRzCktvy0MzCNIFstm-v7_lPvi4lvDtFH7QctrLZPvVPtJxuXD80yUppM_pG8",
  },
  {
    id: "fallback-2",
    title: "The Hidden Shrine Path",
    description: "地元の人しか知らない小さな祠を巡り、忘れられた物語を紐解く旅。",
    distance: "1.2 km",
    duration: "30 min",
    tagPrimary: "History",
    tagSecondary: "Mystery",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFNd_e5huf6lsTVThV527HU2El0v9wRPSVGq9dQYZCz5md3xrVXdc9pCVt1GbvTP3qTOKOvBmSOoP0K-q8hV_KPea9cW_M8qzQo37llcDhKNwxENwlBBMx7qAI1Ow5GzykNu6nnSiPieonjY8XfjJtTurZDBjKHNHTn3n6gglpUEcd8nlloEKteEipZBBdrwRIeMkXI65u8DIEHKRHGbY1qnb47m4oTkwkUGm_6UgoCr1lD34ph_9rwXEGoJ70MQX4PxuwrTGg8JM",
  },
];

const backgroundSteamOrbs: Array<{
  size: number;
  top: number;
  left?: number;
  right?: number;
  color: string;
}> = [
  { size: 280, top: -80, left: -120, color: "rgba(255,255,255,0.52)" },
  { size: 220, top: 160, right: -88, color: "rgba(250,240,226,0.55)" },
  { size: 250, top: 380, left: -106, color: "rgba(255,251,245,0.42)" },
  { size: 240, top: 680, right: -110, color: "rgba(241,228,208,0.44)" },
];

const heroSteamPuffs = [
  { size: 120, left: -16, opacity: 0.68 },
  { size: 138, left: 58, opacity: 0.62 },
  { size: 124, left: 156, opacity: 0.66 },
  { size: 132, left: 236, opacity: 0.58 },
] as const;

const estimateDuration = (title: string) => `${Math.min(140, Math.max(30, title.length * 3))} min`;
const estimateDistance = (title: string) => `${Math.min(6.8, Math.max(1.2, title.length / 8)).toFixed(1)} km`;

const toFeedPost = (
  quest: ExploreQuest,
  creatorById: Record<string, ExploreCreator>
): FeedPost => {
  const creatorId = quest.creatorId || null;
  const creator = creatorId ? creatorById[creatorId] : undefined;

  return {
    id: quest.id,
    questId: quest.id,
    authorId: creatorId,
    authorName: quest.creatorName || creator?.name || "旅の案内人",
    authorAvatar: creator?.profilePictureUrl || null,
    postedAt: "たった今",
    questTitle: quest.title || "無題の物語",
    questImage: quest.coverImageUrl || HERO_FALLBACK,
    area: quest.areaName || "Unknown Area",
    tags: quest.areaName ? [quest.areaName] : ["Stories"],
  } satisfies FeedPost;
};

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useSessionUserId();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<ExploreQuest[]>([]);
  const [creatorById, setCreatorById] = useState<Record<string, ExploreCreator>>({});

  const steamAnimations = useMemo(() => backgroundSteamOrbs.map(() => new Animated.Value(0)), []);
  const heroAppear = useRef(new Animated.Value(0)).current;
  const sectionAppear = useMemo(() => [new Animated.Value(0), new Animated.Value(0)], []);
  const cardAppear = useMemo(() => [new Animated.Value(0), new Animated.Value(0)], []);

  const textureDots = useMemo(() => {
    const columns = 7;
    const gapX = Math.max(30, Math.floor(width / columns));
    return Array.from({ length: 42 }, (_, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      return {
        id: `dot-${index}`,
        top: row * 52 + (row % 2 === 0 ? 6 : 20),
        left: col * gapX + (row % 2 === 0 ? 8 : 20),
        size: index % 3 === 0 ? 2 : 1,
        opacity: index % 3 === 0 ? 0.16 : 0.11,
      };
    });
  }, [width]);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = await fetchExplorePayload(userId);
      setQuests(payload.quests);

      const creatorMap: Record<string, ExploreCreator> = {};
      [...payload.creators, ...payload.allCreators].forEach((creator) => {
        if (!creatorMap[creator.id]) {
          creatorMap[creator.id] = creator;
        }
      });
      setCreatorById(creatorMap);
    } catch (error) {
      console.error("HomeScreen: failed to refresh", error);
      Alert.alert("ホームを読み込めません", "時間をおいて再度お試しください。");
      setQuests([]);
      setCreatorById({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    const steamLoops = steamAnimations.map((steamAnimation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(steamAnimation, {
            toValue: 1,
            duration: 3600 + index * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(steamAnimation, {
            toValue: 0,
            duration: 3300 + index * 460,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );

    const heroAnimation = Animated.timing(heroAppear, {
      toValue: 1,
      duration: 660,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const sectionAnimation = Animated.stagger(
      130,
      sectionAppear.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );

    steamLoops.forEach((loop) => loop.start());
    heroAnimation.start();
    sectionAnimation.start();

    return () => {
      steamLoops.forEach((loop) => loop.stop());
    };
  }, [cardAppear, heroAppear, sectionAppear, steamAnimations]);

  const recommendationPosts = useMemo(() => {
    const seen = new Set<string>();
    const sorted = [...quests]
      .slice(0, 12)
      .map((quest) => toFeedPost(quest, creatorById));

    return sorted.filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [quests, creatorById]);

  const recommendationCards = useMemo(() => {
    const mapped = recommendationPosts.slice(0, 2).map((post, index) => ({
      id: post.id,
      title: post.questTitle,
      description: `${post.area}で語り継がれる記憶と景色をたどる、静かな散策ルート。`,
      distance: estimateDistance(post.questTitle),
      duration: estimateDuration(post.questTitle),
      tagPrimary: post.tags[0] || "Nature",
      tagSecondary: index % 2 === 0 ? "Poetry" : "Mystery",
      imageUrl: post.questImage,
      authorAvatar: post.authorAvatar,
    } satisfies RecommendationCard));

    if (mapped.length >= 2) return mapped;
    return [...mapped, ...recommendationFallback.slice(0, 2 - mapped.length)];
  }, [recommendationPosts]);

  const profileAvatarUri =
    recommendationCards.find((card) => card.authorAvatar)?.authorAvatar || PROFILE_FALLBACK;

  const stats = useMemo(
    () => ({
      stories: `${quests.length > 0 ? Math.min(99, quests.length) : 12}`.padStart(2, "0"),
      streak: `${quests.length > 0 ? Math.min(30, Math.max(1, Math.round(quests.length / 2))) : 5}`.padStart(2, "0"),
      title: "Explorer",
    }),
    [quests.length]
  );

  useEffect(() => {
    if (loading) {
      cardAppear.forEach((value) => value.setValue(0));
      return;
    }

    Animated.stagger(
      120,
      cardAppear.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAppear, loading, recommendationCards.length]);

  const headerHeight = insets.top + 64;

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.configWrap}>
          <Text style={[styles.configTitle, { fontFamily: fonts.displayBold }]}>Firebase設定が必要です</Text>
          <Text style={[styles.configBody, { fontFamily: fonts.bodyRegular }]}>
            `.env` に EXPO_PUBLIC_FIREBASE_API_KEY などの EXPO_PUBLIC_FIREBASE_* を設定してください。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const heroTranslateY = heroAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const sectionOneTranslateY = sectionAppear[0].interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const sectionTwoTranslateY = sectionAppear[1].interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
      <View style={styles.root}>
        <LinearGradient
          colors={["#fcf9f2", "#f6f1e8", "#fcf9f2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.textureLayer} pointerEvents="none">
          {textureDots.map((dot) => (
            <View
              key={dot.id}
              style={{
                position: "absolute",
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size,
                backgroundColor: `rgba(155,114,90,${dot.opacity})`,
              }}
            />
          ))}
        </View>

        {backgroundSteamOrbs.map((orb, index) => {
          const steam = steamAnimations[index];
          const translateY = steam.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -16 - index * 4],
          });

          const opacity = steam.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.42],
          });

          return (
            <Animated.View
              key={`steam-${index}`}
              pointerEvents="none"
              style={[
                styles.backgroundSteamOrb,
                {
                  width: orb.size,
                  height: orb.size,
                  top: orb.top,
                  left: orb.left,
                  right: orb.right,
                  backgroundColor: orb.color,
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            />
          );
        })}

        <View style={[styles.topAppBar, { paddingTop: insets.top }]}> 
          <View style={styles.topAppBarInner}>
            <Pressable
              onPress={() => navigation.navigate("MainTabs", { screen: "Search" })}
              style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}
            >
              <Ionicons name="menu-outline" size={22} color="#934529" />
            </Pressable>

            <Text style={[styles.brandName, { fontFamily: fonts.roundedBold }]}>TOMOSHIBI</Text>

            <Pressable
              onPress={() => navigation.navigate("MainTabs", { screen: "Profile" })}
              style={({ pressed }) => [styles.profileWrap, pressed && styles.pressed]}
            >
              <Image source={{ uri: profileAvatarUri }} style={styles.profileImage} resizeMode="cover" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: headerHeight + 6,
            paddingBottom: 128,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: heroAppear,
              transform: [{ translateY: heroTranslateY }],
            }}
          >
            <Pressable
              onPress={() => navigation.navigate("FeaturedCampaign", { campaignId: featuredCampaign.id })}
              style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
            >
              <Image
                source={{ uri: featuredCampaign.heroImageUrl || HERO_FALLBACK }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.0)", "rgba(49,23,12,0.52)", "rgba(35,14,7,0.92)"]}
                start={{ x: 0.5, y: 0.1 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.heroGradient}
              />

              <View pointerEvents="none" style={styles.heroSteamStrip}>
                {heroSteamPuffs.map((puff, idx) => (
                  <View
                    key={`hero-puff-${idx}`}
                    style={[
                      styles.heroSteamPuff,
                      {
                        width: puff.size,
                        height: puff.size,
                        left: puff.left,
                        opacity: puff.opacity,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.heroContent}>
                <Text style={[styles.heroBadge, { fontFamily: fonts.displayBold }]}>Featured Walk</Text>

                <Text style={[styles.heroTitle, { fontFamily: fonts.roundedBold }]}>
                  Iwami Station PoC:{"\n"}
                  Walk through the history of the station
                </Text>

                <Pressable
                  onPress={() => navigation.navigate("FeaturedCampaign", { campaignId: featuredCampaign.id })}
                  style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
                >
                  <Text style={[styles.heroButtonText, { fontFamily: fonts.displayBold }]}>Start Experience</Text>
                  <Ionicons name="play" size={14} color="#934529" />
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={{
              opacity: sectionAppear[0],
              transform: [{ translateY: sectionOneTranslateY }],
            }}
          >
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { fontFamily: fonts.roundedBold }]}>旅の軌跡</Text>
                <Text style={[styles.sectionMiniLabel, { fontFamily: fonts.displayBold }]}>Your Records</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Ionicons name="book-outline" size={18} color="#934529" style={styles.statIcon} />
                  <Text style={[styles.statValue, { fontFamily: fonts.displayExtraBold }]}>{stats.stories}</Text>
                  <Text style={[styles.statLabel, { fontFamily: fonts.bodyMedium }]}>Stories</Text>
                </View>

                <View style={[styles.statCard, styles.statCardMiddle]}>
                  <Ionicons name="flame" size={18} color="#7b5413" style={styles.statIcon} />
                  <Text style={[styles.statValue, { fontFamily: fonts.displayExtraBold }]}>{stats.streak}</Text>
                  <Text style={[styles.statLabel, { fontFamily: fonts.bodyMedium }]}>Day Streak</Text>
                </View>

                <View style={styles.statCardHighlight}>
                  <Ionicons name="ribbon-outline" size={18} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={[styles.statTitleValue, { fontFamily: fonts.displayBold }]}>{stats.title}</Text>
                  <Text style={[styles.statLabelHighlight, { fontFamily: fonts.bodyMedium }]}>Current Title</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: sectionAppear[1],
              transform: [{ translateY: sectionTwoTranslateY }],
            }}
          >
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View>
                    <Text style={[styles.sectionTitle, { fontFamily: fonts.roundedBold }]}>今日のおすすめ</Text>
                    <Text style={[styles.sectionMiniLabel, { fontFamily: fonts.displayBold }]}>TODAY'S PICKS</Text>
                  </View>
                <Pressable
                  onPress={() => navigation.navigate("MainTabs", { screen: "Search" })}
                  style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
                >
                  <Text style={[styles.seeAllText, { fontFamily: fonts.displayBold }]}>See All</Text>
                  <Ionicons name="arrow-forward" size={13} color="#516446" />
                </Pressable>
              </View>

              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color="#934529" />
                </View>
              ) : (
                <View style={styles.recommendList}>
                  {recommendationCards.map((card, index) => {
                    const cardTranslateY = cardAppear[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    });

                    return (
                      <Animated.View
                        key={card.id}
                        style={{
                          opacity: cardAppear[index],
                          transform: [{ translateY: cardTranslateY }],
                        }}
                      >
                        <Pressable
                          onPress={() => navigation.navigate("MainTabs", { screen: "Search" })}
                          style={({ pressed }) => [styles.recommendCard, pressed && styles.pressed]}
                        >
                          <View style={styles.recommendImageWrap}>
                            <Image source={{ uri: card.imageUrl }} style={styles.recommendImage} resizeMode="cover" />
                          </View>

                          <View style={styles.recommendBody}>
                            <View style={styles.recommendMetaRow}>
                              <Ionicons name="walk-outline" size={12} color="#516446" />
                              <Text style={[styles.recommendMetaText, { fontFamily: fonts.displayBold }]}>
                                {card.distance} • {card.duration}
                              </Text>
                            </View>

                            <Text style={[styles.recommendTitle, { fontFamily: fonts.roundedBold }]} numberOfLines={2}>
                              {card.title}
                            </Text>
                            <Text style={[styles.recommendDesc, { fontFamily: fonts.bodyRegular }]} numberOfLines={2}>
                              {card.description}
                            </Text>

                            <View style={styles.tagRow}>
                              <Text style={[styles.tagGreen, { fontFamily: fonts.bodyMedium }]}>{card.tagPrimary}</Text>
                              <Text style={[styles.tagAmber, { fontFamily: fonts.bodyMedium }]}>{card.tagSecondary}</Text>
                            </View>
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              )}
            </View>
          </Animated.View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fcf9f2",
  },
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.62,
  },
  backgroundSteamOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  topAppBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "rgba(252,249,242,0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(219,193,185,0.18)",
    shadowColor: "#1c1c18",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 7,
  },
  topAppBarInner: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    color: "#934529",
    letterSpacing: 0.35,
  },
  profileWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(136,114,108,0.26)",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  heroCard: {
    height: 420,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 26,
    shadowColor: "#934529",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 11,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSteamStrip: {
    position: "absolute",
    left: -18,
    right: -18,
    bottom: -76,
    height: 142,
  },
  heroSteamPuff: {
    position: "absolute",
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "#f6f0e5",
  },
  heroContent: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#291800",
    backgroundColor: "#f2be73",
    marginBottom: 12,
    shadowColor: "#934529",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 33,
    color: "#ffffff",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroButton: {
    alignSelf: "flex-start",
    height: 46,
    borderRadius: 999,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  heroButtonText: {
    color: "#934529",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#221910",
  },
  sectionMiniLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: "#B8AFA4",
    textTransform: "uppercase",
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#f6f3ec",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(147,69,41,0.07)",
  },
  statCardMiddle: {
    borderWidth: 1,
    borderColor: "rgba(147,69,41,0.1)",
    backgroundColor: "#f3ede3",
  },
  statCardHighlight: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#7a3520",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7a3520",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 5,
  },
  statIcon: {
    marginBottom: 7,
  },
  statValue: {
    fontSize: 22,
    color: "#1c1c18",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    color: "#88726c",
  },
  statTitleValue: {
    fontSize: 12,
    letterSpacing: 0.6,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  statLabelHighlight: {
    marginTop: 3,
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 12,
    color: "#516446",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  recommendList: {
    gap: 12,
  },
  recommendCard: {
    flexDirection: "row",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(219,193,185,0.4)",
    padding: 12,
    shadowColor: "#934529",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendImageWrap: {
    width: 96,
    height: 128,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
  },
  recommendImage: {
    width: "100%",
    height: "100%",
  },
  recommendBody: {
    flex: 1,
    paddingTop: 3,
  },
  recommendMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  recommendMetaText: {
    fontSize: 10,
    color: "#516446",
  },
  recommendTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: "#1c1c18",
    marginBottom: 4,
  },
  recommendDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: "#55433d",
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagGreen: {
    fontSize: 10,
    color: "#3a4c30",
    backgroundColor: "rgba(209,230,193,0.52)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
  },
  tagAmber: {
    fontSize: 10,
    color: "#624000",
    backgroundColor: "rgba(255,221,178,0.46)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
  },
  configWrap: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  configTitle: {
    fontSize: 20,
    color: "#221910",
    marginBottom: 8,
  },
  configBody: {
    fontSize: 14,
    color: "#6C5647",
    lineHeight: 22,
  },
  bottomSpace: {
    height: 16,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
});
