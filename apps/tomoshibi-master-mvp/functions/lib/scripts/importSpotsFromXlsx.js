"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx_1 = require("xlsx");
const promises_1 = require("node:fs/promises");
const firebase_admin_1 = require("../firebase-admin");
const spotModel_1 = require("../spots/spotModel");
const spotRepository_1 = require("../spots/spotRepository");
const spotConstants_1 = require("../spots/spotConstants");
const DEFAULT_XLSX_PATH = "/Users/wataru/Downloads/iwami_spots_50.xlsx";
const DEFAULT_SHEET_NAME = "spots";
function asTrimmedString(value) {
    if (value == null)
        return null;
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    return null;
}
function asOptionalUrl(value) {
    const text = asTrimmedString(value);
    if (!text)
        return null;
    try {
        const url = new URL(text);
        return url.toString();
    }
    catch {
        return null;
    }
}
function asBoolean(value, fallback = false) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "y", "on"].includes(normalized))
            return true;
        if (["false", "0", "no", "n", "off", ""].includes(normalized))
            return false;
    }
    return fallback;
}
function asNumber(value, fallback = null) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    const text = asTrimmedString(value);
    if (!text)
        return fallback;
    const normalized = text.replace(/,/g, "");
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed))
        return fallback;
    return parsed;
}
function splitMulti(value) {
    const text = asTrimmedString(value);
    if (!text)
        return [];
    return text
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}
function unique(values) {
    return [...new Set(values)];
}
function parseNearestStations(value) {
    const items = splitMulti(value);
    if (items.length === 0)
        return [];
    return items
        .map((item) => {
        const [stationIdRaw, stationNameRaw, distanceRaw, walkRaw] = item.split(",").map((part) => part.trim());
        const stationId = stationIdRaw && stationIdRaw.length > 0 ? stationIdRaw : null;
        const stationName = stationNameRaw && stationNameRaw.length > 0 ? stationNameRaw : null;
        if (!stationId || !stationName)
            return null;
        const distanceMeters = Number(distanceRaw);
        const walkMinutes = Number(walkRaw);
        return {
            stationId,
            stationName,
            distanceMeters: Number.isFinite(distanceMeters) && distanceMeters >= 0 ? distanceMeters : 0,
            walkMinutes: Number.isFinite(walkMinutes) && walkMinutes >= 0 ? walkMinutes : 0,
        };
    })
        .filter((item) => Boolean(item));
}
function asEnum(value, allowed, fallback) {
    const text = asTrimmedString(value);
    if (!text)
        return fallback;
    if (allowed.includes(text))
        return text;
    return fallback;
}
function parseWeeklyHours(value) {
    const text = asTrimmedString(value);
    if (!text)
        return undefined;
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object")
            return parsed;
        return undefined;
    }
    catch {
        return undefined;
    }
}
function clampScore(value) {
    if (!Number.isFinite(value))
        return 1;
    if (value < 1)
        return 1;
    if (value > 5)
        return 5;
    return Math.round(value);
}
function includesKeyword(values, keywords) {
    const joined = values.join(" ").toLowerCase();
    return keywords.some((keyword) => joined.includes(keyword.toLowerCase()));
}
function estimateIndoorOutdoor(category, secondary, themes) {
    const outdoorHint = secondary.some((item) => ["scenery", "beach"].includes(item)) || themes.includes("sea_view");
    if (outdoorHint)
        return "outdoor";
    if (category === "eat" || category === "shop" || category === "stay")
        return "indoor";
    return "mixed";
}
function estimatePhysicalLoad(category, secondary) {
    if (secondary.includes("beach") || secondary.includes("activity"))
        return "medium";
    if (category === "experience")
        return "medium";
    return "low";
}
function estimateVisitPace(minStay, maxStay) {
    if (maxStay <= 30)
        return ["short_stop"];
    if (minStay >= 90)
        return ["long_stay"];
    return ["normal_stop"];
}
function estimateScores(params) {
    const { category, secondary, themes, tags, stationAreaType } = params;
    const photoSpotScore = clampScore((themes.includes("photo") ? 5 : 0) + (includesKeyword(tags, ["写真", "映え", "絶景"]) ? 4 : 2));
    const scenicScore = clampScore(category === "see" || secondary.some((item) => ["scenery", "beach"].includes(item)) || themes.includes("sea_view")
        ? 5
        : 2);
    const foodScore = clampScore(category === "eat" ? 5 : themes.includes("seafood") || includesKeyword(tags, ["食", "海鮮", "グルメ"]) ? 4 : 1);
    const shoppingScore = clampScore(category === "shop" || secondary.includes("souvenir") || themes.includes("shopping") ? 5 : 1);
    const experienceScore = clampScore(category === "experience" || themes.includes("activity") ? 5 : 2);
    const stationStopoverScore = clampScore(stationAreaType !== "none" || themes.includes("station_stopover") ? 5 : 2);
    const average = (photoSpotScore + scenicScore + foodScore + shoppingScore + experienceScore + stationStopoverScore) / 6;
    const priorityScore = Math.round(average * 20);
    return {
        photoSpotScore,
        scenicScore,
        foodScore,
        shoppingScore,
        experienceScore,
        stationStopoverScore,
        priorityScore,
    };
}
function mapWithWhoToLabels(withWho) {
    const labelMap = {
        solo: "一人旅",
        friends: "友人旅",
        couple: "カップル旅",
        family: "家族旅",
    };
    return withWho.map((item) => labelMap[item]);
}
function buildAiContext(params) {
    const { nameJa, descriptionShort, tags, withWho, weatherRainy, themes } = params;
    const tagUseCases = tags.slice(0, 3).map((tag) => `${tag}を楽しみたい人`);
    return {
        plannerSummary: descriptionShort || `${nameJa}を楽しめるスポット。`,
        whyVisit: tags.length > 0 ? tags.slice(0, 4).map((tag) => `${tag}を体験しやすい`) : [descriptionShort],
        bestFor: mapWithWhoToLabels(withWho),
        avoidIf: weatherRainy === "bad" ? ["雨天中心の行程"] : [],
        sampleUseCases: tagUseCases.length > 0
            ? tagUseCases
            : themes.slice(0, 2).map((theme) => `${theme}を重視した回遊`) || [`${nameJa}への立寄り`],
    };
}
function normalizeStationId(stationId) {
    return stationId.replace(/_/g, "-");
}
function buildSpotFromRow(row, rowNumber) {
    const nameJa = asTrimmedString(row.nameJa);
    const slug = asTrimmedString(row.slug);
    if (!nameJa || !slug) {
        throw new Error(`row ${rowNumber}: nameJa and slug are required`);
    }
    const primaryCategory = asEnum(row.primaryCategory, spotConstants_1.SPOT_PRIMARY_CATEGORY_VALUES, "see");
    const secondaryCategories = unique(splitMulti(row.secondaryCategories));
    const tags = unique(splitMulti(row.tags));
    const themes = unique(splitMulti(row.themes));
    const moodTags = unique(splitMulti(row.moodTags));
    const weatherSunny = asEnum(row.weatherSunny, spotConstants_1.SPOT_WEATHER_RATING_VALUES, "good");
    const weatherCloudy = asEnum(row.weatherCloudy, spotConstants_1.SPOT_WEATHER_RATING_VALUES, "good");
    const weatherRainy = asEnum(row.weatherRainy, spotConstants_1.SPOT_WEATHER_RATING_VALUES, "ok");
    const weatherWindy = asEnum(row.weatherWindy, spotConstants_1.SPOT_WEATHER_RATING_VALUES, "ok");
    const timeOfDaySuitability = unique(splitMulti(row.timeOfDaySuitability).filter((item) => spotConstants_1.SPOT_TIME_OF_DAY_VALUES.includes(item)));
    const withWho = unique(splitMulti(row.withWho).filter((item) => spotConstants_1.SPOT_WITH_WHO_VALUES.includes(item)));
    const supportedTransports = unique(splitMulti(row.supportedTransports).filter((item) => spotConstants_1.SPOT_TRANSPORT_VALUES.includes(item)));
    const stationAreaType = asEnum(row.stationAreaType, spotConstants_1.SPOT_STATION_AREA_TYPE_VALUES, "none");
    const estimatedStayMinutesMin = Math.max(1, Math.round(asNumber(row.estimatedStayMinutesMin, 30) ?? 30));
    const estimatedStayMinutesMax = Math.max(estimatedStayMinutesMin, Math.round(asNumber(row.estimatedStayMinutesMax, Math.max(estimatedStayMinutesMin, 60)) ?? Math.max(estimatedStayMinutesMin, 60)));
    const visitPaceFromSheet = unique(splitMulti(row.visitPace).filter((item) => spotConstants_1.SPOT_VISIT_PACE_VALUES.includes(item)));
    const visitPace = visitPaceFromSheet.length > 0 ? visitPaceFromSheet : estimateVisitPace(estimatedStayMinutesMin, estimatedStayMinutesMax);
    const physicalLoadFromSheet = asTrimmedString(row.physicalLoad);
    const physicalLoad = (physicalLoadFromSheet && spotConstants_1.SPOT_PHYSICAL_LOAD_VALUES.includes(physicalLoadFromSheet)
        ? physicalLoadFromSheet
        : estimatePhysicalLoad(primaryCategory, secondaryCategories));
    const indoorOutdoor = estimateIndoorOutdoor(primaryCategory, secondaryCategories, themes);
    const scores = estimateScores({
        category: primaryCategory,
        secondary: secondaryCategories,
        themes,
        tags,
        stationAreaType,
    });
    const nearestStations = parseNearestStations(row.nearestStations).map((station) => ({
        ...station,
        stationId: normalizeStationId(station.stationId),
    }));
    const requiresFirstStop = asBoolean(row.requiresFirstStop, false);
    const requiredFirstStopReasonText = asTrimmedString(row.requiredFirstStopReason);
    const requiredFirstStopReason = (() => {
        if (!requiresFirstStop)
            return null;
        if (requiredFirstStopReasonText && spotConstants_1.SPOT_REQUIRED_FIRST_STOP_REASON_VALUES.includes(requiredFirstStopReasonText)) {
            return requiredFirstStopReasonText;
        }
        if (requiredFirstStopReasonText) {
            console.warn(`[importSpotsFromXlsx] row ${rowNumber}: requiredFirstStopReason "${requiredFirstStopReasonText}" is not in enum. mapped to "other".`);
        }
        else {
            console.warn(`[importSpotsFromXlsx] row ${rowNumber}: requiredFirstStopReason is empty. mapped to "other".`);
        }
        return "other";
    })();
    const parsed = {
        id: slug,
        slug,
        nameJa,
        nameEn: asTrimmedString(row.nameEn),
        shortName: asTrimmedString(row.shortName) ?? nameJa,
        status: asEnum(row.status, spotConstants_1.SPOT_STATUS_VALUES, "published"),
        primaryCategory,
        secondaryCategories,
        tags,
        location: {
            lat: asNumber(row.lat, 0) ?? 0,
            lng: asNumber(row.lng, 0) ?? 0,
            geohash: asTrimmedString(row.geohash),
            addressJa: asTrimmedString(row.addressJa) ?? "住所未設定",
            areaName: asTrimmedString(row.areaName),
            stationAreaType,
        },
        nearestStations,
        descriptionShort: asTrimmedString(row.descriptionShort) ?? `${nameJa}の見どころスポット`,
        descriptionLong: asTrimmedString(row.descriptionLong) ?? asTrimmedString(row.descriptionShort) ?? `${nameJa}を楽しめます。`,
        heroImageUrl: asOptionalUrl(row.heroImageUrl),
        galleryImageUrls: unique(splitMulti(row.galleryImageUrls).map((item) => asOptionalUrl(item)).filter((item) => Boolean(item))),
        thumbnailUrl: asOptionalUrl(row.thumbnailUrl),
        websiteUrl: asOptionalUrl(row.websiteUrl),
        instagramUrl: asOptionalUrl(row.instagramUrl),
        phoneNumber: asTrimmedString(row.phoneNumber),
        operatorName: asTrimmedString(row.operatorName),
        business: {
            isAlwaysOpen: asBoolean(row.isAlwaysOpen, false),
            openingHoursText: asTrimmedString(row.openingHoursText),
            regularHolidaysText: asTrimmedString(row.regularHolidaysText),
            reservationRequired: asBoolean(row.reservationRequired, false),
            lastEntryTime: asTrimmedString(row.lastEntryTime),
            estimatedStayMinutesMin,
            estimatedStayMinutesMax,
            weeklyHours: parseWeeklyHours(row.weeklyHoursJson),
        },
        pricing: {
            priceType: asEnum(row.priceType, spotConstants_1.SPOT_PRICE_TYPE_VALUES, "unknown"),
            priceLabel: asTrimmedString(row.priceLabel),
            priceMinYen: asNumber(row.priceMinYen),
            priceMaxYen: asNumber(row.priceMaxYen),
        },
        access: {
            supportedTransports: supportedTransports.length > 0 ? supportedTransports : ["walk"],
            parkingAvailable: asBoolean(row.parkingAvailable, false),
            bikeParkingAvailable: asBoolean(row.bikeParkingAvailable, false),
            busStopNearby: asBoolean(row.busStopNearby, false),
            requiresFirstStop,
            requiredFirstStopReason,
        },
        plannerAttributes: {
            themes,
            moodTags,
            weatherSuitability: {
                sunny: weatherSunny,
                cloudy: weatherCloudy,
                rainy: weatherRainy,
                windy: weatherWindy,
            },
            timeOfDaySuitability: timeOfDaySuitability.length > 0 ? timeOfDaySuitability : ["daytime"],
            visitPace,
            withWho: withWho.length > 0 ? withWho : ["solo", "friends", "couple", "family"],
            physicalLoad,
            indoorOutdoor,
            rainFallbackCandidate: weatherRainy !== "bad",
            photoSpotScore: scores.photoSpotScore,
            scenicScore: scores.scenicScore,
            foodScore: scores.foodScore,
            shoppingScore: scores.shoppingScore,
            experienceScore: scores.experienceScore,
            stationStopoverScore: scores.stationStopoverScore,
            priorityScore: scores.priorityScore,
        },
        aiContext: buildAiContext({
            nameJa,
            descriptionShort: asTrimmedString(row.descriptionShort) ?? `${nameJa}の見どころスポット`,
            tags,
            withWho: withWho.length > 0 ? withWho : ["solo", "friends", "couple", "family"],
            weatherRainy,
            themes,
        }),
        relatedSpotIds: [],
        campaignCompatible: false,
        couponCompatible: false,
        storyCompatible: false,
        source: "import_csv",
        lastReviewedAt: null,
        searchText: null,
    };
    return parsed;
}
function loadSpreadsheetRows(xlsxPath, sheetName) {
    const workbook = (0, xlsx_1.readFile)(xlsxPath, {
        cellDates: false,
    });
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error(`sheet not found: ${sheetName}`);
    }
    return xlsx_1.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: true,
    });
}
async function main() {
    const xlsxPath = process.env.SPOTS_XLSX_PATH?.trim() || DEFAULT_XLSX_PATH;
    const sheetName = process.env.SPOTS_XLSX_SHEET?.trim() || DEFAULT_SHEET_NAME;
    const dryRun = process.env.SPOTS_IMPORT_DRY_RUN === "1";
    const outputJsonPath = process.env.SPOTS_IMPORT_OUTPUT_JSON?.trim() || null;
    const rows = loadSpreadsheetRows(xlsxPath, sheetName);
    if (rows.length === 0) {
        throw new Error(`no rows found in ${xlsxPath} (${sheetName})`);
    }
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    let imported = 0;
    const normalizedRows = [];
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const rowNumber = i + 2;
        const mapped = buildSpotFromRow(row, rowNumber);
        const validated = (0, spotModel_1.validateSpotInput)(mapped);
        const normalized = (0, spotModel_1.normalizeSpotData)(validated);
        normalizedRows.push(normalized);
        if (!dryRun) {
            await (0, spotRepository_1.saveSpot)({
                db,
                spot: normalized,
                mode: "upsert",
            });
        }
        imported += 1;
        console.log(`[importSpotsFromXlsx] ${dryRun ? "validated" : "upserted"} ${normalized.id} (${imported}/${rows.length})`);
    }
    if (outputJsonPath) {
        await (0, promises_1.writeFile)(outputJsonPath, JSON.stringify(normalizedRows, null, 2), "utf-8");
        console.log(`[importSpotsFromXlsx] wrote normalized json to ${outputJsonPath}`);
    }
    console.log(`[importSpotsFromXlsx] done. rows=${rows.length} imported=${imported} dryRun=${dryRun} sheet=${sheetName} path=${xlsxPath}`);
}
main().catch((error) => {
    console.error("[importSpotsFromXlsx] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=importSpotsFromXlsx.js.map