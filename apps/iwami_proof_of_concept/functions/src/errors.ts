import type { PlanRequestErrorCode, ValidationIssueDetail } from "./types";

export class PlanRequestError extends Error {
  public readonly code: PlanRequestErrorCode;
  public readonly status: number;
  public readonly details?: ValidationIssueDetail[];

  constructor(params: {
    code: PlanRequestErrorCode;
    status: number;
    message: string;
    details?: ValidationIssueDetail[];
  }) {
    super(params.message);
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

export class PlanRequestValidationError extends PlanRequestError {
  constructor(message: string, details: ValidationIssueDetail[]) {
    super({
      code: "VALIDATION_ERROR",
      status: 400,
      message,
      details,
    });
  }
}
