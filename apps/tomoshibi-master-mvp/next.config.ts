import type { NextConfig } from "next";

const DEV_WATCH_IGNORES = [
  "**/.firebase/**",
  "**/firebase-export-*/**",
  "**/functions/lib/**",
  "**/functions/node_modules/**",
  "**/out/**",
  "**/.next/**",
  "**/firebase-debug.log",
  "**/firestore-debug.log",
];

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) return config;
    config.watchOptions = {
      ...config.watchOptions,
      ignored: DEV_WATCH_IGNORES,
    };

    return config;
  },
};

export default nextConfig;
