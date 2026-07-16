/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B21B6',
          light: '#7C3AED',
          dark: '#4C1D95',
        },
        accent: {
          DEFAULT: '#FBBF24',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
