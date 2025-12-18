/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff8c42',
        secondary: '#8b4513',
        accent: '#8b1538'
      }
    },
  },
  plugins: [],
}