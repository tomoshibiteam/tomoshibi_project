import { describe, expect, it } from "vitest";
import { filterOriginReturnStations, selectNextTripsFromEdgeSchedules } from "../repository";
import type { TransitEdgeScheduleRecord, TransportNodeRecord } from "../types";

describe("transit repository helpers", () => {
  it("returns station nodes usable for origin and return", () => {
    const nodes: TransportNodeRecord[] = [
      {
        nodeId: "iwami_station",
        nodeType: "station",
        nameJa: "岩美駅",
        location: { lat: 35.5740168, lng: 134.3354495 },
        isOriginCandidate: true,
        isReturnCandidate: true,
        linkedSpotId: "iwami-station",
        status: "active",
        source: "seed_mvp_v1",
        version: 1,
      },
      {
        nodeId: "dummy_bus_stop",
        nodeType: "bus_stop",
        nameJa: "バス停",
        location: { lat: 35.57, lng: 134.33 },
        isOriginCandidate: true,
        isReturnCandidate: true,
        linkedSpotId: null,
        status: "active",
        source: "seed_mvp_v1",
        version: 1,
      },
    ];

    const results = filterOriginReturnStations(nodes);
    expect(results).toHaveLength(1);
    expect(results[0]?.nodeId).toBe("iwami_station");
  });

  it("returns next trips for matching edge schedule", () => {
    const schedules: TransitEdgeScheduleRecord[] = [
      {
        edgeScheduleId: "edge_1",
        serviceId: "service_1",
        mode: "train",
        fromNodeId: "iwami_station",
        toNodeId: "oiwa_station",
        calendarId: "weekday",
        timezone: "Asia/Tokyo",
        status: "active",
        source: "seed_mvp_v1",
        version: 1,
        trips: [
          {
            departAt: "06:49",
            arriveAt: "06:53",
            departMinutes: 409,
            arriveMinutes: 413,
            durationMinutes: 4,
            tripCode: null,
          },
          {
            departAt: "07:32",
            arriveAt: "07:37",
            departMinutes: 452,
            arriveMinutes: 457,
            durationMinutes: 5,
            tripCode: null,
          },
          {
            departAt: "08:32",
            arriveAt: "08:36",
            departMinutes: 512,
            arriveMinutes: 516,
            durationMinutes: 4,
            tripCode: null,
          },
        ],
      },
    ];

    const trips = selectNextTripsFromEdgeSchedules(schedules, {
      fromNodeId: "iwami_station",
      toNodeId: "oiwa_station",
      mode: "train",
      calendarId: "weekday",
      afterMinutes: 450,
      limit: 2,
    });

    expect(trips).toHaveLength(2);
    expect(trips[0]?.departAt).toBe("07:32");
    expect(trips[1]?.departAt).toBe("08:32");
  });
});
