"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const xlsx_1 = require("xlsx");
const firebase_admin_1 = require("../firebase-admin");
const businessRules_1 = require("../spots/businessRules");
const spotService_1 = require("../spots/spotService");
const DEFAULT_CSV_PATH = "/Users/wataru/Downloads/iwami_30_spots_openinfo_planner_defaults.csv";
const STATION_NAME_TO_INFO = {
    岩美駅: { stationId: "iwami-station", stationName: "岩美駅", lat: 35.574278, lng: 134.335478 },
    東浜駅: { stationId: "higashihama-station", stationName: "東浜駅", lat: 35.599471, lng: 134.362225 },
    大岩駅: { stationId: "oiwa-station", stationName: "大岩駅", lat: 35.56683, lng: 134.3084892 },
};
const TYPE_TO_CATEGORY = {
    飲食: "eat",
    宿泊: "stay",
    景観: "see",
    駅: "see",
    温泉街: "experience",
    温浴施設: "experience",
    体験: "experience",
    展示施設: "experience",
};
const TRANSPORT_TO_VALUE = {
    徒歩: "walk",
    自転車: "rental_cycle",
    車: "car",
    バス: "bus",
    列車: "train",
};
const RAINY_TO_VALUE = {
    "◎": "good",
    "○": "good",
    "△": "ok",
    "×": "bad",
};
function resolveCsvPath() {
    const rawPath = process.env.SPOTS_OPENINFO_CSV_PATH?.trim();
    if (rawPath) {
        return node_path_1.default.resolve(process.cwd(), rawPath);
    }
    return DEFAULT_CSV_PATH;
}
function asString(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return null;
}
function asBoolean(value) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true")
            return true;
        if (normalized === "false")
            return false;
    }
    return null;
}
function asPositiveInteger(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(1, Math.round(value));
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) {
            return Math.max(1, Math.round(parsed));
        }
    }
    return null;
}
function splitCsvList(value) {
    const text = asString(value);
    if (!text)
        return [];
    return text
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}
function dedupe(values) {
    return [...new Set(values)];
}
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
function parseRows(csvPath) {
    const workbook = (0, xlsx_1.readFile)(csvPath, { raw: false, codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error("CSV sheet is empty");
    }
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
        throw new Error("CSV sheet data is missing");
    }
    return xlsx_1.utils.sheet_to_json(sheet, { defval: "" });
}
async function main() {
    const csvPath = resolveCsvPath();
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    const rows = parseRows(csvPath);
    let updatedCount = 0;
    let skippedCount = 0;
    const skipped = [];
    for (const [index, row] of rows.entries()) {
        const spotId = asString(row.id);
        if (!spotId) {
            skippedCount += 1;
            skipped.push({ id: `(row:${index + 2})`, reason: "id is empty" });
            continue;
        }
        const existing = await (0, spotService_1.getSpotById)({ db, spotId });
        if (!existing) {
            skippedCount += 1;
            skipped.push({ id: spotId, reason: "spot not found in firestore" });
            continue;
        }
        const rowName = asString(row.name);
        const rowType = asString(row.type);
        const isAlwaysOpen = asBoolean(row.isAlwaysOpen);
        const openingHoursText = asString(row.openingHoursText);
        const weeklyHours = asString(row.weeklyHours);
        const notes = asString(row.notes);
        const stayMin = asPositiveInteger(row.estimatedStayMinutesMin);
        const stayMax = asPositiveInteger(row.estimatedStayMinutesMax);
        const rainyRaw = asString(row["weatherSuitability.rainy"]);
        const rainyValue = rainyRaw ? RAINY_TO_VALUE[rainyRaw] : undefined;
        const rainFallbackCandidate = asBoolean(row.rainFallbackCandidate);
        const priorityScore = asPositiveInteger(row.priorityScore);
        const plannerSummary = asString(row.plannerSummary);
        const whyVisit = asString(row.whyVisit);
        const themes = dedupe(splitCsvList(row.themes));
        const mappedCategory = rowType ? TYPE_TO_CATEGORY[rowType] : undefined;
        const supportedTransports = dedupe(splitCsvList(row.supportedTransports)
            .map((label) => TRANSPORT_TO_VALUE[label])
            .filter((value) => Boolean(value)));
        const nearestStations = dedupe(splitCsvList(row.nearestStations))
            .map((stationName) => STATION_NAME_TO_INFO[stationName])
            .filter((info) => Boolean(info))
            .map((station) => {
            const distanceMeters = station.stationId === spotId
                ? 0
                : Math.round(haversineMeters({ lat: existing.location.lat, lng: existing.location.lng }, { lat: station.lat, lng: station.lng }));
            const walkMinutes = distanceMeters === 0 ? 0 : Math.max(1, Math.round(distanceMeters / 80));
            return {
                stationId: station.stationId,
                stationName: station.stationName,
                distanceMeters,
                walkMinutes,
            };
        });
        const resolvedOpeningHoursText = openingHoursText ?? (isAlwaysOpen === true ? existing.business.openingHoursText ?? "終日開放" : null);
        const mergedRegularHolidaysText = [weeklyHours, notes]
            .filter((value) => typeof value === "string" && value.trim().length > 0)
            .join(" / ");
        const resolvedRegularHolidaysText = mergedRegularHolidaysText.length > 0 ? mergedRegularHolidaysText : existing.business.regularHolidaysText;
        const derivedBusiness = (0, businessRules_1.deriveBusinessOperationalData)({
            isAlwaysOpen: isAlwaysOpen ?? existing.business.isAlwaysOpen,
            openingHoursText: resolvedOpeningHoursText,
            regularHolidaysText: resolvedRegularHolidaysText,
            lastEntryTime: existing.business.lastEntryTime,
            weeklyHours: existing.business.weeklyHours,
            operationalJudgement: existing.business.operationalJudgement,
        });
        const patch = {
            ...(rowName ? { nameJa: rowName } : {}),
            ...(mappedCategory ? { primaryCategory: mappedCategory } : {}),
            business: {
                ...(isAlwaysOpen != null ? { isAlwaysOpen } : {}),
                openingHoursText: resolvedOpeningHoursText,
                regularHolidaysText: resolvedRegularHolidaysText,
                ...(derivedBusiness.weeklyHours ? { weeklyHours: derivedBusiness.weeklyHours } : {}),
                lastEntryTime: derivedBusiness.lastEntryTime,
                operationalJudgement: derivedBusiness.operationalJudgement,
                estimatedStayMinutesMin: stayMin ?? existing.business.estimatedStayMinutesMin,
                estimatedStayMinutesMax: stayMax ?? existing.business.estimatedStayMinutesMax,
            },
            access: {
                supportedTransports: supportedTransports.length > 0 ? supportedTransports : existing.access.supportedTransports,
            },
            ...(nearestStations.length > 0 ? { nearestStations } : {}),
            plannerAttributes: {
                ...(themes.length > 0 ? { themes } : {}),
                weatherSuitability: {
                    rainy: rainyValue ?? existing.plannerAttributes.weatherSuitability.rainy,
                },
                ...(rainFallbackCandidate != null ? { rainFallbackCandidate } : {}),
                ...(priorityScore != null ? { priorityScore } : {}),
            },
            aiContext: {
                plannerSummary: plannerSummary ?? existing.aiContext.plannerSummary,
                whyVisit: whyVisit ? [whyVisit] : existing.aiContext.whyVisit,
            },
        };
        await (0, spotService_1.updateSpot)({
            db,
            spotId,
            patch,
        });
        updatedCount += 1;
        console.log(`[importSpotsOpenInfoDefaultsCsv] updated ${spotId} (${index + 1}/${rows.length})`);
    }
    console.log(`[importSpotsOpenInfoDefaultsCsv] completed file=${csvPath} totalRows=${rows.length} updated=${updatedCount} skipped=${skippedCount}`);
    if (skipped.length > 0) {
        console.log(`[importSpotsOpenInfoDefaultsCsv] skipped details: ${JSON.stringify(skipped, null, 2)}`);
    }
}
main().catch((error) => {
    console.error("[importSpotsOpenInfoDefaultsCsv] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=importSpotsOpenInfoDefaultsCsv.js.map