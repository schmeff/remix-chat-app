/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {},
  },
  plugins: [plugin(function ({ addUtilities }) {
    addUtilities({
      '.no-scrollbar::-webkit-scrollbar': {
        'display': 'none'
      },
      '.no-scrollbar': {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none'
      },
    })
  })],
}
