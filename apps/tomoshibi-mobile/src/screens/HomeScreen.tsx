import React, { useMemo } from "react";
import {
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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fonts } from "@/theme/fonts";
import type { RootStackParamList } from "@/navigation/types";
import { featuredCampaign } from "@/lib/featuredCampaign";

const colors = {
  background: "#f8f9fa",
  onSurface: "#2b3437",
  onSurfaceVariant: "#586064",
  primary: "#7d562d",
  onPrimary: "#fff6f1",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f1f4f6",
  surfaceContainer: "#eaeff1",
  surfaceContainerHigh: "#e3e9ec",
  surfaceContainerHighest: "#dbe4e7",
  outlineVariant: "#abb3b7",
};

const profileAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkPUeGm8v7ynGSzvjes7pCq5cmjD4aFoJ34DlQEj25zAnwKkyQlOM0q4skQb570zS854NrFzK9nlkrX0zD8GdDd76QP_ZpnYc4giNunyPMVuq7wQZjZnq2BUqkUgSSUNUORZqyGW-oDMMA82Yb8HKg7L1mFIxlKMnzoEgY8U_u6PqFOvzs_fdtjKw8pxkAeQ3UX9ltsAWzbLa7t0p7jfomDWDamFVqsbmE1KsBFLMSsDZO6nBXUvZo8Z1Yq_q8xybZbh-DDGoskyv_";

const continueCardImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfUBsz_YrKhy03IWTe5qzCeNQBT2WfvRGm-J9gRpUcsv00U3bFnz_ukEQ5lSEkMYmtCFiALqobEX6_1_j5vOg2moUAo5ITjQ5PQePJoQ9v0jtxiCvNndtQRbzAOFQ-DmwKbRHOIPP82ESIaGogdLNy8Nd1JaftHEXhj8PYHe-dvnjEGlTb6Lmahj5l7jMW8EgQeZCQ6avlIfVb7gU_i1bp9LcZesssFavQDjQDBf1L99iw3oB2ubtYWxu3p_9wF49FwXLbMU3zn21c";

type FeatureArticle = {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
};

const featureArticles: FeatureArticle[] = [
  {
    id: "feature-1",
    badge: "Editorial",
    title: "岩美駅プロジェクト：潮風と記憶の駅",
    description: "静かな海岸線で、過ぎ去った時間に思いを馳せる旅。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvJXQFfqEAwqgENzg9cXrRoaXObiFIxmiR30PcqlVW03gCdi0T7ZIaK3TC-I_Z7YAaS6ebWs1q50F6oEhzhD_jMyobhDfnsZ89UgUgIL1hj2UVdGLKuYDBhhmS44G8g9puYWlmIN8DmVdNBuw_S1IwgNI8yAUwQlljo-W-ocA7JF966JRb7NOWQ7_nrrcAd1VUYUmTeTydEcV3m6j_RTwRJc1Z4n5InN3ozK8El5T2f0bgXCZQ-00I5jTADhUCMzG9pVP28o89pRdu",
  },
  {
    id: "feature-2",
    badge: "Artisan",
    title: "Masters of Uji",
    description:
      "Meet the generational tea masters who keep the 800-year-old tradition alive in the mist of Kyoto's hills.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCPXATdwLKNynSB1yXNoMefnVZBNpq36VuZ-_IYjSVfE8pnae6meDOhC-_x8hvVl0lhdbUl1HKESvfyXoSgd1544VKSArT5lEZaXLoFoIZFm47Jl1PptUmoaSmq-qNx9uKtvu5HmNKet1WBoY0BOX9yR2KB8hwPtgZj-PeZn8ExgEKhWgepd4y2Lr3Dt4elylyOeEBck0u5vEyizwhPY18gJIXf71TamXf9ONqSC7DsQpLBxLtcSMFgrsg5Cn7mwbLgzqHG1Z3dKdg",
  },
];

type NearbyItem = {
  id: string;
  title: string;
  distance: string;
  image: string;
};

