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
        ink: "#3B3226",
        muted: "#7A6E5D",
        cream: "#FBF4E4",
        peach: "#FDE2E2",
        mint: "#E3F1D9",
        lavender: "#ECE4F7",
        butter: "#FDF0C6",
        skyblue: "#E8F4FB",
        blush: "#F9A8A8",
        coral: "#F7C948",
        coralDark: "#E4572E",
        leaf: "#4E8A2E",
        berry: "#C8372D",
        ocean: "#2F7DB0",
        card: "#FFFDF7",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        pop: "3px 4px 0 0 #3B3226",
        "pop-sm": "2px 2px 0 0 #3B3226",
        "pop-lg": "5px 7px 0 0 #3B3226",
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
