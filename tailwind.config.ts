import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body:    ["'DM Sans'",    "sans-serif"],
      },
      colors: {
        ink: {
          50:  "#fafafa", 100: "#f5f5f5", 200: "#e8e8e8",
          300: "#d4d4d4", 400: "#aaa",    500: "#888",
          600: "#666",    700: "#444",    800: "#222",    900: "#0a0a0a",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