const nearbyItems: NearbyItem[] = [
  {
    id: "nearby-1",
    title: "静寂の庭園",
    distance: "500m先",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDr0Mos7bz10Y9y1nUE5fh5tR8VzTX18TgVHLT37277omxr2mfrrPO4MCDYa5uH5k2YgWNgTLudLrPfhe1uvN17Xf4_FsMO-yCigItJHjUsxVICF4JKfNCLKAObRKEufpAG6Y5DsmbDHqkBQE4vgO-zV4-HGJHTM_HnlT_mPl3E-ARVuAKjHaoCTVqzL8Gx2ey546EJwpylmX8jEc0iCy1Nirk4DofXMWBcwkeC-j2BMOc8rRBdFQewOXgvbuoqjppfe9Yxyofh9Ogu",
  },
  {
    id: "nearby-2",
    title: "Koubo Bakery",
    distance: "1.2km away",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHC_9kir3QQQ5fkMn7mKFjYMmFoYS24dhDJ1oFxWFejuOWjNyJOUasMkoYV5JGI5FbdE4pyHvhgSR20XLl7UEDUlGoqSvba-ATqj3TSke_aVv8AAcxK7mKG7BbTHWf8omAM_MhTAbBFMCCEM21cyb6u-ox4qeQRfwqO4ydHmxmHTqH1Fuw5hvQOhhw1YJoywkkP14B8qgm3mVzzZvpyFCUP2uG2dH2awwCQ7pPHfkXbQemoo3iucG4dKKc4B2CKCfUml5Ab4RMpvjP",
  },
  {
    id: "nearby-3",
    title: "Ame Books",
    distance: "1.8km away",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjL72mxTJAisCzPER2gS7rfMXVW2OKqKsAbzmpXI4YLSggrcOfaK4K60bGzUKMCm-1ArKOl43W_-fSEenVHusLKpHlk6OJkZ-eWkNX0lEeqT61qz2JH4gMym1N_4HaJY1E5di7bC0T2glgIC-1B3yghRmuKVhmpxnziCpoYDtoznWbTh-PmaQKHJEzIQnLZIzRjIf-PUHjT2qZPTGZaRsA29551jeUpDU_278Yzcv1sbz6t13I87bOC833hhV-DQexCxpzy9Cw_M-k",
  },
  {
    id: "nearby-4",
    title: "Tsuchi Ceramics",
    distance: "2.1km away",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtrYU_tUOVLK9KVX4WCyyfXuFBZbpQutHoFjN6I7Fruy5yaW6F1EJsvbQ0_V7CuY7pwbRo9FcrMAIKyYUhLrI5BWNhP5zeK5Nslkb7Pyg1re9JFu09N7EZGwQOHm14ByFrybv3yL4HtRUjPOCBnfDSALbKZPWTnS7WcokK6q93LnXRydlND5R2TNl-wRF0SdOceSml3909afBHsPqUUNb2VIT8SsXFib6FlxkJUDkobjDn9Sg33VNJZH2Lpy3byigeIR-tByAFT3ur",
  },
];

type RecommendItem = {
  id: string;
  title: string;
  rating: string;
  tags: string[];
  description: string;
  image: string;
};

