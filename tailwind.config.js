/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wheat: {
          50: '#FAF7F2',
          100: '#F5EFEB',
          200: '#EBE2D5',
          300: '#DED2C0',
          400: '#CFBEA4',
          500: '#BFA886',
          600: '#A48B64',
          700: '#856D48',
          800: '#665233',
          900: '#473720',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#3F3F46',
          700: '#27272A',
          800: '#18181B',
          900: '#0F0F11',
          950: '#08080A',
        },
        brand: {
          bg: "#F5EFEB", // Warm Luxury Wheat Background
          card: "#FFFFFF", // Crisp White Surface
          cardHover: "#FAF7F2", // Warm Wheat Hover
          border: "#E2D9CC", // Warm Wheat Border
          borderHover: "#CFBEA4",
          black: "#121110", // Luxury Deep Black
          charcoal: "#18181B",
          indigo: "#4F46E5",
          amber: "#D97706",
          emerald: "#059669",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 4px 20px rgba(18, 17, 16, 0.06)",
        card: "0 2px 12px rgba(18, 17, 16, 0.04), 0 1px 3px rgba(18, 17, 16, 0.06)",
        cardHover: "0 10px 30px rgba(18, 17, 16, 0.1), 0 2px 6px rgba(18, 17, 16, 0.06)",
      }
    },
  },
  plugins: [],
}
