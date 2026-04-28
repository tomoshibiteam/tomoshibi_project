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
export declare function runWithLlmUsageTracking<T>(callback: () => Promise<T>): Promise<{
    result: T;
    calls: LlmUsageContext["calls"];
}>;
export declare function recordLlmCall(input: {
    provider: string;
    model: string;
    operation: string;
}): void;
export declare function completeLatestLlmCall(input: {
    provider: string;
    model: string;
    operation: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}): void;
export {};
