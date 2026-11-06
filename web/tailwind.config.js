/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        panel: "var(--panel)",
        raised: "var(--raised)",
        line: "var(--line)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          dim: "var(--accent-dim)",
          wash: "var(--accent-wash)",
        },
        danger: "var(--danger)",
        warn: "var(--warn)",
        ok: "var(--ok)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        glow: "0 0 0 1px var(--accent), 0 0 20px var(--accent-wash)",
      },
      keyframes: {
        "pulse-line": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        flip: {
          "0%": { boxShadow: "0 0 0 0 rgba(251,113,133,0.6)", borderColor: "rgba(251,113,133,0.9)" },
          "50%": { boxShadow: "0 0 24px 4px rgba(251,113,133,0.35)" },
          "100%": { boxShadow: "0 0 0 14px rgba(251,113,133,0)" },
        },
        "card-enter": {
          "0%": { opacity: "0", transform: "translateY(-10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "sweep-horizontal": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        "neon-ping": {
          "0%": { transform: "scale(1)", opacity: "0.9" },
          "75%, 100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "strong-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1.3) drop-shadow(0 0 8px rgba(94, 234, 212, 0.9))" },
          "50%": { opacity: "0.45", filter: "brightness(0.9) drop-shadow(0 0 2px rgba(94, 234, 212, 0.3))" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 1.8s ease-in-out infinite",
        scan: "scan 2.4s linear infinite",
        scanline: "scanline 3.5s linear infinite",
        flip: "flip 1.4s ease-out 1",
        "card-enter": "card-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "radar-sweep": "radar-sweep 2.4s linear infinite",
        "radar-sweep-reverse": "radar-sweep 4.5s linear infinite reverse",
        "sweep-horizontal": "sweep-horizontal 2.8s ease-in-out infinite",
        "neon-ping": "neon-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "strong-pulse": "strong-pulse 1.2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
