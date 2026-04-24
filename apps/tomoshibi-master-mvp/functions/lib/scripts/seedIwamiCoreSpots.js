"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("../firebase-admin");
const spotService_1 = require("../spots/spotService");
const STATIONS = [
    {
        stationId: "iwami-station",
        stationName: "岩美駅",
        lat: 35.574278,
        lng: 134.335478,
    },
    {
        stationId: "higashihama-station",
        stationName: "東浜駅",
        lat: 35.599471,
        lng: 134.362225,
    },
    {
        stationId: "oiwa-station",
        stationName: "大岩駅",
        lat: 35.56683,
        lng: 134.3084892,
    },
];
const SPOTS = [
    { slug: "iwami-tourism-association", nameJa: "岩美町観光協会", lat: 35.5738507, lng: 134.3351488, primaryCategory: "experience", stationAreaType: "iwami_station_area" },
    { slug: "kinanse-iwami-roadside-station", nameJa: "道の駅 きなんせ岩美", lat: 35.5675481, lng: 134.3259401, primaryCategory: "shop", stationAreaType: "none" },
    { slug: "uradome-coast", nameJa: "浦富海岸", lat: 35.590391, lng: 134.327783, primaryCategory: "see", stationAreaType: "none" },
    { slug: "sanin-geopark-nature-museum", nameJa: "山陰海岸ジオパーク海と大地の自然館", lat: 35.594872, lng: 134.340668, primaryCategory: "see", stationAreaType: "none" },
    { slug: "uradome-island-cruise", nameJa: "浦富海岸・島めぐり遊覧船", lat: 35.5795156, lng: 134.2978137, primaryCategory: "experience", stationAreaType: "none" },
    { slug: "iwai-onsen", nameJa: "岩井温泉", lat: 35.555556, lng: 134.361944, primaryCategory: "experience", stationAreaType: "none" },
    { slug: "iwai-yukamuri-onsen", nameJa: "岩井ゆかむり温泉", lat: 35.5554546, lng: 134.362327, primaryCategory: "experience", stationAreaType: "none" },
    { slug: "shirohara-coast", nameJa: "城原海岸", lat: 35.5908333, lng: 134.3077778, primaryCategory: "see", stationAreaType: "none" },
    { slug: "kamogaiso", nameJa: "鴨ヶ磯", lat: 35.5886111, lng: 134.3025, primaryCategory: "see", stationAreaType: "none" },
    { slug: "senganmatsushima", nameJa: "千貫松島", lat: 35.5863306, lng: 134.2914054, primaryCategory: "see", stationAreaType: "none" },
    { slug: "ryujindo", nameJa: "龍神洞", lat: 35.6058333, lng: 134.3408333, primaryCategory: "see", stationAreaType: "none" },
    { slug: "higashihama-observatory", nameJa: "東浜展望所", lat: 35.609318, lng: 134.370861, primaryCategory: "see", stationAreaType: "higashihama_station_area" },
    { slug: "iwami-station", nameJa: "岩美駅", lat: 35.574278, lng: 134.335478, primaryCategory: "see", stationAreaType: "iwami_station_area" },
    { slug: "higashihama-station", nameJa: "東浜駅", lat: 35.599471, lng: 134.362225, primaryCategory: "see", stationAreaType: "higashihama_station_area" },
    { slug: "oiwa-station", nameJa: "大岩駅", lat: 35.56683, lng: 134.3084892, primaryCategory: "see", stationAreaType: "oiwa_station_area" },
    { slug: "resthouse-roman", nameJa: "れすとはうすロマン", lat: 35.5744, lng: 134.335121, primaryCategory: "eat", stationAreaType: "iwami_station_area" },
    { slug: "ajiroya", nameJa: "あじろや", lat: 35.5795173, lng: 134.2977752, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "oshokujidokoro-hiyoshi", nameJa: "お食事処 日よし", lat: 35.589342, lng: 134.327498, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "higashihama-seaside-cafe", nameJa: "Beach Cafe & Outdoor ALOHA", lat: 35.602239, lng: 134.368259, primaryCategory: "eat", stationAreaType: "higashihama_station_area" },
    { slug: "al-mare", nameJa: "AL MARE", lat: 35.59026, lng: 134.381577, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "shungyo-tatsumi", nameJa: "旬魚たつみ", lat: 35.589872, lng: 134.327937, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "minato-cafe", nameJa: "港カフェ", lat: 35.5794273, lng: 134.298094, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "toujours", nameJa: "トゥジュール / TOUJOURS", lat: 35.5730201, lng: 134.3080836, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "kaiyotei-kinanse-iwami", nameJa: "天然海水いけす 海陽亭（きなんせ岩美店）", lat: 35.5676489, lng: 134.325749, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "iwami-obachan-chi", nameJa: "いわみのおばちゃん家（道の駅内）", lat: 35.5675481, lng: 134.3259401, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "sangenya", nameJa: "さんげんや", lat: 35.589328, lng: 134.321889, primaryCategory: "eat", stationAreaType: "none" },
    { slug: "seaside-uradome", nameJa: "シーサイドうらどめ", lat: 35.590036, lng: 134.327547, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "kamaya-ryokan", nameJa: "かまや旅館", lat: 35.586093, lng: 134.326886, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "beach-inn-takeso", nameJa: "ビーチインたけそう", lat: 35.590503, lng: 134.322194, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "minshuku-matsuso", nameJa: "民宿 松荘", lat: 35.59008987, lng: 134.3226699, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "retreat-inn-uradome", nameJa: "リトリート・イン浦富", lat: 35.589876, lng: 134.334129, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "ryujinso", nameJa: "龍神荘", lat: 35.604588, lng: 134.344181, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "iwaiya", nameJa: "岩井屋", lat: 35.555333, lng: 134.362867, primaryCategory: "stay", stationAreaType: "none" },
    { slug: "akashiya", nameJa: "明石家", lat: 35.55498987, lng: 134.362326, primaryCategory: "stay", stationAreaType: "none" },
];
function toRadians(deg) {
    return (deg * Math.PI) / 180;
}
function haversineMeters(a, b) {
    const earthRadius = 6371000;
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * earthRadius * Math.asin(Math.sqrt(h));
}
function inferAreaName(stationAreaType) {
    if (stationAreaType === "iwami_station_area")
        return "岩美駅周辺";
    if (stationAreaType === "higashihama_station_area")
        return "東浜駅周辺";
    if (stationAreaType === "oiwa_station_area")
        return "大岩駅周辺";
    return "岩美町";
}
function buildShortName(nameJa) {
    const noParen = nameJa.replace(/（[^）]*）/g, "").trim();
    return noParen.length > 0 ? noParen : nameJa;
}
function resolveNearestStation(seed) {
    if (seed.slug === "iwami-station") {
        return [
            {
                stationId: "iwami-station",
                stationName: "岩美駅",
                distanceMeters: 0,
                walkMinutes: 0,
            },
        ];
    }
    if (seed.slug === "higashihama-station") {
        return [
            {
                stationId: "higashihama-station",
                stationName: "東浜駅",
                distanceMeters: 0,
                walkMinutes: 0,
            },
        ];
    }
    if (seed.slug === "oiwa-station") {
        return [
            {
                stationId: "oiwa-station",
                stationName: "大岩駅",
                distanceMeters: 0,
                walkMinutes: 0,
            },
        ];
    }
    const nearest = STATIONS.map((station) => ({
        ...station,
        distanceMeters: haversineMeters({ lat: seed.lat, lng: seed.lng }, { lat: station.lat, lng: station.lng }),
    })).sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    if (!nearest)
        return [];
    return [
        {
            stationId: nearest.stationId,
            stationName: nearest.stationName,
            distanceMeters: Math.round(nearest.distanceMeters),
            walkMinutes: Math.max(1, Math.round(nearest.distanceMeters / 80)),
        },
    ];
}
function categoryDefaults(category) {
    if (category === "eat") {
        return {
            secondaryCategories: ["cafe"],
            tags: ["グルメ"],
            estimatedStayMinutesMin: 30,
            estimatedStayMinutesMax: 90,
            priceType: "paid",
            indoorOutdoor: "indoor",
            foodScore: 5,
            shoppingScore: 1,
            experienceScore: 2,
        };
    }
    if (category === "shop") {
        return {
            secondaryCategories: ["souvenir"],
            tags: ["買い物"],
            estimatedStayMinutesMin: 20,
            estimatedStayMinutesMax: 60,
            priceType: "purchase_optional",
            indoorOutdoor: "indoor",
            foodScore: 2,
            shoppingScore: 5,
            experienceScore: 2,
        };
    }
    if (category === "stay") {
        return {
            secondaryCategories: ["onsen"],
            tags: ["宿泊"],
            estimatedStayMinutesMin: 90,
            estimatedStayMinutesMax: 240,
            priceType: "paid",
            indoorOutdoor: "mixed",
            foodScore: 2,
            shoppingScore: 1,
            experienceScore: 4,
        };
    }
    if (category === "experience") {
        return {
            secondaryCategories: ["activity"],
            tags: ["体験"],
            estimatedStayMinutesMin: 40,
            estimatedStayMinutesMax: 120,
            priceType: "paid",
            indoorOutdoor: "mixed",
            foodScore: 1,
            shoppingScore: 1,
            experienceScore: 5,
        };
    }
    return {
        secondaryCategories: ["scenery"],
        tags: ["観光"],
        estimatedStayMinutesMin: 20,
        estimatedStayMinutesMax: 60,
        priceType: "free",
        indoorOutdoor: "outdoor",
        foodScore: 1,
        shoppingScore: 1,
        experienceScore: 3,
    };
}
function buildCreateInput(seed) {
    const shortName = buildShortName(seed.nameJa);
    const defaults = categoryDefaults(seed.primaryCategory);
    const stationAreaType = seed.stationAreaType ?? "none";
    const supportedTransports = seed.slug === "iwami-station" || seed.slug === "higashihama-station" || seed.slug === "oiwa-station"
        ? ["walk", "car", "bus", "train"]
        : ["walk", "car", "bus"];
    const nearestStations = resolveNearestStation(seed);
    const requiresFirstStop = seed.slug === "iwami-tourism-association";
    return {
        slug: seed.slug,
        nameJa: seed.nameJa,
        nameEn: null,
        shortName,
        status: "published",
        primaryCategory: seed.primaryCategory,
        secondaryCategories: defaults.secondaryCategories,
        tags: [...defaults.tags, shortName],
        location: {
            lat: seed.lat,
            lng: seed.lng,
            geohash: null,
            addressJa: "鳥取県岩美郡岩美町",
            areaName: inferAreaName(stationAreaType),
            stationAreaType,
        },
        nearestStations,
        descriptionShort: `${shortName}のスポットです。`,
        descriptionLong: `${shortName}の基本情報を登録した初期データです。詳細は運営画面から編集できます。`,
        heroImageUrl: null,
        galleryImageUrls: [],
        thumbnailUrl: null,
        websiteUrl: null,
        instagramUrl: null,
        phoneNumber: null,
        operatorName: null,
        business: {
            isAlwaysOpen: false,
            openingHoursText: null,
            regularHolidaysText: null,
            reservationRequired: false,
            lastEntryTime: null,
            estimatedStayMinutesMin: defaults.estimatedStayMinutesMin,
            estimatedStayMinutesMax: defaults.estimatedStayMinutesMax,
        },
        pricing: {
            priceType: defaults.priceType,
            priceLabel: null,
            priceMinYen: null,
            priceMaxYen: null,
        },
        access: {
            supportedTransports: [...supportedTransports],
            parkingAvailable: true,
            bikeParkingAvailable: true,
            busStopNearby: true,
            requiresFirstStop,
            requiredFirstStopReason: requiresFirstStop ? "rental_cycle_pickup" : null,
        },
        plannerAttributes: {
            themes: ["photo"],
            moodTags: ["first-pass"],
            weatherSuitability: {
                sunny: "good",
                cloudy: "ok",
                rainy: "ok",
                windy: "ok",
            },
            timeOfDaySuitability: ["morning", "daytime", "sunset"],
            visitPace: ["normal_stop"],
            withWho: ["solo", "friends", "couple", "family"],
            physicalLoad: "low",
            indoorOutdoor: defaults.indoorOutdoor,
            rainFallbackCandidate: seed.primaryCategory !== "see",
            photoSpotScore: 3,
            scenicScore: seed.primaryCategory === "see" ? 5 : 2,
            foodScore: defaults.foodScore,
            shoppingScore: defaults.shoppingScore,
            experienceScore: defaults.experienceScore,
            stationStopoverScore: stationAreaType === "none" ? 2 : 5,
            priorityScore: 70,
        },
        aiContext: {
            plannerSummary: `${shortName}の初期登録データです。`,
            whyVisit: [`${shortName}を立ち寄り候補に含めるための初期データです。`],
            bestFor: ["first-pass seed"],
            avoidIf: [],
            sampleUseCases: ["運営画面で詳細編集を行う前提の暫定登録"],
        },
        relatedSpotIds: [],
        campaignCompatible: false,
        couponCompatible: false,
        storyCompatible: false,
        source: "manual",
        lastReviewedAt: null,
    };
}
async function main() {
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    let createdCount = 0;
    let updatedCount = 0;
    for (const [index, seed] of SPOTS.entries()) {
        const existing = await (0, spotService_1.getSpotById)({ db, spotId: seed.slug });
        const shortName = buildShortName(seed.nameJa);
        if (existing) {
            await (0, spotService_1.updateSpot)({
                db,
                spotId: seed.slug,
                patch: {
                    nameJa: seed.nameJa,
                    shortName,
                    status: "published",
                    primaryCategory: seed.primaryCategory,
                    location: {
                        lat: seed.lat,
                        lng: seed.lng,
                        stationAreaType: seed.stationAreaType ?? existing.location.stationAreaType,
                    },
                },
            });
            updatedCount += 1;
            console.log(`[seedIwamiCoreSpots] updated ${seed.slug} (${index + 1}/${SPOTS.length})`);
            continue;
        }
        await (0, spotService_1.createSpot)({
            db,
            rawInput: buildCreateInput(seed),
        });
        createdCount += 1;
        console.log(`[seedIwamiCoreSpots] created ${seed.slug} (${index + 1}/${SPOTS.length})`);
    }
    console.log(`[seedIwamiCoreSpots] completed total=${SPOTS.length} created=${createdCount} updated=${updatedCount}`);
}
main().catch((error) => {
    console.error("[seedIwamiCoreSpots] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=seedIwamiCoreSpots.js.map