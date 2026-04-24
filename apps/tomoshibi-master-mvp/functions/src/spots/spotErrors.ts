import type { ZodIssue } from "zod";

export type SpotValidationIssue = {
  path: string;
  message: string;
};

export class SpotValidationError extends Error {
  public readonly code = "SPOT_VALIDATION_ERROR";
  public readonly status = 400;
  public readonly details: SpotValidationIssue[];

  constructor(message: string, details: SpotValidationIssue[]) {
    super(message);
    this.details = details;
  }
}

export class SpotNotFoundError extends Error {
  public readonly code = "SPOT_NOT_FOUND";
  public readonly status = 404;

  constructor(spotId: string) {
    super(`Spot not found: ${spotId}`);
  }
}

export function zodIssuesToSpotValidationIssues(issues: ZodIssue[]): SpotValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}
