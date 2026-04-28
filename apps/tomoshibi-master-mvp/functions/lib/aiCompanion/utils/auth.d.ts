import type { Request, Response } from "express";
export declare function readTomoshibiAiAuthMode(): "local" | "firebase";
export declare function applyAuthUserId(request: Request, response: Response): Promise<boolean>;
