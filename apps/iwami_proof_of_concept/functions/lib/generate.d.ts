import type { Firestore } from "firebase-admin/firestore";
type GeneratePlansParams = {
    db?: Firestore;
    planRequestId: string;
};
export declare function generatePlans(params: GeneratePlansParams): Promise<void>;
export declare function runPlanGenerationWithFailureHandling(params: GeneratePlansParams): Promise<void>;
export {};
