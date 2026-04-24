import { readFile } from "node:fs/promises";
import path from "node:path";
import { getFirebaseAdminDb } from "../firebase-admin";
import { TRANSIT_SEED_SOURCE, TRANSIT_SEED_VERSION } from "../transit/constants";
import {
  busStopCandidateRecordSchema,
  busStopCandidateSeedArraySchema,
  transitCalendarRecordSchema,
  transitCalendarSeedArraySchema,
  transitEdgeScheduleSeedArraySchema,
  transitServiceRecordSchema,
  transitServiceSeedArraySchema,
  transportNodeRecordSchema,
  transportNodeSeedArraySchema,
} from "../transit/schemas";
import { buildTransitEdgeScheduleRecord } from "../transit/seedModel";
import {
  upsertBusStopCandidate,
  upsertTransitCalendar,
  upsertTransitEdgeSchedule,
  upsertTransitService,
  upsertTransportNode,
} from "../transit/repository";
import type { BusStopCandidateRecord, TransitCalendarRecord, TransitServiceRecord, TransportNodeRecord } from "../transit/types";

type SeedFileName =
  | "transportNodes.seed.json"
  | "transitCalendars.seed.json"
  | "transitServices.seed.json"
  | "transitEdgeSchedules.seed.json"
  | "busStopCandidates.seed.json";

function resolveSeedDirPath(): string {
  if (process.env.TRANSIT_SEED_DIR_PATH) {
    return path.resolve(process.cwd(), process.env.TRANSIT_SEED_DIR_PATH);
  }

  return path.resolve(process.cwd(), "src/seeds/transit");
}

async function loadSeedJson<T>(seedDirPath: string, fileName: SeedFileName): Promise<T> {
  const filePath = path.join(seedDirPath, fileName);
  const rawJson = await readFile(filePath, "utf-8");
  return JSON.parse(rawJson) as T;
}

async function main() {
  const seedDirPath = resolveSeedDirPath();
  const db = getFirebaseAdminDb();

  const transportNodesSeedRaw = await loadSeedJson<unknown>(seedDirPath, "transportNodes.seed.json");
  const transitCalendarsSeedRaw = await loadSeedJson<unknown>(seedDirPath, "transitCalendars.seed.json");
  const transitServicesSeedRaw = await loadSeedJson<unknown>(seedDirPath, "transitServices.seed.json");
  const transitEdgeSchedulesSeedRaw = await loadSeedJson<unknown>(seedDirPath, "transitEdgeSchedules.seed.json");
  const busStopCandidatesSeedRaw = await loadSeedJson<unknown>(seedDirPath, "busStopCandidates.seed.json");

  const transportNodesSeed = transportNodeSeedArraySchema.parse(transportNodesSeedRaw);
  const transitCalendarsSeed = transitCalendarSeedArraySchema.parse(transitCalendarsSeedRaw);
  const transitServicesSeed = transitServiceSeedArraySchema.parse(transitServicesSeedRaw);
  const transitEdgeSchedulesSeed = transitEdgeScheduleSeedArraySchema.parse(transitEdgeSchedulesSeedRaw);
  const busStopCandidatesSeed = busStopCandidateSeedArraySchema.parse(busStopCandidatesSeedRaw);

  const transportNodes: TransportNodeRecord[] = transportNodesSeed.map((seed) =>
    transportNodeRecordSchema.parse({
      ...seed,
      source: TRANSIT_SEED_SOURCE,
      version: TRANSIT_SEED_VERSION,
    }),
  );

  const transitCalendars: TransitCalendarRecord[] = transitCalendarsSeed.map((seed) =>
    transitCalendarRecordSchema.parse({
      ...seed,
      source: TRANSIT_SEED_SOURCE,
      version: TRANSIT_SEED_VERSION,
    }),
  );

  const transitServices: TransitServiceRecord[] = transitServicesSeed.map((seed) =>
    transitServiceRecordSchema.parse({
      ...seed,
      source: TRANSIT_SEED_SOURCE,
      version: TRANSIT_SEED_VERSION,
    }),
  );

  const transitEdgeSchedules = transitEdgeSchedulesSeed.map((seed) => buildTransitEdgeScheduleRecord(seed));
  const busStopCandidates: BusStopCandidateRecord[] = busStopCandidatesSeed.map((seed) =>
    busStopCandidateRecordSchema.parse({
      ...seed,
      source: TRANSIT_SEED_SOURCE,
      version: TRANSIT_SEED_VERSION,
    }),
  );

  for (const [index, node] of transportNodes.entries()) {
    await upsertTransportNode({ db, record: node });
    console.log(`[seedTransit] upserted transportNode ${node.nodeId} (${index + 1}/${transportNodes.length})`);
  }

  for (const [index, calendar] of transitCalendars.entries()) {
    await upsertTransitCalendar({ db, record: calendar });
    console.log(
      `[seedTransit] upserted transitCalendar ${calendar.calendarId} (${index + 1}/${transitCalendars.length})`,
    );
  }

  for (const [index, service] of transitServices.entries()) {
    await upsertTransitService({ db, record: service });
    console.log(`[seedTransit] upserted transitService ${service.serviceId} (${index + 1}/${transitServices.length})`);
  }

  for (const [index, edgeSchedule] of transitEdgeSchedules.entries()) {
    await upsertTransitEdgeSchedule({ db, record: edgeSchedule });
    console.log(
      `[seedTransit] upserted transitEdgeSchedule ${edgeSchedule.edgeScheduleId} (${index + 1}/${transitEdgeSchedules.length})`,
    );
  }

  for (const [index, candidate] of busStopCandidates.entries()) {
    await upsertBusStopCandidate({ db, record: candidate });
    console.log(
      `[seedTransit] upserted busStopCandidate ${candidate.candidateId} (${index + 1}/${busStopCandidates.length})`,
    );
  }

  console.log(
    `[seedTransit] completed source=${TRANSIT_SEED_SOURCE} version=${TRANSIT_SEED_VERSION} dir=${seedDirPath} counts={transportNodes:${transportNodes.length},transitCalendars:${transitCalendars.length},transitServices:${transitServices.length},transitEdgeSchedules:${transitEdgeSchedules.length},busStopCandidates:${busStopCandidates.length}}`,
  );
}

main().catch((error) => {
  console.error("[seedTransit] failed", error);
  process.exitCode = 1;
});
