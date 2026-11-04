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
        revive: {
          bg: "#F5F2E9",
          surface: "#FFFDF8",
          dark: "#202522",
          charcoal: "#202522",
          accent: "#FFD45C",
          "accent-hover": "#F4C64C",
          text: "#202421",
          muted: "#777B76",
          border: "#E6E1D7",
          success: "#16A36A",
          warning: "#D9A441",
          error: "#D75C5C",
        },
        brand: {
          navy: "#0C2340",
          blue: "#0B72E7",
          "blue-hover": "#0959B6",
          "blue-subtle": "#EFF6FF",
        },
        fintech: {
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
