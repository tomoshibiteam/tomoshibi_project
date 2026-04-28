import { readEnv } from "../../utils/env";
import type { PlaceProvider } from "./PlaceProvider";
import { GooglePlacesProvider } from "./GooglePlacesProvider";
import { MockPlaceProvider } from "./MockPlaceProvider";

export function createPlaceProvider(): PlaceProvider {
  return readEnv("PLACE_PROVIDER") === "google_places" ? new GooglePlacesProvider() : new MockPlaceProvider();
}
