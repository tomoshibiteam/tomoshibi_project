import type { Request, Response } from "express";
export type HttpHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
export declare function handleJsonRequest<TInput, TOutput>(request: Request, response: Response, handler: HttpHandler<TInput, TOutput>, options?: {
    requireAuth?: boolean;
}): Promise<void>;
