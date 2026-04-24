import { describe, expect, it } from "vitest";
import { selectNextTripsFromEdgeSchedules } from "../../../repository";
import { mapGtfsToTransit } from "../mapper";
import { applyGtfsOverlays } from "../overlays";
import type { ParsedGtfsData } from "../types";

function buildParsedGtfsFixture(): ParsedGtfsData {
  return {
    sourcePath: "/tmp/iwami-gtfs-fixture",
    stops: [
      { stop_id: "st_iwami", stop_name: "岩美駅", stop_lat: "35.5740168", stop_lon: "134.3354495" },
      { stop_id: "st_sunmart", stop_name: "サンマート岩美店", stop_lat: "35.5750000", stop_lon: "134.3360000" },
      { stop_id: "st_kinanse", stop_name: "道の駅きなんせ岩美", stop_lat: "35.5780000", stop_lon: "134.3380000" },
      { stop_id: "st_tago", stop_name: "田後", stop_lat: "35.6000000", stop_lon: "134.3600000" },
      { stop_id: "st_kugami", stop_name: "西陸上", stop_lat: "35.6100000", stop_lon: "134.3800000" },
      { stop_id: "st_higashihama", stop_name: "東浜駅", stop_lat: "35.599669", stop_lon: "134.3627158" },
    ],
    routes: [
      { route_id: "r_oda", route_short_name: "小田線", route_long_name: "小田線" },
      { route_id: "r_tago", route_short_name: "田後・陸上線", route_long_name: "田後・陸上線" },
    ],
    trips: [
      { route_id: "r_oda", service_id: "svc_weekday", trip_id: "trip_oda_1", direction_id: "0" },
      { route_id: "r_oda", service_id: "svc_weekday", trip_id: "trip_oda_2", direction_id: "0" },
      { route_id: "r_tago", service_id: "svc_weekday", trip_id: "trip_tago_shop", direction_id: "0" },
      { route_id: "r_tago", service_id: "svc_weekday", trip_id: "trip_tago_term", direction_id: "0" },
      { route_id: "r_tago", service_id: "svc_weekend", trip_id: "trip_tago_direct", direction_id: "1" },
    ],
    stopTimes: [
      { trip_id: "trip_oda_1", arrival_time: "09:10:00", departure_time: "09:10:00", stop_id: "st_iwami", stop_sequence: "1" },
      { trip_id: "trip_oda_1", arrival_time: "09:20:00", departure_time: "09:20:00", stop_id: "st_sunmart", stop_sequence: "2" },
      { trip_id: "trip_oda_1", arrival_time: "09:30:00", departure_time: "09:30:00", stop_id: "st_kinanse", stop_sequence: "3" },

      { trip_id: "trip_oda_2", arrival_time: "08:10:00", departure_time: "08:10:00", stop_id: "st_iwami", stop_sequence: "1" },
      { trip_id: "trip_oda_2", arrival_time: "08:20:00", departure_time: "08:20:00", stop_id: "st_sunmart", stop_sequence: "2" },
      { trip_id: "trip_oda_2", arrival_time: "08:30:00", departure_time: "08:30:00", stop_id: "st_kinanse", stop_sequence: "3" },

      { trip_id: "trip_tago_shop", arrival_time: "10:00:00", departure_time: "10:00:00", stop_id: "st_iwami", stop_sequence: "1" },
      { trip_id: "trip_tago_shop", arrival_time: "10:05:00", departure_time: "10:05:00", stop_id: "st_sunmart", stop_sequence: "2" },
      { trip_id: "trip_tago_shop", arrival_time: "10:10:00", departure_time: "10:10:00", stop_id: "st_kinanse", stop_sequence: "3" },
      { trip_id: "trip_tago_shop", arrival_time: "10:20:00", departure_time: "10:20:00", stop_id: "st_tago", stop_sequence: "4" },
      { trip_id: "trip_tago_shop", arrival_time: "10:35:00", departure_time: "10:35:00", stop_id: "st_kugami", stop_sequence: "5" },

      { trip_id: "trip_tago_term", arrival_time: "11:00:00", departure_time: "11:00:00", stop_id: "st_iwami", stop_sequence: "1" },
      { trip_id: "trip_tago_term", arrival_time: "11:08:00", departure_time: "11:08:00", stop_id: "st_sunmart", stop_sequence: "2" },
      { trip_id: "trip_tago_term", arrival_time: "11:20:00", departure_time: "11:20:00", stop_id: "st_tago", stop_sequence: "3" },

      { trip_id: "trip_tago_direct", arrival_time: "12:00:00", departure_time: "12:00:00", stop_id: "st_iwami", stop_sequence: "1" },
      { trip_id: "trip_tago_direct", arrival_time: "12:08:00", departure_time: "12:08:00", stop_id: "st_sunmart", stop_sequence: "2" },
      { trip_id: "trip_tago_direct", arrival_time: "12:22:00", departure_time: "12:22:00", stop_id: "st_kugami", stop_sequence: "3" },
      {
        trip_id: "trip_tago_direct",
        arrival_time: "12:30:00",
        departure_time: "12:30:00",
        stop_id: "st_higashihama",
        stop_sequence: "4",
      },
    ],
    calendars: [
      {
        service_id: "svc_weekday",
        monday: "1",
        tuesday: "1",
        wednesday: "1",
        thursday: "1",
        friday: "1",
        saturday: "0",
        sunday: "0",
        start_date: "20260401",
        end_date: "20270331",
      },
      {
        service_id: "svc_weekend",
        monday: "0",
        tuesday: "0",
        wednesday: "0",
        thursday: "0",
        friday: "0",
        saturday: "1",
        sunday: "1",
        start_date: "20260401",
        end_date: "20270331",
      },
    ],
    calendarDates: [],
  };
}

