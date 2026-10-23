/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: '#09090b',
        card: '#18181b',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-2%, 2%)' },
          '50%': { transform: 'translate(2%, -1%)' },
          '75%': { transform: 'translate(1%, 2%)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        marqueeReverse: 'marqueeReverse 38s linear infinite',
        caret: 'caret 1s step-end infinite',
        grain: 'grain 8s steps(10) infinite',
      },
    },
  },
  plugins: [],
}
