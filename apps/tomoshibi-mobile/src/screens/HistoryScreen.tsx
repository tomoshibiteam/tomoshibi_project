import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/theme/fonts";

/* ───────── palette ───────── */

const PRIMARY = "#934529";
const TERTIARY = "#7b5413";
const SECONDARY = "#516446";
const OUTLINE = "#88726c";
const OUTLINE_VARIANT = "#dbc1b9";
const ON_SURFACE = "#1c1c18";
const SURFACE_LOW = "#f6f3ec";
const SURFACE = "#fcf9f2";

/* ───────── floating steam orbs (consistent with Home) ───────── */

const steamOrbs: Array<{
  size: number;
  top: number;
  left?: number;
  right?: number;
  color: string;
}> = [
  { size: 260, top: -60, left: -110, color: "rgba(255,255,255,0.50)" },
  { size: 210, top: 200, right: -80, color: "rgba(250,240,226,0.52)" },
  { size: 230, top: 500, left: -96, color: "rgba(255,251,245,0.40)" },
  { size: 220, top: 820, right: -100, color: "rgba(241,228,208,0.42)" },
];

/* ───────── demo data ───────── */

type Episode = {
  id: string;
  no: number;
  title: string;
  location: string;
  date: string;
  thumb: string;
  status: "recording" | "complete";
  opacity?: number;
};

type SeriesPackage = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  fragments: number;
  regions: number;
  volumeLabel: string;
  episodes: Episode[];
  totalEpisodes: number;
};

type DraftEntry = {
  id: string;
  region: string;
  title: string;
  prompt: string;
};

