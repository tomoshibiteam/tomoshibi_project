"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hhmmToMinutes = hhmmToMinutes;
exports.buildTransitTrip = buildTransitTrip;
exports.buildTransitEdgeScheduleRecord = buildTransitEdgeScheduleRecord;
const constants_1 = require("./constants");
const schemas_1 = require("./schemas");
const HH_MM_CAPTURE_PATTERN = /^(\d{1,2}):([0-5]\d)$/;
function hhmmToMinutes(value) {
    const match = value.match(HH_MM_CAPTURE_PATTERN);
    if (!match) {
        throw new Error(`time must be HH:mm: ${value}`);
    }
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 47) {
        throw new Error(`time hour must be <=47: ${value}`);
    }
    return hour * 60 + minute;
}
function buildTransitTrip(seed) {
    const departMinutes = hhmmToMinutes(seed.departAt);
    const arriveMinutes = hhmmToMinutes(seed.arriveAt);
    const durationMinutes = arriveMinutes - departMinutes;
    if (durationMinutes <= 0) {
        throw new Error(`arriveAt must be later than departAt: ${seed.departAt} -> ${seed.arriveAt}`);
    }
    return schemas_1.transitTripSchema.parse({
        departAt: seed.departAt,
        arriveAt: seed.arriveAt,
        departMinutes,
        arriveMinutes,
        durationMinutes,
        tripCode: seed.tripCode ?? null,
    });
}
function buildTransitEdgeScheduleRecord(seed) {
    const trips = seed.trips.map(buildTransitTrip).sort((a, b) => a.departMinutes - b.departMinutes);
    return schemas_1.transitEdgeScheduleRecordSchema.parse({
        ...seed,
        trips,
        source: constants_1.TRANSIT_SEED_SOURCE,
        version: constants_1.TRANSIT_SEED_VERSION,
    });
}
//# sourceMappingURL=seedModel.js.map