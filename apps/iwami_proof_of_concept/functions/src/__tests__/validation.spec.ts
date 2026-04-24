import { describe, expect, it } from "vitest";
import { PlanRequestValidationError } from "../errors";
import { validatePlanRequestInput } from "../validation";

function buildValidInput() {
  return {
    tripStyle: "day_trip",
    departureType: "iwami_station",
    departureAt: "09:30",
    durationType: "2h",
    returnTransport: "train",
    returnStationId: "iwami_station",
    localTransports: ["walk"],
    desiredSpots: ["浦富海岸"],
    tripPrompt: "海を見たい",
  };
}

function getValidationError(raw: unknown): PlanRequestValidationError {
  try {
    validatePlanRequestInput(raw);
    throw new Error("expected validation to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(PlanRequestValidationError);
    return error as PlanRequestValidationError;
  }
}

describe("validatePlanRequestInput", () => {
  it("returns error when current_location has no coordinates", () => {
    const error = getValidationError({
      ...buildValidInput(),
      departureType: "current_location",
      departureLocation: undefined,
    });

    expect(error.details?.some((item) => item.path === "departureLocation")).toBe(true);
  });

  it("returns error when overnight has no lodgingName", () => {
    const error = getValidationError({
      ...buildValidInput(),
      tripStyle: "overnight",
      lodgingName: "   ",
    });

    expect(error.details?.some((item) => item.path === "lodgingName")).toBe(true);
  });

  it("returns error when durationType is custom and customDurationMinutes is missing", () => {
    const error = getValidationError({
      ...buildValidInput(),
      durationType: "custom",
      customDurationMinutes: undefined,
    });

    expect(error.details?.some((item) => item.path === "customDurationMinutes")).toBe(true);
  });

  it("returns error when localTransports is empty", () => {
    const error = getValidationError({
      ...buildValidInput(),
      localTransports: [],
    });

    expect(error.details?.some((item) => item.path === "localTransports")).toBe(true);
  });

  it("returns error when returnTransport is train and returnStationId is missing", () => {
    const error = getValidationError({
      ...buildValidInput(),
      returnTransport: "train",
      returnStationId: null,
    });

    expect(error.details?.some((item) => item.path === "returnStationId")).toBe(true);
  });

  it("accepts car return without returnStationId", () => {
    expect(() =>
      validatePlanRequestInput({
        ...buildValidInput(),
        returnTransport: "car",
        returnStationId: null,
      }),
    ).not.toThrow();
  });

  it("accepts oiwa_station as train return station", () => {
    expect(() =>
      validatePlanRequestInput({
        ...buildValidInput(),
        returnTransport: "train",
        returnStationId: "oiwa_station",
      }),
    ).not.toThrow();
  });
});
