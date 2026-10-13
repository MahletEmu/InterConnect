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
        brand: {
          navy: "#0D2B40",
          navyDark: "#081B28",
          navyLight: "#133C57",
          sky: "#4DB7D8",
          skyHover: "#3AA4C5",
          skyLight: "#8EDFF0",
          tint: "#DDF5FB",
          tintHover: "#CEEFF8",
          canvas: "#F5FBFD",
          surface: "#FFFFFF",
          text: "#132A3A",
          muted: "#6B7C88",
          border: "#E2F1F8",
          accentYellow: "#FFB03A",
          accentGreen: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        "2xs": "0 1px 3px 0 rgba(13, 43, 64, 0.06)",
        soft: "0 10px 30px -5px rgba(13, 43, 64, 0.05)",
        card: "0 14px 40px -10px rgba(13, 43, 64, 0.08)",
        glow: "0 0 25px rgba(77, 183, 216, 0.35)",
        float: "0 20px 40px -15px rgba(13, 43, 64, 0.12)",
        subtle: "0 2px 10px rgba(13, 43, 64, 0.04)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatSlow: "floatSlow 9s ease-in-out infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
