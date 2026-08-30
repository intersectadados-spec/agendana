import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDF6F3",
        blush: "#FFC2D1",
        "blush-dark": "#E39FB2",
        wine: "#5B2A3D",
        "wine-soft": "#7A4258",
        ink: "#3D2733",
        muted: "#8C7078",
        line: "#F0DDE2",
        sage: "#8AA98B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
