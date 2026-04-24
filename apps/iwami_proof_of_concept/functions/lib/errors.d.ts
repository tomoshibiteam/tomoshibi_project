import type { PlanRequestErrorCode, ValidationIssueDetail } from "./types";
export declare class PlanRequestError extends Error {
    readonly code: PlanRequestErrorCode;
    readonly status: number;
    readonly details?: ValidationIssueDetail[];
    constructor(params: {
        code: PlanRequestErrorCode;
        status: number;
        message: string;
        details?: ValidationIssueDetail[];
    });
}
export declare class PlanRequestValidationError extends PlanRequestError {
    constructor(message: string, details: ValidationIssueDetail[]);
}
