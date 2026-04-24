"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("../firebase-admin");
const overlays_1 = require("../transit/importers/gtfs/overlays");
const mapper_1 = require("../transit/importers/gtfs/mapper");
const parser_1 = require("../transit/importers/gtfs/parser");
const constants_1 = require("../transit/constants");
const repository_1 = require("../transit/repository");
const IMPORT_SOURCE = "gtfs_jp_import_v1";
const IMPORT_VERSION = 1;
function normalize(value) {
    return value.replace(/[\s　]/g, "").toLowerCase();
}
function resolveGtfsInputPath() {
    const fromEnv = process.env.GTFS_INPUT_PATH?.trim();
    if (fromEnv)
        return fromEnv;
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (!arg)
            continue;
        if (arg.startsWith("--input=")) {
            const value = arg.slice("--input=".length).trim();
            if (value)
                return value;
            continue;
        }
        if (arg === "--input") {
            const next = args[index + 1]?.trim();
            if (next)
                return next;
        }
    }
    throw new Error("GTFS input path is required. Use GTFS_INPUT_PATH or --input <path>");
}
async function main() {
    const inputPath = resolveGtfsInputPath();
    const importedAt = new Date().toISOString();
    const parsed = await (0, parser_1.parseGtfsFromPath)(inputPath);
    const mapped = (0, mapper_1.mapGtfsToTransit)({
        parsed,
        options: {
            source: IMPORT_SOURCE,
            version: IMPORT_VERSION,
            importedAt,
            timezone: constants_1.TRANSIT_TIMEZONE,
            status: "active",
        },
    });
    const overlaid = (0, overlays_1.applyGtfsOverlays)(mapped);
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    for (const [index, node] of overlaid.transportNodes.entries()) {
        await (0, repository_1.upsertTransportNode)({ db, record: node });
        console.log(`[importTransitGtfs] upserted transportNode ${node.nodeId} (${index + 1}/${overlaid.transportNodes.length})`);
    }
    for (const [index, calendar] of overlaid.transitCalendars.entries()) {
        await (0, repository_1.upsertTransitCalendar)({ db, record: calendar });
        console.log(`[importTransitGtfs] upserted transitCalendar ${calendar.calendarId} (${index + 1}/${overlaid.transitCalendars.length})`);
    }
    for (const [index, service] of overlaid.transitServices.entries()) {
        await (0, repository_1.upsertTransitService)({ db, record: service });
        console.log(`[importTransitGtfs] upserted transitService ${service.serviceId} (${index + 1}/${overlaid.transitServices.length})`);
    }
    for (const [index, edgeSchedule] of overlaid.transitEdgeSchedules.entries()) {
        await (0, repository_1.upsertTransitEdgeSchedule)({ db, record: edgeSchedule });
        console.log(`[importTransitGtfs] upserted transitEdgeSchedule ${edgeSchedule.edgeScheduleId} (${index + 1}/${overlaid.transitEdgeSchedules.length})`);
    }
    const candidates = await (0, repository_1.listBusStopCandidates)({ db, status: "active" }).catch(() => []);
    const candidateNameSet = new Set(candidates.map((candidate) => normalize(candidate.nameJa)));
    const matchedNodeCount = overlaid.transportNodes.filter((node) => candidateNameSet.has(normalize(node.nameJa))).length;
    console.log(`[importTransitGtfs] completed source=${IMPORT_SOURCE} version=${IMPORT_VERSION} input=${inputPath} counts={transportNodes:${overlaid.transportNodes.length},transitCalendars:${overlaid.transitCalendars.length},transitServices:${overlaid.transitServices.length},transitEdgeSchedules:${overlaid.transitEdgeSchedules.length}} busStopCandidateMatch={matchedNodes:${matchedNodeCount},candidates:${candidates.length}}`);
}
main().catch((error) => {
    console.error("[importTransitGtfs] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=importTransitGtfs.js.map