/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8F7F6",
        primary: "#EE8C2B",
        "primary-hover": "#D97B1E",
        foreground: "#221910",
        muted: "#6C5647",
        border: "#E7D9C7",
      },
      fontFamily: {
        "serif-jp": ["NotoSerifJP_400Regular", "serif"],
        "serif-jp-bold": ["NotoSerifJP_700Bold", "serif"],
        "serif-jp-semibold": ["NotoSerifJP_600SemiBold", "serif"],
        "sans-jp": ["NotoSansJP_400Regular", "sans-serif"],
        "sans-jp-medium": ["NotoSansJP_500Medium", "sans-serif"],
        "sans-jp-bold": ["NotoSansJP_700Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
