import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080808",
        panel: "#101010",
        card: "#151515",
        line: "#252525",
        brand: "#E50914",
        "brand-dark": "#B20710",
        muted: "#777777",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
