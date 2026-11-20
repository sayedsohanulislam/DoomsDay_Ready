/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        curzon: {
          950: '#060608',
          900: '#121214',
          850: '#1c1917',
          800: '#292524',
          700: '#44403c',
          600: '#57534e',
          500: '#78716c',
          300: '#d6d3d1',
          200: '#e7e5e4',
          100: '#f5f5f4',
          50: '#fafaf9',
          cream: '#fdfcf9',
          sand: '#f5f5f0',
          muted: '#78716c',
          gold: '#cba158',
          goldDark: '#967026',
          amber: '#d4af37',
          red: '#e23636',
          burgundy: '#8b1e1e',
        },
        marvel: {
          red: '#E23636',
          crimson: '#c01d1d',
          darkRed: '#7A0A0A',
          gold: '#cba158',
          amber: '#d4af37',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'curzon-glow': '0 0 25px -4px rgba(203, 161, 88, 0.35)',
        'curzon-card': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'curzon-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 20px -5px rgba(203, 161, 88, 0.25)',
        'glow-red': '0 0 25px -5px rgba(226, 54, 54, 0.25)',
        'glow-gold': '0 0 25px -5px rgba(203, 161, 88, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
      },
      letterSpacing: {
        'widest-xl': '0.25em',
        'curzon': '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
