"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertTransportNode = upsertTransportNode;
exports.upsertTransitService = upsertTransitService;
exports.upsertTransitEdgeSchedule = upsertTransitEdgeSchedule;
exports.upsertTransitCalendar = upsertTransitCalendar;
exports.upsertBusStopCandidate = upsertBusStopCandidate;
exports.filterOriginReturnStations = filterOriginReturnStations;
exports.listOriginReturnStations = listOriginReturnStations;
exports.selectNextTripsFromEdgeSchedules = selectNextTripsFromEdgeSchedules;
exports.getNextTrips = getNextTrips;
exports.getNode = getNode;
exports.getOutgoingSchedules = getOutgoingSchedules;
exports.listTransitServices = listTransitServices;
exports.listTransitCalendars = listTransitCalendars;
exports.listBusStopCandidates = listBusStopCandidates;
const constants_1 = require("./constants");
const schemas_1 = require("./schemas");
function transitRootDoc(db) {
    return db.collection(constants_1.REFERENCE_DATA_COLLECTION).doc(constants_1.TRANSIT_ROOT_DOC_ID);
}
function transportNodesCollection(db) {
    return transitRootDoc(db).collection(constants_1.TRANSPORT_NODES_SUBCOLLECTION);
}
function transitServicesCollection(db) {
    return transitRootDoc(db).collection(constants_1.TRANSIT_SERVICES_SUBCOLLECTION);
}
function transitEdgeSchedulesCollection(db) {
    return transitRootDoc(db).collection(constants_1.TRANSIT_EDGE_SCHEDULES_SUBCOLLECTION);
}
function transitCalendarsCollection(db) {
    return transitRootDoc(db).collection(constants_1.TRANSIT_CALENDARS_SUBCOLLECTION);
}
function busStopCandidatesCollection(db) {
    return transitRootDoc(db).collection(constants_1.BUS_STOP_CANDIDATES_SUBCOLLECTION);
}
async function upsertTransportNode(params) {
    await transportNodesCollection(params.db).doc(params.record.nodeId).set(params.record, { merge: true });
}
async function upsertTransitService(params) {
    await transitServicesCollection(params.db).doc(params.record.serviceId).set(params.record, { merge: true });
}
async function upsertTransitEdgeSchedule(params) {
    await transitEdgeSchedulesCollection(params.db).doc(params.record.edgeScheduleId).set(params.record, { merge: true });
}
async function upsertTransitCalendar(params) {
    await transitCalendarsCollection(params.db).doc(params.record.calendarId).set(params.record, { merge: true });
}
async function upsertBusStopCandidate(params) {
    await busStopCandidatesCollection(params.db).doc(params.record.candidateId).set(params.record, { merge: true });
}
function filterOriginReturnStations(nodes, status = "active") {
    return nodes
        .filter((node) => node.nodeType === "station")
        .filter((node) => node.isOriginCandidate && node.isReturnCandidate)
        .filter((node) => node.status === status)
        .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));
}
async function listOriginReturnStations(params) {
    const snapshot = await transportNodesCollection(params.db).get();
    const nodes = snapshot.docs.map((doc) => schemas_1.transportNodeRecordSchema.parse(doc.data()));
    return filterOriginReturnStations(nodes, params.status ?? "active");
}
function selectNextTripsFromEdgeSchedules(schedules, params) {
    if (params.limit <= 0)
        return [];
    return schedules
        .filter((schedule) => schedule.status === "active" &&
        schedule.fromNodeId === params.fromNodeId &&
        schedule.toNodeId === params.toNodeId &&
        schedule.mode === params.mode &&
        schedule.calendarId === params.calendarId)
        .flatMap((schedule) => schedule.trips)
        .filter((trip) => trip.departMinutes >= params.afterMinutes)
        .sort((a, b) => a.departMinutes - b.departMinutes)
        .slice(0, params.limit);
}
async function getNextTrips(params) {
    const snapshot = await transitEdgeSchedulesCollection(params.db).get();
    const schedules = snapshot.docs.map((doc) => schemas_1.transitEdgeScheduleRecordSchema.parse(doc.data()));
    return selectNextTripsFromEdgeSchedules(schedules, params);
}
async function getNode(params) {
    const snapshot = await transportNodesCollection(params.db).doc(params.nodeId).get();
    if (!snapshot.exists)
        return null;
    return schemas_1.transportNodeRecordSchema.parse(snapshot.data());
}
async function getOutgoingSchedules(params) {
    const snapshot = await transitEdgeSchedulesCollection(params.db).get();
    const schedules = snapshot.docs.map((doc) => schemas_1.transitEdgeScheduleRecordSchema.parse(doc.data()));
    const status = params.status ?? "active";
    return schedules
        .filter((schedule) => schedule.status === status)
        .filter((schedule) => schedule.fromNodeId === params.fromNodeId)
        .filter((schedule) => schedule.mode === params.mode)
        .filter((schedule) => schedule.calendarId === params.calendarId)
        .sort((a, b) => {
        const aNext = a.trips[0]?.departMinutes ?? Number.POSITIVE_INFINITY;
        const bNext = b.trips[0]?.departMinutes ?? Number.POSITIVE_INFINITY;
        if (aNext !== bNext)
            return aNext - bNext;
        return a.toNodeId.localeCompare(b.toNodeId);
    });
}
async function listTransitServices(params) {
    const snapshot = await transitServicesCollection(params.db).get();
    return snapshot.docs
        .map((doc) => schemas_1.transitServiceRecordSchema.parse(doc.data()))
        .filter((service) => service.status === (params.status ?? "active"));
}
async function listTransitCalendars(params) {
    const snapshot = await transitCalendarsCollection(params.db).get();
    return snapshot.docs
        .map((doc) => schemas_1.transitCalendarRecordSchema.parse(doc.data()))
        .filter((calendar) => calendar.status === (params.status ?? "active"));
}
async function listBusStopCandidates(params) {
    const snapshot = await busStopCandidatesCollection(params.db).get();
    return snapshot.docs
        .map((doc) => schemas_1.busStopCandidateRecordSchema.parse(doc.data()))
        .filter((candidate) => candidate.status === (params.status ?? "active"))
        .sort((a, b) => {
        if (a.serviceId !== b.serviceId)
            return a.serviceId.localeCompare(b.serviceId);
        return a.stopOrder - b.stopOrder;
    });
}
//# sourceMappingURL=repository.js.map