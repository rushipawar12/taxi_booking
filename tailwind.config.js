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
          50: '#f0f2ff',
          100: '#e1e5ff',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4f5bc7',
        },
        secondary: {
          500: '#764ba2',
          600: '#6a4190',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

