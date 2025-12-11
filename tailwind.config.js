/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Cores do Ecossistema 300
        'ecosystem': {
          red: '#DC2626',
          'red-dark': '#B91C1C',
          'red-light': '#EF4444',
          black: '#000000',
          'gray-dark': '#1F2937',
          'gray-darker': '#111827',
        },
      },
    },
  },
  plugins: [],
}

