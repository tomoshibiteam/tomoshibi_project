import type { Firestore } from "firebase-admin/firestore";
import {
  BUS_STOP_CANDIDATES_SUBCOLLECTION,
  REFERENCE_DATA_COLLECTION,
  TRANSIT_CALENDARS_SUBCOLLECTION,
  TRANSIT_EDGE_SCHEDULES_SUBCOLLECTION,
  TRANSIT_ROOT_DOC_ID,
  TRANSIT_SERVICES_SUBCOLLECTION,
  TRANSPORT_NODES_SUBCOLLECTION,
} from "./constants";
import {
  busStopCandidateRecordSchema,
  transitCalendarRecordSchema,
  transitEdgeScheduleRecordSchema,
  transitServiceRecordSchema,
  transportNodeRecordSchema,
} from "./schemas";
import type {
  BusStopCandidateRecord,
  GetNextTripsParams,
  TransitCalendarRecord,
  TransitEdgeScheduleRecord,
  TransitServiceRecord,
  TransitStatus,
  TransitTrip,
  TransportNodeRecord,
} from "./types";

function transitRootDoc(db: Firestore) {
  return db.collection(REFERENCE_DATA_COLLECTION).doc(TRANSIT_ROOT_DOC_ID);
}

function transportNodesCollection(db: Firestore) {
  return transitRootDoc(db).collection(TRANSPORT_NODES_SUBCOLLECTION);
}

function transitServicesCollection(db: Firestore) {
  return transitRootDoc(db).collection(TRANSIT_SERVICES_SUBCOLLECTION);
}

function transitEdgeSchedulesCollection(db: Firestore) {
  return transitRootDoc(db).collection(TRANSIT_EDGE_SCHEDULES_SUBCOLLECTION);
}

function transitCalendarsCollection(db: Firestore) {
  return transitRootDoc(db).collection(TRANSIT_CALENDARS_SUBCOLLECTION);
}

function busStopCandidatesCollection(db: Firestore) {
  return transitRootDoc(db).collection(BUS_STOP_CANDIDATES_SUBCOLLECTION);
}

export async function upsertTransportNode(params: { db: Firestore; record: TransportNodeRecord }): Promise<void> {
  await transportNodesCollection(params.db).doc(params.record.nodeId).set(params.record, { merge: true });
}

export async function upsertTransitService(params: { db: Firestore; record: TransitServiceRecord }): Promise<void> {
  await transitServicesCollection(params.db).doc(params.record.serviceId).set(params.record, { merge: true });
}

export async function upsertTransitEdgeSchedule(params: {
  db: Firestore;
  record: TransitEdgeScheduleRecord;
}): Promise<void> {
  await transitEdgeSchedulesCollection(params.db).doc(params.record.edgeScheduleId).set(params.record, { merge: true });
}

export async function upsertTransitCalendar(params: { db: Firestore; record: TransitCalendarRecord }): Promise<void> {
  await transitCalendarsCollection(params.db).doc(params.record.calendarId).set(params.record, { merge: true });
}

export async function upsertBusStopCandidate(params: { db: Firestore; record: BusStopCandidateRecord }): Promise<void> {
  await busStopCandidatesCollection(params.db).doc(params.record.candidateId).set(params.record, { merge: true });
}

export function filterOriginReturnStations(
  nodes: TransportNodeRecord[],
  status: TransitStatus = "active",
): TransportNodeRecord[] {
  return nodes
    .filter((node) => node.nodeType === "station")
    .filter((node) => node.isOriginCandidate && node.isReturnCandidate)
    .filter((node) => node.status === status)
    .sort((a, b) => a.nameJa.localeCompare(b.nameJa, "ja"));
}

export async function listOriginReturnStations(params: {
  db: Firestore;
  status?: TransitStatus;
}): Promise<TransportNodeRecord[]> {
  const snapshot = await transportNodesCollection(params.db).get();
  const nodes = snapshot.docs.map((doc) => transportNodeRecordSchema.parse(doc.data()));
  return filterOriginReturnStations(nodes, params.status ?? "active");
}

