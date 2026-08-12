/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: "#E50914",
          dark: "#141414",
          gray: "#808080",
          lightgray: "#b3b3b3",
        },
      },
      fontFamily: {
        netflix: ["Netflix Sans", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
