import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#FF6B00",
          light: "#FF8C33",
          dark: "#CC5500",
        },
        vermillion: "#CC2200",
        "deep-red": "#8B1A1A",
        "warm-cream": "#FFF8E7",
        "muted-gold": {
          DEFAULT: "#C9933A",
          light: "#E8BE6A",
          dark: "#9A6E1A",
        },
        terracotta: "#C65D3A",
        charcoal: {
          DEFAULT: "#1A1410",
          mid: "#2D2218",
          light: "#4A3728",
        },
        "deep-green": "#1A3A2A",
        "fog-gray": "#8A7A6A",
        "bg-primary": "#0F0B08",
        "bg-card": "#1C1410",
        "bg-surface": "#231912",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
