import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2B2140",
        muted: "#6B5E7B",
        cream: "#FFF8F0",
        peach: "#FFB4A2",
        mint: "#B8E6C9",
        lavender: "#CDB4FF",
        butter: "#FFE08A",
        skyblue: "#A8D8FF",
        blush: "#FFC8DD",
        coral: "#FF8C69",
        coralDark: "#E8613C",
        leaf: "#2F9E6B",
        berry: "#E5484D",
        ocean: "#3B82C4",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        pop: "4px 4px 0 0 #2B2140",
        "pop-sm": "2px 2px 0 0 #2B2140",
        "pop-lg": "8px 8px 0 0 #2B2140",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
