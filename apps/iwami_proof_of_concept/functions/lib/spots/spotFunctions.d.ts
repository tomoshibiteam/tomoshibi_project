export declare const createSpotCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    spot: import("./spotTypes").SpotRecord;
}>, unknown>;
export declare const updateSpotCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    spot: import("./spotTypes").SpotRecord;
}>, unknown>;
export declare const getSpotByIdCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    spot: import("./spotTypes").SpotRecord;
}>, unknown>;
export declare const deleteSpotCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    id: string;
}>, unknown>;
export declare const uploadSpotImageCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    objectPath: string;
    downloadUrl: string;
}>, unknown>;
export declare const listSpotsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    count: number;
    spots: import("./spotTypes").SpotRecord[];
}>, unknown>;
export declare const listSpotsByCategoryCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    count: number;
    spots: import("./spotTypes").SpotRecord[];
}>, unknown>;
export declare const searchSpotsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    ok: boolean;
    count: number;
    spots: import("./spotTypes").SpotRecord[];
}>, unknown>;
