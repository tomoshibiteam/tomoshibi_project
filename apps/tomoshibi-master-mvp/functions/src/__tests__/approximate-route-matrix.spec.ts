import { describe, expect, it } from "vitest";
import { computeApproximateRouteMatrix } from "../routing/approximateRouteMatrix";

describe("computeApproximateRouteMatrix", () => {
  it("computes deterministic matrix without external API key", async () => {
    const result = await computeApproximateRouteMatrix({
      mode: "walk",
      locations: [
        { id: "origin", lat: 35.5740168, lng: 134.3354495 },
        { id: "spot", lat: 35.590391, lng: 134.327783 },
      ],
    });

    expect(result.source).toBe("approximate");
    expect(result.unresolvedPairs).toHaveLength(0);
    expect(result.durationsMinutes.origin.origin).toBe(0);
    expect(result.distancesMeters.origin.origin).toBe(0);
    expect(result.distancesMeters.origin.spot).toBeGreaterThan(0);
    expect(result.durationsMinutes.origin.spot).toBeGreaterThan(0);
  });

  it("keeps car faster than walk on the same pair", async () => {
    const locations = [
      { id: "a", lat: 35.5740168, lng: 134.3354495 },
      { id: "b", lat: 35.590391, lng: 134.327783 },
    ];

    const walk = await computeApproximateRouteMatrix({ mode: "walk", locations });
    const car = await computeApproximateRouteMatrix({ mode: "car", locations });

    expect(walk.durationsMinutes.a.b).toBeGreaterThan(car.durationsMinutes.a.b ?? 0);
  });
});
