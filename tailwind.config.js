/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#4f46e5',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#6366f1",
          "secondary": "#4f46e5",
          "base-100": "#1a1b1e",
          "base-200": "#141517",
          "base-300": "#2c2d31",
          "base-content": "#ffffff",
        },
      },
    ],
  },
};