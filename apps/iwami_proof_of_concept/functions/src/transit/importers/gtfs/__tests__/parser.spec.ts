import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseGtfsFromPath } from "../parser";

const tempDirs: string[] = [];

async function createFixtureDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "gtfs-parser-spec-"));
  tempDirs.push(dir);

  await writeFile(
    path.join(dir, "stops.txt"),
    [
      "stop_id,stop_name,stop_lat,stop_lon,location_type,stop_desc",
      "s1,岩美駅,35.5740168,134.3354495,0,駅",
      "s2,東浜駅,35.599669,134.3627158,0,駅",
    ].join("\n"),
    "utf-8",
  );

  await writeFile(
    path.join(dir, "routes.txt"),
    ["route_id,route_short_name,route_long_name,route_type", "r1,,小田線,3"].join("\n"),
    "utf-8",
  );

  await writeFile(
    path.join(dir, "trips.txt"),
    [
      "route_id,service_id,trip_id,trip_headsign,direction_id,jp_trip_desc",
      "r1,svc1,t1,小田,0,備考",
    ].join("\n"),
    "utf-8",
  );

  await writeFile(
    path.join(dir, "stop_times.txt"),
    [
      "trip_id,arrival_time,departure_time,stop_id,stop_sequence",
      "t1,08:00:00,08:00:00,s1,1",
      "t1,08:10:00,08:10:00,s2,2",
    ].join("\n"),
    "utf-8",
  );

  await writeFile(
    path.join(dir, "calendar.txt"),
    [
      "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date",
      "svc1,1,1,1,1,1,0,0,20260401,20270331",
    ].join("\n"),
    "utf-8",
  );

  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0, tempDirs.length).map(async (dir) => {
      await rm(dir, { recursive: true, force: true });
    }),
  );
});

describe("parseGtfsFromPath", () => {
  it("accepts GTFS rows with additional columns and parses required fields", async () => {
    const dir = await createFixtureDir();
    const parsed = await parseGtfsFromPath(dir);

    expect(parsed.stops.length).toBe(2);
    expect(parsed.routes.length).toBe(1);
    expect(parsed.trips.length).toBe(1);
    expect(parsed.stopTimes.length).toBe(2);
    expect(parsed.calendars.length).toBe(1);
    expect(parsed.calendarDates.length).toBe(0);
    expect(parsed.stops[0]?.stop_name).toBe("岩美駅");
  });
});
