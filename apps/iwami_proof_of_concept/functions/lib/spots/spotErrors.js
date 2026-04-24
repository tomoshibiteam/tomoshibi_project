"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotNotFoundError = exports.SpotValidationError = void 0;
exports.zodIssuesToSpotValidationIssues = zodIssuesToSpotValidationIssues;
class SpotValidationError extends Error {
    code = "SPOT_VALIDATION_ERROR";
    status = 400;
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
    }
}
exports.SpotValidationError = SpotValidationError;
class SpotNotFoundError extends Error {
    code = "SPOT_NOT_FOUND";
    status = 404;
    constructor(spotId) {
        super(`Spot not found: ${spotId}`);
    }
}
exports.SpotNotFoundError = SpotNotFoundError;
function zodIssuesToSpotValidationIssues(issues) {
    return issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "root",
        message: issue.message,
    }));
}
//# sourceMappingURL=spotErrors.js.map