"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGtfsFromPath = parseGtfsFromPath;
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const schemas_1 = require("./schemas");
function parseCsvRows(text) {
    const rows = [];
    let row = [];
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
                }
                else {
                    inQuotes = false;
                }
            }
            else {
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
function parseCsvRecords(text) {
    const rows = parseCsvRows(text);
    if (rows.length === 0)
        return [];
    const headers = rows[0].map((cell) => cell.trim());
    const records = [];
    for (let index = 1; index < rows.length; index += 1) {
        const row = rows[index] ?? [];
        const isEmpty = row.every((cell) => cell.trim().length === 0);
        if (isEmpty)
            continue;
        const record = {};
        for (let headerIndex = 0; headerIndex < headers.length; headerIndex += 1) {
            const header = headers[headerIndex];
            if (!header)
                continue;
            record[header] = (row[headerIndex] ?? "").trim();
        }
        records.push(record);
    }
    return records;
}
async function fileExists(filePath) {
    try {
        await (0, promises_1.access)(filePath);
        return true;
    }
    catch {
        return false;
    }
}
async function readFromDirectory(params) {
    const filePath = node_path_1.default.join(params.dirPath, params.fileName);
    const exists = await fileExists(filePath);
    if (!exists) {
        if (!params.required)
            return null;
        throw new Error(`required GTFS file not found: ${filePath}`);
    }
    return (0, promises_1.readFile)(filePath, "utf-8");
}
function readFromZip(params) {
    try {
        return (0, node_child_process_1.execFileSync)("unzip", ["-p", params.zipPath, params.fileName], {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "pipe"],
            maxBuffer: 1024 * 1024 * 32,
        });
    }
    catch (error) {
        if (!params.required)
            return null;
        throw new Error(`required GTFS file not found in zip: ${params.fileName}: ${String(error)}`);
    }
}
async function readGtfsText(params) {
    if (params.sourceType === "directory") {
        return readFromDirectory({ dirPath: params.inputPath, fileName: params.fileName, required: params.required });
    }
    return readFromZip({ zipPath: params.inputPath, fileName: params.fileName, required: params.required });
}
async function parseGtfsFromPath(inputPath) {
    const resolvedPath = node_path_1.default.resolve(inputPath);
    const inputStat = await (0, promises_1.stat)(resolvedPath);
    const sourceType = inputStat.isDirectory() ? "directory" : "zip";
    const [stopsRaw, routesRaw, tripsRaw, stopTimesRaw, calendarsRaw, calendarDatesRaw] = await Promise.all([
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "stops.txt", required: true }),
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "routes.txt", required: true }),
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "trips.txt", required: true }),
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "stop_times.txt", required: true }),
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "calendar.txt", required: true }),
        readGtfsText({ inputPath: resolvedPath, sourceType, fileName: "calendar_dates.txt", required: false }),
    ]);
    const stops = schemas_1.gtfsStopsSchema.parse(parseCsvRecords(stopsRaw ?? ""));
    const routes = schemas_1.gtfsRoutesSchema.parse(parseCsvRecords(routesRaw ?? ""));
    const trips = schemas_1.gtfsTripsSchema.parse(parseCsvRecords(tripsRaw ?? ""));
    const stopTimes = schemas_1.gtfsStopTimesSchema.parse(parseCsvRecords(stopTimesRaw ?? ""));
    const calendars = schemas_1.gtfsCalendarsSchema.parse(parseCsvRecords(calendarsRaw ?? ""));
    const calendarDates = schemas_1.gtfsCalendarDatesSchema.parse(parseCsvRecords(calendarDatesRaw ?? ""));
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
//# sourceMappingURL=parser.js.map