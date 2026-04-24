import { getFirebaseAdminDb } from "../firebase-admin";
import { applyGtfsOverlays } from "../transit/importers/gtfs/overlays";
import { mapGtfsToTransit } from "../transit/importers/gtfs/mapper";
import { parseGtfsFromPath } from "../transit/importers/gtfs/parser";
import { TRANSIT_TIMEZONE } from "../transit/constants";
import {
  listBusStopCandidates,
  upsertTransitCalendar,
  upsertTransitEdgeSchedule,
  upsertTransitService,
  upsertTransportNode,
} from "../transit/repository";

const IMPORT_SOURCE = "gtfs_jp_import_v1";
const IMPORT_VERSION = 1;

function normalize(value: string): string {
  return value.replace(/[\s　]/g, "").toLowerCase();
}

function resolveGtfsInputPath(): string {
  const fromEnv = process.env.GTFS_INPUT_PATH?.trim();
  if (fromEnv) return fromEnv;

  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) continue;

    if (arg.startsWith("--input=")) {
      const value = arg.slice("--input=".length).trim();
      if (value) return value;
      continue;
    }

    if (arg === "--input") {
      const next = args[index + 1]?.trim();
      if (next) return next;
    }
  }

  throw new Error("GTFS input path is required. Use GTFS_INPUT_PATH or --input <path>");
}

async function main() {
  const inputPath = resolveGtfsInputPath();
  const importedAt = new Date().toISOString();

  const parsed = await parseGtfsFromPath(inputPath);
  const mapped = mapGtfsToTransit({
    parsed,
    options: {
      source: IMPORT_SOURCE,
      version: IMPORT_VERSION,
      importedAt,
      timezone: TRANSIT_TIMEZONE,
      status: "active",
    },
  });

  const overlaid = applyGtfsOverlays(mapped);

  const db = getFirebaseAdminDb();

  for (const [index, node] of overlaid.transportNodes.entries()) {
    await upsertTransportNode({ db, record: node });
    console.log(`[importTransitGtfs] upserted transportNode ${node.nodeId} (${index + 1}/${overlaid.transportNodes.length})`);
  }

  for (const [index, calendar] of overlaid.transitCalendars.entries()) {
    await upsertTransitCalendar({ db, record: calendar });
    console.log(
      `[importTransitGtfs] upserted transitCalendar ${calendar.calendarId} (${index + 1}/${overlaid.transitCalendars.length})`,
    );
  }

  for (const [index, service] of overlaid.transitServices.entries()) {
    await upsertTransitService({ db, record: service });
    console.log(`[importTransitGtfs] upserted transitService ${service.serviceId} (${index + 1}/${overlaid.transitServices.length})`);
  }

  for (const [index, edgeSchedule] of overlaid.transitEdgeSchedules.entries()) {
    await upsertTransitEdgeSchedule({ db, record: edgeSchedule });
    console.log(
      `[importTransitGtfs] upserted transitEdgeSchedule ${edgeSchedule.edgeScheduleId} (${index + 1}/${overlaid.transitEdgeSchedules.length})`,
    );
  }

  const candidates = await listBusStopCandidates({ db, status: "active" }).catch(() => []);
  const candidateNameSet = new Set(candidates.map((candidate) => normalize(candidate.nameJa)));
  const matchedNodeCount = overlaid.transportNodes.filter((node) => candidateNameSet.has(normalize(node.nameJa))).length;

  console.log(
    `[importTransitGtfs] completed source=${IMPORT_SOURCE} version=${IMPORT_VERSION} input=${inputPath} counts={transportNodes:${overlaid.transportNodes.length},transitCalendars:${overlaid.transitCalendars.length},transitServices:${overlaid.transitServices.length},transitEdgeSchedules:${overlaid.transitEdgeSchedules.length}} busStopCandidateMatch={matchedNodes:${matchedNodeCount},candidates:${candidates.length}}`,
  );
}

main().catch((error) => {
  console.error("[importTransitGtfs] failed", error);
  process.exitCode = 1;
});
