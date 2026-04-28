import type { NormalizedPlace, PlaceDetailsContext, PlaceSearchContext } from "../../types/place";
import type { PlaceProvider } from "./PlaceProvider";
export declare class GooglePlacesProvider implements PlaceProvider {
    private readonly apiKey;
    constructor(apiKey?: string | undefined);
    searchNearby(context: PlaceSearchContext): Promise<NormalizedPlace[]>;
    getDetails(context: PlaceDetailsContext): Promise<NormalizedPlace | null>;
}
