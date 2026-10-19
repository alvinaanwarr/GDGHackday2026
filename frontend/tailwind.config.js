/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grill: {
          pitch: '#050505',
          void: '#0a0a0c',
          charcoal: '#141416',
          slateDark: '#1a1a1e',
          crimson: '#e63946',
          ember: '#dc2626',
          blood: '#991b1b',
          emberDark: '#581010',
          umber: '#2c1810',
          leather: '#3b1d11',
          smoke: '#452218',
          ashBorder: '#362118',
          ash: '#a1a1aa',
          muted: '#71717a',
          crisp: '#f4f4f5',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.82', transform: 'scale(1.05)' },
        },
        glowPulse: {
          '0%, 100%': { borderColor: 'rgba(220, 38, 38, 0.4)', boxShadow: '0 0 15px rgba(220, 38, 38, 0.15)' },
          '50%': { borderColor: 'rgba(230, 57, 70, 0.8)', boxShadow: '0 0 25px rgba(230, 57, 70, 0.35)' },
        },
      },
      animation: {
        flicker: 'flicker 2s infinite ease-in-out',
        glow: 'glowPulse 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};