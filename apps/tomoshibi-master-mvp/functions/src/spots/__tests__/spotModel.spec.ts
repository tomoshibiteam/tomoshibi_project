import { describe, expect, it } from "vitest";
import { SpotValidationError } from "../spotErrors";
import { buildSearchText, normalizeSpotData, validateSpotInput } from "../spotModel";
import { buildValidSpotInput } from "./spotTestData";

function expectValidationError(fn: () => void): SpotValidationError {
  try {
    fn();
    throw new Error("expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SpotValidationError);
    return error as SpotValidationError;
  }
}

describe("spotModel validation", () => {
  it("fails when required fields are missing", () => {
    const raw = buildValidSpotInput({
      nameJa: "",
    });

    const error = expectValidationError(() => validateSpotInput(raw));
    expect(error.details.some((item) => item.path === "nameJa")).toBe(true);
  });

  it("fails when primaryCategory is invalid", () => {
    const raw = {
      ...buildValidSpotInput(),
      primaryCategory: "lodging",
    };

    const error = expectValidationError(() => validateSpotInput(raw));
    expect(error.details.some((item) => item.path === "primaryCategory")).toBe(true);
  });

  it("fails when supportedTransports includes unsupported value", () => {
    const raw = {
      ...buildValidSpotInput(),
      access: {
        ...buildValidSpotInput().access,
        supportedTransports: ["walk", "rocket"],
      },
    };

    const error = expectValidationError(() => validateSpotInput(raw));
    expect(error.details.some((item) => item.path === "access.supportedTransports.1")).toBe(true);
  });

  it("keeps first-stop metadata for rental_cycle pickup spots", () => {
    const validated = validateSpotInput(
      buildValidSpotInput({
        slug: "iwami-tourism-association",
        access: {
          supportedTransports: ["walk", "rental_cycle"],
          parkingAvailable: false,
          bikeParkingAvailable: true,
          busStopNearby: true,
          requiresFirstStop: true,
          requiredFirstStopReason: "rental_cycle_pickup",
        },
      }),
    );

    const normalized = normalizeSpotData(validated);

    expect(normalized.access.requiresFirstStop).toBe(true);
    expect(normalized.access.requiredFirstStopReason).toBe("rental_cycle_pickup");
    expect(normalized.business.operationalJudgement).toBeDefined();
  });

  it("buildSearchText concatenates name, tags and descriptions", () => {
    const searchText = buildSearchText({
      nameJa: "浦富海岸",
      nameEn: "Uradome Coast",
      shortName: "浦富",
      descriptionShort: "海景観スポット",
      descriptionLong: "写真映えと海鮮が魅力",
      tags: ["海景観", "写真映え"],
      secondaryCategories: ["scenery", "beach"],
      areaName: "浦富",
      addressJa: "鳥取県岩美郡岩美町浦富",
    });

    expect(searchText).toContain("浦富海岸");
    expect(searchText).toContain("海景観");
    expect(searchText).toContain("写真映えと海鮮が魅力");
  });
});