const SERIES_DATA: SeriesPackage[] = [
  {
    id: "series-2",
    title: "風と水の記憶",
    subtitle: "鳥取県 • シリーズ",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-fhdOkiywkk3kprLNCgzPvxGYzaN-rcmhyH3lbK8FWt1Iec-7WAzGdV6ADCvrc0-2y0401Dnt8sCh7148IbyqQ0Us1-4kxu1Izuu7o9MtYIXx8RAqkrBU_4jG6QU_dJO9KoFpk7-C269jhy_q1uq6IyF1VSkdo_cB_hA44gInjj0r4Hgeckitq_EHI05SbWHBp6_og8r20Ys0ZsW0SFztZldTZ5Q0r9rOIfjlb6X0SeUrMpesrzxQSVHtHvKhysBWzuD3Z9GM0ww",
    icon: "water-outline",
    accentColor: PRIMARY,
    fragments: 4,
    regions: 2,
    volumeLabel: "第2巻 • 進行中",
    totalEpisodes: 4,
    episodes: [
      {
        id: "s2-ep3",
        no: 3,
        title: "山に隠された古の灯",
        location: "大山",
        date: "記録中...",
        thumb:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC10WHMz2E9h5hz4QBTOWwfAXupKeOYqxwlOJ_f7uc_HMenN2Pc0hsij7NJCGmbrNDKH1-RUQt7k5_Y3Ptie0d5D3f3rua4ZCLrunfG5oeLojkVpgMiem3z1kvX_by12m52BzRcYvLPAM-wq_w1e71WygMas36hVUHQ4kvblXNAjJdEzINjvvtPuQ3Zw9h14CGh4GLBTwYNQBdepVekKHPOe8n9Gjnbqv3vCuEsfGqEZfsLTnLVJghYymy8lPPJhUXVChNwnjc1AnI",
        status: "recording",
      },
      {
        id: "s2-ep2",
        no: 2,
        title: "波音に溶ける青の境界",
        location: "浦富海岸",
        date: "2024.03.16",
        thumb:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA1HciymAc_SfUEWo-lSrvNCq8GBMPMQF92kX4rpgC6yz46hm8kyUNbUe4sjz97oGslS51IQJREiRCDbqXlTn9w-jOtw_M4YvqASgNy0RXHHDtU8gCfJFchtq3CBbamyQ0fFaIwnwryXVa5UQo8y_DqkJ0HllgHbf0aCvTG2Lal4O_ug4CH97GCybxQ97vCn-Hm1lYR0bNxOsre-r2y1xKZKVYv8gjGrIPKvehdBVE-K2sjMNQoVvzPnGQUUaGCvo1YoX5kzFOkiFM",
        status: "complete",
      },
    ],
  },
  {
    id: "series-1",
    title: "手仕事の風景",
    subtitle: "京都市/徳島県 • シリーズ",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCC6ukWQRpuvopkrbZiNP9L5hHHM5b1S6dfZ3cZrqHPtG4321Qt2kdtE76DLdZpFl5gmbN-XmiOGD9-98WJbgrkdryj_MDO3pMZlSX6XyMK48RLnFG872MABAb9zpVzeC6NfZS-H_zVD_5q-HiWhP3eWRLclwqpwPKTZzzFC5UPcQNlQ2l-No3vdTGpDzAN5ymXogGspWjPsQ0Ri71rti46-LgZ1A0ZKz_3c383OkGxoRa0fGT6PS6URboiJicMPGX2E8ufPLP_yOA",
    icon: "construct-outline",
    accentColor: TERTIARY,
    fragments: 12,
    regions: 4,
    volumeLabel: "第1巻 • 完結",
    totalEpisodes: 12,
    episodes: [
      {
        id: "s1-ep4",
        no: 4,
        title: "灯火が繋ぐ、千年の技",
        location: "京都市",
        date: "2024.02.28",
        thumb:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuClA7PheFHfxFCIBTKxkAzzIxrSGpc1--eb87xh4jZhHeIzBZCTUCSzOzHlZUsBZyHEIJZPMNEv7E8yfcYQ5Nc3XBM4m6K4WW_Tkz6C11c1h4cuO21gZVRCcaHGP3_wqMIbUNoafz5mg6i_-RHJJcDa-oWBfpcyVQs_yl85_M0C58EXQ-QDVqtQPKiVnufsNozSOKvuTAoMe0jCIhBEgbOdVMdf0Cg7n_w8rPnt11SihUQ9kYK3N6tGC8_723MdjQqH84sNYfrR9Qo",
        status: "complete",
      },
      {
        id: "s1-ep1",
        no: 1,
        title: "藍が染まる、時の色",
        location: "徳島県",
        date: "2024.01.10",
        thumb:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8bha5ryZbywc07yHhgDyj3EwAFWfEylrNSje1-1HQh_b8NoQEYinJh50yPY3vdpAEU-B2vhA13Bao1ZMEBwqqMtJtcObRU-JLKlwoa0Daggq2wzttrlrXw9mmHOil82PEQvMqG_XqnCHFJ7dnL-Kt5-VQRM8JehXGQSM4qwDSlOzN9Jhwc6n7d_0LbIpl0nzfQRiV4Dp7kwCEuB5lERZ3zdXdt0qkI1oTAlRkoUVy_dipcckR6ITEgjAp3x_gqPidjYsndKb8xEc",
        status: "complete",
        opacity: 0.7,
      },
    ],
  },
];

const DRAFT_DATA: DraftEntry = {
  id: "draft-1",
  region: "石川県 • 新しい旅",
  title: "波の音と輪島塗",
  prompt: "新しいパッケージを開始しますか？",
};

const FILTER_CHIPS = ["すべて", "2024年", "鳥取県", "伝統工芸"];

/* ───────── sub-components ───────── */

const StatCard = ({
  icon,
  iconColor,
  value,
  label,
  highlight,
  appear,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  highlight?: boolean;
  appear: Animated.Value;
  delay: number;
}) => {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        highlight && styles.statCardHighlight,
        { opacity, transform: [{ scale }] },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={highlight ? "#fff" : iconColor}
        style={{ marginBottom: 6 }}
      />
      {highlight ? (
        <>
          <Text style={[styles.statTitleText, { fontFamily: fonts.displayExtraBold }]}>
            {value}
          </Text>
          <Text style={[styles.statLabelHighlight, { fontFamily: fonts.displayBold }]}>
            {label}
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.statValue, { fontFamily: fonts.displayExtraBold }]}>
            {value}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: fonts.displayBold }]}>
            {label}
          </Text>
        </>
      )}
    </Animated.View>
  );
};

