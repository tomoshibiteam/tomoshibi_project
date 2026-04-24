import { afterEach, describe, expect, it, vi } from "vitest";
import { computeRouteMatrix } from "../routing/googleRoutesMatrix";

const ORIGINAL_API_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

afterEach(() => {
  if (ORIGINAL_API_KEY == null) {
    delete process.env.GOOGLE_MAPS_SERVER_API_KEY;
  } else {
    process.env.GOOGLE_MAPS_SERVER_API_KEY = ORIGINAL_API_KEY;
  }
  vi.unstubAllGlobals();
});

describe("computeRouteMatrix", () => {
  it("parses matrix lines into duration/distance maps", async () => {
    process.env.GOOGLE_MAPS_SERVER_API_KEY = "dummy-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        [
          JSON.stringify({
            originIndex: 0,
            destinationIndex: 1,
            condition: "ROUTE_EXISTS",
            duration: "840s",
            distanceMeters: 11200,
          }),
          JSON.stringify({
            originIndex: 1,
            destinationIndex: 0,
            condition: "ROUTE_EXISTS",
            duration: "900s",
            distanceMeters: 11000,
          }),
        ].join("\n"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await computeRouteMatrix({
      mode: "car",
      locations: [
        { id: "a", lat: 35.57, lng: 134.33 },
        { id: "b", lat: 35.59, lng: 134.36 },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.durationsMinutes.a.b).toBe(14);
    expect(result.distancesMeters.a.b).toBe(11200);
    expect(result.durationsMinutes.b.a).toBe(15);
    expect(result.unresolvedPairs).toHaveLength(0);
  });

  it("throws when API key is not configured", async () => {
    delete process.env.GOOGLE_MAPS_SERVER_API_KEY;

    await expect(
      computeRouteMatrix({
        mode: "walk",
        locations: [
          { id: "a", lat: 35.57, lng: 134.33 },
          { id: "b", lat: 35.59, lng: 134.36 },
        ],
      }),
    ).rejects.toThrow(/API key/i);
  });
});

