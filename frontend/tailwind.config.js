/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'primary': '#715FFD',
        'primary-dark': '#5B4CD9',
        'primary-light': '#B7B0FF',
        'lavender': {
          50: '#F9F7FF',
          100: '#F3EFFF',
          200: '#E7E0FF',
          300: '#D1C7FF',
          400: '#B7B0FF',
          500: '#968BFF',
          600: '#715FFD',
        },
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(to bottom, #B7B0FF, #A198FF)',
      }
    },
  },
  plugins: [],
}