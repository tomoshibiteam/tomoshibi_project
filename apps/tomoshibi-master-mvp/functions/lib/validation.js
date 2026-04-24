"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlanRequestInput = validatePlanRequestInput;
const zod_1 = require("zod");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const tripStyleSchema = zod_1.z.enum([constants_1.TRIP_STYLE.DAY_TRIP, constants_1.TRIP_STYLE.OVERNIGHT]);
const departureTypeSchema = zod_1.z.enum([constants_1.DEPARTURE_TYPE.IWAMI_STATION, constants_1.DEPARTURE_TYPE.CURRENT_LOCATION]);
const durationTypeSchema = zod_1.z.enum([constants_1.DURATION_TYPE.TWO_HOURS, constants_1.DURATION_TYPE.FOUR_HOURS, constants_1.DURATION_TYPE.CUSTOM]);
const returnTransportSchema = zod_1.z.enum([constants_1.RETURN_TRANSPORT.TRAIN, constants_1.RETURN_TRANSPORT.CAR]);
const returnStationIdSchema = zod_1.z.enum([constants_1.RETURN_STATION.IWAMI, constants_1.RETURN_STATION.HIGASHIHAMA, constants_1.RETURN_STATION.OIWA]);
const localTransportSchema = zod_1.z.enum([
    constants_1.LOCAL_TRANSPORT.WALK,
    constants_1.LOCAL_TRANSPORT.RENTAL_CYCLE,
    constants_1.LOCAL_TRANSPORT.CAR,
    constants_1.LOCAL_TRANSPORT.BUS,
]);
const departureLocationSchema = zod_1.z.object({
    lat: zod_1.z.number().finite().min(-90).max(90),
    lng: zod_1.z.number().finite().min(-180).max(180),
});
const rawPlanRequestInputSchema = zod_1.z.object({
    tripStyle: tripStyleSchema,
    departureType: departureTypeSchema,
    departureAt: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional(),
    departureLocation: departureLocationSchema.optional(),
    durationType: durationTypeSchema,
    customDurationMinutes: zod_1.z.number().int().min(1).optional(),
    returnTransport: returnTransportSchema,
    returnStationId: zod_1.z.union([returnStationIdSchema, zod_1.z.null()]).optional(),
    lodgingName: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional(),
    localTransports: zod_1.z.array(localTransportSchema).min(1, "localTransports must include at least one item"),
    desiredSpots: zod_1.z.array(zod_1.z.string()).optional(),
    tripPrompt: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional(),
});
function trimOrNull(value) {
    if (value == null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function isSupportedDepartureAt(value) {
    if (constants_1.HH_MM_PATTERN.test(value))
        return true;
    return constants_1.ISO_TIME_CAPTURE_PATTERN.test(value);
}
function toValidationIssueDetails(issues) {
    return issues.map((issue) => ({ path: issue.path, message: issue.message }));
}
function zodIssuesToValidationDetails(issues) {
    return issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "root",
        message: issue.message,
    }));
}
function ensureConditionalRules(input) {
    const issues = [];
    if (input.departureType === constants_1.DEPARTURE_TYPE.CURRENT_LOCATION && !input.departureLocation) {
        issues.push({
            path: "departureLocation",
            message: "departureLocation.lat and departureLocation.lng are required when departureType is current_location",
        });
    }
    if (input.tripStyle === constants_1.TRIP_STYLE.OVERNIGHT && !input.lodgingName) {
        issues.push({
            path: "lodgingName",
            message: "lodgingName is required when tripStyle is overnight",
        });
    }
    if (input.durationType === constants_1.DURATION_TYPE.CUSTOM && input.customDurationMinutes == null) {
        issues.push({
            path: "customDurationMinutes",
            message: "customDurationMinutes is required when durationType is custom",
        });
    }
    if (input.returnTransport === constants_1.RETURN_TRANSPORT.TRAIN && !input.returnStationId) {
        issues.push({
            path: "returnStationId",
            message: "returnStationId is required when returnTransport is train",
        });
    }
    if (input.departureAt && !isSupportedDepartureAt(input.departureAt)) {
        issues.push({
            path: "departureAt",
            message: "departureAt must be HH:mm or ISO format",
        });
    }
    return issues;
}
function validatePlanRequestInput(rawInput) {
    const parseResult = rawPlanRequestInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
        const details = zodIssuesToValidationDetails(parseResult.error.issues);
        throw new errors_1.PlanRequestValidationError("Invalid request payload", details);
    }
    const data = parseResult.data;
    const normalizedInput = {
        tripStyle: data.tripStyle,
        departureType: data.departureType,
        departureAt: trimOrNull(data.departureAt),
        departureLocation: data.departureLocation,
        durationType: data.durationType,
        customDurationMinutes: data.customDurationMinutes,
        returnTransport: data.returnTransport,
        returnStationId: data.returnStationId ?? null,
        lodgingName: trimOrNull(data.lodgingName),
        localTransports: data.localTransports,
        desiredSpots: data.desiredSpots ?? [],
        tripPrompt: trimOrNull(data.tripPrompt),
    };
    const conditionalIssues = ensureConditionalRules(normalizedInput);
    if (conditionalIssues.length > 0) {
        throw new errors_1.PlanRequestValidationError(conditionalIssues[0]?.message ?? "Invalid request payload", toValidationIssueDetails(conditionalIssues));
    }
    return normalizedInput;
}
//# sourceMappingURL=validation.js.map