import type { NormalizedPlace, PlaceDetailsContext, PlaceSearchContext } from "../../types/place";
import type { PlaceProvider } from "./PlaceProvider";
export declare class MockPlaceProvider implements PlaceProvider {
    searchNearby(context: PlaceSearchContext): Promise<NormalizedPlace[]>;
    getDetails(context: PlaceDetailsContext): Promise<NormalizedPlace | null>;
}
