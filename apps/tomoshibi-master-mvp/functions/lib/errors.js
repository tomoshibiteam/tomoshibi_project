"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRequestValidationError = exports.PlanRequestError = void 0;
class PlanRequestError extends Error {
    code;
    status;
    details;
    constructor(params) {
        super(params.message);
        this.code = params.code;
        this.status = params.status;
        this.details = params.details;
    }
}
exports.PlanRequestError = PlanRequestError;
class PlanRequestValidationError extends PlanRequestError {
    constructor(message, details) {
        super({
            code: "VALIDATION_ERROR",
            status: 400,
            message,
            details,
        });
    }
}
exports.PlanRequestValidationError = PlanRequestValidationError;
//# sourceMappingURL=errors.js.map