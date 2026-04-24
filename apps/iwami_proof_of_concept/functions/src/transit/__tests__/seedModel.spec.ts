import { describe, expect, it } from "vitest";
import { buildTransitEdgeScheduleRecord, buildTransitTrip, hhmmToMinutes } from "../seedModel";

describe("transit seed model", () => {
  it("converts HH:mm to minutes", () => {
    expect(hhmmToMinutes("06:43")).toBe(403);
    expect(hhmmToMinutes("23:08")).toBe(1388);
  });

  it("builds a trip with derived minute fields and duration", () => {
    const trip = buildTransitTrip({
      departAt: "06:43",
      arriveAt: "06:49",
      tripCode: null,
    });

    expect(trip).toMatchObject({
      departAt: "06:43",
      arriveAt: "06:49",
      departMinutes: 403,
      arriveMinutes: 409,
      durationMinutes: 6,
      tripCode: null,
    });
  });

  it("sorts trips by departMinutes when building edge schedule", () => {
    const edgeSchedule = buildTransitEdgeScheduleRecord({
      edgeScheduleId: "test_edge",
      serviceId: "test_service",
      mode: "train",
      fromNodeId: "iwami_station",
      toNodeId: "higashihama_station",
      calendarId: "weekday",
      timezone: "Asia/Tokyo",
      status: "active",
      trips: [
        { departAt: "08:33", arriveAt: "08:39", tripCode: null },
        { departAt: "06:36", arriveAt: "06:42", tripCode: null },
      ],
    });

    expect(edgeSchedule.trips[0]?.departAt).toBe("06:36");
    expect(edgeSchedule.trips[1]?.departAt).toBe("08:33");
  });
});