describe("GTFS importer", () => {
  it("maps stops to transportNodes(bus_stop) with exact coordinates", () => {
    const mapped = mapGtfsToTransit({
      parsed: buildParsedGtfsFixture(),
      options: {
        source: "gtfs_jp_import_v1",
        version: 1,
        importedAt: "2026-04-23T00:00:00.000Z",
        timezone: "Asia/Tokyo",
        status: "active",
      },
    });

    expect(mapped.transportNodes.length).toBeGreaterThan(0);
    const iwamiNode = mapped.transportNodes.find((node) => node.nodeId === "gtfs_bus_stop_st_iwami");
    expect(iwamiNode).toBeDefined();
    expect(iwamiNode?.nodeType).toBe("bus_stop");
    expect(iwamiNode?.location.lat).toBeCloseTo(35.5740168, 6);
    expect(iwamiNode?.location.lng).toBeCloseTo(134.3354495, 6);
  });

  it("builds edge schedules from stop_times and guarantees departMinutes ascending", () => {
    const mapped = mapGtfsToTransit({
      parsed: buildParsedGtfsFixture(),
      options: {
        source: "gtfs_jp_import_v1",
        version: 1,
        importedAt: "2026-04-23T00:00:00.000Z",
        timezone: "Asia/Tokyo",
        status: "active",
      },
    });

    const odaEdge = mapped.transitEdgeSchedules.find(
      (schedule) =>
        schedule.serviceId === "bus_iwami_oda_line" &&
        schedule.calendarId === "weekday" &&
        schedule.fromNodeId === "gtfs_bus_stop_st_iwami" &&
        schedule.toNodeId === "gtfs_bus_stop_st_sunmart",
    );

    expect(odaEdge).toBeDefined();
    expect(odaEdge?.trips.length).toBe(2);
    expect(odaEdge?.trips[0]?.departMinutes).toBe(8 * 60 + 10);
    expect(odaEdge?.trips[1]?.departMinutes).toBe(9 * 60 + 10);
  });

  it("supports bus next-trip lookup through edge schedules", () => {
    const mapped = mapGtfsToTransit({
      parsed: buildParsedGtfsFixture(),
      options: {
        source: "gtfs_jp_import_v1",
        version: 1,
        importedAt: "2026-04-23T00:00:00.000Z",
        timezone: "Asia/Tokyo",
        status: "active",
      },
    });

    const trips = selectNextTripsFromEdgeSchedules(mapped.transitEdgeSchedules, {
      fromNodeId: "gtfs_bus_stop_st_iwami",
      toNodeId: "gtfs_bus_stop_st_sunmart",
      mode: "bus",
      calendarId: "weekday",
      afterMinutes: 9 * 60,
      limit: 3,
    });

    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0]?.departMinutes).toBeGreaterThanOrEqual(9 * 60);
    expect(trips.every((trip) => trip.departMinutes >= 9 * 60)).toBe(true);
  });

  it("applies overlays for shoppingTrip / routeVariant / reservationRule", () => {
    const mapped = mapGtfsToTransit({
      parsed: buildParsedGtfsFixture(),
      options: {
        source: "gtfs_jp_import_v1",
        version: 1,
        importedAt: "2026-04-23T00:00:00.000Z",
        timezone: "Asia/Tokyo",
        status: "active",
      },
    });

    const overlaid = applyGtfsOverlays(mapped);

    const tagoShopTrips = overlaid.transitEdgeSchedules
      .filter((schedule) => schedule.serviceId === "bus_iwami_tago_kugami_line")
      .flatMap((schedule) => schedule.trips)
      .filter((trip) => trip.gtfsTripId === "trip_tago_shop");

    expect(tagoShopTrips.length).toBeGreaterThan(0);
    expect(tagoShopTrips.every((trip) => trip.routeVariant === "tago_to_kugami")).toBe(true);
    expect(tagoShopTrips.every((trip) => trip.isShoppingTrip === true)).toBe(true);
    expect(tagoShopTrips.every((trip) => (trip.shoppingViaStops ?? []).includes("サンマート岩美店"))).toBe(true);

    const odaTrips = overlaid.transitEdgeSchedules
      .filter((schedule) => schedule.serviceId === "bus_iwami_oda_line")
      .flatMap((schedule) => schedule.trips)
      .filter((trip) => trip.gtfsTripId === "trip_oda_1");

    expect(odaTrips.length).toBeGreaterThan(0);
    expect(odaTrips.every((trip) => trip.reservationRuleType === "partial_no_reservation")).toBe(true);
    expect(odaTrips.every((trip) => (trip.reservationRuleNote ?? "").includes("予約不要"))).toBe(true);
  });

  it("is idempotent on re-import when upserting by stable ids", () => {
    const runImport = () =>
      applyGtfsOverlays(
        mapGtfsToTransit({
          parsed: buildParsedGtfsFixture(),
          options: {
            source: "gtfs_jp_import_v1",
            version: 1,
            importedAt: "2026-04-23T00:00:00.000Z",
            timezone: "Asia/Tokyo",
            status: "active",
          },
        }),
      );

    const nodeStore = new Map<string, unknown>();
    const calendarStore = new Map<string, unknown>();
    const serviceStore = new Map<string, unknown>();
    const edgeStore = new Map<string, unknown>();

    const upsertAll = (data: ReturnType<typeof runImport>) => {
      data.transportNodes.forEach((node) => nodeStore.set(node.nodeId, node));
      data.transitCalendars.forEach((calendar) => calendarStore.set(calendar.calendarId, calendar));
      data.transitServices.forEach((service) => serviceStore.set(service.serviceId, service));
      data.transitEdgeSchedules.forEach((edge) => edgeStore.set(edge.edgeScheduleId, edge));
    };

    const first = runImport();
    upsertAll(first);
    const firstCounts = {
      nodes: nodeStore.size,
      calendars: calendarStore.size,
      services: serviceStore.size,
      edges: edgeStore.size,
    };

    const second = runImport();
    upsertAll(second);

    expect(nodeStore.size).toBe(firstCounts.nodes);
    expect(calendarStore.size).toBe(firstCounts.calendars);
    expect(serviceStore.size).toBe(firstCounts.services);
    expect(edgeStore.size).toBe(firstCounts.edges);
  });
});
