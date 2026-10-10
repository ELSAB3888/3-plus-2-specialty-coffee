/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          cream: {
            50: '#FEFDFB',
            100: '#FDF9F0',
            200: '#FAF0DC',
            300: '#F5E6C8',
            400: '#EDD8AB',
            500: '#E8D5A3',
            DEFAULT: '#F5F0E8',
          },
          olive: {
            50: '#F4F5F0',
            100: '#E5E8DA',
            200: '#CCD1B7',
            300: '#A8B18A',
            400: '#8A9668',
            500: '#6B7A4A',
            600: '#556339',
            700: '#3E4A29',
            800: '#2D361E',
            900: '#1E2414',
            DEFAULT: '#4A5D3A',
          },
          espresso: {
            DEFAULT: '#3C2A1E',
            light: '#5C4033',
          },
          gold: {
            DEFAULT: '#C5A572',
            light: '#D4BC91',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Noto Serif Arabic', 'serif'],
        arabic: ['Noto Sans Arabic', 'Noto Serif Arabic', 'sans-serif'],
      },
      borderRadius: {
        brand: '0.75rem',
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(74, 93, 58, 0.08)',
        'brand-md': '0 4px 12px rgba(74, 93, 58, 0.12)',
        'brand-lg': '0 8px 24px rgba(74, 93, 58, 0.16)',
        'brand-glow': '0 0 20px rgba(74, 93, 58, 0.15)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
