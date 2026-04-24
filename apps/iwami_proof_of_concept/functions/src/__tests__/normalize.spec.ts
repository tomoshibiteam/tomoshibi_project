import { describe, expect, it } from "vitest";
import { normalizePlanRequest } from "../normalize";
import type { PlanRequestInput } from "../types";

function buildInput(overrides: Partial<PlanRequestInput> = {}): PlanRequestInput {
  return {
    tripStyle: "day_trip",
    departureType: "iwami_station",
    departureAt: "2026-04-22T09:15:00+09:00",
    durationType: "2h",
    returnTransport: "train",
    returnStationId: "iwami_station",
    lodgingName: null,
    localTransports: ["walk", "car"],
    desiredSpots: [],
    tripPrompt: null,
    ...overrides,
  };
}

describe("normalizePlanRequest", () => {
  it("maps 2h to 120 minutes", () => {
    const normalized = normalizePlanRequest(buildInput({ durationType: "2h" }));
    expect(normalized.durationMinutes).toBe(120);
  });

  it("maps 4h to 240 minutes", () => {
    const normalized = normalizePlanRequest(buildInput({ durationType: "4h" }));
    expect(normalized.durationMinutes).toBe(240);
  });

  it("maps custom 180 to 180 minutes", () => {
    const normalized = normalizePlanRequest(
      buildInput({
        durationType: "custom",
        customDurationMinutes: 180,
      }),
    );
    expect(normalized.durationMinutes).toBe(180);
  });

  it("enables cycle pickup flags when rental_cycle is included", () => {
    const normalized = normalizePlanRequest(
      buildInput({
        localTransports: ["walk", "rental_cycle", "rental_cycle"],
      }),
    );
    expect(normalized.requiresCyclePickup).toBe(true);
    expect(normalized.cyclePickupLocationId).toBe("iwami-tourism-association");
  });

  it("normalizes returnConstraint for train return", () => {
    const normalized = normalizePlanRequest(
      buildInput({
        returnTransport: "train",
        returnStationId: "higashihama_station",
      }),
    );
    expect(normalized.returnConstraint).toEqual({
      type: "train_station",
      stationId: "higashihama_station",
    });
  });

  it("normalizes returnConstraint as free when returnTransport is car", () => {
    const normalized = normalizePlanRequest(
      buildInput({
        returnTransport: "car",
        returnStationId: null,
      }),
    );
    expect(normalized.returnConstraint).toEqual({
      type: "free",
    });
  });

  it("normalizes returnConstraint for oiwa_station", () => {
    const normalized = normalizePlanRequest(
      buildInput({
        returnTransport: "train",
        returnStationId: "oiwa_station",
      }),
    );
    expect(normalized.returnConstraint).toEqual({
      type: "train_station",
      stationId: "oiwa_station",
    });
  });
});
