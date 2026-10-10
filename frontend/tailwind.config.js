/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        'navy-deep': '#0F1E36',
        'navy-card': '#162847',
        'navy-sidebar': '#0B172B',
        'blue-slate': '#3B5A85',
        'blue-dusty': '#94A8C7',
        'blue-pale': '#E2ECF8',
        'peach-soft': '#FF8A65',
        'brand': {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        }
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 30, 54, 0.06), 0 2px 6px -1px rgba(15, 30, 54, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(15, 30, 54, 0.12), 0 4px 12px -2px rgba(15, 30, 54, 0.06)',
        'glow-blue': '0 0 20px -3px rgba(99, 102, 241, 0.35)',
        'glow-teal': '0 0 20px -3px rgba(20, 184, 166, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
