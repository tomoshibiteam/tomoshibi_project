import type { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

type JsonObject = Record<string, unknown>;

export function readTomoshibiAiAuthMode(): "local" | "firebase" {
  return process.env.TOMOSHIBI_AI_AUTH_MODE === "firebase" ? "firebase" : "local";
}

function readBearerToken(request: Request): string | null {
  const authorization = request.header("authorization")?.trim();
  if (!authorization) return null;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function normalizeBody(body: unknown): JsonObject {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return body as JsonObject;
}

export async function applyAuthUserId(request: Request, response: Response): Promise<boolean> {
  if (readTomoshibiAiAuthMode() === "local") {
    return true;
  }

  const token = readBearerToken(request);
  if (!token) {
    response.status(401).json({ error: { code: "unauthenticated", message: "Firebase ID token is required." } });
    return false;
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    request.body = { ...normalizeBody(request.body), userId: decoded.uid };
    return true;
  } catch {
    response.status(401).json({ error: { code: "unauthenticated", message: "Firebase ID token verification failed." } });
    return false;
  }
}
