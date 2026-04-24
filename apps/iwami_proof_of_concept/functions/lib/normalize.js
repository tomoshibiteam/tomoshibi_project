"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePlanRequest = normalizePlanRequest;
const constants_1 = require("./constants");
function dedupeStrings(values) {
    const out = [];
    const seen = new Set();
    for (const rawValue of values) {
        const normalized = rawValue.trim();
        if (!normalized)
            continue;
        if (seen.has(normalized))
            continue;
        seen.add(normalized);
        out.push(normalized);
    }
    return out;
}
function dedupeLocalTransports(values) {
    const out = [];
    const seen = new Set();
    for (const value of values) {
        if (seen.has(value))
            continue;
        seen.add(value);
        out.push(value);
    }
    return out;
}
function normalizeDepartureAt(value) {
    if (!value)
        return null;
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    if (constants_1.HH_MM_PATTERN.test(trimmed)) {
        return trimmed;
    }
    const isoMatch = trimmed.match(constants_1.ISO_TIME_CAPTURE_PATTERN);
    if (isoMatch) {
        return `${isoMatch[1]}:${isoMatch[2]}`;
    }
    return null;
}
function toDurationMinutes(input) {
    if (input.durationType === constants_1.DURATION_TYPE.CUSTOM) {
        return input.customDurationMinutes ?? 0;
    }
    return constants_1.DURATION_TYPE_TO_MINUTES[input.durationType];
}
function toReturnConstraint(input) {
    if (input.returnTransport === constants_1.RETURN_TRANSPORT.TRAIN) {
        return {
            type: "train_station",
            stationId: input.returnStationId ?? "iwami_station",
        };
    }
    return { type: "free" };
}
function normalizePlanRequest(input) {
    const localTransports = dedupeLocalTransports(input.localTransports);
    const desiredSpots = dedupeStrings(input.desiredSpots);
    const tripPrompt = (input.tripPrompt ?? "").trim();
    const requiresCyclePickup = localTransports.includes(constants_1.LOCAL_TRANSPORT.RENTAL_CYCLE);
    const cyclePickupLocationId = requiresCyclePickup ? constants_1.IWAMI_TOURISM_ASSOCIATION_ID : null;
    const origin = input.departureType === constants_1.DEPARTURE_TYPE.IWAMI_STATION
        ? constants_1.IWAMI_STATION_ORIGIN
        : {
            type: constants_1.DEPARTURE_TYPE.CURRENT_LOCATION,
            lat: input.departureLocation?.lat ?? 0,
            lng: input.departureLocation?.lng ?? 0,
        };
    return {
        tripStyle: input.tripStyle,
        origin,
        departureAt: normalizeDepartureAt(input.departureAt),
        durationMinutes: toDurationMinutes(input),
        returnTransport: input.returnTransport,
        returnConstraint: toReturnConstraint(input),
        lodgingName: input.tripStyle === constants_1.TRIP_STYLE.OVERNIGHT ? (input.lodgingName ?? null) : null,
        localTransports,
        desiredSpots,
        tripPrompt,
        requiresCyclePickup,
        cyclePickupLocationId,
    };
}
//# sourceMappingURL=normalize.js.map