import type { GtfsImportOptions, MappedTransitData, ParsedGtfsData } from "./types";
export declare function mapGtfsToTransit(params: {
    parsed: ParsedGtfsData;
    options: GtfsImportOptions;
}): MappedTransitData;
