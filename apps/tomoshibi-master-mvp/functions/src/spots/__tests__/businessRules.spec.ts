import { describe, expect, it } from "vitest";
import { deriveBusinessOperationalData } from "../businessRules";

describe("deriveBusinessOperationalData", () => {
  it("parses closed weekday, seasonal closure and L.O. time", () => {
    const result = deriveBusinessOperationalData({
      isAlwaysOpen: false,
      openingHoursText: "11:00-15:00 (L.O.14:00)",
      regularHolidaysText: "Tue closed; Mon/Wed-Sun 11:00-15:00 / 冬季休業あり（2025/12/16-2026/2/28）",
      lastEntryTime: null,
      weeklyHours: undefined,
    });

    expect(result.operationalJudgement.regularClosedDays).toContain("tue");
    expect(result.operationalJudgement.flags.hasSeasonalClosureRule).toBe(true);
    expect(result.operationalJudgement.lastAdmission.type).toBe("fixed_time");
    expect(result.operationalJudgement.lastAdmission.time).toBe("14:00");
    expect(result.weeklyHours?.mon?.[0]).toEqual({ open: "11:00", close: "15:00" });
    expect(result.weeklyHours?.wed?.[0]).toEqual({ open: "11:00", close: "15:00" });
  });

  it("preserves explicit lastEntryTime", () => {
    const result = deriveBusinessOperationalData({
      isAlwaysOpen: false,
      openingHoursText: "9:00-17:00",
      regularHolidaysText: "水曜定休",
      lastEntryTime: "16:30",
      weeklyHours: undefined,
    });

    expect(result.lastEntryTime).toBe("16:30");
    expect(result.operationalJudgement.lastAdmission.type).toBe("fixed_time");
    expect(result.operationalJudgement.lastAdmission.time).toBe("16:30");
  });

  it("marks irregular holiday entries for manual review", () => {
    const result = deriveBusinessOperationalData({
      isAlwaysOpen: false,
      openingHoursText: "チェックイン 15:00～ / チェックアウト ～10:00",
      regularHolidaysText: "不定休。来訪前に要確認。",
      lastEntryTime: null,
      weeklyHours: undefined,
    });

    expect(result.operationalJudgement.hasIrregularClosures).toBe(true);
    expect(result.operationalJudgement.needsManualReview).toBe(true);
  });
});

