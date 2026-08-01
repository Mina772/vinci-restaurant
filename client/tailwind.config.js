/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#c8a04f",
          light: "#e0c589",
          dark: "#a07c2f",
        },
        ink: {
          DEFAULT: "#0f0f0f",
          soft: "#1a1a1a",
          muted: "#2a2a2a",
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 10px 40px -10px rgba(200,160,79,0.35)",
      },
    },
  },
  plugins: [],
};
