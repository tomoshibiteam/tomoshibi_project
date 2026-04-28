import { NextRequest, NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

const ALLOWED_FUNCTIONS = new Set([
  "createGuideSession",
  "suggestGuideRoute",
  "respondToCompanion",
  "saveUserFeedback",
  "getActiveGuideSession",
  "getUserCompanionState",
  "getAvailableCharacters",
  "getCharacterCustomization",
  "updateCharacterCustomization",
  "completeJourney",
  "listJourneyMemories",
  "getJourneyMemory",
  "listGuideSessionMessages",
  "trackOutboundClick",
]);

function readBaseUrl(): string | null {
  const explicit =
    process.env.TOMOSHIBI_AI_FUNCTIONS_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_TOMOSHIBI_AI_FUNCTIONS_BASE_URL?.trim();

  if (explicit) return explicit.replace(/\/$/, "");

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "tomoshibi-950e2";
  const host = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST?.trim() || "127.0.0.1";
  const port = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT?.trim() || "5001";
  return `http://${host}:${port}/${projectId}/asia-northeast1`;
}

function readAuthMode(): "local" | "firebase" {
  const mode = process.env.TOMOSHIBI_AI_AUTH_MODE?.trim() || process.env.NEXT_PUBLIC_TOMOSHIBI_AI_AUTH_MODE?.trim();
  return mode === "firebase" ? "firebase" : "local";
}

function readBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) return null;

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function parseJsonBody(body: string): JsonObject {
  if (!body.trim()) return {};

  const parsed: unknown = JSON.parse(body);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }
  return parsed as JsonObject;
}

async function verifyFirebaseIdToken(idToken: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is required when TOMOSHIBI_AI_AUTH_MODE=firebase.");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error("Firebase ID token verification failed.");
  }

  const users = data && typeof data === "object" && "users" in data ? data.users : null;
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("Firebase ID token does not contain a user.");
  }

  const localId = users[0] && typeof users[0] === "object" && "localId" in users[0] ? users[0].localId : null;
  if (typeof localId !== "string" || !localId) {
    throw new Error("Firebase ID token does not contain a UID.");
  }
  return localId;
}

async function buildUpstreamBody(request: NextRequest, body: string): Promise<string | NextResponse> {
  if (readAuthMode() === "local") {
    return body || "{}";
  }

  const token = readBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "Firebase ID token is required." } },
      { status: 401 },
    );
  }

  try {
    const uid = await verifyFirebaseIdToken(token);
    return JSON.stringify({ ...parseJsonBody(body), userId: uid });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: error instanceof Error ? error.message : "Authentication failed." } },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ functionName: string }> },
) {
  const { functionName } = await context.params;
  if (!ALLOWED_FUNCTIONS.has(functionName)) {
    return NextResponse.json({ error: { code: "not_found", message: "Unknown TOMOSHIBI AI function." } }, { status: 404 });
  }

  const baseUrl = readBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: { code: "not_configured", message: "TOMOSHIBI AI functions base URL is not configured." } },
      { status: 500 },
    );
  }

  const body = await request.text();
  const upstreamBody = await buildUpstreamBody(request, body);
  if (upstreamBody instanceof NextResponse) {
    return upstreamBody;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: upstreamBody,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message !== "fetch failed"
        ? error.message
        : "TOMOSHIBI AIバックエンドに接続できません。Functions Emulatorが起動しているか確認してください。";
    return NextResponse.json({ error: { code: "backend_unreachable", message } }, { status: 502 });
  }

  const text = await upstream.text();
  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") || "application/json",
  });
  [
    "X-Tomoshibi-AI-LLM-Calls",
    "X-Tomoshibi-AI-LLM-Provider",
    "X-Tomoshibi-AI-LLM-Model",
    "X-Tomoshibi-AI-LLM-Operation",
    "X-Tomoshibi-AI-LLM-Input-Tokens",
    "X-Tomoshibi-AI-LLM-Output-Tokens",
    "X-Tomoshibi-AI-LLM-Total-Tokens",
    "X-Tomoshibi-AI-LLM-Estimated-USD",
    "X-Tomoshibi-AI-LLM-Estimated-JPY",
    "X-Tomoshibi-AI-LLM-USD-JPY-Rate",
  ].forEach((headerName) => {
    const value = upstream.headers.get(headerName);
    if (value) responseHeaders.set(headerName, value);
  });

  return new NextResponse(text || "{}", {
    status: upstream.status,
    headers: responseHeaders,
  });
}
