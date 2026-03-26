/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#09AB49',
          50: '#E8F9EF',
          100: '#C5F0D5',
          500: '#09AB49',
          600: '#078A3B',
          700: '#066A2E',
        },
        gray: {
          bg: '#F6F8FA',
          outline: '#EDEFF2',
        },
        dark: '#1A1A2E',
        sub: '#6B7280',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
