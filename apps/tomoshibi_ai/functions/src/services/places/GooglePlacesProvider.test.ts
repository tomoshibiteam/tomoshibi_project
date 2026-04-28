import { afterEach, describe, expect, it, vi } from "vitest";
import { GooglePlacesProvider } from "./GooglePlacesProvider";

describe("GooglePlacesProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Nearby Search with a minimal field mask and normalizes places", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          places: [
            {
              id: "ChIJ-test",
              name: "places/ChIJ-test",
              displayName: { text: "灯カフェ" },
              location: { latitude: 35.681236, longitude: 139.767125 },
              formattedAddress: "東京都千代田区",
              types: ["cafe", "food"],
              googleMapsUri: "https://maps.google.com/?cid=test",
              photos: [{ name: "places/ChIJ-test/photos/photo-1" }],
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const places = await new GooglePlacesProvider("test-key").searchNearby({
      origin: { lat: 35.68, lng: 139.76 },
      radiusMeters: 1200,
      languageCode: "ja",
      includedTypes: ["cafe", "quiet"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchNearby",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-goog-api-key": "test-key",
          "x-goog-fieldmask": expect.stringContaining("places.displayName"),
        }),
      }),
    );
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { includedTypes: string[] };
    expect(requestBody.includedTypes).toEqual(["cafe"]);
    expect(places).toEqual([
      expect.objectContaining({
        provider: "google_places",
        providerPlaceId: "ChIJ-test",
        name: "灯カフェ",
        lat: 35.681236,
        lng: 139.767125,
        types: ["cafe", "food"],
      }),
    ]);
  });

  it("requires an API key", async () => {
    await expect(
      new GooglePlacesProvider("").searchNearby({
        origin: { lat: 35.68, lng: 139.76 },
        radiusMeters: 1200,
      }),
    ).rejects.toThrow("GOOGLE_PLACES_API_KEY is not configured.");
  });

  it("fetches Place Details only when requested", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          id: "ChIJ-detail",
          name: "places/ChIJ-detail",
          displayName: { text: "詳しいカフェ" },
          location: { latitude: 35.681, longitude: 139.767 },
          formattedAddress: "東京都千代田区丸の内",
          types: ["cafe"],
          rating: 4.3,
          userRatingCount: 120,
          currentOpeningHours: { openNow: true },
          websiteUri: "https://example.com",
          googleMapsUri: "https://maps.google.com/?cid=detail",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const place = await new GooglePlacesProvider("test-key").getDetails({
      providerPlaceId: "ChIJ-detail",
      languageCode: "ja",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places/ChIJ-detail?languageCode=ja",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "x-goog-api-key": "test-key",
          "x-goog-fieldmask": expect.stringContaining("currentOpeningHours"),
        }),
      }),
    );
    expect(place).toEqual(
      expect.objectContaining({
        providerPlaceId: "ChIJ-detail",
        name: "詳しいカフェ",
        rating: 4.3,
        userRatingCount: 120,
        openNow: true,
        websiteUri: "https://example.com",
      }),
    );
  });
});
