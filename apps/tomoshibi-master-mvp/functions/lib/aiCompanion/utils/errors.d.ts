export declare class AppError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
