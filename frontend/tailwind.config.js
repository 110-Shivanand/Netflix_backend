/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
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
