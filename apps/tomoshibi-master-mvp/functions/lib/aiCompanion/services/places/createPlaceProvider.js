"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaceProvider = createPlaceProvider;
const env_1 = require("../../utils/env");
const GooglePlacesProvider_1 = require("./GooglePlacesProvider");
const MockPlaceProvider_1 = require("./MockPlaceProvider");
function createPlaceProvider() {
    return (0, env_1.readEnv)("PLACE_PROVIDER") === "google_places" ? new GooglePlacesProvider_1.GooglePlacesProvider() : new MockPlaceProvider_1.MockPlaceProvider();
}
//# sourceMappingURL=createPlaceProvider.js.map