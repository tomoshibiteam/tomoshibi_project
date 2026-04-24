import type { Firestore } from "firebase-admin/firestore";
import type { BusStopCandidateRecord, GetNextTripsParams, TransitCalendarRecord, TransitEdgeScheduleRecord, TransitServiceRecord, TransitStatus, TransitTrip, TransportNodeRecord } from "./types";
export declare function upsertTransportNode(params: {
    db: Firestore;
    record: TransportNodeRecord;
}): Promise<void>;
export declare function upsertTransitService(params: {
    db: Firestore;
    record: TransitServiceRecord;
}): Promise<void>;
export declare function upsertTransitEdgeSchedule(params: {
    db: Firestore;
    record: TransitEdgeScheduleRecord;
}): Promise<void>;
export declare function upsertTransitCalendar(params: {
    db: Firestore;
    record: TransitCalendarRecord;
}): Promise<void>;
export declare function upsertBusStopCandidate(params: {
    db: Firestore;
    record: BusStopCandidateRecord;
}): Promise<void>;
export declare function filterOriginReturnStations(nodes: TransportNodeRecord[], status?: TransitStatus): TransportNodeRecord[];
export declare function listOriginReturnStations(params: {
    db: Firestore;
    status?: TransitStatus;
}): Promise<TransportNodeRecord[]>;
export declare function selectNextTripsFromEdgeSchedules(schedules: TransitEdgeScheduleRecord[], params: GetNextTripsParams): TransitTrip[];
export declare function getNextTrips(params: {
    db: Firestore;
} & GetNextTripsParams): Promise<TransitTrip[]>;
export declare function getNode(params: {
    db: Firestore;
    nodeId: string;
}): Promise<TransportNodeRecord | null>;
export declare function getOutgoingSchedules(params: {
    db: Firestore;
    fromNodeId: string;
    mode: TransitServiceRecord["mode"];
    calendarId: string;
    status?: TransitStatus;
}): Promise<TransitEdgeScheduleRecord[]>;
export declare function listTransitServices(params: {
    db: Firestore;
    status?: TransitStatus;
}): Promise<TransitServiceRecord[]>;
export declare function listTransitCalendars(params: {
    db: Firestore;
    status?: TransitStatus;
}): Promise<TransitCalendarRecord[]>;
export declare function listBusStopCandidates(params: {
    db: Firestore;
    status?: TransitStatus;
}): Promise<BusStopCandidateRecord[]>;
