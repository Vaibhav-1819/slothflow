/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sloth: {
          50: '#fbf8f3',
          100: '#f4ede2',
          200: '#e8dac3',
          300: '#d7c09e',
          400: '#c5a378',
          500: '#a78255',
          600: '#8c6843',
          700: '#704f35',
          800: '#5c402c',
          900: '#4d3626',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#ccd9cd',
          300: '#a8c0aa',
          400: '#7fa383',
          500: '#608665',
          600: '#4a6b4e',
          700: '#3c553f',
          800: '#324535',
          900: '#2b392e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