const recommendItems: RecommendItem[] = [
  {
    id: "recommend-1",
    title: "Forest Bathing Journey",
    rating: "4.9",
    tags: ["Wellness", "Nature"],
    description: "Experience the restorative power of Shinrin-yoku in cedar forests.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrCHhHm6E5pkpy2O-Ior709YtD483_zRTl3ZSmZrNzTovD8UD2I1XYY8tIc24WEcJAepyqvzifZ-K4Go2mykYfU38bC80HwEevi6Rb4_x_Cx0UfQyzloIgmrtJD1XKUB3mO3D5wLRqOc4f921FwlDapMb0pd64nTImMCqiypAPD_LZD4CTEG9xtBmRz9wt9P87LpO5rZv4kNdoEsVfBpfBoWrGq5KwL577IOg3-KFVXxnMrGaAA9Sj7ach_JYO3IibQ56pvTsjQT3Y",
  },
  {
    id: "recommend-2",
    title: "ネオン・シャドウ・ウォーク",
    rating: "4.8",
    tags: ["Urban", "Nightlife"],
    description: "夜の路地裏に隠された、もう一つの街の物語。",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2LmaVzfp5dRCkHZU2rHuqkpBz83zCanaiND0lfmSvitOTnvCHk4oaxODyrzxXTmx79LsCZe-RBVGm5AAJ21hvWHrJ59nEbck68SlkpM1v6OtQOyprubDAXmgletV2UON7z7znJOwlPd3YsYvFmazgCIhgKIoFgaxjAstoFkcO8WO4JgoaDdENnVQqQA82hFHxy5ND2bNMaTbOD267qoQqHhQzZqcIO9Pp9303fONKqKX9efILV2UYSwEac7sIR03kp0u_PvWaA6qP",
  },
];

type SeasonalItem = {
  id: string;
  badge: string;
  title: string;
  image: string;
};

