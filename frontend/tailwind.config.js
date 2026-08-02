/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hp-offwhite': '#F9F9F9',
        'hp-charcoal': '#1A1A1A',
        'hp-orange': '#FF7000',
        'hp-orange-dark': '#E66500',
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
