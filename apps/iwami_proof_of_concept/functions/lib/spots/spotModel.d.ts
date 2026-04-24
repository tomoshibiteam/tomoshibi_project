import type { SpotListFilters, SpotRecord, SpotSearchFilters, SpotWriteInput } from "./spotTypes";
export declare function buildSearchText(input: {
    nameJa: string;
    nameEn: string | null;
    shortName: string;
    descriptionShort: string;
    descriptionLong: string;
    tags: string[];
    secondaryCategories: string[];
    areaName: string | null;
    addressJa: string;
}): string;
export declare function validateSpotInput(rawInput: unknown): SpotWriteInput;
export declare function normalizeSpotData(input: SpotWriteInput): Omit<SpotRecord, "createdAt" | "updatedAt">;
export declare function validateSpotListFilters(rawFilters: unknown): SpotListFilters;
export declare function validateSpotSearchFilters(rawFilters: unknown): SpotSearchFilters;
