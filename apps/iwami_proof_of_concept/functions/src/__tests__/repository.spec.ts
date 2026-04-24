import { describe, expect, it, vi } from "vitest";
import { PLAN_GENERATION_STAGE, PLAN_REQUESTS_COLLECTION, PLAN_REQUEST_STATUS } from "../constants";
import { getPlanRequestByIdAndPollToken, savePlanRequest } from "../repository";
import type { NormalizedPlanRequest } from "../types";

describe("savePlanRequest", () => {
  it("saves rawInput and normalizedRequest with queued status", async () => {
    const addMock = vi.fn().mockResolvedValue({ id: "plan_request_001" });
    const collectionMock = vi.fn().mockReturnValue({
      add: addMock,
      doc: vi.fn(),
    });

    const dbMock = {
      collection: collectionMock,
    };

    const rawInput = {
      tripStyle: "day_trip",
      departureType: "iwami_station",
      durationType: "2h",
      returnTransport: "train",
      returnStationId: "iwami_station",
      localTransports: ["walk"],
    };

    const normalizedRequest: NormalizedPlanRequest = {
      tripStyle: "day_trip",
      origin: {
        type: "station",
        id: "iwami_station",
        name: "岩美駅",
      },
      departureAt: "09:30",
      durationMinutes: 120,
      returnTransport: "train",
      returnConstraint: {
        type: "train_station",
        stationId: "iwami_station",
      },
      lodgingName: null,
      localTransports: ["walk"],
      desiredSpots: ["浦富海岸"],
      tripPrompt: "海を見たい",
      requiresCyclePickup: false,
      cyclePickupLocationId: null,
    };

    const response = await savePlanRequest({
      db: dbMock,
      rawInput,
      normalizedRequest,
      prompt: "prompt text",
      pollToken: "poll-token-001",
      timestampFactory: () => "SERVER_TIMESTAMP",
    });

    expect(response).toEqual({
      planRequestId: "plan_request_001",
      pollToken: "poll-token-001",
    });
    expect(collectionMock).toHaveBeenCalledWith(PLAN_REQUESTS_COLLECTION);
    expect(addMock).toHaveBeenCalledTimes(1);

    const savedDoc = addMock.mock.calls[0]?.[0];
    expect(savedDoc).toMatchObject({
      createdAt: "SERVER_TIMESTAMP",
      updatedAt: "SERVER_TIMESTAMP",
      status: PLAN_REQUEST_STATUS.QUEUED,
      generationStage: PLAN_GENERATION_STAGE.QUEUED,
      progressPercent: 0,
      attemptCount: 0,
      pollToken: "poll-token-001",
      rawInput,
      normalizedRequest,
      generationMeta: {
        source: "web",
        version: 1,
      },
      intent: null,
      result: null,
      error: null,
    });
    expect(Array.isArray(savedDoc.trace)).toBe(true);
  });

  it("returns null when pollToken does not match", async () => {
    const getMock = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        pollToken: "actual-token",
      }),
    });
    const dbMock = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: getMock,
        }),
      }),
    };

    const result = await getPlanRequestByIdAndPollToken({
      db: dbMock,
      planRequestId: "plan_request_001",
      pollToken: "wrong-token",
    });

    expect(result).toBeNull();
  });
});