const EpisodeRow = ({ ep, isFirst }: { ep: Episode; isFirst: boolean }) => {
  const isRecording = ep.status === "recording";
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isRecording) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isRecording, pulseAnim, glowAnim]);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.episodeRow,
        !isFirst && styles.episodeRowBorder,
        ep.opacity != null && { opacity: ep.opacity },
        pressed && styles.episodeRowPressed,
      ]}
    >
      {/* thumbnail */}
      <View style={styles.episodeThumbWrap}>
        {isRecording && (
          <Animated.View
            style={[
              styles.episodeThumbGlow,
              { opacity: glowAnim, transform: [{ scale: glowScale }] },
            ]}
          />
        )}
        <Image
          source={{ uri: ep.thumb }}
          style={[
            styles.episodeThumb,
            !isRecording && { opacity: 0.82 },
          ]}
          resizeMode="cover"
        />
        <View
          style={[
            styles.episodeBadge,
            isRecording ? styles.episodeBadgeActive : styles.episodeBadgeDefault,
          ]}
        >
          <Text
            style={[
              styles.episodeBadgeText,
              { fontFamily: fonts.displayExtraBold, color: isRecording ? "#fff" : ON_SURFACE },
            ]}
          >
            Ep. {String(ep.no).padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* text */}
      <View style={styles.episodeBody}>
        <Text
          style={[
            styles.episodeTitle,
            { fontFamily: fonts.roundedBold, opacity: isRecording ? 1 : 0.78 },
          ]}
          numberOfLines={1}
        >
          {ep.title}
        </Text>
        <Text
          style={[
            styles.episodeLocation,
            {
              fontFamily: isRecording ? fonts.displayBold : fonts.bodyMedium,
              color: isRecording ? PRIMARY : OUTLINE,
            },
          ]}
        >
          {ep.location} • {ep.date}
        </Text>
      </View>

      {/* status icon */}
      {isRecording ? (
        <Animated.View style={{ opacity: pulseAnim }}>
          <Ionicons name="radio-button-on" size={20} color={PRIMARY} />
        </Animated.View>
      ) : (
        <Ionicons name="checkmark-circle" size={20} color={SECONDARY} style={{ opacity: 0.7 }} />
      )}
    </Pressable>
  );
};

