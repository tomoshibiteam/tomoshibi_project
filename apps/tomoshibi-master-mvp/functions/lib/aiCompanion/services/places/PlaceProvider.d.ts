import type { NormalizedPlace, PlaceDetailsContext, PlaceSearchContext } from "../../types/place";
export interface PlaceProvider {
    searchNearby(context: PlaceSearchContext): Promise<NormalizedPlace[]>;
    getDetails(context: PlaceDetailsContext): Promise<NormalizedPlace | null>;
}
