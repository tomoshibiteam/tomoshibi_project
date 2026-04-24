import { describe, expect, it, vi } from "vitest";
import { saveSpot, SPOTS_COLLECTION } from "../spotRepository";
import { normalizeSpotData, validateSpotInput } from "../spotModel";
import { buildValidSpotInput } from "./spotTestData";

describe("saveSpot", () => {
  it("saves a valid spot to Firestore", async () => {
    const createMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockResolvedValue(undefined);

    const docMock = vi.fn().mockReturnValue({
      id: "uradome-coast",
      create: createMock,
      set: setMock,
    });

    const collectionMock = vi.fn().mockReturnValue({
      doc: docMock,
    });

    const dbMock = {
      collection: collectionMock,
    };

    const normalized = normalizeSpotData(validateSpotInput(buildValidSpotInput()));

    const resultId = await saveSpot({
      db: dbMock as never,
      spot: normalized,
      mode: "create",
      timestampFactory: () => "SERVER_TIMESTAMP",
    });

    expect(resultId).toBe("uradome-coast");
    expect(collectionMock).toHaveBeenCalledWith(SPOTS_COLLECTION);
    expect(createMock).toHaveBeenCalledTimes(1);

    const savedDoc = createMock.mock.calls[0]?.[0];
    expect(savedDoc).toMatchObject({
      id: "uradome-coast",
      slug: "uradome-coast",
      status: "published",
      searchText: expect.any(String),
      createdAt: "SERVER_TIMESTAMP",
      updatedAt: "SERVER_TIMESTAMP",
    });
    expect(setMock).not.toHaveBeenCalled();
  });
});
