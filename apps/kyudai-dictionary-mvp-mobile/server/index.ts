import fs from "node:fs";
import path from "node:path";
import http, { type IncomingHttpHeaders, type IncomingMessage, type ServerResponse } from "node:http";
import dotenv from "dotenv";

import { OPTIONS, POST } from "./quest-generate";

const API_PATH = "/api/kyudai-mvp/quest/generate";
const PROGRESS_PATH = "/api/kyudai-mvp/quest/progress";
const LOG_PREFIX = "[kyudai-mvp:api-server]";
const DEFAULT_PORT = 3001;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-request-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type QuestProgressEvent = {
  requestId: string;
  type: string;
  timestamp: string;
  stepId?: string;
  stepLabel?: string;
  stepOrdinal?: number;
  totalSteps?: number;
  status?: string;
  durationMs?: number | null;
  message: string;
  program?: string;
  inputVars?: Record<string, unknown>;
  outputVars?: Record<string, unknown>;
  aiPrompt?: {
    provider?: string;
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    userPrompt?: string;
  };
};

const progressSubscribers = new Map<string, Set<ServerResponse>>();
const progressHeartbeatTimers = new WeakMap<ServerResponse, ReturnType<typeof setInterval>>();
const progressHistoryByRequestId = new Map<string, QuestProgressEvent[]>();
const progressHistoryCleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PROGRESS_HISTORY_MAX_EVENTS = 256;
const PROGRESS_HISTORY_TTL_MS = 5 * 60 * 1000;

const writeSseData = (res: ServerResponse, payload: unknown) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const removeProgressSubscriber = (requestId: string, res: ServerResponse) => {
  const subscribers = progressSubscribers.get(requestId);
  if (!subscribers) return;
  subscribers.delete(res);
  if (subscribers.size === 0) {
    progressSubscribers.delete(requestId);
  }
  const heartbeat = progressHeartbeatTimers.get(res);
  if (heartbeat) {
    clearInterval(heartbeat);
    progressHeartbeatTimers.delete(res);
  }
};

const addProgressSubscriber = (requestId: string, req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, {
    ...CORS_HEADERS,
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("\n");

  const subscribers = progressSubscribers.get(requestId) ?? new Set<ServerResponse>();
  subscribers.add(res);
  progressSubscribers.set(requestId, subscribers);

  writeSseData(res, {
    requestId,
    type: "stream-ready",
    timestamp: new Date().toISOString(),
    message: "quest progress stream connected",
  });

  const history = progressHistoryByRequestId.get(requestId);
  if (history && history.length > 0) {
    for (const event of history) {
      writeSseData(res, event);
    }
  }

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 15_000);
  progressHeartbeatTimers.set(res, heartbeat);
  if (typeof heartbeat.unref === "function") {
    heartbeat.unref();
  }

  const cleanup = () => {
    removeProgressSubscriber(requestId, res);
  };
  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
};

const appendProgressHistory = (event: QuestProgressEvent) => {
  const history = progressHistoryByRequestId.get(event.requestId) ?? [];
  history.push(event);
  if (history.length > PROGRESS_HISTORY_MAX_EVENTS) {
    history.splice(0, history.length - PROGRESS_HISTORY_MAX_EVENTS);
  }
  progressHistoryByRequestId.set(event.requestId, history);

  const existingTimer = progressHistoryCleanupTimers.get(event.requestId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    progressHistoryCleanupTimers.delete(event.requestId);
  }

  if (event.type === "request-finished" || event.type === "request-error") {
    const cleanupTimer = setTimeout(() => {
      progressHistoryByRequestId.delete(event.requestId);
      progressHistoryCleanupTimers.delete(event.requestId);
    }, PROGRESS_HISTORY_TTL_MS);
    if (typeof cleanupTimer.unref === "function") {
      cleanupTimer.unref();
    }
    progressHistoryCleanupTimers.set(event.requestId, cleanupTimer);
  }
};

const publishProgressEvent = (event: QuestProgressEvent) => {
  appendProgressHistory(event);
  const subscribers = progressSubscribers.get(event.requestId);
  if (!subscribers || subscribers.size === 0) return;

  for (const res of Array.from(subscribers)) {
    try {
      writeSseData(res, event);
    } catch {
      removeProgressSubscriber(event.requestId, res);
    }
  }
};