export function selectNextTripsFromEdgeSchedules(
  schedules: TransitEdgeScheduleRecord[],
  params: GetNextTripsParams,
): TransitTrip[] {
  if (params.limit <= 0) return [];

  return schedules
    .filter(
      (schedule) =>
        schedule.status === "active" &&
        schedule.fromNodeId === params.fromNodeId &&
        schedule.toNodeId === params.toNodeId &&
        schedule.mode === params.mode &&
        schedule.calendarId === params.calendarId,
    )
    .flatMap((schedule) => schedule.trips)
    .filter((trip) => trip.departMinutes >= params.afterMinutes)
    .sort((a, b) => a.departMinutes - b.departMinutes)
    .slice(0, params.limit);
}

export async function getNextTrips(params: { db: Firestore } & GetNextTripsParams): Promise<TransitTrip[]> {
  const snapshot = await transitEdgeSchedulesCollection(params.db).get();
  const schedules = snapshot.docs.map((doc) => transitEdgeScheduleRecordSchema.parse(doc.data()));

  return selectNextTripsFromEdgeSchedules(schedules, params);
}

export async function getNode(params: { db: Firestore; nodeId: string }): Promise<TransportNodeRecord | null> {
  const snapshot = await transportNodesCollection(params.db).doc(params.nodeId).get();
  if (!snapshot.exists) return null;
  return transportNodeRecordSchema.parse(snapshot.data());
}

export async function getOutgoingSchedules(params: {
  db: Firestore;
  fromNodeId: string;
  mode: TransitServiceRecord["mode"];
  calendarId: string;
  status?: TransitStatus;
}): Promise<TransitEdgeScheduleRecord[]> {
  const snapshot = await transitEdgeSchedulesCollection(params.db).get();
  const schedules = snapshot.docs.map((doc) => transitEdgeScheduleRecordSchema.parse(doc.data()));
  const status = params.status ?? "active";

  return schedules
    .filter((schedule) => schedule.status === status)
    .filter((schedule) => schedule.fromNodeId === params.fromNodeId)
    .filter((schedule) => schedule.mode === params.mode)
    .filter((schedule) => schedule.calendarId === params.calendarId)
    .sort((a, b) => {
      const aNext = a.trips[0]?.departMinutes ?? Number.POSITIVE_INFINITY;
      const bNext = b.trips[0]?.departMinutes ?? Number.POSITIVE_INFINITY;
      if (aNext !== bNext) return aNext - bNext;
      return a.toNodeId.localeCompare(b.toNodeId);
    });
}

export async function listTransitServices(params: { db: Firestore; status?: TransitStatus }): Promise<TransitServiceRecord[]> {
  const snapshot = await transitServicesCollection(params.db).get();
  return snapshot.docs
    .map((doc) => transitServiceRecordSchema.parse(doc.data()))
    .filter((service) => service.status === (params.status ?? "active"));
}

export async function listTransitCalendars(params: { db: Firestore; status?: TransitStatus }): Promise<TransitCalendarRecord[]> {
  const snapshot = await transitCalendarsCollection(params.db).get();
  return snapshot.docs
    .map((doc) => transitCalendarRecordSchema.parse(doc.data()))
    .filter((calendar) => calendar.status === (params.status ?? "active"));
}

export async function listBusStopCandidates(params: { db: Firestore; status?: TransitStatus }): Promise<BusStopCandidateRecord[]> {
  const snapshot = await busStopCandidatesCollection(params.db).get();
  return snapshot.docs
    .map((doc) => busStopCandidateRecordSchema.parse(doc.data()))
    .filter((candidate) => candidate.status === (params.status ?? "active"))
    .sort((a, b) => {
      if (a.serviceId !== b.serviceId) return a.serviceId.localeCompare(b.serviceId);
      return a.stopOrder - b.stopOrder;
    });
}