const seasonalItems: SeasonalItem[] = [
  {
    id: "seasonal-1",
    badge: "Spring",
    title: "桜の小径を歩く",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLdSPvPwmNU-4AFF9rFpuApYru4FnHHZglWTGtob5xo8YujcqGEBLAl4rcDLFYN0qT7ra7KYMZenlLss4215LsVT4WjlyH-fL-5ae-NboTMfz78sOXwZYdLv6IMgH7sj5LRzHFgDNce_mg78rxLSX0I1VBz0O0eQR06hq0I4IRFkMH0KGrcmPdlQlmejionGIewT_Lylf334IggoI86wUfQx5MyAE47ZKit3euwI_D7rUY_Qoxa7Gq441gp_CrCNIdpvz1CEkgsxzE",
  },
  {
    id: "seasonal-2",
    badge: "Limited",
    title: "禅のリトリート",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAK9dNQtZGaA50Ug-7mXViBNOMivfNx-vNaEZzll0WtDpXNj68YBjm8NWw9st6QHB1Ab9Qm3Bt5pMQ0r0lkkG6bkFjMMko1hoV6_QBuQcF3zjy02pmACLsEbekaaCIesFYCP5QDB6p7alJmj1Xnt8I1w-LSm5DikBSgiNt4brET5SzHMhgQ_yGOnkpqij8irySZ__5gzLngCDZTxMFkPkKaKJ6NP2EMcBbPd9FABqju1F_Z4aFdD0J8IYHkZTNg8S4-eLLxPHEqDHzc",
  },
];

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const containerWidth = useMemo(() => Math.min(width - 32, 760), [width]);
  const featureCardWidth = useMemo(() => Math.max(320, Math.min(width * 0.84, 560)), [width]);
  const topBarHeight = insets.top + 64;

  const goSearch = () => {
    navigation.navigate("MainTabs", { screen: "Search" });
  };

  const goProfile = () => {
    navigation.navigate("MainTabs", { screen: "Profile" });
  };

  const goFeaturedCampaign = () => {
    navigation.navigate("FeaturedCampaign", { campaignId: featuredCampaign.id });
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}> 
          <View style={styles.topBarInner}>
            <Pressable onPress={goSearch} style={({ pressed }) => [styles.topIconButton, pressed && styles.pressed]}>
              <Ionicons name="search" size={22} color="#6f4a22" />
            </Pressable>

            <Text style={[styles.brand, { fontFamily: fonts.displayExtraBold }]}>TOMOSHIBI</Text>

            <Pressable onPress={goProfile} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
              <Image source={{ uri: profileAvatar }} style={styles.profileImage} resizeMode="cover" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topBarHeight + 20,
            paddingBottom: 130,
            alignItems: "center",
          }}
        >
          <View style={[styles.content, { width: containerWidth }]}> 
            <View style={styles.greetingSection}>
              <Text style={[styles.greetingMini, { fontFamily: fonts.bodyMedium }]}>ただいま</Text>
              <Text style={[styles.greetingMain, { fontFamily: fonts.displayExtraBold }]}>おはようございます、海斗さん</Text>
            </View>

            <View style={styles.searchRow}>
              <Pressable onPress={goSearch} style={({ pressed }) => [styles.searchField, pressed && styles.pressed]}>
                <Text style={[styles.searchPlaceholder, { fontFamily: fonts.bodyRegular }]}>体験を検索...</Text>
              </Pressable>
              <Pressable onPress={goSearch} style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
                <Ionicons name="map-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Pressable
                onPress={goFeaturedCampaign}
                style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}
              >
                <View style={styles.continueImageWrap}>
                  <Image source={{ uri: continueCardImage }} style={styles.continueImage} resizeMode="cover" />
                </View>
                <View style={styles.continueBody}>
                  <Text style={[styles.continueStatus, { fontFamily: fonts.displayBold }]}>進行中</Text>
                  <Text style={[styles.continueTitle, { fontFamily: fonts.bodyBold }]}>岩美駅の記憶を辿る</Text>
                  <Text style={[styles.continueDistance, { fontFamily: fonts.bodyRegular }]}>現在地から2.4km</Text>
                </View>
                <View style={styles.continuePlayButton}>
                  <Ionicons name="play" size={16} color={colors.onPrimary} />
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { fontFamily: fonts.displayBold }]}>特集記事</Text>
                <Pressable onPress={goSearch}>
                  <Text style={[styles.seeAllText, { fontFamily: fonts.displayBold }]}>すべて見る</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContainer}
              >
                {featureArticles.map((article) => (
                  <Pressable
                    key={article.id}
                    onPress={goSearch}
                    style={({ pressed }) => [styles.featureItem, { width: featureCardWidth }, pressed && styles.pressed]}
                  >
                    <View style={styles.featureImageWrap}>
                      <Image source={{ uri: article.image }} style={styles.featureImage} resizeMode="cover" />
                      <LinearGradient
                        colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.62)"]}
                        start={{ x: 0.5, y: 0.2 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.featureOverlay}>
                        <View style={styles.featureBadge}>
                          <Text style={[styles.featureBadgeText, { fontFamily: fonts.displayBold }]}>{article.badge}</Text>
                        </View>
                        <Text style={[styles.featureTitle, { fontFamily: fonts.displayBold }]} numberOfLines={2}>
                          {article.title}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.featureDescription, { fontFamily: fonts.bodyRegular }]}>{article.description}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, styles.sectionMargin, { fontFamily: fonts.displayBold }]}>近くで見つける</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContainer}
              >
                {nearbyItems.map((item) => (
                  <Pressable key={item.id} onPress={goSearch} style={({ pressed }) => [styles.nearbyCard, pressed && styles.pressed]}>
                    <View style={styles.nearbyImageWrap}>
                      <Image source={{ uri: item.image }} style={styles.nearbyImage} resizeMode="cover" />
                    </View>
                    <Text style={[styles.nearbyTitle, { fontFamily: fonts.bodyBold }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.nearbyMeta}>
                      <Ionicons name="navigate-outline" size={12} color={colors.onSurfaceVariant} />
                      <Text style={[styles.nearbyDistance, { fontFamily: fonts.bodyMedium }]}>{item.distance}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, styles.sectionMargin, { fontFamily: fonts.displayBold }]}>あなたへのおすすめ</Text>
              <View style={styles.recommendList}>
                {recommendItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={goSearch}
                    style={({ pressed }) => [styles.recommendCard, pressed && styles.pressed]}
                  >
                    <View style={styles.recommendImageWrap}>
                      <Image source={{ uri: item.image }} style={styles.recommendImage} resizeMode="cover" />
                    </View>
                    <View style={styles.recommendBody}>
                      <View style={styles.recommendTopRow}>
                        <Text style={[styles.recommendTitle, { fontFamily: fonts.bodyBold }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.ratingWrap}>
                          <Ionicons name="star" size={14} color={colors.primary} />
                          <Text style={[styles.ratingText, { fontFamily: fonts.displayBold }]}>{item.rating}</Text>
                        </View>
                      </View>
                      <View style={styles.tagRow}>
                        {item.tags.map((tag) => (
                          <View key={`${item.id}-${tag}`} style={styles.tagChip}>
                            <Text style={[styles.tagText, { fontFamily: fonts.displayBold }]}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={[styles.recommendDescription, { fontFamily: fonts.bodyRegular }]} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, styles.sectionMargin, { fontFamily: fonts.displayBold }]}>季節の体験</Text>
              <View style={styles.seasonalGrid}>
                {seasonalItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={goSearch}
                    style={({ pressed }) => [styles.seasonalCard, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: item.image }} style={styles.seasonalImage} resizeMode="cover" />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.48)"]}
                      start={{ x: 0.5, y: 0.2 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.seasonalOverlay}>
                      <Text style={[styles.seasonalBadge, { fontFamily: fonts.displayBold }]}>{item.badge}</Text>
                      <Text style={[styles.seasonalTitle, { fontFamily: fonts.bodyBold }]}>{item.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(248, 249, 250, 0.72)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(115,124,127,0.15)",
  },
  topBarInner: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topIconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 25,
    color: "#7a532a",
    letterSpacing: 2,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHighest,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 0,
  },
  greetingSection: {
    marginTop: 6,
    marginBottom: 18,
  },
  greetingMini: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  greetingMain: {
    fontSize: 31,
    lineHeight: 38,
    color: colors.onSurface,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },
  searchField: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "rgba(115,124,127,0.8)",
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  section: {
    marginBottom: 34,
  },
  continueCard: {
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: "rgba(171,179,183,0.22)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  continueImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainer,
  },
  continueImage: {
    width: "100%",
    height: "100%",
  },
  continueBody: {
    flex: 1,
  },
  continueStatus: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.primary,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  continueTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.onSurface,
    marginBottom: 2,
  },
  continueDistance: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  continuePlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: colors.onSurface,
    letterSpacing: -0.2,
  },
  sectionMargin: {
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.primary,
    textTransform: "uppercase",
  },
  horizontalContainer: {
    paddingRight: 10,
    gap: 18,
  },
  featureItem: {
    flexShrink: 0,
  },
  featureImageWrap: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHigh,
    marginBottom: 10,
  },
  featureImage: {
    width: "100%",
    height: "100%",
  },
  featureOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  featureBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 10,
  },
  featureBadgeText: {
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#ffffff",
  },
  featureTitle: {
    fontSize: 29,
    lineHeight: 34,
    color: "#ffffff",
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 2,
  },
  nearbyCard: {
    width: 178,
    flexShrink: 0,
  },
  nearbyImageWrap: {
    width: "100%",
    aspectRatio: 1.02,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: colors.surfaceContainerLow,
  },
  nearbyImage: {
    width: "100%",
    height: "100%",
  },
  nearbyTitle: {
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 4,
  },
  nearbyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  nearbyDistance: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  recommendList: {
    gap: 12,
  },
  recommendCard: {
    flexDirection: "row",
    gap: 14,
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  recommendImageWrap: {
    width: 96,
    height: 96,
    borderRadius: 10,
    overflow: "hidden",
  },
  recommendImage: {
    width: "100%",
    height: "100%",
  },
  recommendBody: {
    flex: 1,
    justifyContent: "center",
  },
  recommendTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  recommendTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: colors.primary,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surfaceContainerHighest,
  },
  tagText: {
    fontSize: 10,
    color: "#636769",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  recommendDescription: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  seasonalGrid: {
    flexDirection: "row",
    gap: 12,
  },
  seasonalCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
  },
  seasonalImage: {
    width: "100%",
    height: "100%",
  },
  seasonalOverlay: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  seasonalBadge: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.82)",
    marginBottom: 2,
  },
  seasonalTitle: {
    fontSize: 13,
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
