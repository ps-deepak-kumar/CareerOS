/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#090a0f", // Deep slate executive background
          card: "rgba(18, 20, 30, 0.65)", // Clean glassy slate card
          cardHover: "rgba(25, 28, 41, 0.8)", // Clean slate hover
          border: "rgba(255, 255, 255, 0.04)", // Crisp sub-pixel border
          borderHover: "rgba(255, 255, 255, 0.09)",
          navy: "#090a0e",
          indigo: "#4f46e5", // Corporate Royal Indigo
          blue: "#3b82f6", // Calm Professional Blue
          emerald: "#10b981", // Success Emerald
          slate: "#64748b" // Neutral slate metadata
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        insetBorder: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }
    },
  },
  plugins: [],
}
