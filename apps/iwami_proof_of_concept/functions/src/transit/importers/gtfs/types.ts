import type {
  TransitCalendarRecord,
  TransitEdgeScheduleRecord,
  TransitServiceRecord,
  TransitStatus,
  TransitTimezone,
  TransportNodeRecord,
} from "../../types";

export type GtfsStopRow = {
  stop_id: string;
  stop_name: string;
  stop_lat: string;
  stop_lon: string;
  parent_station?: string;
};

export type GtfsRouteRow = {
  route_id: string;
  route_short_name?: string;
  route_long_name?: string;
  route_desc?: string;
};

export type GtfsTripRow = {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: string;
};

export type GtfsStopTimeRow = {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
};

export type GtfsCalendarRow = {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string;
  end_date: string;
};

export type GtfsCalendarDateRow = {
  service_id: string;
  date: string;
  exception_type: string;
};

export type ParsedGtfsData = {
  sourcePath: string;
  stops: GtfsStopRow[];
  routes: GtfsRouteRow[];
  trips: GtfsTripRow[];
  stopTimes: GtfsStopTimeRow[];
  calendars: GtfsCalendarRow[];
  calendarDates: GtfsCalendarDateRow[];
};

export type GtfsImportOptions = {
  source: string;
  version: number;
  importedAt: string;
  status?: TransitStatus;
  timezone?: TransitTimezone;
};

export type GtfsTripContext = {
  gtfsTripId: string;
  serviceId: string;
  stopNames: string[];
  stopNodeIds: string[];
};

export type MappedTransitData = {
  transportNodes: TransportNodeRecord[];
  transitServices: TransitServiceRecord[];
  transitCalendars: TransitCalendarRecord[];
  transitEdgeSchedules: TransitEdgeScheduleRecord[];
  tripContextsByGtfsTripId: Record<string, GtfsTripContext>;
};
