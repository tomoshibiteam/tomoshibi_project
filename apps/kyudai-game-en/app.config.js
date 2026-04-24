const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const base = require("./app.json");
const googleMapsAndroidKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ||
  "";
const googleMapsIosKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ||
  "";

module.exports = {
  expo: {
    ...base.expo,
    android: {
      ...base.expo.android,
      config: {
        ...base.expo.android?.config,
        googleMaps: {
          apiKey: googleMapsAndroidKey,
        },
      },
    },
    ios: {
      ...base.expo.ios,
      config: {
        ...base.expo.ios?.config,
        googleMapsApiKey: googleMapsIosKey,
      },
    },
  },
};
