"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const firebase_admin_1 = require("../firebase-admin");
const spotModel_1 = require("../spots/spotModel");
const spotRepository_1 = require("../spots/spotRepository");
function resolveSeedPath() {
    if (process.env.SPOTS_JSON_PATH) {
        return node_path_1.default.resolve(process.cwd(), process.env.SPOTS_JSON_PATH);
    }
    return node_path_1.default.resolve(process.cwd(), "src/seeds/spots.seed.json");
}
function resolveMode() {
    const mode = process.env.SEED_MODE;
    if (mode === "create" || mode === "update" || mode === "upsert") {
        return mode;
    }
    return "upsert";
}
async function loadRawSpots(seedPath) {
    const rawJson = await (0, promises_1.readFile)(seedPath, "utf-8");
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) {
        throw new Error("spots seed json must be an array");
    }
    return parsed;
}
async function main() {
    const seedPath = resolveSeedPath();
    const mode = resolveMode();
    const rawSpots = await loadRawSpots(seedPath);
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    let successCount = 0;
    for (const [index, rawSpot] of rawSpots.entries()) {
        const validated = (0, spotModel_1.validateSpotInput)(rawSpot);
        const normalized = (0, spotModel_1.normalizeSpotData)(validated);
        await (0, spotRepository_1.saveSpot)({
            db,
            spot: normalized,
            mode,
        });
        successCount += 1;
        console.log(`[seedSpots] upserted ${normalized.id} (${index + 1}/${rawSpots.length})`);
    }
    console.log(`[seedSpots] completed. success=${successCount} mode=${mode} file=${seedPath}`);
}
main().catch((error) => {
    console.error("[seedSpots] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=seedSpots.js.map