const SeriesCard = ({
  series,
  index,
  appear,
}: {
  series: SeriesPackage;
  index: number;
  appear: Animated.Value;
}) => {
  const isFirst = index === 0;

  const translateY = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });

  const cardScale = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
  });

  return (
    <Animated.View
      style={[
        styles.seriesWrap,
        { opacity: appear, transform: [{ translateY }, { scale: cardScale }] },
      ]}
    >
      {/* Journey node */}
      <View
        style={[
          styles.journeyNode,
          isFirst && styles.journeyNodeGlow,
          !isFirst && { backgroundColor: OUTLINE },
        ]}
      />
      {/* Outer glow ring for active node */}
      {isFirst && <View style={styles.journeyNodeRing} />}

      {/* Card */}
      <View style={[styles.seriesCard, !isFirst && styles.seriesCardOlder]}>
        {/* Cover */}
        <View style={styles.seriesCoverWrap}>
          <Image
            source={{ uri: series.coverImage }}
            style={[styles.seriesCoverImage, !isFirst && { opacity: 0.88 }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)", "rgba(35,14,7,0.78)"]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* steam puffs on cover */}
          <View style={styles.coverSteamStrip} pointerEvents="none">
            <View style={[styles.coverSteamPuff, { width: 100, left: -10, opacity: 0.6 }]} />
            <View style={[styles.coverSteamPuff, { width: 120, left: 70, opacity: 0.5 }]} />
            <View style={[styles.coverSteamPuff, { width: 110, left: 180, opacity: 0.55 }]} />
          </View>
          <View style={styles.seriesCoverContent}>
            <View
              style={[
                styles.seriesIconCircle,
                { borderColor: series.accentColor },
              ]}
            >
              <View
                style={[
                  styles.seriesIconInner,
                  { backgroundColor: `${series.accentColor}18` },
                ]}
              >
                <Ionicons name={series.icon} size={22} color={series.accentColor} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.seriesSubtitle, { fontFamily: fonts.displayExtraBold }]}>
                {series.subtitle}
              </Text>
              <Text style={[styles.seriesTitle, { fontFamily: fonts.roundedBold }]}>
                {series.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.seriesBody}>
          {/* Meta row */}
          <View style={styles.seriesMetaRow}>
            <View style={styles.seriesMetaStats}>
              <View style={styles.seriesMetaStat}>
                <Text style={[styles.seriesMetaValue, { fontFamily: fonts.displayExtraBold }]}>
                  {String(series.fragments).padStart(2, "0")}
                </Text>
                <Text style={[styles.seriesMetaLabel, { fontFamily: fonts.bodyMedium }]}>
                  断片
                </Text>
              </View>
              <View style={styles.seriesMetaDivider} />
              <View style={styles.seriesMetaStat}>
                <Text style={[styles.seriesMetaValue, { fontFamily: fonts.displayExtraBold }]}>
                  {String(series.regions).padStart(2, "0")}
                </Text>
                <Text style={[styles.seriesMetaLabel, { fontFamily: fonts.bodyMedium }]}>
                  地域
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.volumeBadge,
                { backgroundColor: `${series.accentColor}0C` },
              ]}
            >
              <Text
                style={[
                  styles.volumeBadgeText,
                  { fontFamily: fonts.displayBold, color: series.accentColor },
                ]}
              >
                {series.volumeLabel}
              </Text>
            </View>
          </View>

          {/* Episodes */}
          {series.episodes.map((ep, epIdx) => (
            <EpisodeRow key={ep.id} ep={ep} isFirst={epIdx === 0} />
          ))}

          {/* Show more */}
          {series.totalEpisodes > series.episodes.length && (
            <View style={styles.showMoreWrap}>
              <Pressable
                style={({ pressed }) => [
                  styles.showMoreButton,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.showMoreText,
                    {
                      fontFamily: fonts.displayExtraBold,
                      color: isFirst ? PRIMARY : OUTLINE,
                    },
                  ]}
                >
                  {isFirst
                    ? "パッケージの詳細を表示"
                    : `全${series.totalEpisodes}エピソードを表示`}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={isFirst ? PRIMARY : OUTLINE}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

/* ───────── main screen ───────── */

export const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchText, setSearchText] = useState("");

  /* entrance animations */
  const headerAppear = useRef(new Animated.Value(0)).current;
  const statsAppear = useRef(new Animated.Value(0)).current;
  const filterAppear = useRef(new Animated.Value(0)).current;
  const seriesAppearValues = useMemo(
    () => SERIES_DATA.map(() => new Animated.Value(0)),
    []
  );
  const draftAppear = useRef(new Animated.Value(0)).current;

  /* steam breathing */
  const steamAnimations = useMemo(() => steamOrbs.map(() => new Animated.Value(0)), []);

  /* dot texture */
  const textureDots = useMemo(() => {
    const columns = 7;
    const gapX = Math.max(30, Math.floor(width / columns));
    return Array.from({ length: 42 }, (_, i) => ({
      id: `dot-${i}`,
      top: Math.floor(i / columns) * 52 + ((Math.floor(i / columns)) % 2 === 0 ? 6 : 20),
      left: (i % columns) * gapX + ((Math.floor(i / columns)) % 2 === 0 ? 8 : 20),
      size: i % 3 === 0 ? 2 : 1,
      opacity: i % 3 === 0 ? 0.16 : 0.11,
    }));
  }, [width]);

  useEffect(() => {
    /* steam orb breathing loops */
    const steamLoops = steamAnimations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3400 + i * 380,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3200 + i * 420,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );
    steamLoops.forEach((loop) => loop.start());

    /* staged entrance */
    Animated.stagger(120, [
      Animated.timing(headerAppear, {
        toValue: 1,
        duration: 660,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(statsAppear, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(filterAppear, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      ...seriesAppearValues.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 580,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ),
      Animated.timing(draftAppear, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      steamLoops.forEach((loop) => loop.stop());
    };
  }, [headerAppear, statsAppear, filterAppear, seriesAppearValues, draftAppear, steamAnimations]);

  const headerTranslateY = headerAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const headerHeight = insets.top + 64;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#fcf9f2", "#f6f1e8", "#fcf9f2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* dot texture */}
      <View style={styles.textureLayer} pointerEvents="none">
        {textureDots.map((d) => (
          <View
            key={d.id}
            style={{
              position: "absolute",
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: d.size,
              backgroundColor: `rgba(155,114,90,${d.opacity})`,
            }}
          />
        ))}
      </View>

      {/* floating steam orbs */}
      {steamOrbs.map((orb, i) => {
        const steam = steamAnimations[i];
        const tY = steam.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -14 - i * 3],
        });
        const op = steam.interpolate({
          inputRange: [0, 1],
          outputRange: [0.18, 0.38],
        });
        return (
          <Animated.View
            key={`steam-${i}`}
            pointerEvents="none"
            style={[
              styles.steamOrb,
              {
                width: orb.size,
                height: orb.size,
                top: orb.top,
                left: orb.left,
                right: orb.right,
                backgroundColor: orb.color,
                opacity: op,
                transform: [{ translateY: tY }],
              },
            ]}
          />
        );
      })}

      {/* top app bar */}
      <View style={[styles.topAppBar, { paddingTop: insets.top }]}>
        <View style={styles.topAppBarInner}>
          <Pressable
            style={({ pressed }) => [styles.iconCircle, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="menu-outline" size={22} color={PRIMARY} />
          </Pressable>
          <Text style={[styles.brandName, { fontFamily: fonts.roundedBold }]}>TOMOSHIBI</Text>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={16} color={PRIMARY} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + 10,
          paddingBottom: 148,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={{
            opacity: headerAppear,
            transform: [{ translateY: headerTranslateY }],
            marginBottom: 22,
          }}
        >
          <Text style={[styles.pageTitle, { fontFamily: fonts.roundedBold }]}>
            物語の軌跡
          </Text>
          <Text style={[styles.pageSubtitle, { fontFamily: fonts.displayExtraBold }]}>
            ARCHIVE OF MEMORIES
          </Text>
        </Animated.View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="book-outline"
            iconColor={PRIMARY}
            value="24"
            label="断片"
            appear={statsAppear}
            delay={200}
          />
          <StatCard
            icon="map-outline"
            iconColor={TERTIARY}
            value="08"
            label="地域"
            appear={statsAppear}
            delay={300}
          />
          <StatCard
            icon="ribbon-outline"
            iconColor="#fff"
            value="探索者"
            label="ランク"
            highlight
            appear={statsAppear}
            delay={400}
          />
        </View>

        {/* ── Search & Filters ── */}
        <Animated.View
          style={{
            opacity: filterAppear,
            marginBottom: 30,
            transform: [
              {
                translateY: filterAppear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.searchWrap}>
            <Ionicons
              name="search-outline"
              size={18}
              color="rgba(136,114,108,0.55)"
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="記憶を辿る..."
              placeholderTextColor="rgba(136,114,108,0.38)"
              style={[styles.searchInput, { fontFamily: fonts.bodyMedium }]}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {FILTER_CHIPS.map((chip, i) => (
              <Pressable
                key={chip}
                style={({ pressed }) => [
                  styles.chip,
                  i === activeFilter && styles.chipActive,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
                onPress={() => setActiveFilter(i)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      fontFamily: fonts.displayExtraBold,
                      color: i === activeFilter ? "#fff" : ON_SURFACE,
                    },
                  ]}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Timeline ── */}
        <View style={styles.timelineWrap}>
          {/* Journey line */}
          <View style={styles.journeyLineContainer}>
            <LinearGradient
              colors={[
                "rgba(147,69,41,0.25)",
                "rgba(147,69,41,0.6)",
                PRIMARY,
                PRIMARY,
                "rgba(147,69,41,0.6)",
                "rgba(147,69,41,0.25)",
              ]}
              locations={[0, 0.06, 0.14, 0.86, 0.94, 1]}
              style={styles.journeyLine}
            />
            {/* Subtle glow behind the line */}
            <View style={styles.journeyLineGlow} />
          </View>

          {/* Series cards */}
          {SERIES_DATA.map((series, idx) => (
            <SeriesCard
              key={series.id}
              series={series}
              index={idx}
              appear={seriesAppearValues[idx]}
            />
          ))}

          {/* Draft entry */}
          <Animated.View
            style={[
              styles.draftWrap,
              {
                opacity: draftAppear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.72],
                }),
                transform: [
                  {
                    translateY: draftAppear.interpolate({
                      inputRange: [0, 1],
                      outputRange: [22, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.journeyNodeSmall} />
            <Pressable
              style={({ pressed }) => [
                styles.draftCard,
                pressed && { borderColor: PRIMARY, opacity: 0.85 },
              ]}
            >
              <View style={styles.draftHeader}>
                <Text style={[styles.draftRegion, { fontFamily: fonts.displayExtraBold }]}>
                  {DRAFT_DATA.region}
                </Text>
                <View style={styles.draftBadge}>
                  <Text style={[styles.draftBadgeText, { fontFamily: fonts.displayBold }]}>
                    下書き
                  </Text>
                </View>
              </View>
              <Text style={[styles.draftTitle, { fontFamily: fonts.roundedBold }]}>
                {DRAFT_DATA.title}
              </Text>
              <Text style={[styles.draftPrompt, { fontFamily: fonts.bodyRegular }]}>
                {DRAFT_DATA.prompt}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: 110 + insets.bottom },
          pressed && { transform: [{ scale: 0.9 }, { rotate: "90deg" }], opacity: 0.9 },
        ]}
      >
        <LinearGradient
          colors={[PRIMARY, "#7a3820"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
};

/* ───────── styles ───────── */

const JOURNEY_LEFT = 24;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.62,
  },
  scroll: {
    flex: 1,
  },
  steamOrb: {
    position: "absolute",
    borderRadius: 999,
  },

  /* top bar */
  topAppBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "rgba(252,249,242,0.88)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(219,193,185,0.16)",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    color: PRIMARY,
    letterSpacing: 0.35,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(147,69,41,0.18)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(147,69,41,0.05)",
  },

  /* header */
  pageTitle: {
    fontSize: 28,
    color: PRIMARY,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 9,
    color: OUTLINE,
    letterSpacing: 3.5,
    textTransform: "uppercase",
    opacity: 0.65,
  },

  /* stats */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: SURFACE_LOW,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(219,193,185,0.12)",
    shadowColor: "#1c1c18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHighlight: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  statValue: {
    fontSize: 26,
    color: ON_SURFACE,
    lineHeight: 30,
  },
  statLabel: {
    fontSize: 8,
    color: OUTLINE,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  statTitleText: {
    fontSize: 12,
    color: "#fff",
    letterSpacing: -0.2,
    textTransform: "uppercase",
  },
  statLabelHighlight: {
    fontSize: 8,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginTop: 3,
  },

  /* search */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(246,243,236,0.55)",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(219,193,185,0.18)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    height: 50,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: ON_SURFACE,
  },
  chipScroll: {
    flexDirection: "row",
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(219,193,185,0.28)",
    marginRight: 9,
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  chipText: {
    fontSize: 11,
  },

  /* timeline */
  timelineWrap: {
    position: "relative",
    paddingLeft: JOURNEY_LEFT + 18,
  },
  journeyLineContainer: {
    position: "absolute",
    left: JOURNEY_LEFT,
    top: 0,
    bottom: 0,
    width: 2,
  },
  journeyLine: {
    flex: 1,
    width: 2,
    borderRadius: 1,
  },
  journeyLineGlow: {
    position: "absolute",
    left: -3,
    top: 0,
    bottom: 0,
    width: 8,
    borderRadius: 4,
    backgroundColor: "rgba(147,69,41,0.06)",
  },

  /* journey nodes */
  journeyNode: {
    position: "absolute",
    left: -(JOURNEY_LEFT + 18) + JOURNEY_LEFT - 5,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: SURFACE,
    zIndex: 20,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  journeyNodeGlow: {
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  journeyNodeRing: {
    position: "absolute",
    left: -(JOURNEY_LEFT + 18) + JOURNEY_LEFT - 9,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(147,69,41,0.15)",
    zIndex: 19,
  },
  journeyNodeSmall: {
    position: "absolute",
    left: -(JOURNEY_LEFT + 18) + JOURNEY_LEFT - 3,
    bottom: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: OUTLINE_VARIANT,
    borderWidth: 2,
    borderColor: SURFACE,
    zIndex: 20,
  },

  /* series */
  seriesWrap: {
    marginBottom: 56,
    position: "relative",
  },
  seriesCard: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: OUTLINE,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  },
  seriesCardOlder: {
    borderColor: "rgba(136,114,108,0.5)",
    shadowOpacity: 0.05,
  },
  seriesCoverWrap: {
    height: 180,
    overflow: "hidden",
  },
  seriesCoverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverSteamStrip: {
    position: "absolute",
    left: -14,
    right: -14,
    bottom: -60,
    height: 110,
  },
  coverSteamPuff: {
    position: "absolute",
    bottom: 0,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  seriesCoverContent: {
    position: "absolute",
    bottom: 18,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  seriesIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    padding: 2,
  },
  seriesIconInner: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  seriesSubtitle: {
    fontSize: 9,
    color: "rgba(255,255,255,0.88)",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  seriesTitle: {
    fontSize: 21,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  seriesBody: {
    padding: 22,
    paddingTop: 16,
  },
  seriesMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(219,193,185,0.18)",
  },
  seriesMetaStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  seriesMetaStat: {
    alignItems: "flex-start",
  },
  seriesMetaValue: {
    fontSize: 11,
    color: OUTLINE,
    letterSpacing: -0.5,
  },
  seriesMetaLabel: {
    fontSize: 8,
    color: OUTLINE,
    opacity: 0.55,
  },
  seriesMetaDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(219,193,185,0.28)",
  },
  volumeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  volumeBadgeText: {
    fontSize: 10,
  },

  /* episodes */
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 14,
    borderRadius: 12,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  episodeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(219,193,185,0.10)",
  },
  episodeRowPressed: {
    backgroundColor: "rgba(147,69,41,0.04)",
  },
  episodeThumbWrap: {
    position: "relative",
  },
  episodeThumbGlow: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 15,
    backgroundColor: "rgba(147,69,41,0.12)",
  },
  episodeThumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(219,193,185,0.28)",
  },
  episodeBadge: {
    position: "absolute",
    top: -5,
    left: -5,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  episodeBadgeActive: {
    backgroundColor: PRIMARY,
  },
  episodeBadgeDefault: {
    backgroundColor: "#e5e2db",
  },
  episodeBadgeText: {
    fontSize: 8,
  },
  episodeBody: {
    flex: 1,
    minWidth: 0,
  },
  episodeTitle: {
    fontSize: 14,
    color: ON_SURFACE,
    marginBottom: 3,
  },
  episodeLocation: {
    fontSize: 10,
  },

  /* show more */
  showMoreWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(219,193,185,0.25)",
    borderStyle: "dashed",
    alignItems: "center",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  showMoreText: {
    fontSize: 9,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },

  /* draft */
  draftWrap: {
    position: "relative",
    paddingLeft: 4,
  },
  draftCard: {
    borderWidth: 1.5,
    borderColor: "rgba(219,193,185,0.55)",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    backgroundColor: "rgba(246,243,236,0.45)",
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  draftRegion: {
    fontSize: 9,
    color: OUTLINE,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  draftBadge: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(219,193,185,0.22)",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 5,
  },
  draftBadgeText: {
    fontSize: 8,
    color: OUTLINE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  draftTitle: {
    fontSize: 15,
    color: ON_SURFACE,
    marginBottom: 5,
  },
  draftPrompt: {
    fontSize: 11,
    color: "#55433d",
    fontStyle: "italic",
    lineHeight: 17,
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 22,
    width: 62,
    height: 62,
    borderRadius: 20,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 40,
    overflow: "hidden",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
});
