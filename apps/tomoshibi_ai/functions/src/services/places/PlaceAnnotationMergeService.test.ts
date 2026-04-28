import { describe, expect, it } from "vitest";
import type { NormalizedPlace, PlaceAnnotation } from "../../types/place";
import { PlaceAnnotationMergeService } from "./PlaceAnnotationMergeService";

describe("PlaceAnnotationMergeService", () => {
  it("merges local tags, story, and partner links by providerPlaceId", () => {
    const places: NormalizedPlace[] = [{ provider: "mock", providerPlaceId: "place_1", name: "Harbor View", lat: 35, lng: 139, types: ["park"], tomoshibiTags: ["scenic"] }];
    const annotations: PlaceAnnotation[] = [{
      id: "annotation_1",
      areaId: "iki",
      providerPlaceId: "place_1",
      name: "Harbor View",
      tomoshibiTags: ["local_story", "scenic"],
      localStory: { short: "地元で親しまれている港の景色です。", source: "own_db" },
      partner: { isPartner: true, linkIds: ["partner_1"] },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }];
    const [merged] = new PlaceAnnotationMergeService().merge(places, annotations);
    expect(merged.tomoshibiTags).toEqual(["scenic", "local_story"]);
    expect(merged.localStory?.short).toBe("地元で親しまれている港の景色です。");
    expect(merged.partnerLinkIds).toEqual(["partner_1"]);
  });
});
