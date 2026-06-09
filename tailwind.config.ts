import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — cobalt → navy gradient stops
        cobalt: "#1A3FD4",
        navy: "#0D1B6E",
        // Surfaces
        cream: "#FAF8F5",
        "light-bg": "#F5F5F0",
        "dark-ink": "#1C1C1E",
        // Signal
        up: "#4CAF82",
        down: "#E05555",
        // CSS-var bridged tokens (set in globals.css)
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        muted: "var(--muted)",
      },
      fontFamily: {
        display: ["var(--font-garamond)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "20px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,27,110,0.04), 0 8px 24px rgba(13,27,110,0.06)",
        lift: "0 12px 32px rgba(13,27,110,0.12)",
        glow: "0 8px 40px rgba(26,63,212,0.25)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #1A3FD4 0%, #0D1B6E 100%)",
      },
      keyframes: {
        "draw-in": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
