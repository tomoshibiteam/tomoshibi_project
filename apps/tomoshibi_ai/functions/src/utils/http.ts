import type { Request, Response } from "express";

export type HttpHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export async function handleJsonRequest<TInput, TOutput>(
  request: Request,
  response: Response,
  handler: HttpHandler<TInput, TOutput>,
): Promise<void> {
  if (request.method !== "POST") {
    response.status(405).json({ error: { code: "method_not_allowed", message: "Use POST." } });
    return;
  }

  try {
    const result = await handler(request.body as TInput);
    response.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(500).json({ error: { code: "internal", message } });
  }
}
