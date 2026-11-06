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
        flip: {
          "0%": { boxShadow: "0 0 0 0 rgba(251,113,133,0.5)" },
          "100%": { boxShadow: "0 0 0 14px rgba(251,113,133,0)" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 1.8s ease-in-out infinite",
        scan: "scan 2.4s linear infinite",
        flip: "flip 1.1s ease-out 1",
      },
    },
  },
  plugins: [],
};
