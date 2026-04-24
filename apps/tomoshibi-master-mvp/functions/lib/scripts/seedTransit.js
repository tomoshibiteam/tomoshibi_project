"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const firebase_admin_1 = require("../firebase-admin");
const constants_1 = require("../transit/constants");
const schemas_1 = require("../transit/schemas");
const seedModel_1 = require("../transit/seedModel");
const repository_1 = require("../transit/repository");
function resolveSeedDirPath() {
    if (process.env.TRANSIT_SEED_DIR_PATH) {
        return node_path_1.default.resolve(process.cwd(), process.env.TRANSIT_SEED_DIR_PATH);
    }
    return node_path_1.default.resolve(process.cwd(), "src/seeds/transit");
}
async function loadSeedJson(seedDirPath, fileName) {
    const filePath = node_path_1.default.join(seedDirPath, fileName);
    const rawJson = await (0, promises_1.readFile)(filePath, "utf-8");
    return JSON.parse(rawJson);
}
async function main() {
    const seedDirPath = resolveSeedDirPath();
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    const transportNodesSeedRaw = await loadSeedJson(seedDirPath, "transportNodes.seed.json");
    const transitCalendarsSeedRaw = await loadSeedJson(seedDirPath, "transitCalendars.seed.json");
    const transitServicesSeedRaw = await loadSeedJson(seedDirPath, "transitServices.seed.json");
    const transitEdgeSchedulesSeedRaw = await loadSeedJson(seedDirPath, "transitEdgeSchedules.seed.json");
    const busStopCandidatesSeedRaw = await loadSeedJson(seedDirPath, "busStopCandidates.seed.json");
    const transportNodesSeed = schemas_1.transportNodeSeedArraySchema.parse(transportNodesSeedRaw);
    const transitCalendarsSeed = schemas_1.transitCalendarSeedArraySchema.parse(transitCalendarsSeedRaw);
    const transitServicesSeed = schemas_1.transitServiceSeedArraySchema.parse(transitServicesSeedRaw);
    const transitEdgeSchedulesSeed = schemas_1.transitEdgeScheduleSeedArraySchema.parse(transitEdgeSchedulesSeedRaw);
    const busStopCandidatesSeed = schemas_1.busStopCandidateSeedArraySchema.parse(busStopCandidatesSeedRaw);
    const transportNodes = transportNodesSeed.map((seed) => schemas_1.transportNodeRecordSchema.parse({
        ...seed,
        source: constants_1.TRANSIT_SEED_SOURCE,
        version: constants_1.TRANSIT_SEED_VERSION,
    }));
    const transitCalendars = transitCalendarsSeed.map((seed) => schemas_1.transitCalendarRecordSchema.parse({
        ...seed,
        source: constants_1.TRANSIT_SEED_SOURCE,
        version: constants_1.TRANSIT_SEED_VERSION,
    }));
    const transitServices = transitServicesSeed.map((seed) => schemas_1.transitServiceRecordSchema.parse({
        ...seed,
        source: constants_1.TRANSIT_SEED_SOURCE,
        version: constants_1.TRANSIT_SEED_VERSION,
    }));
    const transitEdgeSchedules = transitEdgeSchedulesSeed.map((seed) => (0, seedModel_1.buildTransitEdgeScheduleRecord)(seed));
    const busStopCandidates = busStopCandidatesSeed.map((seed) => schemas_1.busStopCandidateRecordSchema.parse({
        ...seed,
        source: constants_1.TRANSIT_SEED_SOURCE,
        version: constants_1.TRANSIT_SEED_VERSION,
    }));
    for (const [index, node] of transportNodes.entries()) {
        await (0, repository_1.upsertTransportNode)({ db, record: node });
        console.log(`[seedTransit] upserted transportNode ${node.nodeId} (${index + 1}/${transportNodes.length})`);
    }
    for (const [index, calendar] of transitCalendars.entries()) {
        await (0, repository_1.upsertTransitCalendar)({ db, record: calendar });
        console.log(`[seedTransit] upserted transitCalendar ${calendar.calendarId} (${index + 1}/${transitCalendars.length})`);
    }
    for (const [index, service] of transitServices.entries()) {
        await (0, repository_1.upsertTransitService)({ db, record: service });
        console.log(`[seedTransit] upserted transitService ${service.serviceId} (${index + 1}/${transitServices.length})`);
    }
    for (const [index, edgeSchedule] of transitEdgeSchedules.entries()) {
        await (0, repository_1.upsertTransitEdgeSchedule)({ db, record: edgeSchedule });
        console.log(`[seedTransit] upserted transitEdgeSchedule ${edgeSchedule.edgeScheduleId} (${index + 1}/${transitEdgeSchedules.length})`);
    }
    for (const [index, candidate] of busStopCandidates.entries()) {
        await (0, repository_1.upsertBusStopCandidate)({ db, record: candidate });
        console.log(`[seedTransit] upserted busStopCandidate ${candidate.candidateId} (${index + 1}/${busStopCandidates.length})`);
    }
    console.log(`[seedTransit] completed source=${constants_1.TRANSIT_SEED_SOURCE} version=${constants_1.TRANSIT_SEED_VERSION} dir=${seedDirPath} counts={transportNodes:${transportNodes.length},transitCalendars:${transitCalendars.length},transitServices:${transitServices.length},transitEdgeSchedules:${transitEdgeSchedules.length},busStopCandidates:${busStopCandidates.length}}`);
}
main().catch((error) => {
    console.error("[seedTransit] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=seedTransit.js.map