function loadEnvFiles(): string[] {
  const appRoot = process.cwd();
  const envCandidates = [
    path.join(appRoot, ".env.local"),
    path.join(appRoot, ".env"),
    path.resolve(appRoot, "../admin-console/.env.local"),
    path.resolve(appRoot, "../admin-console/.env"),
  ];

  const loaded: string[] = [];
  for (const filePath of envCandidates) {
    if (!fs.existsSync(filePath)) continue;
    dotenv.config({ path: filePath, override: false });
    loaded.push(filePath);
  }
  return loaded;
}

function toHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }
    if (typeof value === "string") {
      headers.set(key, value);
    }
  }
  return headers;
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function writeResponse(nodeRes: ServerResponse, response: Response): Promise<void> {
  nodeRes.statusCode = response.status;
  response.headers.forEach((value, key) => {
    nodeRes.setHeader(key, value);
  });

  if (response.status === 204 || response.status === 304) {
    nodeRes.end();
    return;
  }

  const bodyBuffer = Buffer.from(await response.arrayBuffer());
  nodeRes.end(bodyBuffer);
}

function getUrl(req: IncomingMessage, fallbackPort: number): URL {
  const host = req.headers.host ?? `localhost:${fallbackPort}`;
  const reqUrl = req.url ?? "/";
  return new URL(reqUrl, `http://${host}`);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, port: number): Promise<void> {
  const startedAt = Date.now();
  const url = getUrl(req, port);
  const method = (req.method ?? "GET").toUpperCase();

  console.info(
    `${LOG_PREFIX} request.received ${JSON.stringify({
      method,
      path: url.pathname,
      origin: req.headers.origin ?? "",
      userAgent: req.headers["user-agent"] ?? "",
    })}`,
  );

  try {
    if (url.pathname === PROGRESS_PATH) {
      if (method === "OPTIONS") {
        await writeResponse(
          res,
          new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
          }),
        );
        return;
      }

      if (method !== "GET") {
        await writeResponse(
          res,
          Response.json(
            { ok: false, error: "Method Not Allowed" },
            {
              status: 405,
              headers: {
                ...CORS_HEADERS,
                Allow: "GET, OPTIONS",
                "Content-Type": "application/json",
              },
            },
          ),
        );
        return;
      }

      const requestId = url.searchParams.get("requestId")?.trim();
      if (!requestId) {
        await writeResponse(
          res,
          Response.json(
            { ok: false, error: "requestId is required" },
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            },
          ),
        );
        return;
      }

      addProgressSubscriber(requestId, req, res);
      return;
    }

    if (url.pathname !== API_PATH) {
      await writeResponse(
        res,
        Response.json(
          { ok: false, error: "Not Found" },
          { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
        ),
      );
      return;
    }

    if (method === "OPTIONS") {
      const response = await OPTIONS();
      await writeResponse(res, response);
      return;
    }

    if (method !== "POST") {
      await writeResponse(
        res,
        Response.json(
          { ok: false, error: "Method Not Allowed" },
          {
            status: 405,
            headers: {
              ...CORS_HEADERS,
              Allow: "POST, OPTIONS",
              "Content-Type": "application/json",
            },
          },
        ),
      );
      return;
    }

    const body = await readBody(req);
    const request = new Request(url.toString(), {
      method,
      headers: toHeaders(req.headers),
      body: body.length > 0 ? new Uint8Array(body) : undefined,
    });

    const response = await POST(request);
    await writeResponse(res, response);
  } catch (error) {
    console.error(
      `${LOG_PREFIX} request.error ${JSON.stringify({
        method,
        path: url.pathname,
        error: error instanceof Error ? error.message : "unknown",
        stack: error instanceof Error ? error.stack : undefined,
      })}`,
    );
    await writeResponse(
      res,
      Response.json(
        { ok: false, error: "Kyudai API server error" },
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      ),
    );
  } finally {
    console.info(
      `${LOG_PREFIX} request.finished ${JSON.stringify({
        method,
        path: url.pathname,
        durationMs: Date.now() - startedAt,
      })}`,
    );
  }
}

async function main(): Promise<void> {
  const loadedEnvFiles = loadEnvFiles();
  const port = Number.parseInt(process.env.KYUDAI_QUEST_API_PORT ?? "", 10) || DEFAULT_PORT;
  globalThis.__KYUDAI_QUEST_PROGRESS_EMITTER__ = publishProgressEvent;

  const server = http.createServer((req, res) => {
    void handleRequest(req, res, port);
  });

  server.listen(port, () => {
    console.info(
      `${LOG_PREFIX} server.started ${JSON.stringify({
        port,
        endpoint: `http://localhost:${port}${API_PATH}`,
        progressEndpoint: `http://localhost:${port}${PROGRESS_PATH}`,
        loadedEnvFiles,
      })}`,
    );
  });
}

void main();
