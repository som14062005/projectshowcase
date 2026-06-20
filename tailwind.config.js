/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cli: {
          bg: '#000000',
          green: '#00ff00',
          'green-bright': '#33ff33',
          'green-dim': '#00aa00',
        }
      },
      fontFamily: {
        mono: ['"Ubuntu Mono"', '"Courier New"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-in forwards',
      },
    },
  },
  plugins: [],
}
