"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapGtfsToTransit = mapGtfsToTransit;
const constants_1 = require("../../constants");
const schemas_1 = require("../../schemas");
const DEFAULT_STATUS = "active";
const WEEKDAY_DAY_TYPES = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND_HOLIDAY_DAY_TYPES = ["sat", "sun", "holiday"];
function normalizeString(value) {
    return (value ?? "").trim();
}
function normalizeForMatching(value) {
    return value.replace(/[\s　]/g, "").toLowerCase();
}
function sanitizeIdentifier(value) {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/[\s　]+/g, "_")
        .replace(/[^\p{L}\p{N}_-]+/gu, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    if (normalized.length > 0)
        return normalized;
    return `id_${Buffer.from(value).toString("hex").slice(0, 16)}`;
}
function toBusStopNodeId(stopId) {
    return `gtfs_bus_stop_${sanitizeIdentifier(stopId)}`;
}
function resolveLinkedSpotId(stopNameJa) {
    const normalized = normalizeForMatching(stopNameJa);
    if (normalized.includes("岩美駅"))
        return "iwami-station";
    if (normalized.includes("道の駅きなんせ岩美"))
        return "kinanse-iwami-roadside-station";
    if (normalized.includes("岩美町観光協会"))
        return "iwami-tourism-association";
    return null;
}
function isStationHubCandidate(stopNameJa) {
    const normalized = normalizeForMatching(stopNameJa);
    return (normalized.includes("岩美駅") ||
        normalized.includes("東浜駅") ||
        normalized.includes("大岩駅") ||
        normalized.includes("道の駅きなんせ岩美"));
}
function parseNumber(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new Error(`invalid number: ${value}`);
    }
    return parsed;
}
function parseGtfsTimeToMinutes(value) {
    const normalized = value.trim();
    const matched = normalized.match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/);
    if (!matched) {
        throw new Error(`invalid GTFS time: ${value}`);
    }
    const hours = Number(matched[1]);
    const minutes = Number(matched[2]);
    if (hours > 47) {
        throw new Error(`GTFS hour must be <=47: ${value}`);
    }
    return hours * 60 + minutes;
}
function formatMinutesAsHHmm(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function isOne(value) {
    return value.trim() === "1";
}
function isWeekend(dateYYYYMMDD) {
    const year = Number(dateYYYYMMDD.slice(0, 4));
    const month = Number(dateYYYYMMDD.slice(4, 6));
    const day = Number(dateYYYYMMDD.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}
function resolveCalendarBucketsByService(params) {
    const bucketsByServiceId = new Map();
    for (const calendar of params.calendars) {
        const buckets = new Set();
        if (isOne(calendar.monday) ||
            isOne(calendar.tuesday) ||
            isOne(calendar.wednesday) ||
            isOne(calendar.thursday) ||
            isOne(calendar.friday)) {
            buckets.add("weekday");
        }
        if (isOne(calendar.saturday) || isOne(calendar.sunday)) {
            buckets.add("weekend_holiday");
        }
        if (buckets.size === 0) {
            buckets.add("weekday");
        }
        bucketsByServiceId.set(calendar.service_id, buckets);
    }
    for (const calendarDate of params.calendarDates) {
        if (calendarDate.exception_type !== "1")
            continue;
        const bucket = isWeekend(calendarDate.date) ? "weekend_holiday" : "weekday";
        const existing = bucketsByServiceId.get(calendarDate.service_id) ?? new Set();
        existing.add(bucket);
        bucketsByServiceId.set(calendarDate.service_id, existing);
    }
    const serviceIdsByBucket = {
        weekday: new Set(),
        weekend_holiday: new Set(),
    };
    for (const [serviceId, buckets] of bucketsByServiceId.entries()) {
        if (buckets.has("weekday"))
            serviceIdsByBucket.weekday.add(serviceId);
        if (buckets.has("weekend_holiday"))
            serviceIdsByBucket.weekend_holiday.add(serviceId);
    }
    return { bucketsByServiceId, serviceIdsByBucket };
}
function resolveBaseService(params) {
    const routeShort = normalizeString(params.route.route_short_name);
    const routeLong = normalizeString(params.route.route_long_name);
    const routeDesc = normalizeString(params.route.route_desc);
    const routeText = `${routeShort} ${routeLong} ${routeDesc}`;
    const normalized = normalizeForMatching(routeText);
    if (normalized.includes("小田")) {
        return {
            serviceId: "bus_iwami_oda_line",
            lineName: "小田線",
            routeName: routeLong || routeShort || "岩美駅 - 小田",
        };
    }
    if (normalized.includes("田後") || normalized.includes("陸上")) {
        return {
            serviceId: "bus_iwami_tago_kugami_line",
            lineName: "田後・陸上線",
            routeName: routeLong || routeShort || "岩美駅 - 田後・陸上",
        };
    }
    return {
        serviceId: `bus_gtfs_${sanitizeIdentifier(params.route.route_id)}`,
        lineName: routeShort || routeLong || params.route.route_id,
        routeName: routeLong || routeShort || null,
    };
}
function buildTransportNodes(params) {
    const status = params.options.status ?? DEFAULT_STATUS;
    return params.stops
        .map((stop) => {
        const nameJa = normalizeString(stop.stop_name);
        const nodeId = toBusStopNodeId(stop.stop_id);
        return schemas_1.transportNodeRecordSchema.parse({
            nodeId,
            nodeType: "bus_stop",
            nameJa,
            location: {
                lat: parseNumber(stop.stop_lat),
                lng: parseNumber(stop.stop_lon),
            },
            isOriginCandidate: isStationHubCandidate(nameJa),
            isReturnCandidate: isStationHubCandidate(nameJa),
            linkedSpotId: resolveLinkedSpotId(nameJa),
            status,
            source: params.options.source,
            version: params.options.version,
            importedAt: params.options.importedAt,
        });
    })
        .sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}
function mapGtfsToTransit(params) {
    const status = params.options.status ?? DEFAULT_STATUS;
    const timezone = params.options.timezone ?? constants_1.TRANSIT_TIMEZONE;
    const routesById = new Map(params.parsed.routes.map((route) => [route.route_id, route]));
    const stopsById = new Map(params.parsed.stops.map((stop) => [stop.stop_id, stop]));
    const tripRowsById = new Map(params.parsed.trips.map((trip) => [trip.trip_id, trip]));
    const stopTimesByTripId = new Map();
    for (const stopTime of params.parsed.stopTimes) {
        const existing = stopTimesByTripId.get(stopTime.trip_id);
        if (existing) {
            existing.push(stopTime);
        }
        else {
            stopTimesByTripId.set(stopTime.trip_id, [stopTime]);
        }
    }
    for (const stopTimes of stopTimesByTripId.values()) {
        stopTimes.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));
    }
    const { bucketsByServiceId, serviceIdsByBucket } = resolveCalendarBucketsByService({
        calendars: params.parsed.calendars,
        calendarDates: params.parsed.calendarDates,
    });
    const transportNodes = buildTransportNodes({ stops: params.parsed.stops, options: params.options });
    const nodeIdByStopId = new Map(params.parsed.stops.map((stop) => [stop.stop_id, toBusStopNodeId(stop.stop_id)]));
    const serviceMap = new Map();
    for (const trip of params.parsed.trips) {
        const route = routesById.get(trip.route_id);
        if (!route)
            continue;
        const resolved = resolveBaseService({ route });
        const existing = serviceMap.get(resolved.serviceId);
        if (!existing) {
            const record = schemas_1.transitServiceRecordSchema.parse({
                serviceId: resolved.serviceId,
                mode: "bus",
                operator: "岩美町（運行委託: 日本交通）",
                lineName: resolved.lineName,
                routeName: resolved.routeName,
                fromNodeId: null,
                toNodeId: null,
                isMajor: true,
                status,
                metadata: {
                    effectiveFromDate: null,
                    bookingRules: [],
                    routeShape: null,
                    shoppingStops: [],
                    remarks: ["GTFS-JP import"],
                    routeVariantHints: [],
                    gtfsRouteIds: [route.route_id],
                    gtfsDirectionIds: trip.direction_id ? [trip.direction_id] : [],
                    gtfsServiceIds: [trip.service_id],
                },
                source: params.options.source,
                version: params.options.version,
                importedAt: params.options.importedAt,
            });
            serviceMap.set(resolved.serviceId, {
                record,
                gtfsRouteIds: new Set([route.route_id]),
                gtfsDirectionIds: trip.direction_id ? new Set([trip.direction_id]) : new Set(),
                gtfsServiceIds: new Set([trip.service_id]),
            });
            continue;
        }
        existing.gtfsRouteIds.add(route.route_id);
        if (trip.direction_id)
            existing.gtfsDirectionIds.add(trip.direction_id);
        existing.gtfsServiceIds.add(trip.service_id);
    }
    const transitServices = Array.from(serviceMap.values())
        .map((entry) => {
        const merged = schemas_1.transitServiceRecordSchema.parse({
            ...entry.record,
            metadata: {
                ...(entry.record.metadata ?? {
                    effectiveFromDate: null,
                    bookingRules: [],
                    routeShape: null,
                    shoppingStops: [],
                    remarks: ["GTFS-JP import"],
                }),
                gtfsRouteIds: Array.from(entry.gtfsRouteIds).sort(),
                gtfsDirectionIds: Array.from(entry.gtfsDirectionIds).sort(),
                gtfsServiceIds: Array.from(entry.gtfsServiceIds).sort(),
            },
        });
        return merged;
    })
        .sort((a, b) => a.serviceId.localeCompare(b.serviceId));
    const transitCalendars = [
        schemas_1.transitCalendarRecordSchema.parse({
            calendarId: "weekday",
            nameJa: "平日",
            dayTypes: WEEKDAY_DAY_TYPES,
            status,
            metadata: {
                gtfsServiceIds: Array.from(serviceIdsByBucket.weekday).sort(),
            },
            source: params.options.source,
            version: params.options.version,
            importedAt: params.options.importedAt,
        }),
        schemas_1.transitCalendarRecordSchema.parse({
            calendarId: "weekend_holiday",
            nameJa: "土日祝",
            dayTypes: WEEKEND_HOLIDAY_DAY_TYPES,
            status,
            metadata: {
                gtfsServiceIds: Array.from(serviceIdsByBucket.weekend_holiday).sort(),
            },
            source: params.options.source,
            version: params.options.version,
            importedAt: params.options.importedAt,
        }),
    ];
    const edgeMap = new Map();
    const tripContextsByGtfsTripId = {};
    for (const [tripId, stopTimes] of stopTimesByTripId.entries()) {
        if (stopTimes.length < 2)
            continue;
        const trip = tripRowsById.get(tripId);
        if (!trip)
            continue;
        const route = routesById.get(trip.route_id);
        if (!route)
            continue;
        const resolved = resolveBaseService({ route });
        const buckets = bucketsByServiceId.get(trip.service_id) ?? new Set(["weekday"]);
        const stopNames = [];
        const stopNodeIds = [];
        for (const stopTime of stopTimes) {
            const stop = stopsById.get(stopTime.stop_id);
            if (!stop)
                continue;
            stopNames.push(normalizeString(stop.stop_name));
            stopNodeIds.push(nodeIdByStopId.get(stop.stop_id) ?? toBusStopNodeId(stop.stop_id));
        }
        tripContextsByGtfsTripId[tripId] = {
            gtfsTripId: tripId,
            serviceId: resolved.serviceId,
            stopNames,
            stopNodeIds,
        };
        for (let index = 0; index < stopTimes.length - 1; index += 1) {
            const from = stopTimes[index];
            const to = stopTimes[index + 1];
            if (!from || !to)
                continue;
            const fromNodeId = nodeIdByStopId.get(from.stop_id) ?? toBusStopNodeId(from.stop_id);
            const toNodeId = nodeIdByStopId.get(to.stop_id) ?? toBusStopNodeId(to.stop_id);
            const departMinutes = parseGtfsTimeToMinutes(from.departure_time);
            const arriveMinutes = parseGtfsTimeToMinutes(to.arrival_time);
            const durationMinutes = arriveMinutes - departMinutes;
            if (durationMinutes <= 0)
                continue;
            for (const bucket of buckets.values()) {
                const edgeKey = `${resolved.serviceId}__${fromNodeId}__${toNodeId}__${bucket}`;
                const edgeScheduleId = `${edgeKey}__gtfs`;
                let schedule = edgeMap.get(edgeKey);
                if (!schedule) {
                    schedule = {
                        edgeScheduleId,
                        serviceId: resolved.serviceId,
                        mode: "bus",
                        fromNodeId,
                        toNodeId,
                        calendarId: bucket,
                        timezone,
                        trips: [],
                        status,
                        source: params.options.source,
                        version: params.options.version,
                        importedAt: params.options.importedAt,
                    };
                    edgeMap.set(edgeKey, schedule);
                }
                schedule.trips.push({
                    departAt: formatMinutesAsHHmm(departMinutes),
                    arriveAt: formatMinutesAsHHmm(arriveMinutes),
                    departMinutes,
                    arriveMinutes,
                    durationMinutes,
                    tripCode: normalizeString(trip.trip_headsign) || trip.trip_id,
                    gtfsTripId: trip.trip_id,
                    routeVariant: null,
                    isShoppingTrip: false,
                    shoppingViaStops: [],
                    reservationRuleType: null,
                    reservationRuleNote: null,
                });
            }
        }
    }
    const transitEdgeSchedules = Array.from(edgeMap.values())
        .map((schedule) => {
        const seen = new Set();
        const uniqueTrips = schedule.trips
            .sort((a, b) => {
            if (a.departMinutes !== b.departMinutes)
                return a.departMinutes - b.departMinutes;
            if (a.arriveMinutes !== b.arriveMinutes)
                return a.arriveMinutes - b.arriveMinutes;
            return (a.gtfsTripId ?? "").localeCompare(b.gtfsTripId ?? "");
        })
            .filter((trip) => {
            const key = `${trip.gtfsTripId ?? ""}|${trip.departMinutes}|${trip.arriveMinutes}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        return schemas_1.transitEdgeScheduleRecordSchema.parse({
            ...schedule,
            trips: uniqueTrips,
        });
    })
        .sort((a, b) => a.edgeScheduleId.localeCompare(b.edgeScheduleId));
    return {
        transportNodes,
        transitServices,
        transitCalendars,
        transitEdgeSchedules,
        tripContextsByGtfsTripId,
    };
}
//# sourceMappingURL=mapper.js.map