import type {
  CompleteJourneyInput,
  CompleteJourneyOutput,
  CreateGuideSessionInput,
  CreateGuideSessionOutput,
  GetAvailableCharactersOutput,
  GetActiveGuideSessionOutput,
  GetCharacterCustomizationOutput,
  GetJourneyMemoryOutput,
  GetUserCompanionStateOutput,
  ListGuideSessionMessagesOutput,
  ListJourneyMemoriesOutput,
  RespondToCompanionInput,
  RespondToCompanionOutput,
  SaveUserFeedbackInput,
  SaveUserFeedbackOutput,
  SuggestGuideRouteInput,
  SuggestGuideRouteOutput,
  TomoshibiAiError,
  UpdateCharacterCustomizationInput,
  UpdateCharacterCustomizationOutput,
} from "@/lib/tomoshibi-ai-types";

const LOCAL_API_BASE = "/api/tomoshibi-ai";

export const TOMOSHIBI_AI_DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_USER_ID?.trim() || "local-demo-user";

export const TOMOSHIBI_AI_DEFAULT_CHARACTER_ID =
  process.env.NEXT_PUBLIC_TOMOSHIBI_AI_DEFAULT_CHARACTER_ID?.trim() || "tomoshibi";

function isBackendError(value: unknown): value is TomoshibiAiError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "error" in value &&
      value.error &&
      typeof value.error === "object" &&
      "message" in value.error,
  );
}

function logLlmUsage(functionName: string, response: Response): void {
  const callCount = Number(response.headers.get("X-Tomoshibi-AI-LLM-Calls") ?? "0");
  if (!Number.isFinite(callCount) || callCount <= 0) return;

  const provider = response.headers.get("X-Tomoshibi-AI-LLM-Provider") ?? "unknown";
  const model = response.headers.get("X-Tomoshibi-AI-LLM-Model") ?? "unknown";
  const operation = response.headers.get("X-Tomoshibi-AI-LLM-Operation") ?? "unknown";
  const inputTokens = Number(response.headers.get("X-Tomoshibi-AI-LLM-Input-Tokens") ?? "0");
  const outputTokens = Number(response.headers.get("X-Tomoshibi-AI-LLM-Output-Tokens") ?? "0");
  const totalTokens = Number(response.headers.get("X-Tomoshibi-AI-LLM-Total-Tokens") ?? "0");
  const estimatedUsd = Number(response.headers.get("X-Tomoshibi-AI-LLM-Estimated-USD") ?? "0");
  const estimatedJpy = Number(response.headers.get("X-Tomoshibi-AI-LLM-Estimated-JPY") ?? "0");
  const usdJpyRate = Number(response.headers.get("X-Tomoshibi-AI-LLM-USD-JPY-Rate") ?? "0");
  console.info("[TOMOSHIBI AI] 外部LLM呼び出しが発生しました", {
    functionName,
    callCount,
    provider,
    model,
    operation,
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedUsd,
    estimatedJpy,
    estimatedJpyLabel: `約${estimatedJpy.toFixed(4)}円`,
    usdJpyRate,
  });
}

async function postTomoshibiAi<TInput, TOutput>(functionName: string, payload: TInput): Promise<TOutput> {
  const response = await fetch(`${LOCAL_API_BASE}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || isBackendError(data)) {
    const message = isBackendError(data) ? data.error.message : `${functionName} failed with ${response.status}`;
    throw new Error(message);
  }

  logLlmUsage(functionName, response);
  return data as TOutput;
}

export function getAvailableCharacters(userId?: string): Promise<GetAvailableCharactersOutput> {
  return postTomoshibiAi("getAvailableCharacters", { userId });
}

export function getUserCompanionState(params: {
  userId: string;
  characterId: string;
}): Promise<GetUserCompanionStateOutput> {
  return postTomoshibiAi("getUserCompanionState", params);
}

export function getActiveGuideSession(params: {
  userId: string;
  characterId: string;
}): Promise<GetActiveGuideSessionOutput> {
  return postTomoshibiAi("getActiveGuideSession", params);
}

export function createGuideSession(payload: CreateGuideSessionInput): Promise<CreateGuideSessionOutput> {
  return postTomoshibiAi("createGuideSession", payload);
}

export function suggestGuideRoute(payload: SuggestGuideRouteInput): Promise<SuggestGuideRouteOutput> {
  return postTomoshibiAi("suggestGuideRoute", payload);
}

export function respondToCompanion(payload: RespondToCompanionInput): Promise<RespondToCompanionOutput> {
  return postTomoshibiAi("respondToCompanion", payload);
}

export function saveUserFeedback(payload: SaveUserFeedbackInput): Promise<SaveUserFeedbackOutput> {
  return postTomoshibiAi("saveUserFeedback", payload);
}

export function completeJourney(payload: CompleteJourneyInput): Promise<CompleteJourneyOutput> {
  return postTomoshibiAi("completeJourney", payload);
}

export function listJourneyMemories(params: {
  userId: string;
  characterId: string;
  limit?: number;
}): Promise<ListJourneyMemoriesOutput> {
  return postTomoshibiAi("listJourneyMemories", params);
}

export function getJourneyMemory(params: {
  userId: string;
  journeyId: string;
  characterId?: string;
}): Promise<GetJourneyMemoryOutput> {
  return postTomoshibiAi("getJourneyMemory", params);
}

export function listGuideSessionMessages(params: {
  userId: string;
  sessionId: string;
  limit?: number;
}): Promise<ListGuideSessionMessagesOutput> {
  return postTomoshibiAi("listGuideSessionMessages", params);
}

export function getCharacterCustomization(params: {
  userId: string;
  characterId: string;
}): Promise<GetCharacterCustomizationOutput> {
  return postTomoshibiAi("getCharacterCustomization", params);
}

export function updateCharacterCustomization(
  payload: UpdateCharacterCustomizationInput,
): Promise<UpdateCharacterCustomizationOutput> {
  return postTomoshibiAi("updateCharacterCustomization", payload);
}
