import { execFileSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  gtfsCalendarDatesSchema,
  gtfsCalendarsSchema,
  gtfsRoutesSchema,
  gtfsStopsSchema,
  gtfsStopTimesSchema,
  gtfsTripsSchema,
} from "./schemas";
import type { ParsedGtfsData } from "./types";

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        const next = text[index + 1];
        if (next === '"') {
          value += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (rows.length > 0 && rows[0] && rows[0][0]) {
    rows[0][0] = rows[0][0].replace(/^\uFEFF/, "");
  }

  return rows;
}

function parseCsvRecords(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((cell) => cell.trim());
  const records: Record<string, string>[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    const isEmpty = row.every((cell) => cell.trim().length === 0);
    if (isEmpty) continue;

    const record: Record<string, string> = {};
    for (let headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
      const header = headers[headerIndex];
      if (!header) continue;
      record[header] = (row[headerIndex] ?? "").trim();
    }

    records.push(record);
  }

  return records;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFromDirectory(params: {
  dirPath: string;
  fileName: string;
  required: boolean;
}): Promise<string | null> {
  const filePath = path.join(params.dirPath, params.fileName);
  const exists = await fileExists(filePath);
  if (!exists) {
    if (!params.required) return null;
    throw new Error(`required GTFS file not found: ${filePath}`);
  }

  return readFile(filePath, "utf-8");
}

function readFromZip(params: { zipPath: string; fileName: string; required: boolean }): string | null {
  try {
    return execFileSync("unzip", ["-p", params.zipPath, params.fileName], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 32,
    });
  } catch (error) {
    if (!params.required) return null;
    throw new Error(`required GTFS file not found in zip: ${params.fileName}: ${String(error)}`);
  }
}

async function readGtfsText(params: {
  inputPath: string;
  sourceType: "directory" | "zip";
  fileName: string;
  required: boolean;
}): Promise<string | null> {
  if (params.sourceType === "directory") {
    return readFromDirectory({ dirPath: params.inputPath, fileName: params.fileName, required: params.required });
  }

  return readFromZip({ zipPath: params.inputPath, fileName: params.fileName, required: params.required });
}

export async function parseGtfsFromPath(inputPath: string): Promise<ParsedGtfsData> {
  const resolvedPath = path.resolve(inputPath);
  const inputStat = await stat(resolvedPath);
  const sourceType: "directory" | "zip" = inputStat.isDirectory() ? "directory" : "zip";

  const [stopsRaw, routesRaw, tripsRaw, stopTimesRaw, calendarsRaw, calendarDatesRaw] = await Promise.all([
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "stops.txt", required: true }),
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "routes.txt", required: true }),
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "trips.txt", required: true }),
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "stop_times.txt", required: true }),
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "calendar.txt", required: true }),
    readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "calendar_dates.txt", required: false }),
  ]);

  const stops = gtfsStopsSchema.parse(parseCsvRecords(stopsRaw ?? ""));
  const routes = gtfsRoutesSchema.parse(parseCsvRecords(routesRaw ?? ""));
  const trips = gtfsTripsSchema.parse(parseCsvRecords(tripsRaw ?? ""));
  const stopTimes = gtfsStopTimesSchema.parse(parseCsvRecords(stopTimesRaw ?? ""));
  const calendars = gtfsCalendarsSchema.parse(parseCsvRecords(calendarsRaw ?? ""));
  const calendarDates = gtfsCalendarDatesSchema.parse(parseCsvRecords(calendarDatesRaw ?? ""));

  return {
    sourcePath: resolvedPath,
    stops,
    routes,
    trips,
    stopTimes,
    calendars,
    calendarDates,
  };
}
