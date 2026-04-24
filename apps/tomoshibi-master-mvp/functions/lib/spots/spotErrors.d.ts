import type { ZodIssue } from "zod";
export type SpotValidationIssue = {
    path: string;
    message: string;
};
export declare class SpotValidationError extends Error {
    readonly code = "SPOT_VALIDATION_ERROR";
    readonly status = 400;
    readonly details: SpotValidationIssue[];
    constructor(message: string, details: SpotValidationIssue[]);
}
export declare class SpotNotFoundError extends Error {
    readonly code = "SPOT_NOT_FOUND";
    readonly status = 404;
    constructor(spotId: string);
}
export declare function zodIssuesToSpotValidationIssues(issues: ZodIssue[]): SpotValidationIssue[];
