/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        sweetshop: {
          "primary": "#7c3aed",
          "secondary": "#ec4899",
          "accent": "#22c55e",
          "neutral": "#3D4451",
          "base-100": "#FFFFFF",
          "info": "#60a5fa",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light",
      "dark",
    ],
  },
}
