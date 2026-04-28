import { AsyncLocalStorage } from "node:async_hooks";

type LlmUsageContext = {
  calls: {
    provider: string;
    model: string;
    operation: string;
    at: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    estimatedUsd?: number;
    estimatedJpy?: number;
    usdJpyRate?: number;
  }[];
};

const llmUsageStorage = new AsyncLocalStorage<LlmUsageContext>();

const GEMINI_PRICE_PER_1M_TOKENS: Record<string, { inputUsd: number; outputUsd: number }> = {
  "gemini-2.5-flash-lite": { inputUsd: 0.1, outputUsd: 0.4 },
  "gemini-2.5-flash": { inputUsd: 0.3, outputUsd: 2.5 },
};

export async function runWithLlmUsageTracking<T>(callback: () => Promise<T>): Promise<{
  result: T;
  calls: LlmUsageContext["calls"];
}> {
  const context: LlmUsageContext = { calls: [] };
  const result = await llmUsageStorage.run(context, callback);
  return { result, calls: context.calls };
}

export function recordLlmCall(input: { provider: string; model: string; operation: string }): void {
  const context = llmUsageStorage.getStore();
  if (!context) return;
  context.calls.push({
    provider: input.provider,
    model: input.model,
    operation: input.operation,
    at: new Date().toISOString(),
  });
}

export function completeLatestLlmCall(input: {
  provider: string;
  model: string;
  operation: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}): void {
  const context = llmUsageStorage.getStore();
  if (!context) return;

  const call = [...context.calls]
    .reverse()
    .find(
      (candidate) =>
        candidate.provider === input.provider &&
        candidate.model === input.model &&
        candidate.operation === input.operation &&
        candidate.inputTokens === undefined &&
        candidate.outputTokens === undefined,
    );
  if (!call) return;

  call.inputTokens = input.inputTokens;
  call.outputTokens = input.outputTokens;
  call.totalTokens = input.totalTokens;

  const price = GEMINI_PRICE_PER_1M_TOKENS[input.model];
  const usdJpyRate = readUsdJpyRate();
  if (price && typeof input.inputTokens === "number" && typeof input.outputTokens === "number") {
    const estimatedUsd = (input.inputTokens / 1_000_000) * price.inputUsd + (input.outputTokens / 1_000_000) * price.outputUsd;
    call.estimatedUsd = estimatedUsd;
    call.estimatedJpy = estimatedUsd * usdJpyRate;
    call.usdJpyRate = usdJpyRate;
  }
}

function readUsdJpyRate(): number {
  const value = Number(process.env.TOMOSHIBI_AI_USD_JPY_RATE ?? "159.5");
  return Number.isFinite(value) && value > 0 ? value : 159.5;
}
