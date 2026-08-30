/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60% — Ink (dominant background)
        ink: {
          DEFAULT: "#0F1115",
          soft: "#171A21",
          border: "#262A34",
        },
        // 30% — Porcelain (cards / light surfaces)
        porcelain: {
          DEFAULT: "#EEF0F3",
          dim: "#DADEE5",
        },
        // 10% — Aurora accent (violet -> cyan) + gold highlight
        aurora: {
          violet: "#6D5EF5",
          cyan: "#00C2D1",
          gold: "#F5B942",
        },
        muted: "#9AA0AC",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "aurora-gradient": "linear-gradient(135deg, #6D5EF5 0%, #00C2D1 100%)",
        "aurora-gradient-soft": "linear-gradient(135deg, rgba(109,94,245,0.15) 0%, rgba(0,194,209,0.15) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(109,94,245,0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
