import type { SpotOperationalJudgement, SpotWeeklyHours } from "./spotTypes";
type DeriveBusinessOperationalDataInput = {
    isAlwaysOpen: boolean;
    openingHoursText: string | null;
    regularHolidaysText: string | null;
    lastEntryTime: string | null;
    weeklyHours?: SpotWeeklyHours;
    operationalJudgement?: SpotOperationalJudgement;
};
type DeriveBusinessOperationalDataResult = {
    weeklyHours?: SpotWeeklyHours;
    lastEntryTime: string | null;
    operationalJudgement: SpotOperationalJudgement;
};
export declare function deriveBusinessOperationalData(input: DeriveBusinessOperationalDataInput): DeriveBusinessOperationalDataResult;
export {};
